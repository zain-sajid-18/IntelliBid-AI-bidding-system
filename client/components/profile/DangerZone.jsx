"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, X, AlertOctagon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DangerZone() {
    const logout = useAuthStore((s) => s.logout);
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await api("/api/profile/delete-account", { method: "DELETE" });
            logout();
            router.push("/");
        } catch (error) {
            alert("Failed to delete account. Please contact support.");
            setLoading(false);
            setShowModal(false);
        }
    };

    return (
        <div className="bg-white border-[3px] border-[var(--hotpink)] rounded-2xl shadow-[6px_6px_0_0_var(--hotpink)] mt-12 overflow-hidden relative">
            {/* Warning Pattern Background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, var(--hotpink) 0, var(--hotpink) 2px, transparent 2px, transparent 10px)'
            }} />
            
            <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-[var(--hotpink)] rounded-xl border-[2px] border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)] shrink-0">
                        <AlertTriangle size={24} className="text-white" strokeWidth={3} />
                    </div>
                    <div>
                        <h2 className="font-display text-xl font-black uppercase tracking-tight mb-1 text-[var(--hotpink)]">Danger Zone</h2>
                        <p className="text-sm font-bold opacity-70 max-w-lg">
                            Permanently delete your account and all associated data. Active bids and listings will be cancelled immediately. This action cannot be undone.
                        </p>
                    </div>
                </div>
                
                <button 
                    onClick={() => setShowModal(true)}
                    className="shrink-0 bg-white text-[var(--hotpink)] border-[3px] border-[var(--hotpink)] px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-sm shadow-[4px_4px_0_0_var(--hotpink)] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--hotpink)] transition-all flex items-center gap-2"
                >
                    <Trash2 size={16} strokeWidth={3} /> Delete Account
                </button>
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !loading && setShowModal(false)}
                            className="absolute inset-0 bg-[var(--ink)]/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white border-[4px] border-[var(--ink)] p-6 sm:p-8 rounded-3xl shadow-[12px_12px_0_0_var(--hotpink)] max-w-md w-full overflow-hidden"
                        >
                            {/* Modal Header Icon */}
                            <div className="w-16 h-16 rounded-2xl bg-[var(--hotpink)] border-[3px] border-[var(--ink)] flex items-center justify-center shadow-[4px_4px_0_0_var(--ink)] mb-6 mx-auto">
                                <AlertOctagon size={32} strokeWidth={2.5} className="text-white" />
                            </div>

                            <h3 className="font-display text-2xl font-black uppercase tracking-tighter mb-4 text-center">
                                Final Warning
                            </h3>
                            <div className="font-bold text-sm mb-8 leading-relaxed text-center space-y-4">
                                <p>Are you absolutely sure you want to delete your IntelliBid account?</p>
                                <p className="text-[var(--hotpink)] px-4 py-3 bg-[var(--hotpink)]/10 rounded-xl border-[2px] border-[var(--hotpink)]">
                                    All your data, active listings, and bids will be permanently erased.
                                </p>
                            </div>
                            
                            <div className="flex flex-col-reverse sm:flex-row gap-3">
                                <button 
                                    onClick={() => setShowModal(false)}
                                    disabled={loading}
                                    className="flex-1 bg-white border-[3px] border-[var(--ink)] py-3.5 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    <X size={16} strokeWidth={3} /> Cancel
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="flex-1 bg-[var(--hotpink)] text-white border-[3px] border-[var(--ink)] py-3.5 rounded-xl font-black uppercase tracking-widest text-xs shadow-[4px_4px_0_0_var(--ink)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:translate-y-0"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</span>
                                    ) : (
                                        <><Trash2 size={16} strokeWidth={3} /> Confirm Delete</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
