import { create } from 'zustand';
import { api } from '@/lib/api';
import { useMessagesStore } from './messagesStore'; // We use the same socket instance!

export const useAuctionStore = create((set, get) => ({
    auction: null,
    loading: true,
    error: null,
    submittingBid: false,

    fetchAuction: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await api(`/api/auction/${id}`);
            if (res.success) {
                set({ auction: res.data, loading: false });
                get().joinAuctionRoom(id);
            } else {
                set({ error: res.message, loading: false });
            }
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    joinAuctionRoom: (id) => {
        const socket = useMessagesStore.getState().socket;
        if (socket) {
            socket.emit('join:auction', id);
            
            // Listen for new bids globally (if not already bound)
            // To avoid duplicate listeners, we bind it on mount and unbind on unmount in the component,
            // but for simplicity we can just handle it here if we ensure we don't bind twice.
            socket.off('bid:new'); // clear old
            socket.on('bid:new', (data) => {
                if (data.auctionId === get().auction?._id) {
                    set(state => ({
                        auction: {
                            ...state.auction,
                            currentPrice: data.newPrice,
                            bidCount: data.bidCount,
                            bidHistory: [
                                {
                                    id: `live-${Date.now()}`,
                                    amount: data.newPrice,
                                    time: data.timestamp,
                                    bidderName: data.bidderName,
                                },
                                ...state.auction.bidHistory
                            ].slice(0, 10) // keep top 10
                        }
                    }));
                }
            });
        }
    },

    leaveAuctionRoom: (id) => {
        const socket = useMessagesStore.getState().socket;
        if (socket) {
            socket.emit('leave:auction', id);
            socket.off('bid:new');
        }
        set({ auction: null, error: null }); // clear state
    },

    placeBid: async (amount) => {
        const { auction } = get();
        if (!auction) return { success: false, message: 'No active auction' };

        set({ submittingBid: true });
        try {
            const res = await api('/api/buyer/bids/place', {
                method: 'POST',
                body: JSON.stringify({ auctionId: auction._id, bidAmount: amount })
            });

            if (res.success) {
                // We don't immediately update state; we rely on the socket 'bid:new' event
                // to update everyone simultaneously, including ourselves!
                set({ submittingBid: false });
                return { success: true };
            } else {
                set({ submittingBid: false });
                return { success: false, message: res.message };
            }
        } catch (err) {
            set({ submittingBid: false });
            return { success: false, message: err.message };
        }
    }
}));
