// utils/helpers.ts — Shared utility functions
import { NextResponse } from 'next/server';
import { UserModel } from '@/models';

export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return NextResponse.json({
    success: true,
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

// Strip password from user object
export function sanitizeUser(user: UserModel) {
  const { password, ...safeUser } = user.toJSON() as unknown as Record<string, unknown>;
  void password;
  return safeUser;
}

export const PLAN_LIMITS: Record<string, number> = {
  free: 2,
  standard: 9,
  pro: 15,
  elite: 30,
};

export const PLAN_PRICES: Record<string, number> = {
  free: 0,
  standard: 199,
  pro: 499,
  elite: 999,
};

export function getPlanExpiryDate(days = 30): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
