'use client';
// app/(dashboard)/profile/page.tsx
import { useEffect, useState, useRef } from 'react';
import {
  User, MapPin, Briefcase, Edit3, Save, X, Camera,
  Heart, Eye, Star, Phone, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProfile, updateProfile, uploadProfileImage } from '@/store/slices/userSlice';
import { fetchSubscription } from '@/store/slices/subscriptionSlice';
import type { Religion, Caste, SubCaste } from '@/types';
import Link from 'next/link';
import ProfilePhotoManager from '@/components/profile/ProfilePhotoManager';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector((s) => s.user);
  const { subscription } = useAppSelector((s) => s.subscription);
  const [editing, setEditing] = useState(false);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [castes, setCastes] = useState<Caste[]>([]);
  const [subcastes, setSubcastes] = useState<SubCaste[]>([]);
  const [whoViewedMe, setWhoViewedMe] = useState<number>(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '', phone: '', age: '', location: '', job: '',
    salary: '', bio: '', religion_id: '', caste_id: '', subcaste_id: '',
  });

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchSubscription());
    fetchViewers();
    fetch('/api/religions').then(r => r.json()).then(d => { if (d.success) setReligions(d.data); });
  }, [dispatch]);

  async function fetchViewers() {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/profile-views', { headers: { Authorization: `Bearer ${token}` } });
    const d = await res.json();
    if (d.success) setWhoViewedMe(d.data.length);
  }

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        phone: profile.phone || '',
        age: String(profile.age) || '',
        location: profile.location || '',
        job: profile.job || '',
        salary: profile.salary || '',
        bio: profile.bio || '',
        religion_id: String(profile.religion_id) || '',
        caste_id: String(profile.caste_id) || '',
        subcaste_id: profile.subcaste_id ? String(profile.subcaste_id) : '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (form.religion_id) {
      fetch(`/api/castes?religion_id=${form.religion_id}`).then(r => r.json()).then(d => {
        if (d.success) setCastes(d.data);
      });
    }
  }, [form.religion_id]);

  useEffect(() => {
    if (form.caste_id) {
      fetch(`/api/subcastes?caste_id=${form.caste_id}`).then(r => r.json()).then(d => {
        if (d.success) setSubcastes(d.data);
      });
    }
  }, [form.caste_id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    const result = await dispatch(updateProfile({
      name: form.name,
      phone: form.phone,
      age: parseInt(form.age),
      location: form.location,
      job: form.job,
      salary: form.salary,
      bio: form.bio,
      religion_id: parseInt(form.religion_id),
      caste_id: parseInt(form.caste_id),
      subcaste_id: form.subcaste_id ? parseInt(form.subcaste_id) : undefined,
    }));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated!');
      setEditing(false);
    } else {
      toast.error('Failed to update profile');
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profile_image', file);
    const result = await dispatch(uploadProfileImage(formData));
    if (uploadProfileImage.fulfilled.match(result)) {
      toast.success('Profile photo updated!');
      dispatch(fetchProfile());
    } else {
      toast.error('Upload failed');
    }
  }

  const planColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-600',
    standard: 'bg-blue-100 text-blue-700',
    pro: 'bg-rose-100 text-rose-700',
    elite: 'bg-amber-100 text-amber-700',
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="card overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-premium-gradient relative">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
          />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="relative -mt-14 mb-4 w-fit">
            <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-premium-gradient flex items-center justify-center">
              {profile?.profile_image ? (
                <img src={profile.profile_image} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-display font-bold text-white">
                  {profile?.name?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-rose-600 rounded-full flex items-center justify-center shadow-md hover:bg-rose-700 transition-colors"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">{profile?.name}</h1>
              <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" /> {profile?.location}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`badge ${planColors[subscription?.plan_type || 'free']}`}>
                  <Star className="w-3 h-3 mr-1" />
                  {(subscription?.plan_type || 'free').toUpperCase()} PLAN
                </span>
                <span className="badge bg-gray-100 text-gray-600">{profile?.age} yrs</span>
                <span className="badge bg-purple-100 text-purple-700 capitalize">{profile?.gender}</span>
              </div>
            </div>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              className={editing ? 'btn-primary text-sm py-2' : 'btn-secondary text-sm py-2'}
            >
              {editing ? <><Save className="w-4 h-4 inline mr-1.5" />Save</> : <><Edit3 className="w-4 h-4 inline mr-1.5" />Edit</>}
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Profile Views', value: whoViewedMe, icon: Eye, color: 'text-blue-600 bg-blue-50' },
          { label: 'Contacts Left', value: (subscription?.contact_limit || 0) - (subscription?.contacts_used || 0), icon: Phone, color: 'text-rose-600 bg-rose-50' },
          { label: 'Interests', value: '—', icon: Heart, color: 'text-pink-600 bg-pink-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5 text-center">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-display font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Profile details / edit form */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-lg text-gray-900 mb-5">Profile Information</h2>

        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input-field text-sm" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="input-field text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Age</label>
                <input type="number" name="age" value={form.age} onChange={handleChange} className="input-field text-sm" />
              </div>
              <div>
                <label className="label">Location</label>
                <input name="location" value={form.location} onChange={handleChange} className="input-field text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Occupation</label>
                <input name="job" value={form.job} onChange={handleChange} className="input-field text-sm" />
              </div>
              <div>
                <label className="label">Annual Income</label>
                <input name="salary" value={form.salary} onChange={handleChange} className="input-field text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Religion</label>
                <select name="religion_id" value={form.religion_id} onChange={handleChange} className="select-field text-sm">
                  <option value="">Select</option>
                  {religions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Caste</label>
                <select name="caste_id" value={form.caste_id} onChange={handleChange} className="select-field text-sm" disabled={!form.religion_id}>
                  <option value="">Select</option>
                  {castes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Sub-caste</label>
                <select name="subcaste_id" value={form.subcaste_id} onChange={handleChange} className="select-field text-sm" disabled={!form.caste_id}>
                  <option value="">Select</option>
                  {subcastes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} placeholder="Tell potential matches about yourself..." className="input-field text-sm resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={loading} className="btn-primary text-sm py-2.5 px-8">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditing(false)} className="btn-ghost text-sm flex items-center gap-1.5">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {[
              { label: 'Email', value: profile?.email },
              { label: 'Phone', value: profile?.phone || '—' },
              { label: 'Age', value: `${profile?.age} years` },
              { label: 'Location', value: profile?.location },
              { label: 'Occupation', value: profile?.job || '—' },
              { label: 'Annual Income', value: profile?.salary || '—' },
              { label: 'Religion', value: (profile as unknown as Record<string, { name: string }>)?.religion?.name || '—' },
              { label: 'Caste', value: (profile as unknown as Record<string, { name: string }>)?.caste?.name || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="py-2 border-b border-gray-50">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-800">{value}</p>
              </div>
            ))}
            {profile?.bio && (
              <div className="col-span-2 py-2 border-b border-gray-50">
                <p className="text-xs text-gray-400 mb-1">Bio</p>
                <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Photos Manager */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-lg text-gray-900 mb-5">Profile Photos</h2>
        <ProfilePhotoManager />
      </div>

      {/* Upgrade nudge if free plan */}
      {subscription?.plan_type === 'free' && (
        <Link href="/subscription" className="card p-5 flex items-center justify-between hover:shadow-card-hover transition-all group">
          <div>
            <h3 className="font-display font-semibold text-gray-900">Upgrade to unlock contacts</h3>
            <p className="text-sm text-gray-500 mt-0.5">View phone numbers of potential matches</p>
          </div>
          <div className="flex items-center gap-2 text-rose-600 font-medium text-sm group-hover:gap-3 transition-all">
            View Plans <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      )}
    </div>
  );
}
