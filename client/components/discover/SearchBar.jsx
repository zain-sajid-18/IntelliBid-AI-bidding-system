"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SearchBar({ onSearch, loading }) {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    // Debounce input to prevent spamming backend
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);
        return () => clearTimeout(handler);
    }, [query]);

    // Trigger search when debounced query changes
    useEffect(() => {
        onSearch(debouncedQuery);
    }, [debouncedQuery, onSearch]);

    return (
        <div className="relative w-full max-w-2xl mx-auto mb-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative flex items-center"
            >
                <div className="absolute left-4 z-10 flex items-center justify-center text-[var(--ink)]">
                    {loading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-[var(--electric)]" strokeWidth={3} />
                    ) : (
                        <Search className="h-6 w-6 opacity-40" strokeWidth={3} />
                    )}
                </div>
                
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search auctions using AI..."
                    className="w-full rounded-2xl border-[4px] border-[var(--ink)] bg-white py-4 pl-14 pr-6 font-display text-lg font-black text-[var(--ink)] shadow-[6px_6px_0_0_var(--ink)] outline-none transition-all placeholder:text-[var(--ink)]/30 focus:shadow-[8px_8px_0_0_var(--electric)] focus:-translate-y-1"
                />
            </motion.div>
            
            {query.length > 0 && !loading && (
                <div className="absolute -bottom-8 left-0 right-0 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink)]/50">
                        ✨ Semantic Search Active
                    </p>
                </div>
            )}
        </div>
    );
}
