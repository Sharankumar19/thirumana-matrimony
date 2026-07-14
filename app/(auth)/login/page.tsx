// app/(auth)/login/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from './login-form';

export const metadata: Metadata = {
  title: 'Sign In — Thirumana Matrimony',
  description: 'Log in to your Thirumana Matrimony account to find your perfect partner and connect across communities.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md card p-8 animate-pulse h-[400px] bg-white rounded-2xl" />}>
      <LoginForm />
    </Suspense>
  );
}
