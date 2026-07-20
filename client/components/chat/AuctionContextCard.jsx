"use client";

import { motion } from "framer-motion";
import { Clock, Gavel, ExternalLink } from "lucide-react";

function timeLeft(endTime) {
    if (!endTime) return null;
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return "Auction ended";
    const h = Math.floor(diff / 3600000);
    if (h < 24) return `${h}h left`;
    return `${Math.floor(h / 24)}d left`;
}

export default function AuctionContextCard({ auction }) {
    if (!auction) return null;

    const remaining = timeLeft(auction.endTime);

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-3 mt-3 mb-1 flex items-center gap-3 rounded-xl border-[3px] border-[var(--ink)] bg-white shadow-[3px_3px_0_0_var(--ink)] overflow-hidden"
        >
            {/* Thumbnail */}
            <div className="h-16 w-16 shrink-0 border-r-[3px] border-[var(--ink)] bg-[var(--background)] overflow-hidden">
                {auction.images?.[0] ? (
                    <img src={auction.images[0]} alt={auction.title} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">🏷️</div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 py-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink)]/50">Linked Auction</div>
                <div className="font-display text-sm font-black leading-tight truncate">{auction.title}</div>
                <div className="mt-1 flex items-center gap-3 text-[10px] font-bold text-[var(--ink)]/60">
                    {auction.currentPrice && (
                        <span className="flex items-center gap-0.5">
                            <Gavel className="h-3 w-3" /> ${Number(auction.currentPrice).toLocaleString()}
                        </span>
                    )}
                    {remaining && (
                        <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" /> {remaining}
                        </span>
                    )}
                </div>
            </div>

            {/* View link */}
            <a
                href={`/auction/${auction._id || auction.id}`}
                className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-[2px] border-[var(--ink)] bg-[var(--acid)] shadow-[2px_2px_0_0_var(--ink)] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--ink)]"
                title="View auction"
            >
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={3} />
            </a>
        </motion.div>
    );
}
