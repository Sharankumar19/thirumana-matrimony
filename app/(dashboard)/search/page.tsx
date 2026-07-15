'use client';
// app/(dashboard)/search/page.tsx
import { useEffect, useRef, useCallback } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { searchProfiles, setFilters } from '@/store/slices/matchSlice';
import { sendInterest } from '@/services/interestService';
import SearchFilters from '@/components/search/SearchFilters';
import ProfileCard from '@/components/profile/ProfileCard';
import type { SearchFilters as FiltersType, User } from '@/types';
import { useRouter } from 'next/navigation';

const PAGE_SIZE = 15;

export default function SearchPage() {
  const dispatch = useAppDispatch();
  const { results, loading, loadingMore, total, page, hasMore, filters } = useAppSelector((s) => s.matches);
  const router = useRouter();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(searchProfiles({ page: 1, limit: PAGE_SIZE }));
  }, [dispatch]);

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore && results.length > 0) {
      dispatch(searchProfiles({ ...filters, page: page + 1, limit: PAGE_SIZE, append: true }));
    }
  }, [dispatch, filters, page, hasMore, loading, loadingMore, results.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  function handleSearch(newFilters: FiltersType) {
    dispatch(setFilters(newFilters));
    dispatch(searchProfiles({ ...newFilters, page: 1, limit: PAGE_SIZE }));
  }

  async function handleInterest(userId: number): Promise<boolean> {
    return sendInterest(userId);
  }

  const isInitialLoad = loading && results.length === 0;

  return (
    <div className="space-y-4 flex-1 flex flex-col">
      <div className="flex items-center justify-between px-1">
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
          {total > 0 ? `${total} Profiles Found` : 'Browse Profiles'}
        </p>
      </div>

      <SearchFilters onSearch={handleSearch} loading={loading && !loadingMore} />

      {isInitialLoad ? (
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
              <ProfileCard
                key={user.id}
                user={user}
                onInterest={handleInterest}
                onClick={() => router.push(`/profile-cardDetails/${user.id}`)}
              />
            ))}
          </div>

          <div ref={sentinelRef} className="flex justify-center py-8">
            {loadingMore && (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
                <span className="text-sm">Loading more profiles...</span>
              </div>
            )}
            {!hasMore && results.length > 0 && (
              <p className="text-sm text-gray-400">You&apos;ve seen all {total} profiles</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
