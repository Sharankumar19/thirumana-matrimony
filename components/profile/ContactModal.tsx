'use client';
// components/profile/ContactModal.tsx
import { useState } from 'react';
import { X, Phone, Crown, Lock, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { User } from '@/types';

interface ContactModalProps {
  targetUser: User;
  onClose: () => void;
}

export default function ContactModal({ targetUser, onClose }: ContactModalProps) {
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const router = useRouter();

  async function handleUnlock() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/contact-unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ target_user_id: targetUser.id }),
      });
      const data = await res.json();

      if (res.status === 403) {
        setNeedsUpgrade(true);
        return;
      }

      if (data.success) {
        setPhone(data.phone);
        toast.success('Contact unlocked!');
      } else {
        toast.error(data.message || 'Failed to unlock');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="bg-premium-gradient p-5 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-display font-bold">
              {targetUser.name[0].toUpperCase()}
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">{targetUser.name}</h3>
              <p className="text-white/70 text-sm">{targetUser.age} yrs • {targetUser.location}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Phone revealed */}
          {phone ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Contact Number</p>
                <a
                  href={`tel:${phone}`}
                  className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900 hover:text-rose-600 transition-colors"
                >
                  <Phone className="w-6 h-6" />
                  {phone}
                </a>
              </div>
              <button onClick={onClose} className="btn-primary w-full">Done</button>
            </div>
          ) : needsUpgrade ? (
            /* Upgrade required */
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <Crown className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <h4 className="font-display font-bold text-xl text-gray-900">Upgrade Your Plan</h4>
                <p className="text-gray-500 text-sm mt-1">
                  You've used all your contact views. Upgrade to unlock more connections.
                </p>
              </div>
              <div className="bg-rose-50 rounded-xl p-4 text-left space-y-2">
                {[
                  { plan: 'Standard', contacts: 7, price: '₹499' },
                  { plan: 'Pro', contacts: 15, price: '₹999' },
                  { plan: 'Elite', contacts: 30, price: '₹1,999' },
                ].map((p) => (
                  <div key={p.plan} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{p.plan}</span>
                    <span className="text-gray-500">{p.contacts} contacts</span>
                    <span className="font-bold text-rose-600">{p.price}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { onClose(); router.push('/subscription'); }}
                className="btn-primary w-full"
              >
                <Crown className="w-4 h-4 inline mr-2" />
                View Plans
              </button>
            </div>
          ) : (
            /* Default unlock view */
            <div className="text-center space-y-5">
              <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <h4 className="font-display font-bold text-xl text-gray-900">View Contact</h4>
                <p className="text-gray-500 text-sm mt-1">
                  Unlock {targetUser.name}'s phone number to get in touch directly.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 btn-secondary text-sm py-2.5">Cancel</button>
                <button onClick={handleUnlock} disabled={loading} className="flex-1 btn-primary text-sm py-2.5">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Unlocking...
                    </span>
                  ) : (
                    <>
                      <Phone className="w-4 h-4 inline mr-1.5" />
                      Unlock
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
