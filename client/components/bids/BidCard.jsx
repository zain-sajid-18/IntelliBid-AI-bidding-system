import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useBidsStore } from '@/store/bidsStore';
import { Clock, ArrowRight, Gavel, Loader2, ShieldCheck, Package, CheckCircle2, CreditCard } from 'lucide-react';
import { api } from '@/lib/api';

export default function BidCard({ bid }) {
    const { openBidModal } = useBidsStore();
    const auction = bid.auction || {};
    const order = bid.order;
    
    // Status Logic
    const isWinning = bid.status === 'winning';
    const isWon = bid.status === 'won';
    const isLost = bid.status === 'outbid' && auction.status !== 'active';
    const isOutbid = bid.status === 'outbid' && auction.status === 'active';

    let statusConfig = { label: 'Unknown', color: 'bg-gray-200 text-gray-800' };
    if (isWinning) {
        statusConfig = { label: 'Winning', color: 'bg-[var(--acid)] text-[var(--ink)] border-[var(--ink)]' };
    } else if (isWon) {
        if (!order) {
            statusConfig = { label: 'Won', color: 'bg-[var(--sunset)] text-white border-[var(--ink)]' };
        } else if (order.status === 'pending') {
            statusConfig = { label: 'Won (Unpaid)', color: 'bg-[var(--sunset)] text-white border-[var(--ink)] animate-pulse' };
        } else if (order.status === 'paid') {
            statusConfig = { label: 'Won (Paid)', color: 'bg-[var(--acid)] text-[var(--ink)] border-[var(--ink)]' };
        } else if (order.status === 'shipped') {
            statusConfig = { label: 'Won (Shipped)', color: 'bg-[var(--electric)] text-white border-[var(--ink)]' };
        } else if (order.status === 'completed') {
            statusConfig = { label: 'Won (Completed)', color: 'bg-green-600 text-white border-[var(--ink)]' };
        } else if (order.status === 'cancelled') {
            statusConfig = { label: 'Defaulted/Cancelled', color: 'bg-red-750 text-white border-[var(--ink)]' };
        }
    } else if (isLost) {
        statusConfig = { label: 'Lost', color: 'bg-red-500 text-white border-red-900' };
    } else if (isOutbid) {
        statusConfig = { label: 'Outbid', color: 'bg-[var(--hotpink)] text-white border-[var(--ink)] animate-pulse' };
    }

    // Timer logic
    const [timeLeft, setTimeLeft] = useState('');
    const [orderTimeLeft, setOrderTimeLeft] = useState('');
    const [paying, setPaying] = useState(false);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        if (!auction.endTime || auction.status !== 'active') return;
        
        const calculateTimeLeft = () => {
            const diff = new Date(auction.endTime).getTime() - Date.now();
            if (diff <= 0) return 'Ended';
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            if (hours > 24) {
                const days = Math.floor(hours / 24);
                const remainingHours = hours % 24;
                return `${days}d ${remainingHours}h ${minutes}m`;
            }
            if (hours > 0) return `${hours}h ${minutes}m`;
            return `${minutes}m left`;
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);
        return () => clearInterval(timer);
    }, [auction.endTime, auction.status]);

    useEffect(() => {
        if (!order || order.status !== 'pending' || !order.expiresAt) return;
        
        const calculateOrderTimeLeft = () => {
            const diff = new Date(order.expiresAt).getTime() - Date.now();
            if (diff <= 0) return 'Expired';
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            if (hours > 24) {
                const days = Math.floor(hours / 24);
                const remainingHours = hours % 24;
                return `Pay: ${days}d ${remainingHours}h ${minutes}m`;
            }
            if (hours > 0) return `Pay: ${hours}h ${minutes}m`;
            return `Pay: ${minutes}m left`;
        };

        setOrderTimeLeft(calculateOrderTimeLeft());
        const timer = setInterval(() => setOrderTimeLeft(calculateOrderTimeLeft()), 60000);
        return () => clearInterval(timer);
    }, [order]);

    const handlePayment = async () => {
        if (paying) return;
        setPaying(true);
        try {
            const res = await api('/api/payments/create-checkout', {
                method: 'POST',
                body: JSON.stringify({ orderId: order._id })
            });
            if (res.success && res.url) {
                window.location.href = res.url;
            } else {
                alert('Failed to initiate payment. Please try again.');
            }
        } catch (err) {
            console.error(err);
            alert(err.message || 'Failed to initiate payment.');
        } finally {
            setPaying(false);
        }
    };

    const handleCompleteOrder = async () => {
        if (completing) return;
        if (!confirm('Mark this item as received and finalize the trade? This will release funds to the seller.')) return;
        setCompleting(true);
        try {
            const res = await api(`/api/buyer/orders/${order._id}/complete`, {
                method: 'POST'
            });
            if (res.success) {
                useBidsStore.getState().resetBids();
                useBidsStore.getState().fetchStats();
            } else {
                alert('Failed to complete the order.');
            }
        } catch (err) {
            console.error(err);
            alert(err.message || 'Failed to complete the order.');
        } finally {
            setCompleting(false);
        }
    };

    const auctionId = auction._id || auction.id;
    if (!auctionId) return null; // Defensive check if populated auction is missing

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative z-0 flex flex-col md:flex-row bg-white border-[3px] border-[var(--ink)] rounded-2xl overflow-hidden shadow-[4px_4px_0_0_var(--ink)] transition-all ${isWon ? 'ring-4 ring-[var(--sunset)] ring-opacity-50' : ''}`}
        >
            {/* Status Badge */}
            <div className={`absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-[2px] shadow-[2px_2px_0_0_var(--ink)] flex items-center gap-1 ${statusConfig.color}`}>
                {statusConfig.label}
            </div>

            {/* Image */}
            <div className="relative w-full md:w-64 h-64 border-b-[3px] md:border-b-0 md:border-r-[3px] border-[var(--ink)] bg-gray-100 shrink-0">
                {auction.images?.[0] ? (
                    <img 
                        src={auction.images[0]} 
                        alt={auction.title}
                        className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center font-display opacity-10">No Image</div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 md:p-6 flex flex-col flex-1">
                <h3 className="font-display font-black text-xl leading-tight line-clamp-1 mb-4">
                    {auction.title}
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-[var(--background)] rounded-xl border-[3px] border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--ink)]/60">Your Bid</p>
                        <p className={`font-display text-2xl font-black mt-1 ${isWinning || isWon ? 'text-[var(--ink)]' : 'text-[var(--ink)]/40 line-through'}`}>
                            ${bid.amount?.toLocaleString()}
                        </p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border-[3px] border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--ink)]/60">Highest Bid</p>
                        <p className="font-display text-2xl font-black text-[var(--electric)] mt-1">
                            ${auction.currentPrice?.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="mt-auto flex flex-col sm:flex-row items-center gap-3">
                    {auction.status === 'active' ? (
                        <div className="flex-1 flex items-center gap-2 text-sm font-bold bg-white px-3 py-2 border-[2px] border-[var(--ink)] rounded-lg">
                            <Clock size={16} className={timeLeft.includes('m left') ? 'text-[var(--hotpink)]' : ''} />
                            <span className={timeLeft.includes('m left') ? 'text-[var(--hotpink)]' : ''}>{timeLeft}</span>
                            <span className="opacity-50 text-xs ml-auto">({auction.bidCount} bids)</span>
                        </div>
                    ) : isWon && order ? (
                        <div className="flex-1 flex flex-col gap-1 w-full text-left">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[var(--ink)]/70">
                                {order.status === 'pending' && (
                                    <>
                                        <Clock size={14} className="text-[var(--hotpink)]" />
                                        <span className="text-[var(--hotpink)] font-black">{orderTimeLeft}</span>
                                    </>
                                )}
                                {order.status === 'paid' && (
                                    <>
                                        <ShieldCheck size={14} className="text-green-600 animate-pulse" />
                                        <span className="text-green-600 font-black">Paid. Preparing Package.</span>
                                    </>
                                )}
                                {order.status === 'shipped' && (
                                    <>
                                        <Package size={14} className="text-[var(--electric)] animate-bounce" />
                                        <span className="text-[var(--electric)] font-black">Package Shipped</span>
                                    </>
                                )}
                                {order.status === 'completed' && (
                                    <>
                                        <CheckCircle2 size={14} className="text-green-600" />
                                        <span className="text-green-600 font-black">Escrow Released</span>
                                    </>
                                )}
                                {order.status === 'cancelled' && (
                                    <span className="text-red-600 font-black">Cancelled (Delinquent)</span>
                                )}
                            </div>
                            {order.trackingNumber && (
                                <p className="text-[10px] font-mono font-bold bg-gray-50 px-2 py-1 rounded border border-black/10 mt-1 max-w-max">
                                    Tracking: <span className="text-[var(--electric)]">{order.trackingNumber}</span>
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center gap-2 text-sm font-bold bg-gray-100 text-gray-500 px-3 py-2 border-[2px] border-gray-300 rounded-lg">
                            Auction Ended
                        </div>
                    )}

                    <div className="flex w-full sm:w-auto gap-2">
                        <Link 
                            href={`/auction/${auctionId}`}
                            className="flex-1 sm:flex-none flex items-center justify-center p-3 border-[3px] border-[var(--ink)] rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <ArrowRight size={20} />
                        </Link>
                        
                        {isOutbid && (
                            <button 
                                onClick={() => openBidModal(auction)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[var(--hotpink)] text-white px-6 py-3 rounded-xl border-[3px] border-[var(--ink)] font-black uppercase tracking-widest text-xs shadow-[4px_4px_0_0_var(--ink)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--ink)] transition-all"
                            >
                                <Gavel size={16} /> Raise Bid
                            </button>
                        )}

                        {isWon && order && order.status === 'pending' && (
                            <button 
                                onClick={handlePayment}
                                disabled={paying}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[var(--sunset)] text-white px-6 py-3 rounded-xl border-[3px] border-[var(--ink)] font-black uppercase tracking-widest text-xs shadow-[4px_4px_0_0_var(--ink)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--ink)] transition-all disabled:opacity-50"
                            >
                                {paying ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />} Pay Now
                            </button>
                        )}

                        {isWon && order && order.status === 'shipped' && (
                            <button 
                                onClick={handleCompleteOrder}
                                disabled={completing}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl border-[3px] border-[var(--ink)] font-black uppercase tracking-widest text-xs shadow-[4px_4px_0_0_var(--ink)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--ink)] transition-all disabled:opacity-50"
                            >
                                {completing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Mark Received
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
