"use client";
import React from "react";
import { ArrowUpRight, ArrowDownLeft, DollarSign, Wallet } from "lucide-react";

export default function UnifiedStats({ stats }) {
  const activeBids = stats?.activeBids ?? 0;
  const activeListings = stats?.activeListings ?? 0;
  const totalSales = stats?.totalSales ?? 0;
  const activeOffers = stats?.activeOffers ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Active Bids */}
      <div className="p-6 brutal bg-[var(--acid)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform">
        <div className="flex items-center justify-between mb-4">
          <span className="font-display font-black text-sm uppercase text-[var(--ink)] tracking-wider">Active Bids</span>
          <ArrowUpRight className="h-6 w-6 text-[var(--ink)]" />
        </div>
        <p className="font-display text-4xl font-black text-[var(--ink)]">{activeBids}</p>
      </div>

      {/* Active Listings */}
      <div className="p-6 brutal bg-[var(--electric)] text-white hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform">
        <div className="flex items-center justify-between mb-4">
          <span className="font-display font-black text-sm uppercase tracking-wider">Active Listings</span>
          <ArrowDownLeft className="h-6 w-6 text-white" />
        </div>
        <p className="font-display text-4xl font-black">{activeListings}</p>
      </div>

      {/* Net Earnings */}
      <div className="p-6 brutal bg-[var(--hotpink)] text-white hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform">
        <div className="flex items-center justify-between mb-4">
          <span className="font-display font-black text-sm uppercase tracking-wider">Total Sales</span>
          <DollarSign className="h-6 w-6 text-white" />
        </div>
        <p className="font-display text-4xl font-black">${totalSales.toLocaleString()}</p>
      </div>

      {/* Active Offers */}
      <div className="p-6 brutal bg-[var(--sunset)] text-white hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform">
        <div className="flex items-center justify-between mb-4">
          <span className="font-display font-black text-sm uppercase tracking-wider">Active Offers</span>
          <Wallet className="h-6 w-6 text-white" />
        </div>
        <p className="font-display text-4xl font-black">{activeOffers}</p>
      </div>
    </div>
  );
}
