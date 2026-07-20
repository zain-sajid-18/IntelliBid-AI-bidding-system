"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import SellerStats from "@/components/seller/SellerStats";
import ProductCard from "@/components/seller/products/ProductCard";
import RecentBidsFeed from "@/components/seller/RecentBidsFeed";
import SellerInsights from "@/components/seller/SellerInsights";
import { useAuthStore } from "@/store/authStore";
import { LayoutDashboard, Sparkles, TrendingUp, Zap, ArrowRight, Package, Plus } from "lucide-react";
import Link from "next/link";

export default function SellerDashboard() {
  const user = useAuthStore((state) => state.user);
  
  const [stats, setStats] = useState(null);
  const [activeListings, setActiveListings] = useState([]);
  const [activity, setActivity] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, listingsRes, actRes, insightsRes] = await Promise.all([
          api('/api/seller/dashboard/stats'),
          api('/api/seller/listings/active'),
          api('/api/seller/activity/recent'),
          api('/api/seller/insights/ai')
        ]);

        if (statsRes?.success) setStats(statsRes.data);
        if (listingsRes?.success) setActiveListings(listingsRes.data);
        if (actRes?.success) setActivity(actRes.data);
        if (insightsRes?.success) setInsights(insightsRes.data);
      } catch (error) {
        console.error("Failed to load seller dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="relative">
            <div className="h-24 w-24 rounded-3xl border-[4px] border-[var(--ink)] bg-[var(--acid)] shadow-[6px_6px_0_0_var(--ink)] animate-bounce flex items-center justify-center">
                <LayoutDashboard className="h-10 w-10 text-[var(--ink)]" strokeWidth={3} />
            </div>
            <div className="absolute -top-2 -right-2">
                <Zap className="text-[var(--hotpink)] animate-pulse" fill="var(--hotpink)" size={24} />
            </div>
        </div>
        <p className="mt-8 font-display text-xl font-black uppercase tracking-widest animate-pulse">Initializing Hub...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-[4px] border-[var(--ink)] pb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--electric)] rounded-lg border-[2px] border-[var(--ink)] text-white">
                <Sparkles size={18} strokeWidth={3} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-[var(--ink)]/40">Market Terminal</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            Seller <span className="text-[var(--electric)] underline decoration-[6px] underline-offset-8">Hub</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 bg-white border-[3px] border-[var(--ink)] p-4 rounded-2xl shadow-[4px_4px_0_0_var(--ink)]">
            <div className="h-12 w-12 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--acid)] flex items-center justify-center text-xl font-black">
                {user?.firstName?.charAt(0) || 'S'}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Active Operator</p>
                <p className="font-bold text-lg leading-none">{user?.firstName} {user?.lastName || 'Seller'}</p>
            </div>
        </div>
      </motion.div>

      {/* Primary Metrics */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
            <TrendingUp className="text-[var(--hotpink)]" strokeWidth={3} size={20} />
            <h2 className="font-display text-sm font-black uppercase tracking-widest">Real-time Performance</h2>
        </div>
        <SellerStats stats={stats} />
      </section>

      {/* Integrated Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Analytics & Active Operations */}
        <div className="xl:col-span-8 space-y-10">
          {/* Active Listings Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--acid)] border-[2px] border-[var(--ink)] rounded-lg">
                  <Package size={20} strokeWidth={3} />
                </div>
                <h2 className="font-display text-2xl font-black uppercase tracking-tighter">Active Listings</h2>
              </div>
              <Link href="/seller/products" className="flex items-center gap-2 text-sm font-black uppercase tracking-widest hover:text-[var(--electric)] transition-colors">
                Manage All <ArrowRight size={16} strokeWidth={3} />
              </Link>
            </div>

            {activeListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeListings.slice(0, 4).map((listing) => (
                  <ProductCard 
                    key={listing.id} 
                    listing={{
                      ...listing,
                      status: 'active' // Ensure status is passed for the card logic
                    }} 
                  />
                ))}
              </div>
            ) : (
              <div className="brutal bg-white p-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="font-display text-xl font-black uppercase">No Active Listings</h3>
                <p className="mt-2 font-medium text-[var(--ink)]/60">Ready to start your next auction?</p>
                <Link href="/seller/create" className="mt-6 inline-flex items-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--ink)] px-6 py-3 font-display text-sm font-black uppercase text-white shadow-[4px_4px_0_0_var(--electric)] transition-all hover:-translate-y-1">
                  <Plus size={16} strokeWidth={3} /> Create Listing
                </Link>
              </div>
            )}
          </div>

          <SellerInsights insights={insights} />
        </div>

        {/* Live Terminal */}
        <div className="xl:col-span-4">
          <div className="sticky top-10">
            <RecentBidsFeed activity={activity} />
          </div>
        </div>

      </div>
    </div>
  );
}
