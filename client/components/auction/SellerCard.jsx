"use client";

import { MessageCircle, Star, ShieldCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMessagesStore } from "@/store/messagesStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function SellerCard({ seller, auctionId }) {
    const { startConversation } = useMessagesStore();
    const { user } = useAuthStore();
    const router = useRouter();

    if (!seller) return null;

    const isSelf = user?._id === seller._id;

    const handleAskSeller = async () => {
        if (!user) {
            alert("Please sign in to message the seller");
            return;
        }
        await startConversation(seller._id, auctionId);
        router.push("/chat");
    };

    return (
        <div className="brutal bg-[var(--acid)] p-5 border-[4px] border-[var(--ink)] rounded-2xl shadow-[6px_6px_0_0_var(--ink)]">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-xl border-[3px] border-[var(--ink)] bg-white overflow-hidden shrink-0 shadow-[2px_2px_0_0_var(--ink)]">
                        {seller.avatar ? (
                            <img src={seller.avatar} alt="Seller" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center font-display text-xl font-black bg-[var(--electric)] text-white">
                                {seller.firstName?.charAt(0) || 'S'}
                            </div>
                        )}
                    </div>
                    <div>
                        <h4 className="font-display font-black text-lg leading-none">
                            {seller.firstName} {seller.lastName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-0.5 text-[10px] font-black uppercase tracking-widest bg-white px-2 py-0.5 rounded-full border-[2px] border-[var(--ink)]">
                                <Star size={10} className="text-[var(--hotpink)] fill-[var(--hotpink)]" />
                                {seller.rating?.toFixed(1) || 'New'}
                            </span>
                            {seller.totalRatings > 0 && (
                                <span className="text-xs font-bold opacity-60">({seller.totalRatings})</span>
                            )}
                        </div>
                    </div>
                </div>
                <ShieldCheck className="text-[var(--electric)] opacity-50" size={32} />
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-white rounded-lg border-[2px] border-[var(--ink)] p-2 text-center shadow-[2px_2px_0_0_var(--ink)]">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Member Since</p>
                    <p className="font-bold text-xs">{new Date(seller.createdAt).getFullYear()}</p>
                </div>
                <div className="bg-white rounded-lg border-[2px] border-[var(--ink)] p-2 text-center shadow-[2px_2px_0_0_var(--ink)]">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Items Sold</p>
                    <p className="font-bold text-xs">{seller.totalSales || 0}</p>
                </div>
            </div>

            <div className="flex gap-2">
                {!isSelf && (
                    <button 
                        onClick={handleAskSeller}
                        className="flex-1 flex items-center justify-center gap-2 bg-[var(--ink)] text-white py-2.5 rounded-xl border-[3px] border-[var(--ink)] font-display text-xs font-black uppercase shadow-[3px_3px_0_0_white] hover:-translate-y-0.5 transition-all active:translate-y-0"
                    >
                        <MessageCircle size={14} /> Ask Seller
                    </button>
                )}
                <Link 
                    href={`/profile/${typeof seller === 'string' ? seller : (seller._id || seller.id)}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-[var(--ink)] py-2.5 rounded-xl border-[3px] border-[var(--ink)] font-display text-xs font-black uppercase shadow-[3px_3px_0_0_var(--ink)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--ink)] transition-all active:translate-y-0"
                >
                    <ExternalLink size={14} /> Profile
                </Link>
            </div>
        </div>
    );
}
