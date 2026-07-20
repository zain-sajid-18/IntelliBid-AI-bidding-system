"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import UnifiedStats from "@/components/hybrid/UnifiedStats";
import PortfolioOverview from "@/components/hybrid/PortfolioOverview";
import CombinedActivityFeed from "@/components/hybrid/CombinedActivityFeed";
import SmartInsights from "@/components/hybrid/SmartInsights";
import { useAuthStore } from "@/store/authStore";
import { Activity, ShieldCheck } from "lucide-react";

export default function HybridDashboard() {
  const user = useAuthStore((state) => state.user);

  const [stats, setStats] = useState(null);
  const [portfolio, setPortfolio] = useState({ bids: [], listings: [] });
  const [activity, setActivity] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, portfolioRes, activityRes, insightsRes] = await Promise.all([
          api('/api/hybrid/dashboard/stats'),
          api('/api/hybrid/portfolio/active'),
          api('/api/hybrid/activity/timeline'),
          api('/api/hybrid/insights/smart')
        ]);

        if (statsRes?.success) setStats(statsRes.data);
        if (portfolioRes?.success) setPortfolio(portfolioRes.data);
        if (activityRes?.success) setActivity(activityRes.data);
        if (insightsRes?.success) setInsights(insightsRes.data);
      } catch (err) {
        console.error("Failed to load hybrid dashboard data:", err);
        setError("Unable to sync your omnichannel data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--sunset)] text-white shadow-[4px_4px_0_0_var(--ink)] animate-pulse">
          <Activity className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="bg-white border-[3px] border-[var(--ink)] p-8 rounded-2xl shadow-[8px_8px_0_0_var(--hotpink)] max-w-lg text-center">
          <h1 className="font-display text-2xl font-black uppercase text-[var(--hotpink)] mb-4">Sync Error</h1>
          <p className="font-bold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[var(--ink)] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1">
              <ShieldCheck size={12} /> Hybrid Access
            </span>
          </div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tighter mb-1">
            Unified Hub
          </h1>
          <p className="font-medium opacity-70">
            Welcome, {user?.firstName}. Managing your buying and selling power in one place.
          </p>
        </div>
      </motion.div>
      <UnifiedStats stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-8">
          <PortfolioOverview portfolio={portfolio} />
          <SmartInsights insights={insights} />
        </div>

        {/* Right Column: Unified Activity Feed */}
        <div className="lg:col-span-1">
          <CombinedActivityFeed activity={activity} />
        </div>

      </div>
    </div>
  );
}