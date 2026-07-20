import { motion } from 'framer-motion';

export default function BidsEmpty({ tab }) {
    const content = {
        active: { icon: '🏃‍♂️', title: 'No active bids', desc: 'You are not currently bidding on anything.' },
        won: { icon: '😢', title: 'No wins yet', desc: 'You haven\'t won any auctions yet. Keep trying!' },
        lost: { icon: '💪', title: 'No losses', desc: 'You haven\'t lost any auctions recently.' },
        all: { icon: '👻', title: 'It\'s a ghost town', desc: 'You have no bidding history.' }
    }[tab] || content.all;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center justify-center py-24 text-center bg-white border-[3px] border-[var(--ink)] border-dashed rounded-2xl"
        >
            <div className="text-6xl mb-4 grayscale opacity-50">{content.icon}</div>
            <h3 className="font-display text-2xl font-black uppercase tracking-tight">{content.title}</h3>
            <p className="text-sm font-medium opacity-70 mt-2">{content.desc}</p>
        </motion.div>
    );
}
