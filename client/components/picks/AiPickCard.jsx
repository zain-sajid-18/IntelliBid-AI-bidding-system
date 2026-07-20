import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Bot, ArrowUpRight, Flame, Zap, Sparkles, Plus, AlertCircle } from "lucide-react";
import Link from "next/link";

const getTagConfig = (tag) => {
    switch (tag) {
        case 'steal': return { bg: 'bg-[var(--hotpink)]', text: 'text-white', icon: AlertCircle };
        case 'hot': return { bg: 'bg-[var(--sunset)]', text: 'text-[var(--ink)]', icon: Flame };
        case 'match': return { bg: 'bg-[var(--acid)]', text: 'text-[var(--ink)]', icon: Sparkles };
        case 'fresh': return { bg: 'bg-[var(--electric)]', text: 'text-white', icon: Zap };
        default: return { bg: 'bg-[var(--ink)]', text: 'text-white', icon: Plus };
    }
};

export default function AiPickCard({ pick, index }) {
    const [timeLeft, setTimeLeft] = useState('');
    const config = getTagConfig(pick.tag);
    const TagIcon = config.icon;

    useEffect(() => {
        const updateTimer = () => {
            const diff = new Date(pick.endTime).getTime() - Date.now();
            if (diff <= 0) return setTimeLeft('Ended');
            
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            
            if (h > 24) setTimeLeft(`${Math.floor(h/24)}d ${h%24}h left`);
            else setTimeLeft(`${h}h ${m}m ${s}s left`);
        };
        
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [pick.endTime]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="brutal group flex flex-col bg-white overflow-hidden hover:-translate-y-1 transition-transform shadow-[6px_6px_0_0_var(--ink)] h-full"
        >
            {/* Image Header */}
            <div className="relative h-56 border-b-[3px] border-[var(--ink)] overflow-hidden bg-[var(--background)]">
                <img 
                    src={pick.image} 
                    alt={pick.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Tag Badge */}
                <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-[3px] border-[var(--ink)] font-display text-xs font-black uppercase shadow-[2px_2px_0_0_var(--ink)] ${config.bg} ${config.text}`}>
                    <TagIcon className="h-3.5 w-3.5" strokeWidth={3} />
                    {pick.tagLabel}
                </div>

                {/* Timer Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-[3px] border-[var(--ink)] bg-white font-display text-xs font-black uppercase shadow-[2px_2px_0_0_var(--ink)] text-[var(--ink)]">
                    <Clock className={`h-3.5 w-3.5 ${pick.tag === 'steal' ? 'text-[var(--hotpink)] animate-pulse' : ''}`} strokeWidth={3} />
                    {timeLeft}
                </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <div className="text-xs font-bold uppercase tracking-widest text-[var(--ink)]/50">{pick.category}</div>
                    <div className="flex items-center gap-1 text-xs font-bold text-[var(--ink)]/60">
                        <Flame className="h-3 w-3" /> {pick.bidCount} Bids
                    </div>
                </div>

                <h3 className="font-display text-xl font-black leading-tight mb-4 group-hover:text-[var(--electric)] transition-colors line-clamp-2">
                    {pick.title}
                </h3>

                {/* Gemini Hook */}
                {pick.hook && (
                    <div className="mt-auto mb-5 rounded-xl border-[2px] border-dashed border-[var(--ink)]/30 bg-[var(--background)] p-3 flex gap-3 items-start relative overflow-hidden group-hover:border-[var(--electric)] transition-colors">
                        <div className="absolute -right-2 -bottom-2 text-[var(--electric)] opacity-10">
                            <Bot className="w-16 h-16" />
                        </div>
                        <Bot className="h-5 w-5 shrink-0 text-[var(--electric)] mt-0.5" />
                        <p className="text-sm font-medium italic text-[var(--ink)]/80 relative z-10 leading-snug">
                            "{pick.hook}"
                        </p>
                    </div>
                )}

                {/* Footer / CTA */}
                <div className="flex items-end justify-between border-t-[3px] border-[var(--ink)] pt-4 mt-auto">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-[var(--ink)]/60">Current Price</div>
                        <div className="font-display text-2xl font-black">${pick.currentPrice?.toLocaleString()}</div>
                    </div>
                    
                    <Link 
                        href={`/auction/${pick.id}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-[var(--ink)] bg-[var(--acid)] shadow-[2px_2px_0_0_var(--ink)] transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--ink)]"
                    >
                        <ArrowUpRight className="h-5 w-5" strokeWidth={3} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
