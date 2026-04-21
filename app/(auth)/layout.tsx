// app/(auth)/layout.tsx
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col">
      {/* Simple header */}
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 bg-premium-gradient rounded-lg flex items-center justify-center shadow-button">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-xl font-display font-bold gradient-text">Thirumana Matrimony</span>
        </Link>
      </header>

      {/* Decorative circles */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
