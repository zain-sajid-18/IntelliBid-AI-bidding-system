"use client";

import { useAuthStore } from "@/store/authStore";
import BuyerSidebar from "@/components/shared/(sidebar)/BuyerSidebar";
import SellerSidebar from "@/components/shared/(sidebar)/SellerSidebar";
import AdminSidebar from "@/components/shared/(sidebar)/AdminSidebar";
import { LiquidCursor } from "@/components/shared/LiquidCursor";
import { useState } from "react";

export default function ChatLayout({ children }) {
    const { user, viewMode } = useAuthStore();
    const isSeller = user?.role === 'seller';
    const isAdmin = user?.role === 'admin';
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Decide sidebar based on user role and current viewMode
    let Sidebar = BuyerSidebar;
    if (isAdmin) Sidebar = AdminSidebar;
    else if (isSeller && viewMode === 'seller') Sidebar = SellerSidebar;
    else if (isSeller && viewMode === 'buyer') Sidebar = BuyerSidebar;

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
