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
  premium: 99999, // effectively unlimited for premium users
  standard: 9,
  pro: 15,
  elite: 30,
};

export const PLAN_PRICES: Record<string, number> = {
  free: 0,
  premium: 199,
  standard: 499,
  pro: 999,
  elite: 1999,
};

export function getPlanExpiryDate(days = 30): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/** Returns true if the plan type grants full contact visibility */
export function isPremiumPlan(planType?: string): boolean {
  return !!planType && ['premium', 'standard', 'pro', 'elite'].includes(planType);
}

/** Masks email: zara@gmail.com → z*****@gmail.com */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain || local.length === 0) return email;
  const visible = local[0];
  const stars = '*'.repeat(Math.max(local.length - 1, 5));
  return `${visible}${stars}@${domain}`;
}

/** Masks phone: 8876543211 → 88*******11 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return phone;
  const start = digits.slice(0, 2);
  const end = digits.slice(-2);
  const stars = '*'.repeat(digits.length - 4);
  return `${start}${stars}${end}`;
}
