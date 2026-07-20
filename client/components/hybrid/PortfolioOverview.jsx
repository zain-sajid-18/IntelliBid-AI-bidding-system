"use client";
import React from "react";
import { Hammer, Tag, Calendar } from "lucide-react";

export default function PortfolioOverview({ portfolio }) {
  const bids = portfolio?.bids || [];
  const listings = portfolio?.listings || [];

  return (
    <div className="space-y-6">
      <div className="p-6 brutal bg-white">
        <h2 className="font-display text-2xl font-black uppercase mb-4 flex items-center gap-2">
          <Hammer className="h-6 w-6 text-[var(--hotpink)]" /> Active Bids ({bids.length})
        </h2>
        {bids.length === 0 ? (
          <p className="font-medium text-sm opacity-60 py-4">No active bids in progress. Explore new items!</p>
        ) : (
          <div className="space-y-3">
            {bids.map((bid, i) => (
              <div key={i} className="flex items-center justify-between p-3 border-2 border-[var(--ink)] rounded-xl bg-[var(--background)]">
                <div>
                  <p className="font-bold text-sm">{bid.title || "Auction Item"}</p>
                  <p className="text-xs opacity-60 flex items-center gap-1">
                    <Calendar size={12} /> Ends: {bid.endTime ? new Date(bid.endTime).toLocaleDateString() : "Soon"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display font-black text-sm">${bid.myBidAmount || bid.amount}</p>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded border border-[var(--ink)] bg-[var(--acid)]">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 brutal bg-white">
        <h2 className="font-display text-2xl font-black uppercase mb-4 flex items-center gap-2">
          <Tag className="h-6 w-6 text-[var(--electric)]" /> Active Listings ({listings.length})
        </h2>
        {listings.length === 0 ? (
          <p className="font-medium text-sm opacity-60 py-4">No active auction listings. List an item to start selling!</p>
        ) : (
          <div className="space-y-3">
            {listings.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 border-2 border-[var(--ink)] rounded-xl bg-[var(--background)]">
                <div>
                  <p className="font-bold text-sm">{item.title}</p>
                  <p className="text-xs opacity-60 flex items-center gap-1">
                    Bids: {item.bidCount || 0} • Views: {item.viewCount || 0}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display font-black text-sm">${item.currentPrice || item.startingPrice}</p>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded border border-[var(--ink)] bg-[var(--sunset)] text-white">
                    Live
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
