'use client';

import { useEffect, useState, useRef } from 'react';
import {
  User, MapPin, Briefcase, Edit3, Save, X, Camera,
  Heart, Eye, Star, Phone, ChevronRight, BookOpen, Users,
  Settings, Award, HeartHandshake, Smile, CheckCircle, Info, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProfile, updateProfile, uploadProfileImage } from '@/store/slices/userSlice';
import { fetchSubscription } from '@/store/slices/subscriptionSlice';
import type { Religion, Caste, SubCaste } from '@/types';
import Link from 'next/link';
import ProfilePhotoManager from '@/components/profile/ProfilePhotoManager';

const HOBBY_LIST = [
  'Singing', 'Dancing', 'Music', 'Reading', 'Traveling', 'Cooking', 'Photography',
  'Gardening', 'Fitness', 'Yoga', 'Sports', 'Movies', 'Drawing', 'Painting',
  'Writing', 'Gaming', 'Volunteering', 'Hiking', 'Cycling', 'Pets', 'Spiritual Activities'
];

function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector((s) => s.user);
  const { subscription } = useAppSelector((s) => s.subscription);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'family' | 'education' | 'hobbies' | 'privacy'>('basic');
  
  const [religions, setReligions] = useState<Religion[]>([]);
  const [castes, setCastes] = useState<Caste[]>([]);
  const [subcastes, setSubcastes] = useState<SubCaste[]>([]);
  const [whoViewedMe, setWhoViewedMe] = useState<number>(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Form State
  const [form, setForm] = useState({
    name: '', phone: '', age: '', location: '', job: '',
    salary: '', bio: '', religion_id: '', caste_id: '', subcaste_id: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    
    // Basic Info
    date_of_birth: '', marital_status: '', mother_tongue: '', community: '',
    height: '', weight: '', blood_group: '', diet_preference: '',
    smoking_habit: '', drinking_habit: '', physical_status: '',
    current_city: '', state: '', country: '',

    // Family Details
    father_name: '', father_occupation: '', mother_name: '', mother_occupation: '',
    brothers_count: '0', brothers_status: '', sisters_count: '0', sisters_status: '',
    family_type: '', family_values: '', family_financial_status: '', family_native_place: '',

    // Education & Career
    highest_qualification: '', college_university: '', field_of_study: '',
    company_name: '', job_designation: '', employment_type: '',
    annual_income: '', work_location: '', years_of_experience: '',

    // Hobbies
    selectedHobbies: [] as string[],
    otherHobby: '',

    // Partner Preferences
    partner_age_min: '', partner_age_max: '',
    partner_height_min: '', partner_height_max: '',
    partner_marital_status: '', partner_religion: '', partner_caste: '',
    partner_education: '', partner_occupation: '', partner_income: '',
    partner_location: '', partner_diet: '', partner_smoking: '', partner_drinking: '',

    // Privacy
    showFamily: true,
    showEducation: true,
    showHobbies: true,
    showPreferences: true,
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

  // Populate form from profile data
  useEffect(() => {
    if (profile) {
      // Decode hobbies
      let parsedHobbies: string[] = [];
      let parsedOther = '';
      if (profile.hobbies) {
        try {
          const list = JSON.parse(profile.hobbies);
          if (Array.isArray(list)) {
            parsedHobbies = list.filter(h => HOBBY_LIST.includes(h));
            const otherVal = list.find(h => !HOBBY_LIST.includes(h));
            if (otherVal) {
              parsedHobbies.push('Other');
              parsedOther = otherVal;
            }
          }
        } catch {
          // Fallback if hobbies is stored as string
          parsedHobbies = [];
        }
      }

      // Decode privacy settings
      let privSettings = { showFamily: true, showEducation: true, showHobbies: true, showPreferences: true };
      if (profile.privacy_settings) {
        try {
          privSettings = { ...privSettings, ...JSON.parse(profile.privacy_settings) };
        } catch {
          // fallback
        }
      }

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
        gender: profile.gender || '',

        // Basic Info
        date_of_birth: profile.date_of_birth ? String(profile.date_of_birth).split('T')[0] : '',
        marital_status: profile.marital_status || '',
        mother_tongue: profile.mother_tongue || '',
        community: profile.community || '',
        height: profile.height || '',
        weight: profile.weight || '',
        blood_group: profile.blood_group || '',
        diet_preference: profile.diet_preference || '',
        smoking_habit: profile.smoking_habit || '',
        drinking_habit: profile.drinking_habit || '',
        physical_status: profile.physical_status || 'Normal',
        current_city: profile.current_city || '',
        state: profile.state || '',
        country: profile.country || '',

        // Family Details
        father_name: profile.father_name || '',
        father_occupation: profile.father_occupation || '',
        mother_name: profile.mother_name || '',
        mother_occupation: profile.mother_occupation || '',
        brothers_count: String(profile.brothers_count ?? 0),
        brothers_status: profile.brothers_status || '',
        sisters_count: String(profile.sisters_count ?? 0),
        sisters_status: profile.sisters_status || '',
        family_type: profile.family_type || '',
        family_values: profile.family_values || '',
        family_financial_status: profile.family_financial_status || '',
        family_native_place: profile.family_native_place || '',

        // Education & Career
        highest_qualification: profile.highest_qualification || '',
        college_university: profile.college_university || '',
        field_of_study: profile.field_of_study || '',
        company_name: profile.company_name || '',
        job_designation: profile.job_designation || '',
        employment_type: profile.employment_type || '',
        annual_income: profile.annual_income || '',
        work_location: profile.work_location || '',
        years_of_experience: profile.years_of_experience ? String(profile.years_of_experience) : '',

        // Hobbies
        selectedHobbies: parsedHobbies,
        otherHobby: parsedOther,

        // Partner Preferences
        partner_age_min: profile.partner_age_min ? String(profile.partner_age_min) : '',
        partner_age_max: profile.partner_age_max ? String(profile.partner_age_max) : '',
        partner_height_min: profile.partner_height_min || '',
        partner_height_max: profile.partner_height_max || '',
        partner_marital_status: profile.partner_marital_status || '',
        partner_religion: profile.partner_religion || '',
        partner_caste: profile.partner_caste || '',
        partner_education: profile.partner_education || '',
        partner_occupation: profile.partner_occupation || '',
        partner_income: profile.partner_income || '',
        partner_location: profile.partner_location || '',
        partner_diet: profile.partner_diet || '',
        partner_smoking: profile.partner_smoking || '',
        partner_drinking: profile.partner_drinking || '',

        // Privacy
        showFamily: privSettings.showFamily,
        showEducation: privSettings.showEducation,
        showHobbies: privSettings.showHobbies,
        showPreferences: privSettings.showPreferences,
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
    const { name, value } = e.target;
    setForm(f => {
      const updated = { ...f, [name]: value };
      
      // Auto calculate age if DOB changes
      if (name === 'date_of_birth' && value) {
        const calculatedAge = calculateAge(value);
        updated.age = String(calculatedAge);
      }
      
      return updated;
    });
  }

  function handlePrivacyChange(name: 'showFamily' | 'showEducation' | 'showHobbies' | 'showPreferences') {
    setForm(f => ({ ...f, [name]: !f[name] }));
  }

  function handleHobbyToggle(hobby: string) {
    setForm(f => {
      const selected = [...f.selectedHobbies];
      if (selected.includes(hobby)) {
        return { ...f, selectedHobbies: selected.filter(h => h !== hobby) };
      } else {
        return { ...f, selectedHobbies: [...selected, hobby] };
      }
    });
  }

  async function handleSave() {
    // Stringify hobbies list
    const finalHobbiesList = [...form.selectedHobbies];
    if (finalHobbiesList.includes('Other')) {
      // replace 'Other' placeholder with actual other text
      const filtered = finalHobbiesList.filter(h => h !== 'Other');
      if (form.otherHobby.trim()) {
        filtered.push(form.otherHobby.trim());
      }
      finalHobbiesList.splice(0, finalHobbiesList.length, ...filtered);
    }
    const hobbiesJson = JSON.stringify(finalHobbiesList);

    // Stringify privacy settings
    const privacyJson = JSON.stringify({
      showFamily: form.showFamily,
      showEducation: form.showEducation,
      showHobbies: form.showHobbies,
      showPreferences: form.showPreferences,
    });

    const result = await dispatch(updateProfile({
      name: form.name,
      phone: form.phone,
      age: parseInt(form.age) || 0,
      location: form.location,
      job: form.job,
      salary: form.salary,
      bio: form.bio,
      religion_id: parseInt(form.religion_id),
      caste_id: parseInt(form.caste_id),
      subcaste_id: form.subcaste_id ? parseInt(form.subcaste_id) : undefined,
      gender: form.gender as any,

      // Basic Information
      date_of_birth: form.date_of_birth || undefined,
      marital_status: form.marital_status || undefined,
      mother_tongue: form.mother_tongue || undefined,
      community: form.community || undefined,
      height: form.height || undefined,
      weight: form.weight || undefined,
      blood_group: form.blood_group || undefined,
      diet_preference: form.diet_preference || undefined,
      smoking_habit: form.smoking_habit || undefined,
      drinking_habit: form.drinking_habit || undefined,
      physical_status: form.physical_status || undefined,
      current_city: form.current_city || undefined,
      state: form.state || undefined,
      country: form.country || undefined,

      // Family Details
      father_name: form.father_name || undefined,
      father_occupation: form.father_occupation || undefined,
      mother_name: form.mother_name || undefined,
      mother_occupation: form.mother_occupation || undefined,
      brothers_count: parseInt(form.brothers_count) || 0,
      brothers_status: form.brothers_status || undefined,
      sisters_count: parseInt(form.sisters_count) || 0,
      sisters_status: form.sisters_status || undefined,
      family_type: form.family_type || undefined,
      family_values: form.family_values || undefined,
      family_financial_status: form.family_financial_status || undefined,
      family_native_place: form.family_native_place || undefined,

      // Education & Career
      highest_qualification: form.highest_qualification || undefined,
      college_university: form.college_university || undefined,
      field_of_study: form.field_of_study || undefined,
      company_name: form.company_name || undefined,
      job_designation: form.job_designation || undefined,
      employment_type: form.employment_type || undefined,
      annual_income: form.annual_income || undefined,
      work_location: form.work_location || undefined,
      years_of_experience: form.years_of_experience ? parseInt(form.years_of_experience) : undefined,

      // Hobbies & Interests
      hobbies: hobbiesJson,

      // Partner Preferences
      partner_age_min: form.partner_age_min ? parseInt(form.partner_age_min) : undefined,
      partner_age_max: form.partner_age_max ? parseInt(form.partner_age_max) : undefined,
      partner_height_min: form.partner_height_min || undefined,
      partner_height_max: form.partner_height_max || undefined,
      partner_marital_status: form.partner_marital_status || undefined,
      partner_religion: form.partner_religion || undefined,
      partner_caste: form.partner_caste || undefined,
      partner_education: form.partner_education || undefined,
      partner_occupation: form.partner_occupation || undefined,
      partner_income: form.partner_income || undefined,
      partner_location: form.partner_location || undefined,
      partner_diet: form.partner_diet || undefined,
      partner_smoking: form.partner_smoking || undefined,
      partner_drinking: form.partner_drinking || undefined,

      // Privacy Settings
      privacy_settings: privacyJson,
    }));

    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully!');
      setEditing(false);
      dispatch(fetchProfile());
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
    free: 'bg-gray-100 text-gray-600 border-gray-300',
    premium: 'bg-amber-100 text-amber-700 border-amber-300',
    standard: 'bg-blue-100 text-blue-700 border-blue-300',
    pro: 'bg-rose-100 text-rose-700 border-rose-300',
    elite: 'bg-purple-100 text-purple-700 border-purple-300',
  };

  const activePlan = subscription?.plan_type || 'free';
  const isPremiumPlan = activePlan !== 'free';

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Profile Summary */}
      <div className="card overflow-hidden border border-gray-100 shadow-sm bg-white rounded-3xl">
        <div className="h-36 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 relative">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />
        </div>
        <div className="px-8 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-16">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            <div className="relative w-32 h-32">
              <div className="w-full h-full rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center">
                {profile?.profile_image ? (
                  <img src={profile.profile_image} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-display font-black text-rose-500">
                    {profile?.name?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-9 h-9 bg-rose-600 rounded-2xl flex items-center justify-center shadow-lg hover:bg-rose-700 transition-colors border-2 border-white"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
            
            <div className="pb-2 space-y-1">
              <h1 className="text-3xl font-display font-extrabold text-gray-900">{profile?.name}</h1>
              <p className="text-gray-500 text-sm flex items-center justify-center md:justify-start gap-1 font-medium">
                <MapPin className="w-4 h-4 text-rose-500" /> {profile?.location || 'Location not set'}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
                <span className={`badge border font-bold px-3 py-1 rounded-full ${planColors[activePlan]}`}>
                  <Star className="w-3.5 h-3.5 mr-1 fill-current" />
                  {activePlan.toUpperCase()} PLAN
                </span>
                <span className="badge bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-full">{profile?.age} Years</span>
                <span className="badge bg-purple-50 text-purple-700 border border-purple-100 capitalize px-3 py-1 rounded-full">{profile?.gender}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className={`px-6 py-3 rounded-2xl font-bold transition-all duration-200 flex items-center gap-2 shadow-sm border ${
              editing 
                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 hover:shadow-rose-100'
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:shadow-gray-100'
            }`}
          >
            {editing ? (
              <><Save className="w-4 h-4" /> Save changes</>
            ) : (
              <><Edit3 className="w-4 h-4" /> Edit Profile</>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Profile Views', value: whoViewedMe, icon: Eye, color: 'text-blue-600 bg-blue-50 border-blue-100' },
          { label: 'Contacts Unlocked', value: `${subscription?.contacts_used || 0} / ${subscription?.contact_limit || 0}`, icon: Phone, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { label: 'Active Plan Price', value: isPremiumPlan ? '₹199' : '₹0', icon: Star, color: 'text-amber-600 bg-amber-50 border-amber-100' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`card p-5 rounded-2xl bg-white border flex items-center gap-4 ${color.split(' ')[2]}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.split(' ')[0]} ${color.split(' ')[1]}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-display font-black text-gray-900">{value}</div>
              <div className="text-xs text-gray-400 font-semibold tracking-wider uppercase mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 scrollbar-none">
        {[
          { id: 'basic', label: 'Basic Info & About', icon: User },
          { id: 'family', label: 'Family Details', icon: Users },
          { id: 'education', label: 'Education & Career', icon: BookOpen },
          { id: 'hobbies', label: 'Hobbies & Preferences', icon: HeartHandshake },
          { id: 'privacy', label: 'Privacy & Subscription', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 py-3.5 px-5 font-bold text-sm whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Details Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        
        {/* ================= TAB 1: BASIC INFO & ABOUT ================= */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-display text-gray-900 border-b pb-3 flex items-center gap-2">
              <Smile className="text-rose-500 w-5 h-5" /> Basic Information
            </h3>
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="form-name" className="label">Full Name</label>
                  <input id="form-name" name="name" value={form.name} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label htmlFor="form-phone" className="label">Phone Number</label>
                  <input id="form-phone" name="phone" value={form.phone} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label htmlFor="form-date-of-birth" className="label">Date of Birth</label>
                  <input id="form-date-of-birth" type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label htmlFor="form-age" className="label">Age (calculated)</label>
                  <input id="form-age" name="age" value={form.age} disabled className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" />
                </div>
                <div>
                  <label htmlFor="form-gender" className="label">Gender</label>
                  <select id="form-gender" name="gender" value={form.gender} onChange={handleChange} className="select-field">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="form-marital-status" className="label">Marital Status</label>
                  <select id="form-marital-status" name="marital_status" value={form.marital_status} onChange={handleChange} className="select-field">
                    <option value="">Select</option>
                    <option value="Never Married">Never Married</option>
                    <option value="Awaiting Divorce">Awaiting Divorce</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="form-religion-id" className="label">Religion</label>
                  <select id="form-religion-id" name="religion_id" value={form.religion_id} onChange={handleChange} className="select-field">
                    <option value="">Select</option>
                    {religions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="form-caste-id" className="label">Caste (Optional)</label>
                  <select id="form-caste-id" name="caste_id" value={form.caste_id} onChange={handleChange} className="select-field" disabled={!form.religion_id}>
                    <option value="">Select</option>
                    {castes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="form-subcaste-id" className="label">Sub-Caste (Optional)</label>
                  <select id="form-subcaste-id" name="subcaste_id" value={form.subcaste_id} onChange={handleChange} className="select-field" disabled={!form.caste_id}>
                    <option value="">Select</option>
                    {subcastes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="form-mother-tongue" className="label">Mother Tongue</label>
                  <input id="form-mother-tongue" name="mother_tongue" value={form.mother_tongue} onChange={handleChange} className="input-field" placeholder="e.g. Tamil, English" />
                </div>
                <div>
                  <label htmlFor="form-community" className="label">Community (Optional)</label>
                  <input id="form-community" name="community" value={form.community} onChange={handleChange} className="input-field" placeholder="e.g. Kongu, Pillai" />
                </div>
                <div>
                  <label htmlFor="form-height" className="label">Height</label>
                  <input id="form-height" name="height" value={form.height} onChange={handleChange} className="input-field" placeholder="e.g. 5 ft 6 in (168 cm)" />
                </div>
                <div>
                  <label htmlFor="form-weight" className="label">Weight (Optional)</label>
                  <input id="form-weight" name="weight" value={form.weight} onChange={handleChange} className="input-field" placeholder="e.g. 68 kg" />
                </div>
                <div>
                  <label htmlFor="form-blood-group" className="label">Blood Group (Optional)</label>
                  <select id="form-blood-group" name="blood_group" value={form.blood_group} onChange={handleChange} className="select-field">
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="form-diet-preference" className="label">Diet Preference</label>
                  <select id="form-diet-preference" name="diet_preference" value={form.diet_preference} onChange={handleChange} className="select-field">
                    <option value="">Select</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Eggetarian">Eggetarian</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="form-smoking-habit" className="label">Smoking Habit</label>
                  <select id="form-smoking-habit" name="smoking_habit" value={form.smoking_habit} onChange={handleChange} className="select-field">
                    <option value="">Select</option>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="Occasionally">Occasionally</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="form-drinking-habit" className="label">Drinking Habit</label>
                  <select id="form-drinking-habit" name="drinking_habit" value={form.drinking_habit} onChange={handleChange} className="select-field">
                    <option value="">Select</option>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="Occasionally">Occasionally</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="form-physical-status" className="label">Physical Status</label>
                  <select id="form-physical-status" name="physical_status" value={form.physical_status} onChange={handleChange} className="select-field">
                    <option value="Normal">Normal</option>
                    <option value="Physically Challenged">Physically Challenged</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="form-current-city" className="label">Current City</label>
                  <input id="form-current-city" name="current_city" value={form.current_city} onChange={handleChange} className="input-field" placeholder="e.g. Chennai" />
                </div>
                <div>
                  <label htmlFor="form-state" className="label">State</label>
                  <input id="form-state" name="state" value={form.state} onChange={handleChange} className="input-field" placeholder="e.g. Tamil Nadu" />
                </div>
                <div>
                  <label htmlFor="form-country" className="label">Country</label>
                  <input id="form-country" name="country" value={form.country} onChange={handleChange} className="input-field" placeholder="e.g. India" />
                </div>
                <div>
                  <label htmlFor="form-location" className="label">General Location (Display Summary)</label>
                  <input id="form-location" name="location" value={form.location} onChange={handleChange} className="input-field" placeholder="e.g. Chennai, India" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
                {[
                  { label: 'Full Name', value: profile?.name },
                  { label: 'Phone', value: profile?.phone || '—' },
                  { label: 'Date of Birth', value: profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-IN') : '—' },
                  { label: 'Age', value: profile?.age ? `${profile.age} Years` : '—' },
                  { label: 'Gender', value: profile?.gender, capitalize: true },
                  { label: 'Marital Status', value: profile?.marital_status || '—' },
                  { label: 'Religion', value: (profile as any)?.religion?.name || '—' },
                  { label: 'Caste', value: (profile as any)?.caste?.name || '—' },
                  { label: 'Sub-Caste', value: (profile as any)?.subcaste?.name || '—' },
                  { label: 'Mother Tongue', value: profile?.mother_tongue || '—' },
                  { label: 'Community', value: profile?.community || '—' },
                  { label: 'Height', value: profile?.height || '—' },
                  { label: 'Weight', value: profile?.weight || '—' },
                  { label: 'Blood Group', value: profile?.blood_group || '—' },
                  { label: 'Diet Preference', value: profile?.diet_preference || '—' },
                  { label: 'Smoking Habit', value: profile?.smoking_habit || '—' },
                  { label: 'Drinking Habit', value: profile?.drinking_habit || '—' },
                  { label: 'Physical Status', value: profile?.physical_status || '—' },
                  { label: 'Current City', value: profile?.current_city || '—' },
                  { label: 'State', value: profile?.state || '—' },
                  { label: 'Country', value: profile?.country || '—' },
                  { label: 'General Location Display', value: profile?.location || '—' },
                ].map((item) => (
                  <div key={item.label} className="py-2.5 border-b border-gray-50 flex justify-between">
                    <span className="text-sm text-gray-400 font-semibold">{item.label}</span>
                    <span className={`text-sm font-bold text-gray-800 ${item.capitalize ? 'capitalize' : ''}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* About Me / Bio Section */}
            <div className="pt-4 space-y-3">
              <h4 className="font-bold text-gray-900">About Me</h4>
              {editing ? (
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={4}
                  className="input-field resize-none text-sm"
                  placeholder="Introduce yourself to potential matches..."
                />
              ) : (
                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-5 rounded-2xl border border-gray-100 italic">
                  "{profile?.bio || 'Introduce yourself here. Click Edit Profile to add a bio.'}"
                </p>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: FAMILY DETAILS ================= */}
        {activeTab === 'family' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-display text-gray-900 border-b pb-3 flex items-center gap-2">
              <Users className="text-rose-500 w-5 h-5" /> Family Details
            </h3>

            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Father's Name</label>
                  <input name="father_name" value={form.father_name} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="label">Father's Occupation</label>
                  <input name="father_occupation" value={form.father_occupation} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="label">Mother's Name</label>
                  <input name="mother_name" value={form.mother_name} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="label">Mother's Occupation</label>
                  <input name="mother_occupation" value={form.mother_occupation} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="label">Number of Brothers</label>
                  <select name="brothers_count" value={form.brothers_count} onChange={handleChange} className="select-field">
                    {['0', '1', '2', '3', '4', '5+'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Brothers' Marital Status</label>
                  <input name="brothers_status" value={form.brothers_status} onChange={handleChange} className="input-field" placeholder="e.g. All Married / 1 Married, 1 Unmarried" />
                </div>
                <div>
                  <label className="label">Number of Sisters</label>
                  <select name="sisters_count" value={form.sisters_count} onChange={handleChange} className="select-field">
                    {['0', '1', '2', '3', '4', '5+'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Sisters' Marital Status</label>
                  <input name="sisters_status" value={form.sisters_status} onChange={handleChange} className="input-field" placeholder="e.g. Unmarried / 1 Married" />
                </div>
                <div>
                  <label className="label">Family Type</label>
                  <select name="family_type" value={form.family_type} onChange={handleChange} className="select-field">
                    <option value="">Select</option>
                    <option value="Nuclear">Nuclear</option>
                    <option value="Joint">Joint</option>
                  </select>
                </div>
                <div>
                  <label className="label">Family Values</label>
                  <select name="family_values" value={form.family_values} onChange={handleChange} className="select-field">
                    <option value="">Select</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Liberal">Liberal</option>
                  </select>
                </div>
                <div>
                  <label className="label">Family Financial Status</label>
                  <select name="family_financial_status" value={form.family_financial_status} onChange={handleChange} className="select-field">
                    <option value="">Select</option>
                    <option value="Lower Middle Class">Lower Middle Class</option>
                    <option value="Middle Class">Middle Class</option>
                    <option value="Upper Middle Class">Upper Middle Class</option>
                    <option value="Affluent">Affluent</option>
                  </select>
                </div>
                <div>
                  <label className="label">Family Native Place</label>
                  <input name="family_native_place" value={form.family_native_place} onChange={handleChange} className="input-field" placeholder="e.g. Madurai, Tamil Nadu" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
                {[
                  { label: "Father's Name", value: profile?.father_name || '—' },
                  { label: "Father's Occupation", value: profile?.father_occupation || '—' },
                  { label: "Mother's Name", value: profile?.mother_name || '—' },
                  { label: "Mother's Occupation", value: profile?.mother_occupation || '—' },
                  { label: 'Number of Brothers', value: profile?.brothers_count ?? '0' },
                  { label: "Brothers' Marital Status", value: profile?.brothers_status || '—' },
                  { label: 'Number of Sisters', value: profile?.sisters_count ?? '0' },
                  { label: "Sisters' Marital Status", value: profile?.sisters_status || '—' },
                  { label: 'Family Type', value: profile?.family_type || '—' },
                  { label: 'Family Values', value: profile?.family_values || '—' },
                  { label: 'Family Financial Status', value: profile?.family_financial_status || '—' },
                  { label: 'Family Native Place', value: profile?.family_native_place || '—' },
                ].map((item) => (
                  <div key={item.label} className="py-2.5 border-b border-gray-50 flex justify-between">
                    <span className="text-sm text-gray-400 font-semibold">{item.label}</span>
                    <span className="text-sm font-bold text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: EDUCATION & CAREER ================= */}
        {activeTab === 'education' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-display text-gray-900 border-b pb-3 flex items-center gap-2">
              <BookOpen className="text-rose-500 w-5 h-5" /> Education & Career
            </h3>

            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Highest Qualification</label>
                  <input name="highest_qualification" value={form.highest_qualification} onChange={handleChange} className="input-field" placeholder="e.g. B.Tech / MBA / Ph.D" />
                </div>
                <div>
                  <label className="label">College / University</label>
                  <input name="college_university" value={form.college_university} onChange={handleChange} className="input-field" placeholder="e.g. IIT Madras" />
                </div>
                <div>
                  <label className="label">Field of Study</label>
                  <input name="field_of_study" value={form.field_of_study} onChange={handleChange} className="input-field" placeholder="e.g. Computer Science" />
                </div>
                <div>
                  <label className="label">Occupation / Designation</label>
                  <input name="job" value={form.job} onChange={handleChange} className="input-field" placeholder="e.g. Software Engineer" />
                </div>
                <div>
                  <label className="label">Company Name</label>
                  <input name="company_name" value={form.company_name} onChange={handleChange} className="input-field" placeholder="e.g. Google" />
                </div>
                <div>
                  <label className="label">Employment Type</label>
                  <select name="employment_type" value={form.employment_type} onChange={handleChange} className="select-field">
                    <option value="">Select</option>
                    <option value="Private Sector">Private Sector</option>
                    <option value="Government / PSU">Government / PSU</option>
                    <option value="Business / Self Employed">Business / Self Employed</option>
                    <option value="Defense / Civil Services">Defense / Civil Services</option>
                    <option value="Not Employed">Not Employed</option>
                  </select>
                </div>
                <div>
                  <label className="label">Annual Income (Salary Display)</label>
                  <input name="salary" value={form.salary} onChange={handleChange} className="input-field" placeholder="e.g. ₹12 - 15 Lakhs" />
                </div>
                <div>
                  <label className="label">Work Location</label>
                  <input name="work_location" value={form.work_location} onChange={handleChange} className="input-field" placeholder="e.g. Bengaluru, India" />
                </div>
                <div>
                  <label className="label">Years of Experience</label>
                  <input type="number" name="years_of_experience" value={form.years_of_experience} onChange={handleChange} className="input-field" placeholder="e.g. 5" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
                {[
                  { label: 'Highest Qualification', value: profile?.highest_qualification || '—' },
                  { label: 'College / University', value: profile?.college_university || '—' },
                  { label: 'Field of Study', value: profile?.field_of_study || '—' },
                  { label: 'Occupation', value: profile?.job || '—' },
                  { label: 'Company Name', value: profile?.company_name || '—' },
                  { label: 'Employment Type', value: profile?.employment_type || '—' },
                  { label: 'Annual Income', value: profile?.salary || '—' },
                  { label: 'Work Location', value: profile?.work_location || '—' },
                  { label: 'Years of Experience', value: profile?.years_of_experience ? `${profile.years_of_experience} Years` : '—' },
                ].map((item) => (
                  <div key={item.label} className="py-2.5 border-b border-gray-50 flex justify-between">
                    <span className="text-sm text-gray-400 font-semibold">{item.label}</span>
                    <span className="text-sm font-bold text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: HOBBIES & PARTNER PREFERENCES ================= */}
        {activeTab === 'hobbies' && (
          <div className="space-y-8">
            {/* HOBBIES & INTERESTS */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-display text-gray-900 border-b pb-3 flex items-center gap-2">
                <Smile className="text-rose-500 w-5 h-5" /> Hobbies & Interests
              </h3>

              {editing ? (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500">Select one or more hobbies that interest you:</p>
                  <div className="flex flex-wrap gap-2.5">
                    {HOBBY_LIST.map((hobby) => {
                      const isSelected = form.selectedHobbies.includes(hobby);
                      return (
                        <button
                          key={hobby}
                          type="button"
                          onClick={() => handleHobbyToggle(hobby)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {hobby}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => handleHobbyToggle('Other')}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        form.selectedHobbies.includes('Other')
                          ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Other / Custom
                    </button>
                  </div>

                  {form.selectedHobbies.includes('Other') && (
                    <div className="pt-2 max-w-sm">
                      <label className="label">Custom Hobby Name</label>
                      <input
                        name="otherHobby"
                        value={form.otherHobby}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter custom hobby (e.g. Sculpting, Paragliding)"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    if (!profile?.hobbies) return <p className="text-sm text-gray-400">No hobbies selected</p>;
                    try {
                      const list = JSON.parse(profile.hobbies);
                      if (!Array.isArray(list) || list.length === 0) return <p className="text-sm text-gray-400">No hobbies selected</p>;
                      return list.map((hobby) => (
                        <span key={hobby} className="badge bg-rose-50 text-rose-600 border border-rose-100 font-bold px-3 py-1.5 rounded-full text-xs">
                          {hobby}
                        </span>
                      ));
                    } catch {
                      return <p className="text-sm text-gray-400">No hobbies selected</p>;
                    }
                  })()}
                </div>
              )}
            </div>

            {/* PARTNER PREFERENCES */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-xl font-bold font-display text-gray-900 border-b pb-3 flex items-center gap-2">
                <Heart className="text-rose-500 w-5 h-5" /> Partner Preferences
              </h3>

              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Preferred Age Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" name="partner_age_min" value={form.partner_age_min} onChange={handleChange} className="input-field" placeholder="Min (e.g. 21)" />
                      <input type="number" name="partner_age_max" value={form.partner_age_max} onChange={handleChange} className="input-field" placeholder="Max (e.g. 28)" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Preferred Height Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input name="partner_height_min" value={form.partner_height_min} onChange={handleChange} className="input-field" placeholder="Min (e.g. 5ft)" />
                      <input name="partner_height_max" value={form.partner_height_max} onChange={handleChange} className="input-field" placeholder="Max (e.g. 6ft)" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Marital Status</label>
                    <input name="partner_marital_status" value={form.partner_marital_status} onChange={handleChange} className="input-field" placeholder="e.g. Never Married, Widow" />
                  </div>
                  <div>
                    <label className="label">Religion</label>
                    <input name="partner_religion" value={form.partner_religion} onChange={handleChange} className="input-field" placeholder="e.g. Hindu / Muslim / Christian" />
                  </div>
                  <div>
                    <label className="label">Caste (Optional)</label>
                    <input name="partner_caste" value={form.partner_caste} onChange={handleChange} className="input-field" placeholder="e.g. Brahmin, Jat" />
                  </div>
                  <div>
                    <label className="label">Education</label>
                    <input name="partner_education" value={form.partner_education} onChange={handleChange} className="input-field" placeholder="e.g. Post Graduate, Doctor" />
                  </div>
                  <div>
                    <label className="label">Occupation</label>
                    <input name="partner_occupation" value={form.partner_occupation} onChange={handleChange} className="input-field" placeholder="e.g. Corporate Employee, Doctor" />
                  </div>
                  <div>
                    <label className="label">Annual Income</label>
                    <input name="partner_income" value={form.partner_income} onChange={handleChange} className="input-field" placeholder="e.g. ₹5 Lakhs & above" />
                  </div>
                  <div>
                    <label className="label">Preferred Location</label>
                    <input name="partner_location" value={form.partner_location} onChange={handleChange} className="input-field" placeholder="e.g. Tamil Nadu, India" />
                  </div>
                  <div>
                    <label className="label">Diet Preference</label>
                    <input name="partner_diet" value={form.partner_diet} onChange={handleChange} className="input-field" placeholder="e.g. Vegetarian / Vegan" />
                  </div>
                  <div>
                    <label className="label">Smoking Preference</label>
                    <input name="partner_smoking" value={form.partner_smoking} onChange={handleChange} className="input-field" placeholder="e.g. Non-Smoker" />
                  </div>
                  <div>
                    <label className="label">Drinking Preference</label>
                    <input name="partner_drinking" value={form.partner_drinking} onChange={handleChange} className="input-field" placeholder="e.g. Non-Drinker / Occasional" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
                  {[
                    { label: 'Preferred Age Range', value: (profile?.partner_age_min || profile?.partner_age_max) ? `${profile.partner_age_min || '—'} to ${profile.partner_age_max || '—'} Years` : '—' },
                    { label: 'Preferred Height Range', value: (profile?.partner_height_min || profile?.partner_height_max) ? `${profile.partner_height_min || '—'} to ${profile.partner_height_max || '—'}` : '—' },
                    { label: 'Marital Status', value: profile?.partner_marital_status || '—' },
                    { label: 'Religion', value: profile?.partner_religion || '—' },
                    { label: 'Caste', value: profile?.partner_caste || '—' },
                    { label: 'Education', value: profile?.partner_education || '—' },
                    { label: 'Occupation', value: profile?.partner_occupation || '—' },
                    { label: 'Annual Income', value: profile?.partner_income || '—' },
                    { label: 'Preferred Location', value: profile?.partner_location || '—' },
                    { label: 'Diet Preference', value: profile?.partner_diet || '—' },
                    { label: 'Smoking Preference', value: profile?.partner_smoking || '—' },
                    { label: 'Drinking Preference', value: profile?.partner_drinking || '—' },
                  ].map((item) => (
                    <div key={item.label} className="py-2.5 border-b border-gray-50 flex justify-between">
                      <span className="text-sm text-gray-400 font-semibold">{item.label}</span>
                      <span className="text-sm font-bold text-gray-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 5: PRIVACY & SUBSCRIPTION ================= */}
        {activeTab === 'privacy' && (
          <div className="space-y-8">
            {/* PRIVACY SETTINGS */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-display text-gray-900 border-b pb-3 flex items-center gap-2">
                <Settings className="text-rose-500 w-5 h-5" /> Privacy Toggles
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                Choose which parts of your profile are visible to other members. Sensitive contact details (Full Email & Phone Number) are automatically masked and only visible to verified **Premium Members** regardless of these toggles.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  { id: 'showFamily', label: 'Show Family Details', desc: 'Allow others to see family background, native place, and siblings.' },
                  { id: 'showEducation', label: 'Show Education & Career', desc: 'Allow others to see degree, college, company, designation, and income.' },
                  { id: 'showHobbies', label: 'Show Hobbies & Interests', desc: 'Allow others to see your hobby badge chips.' },
                  { id: 'showPreferences', label: 'Show Partner Preferences', desc: 'Allow others to see what type of partner you are looking for.' },
                ].map((item) => (
                  <div key={item.id} className="flex items-start justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                      <label htmlFor={item.id} className="font-bold text-gray-950 text-sm cursor-pointer">{item.label}</label>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                    
                    <input
                      id={item.id}
                      type="checkbox"
                      disabled={!editing}
                      checked={(form as any)[item.id]}
                      onChange={() => handlePrivacyChange(item.id as any)}
                      className={`w-5 h-5 text-rose-600 focus:ring-rose-500 border-gray-300 rounded cursor-pointer ${
                        !editing ? 'opacity-65 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                ))}
              </div>
              {!editing && (
                <p className="text-[11px] text-amber-600 flex items-center gap-1 bg-amber-50 px-3 py-2 rounded-xl w-fit border border-amber-200/50">
                  <Info className="w-3.5 h-3.5" /> Note: Click "Edit Profile" at the top to toggle these checkboxes.
                </p>
              )}
            </div>

            {/* SUBSCRIPTION STATUS */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-xl font-bold font-display text-gray-900 border-b pb-3 flex items-center gap-2">
                <Star className="text-rose-500 w-5 h-5" /> Subscription Status
              </h3>
              
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200 rounded-3xl p-6 relative overflow-hidden">
                {isPremiumPlan && (
                  <div className="absolute -top-4 -right-4 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
                )}
                
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                      <div className="border-b border-gray-200/60 pb-2">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Current Plan</p>
                        <p className="text-base font-extrabold text-gray-900 mt-0.5 capitalize">{activePlan}</p>
                      </div>
                      <div className="border-b border-gray-200/60 pb-2">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Price</p>
                        <p className="text-base font-extrabold text-gray-900 mt-0.5">{isPremiumPlan ? '₹199' : '₹0'}</p>
                      </div>
                      <div className="border-b border-gray-200/60 pb-2">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Status</p>
                        <span className={`inline-flex items-center gap-1 font-bold text-xs mt-1 px-2.5 py-1 rounded-full border ${
                          isPremiumPlan 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-gray-200 text-gray-700 border-gray-300'
                        }`}>
                          <CheckCircle className="w-3.5 h-3.5" />
                          {isPremiumPlan ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      {isPremiumPlan && subscription?.payment_date && (
                        <div className="border-b border-gray-200/60 pb-2">
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Payment Date</p>
                          <p className="text-base font-bold text-gray-900 mt-0.5">
                            {new Date(subscription.payment_date).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                      
                      {isPremiumPlan && subscription?.transaction_id && (
                        <div className="border-b border-gray-200/60 pb-2 col-span-1 sm:col-span-2">
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Transaction ID</p>
                          <p className="text-sm font-mono font-bold text-rose-600 mt-0.5">{subscription.transaction_id}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isPremiumPlan && (
                    <Link
                      href="/subscription"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-md hover:shadow-orange-200 transition-all flex items-center gap-1.5 flex-shrink-0 self-center sm:self-auto"
                    >
                      Upgrade to Premium <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Photo Manager */}
      <div className="card p-8 border border-gray-100 shadow-sm bg-white rounded-3xl">
        <h2 className="font-display font-bold text-xl text-gray-900 mb-5 flex items-center gap-2">
          <Camera className="text-rose-500 w-5 h-5" /> Profile Photos Gallery
        </h2>
        <ProfilePhotoManager />
      </div>

      {/* Upgrade nudge if free plan at the bottom */}
      {!isPremiumPlan && (
        <Link href="/subscription" className="card p-6 border border-rose-200 hover:border-rose-400 bg-rose-50/50 flex items-center justify-between hover:shadow-card-hover transition-all group rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Star className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="font-display font-bold text-gray-900">Upgrade to Premium Membership</h3>
              <p className="text-sm text-gray-500 mt-0.5">Unlock complete contact numbers and email details instantly</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm group-hover:gap-3 transition-all">
            Upgrade Plan <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      )}
    </div>
  );
}
