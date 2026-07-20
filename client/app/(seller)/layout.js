"use client";

import SellerSidebar from "@/components/shared/(sidebar)/SellerSidebar";
import { LiquidCursor } from "@/components/shared/LiquidCursor";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export default function SellerLayout({ children }) {
  const setViewMode = useAuthStore(s => s.setViewMode);

  useEffect(() => {
    setViewMode('seller');
  }, [setViewMode]);

  return (
    <div className="relative flex min-h-screen bg-[var(--background)] text-[var(--ink)]">
      <LiquidCursor />
      <SellerSidebar />
      <div className="flex-1 md:ml-20 min-w-0">
        {children}
      </div>
    </div>
  );
}
