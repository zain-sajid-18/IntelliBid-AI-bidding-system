"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Bell, Eye, BellOff, Globe, Lock } from "lucide-react";

export default function NotificationsForm({ user }) {
    const setUser = useAuthStore((s) => s.setUser);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        notificationsEnabled: user?.notificationsEnabled ?? true,
        profileVisibility: user?.profileVisibility ?? "public",
    });

    const handleToggle = (field) => {
        setForm((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleVisibility = (value) => {
        setForm((prev) => ({ ...prev, profileVisibility: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        try {
            const data = await api("/api/profile/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (data.user) setUser(data.user);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 4000);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border-[3px] border-[var(--ink)] rounded-2xl shadow-[6px_6px_0_0_var(--ink)] overflow-hidden">
            <div className="bg-[var(--ink)] px-6 py-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--electric)] border-[2px] border-white/20">
                    <Bell size={18} strokeWidth={3} className="text-white" />
                </div>
                <div>
                    <h2 className="font-display text-xl font-black uppercase tracking-tight text-white">Preferences</h2>
                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Notifications & Privacy</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                {/* Notifications Toggle */}
                <div className="flex items-center justify-between p-4 bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-xl shadow-[3px_3px_0_0_var(--ink)]">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border-[2px] border-[var(--ink)] ${form.notificationsEnabled ? "bg-[var(--acid)]" : "bg-gray-200"}`}>
                            {form.notificationsEnabled
                                ? <Bell size={16} strokeWidth={3} className="text-[var(--ink)]" />
                                : <BellOff size={16} strokeWidth={3} className="text-[var(--ink)]/50" />
                            }
                        </div>
                        <div>
                            <div className="font-black text-sm uppercase tracking-wide">Email Notifications</div>
                            <div className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
                                {form.notificationsEnabled ? "You will receive bid & auction alerts" : "Notifications are off"}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleToggle("notificationsEnabled")}
                        className={`relative w-14 h-7 rounded-full border-[3px] border-[var(--ink)] transition-colors ${form.notificationsEnabled ? "bg-[var(--electric)]" : "bg-gray-300"}`}
                    >
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white border-[2px] border-[var(--ink)] shadow-[1px_1px_0_0_var(--ink)] transition-all ${form.notificationsEnabled ? "left-[26px]" : "left-0.5"}`} />
                    </button>
                </div>

                {/* Profile Visibility */}
                <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60 mb-3">
                        <Eye size={12} strokeWidth={3} /> Profile Visibility
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { value: "public", label: "Public", desc: "Anyone can view your profile", icon: <Globe size={18} strokeWidth={2.5} /> },
                            { value: "private", label: "Private", desc: "Only you can see your profile", icon: <Lock size={18} strokeWidth={2.5} /> },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleVisibility(opt.value)}
                                className={`flex flex-col items-start gap-2 p-4 rounded-xl border-[3px] transition-all text-left ${
                                    form.profileVisibility === opt.value
                                        ? "bg-[var(--ink)] text-white border-[var(--ink)] shadow-[4px_4px_0_0_var(--electric)]"
                                        : "bg-white border-[var(--ink)] hover:bg-gray-50 shadow-[3px_3px_0_0_var(--ink)]"
                                }`}
                            >
                                <div className={`p-1.5 rounded-lg border-[2px] ${form.profileVisibility === opt.value ? "border-white/20 bg-white/10" : "border-[var(--ink)] bg-[var(--background)]"}`}>
                                    {opt.icon}
                                </div>
                                <div>
                                    <div className="font-display font-black uppercase text-sm">{opt.label}</div>
                                    <div className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${form.profileVisibility === opt.value ? "opacity-60" : "opacity-40"}`}>
                                        {opt.desc}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Save */}
                <div className="flex items-center gap-4 pt-2 border-t-[3px] border-dashed border-[var(--ink)]/20">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-[var(--electric)] text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-sm border-[3px] border-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--ink)] transition-all disabled:opacity-50 disabled:translate-y-0"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Save Preferences"}
                    </button>
                    <AnimatePresence>
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2 font-black uppercase text-xs"
                            >
                                <span className="flex items-center justify-center h-7 w-7 bg-[var(--acid)] rounded-full border-[2px] border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)]">
                                    <Check size={14} strokeWidth={3} />
                                </span>
                                Saved!
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </form>
        </div>
    );
}
