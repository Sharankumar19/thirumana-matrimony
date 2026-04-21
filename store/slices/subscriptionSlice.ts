// store/slices/subscriptionSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { SubscriptionState, PlanType } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || '';

function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
}

export const fetchSubscription = createAsyncThunk(
  'subscription/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/subscriptions`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return data.data;
    } catch {
      return rejectWithValue('Failed to fetch subscription');
    }
  }
);

export const upgradePlan = createAsyncThunk(
  'subscription/upgrade',
  async (plan_type: PlanType, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ plan_type }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return data.data;
    } catch {
      return rejectWithValue('Upgrade failed');
    }
  }
);

const initialState: SubscriptionState = {
  subscription: null,
  loading: false,
  error: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    incrementContactsUsed(state) {
      if (state.subscription) {
        state.subscription.contacts_used += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscription.pending, (state) => { state.loading = true; })
      .addCase(fetchSubscription.fulfilled, (state, action) => { state.loading = false; state.subscription = action.payload; })
      .addCase(fetchSubscription.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder
      .addCase(upgradePlan.pending, (state) => { state.loading = true; })
      .addCase(upgradePlan.fulfilled, (state, action) => { state.loading = false; state.subscription = action.payload; })
      .addCase(upgradePlan.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { incrementContactsUsed } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
