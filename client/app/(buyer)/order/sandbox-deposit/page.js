"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { ShieldCheck, CreditCard, Loader2, AlertCircle, Wallet, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function SandboxDepositContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const amount = searchParams.get('amount') || '0';

    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const [card, setCard] = useState({
        number: '4242 •••• •••• 4242',
        expiry: '12/29',
        cvc: '•••',
        name: 'Test Buyer'
    });

    const handlePay = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError('');

        try {
            const res = await api('/api/buyer/wallet/sandbox-deposit-success', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: Number(amount) })
            });

            if (res.success) {
                // Force sync the auth store from the server to get the updated balance immediately
                const { useAuthStore } = await import('@/store/authStore');
                await useAuthStore.getState().checkAuth();
                router.push('/dashboard?deposit=success');
            } else {
                setError('Wallet deposit failed');
                setProcessing(false);
            }
        } catch (err) {
            setError(err.message || 'Payment simulation failed');
            setProcessing(false);
        }
    };

    if (!amount || Number(amount) < 5) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-[var(--background)] p-6 text-center">
                <div className="brutal bg-white p-8 max-w-md border-[3px] border-[var(--ink)] shadow-[6px_6px_0_0_var(--ink)] rounded-2xl">
                    <AlertCircle size={48} className="mx-auto text-[var(--hotpink)] mb-4" />
                    <h2 className="font-display text-2xl font-black uppercase mb-2">Invalid Deposit</h2>
                    <p className="font-medium opacity-70 mb-6">Minimum deposit amount is $5.</p>
                    <Link href="/dashboard" className="inline-block bg-[var(--electric)] text-white px-6 py-3 border-[3px] border-[var(--ink)] font-black uppercase tracking-wider text-xs shadow-[3px_3px_0_0_var(--ink)] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_0_var(--ink)] transition-all">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)] py-12 px-6 flex items-center justify-center">
            <div className="w-full max-w-4xl grid gap-8 md:grid-cols-12">
                
                {/* Left side: Simulation details */}
                <div className="md:col-span-7 space-y-6">
                    <div className="brutal bg-white p-8 border-[3px] border-[var(--ink)] shadow-[8px_8px_0_0_var(--ink)] rounded-3xl">
                        <div className="flex items-center gap-2 text-[var(--hotpink)] font-black uppercase tracking-wider text-xs mb-4">
                            <span className="h-2 w-2 rounded-full bg-[var(--hotpink)] animate-ping" />
                            Stripe Wallet Sandbox
                        </div>

                        <h1 className="font-display text-3xl font-black uppercase tracking-tight mb-2">Add Funds Sandbox</h1>
                        <p className="text-sm font-medium opacity-60 mb-6">Simulate depositing funds directly into your IntelliBid platform wallet.</p>

                        <form onSubmit={handlePay} className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest opacity-50">Card Information</label>
                                
                                <div className="brutal bg-[var(--background)] border-[3px] border-[var(--ink)] p-4 rounded-xl space-y-4">
                                    <div className="flex items-center gap-3 border-b-[2px] border-[var(--ink)]/10 pb-3">
                                        <CreditCard size={20} className="opacity-50" />
                                        <input 
                                            type="text" 
                                            value={card.number} 
                                            readOnly 
                                            className="bg-transparent font-mono font-bold text-lg outline-none w-full"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase opacity-40">Expiry</label>
                                            <input 
                                                type="text" 
                                                value={card.expiry} 
                                                readOnly 
                                                className="bg-transparent font-mono font-bold outline-none w-full mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase opacity-40">CVC</label>
                                            <input 
                                                type="text" 
                                                value={card.cvc} 
                                                readOnly 
                                                className="bg-transparent font-mono font-bold outline-none w-full mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm font-bold">{error}</p>
                            )}

                            <button 
                                type="submit" 
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 bg-[var(--ink)] text-white py-4 rounded-2xl border-[3px] border-[var(--ink)] font-display text-lg font-black uppercase tracking-wider shadow-[4px_4px_0_0_var(--acid)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--acid)] transition-all disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} /> Processing...
                                    </>
                                ) : (
                                    <>
                                        Confirm Sandbox Deposit (${amount})
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="flex justify-between px-4">
                        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-black uppercase tracking-wide opacity-50 hover:opacity-100 hover:text-[var(--hotpink)] transition-all">
                            <ArrowLeft size={16} strokeWidth={3} /> Cancel Deposit
                        </Link>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                            <ShieldCheck size={16} /> Secure Simulation Terminal
                        </span>
                    </div>
                </div>

                {/* Right side: Invoice card */}
                <div className="md:col-span-5">
                    <div className="brutal bg-[var(--electric)] text-white p-8 border-[3px] border-[var(--ink)] shadow-[8px_8px_0_0_var(--ink)] rounded-3xl sticky top-6">
                        <Wallet size={32} strokeWidth={2.5} className="mb-4 text-[var(--acid)]" />
                        <h2 className="font-display text-2xl font-black uppercase tracking-tight mb-6">Deposit Summary</h2>

                        <div className="space-y-4 border-b-[2px] border-white/10 pb-6 mb-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Transaction Type</p>
                                <p className="font-display text-lg font-black mt-1 uppercase text-[var(--acid)]">Wallet Refill</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Authorized Account</p>
                                <p className="font-mono text-xs font-bold mt-1 opacity-70">IntelliBid Buyer Wallet</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Refill Amount</p>
                                <p className="text-xs font-bold opacity-60">(Wallet credits immediately)</p>
                            </div>
                            <p className="font-display text-4xl font-black text-[var(--acid)] drop-shadow-[1.5px_1.5px_0_var(--ink)]">${Number(amount)?.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function SandboxDeposit() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[var(--background)]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--electric)]" />
            </div>
        }>
            <SandboxDepositContent />
        </Suspense>
    );
}
