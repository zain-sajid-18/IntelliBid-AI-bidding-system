import { motion } from "framer-motion";
import { Clock, Eye, TrendingUp, MoreVertical, Timer, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

function CountdownTimer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) return "Ended";

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setIsUrgent(h < 24);

      if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
      if (h > 0) return `${h}h ${m}m ${s}s`;
      return `${m}m ${s}s`;
    };

    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className={`flex items-center gap-2 text-xs font-black px-3 py-1.5 rounded-xl border-[2px] border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)] transition-colors
      ${isUrgent ? 'bg-[var(--hotpink)] text-white' : 'bg-[var(--acid)] text-[var(--ink)]'}`}>
      <Timer size={14} strokeWidth={3} className={isUrgent ? 'animate-pulse' : ''} />
      {timeLeft}
    </div>
  );
}

export default function ActiveListingsTable({ listings }) {
  if (!listings || listings.length === 0) {
    return (
      <div className="brutal bg-white p-12 text-center">
        <div className="text-7xl mb-6">📦</div>
        <h3 className="font-display text-2xl font-black uppercase tracking-tight mb-2">No Active Listings</h3>
        <p className="font-medium opacity-60 mb-8 max-w-xs mx-auto text-lg leading-tight">Your auction stage is empty. Let's get something live!</p>
        <Link href="/seller/create" className="inline-flex items-center gap-3 bg-[var(--electric)] text-white px-8 py-4 rounded-2xl border-[3px] border-[var(--ink)] font-display text-base font-black uppercase tracking-widest shadow-[4px_4px_0_0_var(--ink)] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--ink)] active:translate-y-0 transition-all">
          Create Listing
        </Link>
      </div>
    );
  }

  return (
    <div className="brutal bg-white overflow-hidden">
      <div className="p-6 border-b-[3px] border-[var(--ink)] bg-[var(--background)] flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--acid)] border-[2px] border-[var(--ink)] rounded-lg">
                <TrendingUp size={20} strokeWidth={3} />
            </div>
            <h2 className="font-display text-2xl font-black uppercase tracking-tighter">Live Performance</h2>
        </div>
        <Link href="/seller/products" className="group flex items-center gap-2 text-sm font-black uppercase tracking-widest bg-white border-[2px] border-[var(--ink)] px-4 py-2 rounded-xl shadow-[2px_2px_0_0_var(--ink)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--ink)] transition-all">
          Manage All <ExternalLink size={14} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-[3px] border-[var(--ink)] bg-[var(--background)]/50">
              <th className="p-6 font-display text-[10px] font-black uppercase tracking-[0.2em] text-[var(--ink)]/40">Product Detail</th>
              <th className="p-6 font-display text-[10px] font-black uppercase tracking-[0.2em] text-[var(--ink)]/40">Highest Bid</th>
              <th className="p-6 font-display text-[10px] font-black uppercase tracking-[0.2em] text-[var(--ink)]/40 text-center">Engagement</th>
              <th className="p-6 font-display text-[10px] font-black uppercase tracking-[0.2em] text-[var(--ink)]/40">Time Remaining</th>
              <th className="p-6 font-display text-[10px] font-black uppercase tracking-[0.2em] text-[var(--ink)]/40 text-right">Options</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((item, i) => (
              <motion.tr 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b-[2px] border-[var(--ink)]/10 last:border-0 hover:bg-[var(--acid)]/5 transition-colors group"
              >
                <td className="p-6">
                  <Link href={`/auction/${item._id || item.id}`} className="flex items-center gap-5">
                    <div className="relative shrink-0">
                        <img src={item.image} alt={item.title} className="w-16 h-16 rounded-2xl border-[3px] border-[var(--ink)] object-cover bg-white shadow-[3px_3px_0_0_var(--ink)] group-hover:shadow-[5px_5px_0_0_var(--ink)] group-hover:-translate-y-1 transition-all" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-display font-black text-base leading-tight line-clamp-1 mb-1">{item.title}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink)]/40">ID: {(item._id || item.id).toString().slice(-6).toUpperCase()}</span>
                    </div>
                  </Link>
                </td>
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="font-display text-2xl font-black text-[var(--electric)] drop-shadow-[1.5px_1.5px_0_var(--ink)]">
                        ${item.currentBid.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-tighter text-[var(--ink)]/30">Start: ${item.startingPrice}</span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5 bg-white border-[2px] border-[var(--ink)] px-3 py-1 rounded-full text-xs font-black shadow-[2px_2px_0_0_var(--ink)]">
                        <Gavel size={12} strokeWidth={3} className="text-[var(--hotpink)]" /> {item.bidCount} Bids
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <CountdownTimer endTime={item.endTime} />
                </td>
                <td className="p-6 text-right">
                    <button className="h-10 w-10 flex items-center justify-center hover:bg-[var(--ink)] hover:text-white border-[2px] border-transparent hover:border-[var(--ink)] rounded-xl transition-all">
                        <MoreVertical size={20} strokeWidth={3} />
                    </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Add Gavel icon for consistency
function Gavel({ size, strokeWidth, className }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth={strokeWidth} 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="m14.5 12.5-8 8a2.11 2.11 0 0 1-3-3l8-8" />
            <path d="m16 16 6-6" />
            <path d="m8 8 6-6" />
            <path d="m9 7 8 8" />
            <path d="m21 11-8-8" />
        </svg>
    );
}
