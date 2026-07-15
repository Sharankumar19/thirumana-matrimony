'use client';
// components/search/SearchFilters.tsx
import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import type { SearchFilters as SearchFiltersType, Religion, Caste } from '@/types';

interface SearchFiltersProps {
  onSearch: (filters: SearchFiltersType) => void;
  loading?: boolean;
}

export default function SearchFilters({ onSearch, loading }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [religions, setReligions] = useState<Religion[]>([]);
  const [castes, setCastes] = useState<Caste[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetch('/api/religions').then(r => r.json()).then(d => { if (d.success) setReligions(d.data); });
  }, []);

  useEffect(() => {
    if (filters.religion_id) {
      fetch(`/api/castes?religion_id=${filters.religion_id}`)
        .then(r => r.json())
        .then(d => { if (d.success) setCastes(d.data); });
    } else {
      setCastes([]);
      setFilters(f => ({ ...f, caste_id: undefined }));
    }
  }, [filters.religion_id]);

  function handleChange(key: keyof SearchFiltersType, value: string | number | undefined) {
    setFilters(f => ({ ...f, [key]: value || undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch({ ...filters, page: 1 });
  }

  function handleReset() {
    setFilters({});
    onSearch({ page: 1 });
  }

  const hasFilters = Object.keys(filters).some(k => filters[k as keyof SearchFiltersType]);

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-3.5 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Top row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <input
              id="search-location"
              type="text"
              placeholder="Search city, state..."
              value={filters.location || ''}
              onChange={e => handleChange('location', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 bg-white transition-all placeholder:text-gray-400"
              aria-label="Search location"
            />
          </div>
          
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all
              ${showAdvanced ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100'}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
            Filters
          </button>
        </div>

        {/* Advanced filters */}
        {showAdvanced && (
          <div className="grid grid-cols-2 gap-2.5 pt-1.5 border-t border-gray-50 animate-fade-up">
            {/* Gender */}
            <div>
              <label htmlFor="filter-gender" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-0.5">Gender</label>
              <select
                id="filter-gender"
                value={filters.gender || ''}
                onChange={e => handleChange('gender', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white cursor-pointer"
              >
                <option value="">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Min Age */}
            <div>
              <label htmlFor="filter-age-min" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-0.5">Min Age</label>
              <input
                id="filter-age-min"
                type="number"
                min={18} max={70}
                placeholder="18"
                value={filters.age_min || ''}
                onChange={e => handleChange('age_min', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full border border-gray-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
              />
            </div>

            {/* Max Age */}
            <div>
              <label htmlFor="filter-age-max" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-0.5">Max Age</label>
              <input
                id="filter-age-max"
                type="number"
                min={18} max={70}
                placeholder="50"
                value={filters.age_max || ''}
                onChange={e => handleChange('age_max', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full border border-gray-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
              />
            </div>

            {/* Religion */}
            <div>
              <label htmlFor="filter-religion" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-0.5">Religion</label>
              <select
                id="filter-religion"
                value={filters.religion_id || ''}
                onChange={e => handleChange('religion_id', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full border border-gray-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white cursor-pointer"
              >
                <option value="">Any</option>
                {religions.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Caste */}
            <div className="col-span-2">
              <label htmlFor="filter-caste" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-0.5">Caste</label>
              <select
                id="filter-caste"
                value={filters.caste_id || ''}
                onChange={e => handleChange('caste_id', e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={!filters.religion_id}
                className="w-full border border-gray-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Any</option>
                {castes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2.5 pt-1 items-center justify-between">
          <button 
            type="submit" 
            disabled={loading} 
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-rose-100 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            Apply Filters
          </button>
          
          {hasFilters && (
            <button 
              type="button" 
              onClick={handleReset} 
              className="px-3 py-2.5 rounded-xl border border-gray-200 hover:border-red-200 text-gray-500 hover:text-red-500 font-semibold text-xs transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" /> Reset
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
