"use client";

import Link from 'next/link';
import { CheckCircle, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderSuccess() {
    return (
        <div className="min-h-screen bg-[var(--background)] py-12 px-6 flex items-center justify-center">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg text-center brutal bg-white p-8 md:p-12 border-[4px] border-[var(--ink)] shadow-[10px_10px_0_0_var(--acid)] rounded-[2.5rem]"
            >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--acid)] shadow-[3px_3px_0_0_var(--ink)] mb-8">
                    <CheckCircle className="h-10 w-10 text-[var(--ink)]" strokeWidth={2.5} />
                </div>

                <h1 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">Payment Confirmed!</h1>
                
                <p className="font-medium opacity-85 text-lg leading-relaxed mb-8">
                    Congratulations! Your transaction has been securely authorized, processed, and confirmed. The seller has been notified to arrange delivery.
                </p>

                <div className="bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-2xl p-6 text-left space-y-3 mb-8">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase opacity-60">
                        <ShieldCheck size={16} className="text-green-600" /> Secure Escrow Active
                    </p>
                    <p className="text-xs font-medium opacity-70 leading-normal">
                        Your funds are held securely. You will be able to mark this order complete and verify your shipment details from your profile dashboard.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link 
                        href="/dashboard" 
                        className="flex-1 flex items-center justify-center gap-2 bg-[var(--ink)] text-white py-4 rounded-xl border-[3px] border-[var(--ink)] font-display text-sm font-black uppercase tracking-wider shadow-[4px_4px_0_0_var(--acid)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--acid)] transition-all"
                    >
                        Go to Dashboard <ArrowRight size={16} strokeWidth={3} />
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
