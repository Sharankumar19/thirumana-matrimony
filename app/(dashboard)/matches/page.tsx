'use client';
// app/(dashboard)/matches/page.tsx
import { useEffect, useState } from 'react';
import { Heart, Check, X, UserCheck, Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import MessageModal from '@/components/profile/MessageModal';

interface InterestUser {
  id: number;
  name: string;
  age: number;
  location: string;
  profile_image?: string;
  job?: string;
}

interface Interest {
  id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender?: InterestUser;
  receiver?: InterestUser;
}

export default function MatchesPage() {
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<InterestUser | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(decoded.userId);
      } catch (err) {
        console.error('Failed to decode token:', err);
      }
    }
  }, []);

  useEffect(() => {
    fetchInterests();
  }, [tab]);

  async function fetchInterests() {
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/interests?type=${tab}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await res.json();
    if (d.success) setInterests(d.data);
    setLoading(false);
  }

  async function handleRespond(interestId: number, status: 'accepted' | 'rejected') {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/interests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ interest_id: interestId, status }),
    });
    const d = await res.json();
    if (d.success) {
      toast.success(status === 'accepted' ? 'Interest accepted! 🎉' : 'Interest declined');
      setInterests((prev) =>
        prev.map((i) => (i.id === interestId ? { ...i, status } : i))
      );
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="section-title">My Interests</h1>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        {([
          { key: 'received', label: 'Received', icon: Heart },
          { key: 'sent', label: 'Sent', icon: Send },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
              ${tab === key ? 'bg-white shadow text-rose-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
        </div>
      ) : interests.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-12 h-12 text-rose-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No {tab} interests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {interests.map((interest) => {
            const person = tab === 'received' ? interest.sender : interest.receiver;
            if (!person) return null;
            return (
              <div key={interest.id} className="card p-4 flex items-center gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-xl bg-premium-gradient flex items-center justify-center text-white font-display font-bold text-lg flex-shrink-0 overflow-hidden">
                  {person.profile_image ? (
                    <img src={person.profile_image} alt={person.name} className="w-full h-full object-cover" />
                  ) : person.name[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{person.name}</h3>
                  <p className="text-xs text-gray-500">
                    {person.age} yrs • {person.location}
                    {person.job && ` • ${person.job}`}
                  </p>
                  <span className={`badge mt-1 ${statusColors[interest.status]} capitalize`}>
                    {interest.status}
                  </span>
                </div>

                {/* Actions for received + pending */}
                {tab === 'received' && interest.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleRespond(interest.id, 'accepted')}
                      className="w-9 h-9 bg-green-100 text-green-600 rounded-xl flex items-center justify-center hover:bg-green-200 transition-colors"
                      title="Accept"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRespond(interest.id, 'rejected')}
                      className="w-9 h-9 bg-red-100 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-200 transition-colors"
                      title="Decline"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {interest.status === 'accepted' && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {tab === 'received' && (
                      <UserCheck className="w-5 h-5 text-green-500" />
                    )}
                    <button
                      onClick={() => {
                        setSelectedUser(person);
                        setShowMessageModal(true);
                      }}
                      className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-colors"
                      title="Chat Now"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedUser && currentUserId && (
        <MessageModal
          targetUser={selectedUser as any}
          currentUserId={currentUserId}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
