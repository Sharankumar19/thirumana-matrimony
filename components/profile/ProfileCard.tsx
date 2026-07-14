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
      <div className="profile-card card overflow-hidden group cursor-pointer" onClick={onClick}>
        {/* Image / Avatar */}
        <div className="relative h-56 overflow-hidden">
          {user.profile_image ? (
            <img
              src={user.profile_image}
              alt={user.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${avatarColors[colorIdx]} flex items-center justify-center`}>
              <span className="text-5xl font-display font-bold text-white/90">{initials}</span>
            </div>
          )}
          <div className="absolute inset-0 img-overlay" />

          {/* Plan badge */}
          {user.subscription?.plan_type && user.subscription.plan_type !== 'free' && (
            <div className="absolute top-3 right-3">
              <span className="badge bg-amber-400/90 text-amber-900 text-xs font-bold px-2 py-1">
                <Star className="w-3 h-3 inline mr-0.5" />
                {user.subscription.plan_type.toUpperCase()}
              </span>
            </div>
          )}

          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-display font-semibold text-lg leading-tight">{user.name}</h3>
            <div className="flex items-center gap-1 text-white/90 text-sm">
              <Cake className="w-3.5 h-3.5" />
              <p>{user.age} yrs</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Religious badges */}
          <div className="flex flex-wrap gap-2 text-xs">
            {user.religion && (
              <span className="badge-rose">{user.religion.name}</span>
            )}
            {user.caste && (
              <span className="badge bg-purple-100 text-purple-700">{user.caste.name}</span>
            )}
            {user.gender && (
              <span className="badge bg-blue-100 text-blue-700 capitalize">{user.gender}</span>
            )}
          </div>

          {/* Main info */}
          <div className="space-y-1.5">
            {user.location && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span className="truncate">{user.location}</span>
              </div>
            )}
            {user.job && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Briefcase className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span className="truncate">{user.job}</span>
              </div>
            )}
            {user.salary && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <DollarSign className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span className="truncate">{user.salary}</span>
              </div>
            )}
          </div>

          {/* Bio preview */}
          {user.bio && (
            <div className="text-xs text-gray-600 line-clamp-2 pt-1 border-t border-gray-100">
              {user.bio}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleInterest();
              }}
              disabled={sending || liked}
              className="flex-1 bg-rose-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-rose-700 transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
              {sending ? 'Sending...' : liked ? 'Liked' : 'Interest'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to profile detail for contact viewing (premium check happens there)
                onClick?.();
              }}
              className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
            >
              <Lock className="w-3.5 h-3.5" />
              Contact
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
