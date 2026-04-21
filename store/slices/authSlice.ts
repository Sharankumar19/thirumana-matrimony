// store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, AuthLoginRequest, AuthSignupRequest, User } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || '';

// ── Thunks ──────────────────────────────────────────────────
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: AuthLoginRequest, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || 'Login failed');
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch {
      return rejectWithValue('Network error');
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async (userData: AuthSignupRequest, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || 'Signup failed');
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch {
      return rejectWithValue('Network error');
    }
  }
);

// ── Initial State ────────────────────────────────────────────
function loadFromStorage(): { user: User | null; token: string | null } {
  if (typeof window === 'undefined') return { user: null, token: null };
  try {
    return {
      token: localStorage.getItem('token'),
      user: JSON.parse(localStorage.getItem('user') || 'null'),
    };
  } catch {
    return { user: null, token: null };
  }
}

const { user, token } = loadFromStorage();

const initialState: AuthState = {
  user,
  token,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

// ── Slice ────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    updateAuthUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, updateAuthUser, clearError } = authSlice.actions;
export default authSlice.reducer;
