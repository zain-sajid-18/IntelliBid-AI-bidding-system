import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBehaviorTracker } from '@/hooks/useBehaviorTracker';
import { useFeedStore } from '@/store/feedStore';
import { Check, Sparkles } from 'lucide-react';

const CATEGORIES = [
    { id: 'Electronics', icon: '💻', color: 'var(--electric)' },
    { id: 'Fashion', icon: '👕', color: 'var(--hotpink)' },
    { id: 'Home', icon: '🏠', color: 'var(--acid)' },
    { id: 'Art', icon: '🎨', color: 'var(--sunset)' },
    { id: 'Collectibles', icon: '🧸', color: 'var(--electric)' },
    { id: 'Vehicles', icon: '🚗', color: 'var(--hotpink)' },
    { id: 'Jewelry', icon: '💎', color: 'var(--acid)' },
    { id: 'Sports', icon: '⚽', color: 'var(--sunset)' },
];

export default function ColdStartPicker({ onComplete }) {
    const [selected, setSelected] = useState(new Set());
    const [saving, setSaving] = useState(false);
    const { trackEvent } = useBehaviorTracker(null); // No auctionId needed for category picks
    const resetFeed = useFeedStore(s => s.resetFeed);

    const toggleCategory = (id) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
    };

    const handleSave = async () => {
        if (selected.size === 0) return onComplete();

        setSaving(true);
        // Track synthetic browse events to seed the user profile immediately
        const promises = Array.from(selected).map(category => 
            trackEvent('category_browse', { source: 'onboarding', category })
        );
        
        await Promise.all(promises);
        
        // Give the backend a tiny moment to process, then refresh the feed
        setTimeout(() => {
            resetFeed();
            onComplete();
        }, 500);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white border-[4px] border-[var(--ink)] p-6 md:p-10 rounded-3xl shadow-[12px_12px_0_0_var(--ink)] max-w-2xl w-full max-h-[90vh] flex flex-col"
                >
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--acid)] border-[3px] border-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] mb-4 -rotate-6">
                            <Sparkles size={32} className="text-[var(--ink)]" />
                        </div>
                        <h2 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tighter">
                            Personalize Your Feed
                        </h2>
                        <p className="text-sm md:text-base font-medium opacity-70 mt-2">
                            Select a few categories you love, and we'll magically tailor your auction feed to match your vibe.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 overflow-y-auto p-2 scrollbar-hide">
                        {CATEGORIES.map(cat => {
                            const isSelected = selected.has(cat.id);
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-[3px] transition-all ${
                                        isSelected 
                                            ? 'bg-[var(--ink)] border-[var(--ink)] shadow-[4px_4px_0_0_var(--acid)] -translate-y-1' 
                                            : 'bg-white border-[var(--ink)] hover:shadow-[4px_4px_0_0_var(--ink)] hover:-translate-y-1'
                                    }`}
                                >
                                    {isSelected && (
                                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[var(--acid)] border-[2px] border-[var(--ink)] flex items-center justify-center shadow-[2px_2px_0_0_var(--ink)] z-10">
                                            <Check size={16} className="text-[var(--ink)] font-black" />
                                        </div>
                                    )}
                                    <span className="text-3xl mb-2">{cat.icon}</span>
                                    <span className={`font-black uppercase tracking-widest text-[10px] ${isSelected ? 'text-[var(--acid)]' : 'text-[var(--ink)]'}`}>
                                        {cat.id}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                        <button 
                            onClick={onComplete}
                            className="flex-1 py-4 rounded-xl border-[3px] border-[var(--ink)] font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors"
                        >
                            Skip for now
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={saving || selected.size === 0}
                            className="flex-1 bg-[var(--electric)] text-white py-4 rounded-xl border-[3px] border-[var(--ink)] font-black uppercase tracking-widest text-xs shadow-[4px_4px_0_0_var(--ink)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--ink)] transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-[4px_4px_0_0_var(--ink)]"
                        >
                            {saving ? 'Magic Happening...' : `Build My Feed (${selected.size})`}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
