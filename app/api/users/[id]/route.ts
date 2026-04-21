// app/api/users/[id]/route.ts — Fetch single user by ID
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserModel, Religion, Caste, SubCaste, SubscriptionModel } from '@/models';

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

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
