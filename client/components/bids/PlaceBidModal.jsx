import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBidsStore } from '@/store/bidsStore';
import { X, Gavel, AlertCircle, Loader2 } from 'lucide-react';

export default function PlaceBidModal() {
    const { selectedAuction, showBidModal, closeBidModal, placeBid } = useBidsStore();
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedAuction && showBidModal) {
            // Suggest current price + 10 as minimum increment, or at least +1
            const minIncrement = selectedAuction.currentPrice > 100 ? 10 : 1;
            setAmount((selectedAuction.currentPrice + minIncrement).toString());
            setError('');
        }
    }, [selectedAuction, showBidModal]);

    if (!showBidModal || !selectedAuction) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const bidValue = Number(amount);
        if (isNaN(bidValue)) return setError('Please enter a valid number');
        if (bidValue <= selectedAuction.currentPrice) {
            return setError(`Your bid must be higher than the current price of $${selectedAuction.currentPrice}`);
        }

        setLoading(true);
        const result = await placeBid(selectedAuction._id || selectedAuction.id, bidValue);
        setLoading(false);

        if (!result.success) {
            setError(result.message || 'Failed to place bid. Please try again.');
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeBidModal}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white border-[4px] border-[var(--ink)] rounded-3xl shadow-[12px_12px_0_0_var(--ink)] max-w-md w-full overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b-[4px] border-[var(--ink)] bg-[var(--acid)]">
                        <h2 className="font-display text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                            <Gavel size={24} /> Place Bid
                        </h2>
                        <button 
                            onClick={closeBidModal}
                            className="p-2 hover:bg-black/10 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Auction Info */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-xl border-[2px] border-[var(--ink)] overflow-hidden shrink-0 bg-gray-100">
                                {selectedAuction.images?.[0] && (
                                    <img src={selectedAuction.images[0]} alt="" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold leading-tight line-clamp-2">{selectedAuction.title}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">
                                    Current Bid: <span className="text-[var(--electric)]">${selectedAuction.currentPrice?.toLocaleString()}</span>
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest opacity-60 mb-2">
                                    Your Maximum Bid ($)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-display text-2xl font-black opacity-30">$</span>
                                    <input 
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        min={selectedAuction.currentPrice + 1}
                                        step="1"
                                        autoFocus
                                        className="w-full bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-xl py-4 pl-10 pr-4 font-display text-2xl font-black outline-none focus:shadow-[4px_4px_0_0_var(--hotpink)] focus:-translate-y-1 transition-all"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 p-3 bg-red-100 text-red-800 border-[2px] border-red-800 rounded-lg text-sm font-bold">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full mt-4 bg-[var(--electric)] text-white py-4 rounded-xl border-[3px] border-[var(--ink)] font-black uppercase tracking-widest text-lg shadow-[4px_4px_0_0_var(--ink)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--ink)] transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-[4px_4px_0_0_var(--ink)] flex justify-center items-center gap-2"
                            >
                                {loading ? <Loader2 size={24} className="animate-spin" /> : 'Confirm Bid'}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
