import { create } from 'zustand';
import { api } from '@/lib/api';

export const useBidsStore = create((set, get) => ({
    bids: [],
    stats: { activeBids: 0, itemsWon: 0, lost: 0, totalSpent: 0 },
    activeTab: 'active',
    page: 1,
    hasMore: true,
    loading: false,

    // Modal state
    selectedAuction: null,
    showBidModal: false,

    fetchBids: async () => {
        const { page, activeTab, loading, hasMore, bids } = get();
        if (loading || (!hasMore && page !== 1)) return;

        set({ loading: true });

        try {
            const params = new URLSearchParams({ tab: activeTab, page });
            const data = await api(`/api/buyer/bids?${params.toString()}`);

            set({
                bids: page === 1 ? data.bids : [...bids, ...data.bids],
                page: page + 1,
                hasMore: data.hasMore,
            });
        } catch (error) {
            console.error('[BidsStore] Failed to fetch bids:', error);
        } finally {
            set({ loading: false });
        }
    },

    fetchStats: async () => {
        try {
            const data = await api('/api/buyer/dashboard/stats');
            set({ stats: data.data });
        } catch (error) {
            console.error('[BidsStore] Failed to fetch stats:', error);
        }
    },

    setTab: (tab) => {
        set({ activeTab: tab, page: 1, bids: [], hasMore: true });
        get().fetchBids();
    },

    resetBids: () => {
        set({ page: 1, bids: [], hasMore: true });
        get().fetchBids();
    },

    openBidModal: (auction) => set({ selectedAuction: auction, showBidModal: true }),
    closeBidModal: () => set({ selectedAuction: null, showBidModal: false }),

    placeBid: async (auctionId, amount) => {
        try {
            await api('/api/buyer/bids/place', {
                method: 'POST',
                body: JSON.stringify({ auctionId, bidAmount: amount })
            });
            // Refresh bids and stats after successful bid
            get().resetBids();
            get().fetchStats();
            get().closeBidModal();
            return { success: true };
        } catch (error) {
            console.error('[BidsStore] Failed to place bid:', error);
            return { success: false, message: error.message };
        }
    }
}));
