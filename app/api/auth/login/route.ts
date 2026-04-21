// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { UserModel, Religion, Caste, SubCaste, SubscriptionModel } from '@/models';
import { signToken } from '@/utils/auth';
import { sanitizeUser } from '@/utils/helpers';
import type { AuthLoginRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body: AuthLoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({
      where: { email, is_active: true },
      include: [
        { model: Religion, as: 'religion' },
        { model: Caste, as: 'caste' },
        { model: SubCaste, as: 'subcaste' },
        { model: SubscriptionModel, as: 'subscription' },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = signToken({ userId: user.id, email: user.email });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
