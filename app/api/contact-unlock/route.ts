// app/api/contact-unlock/route.ts — Return full or masked contact based on subscription
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserModel, SubscriptionModel } from '@/models';
import { authenticateRequest } from '@/utils/auth';
import { isPremiumPlan, maskEmail, maskPhone } from '@/utils/helpers';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);
    const body = await request.json();
    const { target_user_id } = body as { target_user_id: number };

    if (!target_user_id) {
      return NextResponse.json({ success: false, error: 'target_user_id is required' }, { status: 400 });
    }

    if (target_user_id === payload.userId) {
      return NextResponse.json({ success: false, error: 'Cannot view your own contact' }, { status: 400 });
    }

    // Fetch requester's subscription
    const subscription = await SubscriptionModel.findOne({
      where: { user_id: payload.userId },
    });

    const planType = subscription?.plan_type || 'free';
    const hasPremium = isPremiumPlan(planType);

    // Fetch the target user's contact details
    const targetUser = await UserModel.findByPk(target_user_id, {
      attributes: ['id', 'name', 'phone', 'email'],
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (hasPremium) {
      // Premium users see full contact info
      return NextResponse.json({
        success: true,
        is_premium: true,
        phone: targetUser.phone || 'Not available',
        email: targetUser.email,
        message: 'Contact details unlocked',
      });
    }

    // Free users cannot unlock contact info
    return NextResponse.json({
      success: false,
      error: 'Upgrade to Premium to view contact details',
      message: 'upgrade_required',
    }, { status: 403 });
  } catch (error) {
    console.error('Contact unlock error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch contact' }, { status: 500 });
  }
}
