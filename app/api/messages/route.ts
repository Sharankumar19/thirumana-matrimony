// app/api/messages/route.ts — Send and get messages
import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';
import { connectDB } from '@/lib/db';
import { MessageModel, UserModel } from '@/models';
import { authenticateRequest } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);
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

    // Verify receiver exists
    const receiver = await UserModel.findByPk(receiver_id);
    if (!receiver) {
      return NextResponse.json(
        { success: false, error: 'Receiver not found' },
        { status: 404 }
      );
    }

    const message = await MessageModel.create({
      sender_id: payload.userId,
      receiver_id: parseInt(receiver_id),
      content: content.trim(),
    });

    return NextResponse.json({
      success: true,
      data: message,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);
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
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
