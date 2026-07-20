"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import ProfileHeader from "@/components/profile/ProfileHeader";
import EditProfileForm from "@/components/profile/EditProfileForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import NotificationsForm from "@/components/profile/NotificationsForm";
import DangerZone from "@/components/profile/DangerZone";
import { useAuthStore } from "@/store/authStore";
import { Loader2, RefreshCw, Store, TrendingUp, Zap } from "lucide-react";

export default function ProfilePage() {
    const { user: authUser } = useAuthStore();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [upgrading, setUpgrading] = useState(false);
    const { setUser } = useAuthStore();

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api("/api/profile/me");
            setProfileData(data);
        } catch (err) {
            console.error("Failed to fetch profile:", err);
            setError("Could not load profile data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Called by EditProfileForm/NotificationsForm when user saves
    const handleProfileSaved = useCallback((updatedUser) => {
        setProfileData(prev => prev ? { ...prev, user: { ...prev.user, ...updatedUser } } : prev);
    }, []);

    const handleUpgrade = async () => {
        if (!confirm("Upgrade to Seller? You will get access to create and manage auction listings. 5% commission per sale.")) return;
        setUpgrading(true);
        try {
            await api("/api/auth/upgrade-to-seller", { method: "POST" });
            await fetchProfile();
            window.location.reload();
        } catch (err) {
            alert(err.message || "Upgrade failed. Please try again.");
        } finally {
            setUpgrading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-[var(--electric)]" size={48} />
                    <p className="font-black uppercase tracking-widest text-xs opacity-40">Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profileData?.user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <div className="bg-white border-[4px] border-[var(--ink)] rounded-3xl p-10 shadow-[8px_8px_0_0_var(--ink)] max-w-md w-full">
                    <div className="text-5xl mb-6">⚠️</div>
                    <h2 className="font-display text-2xl font-black uppercase mb-3">Profile Unavailable</h2>
                    <p className="opacity-60 mb-8 font-medium">{error || "We couldn't load your profile. Please try again."}</p>
                    <div className="flex flex-col gap-3">
                        <button onClick={fetchProfile} className="flex items-center justify-center gap-2 bg-[var(--electric)] text-white px-6 py-3 rounded-xl border-[3px] border-[var(--ink)] font-black uppercase tracking-widest text-xs shadow-[4px_4px_0_0_var(--ink)] hover:-translate-y-1 transition-all">
                            <RefreshCw size={14} strokeWidth={3} /> Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { user, stats } = profileData;
    const isSeller = user?.role === "seller";
    const isBuyer = user?.role === "buyer";

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24 space-y-8">
            {/* ── Hero Profile Header ── */}
            <ProfileHeader user={user} stats={stats} />

            {/* ── Seller Upgrade Banner (Buyer Only) ── */}
            {isBuyer && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-[var(--ink)] text-white border-[4px] border-[var(--ink)] rounded-2xl p-6 shadow-[8px_8px_0_0_var(--electric)] overflow-hidden"
                >
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 2px,transparent 2px,transparent 10px)" }} />
                    <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-[var(--acid)] rounded-xl border-[2px] border-white/20 shadow-[3px_3px_0_0_var(--electric)] shrink-0">
                                <Store size={28} strokeWidth={2.5} className="text-[var(--ink)]" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-display text-xl font-black uppercase tracking-tight">Start Selling — It&apos;s Free</h3>
                                    <span className="bg-[var(--acid)] text-[var(--ink)] px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20">New</span>
                                </div>
                                <p className="text-white/60 font-medium text-sm max-w-lg">
                                    List your items, run auctions, and reach thousands of buyers. Only <strong className="text-[var(--acid)]">5% commission</strong> per sale — no monthly fees.
                                </p>
                                <div className="flex flex-wrap gap-4 mt-3 text-[10px] font-black uppercase tracking-widest text-white/50">
                                    <span className="flex items-center gap-1"><TrendingUp size={12} /> Real-time bidding</span>
                                    <span className="flex items-center gap-1"><Zap size={12} /> AI-powered reach</span>
                                    <span className="flex items-center gap-1"><Store size={12} /> Seller dashboard</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleUpgrade}
                            disabled={upgrading}
                            className="shrink-0 bg-[var(--acid)] text-[var(--ink)] px-8 py-4 rounded-xl border-[3px] border-white/20 font-display font-black uppercase tracking-widest text-sm shadow-[4px_4px_0_0_var(--electric)] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--electric)] transition-all disabled:opacity-60 disabled:translate-y-0 flex items-center gap-2"
                        >
                            {upgrading ? <Loader2 size={18} className="animate-spin" /> : <><Zap size={18} strokeWidth={3} /> Upgrade to Seller</>}
                        </button>
                    </div>
                </motion.div>
            )}

            {/* ── Main Settings Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Details — spans 2 cols */}
                <div className="lg:col-span-2">
                    <EditProfileForm user={user} onSaved={handleProfileSaved} />
                </div>

                {/* Security */}
                <div className="lg:col-span-1">
                    <ChangePasswordForm />
                </div>
            </div>

            {/* ── Notifications & Privacy ── */}
            <NotificationsForm user={user} />

            {/* ── Danger Zone ── */}
            <DangerZone />
        </div>
    );
}
