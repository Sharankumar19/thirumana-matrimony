// store/slices/userSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { UserState, UpdateProfileRequest } from '@/types';
import { fetchWithAuth } from './authSlice';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || '';

export const fetchProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${BASE_URL}/api/profile`, {}, dispatch);
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return data.data;
    } catch {
      return rejectWithValue('Network error');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: UpdateProfileRequest, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      }, dispatch);
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return data.data;
    } catch {
      return rejectWithValue('Network error');
    }
  }
);

export const uploadProfileImage = createAsyncThunk(
  'user/profileImageUpload',
  async (formData: FormData, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${BASE_URL}/api/profile/upload`, {
        method: 'POST',
        body: formData,
      }, dispatch);
      const data = await res.json();
      console.log(data,"=======>");
      if (!res.ok) return rejectWithValue(data.error);
      return data.data;
    } catch {
      return rejectWithValue('Upload failed');
    }
  }
);

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(fetchProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder
      .addCase(updateProfile.pending, (state) => { state.loading = true; })
      .addCase(updateProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(updateProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.profile_image = action.payload.profile_image;
        }
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
