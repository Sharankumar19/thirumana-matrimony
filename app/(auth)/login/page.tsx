'use client';
// app/(auth)/login/page.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError } from '@/store/slices/authSlice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, isAuthenticated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated) router.replace('/search');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      router.push('/search');
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="card p-8 animate-fade-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 text-sm">Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field pl-10"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field pl-10 pr-10"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-rose-600 hover:text-rose-700 transition-colors">
              Create one
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-700 font-medium text-center">Demo: demo@thirumanamatrimony.com / demo123</p>
        </div>
      </div>
    </div>
  );
}
