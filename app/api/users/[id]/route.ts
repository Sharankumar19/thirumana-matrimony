// app/api/users/[id]/route.ts — Fetch single user by ID with masking and privacy checks
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserModel, Religion, Caste, SubCaste, SubscriptionModel } from '@/models';
import { authenticateRequest } from '@/utils/auth';
import { maskEmail, maskPhone } from '@/utils/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const userId = parseInt(params.id);

    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const user = await UserModel.findByPk(userId, {
      include: [
        { model: Religion, as: 'religion' },
        { model: Caste, as: 'caste' },
        { model: SubCaste, as: 'subcaste' },
        { model: SubscriptionModel, as: 'subscription' },
      ],
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Determine viewer access status
    let viewerIsPremium = false;
    let isOwnProfile = false;

    try {
      const payload = authenticateRequest(request);
      const viewerId = payload.userId;
      if (viewerId === userId) {
        isOwnProfile = true;
      } else {
        // Fetch viewer's subscription
        const viewerSub = await SubscriptionModel.findOne({
          where: { user_id: viewerId },
        });
        if (viewerSub && ['premium', 'standard', 'pro', 'elite'].includes(viewerSub.plan_type)) {
          viewerIsPremium = true;
        }
      }
    } catch {
      // Unauthenticated request, treated as Free/unprivileged
    }

    const userData = user.toJSON() as any;

    // 1. Enforce Masking for Contact Info
    if (!isOwnProfile && !viewerIsPremium) {
      userData.email = 'Locked (Upgrade to Premium)';
      userData.phone = 'Locked (Upgrade to Premium)';
    }

    // 2. Enforce User Privacy Toggles
    let privacy = { showFamily: true, showEducation: true, showHobbies: true, showPreferences: true };
    if (userData.privacy_settings) {
      try {
        privacy = { ...privacy, ...JSON.parse(userData.privacy_settings) };
      } catch (e) {
        // ignore
      }
    }

    if (!isOwnProfile) {
      if (!privacy.showFamily) {
        const familyFields = [
          'father_name', 'father_occupation', 'mother_name', 'mother_occupation',
          'brothers_count', 'brothers_status', 'sisters_count', 'sisters_status',
          'family_type', 'family_values', 'family_financial_status', 'family_native_place'
        ];
        familyFields.forEach(f => delete userData[f]);
        userData.hide_family_details = true;
      }
      if (!privacy.showEducation) {
        const eduFields = [
          'highest_qualification', 'college_university', 'field_of_study',
          'company_name', 'job_designation', 'employment_type', 'annual_income',
          'work_location', 'years_of_experience'
        ];
        eduFields.forEach(f => delete userData[f]);
        userData.hide_education_details = true;
      }
      if (!privacy.showHobbies) {
        delete userData.hobbies;
        userData.hide_hobbies = true;
      }
      if (!privacy.showPreferences) {
        const prefFields = [
          'partner_age_min', 'partner_age_max', 'partner_height_min', 'partner_height_max',
          'partner_marital_status', 'partner_religion', 'partner_caste', 'partner_education',
          'partner_occupation', 'partner_income', 'partner_location', 'partner_diet',
          'partner_smoking', 'partner_drinking'
        ];
        prefFields.forEach(f => delete userData[f]);
        userData.hide_partner_preferences = true;
      }
    }

    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
