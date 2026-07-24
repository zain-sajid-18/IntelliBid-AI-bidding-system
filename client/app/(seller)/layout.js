"use client";

import SellerSidebar from "@/components/shared/(sidebar)/SellerSidebar";
import { LiquidCursor } from "@/components/shared/LiquidCursor";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function SellerLayout({ children }) {
  const setViewMode = useAuthStore(s => s.setViewMode);
  const { user, checkAuth } = useAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    setViewMode('seller');
  }, [setViewMode]);

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
        if (meData.user.role !== 'seller' && meData.user.role !== 'admin') {
          router.push('/dashboard');
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
      if (user.role !== 'seller' && user.role !== 'admin') {
        router.push('/dashboard');
      } else {
        setCheckingAuth(false);
      }
    }
  }, [user, checkAuth, router]);

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
      <SellerSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className={`flex-1 transition-[margin] duration-300 ease-out min-w-0 pb-28 md:pb-4 ${sidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
        {children}
      </div>
    </div>
  );
}
