// app/api/profile-views/route.ts — Who viewed me + record views
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ProfileViewModel, UserModel } from '@/models';
import { authenticateRequest } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);

    const views = await ProfileViewModel.findAll({
      where: { viewed_user_id: payload.userId },
      include: [
        {
          model: UserModel,
          as: 'viewer',
          attributes: ['id', 'name', 'age', 'location', 'profile_image', 'job'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: 50,
    });

    return NextResponse.json({ success: true, data: views });
  } catch (error) {
    console.error('Get profile views error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch viewers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);
    const body = await request.json();
    const { viewed_user_id } = body as { viewed_user_id: number };

    if (!viewed_user_id || viewed_user_id === payload.userId) return NextResponse.json({ success: true });

    // Only record once per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingView = await ProfileViewModel.findOne({
      where: {
        viewer_id: payload.userId,
        viewed_user_id,
      },
    });

    if (!existingView) {
      await ProfileViewModel.create({
        viewer_id: payload.userId,
        viewed_user_id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Record profile view error:', error);
    return NextResponse.json({ success: false, error: 'Failed to record view' }, { status: 500 });
  }
}
