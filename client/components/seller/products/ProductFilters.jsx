"use client";

import { Search, SlidersHorizontal } from "lucide-react";

const STATUS_TABS = [
    { key: 'all',       label: 'All' },
    { key: 'active',    label: '🟢 Active' },
    { key: 'live',      label: '⚡ Live Bid' },
    { key: 'scheduled', label: '⏰ Scheduled' },
    { key: 'awaiting_seller_confirmation', label: '⏳ Waiting Confirm' },
    { key: 'sale_confirmed', label: '✅ Sale Confirmed' },
    { key: 'sale_rejected', label: '❌ Sale Rejected' },
    { key: 'draft',     label: '🟡 Drafts' },
    { key: 'ended',     label: '🔴 Ended' },
    { key: 'cancelled', label: '⚪ Cancelled' },
];

const SORT_OPTIONS = [
    { key: 'newest',    label: 'Newest First' },
    { key: 'ending',    label: 'Ending Soon' },
    { key: 'mostbids',  label: 'Most Bids' },
    { key: 'highprice', label: 'Highest Price' },
];

export default function ProductFilters({ status, setStatus, search, setSearch, sort, setSort, counts }) {
    return (
        <div className="space-y-4">
            {/* Status tabs */}
            <div className="flex flex-wrap gap-2">
                {STATUS_TABS.map(tab => {
                    const count = tab.key === 'all'
                        ? Object.values(counts).reduce((a, b) => a + b, 0)
                        : (counts[tab.key] || 0);
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setStatus(tab.key)}
                            className={`flex items-center gap-1.5 rounded-xl border-[3px] border-[var(--ink)] px-3.5 py-1.5 font-display text-xs font-black uppercase transition-all
                                ${status === tab.key
                                    ? 'bg-[var(--ink)] text-white shadow-[3px_3px_0_0_var(--electric)] -translate-y-0.5'
                                    : 'bg-white text-[var(--ink)] hover:bg-[var(--background)] shadow-[2px_2px_0_0_var(--ink)]'
                                }`}
                        >
                            {tab.label}
                            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${status === tab.key ? 'bg-white/20' : 'bg-[var(--ink)]/10'}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Search + Sort */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink)]/40" strokeWidth={2.5} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search your listings…"
                        className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-white pl-9 pr-4 py-2.5 font-medium text-sm shadow-[3px_3px_0_0_var(--ink)] focus:outline-none focus:shadow-[5px_5px_0_0_var(--electric)] transition-shadow"
                    />
                </div>
                <div className="relative">
                    <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink)]/50" strokeWidth={2.5} />
                    <select
                        value={sort}
                        onChange={e => setSort(e.target.value)}
                        className="appearance-none rounded-xl border-[3px] border-[var(--ink)] bg-white pl-9 pr-8 py-2.5 font-display text-xs font-black uppercase shadow-[3px_3px_0_0_var(--ink)] focus:outline-none cursor-pointer"
                    >
                        {SORT_OPTIONS.map(o => (
                            <option key={o.key} value={o.key}>{o.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
