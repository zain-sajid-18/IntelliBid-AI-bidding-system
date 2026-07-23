import { useEffect, useRef } from 'react';
import AuctionCard from './AuctionCard';
import FeedSkeleton from './FeedSkeleton';
import { useFeedStore } from '@/store/feedStore';
import { Loader2 } from 'lucide-react';

export default function FeedGrid() {
    const { items, loading, hasMore, fetchNextPage } = useFeedStore();
    const sentinelRef = useRef(null);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !loading && hasMore) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1, rootMargin: '400px' } // Pre-fetch before they hit bottom
        );

        if (sentinelRef.current) observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [loading, hasMore, fetchNextPage]);

    if (items.length === 0 && loading) {
        return <FeedSkeleton />;
    }

    if (items.length === 0 && !loading) {
        return (
            <div className="brutal bg-white p-16 text-center rounded-3xl">
                <div className="text-6xl mb-4">🏜️</div>
                <h3 className="font-display text-2xl font-black uppercase tracking-tight">It's quiet out here</h3>
                <p className="text-sm font-medium text-[var(--ink)]/70 mt-2 max-w-md mx-auto">
                    We couldn't find any active auctions matching your current interests or filters.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((auction) => (
                    <AuctionCard key={auction._id} auction={auction} />
                ))}
            </div>

            {/* Infinite Scroll Sentinel */}
            <div 
                ref={sentinelRef} 
                className="w-full h-32 flex items-center justify-center mt-8"
            >
                {loading && hasMore && (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-[var(--ink)]" size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            Loading more...
                        </span>
                    </div>
                )}
                {!hasMore && items.length > 0 && (
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            You've reached the end
                        </p>
                        <div className="w-16 h-1 bg-[var(--ink)] mx-auto mt-2 rounded-full opacity-20" />
                    </div>
                )}
            </div>
        </div>
    );
}
