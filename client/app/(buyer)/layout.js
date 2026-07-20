"use client";

import BuyerSidebar from "@/components/shared/(sidebar)/BuyerSidebar";
import { LiquidCursor } from "@/components/shared/LiquidCursor";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export default function BuyerLayout({ children }) {
  const setViewMode = useAuthStore(s => s.setViewMode);

  useEffect(() => {
    setViewMode('buyer');
  }, [setViewMode]);

  return (
    <div className="relative flex min-h-screen bg-[var(--background)] text-[var(--ink)]">
      <LiquidCursor />
      <BuyerSidebar />

      <div className="flex-1 md:ml-20 min-w-0">
        {children}
      </div>
    </div>
  );
}
