'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Heart, Check, Loader2, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/store/slices/notificationSlice';
import type { Notification } from '@/types';

function NotificationIcon({ type }: { type: Notification['type'] }) {
  if (type === 'interest' || type === 'interest_accepted') {
    return <Heart className="w-4 h-4 text-rose-500" />;
  }
  if (type === 'message') {
    return <MessageCircle className="w-4 h-4 text-pink-600" />;
  }
  return <Bell className="w-4 h-4 text-blue-500" />;
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { notifications, unreadCount, loading } = useAppSelector((s) => s.notifications);
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  function handleToggle() {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      dispatch(fetchNotifications());
    }
  }

  async function handleNotificationClick(notification: Notification) {
    if (!notification.is_read) {
      await dispatch(markNotificationRead(notification.id));
    }
    setOpen(false);
    router.push(notification.link);
  }

  async function handleMarkAllRead() {
    await dispatch(markAllNotificationsRead());
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">No notifications yet</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left px-4 py-3 hover:bg-rose-50 transition-colors border-b border-gray-50 last:border-0 flex gap-3 ${
                    !notification.is_read ? 'bg-rose-50/50' : ''
                  }`}
                >
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <NotificationIcon type={notification.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <span className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0 mt-2" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
