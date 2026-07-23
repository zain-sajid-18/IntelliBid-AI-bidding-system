"use client";

import BuyerSidebar from "@/components/shared/(sidebar)/BuyerSidebar";
import { LiquidCursor } from "@/components/shared/LiquidCursor";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";

export default function BuyerLayout({ children }) {
  const setViewMode = useAuthStore(s => s.setViewMode);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setViewMode('buyer');
  }, [setViewMode]);

  return (
    <div className="relative flex min-h-screen bg-[var(--background)] text-[var(--ink)]">
      <LiquidCursor />
      <BuyerSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`flex-1 transition-[margin] duration-300 ease-out min-w-0 ${sidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
        {children}
      </div>
    </div>
  );
}
