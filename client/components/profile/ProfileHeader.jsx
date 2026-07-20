"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, ShieldCheck, ShoppingBag, Gavel, DollarSign, Tag, TrendingUp, Store, Star, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import dynamic from 'next/dynamic';
const SellerOnboardingModal = dynamic(() => import('./SellerOnboardingModal'), { ssr: false });
import Link from "next/link";

export default function ProfileHeader({ user, stats }) {
    const setUser = useAuthStore((s) => s.setUser);
    const [uploading, setUploading] = useState(false);
    const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("avatar", file);
        try {
            const data = await api("/api/profile/avatar", { method: "POST", body: formData });
            if (data.user) setUser(data.user);
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setUploading(false);
        }
    };

    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

    return (
        <div className="mb-10">
            {/* Hero Banner */}
            <div className="relative h-52 md:h-64 w-full rounded-3xl border-[4px] border-[var(--ink)] overflow-hidden shadow-[8px_8px_0_0_var(--ink)]">
                <div className="absolute inset-0 bg-[var(--ink)]" />
                {/* Geometric pattern */}
                <div className="absolute inset-0 opacity-10">
                    {Array.from({ length: 12 }).map((_, row) => (
                        <div key={row} className="flex gap-6 mb-6">
                            {Array.from({ length: 20 }).map((_, col) => (
                                <div key={col} className="h-8 w-8 border border-white rounded-lg shrink-0" />
                            ))}
                        </div>
                    ))}
                </div>
                {/* Accent glow circles */}
                <div className="absolute -top-10 -right-10 h-52 w-52 rounded-full bg-[var(--electric)] opacity-20 blur-3xl" />
                <div className="absolute -bottom-10 left-20 h-40 w-40 rounded-full bg-[var(--hotpink)] opacity-15 blur-3xl" />
                {/* Role label at top right */}
                <div className="absolute top-4 right-4">
                    <span className={`px-4 py-2 rounded-full border-[3px] border-[var(--ink)] text-xs font-black uppercase tracking-widest shadow-[3px_3px_0_0_var(--ink)] ${user.role === 'admin' ? 'bg-[var(--hotpink)] text-white' :
                            user.role === 'seller' ? 'bg-[var(--acid)] text-[var(--ink)]' :
                                'bg-[var(--electric)] text-white'
                        }`}>
                        {user.role}
                    </span>
                </div>
            </div>

            {/* Profile Info Row */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 px-4 md:px-6 -mt-16 md:-mt-20 relative z-10">
                {/* Avatar */}
                <div className="relative group">
                    <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-[4px] border-[var(--ink)] bg-white shadow-[6px_6px_0_0_var(--ink)] overflow-hidden relative">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-display text-4xl md:text-5xl font-black bg-gradient-to-br from-[var(--electric)] to-[var(--hotpink)] text-white">
                                {initials}
                            </div>
                        )}
                        {uploading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Loader2 className="animate-spin text-white" size={32} />
                            </div>
                        )}
                    </div>
                    <label className="absolute bottom-1 right-1 p-2.5 bg-[var(--acid)] border-[3px] border-[var(--ink)] rounded-full cursor-pointer shadow-[3px_3px_0_0_var(--ink)] hover:-translate-y-1 transition-transform">
                        <Camera size={16} strokeWidth={3} />
                        <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                    </label>
                </div>

                {/* Name & Role */}
                <div className="flex-1 pb-2">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="font-display text-3xl md:text-5xl font-black uppercase tracking-tighter">
                            {user.firstName} {user.lastName}
                        </h1>
                        <span className={`px-3 py-1 rounded-full border-[2px] border-[var(--ink)] text-[10px] font-black uppercase shadow-[2px_2px_0_0_var(--ink)] ${user.role === 'admin' ? 'bg-[var(--hotpink)] text-white' :
                                user.role === 'seller' ? 'bg-[var(--acid)] text-[var(--ink)]' : 'bg-[var(--electric)] text-white'
                            }`}>
                            {user.role}
                        </span>
                        {user.isVerified && (
                            <ShieldCheck size={28} className="text-[var(--electric)] shrink-0" strokeWidth={2.5} />
                        )}
                    </div>
                    <p className="text-sm md:text-base font-medium opacity-70 max-w-xl">
                        {user.bio || "No bio yet. Tell the world who you are!"}
                    </p>
                </div>

                {/* Seller Mode Button */}
                <div className="pb-4">
                    {user.role === 'seller' ? (
                        <Link
                            href="/seller/dashboard"
                            className="flex items-center gap-2 bg-[var(--ink)] text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0_0_var(--acid)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--acid)] transition-all"
                        >
                            <Store size={16} />
                            Seller Dashboard
                        </Link>
                    ) : (
                        <button
                            onClick={() => setIsSellerModalOpen(true)}
                            className="flex items-center gap-2 bg-[var(--acid)] text-[var(--ink)] px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] border-[3px] border-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--ink)] transition-all"
                        >
                            <DollarSign size={16} />
                            Activate Seller Mode
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                {user.role === 'buyer' ? (
                    <>
                        <StatCard icon={<Gavel size={22} strokeWidth={2.5} />} label="Total Bids" value={stats?.totalBids || 0} accent="var(--acid)" />
                        <StatCard icon={<ShoppingBag size={22} strokeWidth={2.5} />} label="Items Won" value={stats?.itemsWon || 0} accent="var(--electric)" />
                        <StatCard icon={<DollarSign size={22} strokeWidth={2.5} />} label="Total Spent" value={`$${(stats?.totalSpent || 0).toLocaleString()}`} accent="var(--hotpink)" dark />
                        <StatCard icon={<TrendingUp size={22} strokeWidth={2.5} />} label="Win Rate" value={stats?.totalBids ? `${Math.round((stats.itemsWon / stats.totalBids) * 100)}%` : '0%'} accent="var(--ink)" dark />
                    </>
                ) : (
                    <>
                        <StatCard icon={<Tag size={22} strokeWidth={2.5} />} label="Total Listings" value={stats?.totalListings || 0} accent="var(--acid)" />
                        <StatCard icon={<ShoppingBag size={22} strokeWidth={2.5} />} label="Items Sold" value={stats?.itemsSold || 0} accent="var(--electric)" />
                        <StatCard icon={<DollarSign size={22} strokeWidth={2.5} />} label="Total Revenue" value={`$${(stats?.totalRevenue || 0).toLocaleString()}`} accent="var(--hotpink)" dark />
                        <StatCard icon={<Star size={22} strokeWidth={2.5} />} label="Avg. Rating" value={`${(user.rating || 0).toFixed(1)} / 5`} accent="var(--ink)" dark />
                    </>
                )}
            </div>

            <SellerOnboardingModal
                isOpen={isSellerModalOpen}
                onClose={() => setIsSellerModalOpen(false)}
            />
        </div>
    );
}

function StatCard({ icon, label, value, accent, dark }) {
    return (
        <div
            className={`border-[3px] border-[var(--ink)] rounded-xl p-4 shadow-[4px_4px_0_0_var(--ink)] flex flex-col gap-1 ${dark ? 'bg-[var(--ink)] text-white' : 'bg-white text-[var(--ink)]'}`}
        >
            <div className="opacity-70">{icon}</div>
            <div className="text-2xl font-black font-display uppercase tracking-tight">{value}</div>
            <div className="text-[10px] font-black uppercase opacity-60 tracking-widest">{label}</div>
        </div>
    );
}
