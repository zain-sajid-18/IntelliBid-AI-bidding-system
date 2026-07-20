"use client";
import React from "react";
import { Sparkles, TrendingUp } from "lucide-react";

export default function SmartInsights({ insights = [] }) {
  const list = insights.length > 0 ? insights : [
    {
      title: "Market Demand Peak",
      desc: "Tech gadgets in vintage aesthetics are seeing 40% higher bid velocities this week. Consider listing early.",
      type: "trend"
    },
    {
      title: "AI Recommendation",
      desc: "Based on your view history, bidding on retro items during weekend evenings yields higher success rates.",
      type: "ai"
    }
  ];

  return (
    <div className="p-6 brutal bg-white">
      <h2 className="font-display text-2xl font-black uppercase mb-4 flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-[var(--acid)]" /> Smart AI Insights
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((ins, i) => (
          <div
            key={i}
            className="p-4 border-2 border-[var(--ink)] rounded-2xl bg-[var(--background)] flex gap-3"
          >
            <div className="mt-1">
              {ins.type === "trend" ? (
                <TrendingUp className="h-5 w-5 text-[var(--electric)]" />
              ) : (
                <Sparkles className="h-5 w-5 text-[var(--hotpink)]" />
              )}
            </div>
            <div>
              <p className="font-display font-bold text-sm text-[var(--ink)]">{ins.title}</p>
              <p className="text-xs font-medium opacity-80 mt-1 leading-relaxed">{ins.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
