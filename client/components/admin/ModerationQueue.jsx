import { motion } from "framer-motion";
import { AlertTriangle, Check, X, ShieldAlert } from "lucide-react";

export default function ModerationQueue({ queue }) {
  if (!queue || queue.length === 0) {
    return (
      <div className="bg-white border-[3px] border-[var(--ink)] rounded-2xl p-6 text-center shadow-[4px_4px_0_0_var(--ink)] h-full flex flex-col items-center justify-center min-h-[300px]">
        <ShieldAlert className="text-[var(--acid)] mb-4" size={48} />
        <h3 className="font-display text-lg font-black uppercase tracking-tight text-[var(--ink)]">Queue is Clear</h3>
        <p className="text-sm font-medium opacity-60">No items currently require manual review.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-[3px] border-[var(--ink)] rounded-2xl overflow-hidden shadow-[4px_4px_0_0_var(--ink)] h-full">
      <div className="p-5 border-b-[3px] border-[var(--ink)] bg-[var(--hotpink)] text-white flex justify-between items-center">
        <h2 className="font-display text-xl font-black uppercase tracking-tighter flex items-center gap-2">
          <AlertTriangle size={24} /> Action Required
        </h2>
      </div>
      
      <div className="p-5 flex flex-col gap-4 max-h-[500px] overflow-y-auto">
        {queue.map((item, i) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col gap-3 p-4 rounded-xl border-[3px] border-[var(--ink)] bg-gray-50 shadow-[2px_2px_0_0_var(--ink)]"
          >
            <div>
              <p className="font-display font-black text-lg leading-tight">{item.title}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]/60 mt-1">Seller: {item.seller}</p>
            </div>
            <div className="bg-[var(--hotpink)]/10 border-[2px] border-[var(--hotpink)] text-[var(--hotpink)] px-3 py-2 rounded-lg text-xs font-bold uppercase">
              Reason: {item.reason}
            </div>
            <div className="flex gap-2 mt-2">
              <button className="flex-1 flex items-center justify-center gap-1 bg-[var(--acid)] text-[var(--ink)] py-2 border-[2px] border-[var(--ink)] font-black uppercase text-xs rounded-lg shadow-[2px_2px_0_0_var(--ink)] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_var(--ink)] transition-all">
                <Check size={16} /> Approve
              </button>
              <button className="flex-1 flex items-center justify-center gap-1 bg-[var(--ink)] text-white py-2 border-[2px] border-[var(--ink)] font-black uppercase text-xs rounded-lg shadow-[2px_2px_0_0_var(--electric)] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_var(--electric)] transition-all">
                <X size={16} /> Takedown
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
