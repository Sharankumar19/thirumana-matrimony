// app/api/subscriptions/route.ts — Get and upgrade subscription
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { SubscriptionModel } from '@/models';
import { authenticateRequest } from '@/utils/auth';
import { PLAN_LIMITS, getPlanExpiryDate } from '@/utils/helpers';
import type { PlanType } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);

    const subscription = await SubscriptionModel.findOne({
      where: { user_id: payload.userId },
    });

    if (!subscription) {
      return NextResponse.json({ success: false, error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: subscription });
  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);
    const body = await request.json();
    const { plan_type } = body as { plan_type: PlanType };

    const validPlans: PlanType[] = ['free', 'premium', 'standard', 'pro', 'elite'];
    if (!validPlans.includes(plan_type)) {
      return NextResponse.json({ success: false, error: 'Invalid plan type' }, { status: 400 });
    }

    const contact_limit = PLAN_LIMITS[plan_type];
    const expiry_date = getPlanExpiryDate(plan_type === 'free' ? 36500 : 30); // free = 100 years, paid = 30 days

    const [subscription, created] = await SubscriptionModel.findOrCreate({
      where: { user_id: payload.userId },
      defaults: {
        user_id: payload.userId,
        plan_type,
        contact_limit,
        contacts_used: 0,
        expiry_date,
      },
    });

    if (!created) {
      // Reset usage on plan upgrade
      await subscription.update({
        plan_type,
        contact_limit,
        contacts_used: 0,
        expiry_date,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Upgraded to ${plan_type} plan successfully`,
      data: subscription,
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ success: false, error: 'Subscription failed' }, { status: 500 });
  }
}
