// app/api/users/[id]/route.ts — Fetch single user by ID with masking and privacy checks
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserModel, Religion, Caste, SubCaste, SubscriptionModel, InterestModel } from '@/models';
import { authenticateRequest } from '@/utils/auth';
import { maskEmail, maskPhone } from '@/utils/helpers';
import { Op } from 'sequelize';

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
    let viewerId: number | null = null;

    try {
      const payload = authenticateRequest(request);
      viewerId = payload.userId;
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

    // Check interest records and chat lock status
    let chatUnlocked = false;
    let interestSentByViewer = false;
    let interestReceivedByViewer = false;
    let viewerInterestStatus: 'pending' | 'accepted' | 'rejected' | null = null;
    let receivedInterestStatus: 'pending' | 'accepted' | 'rejected' | null = null;

    if (viewerId && !isOwnProfile) {
      const sentInterest = await InterestModel.findOne({
        where: { sender_id: viewerId, receiver_id: userId },
      });
      const receivedInterest = await InterestModel.findOne({
        where: { sender_id: userId, receiver_id: viewerId },
      });

      if (sentInterest) {
        interestSentByViewer = true;
        viewerInterestStatus = sentInterest.status;
      }

      if (receivedInterest) {
        interestReceivedByViewer = true;
        receivedInterestStatus = receivedInterest.status;
      }

      // Chat is unlocked if:
      // 1. Any of the interest requests is explicitly 'accepted'
      // 2. Both directions have active (non-rejected) interest requests
      const hasAccepted = (sentInterest?.status === 'accepted') || (receivedInterest?.status === 'accepted');
      const hasMutualActive = (sentInterest && sentInterest.status !== 'rejected') && 
                              (receivedInterest && receivedInterest.status !== 'rejected');

      if (hasAccepted || hasMutualActive) {
        chatUnlocked = true;
      }
    } else if (isOwnProfile) {
      chatUnlocked = true;
    }

    userData.chat_unlocked = chatUnlocked;
    userData.interest_sent_by_viewer = interestSentByViewer;
    userData.interest_received_by_viewer = interestReceivedByViewer;
    userData.viewer_interest_status = viewerInterestStatus;
    userData.received_interest_status = receivedInterestStatus;

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
