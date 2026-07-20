"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Loader2, ArrowLeftRight, Rocket, X, Check, Store, ShoppingBag, ShieldCheck, Sparkles, Zap } from "lucide-react";

// ── Become a Seller Modal ──────────────────────────────────────────────────────
function BecomeSeller({ onClose }) {
    const { user, setUser } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const perks = [
        { title: "Unlimited Listings", desc: "List as many items as you want with no upfront cost.", icon: <Zap className="h-5 w-5" /> },
        { title: "AI Assistant", desc: "Our AI writes professional titles & descriptions for you.", icon: <Sparkles className="h-5 w-5" /> },
        { title: "Verified Status", desc: "Get a 'Verified Seller' badge to build trust instantly.", icon: <ShieldCheck className="h-5 w-5" /> },
    ];

    const handleUpgrade = async () => {
        setLoading(true);
        setError(null);
        try {
            const { api } = await import("@/lib/api");
            const res = await api("/api/auth/upgrade-to-seller", { method: "POST" });
            if (res.success) {
                setUser(res.user);
                setDone(true);
                setTimeout(() => {
                    onClose();
                    router.push("/seller/dashboard");
                }, 1800);
            } else {
                setError(res.message || "Upgrade failed");
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[var(--ink)]/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Container */}
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border-[4px] border-[var(--ink)] bg-white shadow-[12px_12px_0_0_var(--ink)]"
            >
                <div className="flex flex-col md:flex-row">
                    {/* Left Side: Branding/Visual */}
                    <div className="relative hidden w-2/5 flex-col justify-between bg-[var(--ink)] p-8 text-white md:flex">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                        
                        <div className="relative">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-[var(--acid)] bg-[var(--acid)] shadow-[4px_4px_0_0_var(--acid)]/20">
                                <Store className="h-8 w-8 text-[var(--ink)]" strokeWidth={2.5} />
                            </div>
                            <h2 className="font-display text-4xl font-black uppercase leading-none tracking-tighter">
                                Start <span className="text-[var(--acid)]">Selling</span>
                            </h2>
                            <p className="mt-4 text-sm font-medium text-white/60">
                                Join the elite circle of IntelliBid sellers and unlock the power of AI-driven auctions.
                            </p>
                        </div>

                        <div className="relative mt-12 rounded-2xl border-[2px] border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                            <p className="text-xs font-bold uppercase tracking-widest text-[var(--acid)] mb-2">Seller Guarantee</p>
                            <p className="text-[10px] leading-relaxed opacity-70">
                                Secure payments, verified buyers, and 24/7 support. Your success is our mission.
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Form/Content */}
                    <div className="flex flex-1 flex-col p-8 md:p-10">
                        <button onClick={onClose} className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border-[2px] border-[var(--ink)]/10 text-[var(--ink)] hover:bg-[var(--background)] transition-colors md:relative md:right-0 md:top-0 md:mb-6 md:ml-auto">
                            <X className="h-5 w-5" strokeWidth={3} />
                        </button>

                        {done ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-[4px] border-[var(--ink)] bg-[var(--acid)] shadow-[6px_6px_0_0_var(--ink)]">
                                    <Check className="h-12 w-12" strokeWidth={4} />
                                </div>
                                <h3 className="font-display text-3xl font-black uppercase">You're In!</h3>
                                <p className="mt-2 font-medium text-[var(--ink)]/60">Switching to your new dashboard...</p>
                            </motion.div>
                        ) : (
                            <>
                                <div className="mb-8 md:hidden">
                                    <h2 className="font-display text-3xl font-black uppercase tracking-tight">Become a Seller</h2>
                                    <p className="text-sm font-medium opacity-60">Start your auction empire today.</p>
                                </div>

                                <div className="space-y-6">
                                    {perks.map((p, i) => (
                                        <motion.div 
                                            key={p.title}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex gap-4"
                                        >
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-[2.5px] border-[var(--ink)] bg-[var(--background)] shadow-[3px_3px_0_0_var(--ink)]">
                                                {p.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-display text-sm font-black uppercase tracking-wide">{p.title}</h4>
                                                <p className="text-xs font-medium opacity-60 leading-relaxed">{p.desc}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {error && (
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 rounded-xl border-[2px] border-[var(--hotpink)] bg-[var(--hotpink)]/5 px-4 py-3 text-xs font-bold text-[var(--hotpink)]">
                                        {error}
                                    </motion.p>
                                )}

                                <div className="mt-10 space-y-4">
                                    <button
                                        onClick={handleUpgrade}
                                        disabled={loading}
                                        className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--hotpink)] py-4 font-display text-base font-black uppercase text-white shadow-[6px_6px_0_0_var(--ink)] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0_0_var(--ink)] active:translate-y-0 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" strokeWidth={3} />}
                                        {loading ? "Processing..." : "Start Selling Free"}
                                    </button>
                                    <p className="text-center text-[10px] font-black uppercase tracking-widest opacity-30">
                                        NO MONTHLY FEES • 5% SALES COMMISSION
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );

    if (!mounted) return null;
    return createPortal(modalContent, document.body);
}

// ── Mode Switch Component (exported, used in all sidebars) ────────────────────
export default function ModeSwitcher({ sidebarOpen }) {
    const { user, viewMode } = useAuthStore();
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    if (!user) return null;

    const isSeller = user.role === "seller";
    const isBuyer = user.role === "buyer";

    if (isSeller) {
        // Show dual-mode toggle: seller can view buyer side
        const isOnBuyerSide = viewMode === "buyer";
        return (
            <div className="w-full p-2 border-b-[3px] border-[var(--ink)]">
                <button
                    onClick={() => router.push(isOnBuyerSide ? "/seller/dashboard" : "/dashboard")}
                    className={`group flex w-full items-center gap-3 rounded-2xl px-2 py-2 border-[3px] border-[var(--ink)] transition-all shadow-[2px_2px_0_0_var(--ink)] hover:shadow-[4px_4px_0_0_var(--ink)] hover:-translate-y-0.5 active:scale-95
                        ${isOnBuyerSide ? 'bg-[var(--electric)]' : 'bg-[var(--acid)]'}`}
                >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[3px] border-[var(--ink)] bg-white text-xl shadow-[2px_2px_0_0_var(--ink)]">
                        {isOnBuyerSide ? <Store className="h-5 w-5" strokeWidth={2.5} /> : <ShoppingBag className="h-5 w-5" strokeWidth={2.5} />}
                    </span>
                    <AnimatePresence>
                        {sidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                                className="min-w-0"
                            >
                                <div className="font-display text-[10px] font-black uppercase tracking-widest text-[var(--ink)]/60">Switch to</div>
                                <div className="font-display text-sm font-black uppercase tracking-wide text-[var(--ink)]">
                                    {isOnBuyerSide ? "Seller Mode" : "Buyer Mode"}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        );
    }

    if (isBuyer) {
        return (
            <>
                <div className="w-full p-2 border-b-[3px] border-[var(--ink)]">
                    <button
                        onClick={() => setShowModal(true)}
                        className="group flex w-full items-center gap-3 rounded-2xl px-2 py-2 border-[3px] border-dashed border-[var(--ink)]/50 bg-[var(--acid)]/30 transition-all hover:border-[var(--ink)] hover:bg-[var(--acid)] hover:shadow-[3px_3px_0_0_var(--ink)] active:scale-95"
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[3px] border-[var(--ink)] bg-[var(--acid)] text-xl shadow-[2px_2px_0_0_var(--ink)]">
                            🚀
                        </span>
                        <AnimatePresence>
                            {sidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                                    className="min-w-0 text-left"
                                >
                                    <div className="font-display text-[10px] font-black uppercase tracking-widest text-[var(--ink)]/60">Ready to earn?</div>
                                    <div className="font-display text-sm font-black uppercase tracking-wide text-[var(--ink)]">Start Selling</div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
                <AnimatePresence>
                    {showModal && <BecomeSeller onClose={() => setShowModal(false)} />}
                </AnimatePresence>
            </>
        );
    }

    return null;
}
