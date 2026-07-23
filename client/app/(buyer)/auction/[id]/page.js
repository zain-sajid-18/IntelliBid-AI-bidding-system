"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuctionStore } from "@/store/auctionStore";
import { useAuthStore } from "@/store/authStore";
import { useWatchlistStore } from "@/store/watchlistStore";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Heart, Loader2 } from "lucide-react";

import ImageGallery from "@/components/auction/ImageGallery";
import BidPanel from "@/components/auction/BidPanel";
import LiveBiddingRoom from "@/components/auction/LiveBiddingRoom";
import BidHistory from "@/components/auction/BidHistory";
import SellerCard from "@/components/auction/SellerCard";

function calculateTimeLeft(endTime) {
    if (!endTime) return { text: "...", urgent: false };
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return { text: "Ended", urgent: false };

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    if (h > 24) return { text: `${Math.floor(h / 24)}d ${h % 24}h left`, urgent: false };
    if (h > 0) return { text: `${h}h ${m}m ${s}s left`, urgent: h < 6 }; 
    return { text: `${m}m ${s}s left`, urgent: true };
}

export default function AuctionDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { fetchAuction, leaveAuctionRoom, auction, loading, error } = useAuctionStore();
    const { user } = useAuthStore();
    const { isWatched, toggleWatchlist, initialized, fetchWatchlist } = useWatchlistStore();
    const [timeLeft, setTimeLeft] = useState({ text: "...", urgent: false });

    useEffect(() => {
        if (!initialized) fetchWatchlist();
    }, [initialized, fetchWatchlist]);

    useEffect(() => {
        if (id) {
            // Reset state immediately when navigating to a new auction
            useAuctionStore.setState({ auction: null, loading: true, error: null });
            fetchAuction(id);
        }
        return () => {
            // Only emit socket leave — do NOT clear store state here
            if (id) leaveAuctionRoom(id);
        };
    }, [id]);

    useEffect(() => {
        if (auction?.endTime) {
            setTimeLeft(calculateTimeLeft(auction.endTime));
            const timer = setInterval(() => {
                setTimeLeft(calculateTimeLeft(auction.endTime));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [auction?.endTime]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[var(--background)]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--electric)] text-white shadow-[4px_4px_0_0_var(--ink)] animate-pulse">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !auction) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-[var(--background)] p-4 text-center">
                <h1 className="font-display text-4xl font-black uppercase">Auction Not Found</h1>
                <p className="mt-2 font-medium opacity-60">{error || "This item may have been removed."}</p>
                <button 
                    onClick={() => router.back()} 
                    className="mt-6 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--electric)] px-6 py-3 font-display text-sm font-black uppercase text-white shadow-[4px_4px_0_0_var(--ink)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--ink)]"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const currentlyWatched = isWatched(id);

    return (
        <div className="min-h-screen bg-[var(--background)] pb-24">
            {/* Top Bar */}
            <div className="sticky top-0 z-40 border-b-[4px] border-[var(--ink)] bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-[1200px] items-center justify-between p-4">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-widest hover:text-[var(--electric)] transition-colors"
                    >
                        <ArrowLeft size={16} strokeWidth={3} /> Back
                    </button>

                    <button 
                        onClick={() => toggleWatchlist(id)}
                        className={`flex items-center gap-2 rounded-full border-[3px] border-[var(--ink)] px-4 py-2 font-display text-xs font-black uppercase shadow-[2px_2px_0_0_var(--ink)] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--ink)] ${
                            currentlyWatched ? 'bg-[var(--hotpink)] text-white' : 'bg-white'
                        }`}
                    >
                        <Heart size={14} className={currentlyWatched ? "fill-white" : ""} strokeWidth={3} />
                        {currentlyWatched ? "Watching" : "Watch"}
                    </button>
                </div>
            </div>

            <div className="mx-auto max-w-[1200px] p-4 md:p-8">
                <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
                    
                    {/* Left Column: Images & Details */}
                    <div className="flex flex-col gap-8">
                        <ImageGallery images={auction.images} title={auction.title} />
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col gap-4"
                        >
                            <div>
                                <span className="inline-block rounded-lg border-[2px] border-[var(--ink)] bg-[var(--acid)] px-2 py-1 text-[10px] font-black uppercase tracking-widest">
                                    {auction.category}
                                </span>
                                <h1 className="mt-2 font-display text-3xl md:text-5xl font-black uppercase leading-none tracking-tight">
                                    {auction.title}
                                </h1>
                                
                                {timeLeft.urgent && auction.status === 'active' && (
                                    <div className="mt-4 flex w-fit items-center gap-2 rounded-lg border-[2px] border-[var(--ink)] bg-[var(--hotpink)] px-3 py-1.5 font-display text-xs font-black uppercase text-white shadow-[2px_2px_0_0_var(--ink)] animate-pulse">
                                        <Clock size={14} /> Ending Soon: {timeLeft.text}
                                    </div>
                                )}
                            </div>

                            <div className="brutal p-6 md:p-8 border-[4px] border-[var(--ink)] rounded-2xl shadow-[6px_6px_0_0_var(--ink)]" style={{ background: "var(--electric)", color: "white" }}>
                                <h3 className="font-display text-lg font-black uppercase mb-4">Description</h3>
                                <p className="whitespace-pre-wrap font-medium opacity-90 leading-relaxed">
                                    {auction.description || "No description provided."}
                                </p>
                                
                                {auction.tags?.length > 0 && (
                                    <div className="mt-6 flex flex-wrap gap-2 pt-6 border-t-[2px]" style={{ borderColor: "rgba(255,255,255,0.3)" }}>
                                        {auction.tags.map(tag => (
                                            <span key={tag} className="rounded-full border-[2px] border-[var(--ink)] bg-white text-[var(--ink)] px-3 py-1 text-xs font-bold">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Bidding & Seller */}
                    <div className="flex flex-col gap-6">
                        <div className="sticky top-24 flex flex-col gap-6">
                            {auction.type === 'live' ? <LiveBiddingRoom /> : <BidPanel />}
                            <BidHistory />
                            <SellerCard seller={auction.seller} auctionId={auction._id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
