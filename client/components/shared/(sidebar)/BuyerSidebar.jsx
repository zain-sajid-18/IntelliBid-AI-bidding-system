"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModeSwitcher from "@/components/shared/ModeSwitcher";
import { useAuthStore } from "@/store/authStore";

const baseItems = [
    { emoji: "🏠", label: "Dashboard", color: "var(--electric)", textColor: "#fff", href: "/dashboard" },
    { emoji: "🔍", label: "Discover", color: "var(--acid)", textColor: "var(--ink)", href: "/discover" },
    { emoji: "🔨", label: "My Bids", color: "var(--sunset)", textColor: "#fff", href: "/bids" },
    { emoji: "🤖", label: "AI Picks", color: "var(--hotpink)", textColor: "#fff", href: "/buyer/ai-picks" },
    { emoji: "💬", label: "Messages", color: "var(--electric)", textColor: "#fff", href: "/chat" },
];

export default function BuyerSidebar({ open: propOpen, setOpen: propSetOpen }) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = propOpen !== undefined ? propOpen : internalOpen;
    const setOpen = propSetOpen || setInternalOpen;
    const pathname = usePathname();
    const { user } = useAuthStore();

    const items = [
        ...baseItems,
        { emoji: "👤", label: "Profile", color: "var(--acid)", textColor: "var(--ink)", href: "/profile" },
    ];

    return (
        <>
            <aside
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                className={`fixed left-0 top-0 z-50 hidden h-full flex-col items-start md:flex transition-[width] duration-300 ease-out ${open ? "w-64" : "w-20"
                    }`}
                style={{ background: "color-mix(in oklab, white 72%, transparent)", backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)", borderRight: "3px solid var(--ink)" }}
            >
                <div className="flex h-16 w-full items-center gap-3 border-b-[3px] border-[var(--ink)] px-4">
                    <Link href="/dashboard" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--electric)] font-display text-xl font-black text-white shadow-[3px_3px_0_0_var(--ink)] transition-all hover:-rotate-6 hover:shadow-[5px_5px_0_0_var(--ink)]">
                        BY
                    </Link>
                    <AnimatePresence>
                        {open && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="whitespace-nowrap font-display text-lg font-black tracking-tight"
                            >
                                Buyer Hub
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2 w-full">
                    {items.map((it) => {
                        const isActive = pathname === it.href || (pathname && pathname.startsWith(it.href) && it.href !== '/dashboard');
                        return (
                            <Link key={it.label} href={it.href}>
                                <motion.div
                                    whileHover={{ x: 4, scale: 1.03 }}
                                    whileTap={{ scale: 0.96 }}
                                    className={`group flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-all ${isActive ? "shadow-[4px_4px_0_0_var(--ink)]" : "hover:shadow-[3px_3px_0_0_var(--ink)]"
                                        }`}
                                    style={{ background: isActive ? it.color : "transparent", border: isActive ? "3px solid var(--ink)" : "3px solid transparent" }}
                                >
                                    <span
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[3px] border-[var(--ink)] text-xl shadow-[2px_2px_0_0_var(--ink)] transition-all group-hover:shadow-[4px_4px_0_0_var(--ink)] group-hover:-translate-y-0.5"
                                        style={{ background: it.color }}
                                    >
                                        {it.emoji}
                                    </span>
                                    <AnimatePresence>
                                        {open && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -6 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -6 }}
                                                className="whitespace-nowrap font-display text-sm font-black uppercase tracking-wide"
                                                style={{ color: isActive ? it.textColor : "var(--ink)" }}
                                            >
                                                {it.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Mode Switcher */}
                <ModeSwitcher sidebarOpen={open} />

                {/* Bottom area for Actions */}
                <div className="w-full p-2 mt-auto border-t-[3px] border-[var(--ink)] flex flex-col gap-1">


                    <button
                        onClick={async () => {
                            try {
                                const { api } = await import("@/lib/api");
                                await api('/api/auth/logout', { method: 'POST' });
                            } catch (e) { }
                            const { useAuthStore } = await import("@/store/authStore");
                            useAuthStore.getState().clearUser();
                            window.location.href = '/';
                        }}
                        className="group flex w-full items-center gap-3 rounded-2xl px-2 py-2 border-[3px] border-transparent transition-all hover:bg-[var(--hotpink)] hover:text-white hover:border-[var(--ink)] hover:shadow-[3px_3px_0_0_var(--ink)] active:scale-95"
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[3px] border-[var(--ink)] bg-white text-xl shadow-[2px_2px_0_0_var(--ink)] transition-all group-hover:shadow-[4px_4px_0_0_var(--ink)] group-hover:-translate-y-0.5 text-[var(--ink)]">
                            🚪
                        </span>
                        <AnimatePresence>
                            {open && (
                                <motion.span
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -6 }}
                                    className="whitespace-nowrap font-display text-sm font-black uppercase tracking-wide text-inherit"
                                >
                                    Sign Out
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </aside>

            {/* Mobile nav */}
            <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 md:hidden max-w-[calc(100vw-2rem)]">
                <div className="flex items-center gap-2 rounded-full p-2 shadow-[var(--shadow-brutal)] overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" style={{ background: "color-mix(in oklab, white 80%, transparent)", backdropFilter: "blur(20px)", border: "3px solid var(--ink)" }}>
                    {items.map((it) => (
                        <Link key={it.label} href={it.href}>
                            <motion.span whileTap={{ scale: 0.85, rotate: -10 }} whileHover={{ y: -4 }} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-[var(--ink)] text-xl shadow-[2px_2px_0_0_var(--ink)] transition-all" style={{ background: it.color }} title={it.label}>
                                {it.emoji}
                            </motion.span>
                        </Link>
                    ))}
                </div>
            </nav>
        </>
    );
}

