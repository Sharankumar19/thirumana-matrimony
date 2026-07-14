// store/slices/notificationSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Notification, NotificationState } from '@/types';
import { fetchWithAuth } from './authSlice';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetchWithAuth('/api/notifications', {}, dispatch);
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return data;
    } catch {
      return rejectWithValue('Failed to fetch notifications');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (notificationId: number, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetchWithAuth('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notification_id: notificationId }),
      }, dispatch);
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return { notificationId, unreadCount: data.unreadCount };
    } catch {
      return rejectWithValue('Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetchWithAuth('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mark_all_read: true }),
      }, dispatch);
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return data.unreadCount;
    } catch {
      return rejectWithValue('Failed to mark notifications as read');
    }
  }
);

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action) {
      const exists = state.notifications.some((n) => n.id === action.payload.id);
      if (!exists) {
        state.notifications.unshift(action.payload);
        if (!action.payload.is_read) {
          state.unreadCount += 1;
        }
      }
    },
    setUnreadCount(state, action) {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notif = state.notifications.find((n) => n.id === action.payload.notificationId);
        if (notif && !notif.is_read) {
          notif.is_read = true;
        }
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state, action) => {
        state.notifications.forEach((n) => { n.is_read = true; });
        state.unreadCount = action.payload;
      });
  },
});

export const { addNotification, setUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
