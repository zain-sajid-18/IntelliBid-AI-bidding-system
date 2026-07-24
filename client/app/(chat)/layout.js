"use client";

import { useAuthStore } from "@/store/authStore";
import BuyerSidebar from "@/components/shared/(sidebar)/BuyerSidebar";
import SellerSidebar from "@/components/shared/(sidebar)/SellerSidebar";
import AdminSidebar from "@/components/shared/(sidebar)/AdminSidebar";
import { LiquidCursor } from "@/components/shared/LiquidCursor";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ChatLayout({ children }) {
    const { user, viewMode, checkAuth } = useAuthStore();
    const router = useRouter();
    const isSeller = user?.role === 'seller';
    const isAdmin = user?.role === 'admin';
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            setCheckingAuth(true);
            try {
                await checkAuth();
                const meData = await api('/api/auth/me');
                if (!meData || !meData.success || !meData.user) {
                    router.push('/login');
                    return;
                }
            } catch (err) {
                router.push('/login');
                return;
            } finally {
                setCheckingAuth(false);
            }
        };

        if (!user) {
            verifyAuth();
        } else {
            setCheckingAuth(false);
        }
    }, [user, checkAuth, router]);

    // Decide sidebar based on user role and current viewMode
    let Sidebar = BuyerSidebar;
    if (isAdmin) Sidebar = AdminSidebar;
    else if (isSeller && viewMode === 'seller') Sidebar = SellerSidebar;
    else if (isSeller && viewMode === 'buyer') Sidebar = BuyerSidebar;

    if (checkingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
                <div className="animate-pulse font-display text-xl font-black uppercase text-[var(--ink)]/60">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen bg-[var(--background)] text-[var(--ink)]">
            <LiquidCursor />
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <div className={`flex-1 transition-[margin] duration-300 ease-out min-w-0 pb-28 md:pb-4 ${sidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
                {children}
            </div>
        </div>
    );
}
