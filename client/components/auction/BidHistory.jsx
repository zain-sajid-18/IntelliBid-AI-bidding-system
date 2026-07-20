"use client";

import { useAuctionStore } from "@/store/auctionStore";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";

export default function BidHistory() {
    const { auction } = useAuctionStore();

    if (!auction?.bidHistory || auction.bidHistory.length === 0) {
        return (
            <div className="rounded-2xl border-[3px] border-[var(--ink)] border-dashed p-6 text-center opacity-60">
                <p className="font-display font-black uppercase text-sm">No bids yet</p>
                <p className="text-xs font-bold mt-1">Be the first to place a bid!</p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border-[4px] border-[var(--ink)] bg-white overflow-hidden shadow-[6px_6px_0_0_var(--ink)]">
            <div className="bg-[var(--ink)] text-white px-4 py-3 flex items-center justify-between">
                <h4 className="font-display text-sm font-black uppercase tracking-widest">Bid History</h4>
                <div className="flex items-center gap-1.5 text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full">
                    <Clock size={12} /> Live
                </div>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
                <AnimatePresence initial={false}>
                    {auction.bidHistory.map((bid, idx) => (
                        <motion.div
                            key={bid.id}
                            initial={{ opacity: 0, y: -20, backgroundColor: 'var(--acid)' }}
                            animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
                            transition={{ duration: 0.5 }}
                            className="flex items-center justify-between p-4 border-b-[2px] border-[var(--ink)]/10 last:border-0"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full border-[2px] border-[var(--ink)] bg-[var(--background)] overflow-hidden shrink-0">
                                    {bid.bidderAvatar ? (
                                        <img src={bid.bidderAvatar} alt={bid.bidderName} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center font-display text-[10px] font-black">
                                            {bid.bidderName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-sm leading-tight">
                                        {idx === 0 ? (
                                            <span className="text-[var(--electric)]">Winning Bid</span>
                                        ) : (
                                            bid.bidderName
                                        )}
                                    </p>
                                    <p className="text-[10px] text-[var(--ink)]/50 font-medium">
                                        {formatDistanceToNow(new Date(bid.time), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                            <div className="font-display text-lg font-black text-[var(--ink)]">
                                ${bid.amount.toLocaleString()}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
