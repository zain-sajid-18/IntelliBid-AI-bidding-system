"use client";

import { useAuthStore } from "@/store/authStore";
import BuyerSidebar from "@/components/shared/(sidebar)/BuyerSidebar";
import SellerSidebar from "@/components/shared/(sidebar)/SellerSidebar";
import { LiquidCursor } from "@/components/shared/LiquidCursor";

export default function ProfileLayout({ children }) {
    const { user, viewMode } = useAuthStore();
    const isSellerRole = user?.role === 'seller';
    
    // Default to BuyerSidebar, use SellerSidebar if in seller mode
    let Sidebar = BuyerSidebar;
    if (isSellerRole && viewMode === 'seller') Sidebar = SellerSidebar;

    return (
        <div className="relative flex min-h-screen bg-[var(--background)] text-[var(--ink)]">
            <LiquidCursor />
            <Sidebar />

            <div className="flex-1 md:ml-20 min-w-0">
                {children}
            </div>
        </div>
    );
}
