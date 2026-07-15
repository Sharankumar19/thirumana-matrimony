// app/api/interests/route.ts — Send/get interests
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { InterestModel, UserModel } from '@/models';
import { authenticateRequest } from '@/utils/auth';
import { createInterestNotification, createInterestAcceptedNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'received'; // 'sent' | 'received'

    const where =
      type === 'sent'
        ? { sender_id: payload.userId }
        : { receiver_id: payload.userId };

    const interests = await InterestModel.findAll({
      where,
      include: [
        {
          model: UserModel,
          as: type === 'sent' ? 'receiver' : 'sender',
          attributes: ['id', 'name', 'age', 'location', 'profile_image', 'job'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return NextResponse.json({ success: true, data: interests });
  } catch (error) {
    console.error('Get interests error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch interests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);
    const body = await request.json();
    const { receiver_id } = body as { receiver_id: number };

    if (!receiver_id || receiver_id === payload.userId) {
      return NextResponse.json({ success: false, error: 'Invalid receiver' }, { status: 400 });
    }

    const existing = await InterestModel.findOne({
      where: { sender_id: payload.userId, receiver_id },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'Interest already sent' }, { status: 409 });
    }

    // Check if the opposite user has already sent an interest to us
    const opposite = await InterestModel.findOne({
      where: { sender_id: receiver_id, receiver_id: payload.userId },
    });

    let interest;
    const sender = await UserModel.findByPk(payload.userId, {
      attributes: ['id', 'name'],
    });
    const receiver = await UserModel.findByPk(receiver_id, {
      attributes: ['id', 'name'],
    });

    if (opposite && opposite.status !== 'rejected') {
      // It's a match! Both gave interest. Mark both as accepted.
      await opposite.update({ status: 'accepted' });

      interest = await InterestModel.create({
        sender_id: payload.userId,
        receiver_id,
        status: 'accepted',
      });

      // Send Match Found notifications to BOTH parties
      if (sender && receiver) {
        try {
          await createInterestAcceptedNotification(
            receiver_id,
            sender.name,
            payload.userId,
            interest.id
          );
          await createInterestAcceptedNotification(
            payload.userId,
            receiver.name,
            receiver_id,
            opposite.id
          );
        } catch (notifError) {
          console.error('Failed to create mutual match notifications:', notifError);
        }
      }
    } else {
      // Normal flow
      interest = await InterestModel.create({
        sender_id: payload.userId,
        receiver_id,
        status: 'pending',
      });

      if (sender) {
        try {
          await createInterestNotification(
            receiver_id,
            sender.name,
            payload.userId,
            interest.id
          );
        } catch (notifError) {
          console.error('Failed to create interest notification:', notifError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: opposite && opposite.status !== 'rejected' ? 'Mutual match found! Chat unlocked.' : 'Interest sent successfully',
      data: interest,
    }, { status: 201 });
  } catch (error) {
    console.error('Send interest error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send interest' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);
    const body = await request.json();
    const { interest_id, status } = body as { interest_id: number; status: 'accepted' | 'rejected' };

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const interest = await InterestModel.findOne({
      where: { id: interest_id, receiver_id: payload.userId },
    });

    if (!interest) {
      return NextResponse.json({ success: false, error: 'Interest not found' }, { status: 404 });
    }

    await interest.update({ status });

    if (status === 'accepted') {
      // Find or create opposite interest to also mark it accepted
      let oppositeInterest = await InterestModel.findOne({
        where: { sender_id: payload.userId, receiver_id: interest.sender_id },
      });
      if (!oppositeInterest) {
        oppositeInterest = await InterestModel.create({
          sender_id: payload.userId,
          receiver_id: interest.sender_id,
          status: 'accepted',
        });
      } else if (oppositeInterest.status !== 'accepted') {
        await oppositeInterest.update({ status: 'accepted' });
      }

      // Send Match Found notification to the sender (interest.sender_id) who initiated the request
      const receiver = await UserModel.findByPk(payload.userId, {
        attributes: ['id', 'name'],
      });
      if (receiver) {
        try {
          await createInterestAcceptedNotification(
            interest.sender_id,
            receiver.name,
            payload.userId,
            interest.id
          );
        } catch (notifError) {
          console.error('Failed to create match acceptance notification:', notifError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Interest ${status}`,
      data: interest,
    });
  } catch (error) {
    console.error('Update interest error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update interest' }, { status: 500 });
  }
}
