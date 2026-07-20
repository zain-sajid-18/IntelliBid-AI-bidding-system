"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useMessagesStore } from "@/store/messagesStore";
import { motion, AnimatePresence } from "framer-motion";
import AuctionCard from "@/components/discover/AuctionCard";
import {
    Loader2, ArrowLeft, MessageCircle, Star, ShieldCheck,
    CalendarDays, Store, Link as LinkIcon, MapPin, Tag,
    Award, TrendingUp, Package, UserCheck, Globe, Phone,
    LayoutGrid, Info, ExternalLink
} from "lucide-react";

function StatCard({ icon, label, value, color = "var(--electric)", dark = false }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border-[3px] border-[var(--ink)] p-5 shadow-[4px_4px_0_0_var(--ink)] flex flex-col items-center text-center gap-2 ${dark ? "bg-[var(--ink)] text-white" : "bg-white text-[var(--ink)]"}`}
        >
            <div className="w-12 h-12 rounded-full border-[2px] border-[var(--ink)] flex items-center justify-center shadow-[2px_2px_0_0_var(--ink)]" style={{ background: color }}>
                {icon}
            </div>
            <div className={`font-display text-3xl font-black leading-none ${dark ? "text-[var(--acid)]" : ""}`}>{value}</div>
            <div className={`text-[10px] font-black uppercase tracking-widest ${dark ? "opacity-70" : "opacity-50"}`}>{label}</div>
        </motion.div>
    );
}

export default function PublicProfilePage() {
    const { userId } = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuthStore();
    const { startConversation } = useMessagesStore();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState("listings");
    const [messaging, setMessaging] = useState(false);

    useEffect(() => {
        if (!userId || userId === "undefined") {
            setLoading(false);
            setError("Invalid profile link.");
            return;
        }
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await api(`/api/profile/${userId}`);
                if (res.success) setProfileData(res);
                else setError(res.message || "Failed to load profile");
            } catch {
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    const handleMessage = async () => {
        if (!currentUser) { router.push("/login"); return; }
        setMessaging(true);
        try {
            await startConversation(userId);
            router.push("/chat");
        } finally {
            setMessaging(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-[var(--electric)]" />
                    <p className="font-black uppercase tracking-widest text-xs opacity-50">Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center">
                <div className="bg-white border-[4px] border-[var(--ink)] rounded-3xl p-12 shadow-[8px_8px_0_0_var(--ink)] max-w-md w-full">
                    <div className="text-6xl mb-6">😶</div>
                    <h1 className="font-display text-3xl font-black uppercase tracking-tight mb-3">Profile Unavailable</h1>
                    <p className="font-medium opacity-60 mb-8">{error || "This user doesn't exist or has made their profile private."}</p>
                    <button onClick={() => router.back()} className="flex items-center gap-2 mx-auto bg-[var(--electric)] text-white px-8 py-3.5 rounded-xl border-[3px] border-[var(--ink)] font-black uppercase tracking-widest text-sm shadow-[4px_4px_0_0_var(--ink)] hover:-translate-y-1 transition-all">
                        <ArrowLeft size={16} strokeWidth={3} /> Go Back
                    </button>
                </div>
            </div>
        );
    }

    const { user, stats, activeListings = [] } = profileData;
    const isSelf = currentUser?._id === user?._id || currentUser?.id === user?._id;
    const isSeller = user?.role === "seller";
    const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();
    const tabs = isSeller
        ? [{ id: "listings", label: "Listings", icon: <LayoutGrid size={14} /> }, { id: "about", label: "About", icon: <Info size={14} /> }]
        : [{ id: "about", label: "About", icon: <Info size={14} /> }];

    return (
        <div className="min-h-screen pb-24">

            {/* Top nav bar */}
            <div className="sticky top-0 z-40 border-b-[3px] border-[var(--ink)] bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                    <button onClick={() => router.back()} className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-widest hover:text-[var(--electric)] transition-colors">
                        <ArrowLeft size={16} strokeWidth={3} /> Back
                    </button>
                    {!isSelf && (
                        <button
                            onClick={handleMessage}
                            disabled={messaging}
                            className="flex items-center gap-2 bg-[var(--hotpink)] text-white px-6 py-2.5 rounded-xl border-[3px] border-[var(--ink)] font-black uppercase tracking-widest text-xs shadow-[3px_3px_0_0_var(--ink)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--ink)] transition-all disabled:opacity-60"
                        >
                            {messaging ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} strokeWidth={2.5} />}
                            Message
                        </button>
                    )}
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4 py-8">

                {/* ── Hero Banner ── */}
                <div className="relative h-48 md:h-56 w-full rounded-3xl border-[4px] border-[var(--ink)] overflow-hidden shadow-[8px_8px_0_0_var(--ink)] mb-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--electric)] via-[var(--hotpink)] to-[var(--sunset)]" />
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg,#000 0,#000 2px,transparent 2px,transparent 10px)" }} />
                    <div className="absolute -bottom-8 -right-8 h-48 w-48 rounded-full bg-[var(--acid)] opacity-30 blur-3xl" />
                    <div className="absolute top-6 left-6 opacity-20">
                        <div className="font-display text-[120px] font-black uppercase leading-none tracking-tighter text-white select-none">{user?.firstName?.[0]}</div>
                    </div>

                    {/* Verified Seller badge */}
                    {isSeller && (
                        <div className="absolute bottom-4 right-4">
                            <span className="flex items-center gap-1.5 bg-[var(--acid)] text-[var(--ink)] px-4 py-2 rounded-full border-[3px] border-[var(--ink)] text-[10px] font-black uppercase tracking-widest shadow-[3px_3px_0_0_var(--ink)]">
                                <ShieldCheck size={14} strokeWidth={3} /> Verified Seller
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Avatar + Name Row ── */}
                <div className="relative px-4 md:px-8 -mt-16 flex flex-col md:flex-row md:items-end gap-4 mb-6">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-[5px] border-white bg-white overflow-hidden shadow-[6px_6px_0_0_var(--ink)]">
                            {user?.avatar
                                ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center font-display text-5xl font-black bg-gradient-to-br from-[var(--electric)] to-[var(--hotpink)] text-white">{initials}</div>
                            }
                        </div>
                        {isSeller && stats?.rating > 4.5 && (
                            <div className="absolute -bottom-1 -right-1 bg-[var(--sunset)] text-white p-2.5 rounded-full border-[3px] border-white shadow-[2px_2px_0_0_var(--ink)]" title="Top Rated">
                                <Award size={18} strokeWidth={2.5} />
                            </div>
                        )}
                    </div>

                    {/* Name + meta */}
                    <div className="flex-1 pb-2">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">
                                {user?.firstName} {user?.lastName}
                            </h1>
                            {isSeller && stats?.rating > 0 && (
                                <span className="flex items-center gap-1.5 bg-[var(--ink)] text-[var(--acid)] px-3 py-1 rounded-full border-[2px] border-[var(--ink)] text-xs font-black shadow-[2px_2px_0_0_var(--acid)]">
                                    <Star size={12} className="fill-[var(--acid)]" />
                                    {stats.rating?.toFixed(1)} ({stats.totalRatings || 0})
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1.5 bg-white border-[2px] border-[var(--ink)] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_var(--ink)]">
                                <CalendarDays size={12} /> Joined {new Date(user?.createdAt).getFullYear()}
                            </span>
                            {isSeller && user?.businessName && (
                                <span className="flex items-center gap-1.5 bg-white border-[2px] border-[var(--ink)] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_var(--ink)]">
                                    <Store size={12} /> {user.businessName}
                                </span>
                            )}
                            {user?.location && (
                                <span className="flex items-center gap-1.5 bg-white border-[2px] border-[var(--ink)] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_var(--ink)]">
                                    <MapPin size={12} /> {user.location}
                                </span>
                            )}
                            {user?.website && (
                                <a href={user.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-[var(--electric)] text-white border-[2px] border-[var(--ink)] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_var(--ink)] hover:-translate-y-0.5 transition-transform">
                                    <Globe size={12} /> Website <ExternalLink size={10} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Message Button (desktop right side) */}
                    {!isSelf && (
                        <div className="hidden md:block pb-2 shrink-0">
                            <button
                                onClick={handleMessage}
                                disabled={messaging}
                                className="flex items-center gap-2 bg-[var(--hotpink)] text-white px-8 py-4 rounded-xl border-[3px] border-[var(--ink)] font-black uppercase tracking-widest text-sm shadow-[4px_4px_0_0_var(--ink)] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--ink)] transition-all disabled:opacity-60"
                            >
                                {messaging ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} strokeWidth={2.5} />}
                                Send Message
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Stats Row (seller only) ── */}
                {isSeller && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <StatCard icon={<Tag size={20} className="text-white" strokeWidth={2.5} />} label="Items Sold" value={stats?.totalSales ?? 0} color="var(--electric)" />
                        <StatCard icon={<Star size={20} className="text-white fill-white" strokeWidth={2} />} label="Seller Rating" value={stats?.rating ? stats.rating.toFixed(1) : "N/A"} color="var(--sunset)" />
                        <StatCard icon={<Package size={20} className="text-[var(--ink)]" strokeWidth={2.5} />} label="Active Listings" value={activeListings.length} color="var(--acid)" />
                        <StatCard icon={<TrendingUp size={20} className="text-white" strokeWidth={2.5} />} label="Reviews" value={stats?.totalRatings ?? 0} color="var(--hotpink)" dark />
                    </div>
                )}

                {/* ── Tabs ── */}
                <div className="flex gap-2 border-b-[3px] border-[var(--ink)] mb-8 overflow-x-auto scrollbar-hide pr-4">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-6 py-3 font-black uppercase tracking-widest text-xs border-[3px] rounded-t-xl transition-all border-b-0 relative -bottom-[3px] whitespace-nowrap ${tab === t.id
                                ? "bg-[var(--ink)] text-white border-[var(--ink)] shadow-none"
                                : "bg-white border-[var(--ink)] hover:bg-gray-50"
                                }`}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* ── Tab Content ── */}
                <AnimatePresence mode="wait">
                    {tab === "listings" && isSeller && (
                        <motion.div key="listings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                            {activeListings.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {activeListings.map(auction => (
                                        <AuctionCard key={auction._id} auction={auction} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white border-[4px] border-[var(--ink)] rounded-2xl p-16 text-center shadow-[6px_6px_0_0_var(--ink)]">
                                    <div className="text-5xl mb-4">📦</div>
                                    <h2 className="font-display text-2xl font-black uppercase mb-2">No Active Listings</h2>
                                    <p className="font-medium opacity-50">This seller doesn't have any live auctions right now.</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {tab === "about" && (
                        <motion.div key="about" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Bio Card */}
                            <div className="bg-white border-[3px] border-[var(--ink)] rounded-2xl p-6 shadow-[4px_4px_0_0_var(--ink)] md:col-span-2">
                                <h3 className="font-display text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <UserCheck size={16} strokeWidth={3} className="text-[var(--electric)]" /> About
                                </h3>
                                {user?.bio ? (
                                    <p className="font-medium leading-relaxed text-lg">{user.bio}</p>
                                ) : (
                                    <p className="font-medium opacity-40 italic">This user hasn't added a bio yet.</p>
                                )}
                            </div>

                            {/* Contact Details */}
                            <div className="bg-white border-[3px] border-[var(--ink)] rounded-2xl p-6 shadow-[4px_4px_0_0_var(--ink)]">
                                <h3 className="font-display text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Globe size={16} strokeWidth={3} className="text-[var(--hotpink)]" /> Details
                                </h3>
                                <div className="space-y-3">
                                    {user?.location && (
                                        <div className="flex items-center gap-3 font-bold text-sm">
                                            <MapPin size={16} className="text-[var(--electric)] shrink-0" strokeWidth={2.5} />
                                            {user.location}
                                        </div>
                                    )}
                                    {user?.phone && (
                                        <div className="flex items-center gap-3 font-bold text-sm">
                                            <Phone size={16} className="text-[var(--electric)] shrink-0" strokeWidth={2.5} />
                                            {user.phone}
                                        </div>
                                    )}
                                    {user?.website && (
                                        <a href={user.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 font-bold text-sm text-[var(--electric)] hover:underline">
                                            <LinkIcon size={16} strokeWidth={2.5} className="shrink-0" />
                                            {user.website}
                                        </a>
                                    )}
                                    {!user?.location && !user?.phone && !user?.website && (
                                        <p className="text-sm font-medium opacity-40 italic">No contact details shared.</p>
                                    )}
                                </div>
                            </div>

                            {/* Seller Business Info */}
                            {isSeller && (
                                <div className="bg-[var(--electric)] text-white border-[3px] border-[var(--ink)] rounded-2xl p-6 shadow-[4px_4px_0_0_var(--ink)]">
                                    <h3 className="font-display text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 opacity-80">
                                        <Store size={16} strokeWidth={3} /> Business
                                    </h3>
                                    <div className="space-y-3">
                                        {user?.businessName && (
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Business Name</div>
                                                <div className="font-display text-2xl font-black">{user.businessName}</div>
                                            </div>
                                        )}
                                        {user?.businessCategory && (
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Category</div>
                                                <div className="font-bold">{user.businessCategory}</div>
                                            </div>
                                        )}
                                        {!user?.businessName && <p className="text-sm font-medium opacity-60 italic">No business info added.</p>}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
