"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuctionStore } from "@/store/auctionStore";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Activity, Loader2, Trophy, Eye, TrendingUp } from "lucide-react";
import BidHistory from "@/components/auction/BidHistory";
import ImageGallery from "@/components/auction/ImageGallery";
import LiveBiddingRoom from "@/components/auction/LiveBiddingRoom";
import BidPanel from "@/components/auction/BidPanel";

export default function SellerListingDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { fetchAuction, leaveAuctionRoom, auction, loading, error } = useAuctionStore();

    useEffect(() => {
        if (id) {
            // Reset state immediately when navigating to a new listing
            useAuctionStore.setState({ auction: null, loading: true, error: null });
            fetchAuction(id);
        }
        return () => {
            // Only emit socket leave — do NOT clear store state here
            if (id) leaveAuctionRoom(id);
        };
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[var(--background)]">
                <Loader2 className="h-12 w-12 animate-spin text-[var(--ink)] opacity-20" />
            </div>
        );
    }

    if (error || !auction) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-[var(--background)] p-4 text-center">
                <h1 className="font-display text-4xl font-black uppercase">Listing Not Found</h1>
                <p className="mt-2 font-medium opacity-60">{error || "This item may have been removed."}</p>
                <button 
                    onClick={() => router.back()} 
                    className="mt-6 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--electric)] px-6 py-3 font-display text-sm font-black uppercase text-black shadow-[4px_4px_0_0_var(--ink)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--ink)]"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const highestBidder = auction.bidHistory && auction.bidHistory.length > 0 ? auction.bidHistory[0] : null;

    return (
        <div className="min-h-screen bg-[var(--background)] pb-24">
            {/* Top Bar */}
            <div className="sticky top-0 z-40 border-b-[4px] border-[var(--ink)] bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-[1200px] items-center justify-between p-4">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-widest hover:text-[var(--electric)] transition-colors"
                    >
                        <ArrowLeft size={16} strokeWidth={3} /> Back to Products
                    </button>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-bold uppercase rounded-lg border-[2px] border-[var(--ink)] ${auction.status === 'active' || auction.status === 'live' ? 'bg-[var(--acid)] text-[var(--ink)]' : auction.status === 'ended' ? 'bg-[var(--sunset)] text-[var(--ink)]' : 'bg-[var(--muted)] text-[var(--ink)]'}`}>
                            {auction.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-[1200px] p-4 md:p-8">
                <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
                    
                    {/* Left Column: Details & Images */}
                    <div className="flex flex-col gap-8">
                        <div>
                            <span className="inline-block rounded-lg border-[2px] border-[var(--ink)] bg-[var(--background)] px-2 py-1 text-[10px] font-black uppercase tracking-widest">
                                {auction.category}
                            </span>
                            <h1 className="mt-2 font-display text-3xl md:text-5xl font-black uppercase leading-none tracking-tight">
                                {auction.title}
                            </h1>
                        </div>

                        <ImageGallery images={auction.images} title={auction.title} />
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Views", value: auction.viewCount || 0, icon: Eye, color: "var(--acid)" },
                                { label: "Total Bids", value: auction.bidCount || 0, icon: TrendingUp, color: "var(--electric)" },
                                { label: "Ends At", value: new Date(auction.endTime).toLocaleString(), icon: Clock, color: "var(--hotpink)", colSpan: 2 }
                            ].map((stat, index) => {
                                const Icon = stat.icon;
                                const textColor = "var(--ink)"; // Use black text everywhere!
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`brutal p-4 border-[3px] border-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] rounded-2xl ${stat.colSpan === 2 ? 'col-span-2' : ''}`}
                                        style={{ background: stat.color, color: textColor }}
                                    >
                                        <div className="text-xs font-bold uppercase flex items-center gap-1" style={{ opacity: 0.8 }}><Icon size={14} /> {stat.label}</div>
                                        <div className="text-2xl font-black mt-1">{stat.value}</div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className="brutal p-6 md:p-8 border-[3px] border-[var(--ink)] shadow-[6px_6px_0_0 var(--ink)] rounded-2xl" style={{ background: "var(--sunset)", color: "var(--ink)" }}>
                            <h3 className="font-display text-lg font-black uppercase mb-4">Description</h3>
                            <p className="whitespace-pre-wrap font-medium opacity-90 leading-relaxed">
                                {auction.description || "No description provided."}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Live Bidding Status & Controls */}
                    <div className="flex flex-col gap-6">
                        <div className="sticky top-24 flex flex-col gap-6">
                            
                            {/* Render Live Bidding Room for live auctions, or BidPanel for standard */}
                            {auction.type === 'live' ? <LiveBiddingRoom /> : <BidPanel />}

                            {/* Highest Bidder Summary with High Contrast Styling */}
                            <div className="brutal bg-[var(--electric)] p-6 text-black border-[4px] border-[var(--ink)] shadow-[6px_6px_0_0_var(--ink)]">
                                <div className="flex items-center gap-2 mb-4 font-black uppercase text-sm tracking-wider">
                                    <Trophy size={16} className="text-[var(--acid)]" /> Current Standings
                                </div>
                                <div className="text-5xl font-black drop-shadow-[2px_2px_0_var(--ink)] text-[var(--acid)]">
                                    ${auction.currentPrice?.toLocaleString() || 0}
                                </div>
                                <div className="mt-4 pt-4 border-t-[2px]" style={{ borderColor: "rgba(0,0,0,0.3)" }}>
                                    <div className="text-xs font-black uppercase tracking-wider mb-2">Highest Bidder</div>
                                    {highestBidder ? (
                                        <div className="flex items-center gap-3 bg-white/30 p-3 rounded-xl border-[2px] border-[var(--ink)]">
                                            <img src={highestBidder.bidderAvatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e5e7eb'/%3E%3Ccircle cx='20' cy='15' r='7' fill='%239ca3af'/%3E%3Cellipse cx='20' cy='35' rx='12' ry='8' fill='%239ca3af'/%3E%3C/svg%3E"} alt="avatar" className="w-10 h-10 rounded-full border-[2px] border-[var(--ink)] bg-white object-cover" />
                                            <div>
                                                <div className="font-black text-lg leading-none">{highestBidder.bidderName}</div>
                                                <div className="text-xs font-bold opacity-80 mt-1">Placed at {new Date(highestBidder.time).toLocaleTimeString()}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="font-bold text-sm bg-white/30 p-3 rounded-xl border-[2px] border-[var(--ink)]">No bids placed yet.</div>
                                    )}
                                </div>
                            </div>

                            <BidHistory />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
