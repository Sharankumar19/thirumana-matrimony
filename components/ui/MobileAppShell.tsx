'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Heart, Search, MessageCircle, User, Crown, 
  ChevronLeft, Bell 
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import NotificationCenter from '@/components/ui/NotificationCenter';
import Navbar from '@/components/ui/Navbar';
import toast from 'react-hot-toast';

export default function MobileAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Don't render shell logic on landing marketing page
  if (pathname === '/') {
    return <>{children}</>;
  }

  // Pre-mount fallback to prevent hydration flickering
  if (!mounted) {
    return <div className="min-h-screen bg-cream-50">{children}</div>;
  }

  // DESKTOP LAYOUT VIEWPORT (>= 768px)
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col w-full">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col w-full">
          {children}
        </main>
      </div>
    );
  }

  // MOBILE LAYOUT VIEWPORT (< 768px)
  const isMainTab = ['/search', '/matches', '/messages', '/profile', '/subscription'].includes(pathname);
  const isAuthPage = ['/login', '/signup'].includes(pathname);

  let title = 'Matrimony';
  if (pathname === '/search') title = 'Explore Matches';
  else if (pathname === '/matches') title = 'My Interests';
  else if (pathname === '/messages') title = 'Inbox';
  else if (pathname === '/profile') title = 'My Profile';
  else if (pathname === '/subscription') title = 'Premium Plans';
  else if (pathname === '/login') title = 'Welcome Back';
  else if (pathname === '/signup') title = 'Register Free';
  else if (pathname.startsWith('/profile-cardDetails/')) title = 'Profile Details';

  function handleLogout() {
    dispatch(logout());
    toast.success('Logged out successfully');
    router.push('/');
  }

  return (
    <div className="flex flex-col min-h-screen bg-white relative w-full overflow-hidden">
      {/* Mobile Top Header */}
      <header className="h-14 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0 z-30 sticky top-0">
        <div className="flex items-center gap-2.5">
          {isMainTab || isAuthPage ? (
            isAuthenticated && user ? (
              <Link href="/profile" className="w-8 h-8 rounded-full bg-rose-100 border border-rose-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                {user.profile_image ? (
                  <img src={user.profile_image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-rose-600">{user.name[0].toUpperCase()}</span>
                )}
              </Link>
            ) : (
              <Link href="/" className="w-7 h-7 bg-premium-gradient rounded-lg flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-white fill-current" />
              </Link>
            )
          ) : (
            <button 
              onClick={() => router.back()}
              className="p-1.5 -ml-1 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="font-display font-extrabold text-gray-900 text-base tracking-tight truncate max-w-[190px]">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {!isAuthPage && isAuthenticated && (
            <NotificationCenter />
          )}
          
          {pathname === '/profile' && isAuthenticated && (
            <button 
              onClick={handleLogout}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-xl transition-all"
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* Scrollable Screen Content */}
      <div className="phone-content">
        {children}
      </div>

      {/* Bottom Tab Bar (Visible on main tabs for mobile) */}
      {isAuthenticated && isMainTab && (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-gray-100 flex items-center justify-around z-30 pb-1.5">
          {[
            { href: '/search', label: 'Matches', icon: Search },
            { href: '/matches', label: 'Interests', icon: Heart },
            { href: '/messages', label: 'Chat', icon: MessageCircle },
            { href: '/subscription', label: 'Premium', icon: Crown },
            { href: '/profile', label: 'Profile', icon: User },
          ].map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200
                  ${active ? 'text-rose-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Icon className={`w-5 h-5 ${active ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-bold mt-1 tracking-wide">{label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
