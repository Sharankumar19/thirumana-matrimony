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
    <div className="card p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Top row */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <input
              id="search-location"
              type="text"
              placeholder="Search by city, state..."
              value={filters.location || ''}
              onChange={e => handleChange('location', e.target.value)}
              className="input-field pl-10"
              aria-label="Search location"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all
              ${showAdvanced ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-gray-200 text-gray-600 hover:border-rose-300'}`}
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            Filters
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
        </div>

        {/* Advanced filters */}
        {showAdvanced && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1 animate-fade-up">
            {/* Gender */}
            <div>
              <label htmlFor="filter-gender" className="label">Gender</label>
              <select
                id="filter-gender"
                value={filters.gender || ''}
                onChange={e => handleChange('gender', e.target.value)}
                className="select-field text-sm"
              >
                <option value="">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Age range */}
            <div>
              <label htmlFor="filter-age-min" className="label">Min Age</label>
              <input
                id="filter-age-min"
                type="number"
                min={18} max={70}
                placeholder="18"
                value={filters.age_min || ''}
                onChange={e => handleChange('age_min', e.target.value ? parseInt(e.target.value) : undefined)}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label htmlFor="filter-age-max" className="label">Max Age</label>
              <input
                id="filter-age-max"
                type="number"
                min={18} max={70}
                placeholder="50"
                value={filters.age_max || ''}
                onChange={e => handleChange('age_max', e.target.value ? parseInt(e.target.value) : undefined)}
                className="input-field text-sm"
              />
            </div>

            {/* Religion */}
            <div>
              <label htmlFor="filter-religion" className="label">Religion</label>
              <select
                id="filter-religion"
                value={filters.religion_id || ''}
                onChange={e => handleChange('religion_id', e.target.value ? parseInt(e.target.value) : undefined)}
                className="select-field text-sm"
              >
                <option value="">Any</option>
                {religions.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Caste */}
            <div>
              <label htmlFor="filter-caste" className="label">Caste</label>
              <select
                id="filter-caste"
                value={filters.caste_id || ''}
                onChange={e => handleChange('caste_id', e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={!filters.religion_id}
                className="select-field text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-6">
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" aria-hidden="true" />
            )}
            Search Profiles
          </button>
          {hasFilters && (
            <button type="button" onClick={handleReset} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors">
              <X className="w-4 h-4" aria-hidden="true" /> Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
