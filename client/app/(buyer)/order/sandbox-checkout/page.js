"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { ShieldCheck, CreditCard, Loader2, AlertCircle, ShoppingBag, ArrowLeft, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

function SandboxCheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { user } = useAuthStore();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const [card, setCard] = useState({
        number: '4242 •••• •••• 4242',
        expiry: '12/29',
        cvc: '•••',
        name: 'Test Buyer'
    });

    const [address, setAddress] = useState(() => {
        const userAddress = user?.shippingAddress || {};
        return {
            street: userAddress.street || '',
            city: userAddress.city || '',
            state: userAddress.state || '',
            zip: userAddress.zip || '',
            country: userAddress.country || ''
        };
    });

    useEffect(() => {
        if (!orderId) {
            setError('Missing Order ID');
            setLoading(false);
            return;
        }

        const fetchOrder = async () => {
            try {
                const res = await api('/api/buyer/orders');
                if (res.success) {
                    const found = res.data.find(o => o._id === orderId);
                    if (found) {
                        setOrder(found);
                    } else {
                        setError('Order not found');
                    }
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handlePay = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError('');

        // Validate address
        if (!address.street || !address.city || !address.state || !address.zip || !address.country) {
            setError('Please fill in all shipping address fields');
            setProcessing(false);
            return;
        }

        try {
            const res = await api('/api/payments/sandbox-success', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, shippingAddress: address })
            });

            if (res.success) {
                router.push('/order/success');
            } else {
                setError(res.message || 'Payment processing failed');
                setProcessing(false);
            }
        } catch (err) {
            setError(err.message || 'Payment simulation failed');
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[var(--background)]">
                <Loader2 className="h-10 w-10 animate-spin text-[var(--ink)] opacity-30" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-[var(--background)] p-6 text-center">
                <div className="brutal bg-white p-8 max-w-md border-[3px] border-[var(--ink)] shadow-[6px_6px_0_0_var(--ink)] rounded-2xl">
                    <AlertCircle size={48} className="mx-auto text-[var(--hotpink)] mb-4" />
                    <h2 className="font-display text-2xl font-black uppercase mb-2">Checkout Error</h2>
                    <p className="font-medium opacity-70 mb-6">{error || 'Unable to load checkout details'}</p>
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
                            Stripe Sandbox Mode
                        </div>

                        <h1 className="font-display text-3xl font-black uppercase tracking-tight mb-2">Simulated Checkout</h1>
                        <p className="text-sm font-medium opacity-60 mb-6">You are in a sandboxed staging environment. No real funds will be charged.</p>

                        <form onSubmit={handlePay} className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest opacity-50">Shipping Address</label>
                                <div className="brutal bg-[var(--background)] border-[3px] border-[var(--ink)] p-4 rounded-xl space-y-4">
                                    <div className="relative">
                                        <MapPin size={20} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
                                        <input 
                                            type="text" 
                                            name="street"
                                            value={address.street} 
                                            onChange={handleAddressChange}
                                            placeholder="Street Address (e.g., 123 Main St)"
                                            className="bg-transparent font-bold text-lg outline-none w-full pl-12 py-2"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase opacity-40">City</label>
                                            <input 
                                                type="text" 
                                                name="city"
                                                value={address.city} 
                                                onChange={handleAddressChange}
                                                className="bg-transparent font-bold outline-none w-full mt-1"
                                                placeholder="City"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase opacity-40">State/Province</label>
                                            <input 
                                                type="text" 
                                                name="state"
                                                value={address.state} 
                                                onChange={handleAddressChange}
                                                className="bg-transparent font-bold outline-none w-full mt-1"
                                                placeholder="State"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase opacity-40">ZIP/Postal Code</label>
                                            <input 
                                                type="text" 
                                                name="zip"
                                                value={address.zip} 
                                                onChange={handleAddressChange}
                                                className="bg-transparent font-bold outline-none w-full mt-1"
                                                placeholder="ZIP Code"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase opacity-40">Country</label>
                                            <input 
                                                type="text" 
                                                name="country"
                                                value={address.country} 
                                                onChange={handleAddressChange}
                                                className="bg-transparent font-bold outline-none w-full mt-1"
                                                placeholder="Country"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

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

                            <button 
                                type="submit" 
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 bg-[var(--electric)] text-white py-4 rounded-2xl border-[3px] border-[var(--ink)] font-display text-lg font-black uppercase tracking-wider shadow-[4px_4px_0_0_var(--ink)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--ink)] transition-all disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} /> Authorizing...
                                    </>
                                ) : (
                                    <>
                                        Authorize Sandbox Charge (${order.amount})
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="flex justify-between px-4">
                        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-black uppercase tracking-wide opacity-50 hover:opacity-100 hover:text-[var(--hotpink)] transition-all">
                            <ArrowLeft size={16} strokeWidth={3} /> Cancel and Return
                        </Link>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                            <ShieldCheck size={16} /> Fully Secure Sandbox
                        </span>
                    </div>
                </div>

                {/* Right side: Invoice card */}
                <div className="md:col-span-5">
                    <div className="brutal bg-[var(--acid)] text-[var(--ink)] p-8 border-[3px] border-[var(--ink)] shadow-[8px_8px_0_0_var(--ink)] rounded-3xl sticky top-6">
                        <ShoppingBag size={32} strokeWidth={2.5} className="mb-4" />
                        <h2 className="font-display text-2xl font-black uppercase tracking-tight mb-6">Order Details</h2>

                        <div className="space-y-4 border-b-[2px] border-[var(--ink)]/10 pb-6 mb-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Auction Item</p>
                                <p className="font-display text-lg font-black mt-1 line-clamp-2 leading-tight uppercase">{order.auction?.title}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Invoice Reference</p>
                                <p className="font-mono text-xs font-bold mt-1 opacity-70">{order._id}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Total Charge</p>
                                <p className="text-xs font-bold opacity-60">(Includes 0% simulator taxes)</p>
                            </div>
                            <p className="font-display text-4xl font-black drop-shadow-[1.5px_1.5px_0_white]">${order.amount?.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function SandboxCheckout() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[var(--background)]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--electric)]" />
            </div>
        }>
            <SandboxCheckoutContent />
        </Suspense>
    );
}
