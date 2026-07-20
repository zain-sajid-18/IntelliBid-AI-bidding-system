import { motion } from "framer-motion";
import { Activity, Radio } from "lucide-react";

export default function SystemActivityLog({ activity }) {
  if (!activity || activity.length === 0) {
    return (
      <div className="bg-white border-[3px] border-[var(--ink)] rounded-2xl p-6 text-center shadow-[4px_4px_0_0_var(--ink)] h-full flex flex-col items-center justify-center min-h-[300px]">
        <Activity className="text-gray-300 mb-4" size={48} />
        <h3 className="font-display text-lg font-black uppercase tracking-tight text-gray-400">System Idle</h3>
      </div>
    );
  }

  return (
    <div className="bg-white border-[3px] border-[var(--ink)] rounded-2xl overflow-hidden shadow-[4px_4px_0_0_var(--ink)] h-full">
      <div className="p-5 border-b-[3px] border-[var(--ink)] bg-[var(--electric)] text-white flex justify-between items-center">
        <h2 className="font-display text-xl font-black uppercase tracking-tighter flex items-center gap-2">
          <Radio size={24} className="animate-pulse" /> System Audit Log
        </h2>
      </div>
      
      <div className="p-5 flex flex-col gap-4 max-h-[500px] overflow-y-auto">
        {activity.map((item, i) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border-[2px] border-transparent hover:border-[var(--ink)]"
          >
            <div className="p-2 bg-[var(--ink)] text-white border-[2px] border-[var(--ink)] rounded-lg shadow-[2px_2px_0_0_var(--acid)] shrink-0">
              <Activity size={18} />
            </div>
            <div>
              <p className="font-bold text-sm mb-1">{item.message}</p>
              <p className="text-xs font-medium opacity-60">
                {new Date(item.time).toLocaleString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
