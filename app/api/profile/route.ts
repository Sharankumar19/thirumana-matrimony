// app/api/profile/route.ts — GET and PUT user profile
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserModel, Religion, Caste, SubCaste, SubscriptionModel } from '@/models';
import { authenticateRequest } from '@/utils/auth';
import { sanitizeUser } from '@/utils/helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);

    const user = await UserModel.findByPk(payload.userId, {
      include: [
        { model: Religion, as: 'religion' },
        { model: Caste, as: 'caste' },
        { model: SubCaste, as: 'subcaste' },
        { model: SubscriptionModel, as: 'subscription' },
      ],
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);
    const body = await request.json();

    const allowedFields = [
      'name', 'phone', 'age', 'location', 'job', 'salary', 'bio', 'religion_id', 'caste_id', 'subcaste_id',
      'gender',
      // Basic info
      'date_of_birth', 'marital_status', 'mother_tongue', 'community', 'height', 'weight', 'blood_group', 
      'diet_preference', 'smoking_habit', 'drinking_habit', 'physical_status', 'current_city', 'state', 'country',
      // Family details
      'father_name', 'father_occupation', 'mother_name', 'mother_occupation', 'brothers_count', 'brothers_status', 
      'sisters_count', 'sisters_status', 'family_type', 'family_values', 'family_financial_status', 'family_native_place',
      // Education & Career
      'highest_qualification', 'college_university', 'field_of_study', 'company_name', 'job_designation', 
      'employment_type', 'annual_income', 'work_location', 'years_of_experience',
      // Hobbies
      'hobbies',
      // Partner Preferences
      'partner_age_min', 'partner_age_max', 'partner_height_min', 'partner_height_max', 'partner_marital_status', 
      'partner_religion', 'partner_caste', 'partner_education', 'partner_occupation', 'partner_income', 
      'partner_location', 'partner_diet', 'partner_smoking', 'partner_drinking',
      // Privacy Settings
      'privacy_settings'
    ];
    const updateData: Record<string, unknown> = {};

    const intFields = [
      'age', 'religion_id', 'caste_id', 'subcaste_id', 
      'brothers_count', 'sisters_count', 'years_of_experience', 
      'partner_age_min', 'partner_age_max'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (intFields.includes(field)) {
          const val = parseInt(body[field]);
          updateData[field] = isNaN(val) ? null : val;
        } else {
          updateData[field] = body[field] === '' ? null : body[field];
        }
      }
    }

    await UserModel.update(updateData, { where: { id: payload.userId } });

    const updated = await UserModel.findByPk(payload.userId, {
      include: [
        { model: Religion, as: 'religion' },
        { model: Caste, as: 'caste' },
        { model: SubCaste, as: 'subcaste' },
        { model: SubscriptionModel, as: 'subscription' },
      ],
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: sanitizeUser(updated!),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}
