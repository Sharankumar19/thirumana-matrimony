'use client';
// components/ui/Navbar.tsx
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Heart, Search, User, Crown, LogOut, Menu, X, Bell, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import NotificationCenter from '@/components/ui/NotificationCenter';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  function handleLogout() {
    dispatch(logout());
    toast.success('Logged out successfully');
    router.push('/');
  }

  const navLinks = isAuthenticated
    ? [
        { href: '/search', label: 'Find Matches', icon: Search },
        { href: '/messages', label: 'Messages', icon: MessageCircle },
        { href: '/profile', label: 'My Profile', icon: User },
        { href: '/subscription', label: 'Plans', icon: Crown },
      ]
    : [];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-premium-gradient rounded-lg flex items-center justify-center shadow-button">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-xl font-display font-bold gradient-text">Thirumana Matrimony</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${pathname === href
                    ? 'bg-rose-50 text-rose-600'
                    : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationCenter />
                <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-premium-gradient flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                    {user?.profile_image ? (
                      <img src={user.profile_image} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.[0]?.toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user?.name}</span>
                  <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Logout">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm">Login</Link>
                <Link href="/signup" className="btn-primary text-sm py-2">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-rose-50">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-rose-100 px-4 py-4 space-y-2">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${pathname === href ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 btn-secondary text-center text-sm py-2.5">Login</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="flex-1 btn-primary text-center text-sm py-2.5">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
