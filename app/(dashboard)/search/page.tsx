'use client';
// app/(dashboard)/search/page.tsx
import { useEffect } from 'react';
import { Users, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { searchProfiles, setFilters, setPage } from '@/store/slices/matchSlice';
import { sendInterest } from '@/services/interestService';
import SearchFilters from '@/components/search/SearchFilters';
import ProfileCard from '@/components/profile/ProfileCard';
import type { SearchFilters as FiltersType, User } from '@/types';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const dispatch = useAppDispatch();
  const { results, loading, total, page, totalPages, filters } = useAppSelector((s) => s.matches);
  const router = useRouter();
  useEffect(() => {
    dispatch(searchProfiles({ page: 1, limit: 12 }));
  }, [dispatch]);

  function handleSearch(newFilters: FiltersType) {
    dispatch(setFilters(newFilters));
    dispatch(searchProfiles({ ...newFilters, page: 1, limit: 12 }));
  }

  function handlePageChange(newPage: number) {
    dispatch(setPage(newPage));
    dispatch(searchProfiles({ ...filters, page: newPage, limit: 12 }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleInterest(userId: number) {
    await sendInterest(userId);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">Find Your Match</h1>
        <p className="text-gray-500 text-sm">
          {total > 0 ? `${total} profiles found` : 'Browse profiles below'}
        </p>
      </div>

      {/* Filters */}
      <SearchFilters onSearch={handleSearch} loading={loading} />

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-rose-400" />
          <p className="text-sm">Finding matches for you...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-rose-300" />
          </div>
          <h3 className="font-display font-semibold text-xl text-gray-700 mb-2">No profiles found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your filters to see more results.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {results.map((user: User) => (
              <ProfileCard key={user.id} user={user} onInterest={handleInterest}  onClick={() => router.push(`/profile-cardDetails/${user.id}`)}  />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-rose-400 hover:text-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all
                      ${page === p
                        ? 'bg-rose-600 text-white shadow-button'
                        : 'border border-gray-200 text-gray-600 hover:border-rose-400 hover:text-rose-600'
                      }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-rose-400 hover:text-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
