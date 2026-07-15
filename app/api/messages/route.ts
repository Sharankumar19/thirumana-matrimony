// app/api/messages/route.ts — Send and get messages
import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';
import { connectDB } from '@/lib/db';
import { MessageModel, UserModel, InterestModel } from '@/models';
import { authenticateRequest } from '@/utils/auth';
import { createMessageNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    let payload;
    try {
      payload = authenticateRequest(request);
    } catch (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { receiver_id, content } = body;

    if (!receiver_id || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing receiver_id or content' },
        { status: 400 }
      );
    }

    if (!content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    // Check if sender is trying to send to themselves
    if (parseInt(receiver_id) === payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Cannot send message to yourself' },
        { status: 400 }
      );
    }

    // Verify receiver exists
    const receiver = await UserModel.findByPk(receiver_id);
    if (!receiver) {
      return NextResponse.json(
        { success: false, error: 'Receiver not found' },
        { status: 404 }
      );
    }

    // Check if chat is unlocked (mutual interest) between sender and receiver
    const senderId = payload.userId;
    const receiverIdParsed = parseInt(receiver_id);

    const sentInterest = await InterestModel.findOne({
      where: { sender_id: senderId, receiver_id: receiverIdParsed },
    });
    const receivedInterest = await InterestModel.findOne({
      where: { sender_id: receiverIdParsed, receiver_id: senderId },
    });

    const hasAccepted = (sentInterest?.status === 'accepted') || (receivedInterest?.status === 'accepted');
    const hasMutualActive = (sentInterest && sentInterest.status !== 'rejected') && 
                            (receivedInterest && receivedInterest.status !== 'rejected');

    if (!hasAccepted && !hasMutualActive) {
      return NextResponse.json(
        { success: false, error: 'Chat is locked. Both profiles must express interest in each other to unlock chat.' },
        { status: 403 }
      );
    }

    const message = await MessageModel.create({
      sender_id: payload.userId,
      receiver_id: receiverIdParsed,
      content: content.trim(),
    });

    // Send notification to the receiver
    const sender = await UserModel.findByPk(payload.userId, {
      attributes: ['id', 'name'],
    });

    if (sender) {
      try {
        await createMessageNotification(
          receiverIdParsed,
          sender.name,
          payload.userId,
          message.id,
          message.content
        );
      } catch (notifError) {
        console.error('Failed to create message notification:', notifError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: message,
        message: 'Message sent successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Send message error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    let payload;
    try {
      payload = authenticateRequest(request);
    } catch (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const other_user_id = searchParams.get('other_user_id');

    if (!other_user_id) {
      return NextResponse.json(
        { success: false, error: 'Missing other_user_id' },
        { status: 400 }
      );
    }

    const conversation = await MessageModel.findAll({
      where: {
        [Op.or]: [
          {
            sender_id: payload.userId,
            receiver_id: parseInt(other_user_id),
          },
          {
            sender_id: parseInt(other_user_id),
            receiver_id: payload.userId,
          },
        ],
      },
      include: [
        { model: UserModel, as: 'sender', attributes: ['id', 'name'] },
        { model: UserModel, as: 'receiver', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'ASC']],
    });

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
