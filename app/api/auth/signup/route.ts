// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { UserModel, SubscriptionModel } from '@/models';
import { signToken } from '@/utils/auth';
import { sanitizeUser, PLAN_LIMITS, getPlanExpiryDate } from '@/utils/helpers';
import type { AuthSignupRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body: AuthSignupRequest = await request.json();

    const { name, email, password, phone, age, gender, religion_id, caste_id, subcaste_id, location } = body;

    // Validate required fields
    if (!name || !email || !password || !age || !gender || !religion_id || !caste_id || !location) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Check if email exists
    const existing = await UserModel.findOne({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      age,
      gender,
      religion_id,
      caste_id,
      subcaste_id,
      location,
    });

    // Create free subscription
    await SubscriptionModel.create({
      user_id: user.id,
      plan_type: 'free',
      contact_limit: PLAN_LIMITS['free'],
      contacts_used: 0,
      expiry_date: getPlanExpiryDate(365),
    });

    const token = signToken({ userId: user.id, email: user.email });

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        token,
        user: sanitizeUser(user),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
