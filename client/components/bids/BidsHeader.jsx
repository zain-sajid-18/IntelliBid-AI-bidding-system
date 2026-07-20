import { useBidsStore } from '@/store/bidsStore';
import { motion } from 'framer-motion';
import { Activity, Trophy, XCircle, DollarSign } from 'lucide-react';

export default function BidsHeader() {
    const { stats } = useBidsStore();

    const statCards = [
        { label: 'Active Bids', value: stats.activeBids || 0, icon: <Activity />, color: 'var(--electric)' },
        { label: 'Items Won', value: stats.itemsWon || 0, icon: <Trophy />, color: 'var(--acid)' },
        { label: 'Lost / Outbid', value: stats.lost || 0, icon: <XCircle />, color: 'var(--sunset)' },
        { label: 'Total Spent', value: `$${(stats.totalSpent || 0).toLocaleString()}`, icon: <DollarSign />, color: 'var(--hotpink)' },
    ];

    return (
        <div className="relative z-20 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {statCards.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 bg-white border-[3px] border-[var(--ink)] p-4 rounded-2xl shadow-[4px_4px_0_0_var(--ink)]"
                >
                    <div 
                        className="w-12 h-12 flex items-center justify-center rounded-xl border-[2px] border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)]"
                        style={{ backgroundColor: stat.color, color: stat.color === 'var(--acid)' ? 'var(--ink)' : 'white' }}
                    >
                        {stat.icon}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            {stat.label}
                        </p>
                        <p className="font-display text-2xl font-black text-[var(--ink)] leading-none mt-1">
                            {stat.value}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
