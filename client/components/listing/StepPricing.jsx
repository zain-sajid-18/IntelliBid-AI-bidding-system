"use client";

import { motion } from "framer-motion";
import { Clock, DollarSign, Calendar, Info, Eye, Flame, AlertCircle, Zap } from "lucide-react";
import { useListingStore, DURATIONS, LIVE_DURATIONS } from "@/store/listingStore";

function LivePreviewCard({ title, category, image, currentPrice, endTime, bidCount = 0 }) {
    const hoursLeft = endTime
        ? Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 3600000))
        : null;

    return (
        <div className="brutal overflow-hidden bg-white">
            <div className="relative h-48 border-b-[3px] border-[var(--ink)] bg-[var(--background)] overflow-hidden">
                {image ? (
                    <img src={image} alt={title} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Eye className="h-10 w-10 text-[var(--ink)]/20" />
                    </div>
                )}
                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full border-[2px] border-[var(--ink)] bg-[var(--ink)] px-3 py-1 font-display text-[10px] font-black uppercase text-white">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--hotpink)]" /> LIVE
                </div>
                {hoursLeft !== null && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border-[2px] border-[var(--ink)] bg-[var(--acid)] px-2.5 py-1 font-display text-[10px] font-black uppercase">
                        <Clock className="h-3 w-3" /> {hoursLeft}h left
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink)]/50 mb-1">{category || 'Category'}</div>
                <h3 className="font-display text-base font-black leading-tight line-clamp-2">{title || 'Your listing title will appear here'}</h3>
                <div className="mt-3 flex items-end justify-between">
                    <div>
                        <div className="text-[10px] uppercase text-[var(--ink)]/60">Starting price</div>
                        <div className="font-display text-xl font-black">
                            {currentPrice ? `$${Number(currentPrice).toLocaleString()}` : '$—'}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-[var(--ink)]/60">
                        <Flame className="h-3 w-3" /> {bidCount} bids
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function StepPricing() {
    const {
        startingPrice, setStartingPrice,
        reservePrice, setReservePrice,
        durationDays, setDurationDays,
        status, setStatus,
        title, category, imagePreviews,
        type, setType,
        scheduledStartTime, setScheduledStartTime,
        liveDurationMinutes, setLiveDurationMinutes,
    } = useListingStore();

    // Compute end time
    const endTime = new Date();
    if (type === 'live' && scheduledStartTime) {
        endTime.setTime(new Date(scheduledStartTime).getTime() + liveDurationMinutes * 60 * 1000);
    } else {
        endTime.setDate(endTime.getDate() + durationDays);
    }

    // Check reserve price validation
    const parsedStarting = Number(startingPrice);
    const parsedReserve = reservePrice ? Number(reservePrice) : null;
    const hasReserveError = parsedReserve !== null && parsedReserve < parsedStarting && parsedStarting > 0;

    // Live bidding validation
    const hasScheduledTimeError = type === 'live' && (!scheduledStartTime || new Date(scheduledStartTime) <= new Date());

    return (
        <div className="space-y-6">
                <div>
                    <h2 className="font-display text-3xl font-black uppercase tracking-tight">Pricing & Duration</h2>
                    <p className="mt-1 font-medium text-[var(--ink)]/60">
                        Set your price, auction length, and review a live buyer preview.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: form */}
                    <div className="space-y-5">
                        {/* Auction Type Toggle */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-widest">
                                Auction Type
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setType('standard')}
                                    className={`rounded-xl border-[3px] border-[var(--ink)] py-3 font-display text-sm font-black uppercase transition-all
                                        ${type === 'standard'
                                            ? 'bg-[var(--electric)] text-white shadow-[3px_3px_0_0_var(--ink)] -translate-y-1'
                                            : 'bg-white text-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)] hover:bg-[var(--acid)] hover:-translate-y-0.5'
                                        }`}
                                >
                                    Standard
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('live')}
                                    className={`rounded-xl border-[3px] border-[var(--ink)] py-3 font-display text-sm font-black uppercase transition-all
                                        ${type === 'live'
                                            ? 'bg-[var(--hotpink)] text-white shadow-[3px_3px_0_0_var(--ink)] -translate-y-1'
                                            : 'bg-white text-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)] hover:bg-[var(--acid)] hover:-translate-y-0.5'
                                        }`}
                                >
                                    <Zap className="inline w-4 h-4 mr-1" />
                                    Live Bidding
                                </button>
                            </div>
                        </div>

                        {/* Starting Price */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-widest">
                                <DollarSign className="h-4 w-4" />
                                Starting Price <span className="text-[var(--hotpink)]">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[var(--ink)]/40">$</span>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={startingPrice}
                                    onChange={(e) => setStartingPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-white pl-8 pr-4 py-3 font-medium shadow-[3px_3px_0_0_var(--ink)] focus:outline-none focus:shadow-[5px_5px_0_0_var(--electric)] transition-shadow"
                                />
                            </div>
                        </div>

                        {/* Reserve Price */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-widest">
                                <DollarSign className="h-4 w-4" />
                                Reserve Price
                                <span className="rounded-full border-[2px] border-[var(--ink)]/30 px-2 py-0.5 text-[10px] font-bold text-[var(--ink)]/40 normal-case tracking-normal">Optional</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[var(--ink)]/40">$</span>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={reservePrice}
                                    onChange={(e) => setReservePrice(e.target.value)}
                                    placeholder="0.00"
                                    className={`w-full rounded-xl border-[3px] bg-white pl-8 pr-4 py-3 font-medium shadow-[3px_3px_0_0_var(--ink)] focus:outline-none focus:shadow-[5px_5px_0_0_var(--electric)] transition-shadow ${hasReserveError ? 'border-[var(--hotpink)] focus:shadow-[5px_5px_0_0_var(--hotpink)]' : 'border-[var(--ink)]'}`}
                                />
                            </div>
                            {hasReserveError && (
                                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--hotpink)]">
                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                    Reserve price cannot be less than starting price
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--ink)]/50">
                                <Info className="h-3.5 w-3.5 shrink-0" />
                                Auction stays live even if reserve isn't met — winner notified only if reserve is hit
                            </div>
                        </div>

                        {/* Live Bidding Specific Fields */}
                        {type === 'live' && (
                            <>
                                {/* Scheduled Start Time */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-widest">
                                        <Calendar className="h-4 w-4" /> Scheduled Start <span className="text-[var(--hotpink)]">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={scheduledStartTime}
                                        onChange={(e) => setScheduledStartTime(e.target.value)}
                                        className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-white px-4 py-3 font-medium shadow-[3px_3px_0_0_var(--ink)] focus:outline-none focus:shadow-[5px_5px_0_0_var(--electric)] transition-shadow"
                                    />
                                    {hasScheduledTimeError && (
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--hotpink)]">
                                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                            Start time must be in the future
                                        </div>
                                    )}
                                </div>

                                {/* Live Duration */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-widest">
                                        <Clock className="h-4 w-4" /> Live Duration
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {LIVE_DURATIONS.map(d => (
                                            <button
                                                key={d.value}
                                                type="button"
                                                onClick={() => setLiveDurationMinutes(d.value)}
                                                className={`rounded-xl border-[3px] border-[var(--ink)] py-3 font-display text-sm font-black uppercase transition-all
                                                    ${liveDurationMinutes === d.value
                                                        ? 'bg-[var(--electric)] text-white shadow-[3px_3px_0_0_var(--ink)] -translate-y-1'
                                                        : 'bg-white text-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)] hover:bg-[var(--acid)] hover:-translate-y-0.5'
                                                    }`}
                                            >
                                                {d.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Standard Duration */}
                        {type === 'standard' && (
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-widest">
                                    <Calendar className="h-4 w-4" /> Auction Duration
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {DURATIONS.map(d => (
                                        <button
                                            key={d.value}
                                            type="button"
                                            onClick={() => setDurationDays(d.value)}
                                            className={`rounded-xl border-[3px] border-[var(--ink)] py-3 font-display text-sm font-black uppercase transition-all
                                                ${durationDays === d.value
                                                    ? 'bg-[var(--electric)] text-white shadow-[3px_3px_0_0_var(--ink)] -translate-y-1'
                                                    : 'bg-white text-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)] hover:bg-[var(--acid)] hover:-translate-y-0.5'
                                                }`}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* End Time Display */}
                        <p className="text-xs font-bold text-[var(--ink)]/50">
                            Ends: {endTime.toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>

                    {/* Status Toggle */}
                    <div className="space-y-2">
                        <label className="block font-display text-sm font-black uppercase tracking-widest">Publish As</label>
                        <div className="flex gap-3">
                            {['active', 'draft'].map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setStatus(s)}
                                    className={`flex-1 rounded-xl border-[3px] border-[var(--ink)] py-3 font-display text-sm font-black uppercase transition-all
                                        ${status === s
                                            ? 'bg-[var(--ink)] text-white shadow-[3px_3px_0_0_var(--electric)]'
                                            : 'bg-white text-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)] hover:bg-[var(--background)]'
                                        }`}
                                >
                                    {s === 'active' ? '🚀 Publish Live' : '📋 Save as Draft'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Live Preview */}
                <div>
                    <div className="mb-3 flex items-center gap-2 font-display text-sm font-black uppercase tracking-widest text-[var(--ink)]/50">
                        <Eye className="h-4 w-4" /> Buyer Preview
                    </div>
                    <motion.div
                        key={`${title}-${startingPrice}-${imagePreviews[0]}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <LivePreviewCard
                            title={title}
                            category={category}
                            image={imagePreviews[0]}
                            currentPrice={startingPrice}
                            endTime={endTime}
                        />
                    </motion.div>
                    <p className="mt-3 text-center text-xs font-bold text-[var(--ink)]/30 uppercase tracking-widest">
                        This is exactly how buyers will see your listing
                    </p>
                </div>
            </div>
        </div>
    );
}
