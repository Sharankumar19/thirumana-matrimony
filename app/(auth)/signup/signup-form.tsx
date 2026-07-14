'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User as UserIcon, Mail, Lock, Phone, MapPin, Briefcase, Eye, EyeOff, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signupUser, clearError } from '@/store/slices/authSlice';
import { getRedirectPath, INTEREST_LOGIN_MESSAGE } from '@/utils/redirect';
import type { Religion, Caste, SubCaste } from '@/types';

export default function SignupForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = getRedirectPath(searchParams, '/profile');
  const showInterestMessage = searchParams.get('reason') === 'interest';
  const { loading, error, isAuthenticated } = useAppSelector((s) => s.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [castes, setCastes] = useState<Caste[]>([]);
  const [subcastes, setSubcastes] = useState<SubCaste[]>([]);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    age: '', gender: '',
    religion_id: '', caste_id: '', subcaste_id: '',
    location: '', job: '', salary: '', bio: '',
  });

  useEffect(() => {
    if (isAuthenticated) router.replace(redirectPath);
  }, [isAuthenticated, router, redirectPath]);

  useEffect(() => {
    if (error) { 
      toast.error(error); 
      dispatch(clearError()); 
    }
  }, [error, dispatch]);

  useEffect(() => {
    fetch('/api/religions').then(r => r.json()).then(d => { if (d.success) setReligions(d.data); });
  }, []);

  useEffect(() => {
    if (form.religion_id) {
      fetch(`/api/castes?religion_id=${form.religion_id}`).then(r => r.json()).then(d => {
        if (d.success) setCastes(d.data);
      });
      setForm(f => ({ ...f, caste_id: '', subcaste_id: '' }));
      setSubcastes([]);
    }
  }, [form.religion_id]);

  useEffect(() => {
    if (form.caste_id) {
      fetch(`/api/subcastes?caste_id=${form.caste_id}`).then(r => r.json()).then(d => {
        if (d.success) setSubcastes(d.data);
      });
      setForm(f => ({ ...f, subcaste_id: '' }));
    }
  }, [form.caste_id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function validateStep1() {
    if (!form.name.trim()) return 'Full name is required';
    if (!form.email.trim()) return 'Email is required';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (!form.phone.trim()) return 'Phone number is required';
    return null;
  }

  function validateStep2() {
    if (!form.age || parseInt(form.age) < 18) return 'Age must be 18 or above';
    if (!form.gender) return 'Please select your gender';
    if (!form.religion_id) return 'Please select your religion';
    if (!form.caste_id) return 'Please select your caste';
    if (!form.location.trim()) return 'Location is required';
    return null;
  }

  function goNext() {
    const err = validateStep1();
    if (err) { toast.error(err); return; }
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateStep2();
    if (err) { toast.error(err); return; }

    const result = await dispatch(signupUser({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      age: parseInt(form.age),
      gender: form.gender as 'male' | 'female' | 'other',
      religion_id: parseInt(form.religion_id),
      caste_id: parseInt(form.caste_id),
      subcaste_id: form.subcaste_id ? parseInt(form.subcaste_id) : undefined,
      location: form.location,
    }));

    if (signupUser.fulfilled.match(result)) {
      toast.success('Account created! Welcome to Thirumana Matrimony 🎉');
      router.push(redirectPath);
    }
  }

  const loginUrl = `/login?redirect=${encodeURIComponent(redirectPath)}${showInterestMessage ? '&reason=interest' : ''}`;

  const inputClass = 'input-field text-sm';
  const selectClass = 'select-field text-sm';

  return (
    <div className="w-full max-w-lg">
      <div className="card p-8 animate-fade-up">
        {showInterestMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex gap-3">
            <Heart className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-rose-800">{INTEREST_LOGIN_MESSAGE}</p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-1">Create Account</h1>
          <p className="text-gray-500 text-sm">Begin your journey to finding your life partner</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-7">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${step >= s ? 'bg-rose-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {s}
              </div>
              <span className={`text-xs font-medium ${step >= s ? 'text-rose-600' : 'text-gray-400'}`}>
                {s === 1 ? 'Personal Info' : 'Profile Details'}
              </span>
              {s < 2 && <div className={`h-px flex-1 transition-all ${step > s ? 'bg-rose-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <label htmlFor="name" className="label">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                  <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className={`${inputClass} pl-10`} required />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                  <input id="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={`${inputClass} pl-10`} required />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password" value={form.password} onChange={handleChange}
                    placeholder="Min. 6 characters" className={`${inputClass} pl-10 pr-10`} required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="label">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                  <input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" className={`${inputClass} pl-10`} required />
                </div>
              </div>
              <button type="button" onClick={goNext} className="btn-primary w-full py-3.5">
                Continue →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="age" className="label">Age</label>
                  <input id="age" type="number" name="age" min={18} max={70} value={form.age} onChange={handleChange} placeholder="25" className={inputClass} required />
                </div>
                <div>
                  <label htmlFor="gender" className="label">Gender</label>
                  <select id="gender" name="gender" value={form.gender} onChange={handleChange} className={selectClass} required>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="religion_id" className="label">Religion</label>
                <select id="religion_id" name="religion_id" value={form.religion_id} onChange={handleChange} className={selectClass} required>
                  <option value="">Select religion</option>
                  {religions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="caste_id" className="label">Caste</label>
                  <select id="caste_id" name="caste_id" value={form.caste_id} onChange={handleChange} className={selectClass} disabled={!form.religion_id} required>
                    <option value="">Select caste</option>
                    {castes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="subcaste_id" className="label">Sub-caste <span className="text-gray-400">(optional)</span></label>
                  <select id="subcaste_id" name="subcaste_id" value={form.subcaste_id} onChange={handleChange} className={selectClass} disabled={!form.caste_id}>
                    <option value="">Select</option>
                    {subcastes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="location" className="label">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                  <input id="location" name="location" value={form.location} onChange={handleChange} placeholder="City, State" className={`${inputClass} pl-10`} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="job" className="label">Occupation <span className="text-gray-400">(optional)</span></label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                    <input id="job" name="job" value={form.job} onChange={handleChange} placeholder="Software Engineer" className={`${inputClass} pl-10`} />
                  </div>
                </div>
                <div>
                  <label htmlFor="salary" className="label">Annual Income <span className="text-gray-400">(optional)</span></label>
                  <input id="salary" name="salary" value={form.salary} onChange={handleChange} placeholder="₹5-10 LPA" className={inputClass} />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3 text-sm">
                  ← Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-2 py-3 px-8 text-sm">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                      Creating...
                    </span>
                  ) : 'Create Account 🎉'}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link href={loginUrl} className="font-semibold text-rose-600 hover:text-rose-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
