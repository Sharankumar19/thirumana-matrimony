// app/api/subscriptions/payment-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/utils/auth';
import { connectDB } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);
    const userId = payload.userId;

    const amount = 299900; // ₹199 in paise
    const currency = 'INR';

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Check if real keys are configured
    if (keyId && keySecret && !keyId.startsWith('your_') && !keySecret.startsWith('your_')) {
      try {
        console.log('Creating real Razorpay order for user:', userId);
        const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const res = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify({
            amount,
            currency,
            receipt: `receipt_user_${userId}_${Date.now()}`,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          console.error('Razorpay API error:', data);
          return NextResponse.json({ success: false, error: 'Failed to create order with Razorpay' }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          order_id: data.id,
          amount: data.amount,
          currency: data.currency,
          key_id: keyId,
          is_mock: false,
        });
      } catch (err) {
        console.error('Failed to communicate with Razorpay API:', err);
        return NextResponse.json({ success: false, error: 'Razorpay integration error' }, { status: 500 });
      }
    } else {
      // Mock Sandbox Mode
      console.log('Configuring Mock Razorpay order (Sandbox Mode) for user:', userId);
      const mockOrderId = `order_mock_${uuidv4().replace(/-/g, '').substring(0, 14)}`;
      return NextResponse.json({
        success: true,
        order_id: mockOrderId,
        amount,
        currency,
        key_id: 'rzp_test_mock_keys_not_set',
        is_mock: true,
      });
    }
  } catch (error: any) {
    console.error('Create payment order error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Unauthorized' }, { status: 401 });
  }
}
