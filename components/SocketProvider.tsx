'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addNotification, fetchNotifications } from '@/store/slices/notificationSlice';
import type { Notification } from '@/types';

const POLL_INTERVAL = 30000;

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    dispatch(fetchNotifications());

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    const socket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', user.id);
    });

    socket.on('notification', (notification: Notification) => {
      dispatch(addNotification(notification));
    });

    const pollId = setInterval(() => {
      dispatch(fetchNotifications());
    }, POLL_INTERVAL);

    return () => {
      clearInterval(pollId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user, dispatch]);

  return <>{children}</>;
}
