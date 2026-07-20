"use client";

import { LiquidCursor } from "@/components/shared/LiquidCursor";
import AdminSidebar from "@/components/shared/(sidebar)/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="relative flex min-h-screen bg-[var(--background)] text-[var(--ink)]">
      <LiquidCursor />
      <AdminSidebar />
      <div className="flex-1 md:ml-20 min-w-0">
        {children}
      </div>
    </div>
  );
}
