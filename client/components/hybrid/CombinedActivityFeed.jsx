"use client";
import React from "react";
import { Activity, MessageCircle, Hammer, BadgeDollarSign } from "lucide-react";

export default function CombinedActivityFeed({ activity = [] }) {
  const items = activity.length > 0 ? activity : [
    {
      type: "bid",
      text: "You placed a $420 bid on '1984 Vintage Sony Walkman'",
      time: "2 hours ago"
    },
    {
      type: "message",
      text: "New chat message received from Seller 'vintage_collector'",
      time: "4 hours ago"
    },
    {
      type: "outbid",
      text: "Outbid warning: Someone bid $550 on 'Retro Camera Lot'",
      time: "1 day ago"
    }
  ];

  return (
    <div className="p-6 brutal bg-white h-full">
      <h2 className="font-display text-2xl font-black uppercase mb-6 flex items-center gap-2">
        <Activity className="h-6 w-6 text-[var(--sunset)]" /> Activity Feed
      </h2>
      <div className="relative border-l-2 border-[var(--ink)] ml-3 pl-6 space-y-6">
        {items.map((act, i) => {
          let Icon = Activity;
          let iconBg = "bg-[var(--acid)]";
          
          if (act.type === "bid") {
            Icon = Hammer;
            iconBg = "bg-[var(--electric)] text-white";
          } else if (act.type === "message") {
            Icon = MessageCircle;
            iconBg = "bg-[var(--sunset)] text-white";
          } else if (act.type === "outbid") {
            Icon = BadgeDollarSign;
            iconBg = "bg-[var(--hotpink)] text-white";
          }

          return (
            <div key={i} className="relative">
              {/* Timeline dot/icon */}
              <span className={`absolute -left-[37px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--ink)] ${iconBg} text-xs`}>
                <Icon size={12} />
              </span>
              <div>
                <p className="text-xs font-black opacity-40 uppercase tracking-wider mb-0.5">{act.time}</p>
                <p className="text-sm font-bold leading-snug">{act.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
