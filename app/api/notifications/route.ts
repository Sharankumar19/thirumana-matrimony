// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { NotificationModel } from '@/models';
import { authenticateRequest } from '@/utils/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);

    const notifications = await NotificationModel.findAll({
      where: { user_id: payload.userId },
      order: [['created_at', 'DESC']],
      limit: 50,
    });

    const unreadCount = await NotificationModel.count({
      where: { user_id: payload.userId, is_read: false },
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);
    const body = await request.json();
    const { notification_id, mark_all_read } = body as {
      notification_id?: number;
      mark_all_read?: boolean;
    };

    if (mark_all_read) {
      await NotificationModel.update(
        { is_read: true },
        { where: { user_id: payload.userId, is_read: false } }
      );
    } else if (notification_id) {
      const notification = await NotificationModel.findOne({
        where: { id: notification_id, user_id: payload.userId },
      });
      if (notification) {
        await notification.update({ is_read: true });
      }
    }

    const unreadCount = await NotificationModel.count({
      where: { user_id: payload.userId, is_read: false },
    });

    return NextResponse.json({ success: true, unreadCount });
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update notification' }, { status: 500 });
  }
}
