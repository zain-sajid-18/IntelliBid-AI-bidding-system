import { motion } from "framer-motion";
import { Activity, BellRing, CircleCheck, Zap } from "lucide-react";

export default function RecentBidsFeed({ activity }) {
  if (!activity || activity.length === 0) {
    return (
        <div className="brutal bg-white p-8 h-full flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 rounded-full border-[3px] border-[var(--ink)] bg-[var(--background)] flex items-center justify-center mb-6 shadow-[3px_3px_0_0_var(--ink)]">
                <Activity className="text-[var(--ink)]/40" size={40} />
            </div>
            <h3 className="font-display text-xl font-black uppercase tracking-tight text-[var(--ink)]/60">Zero Static</h3>
            <p className="text-sm font-medium text-[var(--ink)]/50 max-w-[200px] text-center mt-2 leading-tight">No live activity detected yet.</p>
        </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'sale': return <CircleCheck className="text-[var(--acid)]" size={20} strokeWidth={3} />;
      case 'bid': return <BellRing className="text-[var(--electric)]" size={20} strokeWidth={3} />;
      default: return <Zap className="text-[var(--hotpink)]" size={20} strokeWidth={3} />;
    }
  };

  return (
    <div className="brutal bg-white h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b-[3px] border-[var(--ink)] bg-[var(--background)] flex justify-between items-center">
        <h2 className="font-display text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
            <Activity className="text-[var(--hotpink)] animate-pulse" size={24} strokeWidth={3} /> Signal
        </h2>
        <div className="h-3 w-3 rounded-full bg-[var(--acid)] border-[2px] border-[var(--ink)] animate-ping" />
      </div>
      
      <div className="p-6 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
        {activity.map((item, i) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative flex items-start gap-4 p-4 rounded-2xl bg-white border-[3px] border-[var(--ink)] shadow-[3px_3px_0_0_var(--ink)] hover:-translate-y-1 hover:shadow-[5px_5px_0_0_var(--ink)] transition-all"
          >
            <div className="p-2.5 bg-white border-[2.5px] border-[var(--ink)] rounded-xl shadow-[2px_2px_0_0_var(--ink)] shrink-0 group-hover:bg-[var(--background)] transition-colors">
              {getIcon(item.type)}
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm leading-snug mb-2 group-hover:text-[var(--electric)] transition-colors">
                {item.message}
              </p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[var(--ink)] text-white text-[9px] font-black uppercase rounded-md tracking-widest">
                    {item.type}
                </span>
                <span className="text-[10px] font-black uppercase tracking-tighter opacity-40">
                    {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-auto p-4 border-t-[3px] border-[var(--ink)] bg-[var(--background)]/50">
        <button className="w-full py-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity">
            Clear History
        </button>
      </div>
    </div>
  );
}
