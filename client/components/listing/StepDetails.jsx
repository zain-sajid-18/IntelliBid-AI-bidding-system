"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, X, Plus, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { useListingStore, CATEGORIES } from "@/store/listingStore";

export default function StepDetails() {
    const {
        title, setTitle,
        description, setDescription,
        category, setCategory,
        tags, addTag, removeTag,
        aiLoading, aiError, aiUsed,
        runAiEnhance,
    } = useListingStore();

    const [tagInput, setTagInput] = useState('');

    const handleTagKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
            e.preventDefault();
            addTag(tagInput.trim());
            setTagInput('');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-3xl font-black uppercase tracking-tight">Listing Details</h2>
                <p className="mt-1 font-medium text-[var(--ink)]/60">
                    Fill in manually or let BidMind AI write it for you.
                </p>
            </div>

            {/* Title */}
            <div className="space-y-2">
                <label className="block font-display text-sm font-black uppercase tracking-widest">
                    Title <span className="text-[var(--hotpink)]">*</span>
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={70}
                    placeholder="e.g. Vintage Sony Walkman TPS-L2"
                    className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-white px-4 py-3 font-medium shadow-[3px_3px_0_0_var(--ink)] focus:outline-none focus:shadow-[5px_5px_0_0_var(--electric)] transition-shadow"
                />
                <div className="text-right text-xs font-bold text-[var(--ink)]/40">{title.length}/70</div>
            </div>

            {/* Category */}
            <div className="space-y-2">
                <label className="block font-display text-sm font-black uppercase tracking-widest">
                    Category <span className="text-[var(--hotpink)]">*</span>
                </label>
                <div className="relative">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full appearance-none rounded-xl border-[3px] border-[var(--ink)] bg-white px-4 py-3 font-medium shadow-[3px_3px_0_0_var(--ink)] focus:outline-none cursor-pointer"
                    >
                        <option value="">Select a category…</option>
                        {CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5" strokeWidth={3} />
                </div>
            </div>

            {/* AI Enhance Button */}
            <div>
                <button
                    type="button"
                    disabled={!title || !category || aiLoading}
                    onClick={runAiEnhance}
                    className={`flex w-full items-center justify-center gap-3 rounded-xl border-[3px] border-[var(--ink)] py-4 font-display text-sm font-black uppercase tracking-wide transition-all
                        ${aiUsed 
                            ? 'bg-[var(--electric)] text-white shadow-[4px_4px_0_0_var(--ink)]'
                            : 'bg-[var(--acid)] text-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--ink)]'
                        }
                        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
                >
                    {aiLoading ? (
                        <>
                            <Bot className="h-5 w-5 animate-bounce" strokeWidth={3} />
                            BidMind is writing your listing…
                        </>
                    ) : aiUsed ? (
                        <>
                            <CheckCircle2 className="h-5 w-5" strokeWidth={3} />
                            AI Enhanced — Edit below if needed
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-5 w-5" strokeWidth={3} />
                            ✨ Enhance with AI — Auto-fill title, description & tags
                        </>
                    )}
                </button>

                <AnimatePresence>
                    {aiError && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 flex items-center gap-2 rounded-lg border-[2px] border-[var(--hotpink)] bg-[var(--hotpink)]/10 px-3 py-2 text-sm font-bold text-[var(--hotpink)]"
                        >
                            <AlertCircle className="h-4 w-4 shrink-0" /> {aiError} — Please fill manually.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label className="block font-display text-sm font-black uppercase tracking-widest">
                    Description <span className="text-[var(--hotpink)]">*</span>
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={7}
                    placeholder="Describe your item — condition, history, what makes it special…"
                    className="w-full resize-none rounded-xl border-[3px] border-[var(--ink)] bg-white px-4 py-3 font-medium shadow-[3px_3px_0_0_var(--ink)] focus:outline-none focus:shadow-[5px_5px_0_0_var(--electric)] transition-shadow"
                />
            </div>

            {/* Tags */}
            <div className="space-y-2">
                <label className="block font-display text-sm font-black uppercase tracking-widest">
                    Tags <span className="text-[var(--ink)]/40 font-medium normal-case tracking-normal text-xs">(max 8)</span>
                </label>
                <div className="flex flex-wrap gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-white p-3 shadow-[3px_3px_0_0_var(--ink)] min-h-[56px]">
                    {tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1.5 rounded-lg border-[2px] border-[var(--ink)] bg-[var(--acid)] px-3 py-1 font-display text-xs font-black uppercase shadow-[2px_2px_0_0_var(--ink)]">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)}>
                                <X className="h-3 w-3" strokeWidth={3} />
                            </button>
                        </span>
                    ))}
                    {tags.length < 8 && (
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            placeholder={tags.length === 0 ? 'Type a tag, press Enter…' : '+ add tag'}
                            className="flex-1 min-w-[120px] bg-transparent text-sm font-medium focus:outline-none placeholder:text-[var(--ink)]/30"
                        />
                    )}
                </div>
                <p className="text-xs font-bold text-[var(--ink)]/40">Press Enter or comma to add a tag</p>
            </div>
        </div>
    );
}
