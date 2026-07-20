"use client";

import { useEffect } from "react";
import { useAiPicksStore } from "@/store/aiPicksStore";
import AiPickCard from "@/components/picks/AiPickCard";
import { Bot, Sparkles, Filter, AlertCircle, Flame, Zap, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function AiPicksPage() {
    const { fetchPicks, getFilteredPicks, activeFilter, setFilter, loading, error, remainingRefreshes } = useAiPicksStore();

    useEffect(() => {
        fetchPicks(false);
    }, [fetchPicks]);

    const picks = getFilteredPicks();

    const filters = [
        { id: 'all', label: 'All Picks', icon: Sparkles },
        { id: 'steal', label: 'Sniper Steals', icon: AlertCircle },
        { id: 'hot', label: 'Trending Hot', icon: Flame },
        { id: 'match', label: 'Perfect Matches', icon: Sparkles },
        { id: 'fresh', label: 'Just Listed', icon: Zap },
    ];

    return (
        <div className="min-h-screen bg-[var(--background)] p-6 md:p-10">
            {/* Header section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-[4px] border-[var(--ink)] pb-8">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border-[3px] border-[var(--ink)] bg-[var(--acid)] px-4 py-2 font-display text-sm font-black uppercase shadow-[2px_2px_0_0_var(--ink)] mb-4">
                        <Bot className="h-4 w-4" /> BidMind AI Engine
                    </div>
                    <h1 className="font-display text-4xl md:text-6xl font-black uppercase tracking-tight text-[var(--ink)] mb-4 leading-none">
                        Your Personal Broker
                    </h1>
                    <p className="text-lg font-medium text-[var(--ink)]/70">
                        I've analyzed your bidding history and the current market. 
                        Here are the auctions you absolutely shouldn't miss today.
                    </p>
                </div>
                
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <button 
                        onClick={() => fetchPicks(true)}
                        disabled={loading || remainingRefreshes === 0}
                        className="flex w-full md:w-auto items-center justify-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-white px-6 py-3 font-display text-sm font-black uppercase shadow-[4px_4px_0_0_var(--ink)] transition-transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={3} />
                        Refresh Radar
                    </button>
                    <span className={`font-display text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border-[2px] border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)] select-none
                        ${remainingRefreshes === 0 
                            ? 'bg-[var(--hotpink)] text-white' 
                            : 'bg-[var(--acid)] text-[var(--ink)]'
                        }`}
                    >
                        ⚡ {remainingRefreshes !== undefined ? remainingRefreshes : 3} / 3 Refreshes Left
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-8 flex flex-wrap items-center gap-3">
                <div className="mr-2 flex items-center justify-center rounded-xl border-[3px] border-[var(--ink)] bg-[var(--ink)] p-3 text-white">
                    <Filter className="h-5 w-5" />
                </div>
                {filters.map(f => {
                    const Icon = f.icon;
                    const isActive = activeFilter === f.id;
                    return (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`flex items-center gap-2 rounded-xl border-[3px] border-[var(--ink)] px-5 py-3 font-display text-sm font-black uppercase transition-all
                                ${isActive 
                                    ? 'bg-[var(--electric)] text-white shadow-[4px_4px_0_0_var(--ink)] -translate-y-1' 
                                    : 'bg-white text-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)] hover:bg-[var(--acid)] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--ink)]'
                                }`}
                        >
                            <Icon className="h-4 w-4" strokeWidth={3} /> {f.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-[var(--ink)]/50">
                    <Bot className="h-16 w-16 animate-bounce mb-4 text-[var(--electric)]" />
                    <div className="font-display text-xl font-black uppercase tracking-widest animate-pulse">
                        Analyzing the market...
                    </div>
                </div>
            ) : error ? (
                <div className="brutal bg-[var(--hotpink)] text-white p-8 text-center max-w-2xl mx-auto">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                    <h2 className="font-display text-2xl font-black uppercase mb-2">Analysis Failed</h2>
                    <p className="font-medium">{error}</p>
                </div>
            ) : picks.length === 0 ? (
                <div className="brutal bg-white p-12 text-center max-w-2xl mx-auto border-dashed">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-[var(--ink)]/40" />
                    <h2 className="font-display text-2xl font-black uppercase mb-2">No Matches Found</h2>
                    <p className="font-medium text-[var(--ink)]/60">
                        Try checking back later or broadening your filter. The market is quiet right now.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {picks.map((pick, i) => (
                        <AiPickCard key={pick.id} pick={pick} index={i} />
                    ))}
                </div>
            )}
        </div>
    );
}
