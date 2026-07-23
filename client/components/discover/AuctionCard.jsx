import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useBehaviorTracker } from '@/hooks/useBehaviorTracker';
import { useWatchlistStore } from '@/store/watchlistStore';
import { Clock, Heart, ArrowRight, Timer, Gavel, Eye } from 'lucide-react';

export default function AuctionCard({ auction }) {
    const auctionId = auction?._id || auction?.id;
    const { trackViewOnce, trackEvent } = useBehaviorTracker(auctionId);
    const { isWatched, toggleWatchlist, initialized, fetchWatchlist } = useWatchlistStore();
    const cardRef = useRef(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        if (!initialized) fetchWatchlist();
    }, [initialized, fetchWatchlist]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    trackViewOnce();
                }
            },
            { threshold: 0.6 }
        );

        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, [trackViewOnce]);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const diff = new Date(auction.endTime).getTime() - Date.now();
            if (diff <= 0) return 'Ended';

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setIsUrgent(hours < 24);

            if (hours > 24) {
                const days = Math.floor(hours / 24);
                const remainingHours = hours % 24;
                return `${days}d ${remainingHours}h ${minutes}m`;
            }
            if (hours > 0) return `${hours}h ${minutes}m left`;
            return `${minutes}m left`;
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, [auction.endTime]);

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -8, rotate: 0.5 }}
            className="group relative flex flex-col bg-white border-[3px] border-[var(--ink)] rounded-[2rem] overflow-hidden shadow-[8px_8px_0_0_var(--ink)] hover:shadow-[12px_12px_0_0_var(--ink)] transition-all"
        >
            {/* Status Overlays */}
            {auction.type === 'live' && (
                <div className="absolute top-4 left-4 z-20 bg-[var(--hotpink)] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-[2px] border-[var(--ink)] shadow-[3px_3px_0_0_var(--ink)] flex items-center gap-2 animate-pulse">
                    <Gavel size={14} strokeWidth={3} /> Live Bidding
                </div>
            )}
            {isUrgent && timeLeft !== 'Ended' && auction.type !== 'live' && (
                <div className="absolute top-4 left-4 z-20 bg-[var(--hotpink)] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-[2px] border-[var(--ink)] shadow-[3px_3px_0_0_var(--ink)] flex items-center gap-2 animate-pulse">
                    <Timer size={14} strokeWidth={3} /> Ending Soon
                </div>
            )}

            {/* Image Container */}
            <div className="relative aspect-[1/1] border-b-[3px] border-[var(--ink)] bg-gray-50 overflow-hidden">
                {auction.images && auction.images[0] ? (
                    <img
                        src={auction.images[0]}
                        alt={auction.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center font-display text-5xl opacity-10">
                        📦
                    </div>
                )}

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        const currentlyWatched = isWatched(auctionId);
                        trackEvent(currentlyWatched ? 'watchlist_remove' : 'watchlist_add');
                        toggleWatchlist(auctionId);
                    }}
                    className={`absolute top-4 right-4 z-20 h-11 w-11 flex items-center justify-center rounded-full border-[3px] border-[var(--ink)] shadow-[3px_3px_0_0_var(--ink)] transition-all active:scale-90 ${isWatched(auctionId)
                            ? 'bg-[var(--hotpink)] text-white'
                            : 'bg-white text-[var(--ink)] hover:bg-[var(--hotpink)] hover:text-white'
                        }`}
                >
                    <Heart size={20} strokeWidth={3} className={isWatched(auctionId) ? "fill-white" : ""} />
                </button>
            </div>

            {/* Content Area */}
            <div className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--ink)]/40 bg-[var(--background)] px-2 py-1 rounded-md border-[1.5px] border-[var(--ink)]">
                            {auction.category}
                        </span>
                        {auction.bidCount > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase text-[var(--electric)]">
                                <Gavel size={12} strokeWidth={3} /> {auction.bidCount} Bids
                            </span>
                        )}
                    </div>
                    <h3 className="font-display font-black text-xl leading-[1.1] line-clamp-2 group-hover:text-[var(--electric)] transition-colors">
                        {auction.title}
                    </h3>
                </div>

                <div className="mt-auto space-y-5">
                    {/* Bidding Stats Block */}
                    <div className="flex items-center justify-between bg-[var(--background)] border-[3px] border-[var(--ink)] p-4 rounded-2xl shadow-[4px_4px_0_0_var(--ink)]">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.1em] opacity-40 mb-1">Current Price</p>
                            <p className="font-display text-3xl font-black text-[var(--acid)] drop-shadow-[2px_2px_0_var(--ink)]">
                                ${auction.currentPrice.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.1em] opacity-40 mb-1 flex items-center justify-end gap-1">
                                <Clock size={12} strokeWidth={3} /> Ends In
                            </p>
                            <p className={`font-display text-lg font-black ${isUrgent ? 'text-[var(--hotpink)]' : 'text-[var(--ink)]'}`}>
                                {timeLeft}
                            </p>
                        </div>
                    </div>

                    <Link
                        href={`/auction/${auctionId}`}
                        onClick={() => trackEvent('item_view', { source: 'feed_click' })}
                        className="mt-4 w-full bg-[var(--electric)] text-white py-3 rounded-xl border-[2px] border-[var(--ink)] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[var(--ink)] hover:text-[var(--acid)] transition-colors"
                    >
                        View Details <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
