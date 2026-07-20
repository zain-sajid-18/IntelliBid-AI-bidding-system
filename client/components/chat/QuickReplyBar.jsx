"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const TEMPLATES = [
    "Thank you for your interest! Happy to answer any questions about this item.",
    "This item ships within 2 business days of auction close via tracked courier.",
    "The condition is excellent — no visible scratches, dents, or damage.",
    "I accept returns within 7 days if the item is significantly not as described.",
    "Feel free to ask for more photos — I'm happy to provide additional images.",
    "Payment is due within 48 hours of auction end via the platform checkout.",
];

export default function QuickReplyBar({ onSelect }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="border-t-[2px] border-[var(--ink)]/10 bg-[var(--background)] px-3 pt-2 pb-1">
            <button
                onClick={() => setExpanded(e => !e)}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--ink)]/50 hover:text-[var(--ink)] transition-colors"
            >
                <Zap className="h-3 w-3" strokeWidth={3} />
                Quick Replies
                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
                            {TEMPLATES.map((t, i) => (
                                <button
                                    key={i}
                                    onClick={() => { onSelect(t); setExpanded(false); }}
                                    className="shrink-0 max-w-[220px] truncate rounded-xl border-[2px] border-[var(--ink)] bg-white px-3 py-2 text-left text-[11px] font-medium shadow-[2px_2px_0_0_var(--ink)] transition-all hover:bg-[var(--acid)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--ink)]"
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
