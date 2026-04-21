'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Briefcase, Heart, Phone, Star, Mail, Cake, Users, Award, Home, Briefcase as WorkIcon, DollarSign, FileText, Check, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import MessageModal from '@/components/profile/MessageModal';

export default function ViewProfilePage() {
  const params = useParams();
  const id = params.id;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    // Get current user info from token or storage
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
    async function fetchUser() {
      try {
        const res = await fetch(`/api/users/${id}`);
        const data = await res.json();

        if (data.success) {
          setUser(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    async function recordView() {
      try {
        const token = localStorage.getItem('token');

        await fetch('/api/profile-views', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ viewed_user_id: Number(id) }),
        });
      } catch (err) {
        console.error(err);
      }
    }

    if (id) {
      fetchUser();
      recordView();
    }
  }, [id]);

  function handleInterest() {
    setLiked(true);
    toast.success('Interest sent!');
  }

  // ✅ Loading UI
  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-20 text-gray-500">Profile not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* Profile Header */}
      <div className="card p-8 flex gap-8 items-start">
        {/* Avatar */}
        <div className="w-40 h-40 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          {user.profile_image ? (
            <img
              src={user.profile_image}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-4xl font-bold text-gray-500">
              {user.name?.[0]}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Cake className="w-4 h-4 text-rose-500" />
                <span className="text-gray-600">{user.age} years old</span>
              </div>
            </div>
            {user.subscription?.plan_type && user.subscription.plan_type !== 'free' && (
              <div className="badge bg-amber-100 text-amber-700 px-3 py-1">
                <Star className="w-4 h-4 mr-1 inline" />
                {user.subscription.plan_type.toUpperCase()}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
            {user.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-rose-500" />
                {user.location}
              </div>
            )}
            {user.gender && (
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4 text-rose-500" />
                <span className="capitalize">{user.gender}</span>
              </div>
            )}
            {user.job && (
              <div className="flex items-center gap-2 text-gray-600">
                <WorkIcon className="w-4 h-4 text-rose-500" />
                {user.job}
              </div>
            )}
            {user.salary && (
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-4 h-4 text-rose-500" />
                {user.salary}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About / Bio */}
      {user.bio && (
        <div className="card p-6">
          <h2 className="flex items-center gap-2 font-semibold text-lg mb-3">
            <FileText className="w-5 h-5 text-rose-500" />
            About
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            {user.bio}
          </p>
        </div>
      )}

      {/* Religious & Cultural Details */}
      <div className="card p-6">
        <h2 className="flex items-center gap-2 font-semibold text-lg mb-4">
          <Award className="w-5 h-5 text-rose-500" />
          Cultural Background
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-xs font-semibold">RELIGION</p>
            <p className="text-gray-900 font-medium mt-1">{user.religion?.name || '—'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-xs font-semibold">CASTE</p>
            <p className="text-gray-900 font-medium mt-1">{user.caste?.name || '—'}</p>
          </div>
          {user.subcaste && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-xs font-semibold">SUBCASTE</p>
              <p className="text-gray-900 font-medium mt-1">{user.subcaste.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Personal Details */}
      <div className="card p-6">
        <h2 className="flex items-center gap-2 font-semibold text-lg mb-4">
          <Home className="w-5 h-5 text-rose-500" />
          Personal Details
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-xs font-semibold">NAME</p>
            <p className="text-gray-900 font-medium mt-1">{user.name}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-xs font-semibold">AGE</p>
            <p className="text-gray-900 font-medium mt-1">{user.age} years</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-xs font-semibold">GENDER</p>
            <p className="text-gray-900 font-medium mt-1 capitalize">{user.gender}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-xs font-semibold">LOCATION</p>
            <p className="text-gray-900 font-medium mt-1">{user.location || '—'}</p>
          </div>
          {user.job && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-xs font-semibold">OCCUPATION</p>
              <p className="text-gray-900 font-medium mt-1">{user.job}</p>
            </div>
          )}
          {user.salary && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-xs font-semibold">SALARY</p>
              <p className="text-gray-900 font-medium mt-1">{user.salary}</p>
            </div>
          )}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-xs font-semibold">EMAIL</p>
            <p className="text-gray-900 font-medium mt-1 text-sm">{user.email}</p>
          </div>
          {user.phone && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-xs font-semibold">PHONE</p>
              <p className="text-gray-900 font-medium mt-1">{user.phone}</p>
            </div>
          )}
          {user.created_at && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-xs font-semibold">MEMBER SINCE</p>
              <p className="text-gray-900 font-medium mt-1">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Details */}
      {user.subscription && (
        <div className="card p-6">
          <h2 className="flex items-center gap-2 font-semibold text-lg mb-4">
            <Star className="w-5 h-5 text-rose-500" />
            Subscription Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-amber-700 text-xs font-semibold">PLAN TYPE</p>
              <p className="text-amber-900 font-bold mt-1 text-lg">{user.subscription.plan_type}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-700 text-xs font-semibold">CONTACTS AVAILABLE</p>
              <p className="text-blue-900 font-bold mt-1 text-lg">
                {user.subscription.contacts_used}/{user.subscription.contact_limit}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-700 text-xs font-semibold">REMAINING</p>
              <p className="text-green-900 font-bold mt-1 text-lg">
                {user.subscription.contact_limit - user.subscription.contacts_used}
              </p>
            </div>
            {user.subscription.expiry_date && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-purple-700 text-xs font-semibold">EXPIRES</p>
                <p className="text-purple-900 font-medium mt-1">
                  {new Date(user.subscription.expiry_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Account Status */}
      <div className="card p-6">
        <h2 className="flex items-center gap-2 font-semibold text-lg mb-4">
          <Check className="w-5 h-5 text-rose-500" />
          Account Status
        </h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className={user.is_active ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
            {user.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 sticky bottom-6">
        <button
          onClick={handleInterest}
          className={`flex-1 ${
            liked ? 'bg-rose-100 text-rose-700' : 'bg-rose-600 text-white hover:bg-rose-700'
          } py-3 rounded-xl text-sm font-medium transition-colors`}
        >
          <Heart className={`w-4 h-4 inline mr-2 ${liked ? 'fill-current' : ''}`} />
          {liked ? 'Interest Sent' : 'Send Interest'}
        </button>

        <button
          onClick={() => {
            if (!currentUserId) {
              toast.error('Please log in to send messages');
              return;
            }
            setShowMessageModal(true);
          }}
          className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Send Message
        </button>
      </div>

      {/* Message Modal */}
      {showMessageModal && currentUserId && (
        <MessageModal
          targetUser={user}
          currentUserId={currentUserId}
          onClose={() => setShowMessageModal(false)}
        />
      )}
    </div>
  );
}