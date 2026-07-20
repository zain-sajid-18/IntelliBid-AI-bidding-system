import { motion } from "framer-motion";
import { Sparkles, AlertTriangle, TrendingUp, ArrowRight, Lightbulb } from "lucide-react";

export default function SellerInsights({ insights }) {
  if (!insights || insights.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
        case 'warning': return <AlertTriangle size={20} strokeWidth={3} className="text-white" />;
        case 'optimization': return <Lightbulb size={20} strokeWidth={3} className="text-white" />;
        case 'trend': return <TrendingUp size={20} strokeWidth={3} className="text-white" />;
        default: return <Sparkles size={20} strokeWidth={3} className="text-white" />;
    }
  };

  const getColor = (type) => {
      switch (type) {
          case 'warning': return 'var(--hotpink)';
          case 'optimization': return 'var(--electric)';
          case 'trend': return 'var(--acid)';
          default: return 'var(--ink)';
      }
  };

  return (
    <div className="brutal bg-white overflow-hidden">
      <div className="p-6 border-b-[3px] border-[var(--ink)] bg-[var(--ink)] text-white flex justify-between items-center">
        <h2 className="font-display text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
          <Sparkles size={24} className="text-[var(--acid)]" strokeWidth={3} /> Intelligence Hub
        </h2>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">AI Powered</span>
      </div>
      
      <div className="p-8">
        <div className="grid grid-cols-1 gap-6">
          {insights.map((insight, i) => (
            <motion.div 
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group border-[3px] border-[var(--ink)] rounded-2xl overflow-hidden bg-white hover:-translate-y-1.5 hover:shadow-[6px_6px_0_0_var(--ink)] transition-all flex flex-col md:flex-row shadow-[3px_3px_0_0_var(--ink)]"
            >
              <div 
                className="p-6 flex items-center justify-center border-b-[3px] md:border-b-0 md:border-r-[3px] border-[var(--ink)] w-full md:w-20 shrink-0 transition-colors group-hover:brightness-110"
                style={{ background: getColor(insight.type) }}
              >
                  {getIcon(insight.type)}
              </div>
              <div className="p-6 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h4 className="font-display text-xl font-black uppercase tracking-tight mb-2">
                    {insight.title}
                  </h4>
                  <p className="text-base font-medium opacity-60 leading-relaxed max-w-xl">
                    {insight.description}
                  </p>
                </div>
                <button className="whitespace-nowrap flex items-center justify-center gap-2 px-6 py-3 bg-[var(--ink)] text-white border-[2px] border-[var(--ink)] font-display text-xs font-black uppercase tracking-widest rounded-xl shadow-[4px_4px_0_0_var(--acid)] hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--acid)] transition-all active:translate-y-1">
                  {insight.action} <ArrowRight size={16} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
