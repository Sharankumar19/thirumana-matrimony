'use client';

import { useRouter } from 'next/navigation';
import { Crown, X, Lock, Sparkles } from 'lucide-react';

interface PremiumUpgradeModalProps {
  onClose: () => void;
}

export default function PremiumUpgradeModal({ onClose }: PremiumUpgradeModalProps) {
  const router = useRouter();

  function handleUpgrade() {
    onClose();
    router.push('/subscription');
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Crown className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-display font-bold">Premium Members Only</h2>
          <p className="text-white/80 text-sm mt-1">Unlock full contact details</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Feature highlight */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900 leading-relaxed">
              This contact information is available only for <strong>Premium members</strong>. Upgrade to Premium for just{' '}
              <strong>₹199</strong> to unlock full contact details and enjoy exclusive benefits.
            </p>
          </div>

          {/* Benefits list */}
          <ul className="space-y-2.5">
            {[
              'View full mobile numbers',
              'View complete email addresses',
              'Access to all future premium features',
            ].map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-sm text-gray-700">
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-white" />
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          {/* Price badge */}
          <div className="text-center py-2">
            <span className="text-4xl font-extrabold text-gray-900">₹199</span>
            <span className="text-gray-500 text-sm ml-1">/month</span>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleUpgrade}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-orange-300 flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Premium (₹199)
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-medium text-gray-500 text-sm hover:bg-gray-50 transition-colors border border-gray-200"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
