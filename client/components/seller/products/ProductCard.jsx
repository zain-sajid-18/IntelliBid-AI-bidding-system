"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Eye, Gavel, MoreVertical, Timer, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import QuickActionsMenu from "./QuickActionsMenu";

const STATUS_CONFIG = {
    active:    { label: "Live",      bg: "var(--electric)", text: "#fff" },
    draft:     { label: "Draft",     bg: "var(--acid)",     text: "var(--ink)" },
    ended:     { label: "Ended",     bg: "var(--ink)/20",   text: "var(--ink)" },
    cancelled: { label: "Cancelled", bg: "var(--hotpink)",  text: "#fff" },
};

function CountdownTimer({ endTime }) {
    const [timeLeft, setTimeLeft] = useState("");
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        const calculate = () => {
            const diff = new Date(endTime).getTime() - Date.now();
            if (diff <= 0) return "Ended";

            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);

            setIsUrgent(h < 24);

            if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
            if (h > 0) return `${h}h ${m}m ${s}s`;
            return `${m}m ${s}s`;
        };

        setTimeLeft(calculate());
        const timer = setInterval(() => setTimeLeft(calculate()), 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    return (
        <div className={`flex items-center gap-1.5 rounded-full border-[2px] border-[var(--ink)] px-2.5 py-1 font-display text-[10px] font-black shadow-[2px_2px_0_0_var(--ink)] transition-colors
            ${isUrgent ? 'bg-[var(--hotpink)] text-white animate-pulse' : 'bg-[var(--acid)] text-[var(--ink)]'}`}>
            <Timer className="h-3 w-3" strokeWidth={3} />
            {timeLeft}
        </div>
    );
}

export default function ProductCard({ listing, onDeleted, onEnded }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const cfg = STATUS_CONFIG[listing.status] || STATUS_CONFIG.active;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -8, rotate: -0.5 }}
            className="brutal bg-white overflow-hidden flex flex-col group h-full"
        >
            {/* Image Section */}
            <div className="relative aspect-[4/3] border-b-[3px] border-[var(--ink)] bg-[var(--background)] overflow-hidden shrink-0">
                {listing.image ? (
                    <img 
                        src={listing.image} 
                        alt={listing.title} 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-50">
                        <span className="text-5xl opacity-20">📦</span>
                    </div>
                )}

                {/* Status Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badges */}
                <div className="absolute left-3 top-3 flex flex-col gap-2">
                    <div
                        className="w-fit rounded-full border-[2px] border-[var(--ink)] px-3 py-1 font-display text-[10px] font-black uppercase shadow-[2px_2px_0_0_var(--ink)]"
                        style={{ background: cfg.bg, color: cfg.text }}
                    >
                        {listing.status === 'active' && <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-white align-middle" />}
                        {cfg.label}
                    </div>
                    
                    {listing.status === 'active' && (
                        <CountdownTimer endTime={listing.endTime} />
                    )}
                </div>

                {/* Quick Actions */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setMenuOpen(o => !o);
                            }}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border-[2px] border-[var(--ink)] bg-white shadow-[3px_3px_0_0_var(--ink)] transition-all hover:-translate-y-1 hover:shadow-[5px_5px_0_0_var(--ink)] active:translate-y-0"
                        >
                            <MoreVertical className="h-5 w-5" strokeWidth={3} />
                        </button>
                        {menuOpen && (
                            <QuickActionsMenu
                                listing={listing}
                                onClose={() => setMenuOpen(false)}
                                onDeleted={onDeleted}
                                onEnded={onEnded}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[var(--background)] border-[1.5px] border-[var(--ink)] rounded-md text-[9px] font-black uppercase tracking-wider opacity-60">
                        {listing.category}
                    </span>
                    {listing.bidCount > 5 && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase text-[var(--hotpink)]">
                            <TrendingUp size={10} strokeWidth={3} /> Hot Item
                        </span>
                    )}
                </div>

                <Link href={`/auction/${listing.id}`} className="hover:text-[var(--electric)] transition-colors">
                    <h3 className="font-display text-lg font-black leading-[1.1] line-clamp-2 mb-4 group-hover:underline decoration-2 underline-offset-4">
                        {listing.title}
                    </h3>
                </Link>

                <div className="mt-auto space-y-4">
                    {/* Price Block */}
                    <div className="bg-[var(--background)] border-[2.5px] border-[var(--ink)] p-3 rounded-xl shadow-[3px_3px_0_0_var(--ink)]">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-0.5">Current Bid</p>
                                <p className="font-display text-2xl font-black text-[var(--electric)] drop-shadow-[1px_1px_0_var(--ink)]">
                                    ${Number(listing.currentPrice || listing.startingPrice).toLocaleString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1.5 text-xs font-black">
                                    <Gavel className="h-3.5 w-3.5 text-[var(--hotpink)]" strokeWidth={3} />
                                    {listing.bidCount || 0}
                                </div>
                                <p className="text-[8px] font-bold uppercase opacity-40">Bids Placed</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Stats */}
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-tighter opacity-40">
                            <span className="flex items-center gap-1"><Eye size={12} strokeWidth={3} /> {listing.viewCount ?? 0} Views</span>
                        </div>
                        <Link 
                            href={`/auction/${listing.id}`}
                            className="text-[10px] font-black uppercase tracking-widest text-[var(--electric)] flex items-center gap-1 hover:gap-2 transition-all"
                        >
                            View Live <Clock size={10} strokeWidth={3} />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
