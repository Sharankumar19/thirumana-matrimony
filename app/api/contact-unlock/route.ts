// app/api/contact-unlock/route.ts — Unlock contact phone number
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserModel, SubscriptionModel, ContactViewModel } from '@/models';
import { authenticateRequest } from '@/utils/auth';

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
      return NextResponse.json({ success: false, error: 'Cannot unlock your own contact' }, { status: 400 });
    }

    // Check if already viewed
    const existingView = await ContactViewModel.findOne({
      where: { viewer_id: payload.userId, viewed_user_id: target_user_id },
    });

    if (existingView) {
      // Already unlocked — just return the phone
      const targetUser = await UserModel.findByPk(target_user_id, {
        attributes: ['id', 'name', 'phone'],
      });
      return NextResponse.json({
        success: true,
        phone: targetUser?.phone || 'Not available',
        message: 'Contact already unlocked',
        contacts_remaining: null,
      });
    }

    // Check subscription
    const subscription = await SubscriptionModel.findOne({
      where: { user_id: payload.userId },
    });

    if (!subscription) {
      return NextResponse.json({ success: false, error: 'No subscription found' }, { status: 404 });
    }

    if (subscription.plan_type === 'free' || subscription.contacts_used >= subscription.contact_limit) {
      return NextResponse.json({
        success: false,
        error: 'upgrade_required',
        message: 'Upgrade your plan to view contact details',
      }, { status: 403 });
    }

    // Check expiry
    if (new Date(subscription.expiry_date) < new Date()) {
      return NextResponse.json({
        success: false,
        error: 'subscription_expired',
        message: 'Your subscription has expired. Please renew.',
      }, { status: 403 });
    }

    // Unlock contact
    const targetUser = await UserModel.findByPk(target_user_id, {
      attributes: ['id', 'name', 'phone'],
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Record the view
    await ContactViewModel.create({
      viewer_id: payload.userId,
      viewed_user_id: target_user_id,
    });

    // Increment contacts_used
    await subscription.update({ contacts_used: subscription.contacts_used + 1 });

    const contacts_remaining = subscription.contact_limit - (subscription.contacts_used + 1);

    return NextResponse.json({
      success: true,
      phone: targetUser.phone || 'Not available',
      message: 'Contact unlocked successfully',
      contacts_remaining,
    });
  } catch (error) {
    console.error('Contact unlock error:', error);
    return NextResponse.json({ success: false, error: 'Failed to unlock contact' }, { status: 500 });
  }
}
