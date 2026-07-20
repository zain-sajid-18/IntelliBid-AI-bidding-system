"use client";

import { useMessagesStore } from "@/store/messagesStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
    MessageCircle, Star, ShieldCheck, CalendarDays, Store, 
    Link as LinkIcon, MapPin, Tag, Award, UserPlus, Phone 
} from "lucide-react";

export default function PublicProfileCard({ profile, stats }) {
    const { startConversation } = useMessagesStore();
    const { user } = useAuthStore();
    const router = useRouter();

    if (!profile) return null;

    const isSelf = user?._id === profile._id || user?.id === profile._id;
    const isSeller = profile.role === 'seller';
    const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();

    const handleMessage = async () => {
        if (!user) {
            alert("Please sign in to message this user");
            return;
        }
        await startConversation(profile._id);
        router.push("/chat");
    };

    return (
        <div className="mb-12">
            {/* Hero Banner Layer */}
            <div className="relative h-52 md:h-64 w-full rounded-3xl border-[4px] border-[var(--ink)] overflow-hidden shadow-[8px_8px_0_0_var(--ink)]">
                <div className="absolute inset-0 bg-[var(--electric)]" />
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 10px)'
                }} />
                
                {/* Decorative floating shapes */}
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[var(--acid)] opacity-40 blur-3xl" />
                <div className="absolute top-10 left-1/3 h-32 w-32 rounded-full bg-[var(--hotpink)] opacity-30 blur-2xl" />

                {isSeller && (
                    <div className="absolute top-6 right-6">
                        <span className="flex items-center gap-2 bg-[var(--acid)] text-[var(--ink)] px-4 py-2 rounded-full border-[3px] border-[var(--ink)] text-xs font-black uppercase tracking-widest shadow-[4px_4px_0_0_var(--ink)]">
                            <ShieldCheck size={16} strokeWidth={3} /> Verified Seller
                        </span>
                    </div>
                )}
            </div>

            {/* Profile Info Overlay Row */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 px-4 md:px-8 -mt-20 relative z-10">
                
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className="h-36 w-36 md:h-44 md:w-44 rounded-full border-[5px] border-white bg-[var(--background)] shadow-[8px_8px_0_0_var(--ink)] overflow-hidden relative">
                        {profile.avatar ? (
                            <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-display text-5xl md:text-6xl font-black bg-gradient-to-br from-[var(--hotpink)] to-[var(--electric)] text-white">
                                {initials}
                            </div>
                        )}
                    </div>
                    {isSeller && profile.rating > 4.5 && (
                        <div className="absolute -bottom-2 -right-2 bg-[var(--sunset)] text-white p-3 rounded-full border-[3px] border-[var(--ink)] shadow-[3px_3px_0_0_var(--ink)]" title="Top Rated Seller">
                            <Award size={24} strokeWidth={2.5} />
                        </div>
                    )}
                </div>

                {/* Main Details */}
                <div className="flex-1 pt-4 md:pt-24 min-w-0 flex flex-col items-center md:items-start text-center md:text-left w-full">
                    <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4">
                        {profile.firstName} {profile.lastName}
                    </h1>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6">
                        <span className="flex items-center gap-1.5 bg-white border-[2px] border-[var(--ink)] px-3 py-1.5 rounded-full shadow-[2px_2px_0_0_var(--ink)]">
                            <CalendarDays size={14} /> Joined {new Date(profile.createdAt).getFullYear()}
                        </span>
                        
                        {isSeller && profile.businessName && (
                            <span className="flex items-center gap-1.5 bg-white border-[2px] border-[var(--ink)] px-3 py-1.5 rounded-full shadow-[2px_2px_0_0_var(--ink)]">
                                <Store size={14} /> {profile.businessName}
                            </span>
                        )}

                        {profile.location && (
                            <span className="flex items-center gap-1.5 bg-white border-[2px] border-[var(--ink)] px-3 py-1.5 rounded-full shadow-[2px_2px_0_0_var(--ink)]">
                                <MapPin size={14} /> {profile.location}
                            </span>
                        )}

                        {profile.website && (
                            <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-[var(--electric)] text-white border-[2px] border-[var(--ink)] px-3 py-1.5 rounded-full shadow-[2px_2px_0_0_var(--ink)] hover:-translate-y-0.5 transition-transform">
                                <LinkIcon size={14} /> Website
                            </a>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="bg-white border-[3px] border-[var(--ink)] rounded-2xl p-6 shadow-[5px_5px_0_0_var(--ink)] w-full mb-8 relative">
                        <div className="absolute top-0 left-6 -translate-y-1/2 bg-[var(--ink)] text-[var(--acid)] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-[2px] border-white/20">
                            About Me
                        </div>
                        {profile.bio ? (
                            <p className="font-medium text-sm md:text-base leading-relaxed opacity-90">
                                {profile.bio}
                            </p>
                        ) : (
                            <p className="font-medium text-sm opacity-50 italic">
                                This user hasn't added a bio yet.
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 w-full">
                        {!isSelf && (
                            <button 
                                onClick={handleMessage}
                                className="flex items-center justify-center gap-2 bg-[var(--hotpink)] text-white px-8 py-4 rounded-xl border-[3px] border-[var(--ink)] font-display text-sm font-black uppercase tracking-widest shadow-[4px_4px_0_0_var(--ink)] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--ink)] transition-all active:translate-y-0 active:shadow-[2px_2px_0_0_var(--ink)]"
                            >
                                <MessageCircle size={18} strokeWidth={2.5} /> Send Message
                            </button>
                        )}
                    </div>
                </div>

                {/* Sidebar Stats Column (Only for sellers) */}
                {isSeller && (
                    <div className="w-full md:w-64 shrink-0 flex flex-col gap-4 pt-4 md:pt-24">
                        <div className="bg-white border-[3px] border-[var(--ink)] rounded-2xl p-5 shadow-[4px_4px_0_0_var(--ink)] flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-[var(--acid)] border-[2px] border-[var(--ink)] flex items-center justify-center mb-3">
                                <Star size={20} className="fill-[var(--ink)] text-[var(--ink)]" />
                            </div>
                            <div className="font-display text-4xl font-black leading-none mb-1">
                                {profile.rating?.toFixed(1) || 'N/A'}
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                Seller Rating
                            </div>
                            {profile.totalRatings > 0 && (
                                <div className="text-xs font-bold opacity-50 mt-1">
                                    Based on {profile.totalRatings} reviews
                                </div>
                            )}
                        </div>

                        {stats && (
                            <div className="bg-[var(--ink)] text-white border-[3px] border-[var(--ink)] rounded-2xl p-5 shadow-[4px_4px_0_0_var(--electric)] flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-[var(--electric)] border-[2px] border-white/20 flex items-center justify-center mb-3">
                                    <Tag size={20} className="text-white" />
                                </div>
                                <div className="font-display text-4xl font-black leading-none mb-1">
                                    {stats.totalSales || 0}
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-80">
                                    Items Sold
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
