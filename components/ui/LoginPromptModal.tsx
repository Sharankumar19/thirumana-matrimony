'use client';

import Link from 'next/link';
import { X, Heart } from 'lucide-react';

interface LoginPromptModalProps {
  redirectPath: string;
  onClose: () => void;
}

export default function LoginPromptModal({ redirectPath, onClose }: LoginPromptModalProps) {
  const loginUrl = `/login?redirect=${encodeURIComponent(redirectPath)}&reason=interest`;
  const signupUrl = `/signup?redirect=${encodeURIComponent(redirectPath)}&reason=interest`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="card p-6 max-w-md w-full animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-rose-600" />
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-xl font-display font-bold text-gray-900 mb-2">Login Required</h2>
        <p className="text-gray-600 text-sm mb-6">
          <strong>Please log in or create an account to express your interest in this profile.</strong>
        </p>

        <div className="flex gap-3">
          <Link href={loginUrl} className="btn-primary flex-1 py-3 text-center text-sm">
            Log In
          </Link>
          <Link href={signupUrl} className="btn-secondary flex-1 py-3 text-center text-sm">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
