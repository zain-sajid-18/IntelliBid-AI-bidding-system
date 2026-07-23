"use client";

import { useState, useEffect } from "react";
import { useAuctionStore } from "@/store/auctionStore";
import { useAuthStore } from "@/store/authStore";
import { Loader2, Gavel, AlertCircle, CheckCircle2 } from "lucide-react";

export default function BidPanel() {
    const { auction, placeBid, submittingBid } = useAuctionStore();
    const { user } = useAuthStore();
    const [bidInput, setBidInput] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const sellerId = typeof auction?.seller === 'string' ? auction.seller : auction?.seller?._id;
    const isOwner = user?.id === sellerId || user?._id === sellerId;
    const isActive = auction?.status === "active";
    const minBid = (auction?.currentPrice || auction?.startingPrice || 0) + 1;
    const [submittingAccept, setSubmittingAccept] = useState(false);

    const handleAcceptEarly = async () => {
        if (!auction?._id) return;
        setSubmittingAccept(true);
        setError(null);
        try {
            const { api } = await import("@/lib/api");
            const res = await api(`/api/seller/listings/${auction._id}/accept-early`, { method: "POST" });
            if (res.success) {
                setSuccess(true);
                setTimeout(() => window.location.reload(), 1000);
            } else {
                setError(res.message || "Failed to accept bid");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmittingAccept(false);
        }
    };

    useEffect(() => {
        // Auto-suggest next minimum bid if empty or too low
        if (!bidInput || Number(bidInput) < minBid) {
            setBidInput(minBid.toString());
        }
    }, [minBid]);

    const handleBid = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        
        if (!user) {
            setError("Please sign in to place a bid");
            return;
        }

        const amount = Number(bidInput);
        if (isNaN(amount) || amount < minBid) {
            setError(`Bid must be at least $${minBid.toLocaleString()}`);
            return;
        }

        const res = await placeBid(amount);
        if (res.success) {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            setBidInput((amount + 1).toString());
        } else {
            setError(res.message || "Failed to place bid");
        }
    };

    return (
        <div className="brutal bg-[var(--electric)] text-white p-6 md:p-8 flex flex-col items-center text-center">
            <h3 className="font-display text-sm font-black uppercase tracking-widest text-white/70 mb-2">Current Bid</h3>
            
            {/* Live Price Ticker */}
            <div className="relative font-display text-5xl md:text-6xl font-black drop-shadow-[4px_4px_0_var(--ink)] mb-1 tabular-nums">
                ${Number(auction?.currentPrice || auction?.startingPrice || 0).toLocaleString()}
                <span className="absolute -top-2 -right-6 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
            </div>
            
            <p className="text-sm font-bold text-white/80 mb-6">
                {auction?.bidCount || 0} bids placed
            </p>

            {/* Status alerts */}
            {!isActive && (
                <div className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--acid)] py-3 px-4 font-display text-sm font-black uppercase text-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)]">
                    This auction has ended.
                </div>
            )}
            
            {isOwner && isActive && (
                <div className="w-full space-y-3">
                    <div className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--acid)] py-3 px-4 font-display text-sm font-black uppercase text-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)]">
                        You are the seller of this item.
                    </div>
                    {auction?.bidCount > 0 && (
                        <button
                            onClick={handleAcceptEarly}
                            disabled={submittingAccept}
                            className="w-full flex items-center justify-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--acid)] py-3 px-4 font-display text-sm font-black uppercase text-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--ink)] disabled:opacity-50"
                        >
                            {submittingAccept ? <Loader2 className="animate-spin h-4 w-4" /> : <Gavel className="h-4 w-4" />}
                            Accept Highest Bid Early
                        </button>
                    )}
                </div>
            )}

            {isActive && !isOwner && (
                <form onSubmit={handleBid} className="w-full max-w-sm flex flex-col gap-3">
                    <div className="relative flex items-center">
                        <span className="absolute left-4 font-display text-xl font-black text-[var(--ink)]">$</span>
                        <input 
                            type="number" 
                            min={minBid}
                            step="1"
                            value={bidInput}
                            onChange={(e) => {
                                setBidInput(e.target.value);
                                setError(null);
                            }}
                            className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-white pl-10 pr-4 py-4 font-display text-2xl font-black text-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] focus:outline-none focus:shadow-[6px_6px_0_0_var(--acid)] transition-all"
                            placeholder="Enter amount"
                        />
                    </div>
                    
                    {error && (
                        <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase bg-[var(--hotpink)] text-white py-1.5 px-3 rounded-lg border-[2px] border-[var(--ink)]">
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase bg-[var(--acid)] text-[var(--ink)] py-1.5 px-3 rounded-lg border-[2px] border-[var(--ink)]">
                            <CheckCircle2 size={14} /> You are the highest bidder!
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={submittingBid}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--acid)] py-4 font-display text-lg font-black uppercase text-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--ink)] active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {submittingBid ? <Loader2 className="animate-spin h-6 w-6" /> : <Gavel className="h-6 w-6" strokeWidth={3} />}
                        Place Bid
                    </button>
                    <p className="text-xs font-bold text-white/60">Minimum next bid: ${minBid.toLocaleString()}</p>
                </form>
            )}
        </div>
    );
}
