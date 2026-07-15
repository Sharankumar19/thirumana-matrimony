import { connectDB } from '@/lib/db';
import { NotificationModel } from '@/models';
import { emitToUser } from '@/lib/socket';

export async function createInterestNotification(
  receiverId: number,
  senderName: string,
  senderId: number,
  interestId: number
) {
  await connectDB();

  const notification = await NotificationModel.create({
    user_id: receiverId,
    type: 'interest',
    title: 'New Interest',
    message: `${senderName} has expressed interest in your profile.`,
    link: `/profile-cardDetails/${senderId}`,
    reference_id: interestId,
    is_read: false,
  });

  emitToUser(receiverId, 'notification', {
    id: notification.id,
    user_id: receiverId,
    type: 'interest',
    title: notification.title,
    message: notification.message,
    link: notification.link,
    reference_id: interestId,
    is_read: false,
    created_at: notification.created_at,
  });

  return notification;
}

export async function createInterestAcceptedNotification(
  receiverId: number,
  senderName: string,
  senderId: number,
  interestId: number
) {
  await connectDB();

  const notification = await NotificationModel.create({
    user_id: receiverId,
    type: 'interest_accepted',
    title: 'Match Found! 🎉',
    message: `You and ${senderName} are mutually interested. Chat option is unlocked!`,
    link: '/messages',
    reference_id: interestId,
    is_read: false,
  });

  emitToUser(receiverId, 'notification', {
    id: notification.id,
    user_id: receiverId,
    type: 'interest_accepted',
    title: notification.title,
    message: notification.message,
    link: notification.link,
    reference_id: interestId,
    is_read: false,
    created_at: notification.created_at,
  });

  return notification;
}

export async function createMessageNotification(
  receiverId: number,
  senderName: string,
  senderId: number,
  messageId: number,
  messageContent: string
) {
  await connectDB();

  const truncatedContent = messageContent.length > 60
    ? messageContent.substring(0, 57) + '...'
    : messageContent;

  const notification = await NotificationModel.create({
    user_id: receiverId,
    type: 'message',
    title: `New Message from ${senderName}`,
    message: truncatedContent,
    link: '/messages',
    reference_id: messageId,
    is_read: false,
  });

  emitToUser(receiverId, 'notification', {
    id: notification.id,
    user_id: receiverId,
    type: 'message',
    title: notification.title,
    message: notification.message,
    link: notification.link,
    reference_id: messageId,
    is_read: false,
    created_at: notification.created_at,
  });

  return notification;
}

