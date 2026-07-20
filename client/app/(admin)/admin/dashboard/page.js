"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import PlatformStats from "@/components/admin/PlatformStats";
import RecentUsersTable from "@/components/admin/RecentUsersTable";
import ModerationQueue from "@/components/admin/ModerationQueue";
import SystemActivityLog from "@/components/admin/SystemActivityLog";
import { useAuthStore } from "@/store/authStore";
import { ShieldAlert } from "lucide-react";

export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [moderationQueue, setModerationQueue] = useState([]);
  const [systemActivity, setSystemActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, usersRes, modRes, actRes] = await Promise.all([
          api('/api/admin/dashboard/stats'),
          api('/api/admin/users/recent'),
          api('/api/admin/moderation/queue'),
          api('/api/admin/activity/system')
        ]);

        if (statsRes?.success) setStats(statsRes.data);
        if (usersRes?.success) setRecentUsers(usersRes.data);
        if (modRes?.success) setModerationQueue(modRes.data);
        if (actRes?.success) setSystemActivity(actRes.data);
      } catch (error) {
        console.error("Failed to load admin dashboard data:", error);
        setError("You do not have authorization to view this page or the server failed.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--ink)] text-white shadow-[4px_4px_0_0_var(--acid)] animate-pulse">
          <ShieldAlert className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="bg-white border-[3px] border-[var(--ink)] p-8 rounded-2xl shadow-[8px_8px_0_0_var(--hotpink)] max-w-lg text-center">
            <h1 className="font-display text-2xl font-black uppercase text-[var(--hotpink)] mb-4">Access Denied</h1>
            <p className="font-bold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tighter mb-2">
            Command Center
          </h1>
          <p className="font-medium opacity-70">
            Welcome back, Administrator {user?.firstName}. System operations are nominal.
          </p>
        </div>
      </motion.div>

      {/* Global KPIs */}
      <PlatformStats stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Users & System Activity */}
        <div className="lg:col-span-2 space-y-8">
          <RecentUsersTable users={recentUsers} />
          <SystemActivityLog activity={systemActivity} />
        </div>

        {/* Right Column: Moderation Queue */}
        <div className="lg:col-span-1">
          <ModerationQueue queue={moderationQueue} />
        </div>

      </div>
    </div>
  );
}
