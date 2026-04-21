// store/slices/matchSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { MatchState, SearchFilters } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || '';

function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
}

export const searchProfiles = createAsyncThunk(
  'matches/search',
  async (filters: SearchFilters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          params.append(key, String(val));
        }
      });

      const res = await fetch(`${BASE_URL}/api/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return data;
    } catch {
      return rejectWithValue('Search failed');
    }
  }
);

const initialState: MatchState = {
  results: [],
  total: 0,
  page: 1,
  totalPages: 1,
  filters: {},
  loading: false,
  error: null,
};

const matchSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<SearchFilters>) {
      state.filters = action.payload;
      state.page = 1;
    },
    clearFilters(state) {
      state.filters = {};
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchProfiles.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(searchProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(searchProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearFilters, setPage } = matchSlice.actions;
export default matchSlice.reducer;
