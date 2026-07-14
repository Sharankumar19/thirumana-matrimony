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
  async (
    filters: SearchFilters & { append?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const { append, ...searchFilters } = filters;
      const params = new URLSearchParams();
      Object.entries(searchFilters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          params.append(key, String(val));
        }
      });

      const res = await fetch(`${BASE_URL}/api/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return { ...data, append: !!append };
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
  loadingMore: false,
  hasMore: true,
  error: null,
};

const matchSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<SearchFilters>) {
      state.filters = action.payload;
      state.page = 1;
      state.hasMore = true;
    },
    clearFilters(state) {
      state.filters = {};
      state.page = 1;
      state.hasMore = true;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    resetResults(state) {
      state.results = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchProfiles.pending, (state, action) => {
        const isAppend = action.meta.arg.append;
        if (isAppend) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(searchProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        const { data, total, page, totalPages, append } = action.payload;
        state.results = append ? [...state.results, ...data] : data;
        state.total = total;
        state.page = page;
        state.totalPages = totalPages;
        state.hasMore = page < totalPages;
      })
      .addCase(searchProfiles.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearFilters, setPage, resetResults } = matchSlice.actions;
export default matchSlice.reducer;
