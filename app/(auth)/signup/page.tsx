// app/(auth)/signup/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import SignupForm from './signup-form';

export const metadata: Metadata = {
  title: 'Register for Free — Thirumana Matrimony',
  description: 'Create your free matrimonial profile today. Find verified matches across religions, castes, and locations on India\'s trusted matrimony platform.',
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-lg card p-8 animate-pulse h-[550px] bg-white rounded-2xl" />}>
      <SignupForm />
    </Suspense>
  );
}
