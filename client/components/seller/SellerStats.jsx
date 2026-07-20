import { motion } from "framer-motion";
import { DollarSign, Package, Truck, Eye, TrendingUp, ArrowUpRight } from "lucide-react";

export default function SellerStats({ stats }) {
  const cards = [
    {
      title: "Gross Revenue",
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "var(--acid)",
      textColor: "var(--ink)",
      trend: "+12.5%",
      sub: "Total earned"
    },
    {
      title: "Active Lots",
      value: stats?.activeListingsCount || 0,
      icon: Package,
      color: "var(--electric)",
      textColor: "white",
      trend: "Live",
      sub: "Bidding now"
    },
    {
      title: "Pending Orders",
      value: stats?.pendingShipments || 0,
      icon: Truck,
      color: "var(--hotpink)",
      textColor: "white",
      trend: "Action Required",
      sub: "Ready to ship"
    },
    {
      title: "Market Views",
      value: (stats?.totalViews || 0).toLocaleString(),
      icon: Eye,
      color: "var(--sunset)",
      textColor: "white",
      trend: "+450",
      sub: "Last 7 days"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05, type: "spring", stiffness: 260, damping: 20 }}
            className="group relative brutal p-6 transition-all hover:-translate-y-2"
            style={{ background: card.color, color: card.textColor }}
          >
            {/* Background pattern */}
            <div className="absolute top-2 right-2 opacity-10 group-hover:rotate-12 transition-transform">
                <Icon size={80} strokeWidth={3} />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-white border-[3px] border-[var(--ink)] rounded-2xl shadow-[3px_3px_0_0_var(--ink)] text-[var(--ink)]">
                        <Icon size={24} strokeWidth={3} />
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border-[2px] border-white/30 text-[10px] font-black uppercase tracking-widest">
                        {card.trend} <ArrowUpRight size={10} strokeWidth={3} />
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="font-display text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                        {card.title}
                    </p>
                    <h3 className="font-display text-4xl font-black tracking-tighter drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                        {card.value}
                    </h3>
                    <p className="text-[10px] font-bold uppercase opacity-60">
                        {card.sub}
                    </p>
                </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
