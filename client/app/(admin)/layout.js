"use client";

import { LiquidCursor } from "@/components/shared/LiquidCursor";
import AdminSidebar from "@/components/shared/(sidebar)/AdminSidebar";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-[var(--background)] text-[var(--ink)]">
      <LiquidCursor />
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className={`flex-1 transition-[margin] duration-300 ease-out min-w-0 ${sidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
        {children}
      </div>
    </div>
  );
}
