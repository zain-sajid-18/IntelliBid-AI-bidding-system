"use client";

import { useEffect, useState, useCallback } from 'react';
import { useFeedStore } from '@/store/feedStore';
import { useAuthStore } from '@/store/authStore';
import FeedGrid from '@/components/discover/FeedGrid';
import FeedFilters from '@/components/discover/FeedFilters';
import ColdStartPicker from '@/components/discover/ColdStartPicker';
import { Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import SearchBar from '@/components/discover/SearchBar';
import AuctionCard from '@/components/discover/AuctionCard';

export default function DiscoverPage() {
    const { fetchNextPage, items, page, loading: feedLoading } = useFeedStore();
    const user = useAuthStore(s => s.user);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Initial fetch for feed
    useEffect(() => {
        if (items.length === 0 && page === 1 && !feedLoading && !searchQuery) {
            fetchNextPage();
        }
    }, [fetchNextPage, items.length, page, feedLoading]);

    // Check if we need to show onboarding (new users)
    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem(`onboarding_seen_${user?._id}`);
        const isColdStartFeed = useFeedStore.getState().feedType === 'trending';

        if (!hasSeenOnboarding && isColdStartFeed && !feedLoading && items.length > 0) {
            setShowOnboarding(true);
        }
    }, [user, feedLoading, items.length]);

    // Handle Search
    const handleSearch = useCallback(async (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setSearchLoading(true);
        try {
            const res = await api(`/api/auction/search?q=${encodeURIComponent(query)}`);
            if (res.success) {
                setSearchResults(res.data);
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setSearchLoading(false);
        }
    }, []);

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
        if (user) {
            localStorage.setItem(`onboarding_seen_${user._id}`, 'true');
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 pb-24">
            {showOnboarding && (
                <ColdStartPicker onComplete={handleOnboardingComplete} />
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-2"
                    >
                        <div className="p-3 bg-[var(--electric)] rounded-2xl border-[3px] border-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)]">
                            <Compass size={28} className="text-white" />
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter">
                            Discover
                        </h1>
                    </motion.div>
                    <p className="font-medium opacity-70 max-w-xl text-sm md:text-base">
                        Your personalized auction feed. The more you browse, bid, and watchlist, the smarter it gets.
                    </p>
                </div>
            </div>

            <SearchBar onSearch={handleSearch} loading={searchLoading} />

            {!searchQuery ? (
                <>
                    <FeedFilters />
                    <FeedGrid />
                </>
            ) : (
                <div className="mt-8">
                    <h2 className="font-display text-2xl font-black uppercase tracking-tight mb-6">
                        Search Results for "{searchQuery}"
                    </h2>
                    {searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {searchResults.map(auction => (
                                <AuctionCard key={auction._id} auction={auction} />
                            ))}
                        </div>
                    ) : (
                        !searchLoading && (
                            <div className="text-center py-20 bg-white border-[4px] border-[var(--ink)] rounded-3xl shadow-[8px_8px_0_0_var(--ink)]">
                                <span className="text-6xl block mb-4">🔍</span>
                                <h3 className="font-display text-2xl font-black uppercase">No results found</h3>
                                <p className="opacity-60 font-medium mt-2">Try adjusting your search terms or using different keywords.</p>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
