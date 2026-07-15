// app/api/messages/conversations/route.ts — Get all conversations for current user
import { NextRequest, NextResponse } from 'next/server';
import { Op, Sequelize } from 'sequelize';
import { connectDB } from '@/lib/db';
import { MessageModel, UserModel } from '@/models';
import { authenticateRequest } from '@/utils/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);

    // Get all unique users that the current user has messaged or been messaged by
    const messages = await MessageModel.findAll({
      where: {
        [Op.or]: [
          { sender_id: payload.userId },
          { receiver_id: payload.userId },
        ],
      },
      attributes: ['sender_id', 'receiver_id', 'content', 'created_at'],
      order: [['created_at', 'DESC']],
      raw: true,
    });

    // Get unique conversation partners
    const conversationPartners = new Map<number, { userId: number; lastMessage: string; lastMessageTime: string }>();

    for (const msg of messages) {
      const partnerId = msg.sender_id === payload.userId ? msg.receiver_id : msg.sender_id;

      if (!conversationPartners.has(partnerId)) {
        conversationPartners.set(partnerId, {
          userId: partnerId,
          lastMessage: msg.content,
          lastMessageTime: msg.created_at as any,
        });
      }
    }

    // Get user details for all conversation partners
    const conversationPartnerIds = Array.from(conversationPartners.keys());

    if (conversationPartnerIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const users = await UserModel.findAll({
      where: {
        id: { [Op.in]: conversationPartnerIds },
      },
      attributes: ['id', 'name', 'profile_image'],
      raw: true,
    });

    // Combine user data with last message info
    const conversations = users.map((user) => {
      const msgInfo = conversationPartners.get(user.id);
      return {
        user_id: user.id,
        name: user.name,
        profile_image: user.profile_image,
        last_message: msgInfo?.lastMessage,
        last_message_time: msgInfo?.lastMessageTime,
      };
    });

    // Sort by last message time (most recent first)
    conversations.sort((a, b) => {
      const timeA = new Date(a.last_message_time || 0).getTime();
      const timeB = new Date(b.last_message_time || 0).getTime();
      return timeB - timeA;
    });

    return NextResponse.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
