"use client";

import { useAuthStore } from "@/store/authStore";
import BuyerSidebar from "@/components/shared/(sidebar)/BuyerSidebar";
import SellerSidebar from "@/components/shared/(sidebar)/SellerSidebar";
import { LiquidCursor } from "@/components/shared/LiquidCursor";
import { useState } from "react";

export default function ProfileLayout({ children }) {
    const { user, viewMode } = useAuthStore();
    const isSellerRole = user?.role === 'seller';
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Default to BuyerSidebar, use SellerSidebar if in seller mode
    let Sidebar = BuyerSidebar;
    if (isSellerRole && viewMode === 'seller') Sidebar = SellerSidebar;

    return (
        <div className="relative flex min-h-screen bg-[var(--background)] text-[var(--ink)]">
            <LiquidCursor />
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <div className={`flex-1 transition-[margin] duration-300 ease-out min-w-0 ${sidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
                {children}
            </div>
        </div>
    );
}
