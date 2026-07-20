"use client";

import Link from 'next/link';
import { XCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderCancel() {
    return (
        <div className="min-h-screen bg-[var(--background)] py-12 px-6 flex items-center justify-center">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg text-center brutal bg-white p-8 md:p-12 border-[4px] border-[var(--ink)] shadow-[10px_10px_0_0_var(--hotpink)] rounded-[2.5rem]"
            >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--hotpink)] text-white shadow-[3px_3px_0_0_var(--ink)] mb-8">
                    <XCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
                </div>

                <h1 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">Payment Cancelled</h1>
                
                <p className="font-medium opacity-85 text-lg leading-relaxed mb-8">
                    Your checkout session was cancelled. No charges were made. You can attempt payment again at any time from your buyer dashboard.
                </p>

                <Link 
                    href="/dashboard" 
                    className="w-full flex items-center justify-center gap-2 bg-[var(--ink)] text-white py-4 rounded-xl border-[3px] border-[var(--ink)] font-display text-sm font-black uppercase tracking-wider shadow-[4px_4px_0_0_var(--hotpink)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--hotpink)] transition-all"
                >
                    <ArrowLeft size={16} strokeWidth={3} /> Return to Dashboard
                </Link>
            </motion.div>
        </div>
    );
}
