'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { 
  MapPin, Briefcase, Heart, Star, Cake, Users, Award, Home, 
  Briefcase as WorkIcon, DollarSign, FileText, Check, MessageCircle, 
  Lock, Crown, Smile, BookOpen, HeartHandshake, Eye, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/store/hooks';
import { sendInterest } from '@/services/interestService';
import MessageModal from '@/components/profile/MessageModal';
import LoginPromptModal from '@/components/ui/LoginPromptModal';
import PremiumUpgradeModal from '@/components/ui/PremiumUpgradeModal';
import { isPremiumPlan } from '@/utils/helpers';

export default function ViewProfilePage() {
  const params = useParams();
  const id = params.id;
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [sending, setSending] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [viewerIsPremium, setViewerIsPremium] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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

    // Check viewer's subscription plan
    if (isAuthenticated && token) {
      fetch('/api/subscriptions', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data) {
            setViewerIsPremium(isPremiumPlan(data.data.plan_type));
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/users/${id}`, { headers });
      const data = await res.json();

      if (data.success) {
        setUser(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    async function recordView() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

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
  }, [id, fetchUser]);

  const handleInterest = useCallback(async () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    setSending(true);
    const success = await sendInterest(Number(id));
    setSending(false);

    if (success) {
      setLiked(true);
      toast.success('Interest sent!');
    } else {
      toast.error('Failed to send interest. You may have already expressed interest.');
    }
  }, [isAuthenticated, id]);

  useEffect(() => {
    if (isAuthenticated && id) {
      const token = localStorage.getItem('token');
      if (token) {
        fetch('/api/interests?type=sent', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.success && Array.isArray(data.data)) {
              const alreadyLiked = data.data.some(
                (item: any) => item.receiver_id === Number(id)
              );
              if (alreadyLiked) {
                setLiked(true);
              } else {
                const searchParams = new URLSearchParams(window.location.search);
                if (searchParams.get('express-interest') === 'true') {
                  const newUrl = window.location.pathname;
                  window.history.replaceState({}, '', newUrl);
                  handleInterest();
                }
              }
            }
          })
          .catch((err) => console.error(err));
      }
    }
  }, [isAuthenticated, id, handleInterest]);

  // Handle post-upgrade fetch retrigger
  const handleUpgradeModalClose = () => {
    setShowUpgradeModal(false);
    // Recheck subscription
    const token = localStorage.getItem('token');
    if (isAuthenticated && token) {
      fetch('/api/subscriptions', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data) {
            const isPremiumNow = isPremiumPlan(data.data.plan_type);
            setViewerIsPremium(isPremiumNow);
            if (isPremiumNow) {
              fetchUser();
            }
          }
        })
        .catch(() => {});
    }
  };

  // Loading UI
  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-20 text-gray-500 font-bold">Profile not found</div>;
  }

  // Parse Hobbies
  let hobbiesList: string[] = [];
  if (user.hobbies) {
    try {
      hobbiesList = JSON.parse(user.hobbies);
    } catch {
      hobbiesList = [];
    }
  }

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* Profile Header */}
      <div className="card p-8 flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left bg-white border border-gray-100 shadow-sm rounded-3xl relative overflow-hidden">
        {/* Subtle decorative background blur */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-50 rounded-full filter blur-3xl opacity-60 -z-10" />

        {/* Avatar */}
        <div className="w-36 h-36 rounded-3xl overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0 shadow-sm flex items-center justify-center">
          {user.profile_image ? (
            <img
              src={user.profile_image}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-5xl font-black font-display">
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-display font-extrabold text-gray-900">{user.name}</h1>
              <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                <Cake className="w-4 h-4 text-rose-500" />
                <span className="text-gray-600 font-semibold">{user.age} Years Old</span>
              </div>
            </div>
            {user.subscription?.plan_type && user.subscription.plan_type !== 'free' && (
              <span className="badge bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 font-bold text-xs rounded-full flex items-center gap-1 shadow-sm">
                <Star className="w-3.5 h-3.5 fill-current" />
                {user.subscription.plan_type.toUpperCase()} MEMBER
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm">
            {user.location && (
              <div className="flex items-center justify-center sm:justify-start gap-2.5 text-gray-500">
                <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="font-semibold text-gray-700">{user.location}</span>
              </div>
            )}
            {user.gender && (
              <div className="flex items-center justify-center sm:justify-start gap-2.5 text-gray-500">
                <Users className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="capitalize font-semibold text-gray-700">{user.gender}</span>
              </div>
            )}
            {user.job && (
              <div className="flex items-center justify-center sm:justify-start gap-2.5 text-gray-500">
                <WorkIcon className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="font-semibold text-gray-700">{user.job}</span>
              </div>
            )}
            {user.salary && (
              <div className="flex items-center justify-center sm:justify-start gap-2.5 text-gray-500">
                <DollarSign className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="font-semibold text-gray-700">{user.salary}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About / Bio */}
      {user.bio && (
        <div className="card p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
          <h2 className="flex items-center gap-2 font-display font-extrabold text-lg text-gray-900 mb-3.5">
            <FileText className="w-5 h-5 text-rose-500" />
            About Me
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line italic p-5 bg-gray-50 border border-gray-100 rounded-2xl">
            "{user.bio}"
          </p>
        </div>
      )}

      {/* Basic Profile Details Section */}
      <div className="card p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
        <h2 className="flex items-center gap-2 font-display font-extrabold text-lg text-gray-900 mb-4">
          <Smile className="w-5 h-5 text-rose-500" />
          Basic & Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-sm">
          {[
            { label: 'Marital Status', value: user.marital_status || '—' },
            { label: 'Religion', value: user.religion?.name || '—' },
            { label: 'Caste', value: user.caste?.name || '—' },
            { label: 'Sub-Caste', value: user.subcaste?.name || '—' },
            { label: 'Mother Tongue', value: user.mother_tongue || '—' },
            { label: 'Community', value: user.community || '—' },
            { label: 'Height', value: user.height || '—' },
            { label: 'Weight', value: user.weight || '—' },
            { label: 'Blood Group', value: user.blood_group || '—' },
            { label: 'Diet Preference', value: user.diet_preference || '—' },
            { label: 'Smoking Habit', value: user.smoking_habit || '—' },
            { label: 'Drinking Habit', value: user.drinking_habit || '—' },
            { label: 'Physical Status', value: user.physical_status || '—' },
            { label: 'Current Residence', value: (user.current_city || user.state || user.country) ? `${user.current_city || ''}, ${user.state || ''}, ${user.country || ''}`.replace(/^, /, '') : '—' },
          ].map((item) => (
            <div key={item.label} className="py-2.5 border-b border-gray-50 flex justify-between">
              <span className="text-gray-400 font-semibold">{item.label}</span>
              <span className="font-bold text-gray-800">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Family Details Section */}
      <div className="card p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
        <h2 className="flex items-center gap-2 font-display font-extrabold text-lg text-gray-900 mb-4">
          <Users className="w-5 h-5 text-rose-500" />
          Family Background
        </h2>
        {user.hide_family_details ? (
          <div className="bg-gray-50 border border-gray-100 text-gray-500 rounded-2xl p-5 flex items-center gap-3 text-sm">
            <Lock className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <span className="font-medium">Family details have been kept private by this member.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-sm">
            {[
              { label: "Father's Name", value: user.father_name || '—' },
              { label: "Father's Occupation", value: user.father_occupation || '—' },
              { label: "Mother's Name", value: user.mother_name || '—' },
              { label: "Mother's Occupation", value: user.mother_occupation || '—' },
              { label: 'Brothers', value: user.brothers_count ?? '0' },
              { label: "Brothers' Marital Status", value: user.brothers_status || '—' },
              { label: 'Sisters', value: user.sisters_count ?? '0' },
              { label: "Sisters' Marital Status", value: user.sisters_status || '—' },
              { label: 'Family Type', value: user.family_type || '—' },
              { label: 'Family Values', value: user.family_values || '—' },
              { label: 'Family Financial Status', value: user.family_financial_status || '—' },
              { label: 'Family Native Place', value: user.family_native_place || '—' },
            ].map((item) => (
              <div key={item.label} className="py-2.5 border-b border-gray-50 flex justify-between">
                <span className="text-gray-400 font-semibold">{item.label}</span>
                <span className="font-bold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Education & Career Section */}
      <div className="card p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
        <h2 className="flex items-center gap-2 font-display font-extrabold text-lg text-gray-900 mb-4">
          <BookOpen className="w-5 h-5 text-rose-500" />
          Education & Career
        </h2>
        {user.hide_education_details ? (
          <div className="bg-gray-50 border border-gray-100 text-gray-500 rounded-2xl p-5 flex items-center gap-3 text-sm">
            <Lock className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <span className="font-medium">Education and career details have been kept private by this member.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-sm">
            {[
              { label: 'Highest Qualification', value: user.highest_qualification || '—' },
              { label: 'College / University', value: user.college_university || '—' },
              { label: 'Field of Study', value: user.field_of_study || '—' },
              { label: 'Designation / Job', value: user.job_designation || user.job || '—' },
              { label: 'Company Name', value: user.company_name || '—' },
              { label: 'Employment Type', value: user.employment_type || '—' },
              { label: 'Annual Income', value: user.annual_income || user.salary || '—' },
              { label: 'Work Location', value: user.work_location || '—' },
              { label: 'Years of Experience', value: user.years_of_experience ? `${user.years_of_experience} Years` : '—' },
            ].map((item) => (
              <div key={item.label} className="py-2.5 border-b border-gray-50 flex justify-between">
                <span className="text-gray-400 font-semibold">{item.label}</span>
                <span className="font-bold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hobbies & interests */}
      <div className="card p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
        <h2 className="flex items-center gap-2 font-display font-extrabold text-lg text-gray-900 mb-4">
          <HeartHandshake className="w-5 h-5 text-rose-500" />
          Hobbies & Interests
        </h2>
        {user.hide_hobbies ? (
          <div className="bg-gray-50 border border-gray-100 text-gray-500 rounded-2xl p-5 flex items-center gap-3 text-sm">
            <Lock className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <span className="font-medium">Hobbies have been kept private by this member.</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5 pt-1">
            {hobbiesList.length > 0 ? (
              hobbiesList.map((hobby) => (
                <span key={hobby} className="badge bg-rose-50 text-rose-600 border border-rose-100 font-bold px-3.5 py-1.5 rounded-full text-xs shadow-sm">
                  {hobby}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-400">No hobbies declared by this member.</p>
            )}
          </div>
        )}
      </div>

      {/* Partner Preferences */}
      <div className="card p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
        <h2 className="flex items-center gap-2 font-display font-extrabold text-lg text-gray-900 mb-4">
          <Heart className="w-5 h-5 text-rose-500" />
          Partner Preferences
        </h2>
        {user.hide_partner_preferences ? (
          <div className="bg-gray-50 border border-gray-100 text-gray-500 rounded-2xl p-5 flex items-center gap-3 text-sm">
            <Lock className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <span className="font-medium">Partner preferences have been kept private by this member.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-sm">
            {[
              { label: 'Preferred Age Range', value: (user.partner_age_min || user.partner_age_max) ? `${user.partner_age_min || '—'} to ${user.partner_age_max || '—'} Years` : '—' },
              { label: 'Preferred Height Range', value: (user.partner_height_min || user.partner_height_max) ? `${user.partner_height_min || '—'} to ${user.partner_height_max || '—'}` : '—' },
              { label: 'Marital Status', value: user.partner_marital_status || '—' },
              { label: 'Religion', value: user.partner_religion || '—' },
              { label: 'Caste', value: user.partner_caste || '—' },
              { label: 'Education', value: user.partner_education || '—' },
              { label: 'Occupation', value: user.partner_occupation || '—' },
              { label: 'Annual Income', value: user.partner_income || '—' },
              { label: 'Preferred Location', value: user.partner_location || '—' },
              { label: 'Diet Preference', value: user.partner_diet || '—' },
              { label: 'Smoking Preference', value: user.partner_smoking || '—' },
              { label: 'Drinking Preference', value: user.partner_drinking || '—' },
            ].map((item) => (
              <div key={item.label} className="py-2.5 border-b border-gray-50 flex justify-between">
                <span className="text-gray-400 font-semibold">{item.label}</span>
                <span className="font-bold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact information card */}
      <div className="card p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
        <h2 className="flex items-center gap-2 font-display font-extrabold text-lg text-gray-900 mb-4">
          <Star className="w-5 h-5 text-rose-500" />
          Contact Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* EMAIL */}
          <div
            className={`p-5 rounded-2xl flex flex-col justify-between min-h-[96px] transition-all border ${
              viewerIsPremium 
                ? 'bg-gray-50 border-gray-200' 
                : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5'
            }`}
            onClick={() => !viewerIsPremium && setShowUpgradeModal(true)}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email Address</span>
              {!viewerIsPremium && <Lock className="w-4 h-4 text-amber-600" />}
            </div>
            
            <p className={`text-base font-bold text-gray-900 mt-2 truncate ${!viewerIsPremium ? 'blur-[3px] select-none text-gray-400' : ''}`}>
              {user.email}
            </p>
            
            {!viewerIsPremium && (
              <span className="text-amber-700 text-xs font-semibold flex items-center gap-1 mt-2">
                <Crown className="w-3.5 h-3.5 fill-current text-amber-500" /> Upgrade to view full email
              </span>
            )}
          </div>

          {/* PHONE */}
          <div
            className={`p-5 rounded-2xl flex flex-col justify-between min-h-[96px] transition-all border ${
              viewerIsPremium 
                ? 'bg-gray-50 border-gray-200' 
                : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5'
            }`}
            onClick={() => !viewerIsPremium && setShowUpgradeModal(true)}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Mobile Number</span>
              {!viewerIsPremium && <Lock className="w-4 h-4 text-amber-600" />}
            </div>
            
            <p className={`text-base font-bold text-gray-900 mt-2 truncate ${!viewerIsPremium ? 'blur-[3px] select-none text-gray-400' : ''}`}>
              {user.phone || 'Not provided'}
            </p>
            
            {!viewerIsPremium && (
              <span className="text-amber-700 text-xs font-semibold flex items-center gap-1 mt-2">
                <Crown className="w-3.5 h-3.5 fill-current text-amber-500" /> Upgrade to view full number
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer Sticky */}
      <div className="flex gap-4 sticky bottom-6 z-40 bg-white/80 backdrop-blur-md p-4 border border-gray-100 rounded-3xl shadow-lg">
        <button
          onClick={handleInterest}
          disabled={sending || liked}
          className={`flex-1 font-bold text-sm py-4.5 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm border ${
            liked 
              ? 'bg-rose-100 text-rose-700 border-rose-200' 
              : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 hover:shadow-rose-200'
          } disabled:opacity-65`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          {sending ? 'Sending...' : liked ? 'Interest Sent' : 'Express Interest'}
        </button>

        <button
          onClick={() => {
            if (!currentUserId) {
              toast.error('Please log in to send messages');
              return;
            }
            setShowMessageModal(true);
          }}
          className="flex-1 bg-gray-950 hover:bg-gray-800 text-white font-bold text-sm py-4 rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2 border border-gray-950"
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

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <LoginPromptModal
          redirectPath={`/profile-cardDetails/${id}?express-interest=true`}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}

      {/* Premium Upgrade Modal */}
      {showUpgradeModal && (
        <PremiumUpgradeModal onClose={handleUpgradeModalClose} />
      )}
    </div>
  );
}