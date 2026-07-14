// app/api/subscriptions/verify-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/utils/auth';
import { connectDB } from '@/lib/db';
import { SubscriptionModel, PaymentModel } from '@/models';
import { PLAN_LIMITS, getPlanExpiryDate } from '@/utils/helpers';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);
    const userId = payload.userId;

    const body = await request.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body as {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    };

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Missing payment signature details' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const hasRealKeys = !!(keyId && keySecret && !keyId.startsWith('your_') && !keySecret.startsWith('your_'));
    const isMockOrder = razorpay_order_id.startsWith('order_mock_');

    let isVerified = false;

    if (hasRealKeys) {
      if (isMockOrder) {
        console.error('Security alert: Mock order ID submitted while real keys are configured.');
        return NextResponse.json({ success: false, error: 'Invalid order verification attempt' }, { status: 400 });
      }

      // Verify Razorpay signature: HMAC-SHA256(order_id + "|" + payment_id, secret)
      const dataToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generatedSignature = crypto
        .createHmac('sha256', keySecret!)
        .update(dataToSign)
        .digest('hex');

      isVerified = generatedSignature === razorpay_signature;

      if (!isVerified) {
        console.error('Razorpay signature verification failed.');
        return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 });
      }
    } else {
      // Mock Verification for Sandbox Testing
      if (isMockOrder) {
        console.log('Verifying mock payment order:', razorpay_order_id);
        isVerified = true;
      } else {
        console.error('Attempted real payment verification without configured Razorpay keys.');
        return NextResponse.json({ success: false, error: 'Payment gateway configuration missing' }, { status: 500 });
      }
    }

    if (isVerified) {
      // 1. Log the payment details in the database
      const amount = 199.00; // Premium price
      const paymentDate = new Date();

      await PaymentModel.create({
        user_id: userId,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount,
        payment_date: paymentDate,
        status: 'success',
      });

      // 2. Find or create user subscription
      const plan_type = 'premium';
      const contact_limit = PLAN_LIMITS[plan_type];
      const expiry_date = getPlanExpiryDate(30); // Premium valid for 30 days

      const [subscription, created] = await SubscriptionModel.findOrCreate({
        where: { user_id: userId },
        defaults: {
          user_id: userId,
          plan_type,
          contact_limit,
          contacts_used: 0,
          expiry_date,
          payment_date: paymentDate,
          transaction_id: razorpay_payment_id,
        },
      });

      if (!created) {
        await subscription.update({
          plan_type,
          contact_limit,
          contacts_used: 0, // reset contact views on upgrade
          expiry_date,
          payment_date: paymentDate,
          transaction_id: razorpay_payment_id,
        });
      }

      console.log(`🎉 Subscription upgraded to premium for user ${userId}. Transaction: ${razorpay_payment_id}`);

      return NextResponse.json({
        success: true,
        message: '🎉 Congratulations! Your Premium Membership has been activated successfully.',
        data: subscription,
      });
    }

    return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 400 });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Verification failed' }, { status: 500 });
  }
}
