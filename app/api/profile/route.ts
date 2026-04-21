// app/api/profile/route.ts — GET and PUT user profile
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserModel, Religion, Caste, SubCaste, SubscriptionModel } from '@/models';
import { authenticateRequest } from '@/utils/auth';
import { sanitizeUser } from '@/utils/helpers';

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

    const allowedFields = ['name', 'phone', 'age', 'location', 'job', 'salary', 'bio', 'religion_id', 'caste_id', 'subcaste_id'];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
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
