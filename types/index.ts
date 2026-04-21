// ============================================================
// types/index.ts — All TypeScript interfaces for the app
// ============================================================

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  religion_id: number;
  caste_id: number;
  subcaste_id?: number;
  location: string;
  job?: string;
  salary?: string;
  bio?: string;
  profile_image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  religion?: Religion;
  caste?: Caste;
  subcaste?: SubCaste;
  subscription?: Subscription;
  profile_images?: ProfileImage[];
}

export interface Religion {
  id: number;
  name: string;
  castes?: Caste[];
}

export interface Caste {
  id: number;
  religion_id: number;
  name: string;
  religion?: Religion;
  subcastes?: SubCaste[];
}

export interface SubCaste {
  id: number;
  caste_id: number;
  name: string;
  caste?: Caste;
}

export type PlanType = 'free' | 'standard' | 'pro' | 'elite';

export interface Subscription {
  id: number;
  user_id: number;
  plan_type: PlanType;
  contact_limit: number;
  contacts_used: number;
  expiry_date: string;
  created_at: string;
  updated_at: string;
}

export interface ContactView {
  id: number;
  viewer_id: number;
  viewed_user_id: number;
  created_at: string;
  viewer?: User;
  viewed_user?: User;
}

export interface Interest {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender?: User;
  receiver?: User;
}

export interface ProfileView {
  id: number;
  viewer_id: number;
  viewed_user_id: number;
  created_at: string;
  viewer?: User;
}

export interface ProfileImage {
  id: number;
  user_id: number;
  image_url: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// API Request/Response Types
export interface AuthSignupRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  religion_id: number;
  caste_id: number;
  subcaste_id?: number;
  location: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchFilters {
  age_min?: number;
  age_max?: number;
  gender?: 'male' | 'female' | 'other';
  religion_id?: number;
  caste_id?: number;
  subcaste_id?: number;
  location?: string;
  page?: number;
  limit?: number;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  age?: number;
  location?: string;
  job?: string;
  salary?: string;
  bio?: string;
  religion_id?: number;
  caste_id?: number;
  subcaste_id?: number;
}

export interface ContactUnlockResponse {
  success: boolean;
  phone?: string;
  message: string;
  contacts_remaining?: number;
}

export interface PlanDetails {
  type: PlanType;
  name: string;
  price: number;
  contacts: number;
  duration: string;
  features: string[];
  popular?: boolean;
}

// Redux State Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface UserState {
  profile: User | null;
  loading: boolean;
  error: string | null;
}

export interface MatchState {
  results: User[];
  total: number;
  page: number;
  totalPages: number;
  filters: SearchFilters;
  loading: boolean;
  error: string | null;
}

export interface SubscriptionState {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
}
