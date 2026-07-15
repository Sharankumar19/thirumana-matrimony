'use client';
// components/profile/ProfileCard.tsx
import { useState } from 'react';
import { MapPin, Briefcase, Heart, Star, Cake, DollarSign, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/store/hooks';
import type { User } from '@/types';
import LoginPromptModal from '@/components/ui/LoginPromptModal';

interface ProfileCardProps {
  user: User;
  onInterest?: (userId: number) => Promise<boolean>;
  onClick?: () => void;
}

export default function ProfileCard({ user, onInterest, onClick }: ProfileCardProps) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [liked, setLiked] = useState(false);
  const [sending, setSending] = useState(false);
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  async function handleInterest() {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    setSending(true);
    const success = await onInterest?.(user.id);
    setSending(false);

    if (success) {
      setLiked(true);
      toast.success('Interest sent!');
    } else {
      toast.error('Failed to send interest. You may have already expressed interest.');
    }
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarColors = [
    'from-rose-400 to-pink-600',
    'from-purple-400 to-indigo-600',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-600',
    'from-blue-400 to-cyan-600',
  ];
  const colorIdx = user.id % avatarColors.length;

  return (
    <>
      <div className="profile-card card overflow-hidden group cursor-pointer border border-gray-100/80 rounded-3xl" onClick={onClick}>
        {/* Image / Avatar */}
        <div className="relative h-64 overflow-hidden">
          {user.profile_image ? (
            <img
              src={user.profile_image}
              alt={user.name}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${avatarColors[colorIdx]} flex items-center justify-center`}>
              <span className="text-5xl font-display font-bold text-white/90">{initials}</span>
            </div>
          )}
          <div className="absolute inset-0 img-overlay" />

          {/* Premium Plan Badge */}
          {user.subscription?.plan_type && user.subscription.plan_type !== 'free' && (
            <div className="absolute top-3 left-3">
              <span className="badge bg-amber-400 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                <Star className="w-2.5 h-2.5 fill-current" />
                {user.subscription.plan_type.toUpperCase()}
              </span>
            </div>
          )}

          {/* Location & Job details overlay */}
          {user.location && (
            <div className="absolute top-3 right-3">
              <span className="badge bg-black/40 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                {user.location.split(',')[0]}
              </span>
            </div>
          )}

          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pt-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <h3 className="text-white font-display font-bold text-base leading-tight flex items-center gap-1.5">
              {user.name}
            </h3>
            <p className="text-white/80 text-xs mt-1">
              {user.age} yrs • {user.religion?.name || 'Hindu'} • {user.caste?.name || 'Caste'}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Main info tags */}
          <div className="space-y-1.5 text-xs">
            {user.job && (
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span className="truncate font-medium">{user.job}</span>
              </div>
            )}
            {user.salary && (
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span className="truncate font-medium">{user.salary}</span>
              </div>
            )}
          </div>

          {/* Bio preview */}
          {user.bio && (
            <div className="text-[11px] text-gray-400 italic line-clamp-1 border-t border-gray-50 pt-2">
              "{user.bio}"
            </div>
          )}

          {/* Mobile Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleInterest();
              }}
              disabled={sending || liked}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                liked 
                  ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow-rose-100'
              } disabled:opacity-80`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
              {sending ? '...' : liked ? 'Connected' : 'Connect'}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
              className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
            >
              View Info
            </button>
          </div>
        </div>
      </div>

      {showLoginPrompt && (
        <LoginPromptModal
          redirectPath={`/profile-cardDetails/${user.id}`}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}
    </>
  );
}
