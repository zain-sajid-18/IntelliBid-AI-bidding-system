import { create } from 'zustand';
import { api } from '@/lib/api';

export const useWatchlistStore = create((set, get) => ({
    watchedItems: new Set(),
    initialized: false,

    fetchWatchlist: async () => {
        try {
            const res = await api('/api/buyer/watchlist');
            if (res.success) {
                set({
                    watchedItems: new Set(res.data.map(item => item._id || item.id)),
                    initialized: true
                });
            }
        } catch (e) {
            console.error('Failed to fetch watchlist', e);
        }
    },

    toggleWatchlist: async (auctionId) => {
        // Optimistic update
        const prev = new Set(get().watchedItems);
        const next = new Set(prev);
        if (next.has(auctionId)) next.delete(auctionId);
        else next.add(auctionId);
        
        set({ watchedItems: next });

        try {
            await api('/api/buyer/watchlist/toggle', {
                method: 'POST',
                body: JSON.stringify({ auctionId })
            });
        } catch (e) {
            // Revert on error
            set({ watchedItems: prev });
            console.error('Failed to toggle watchlist', e);
        }
    },

    isWatched: (auctionId) => get().watchedItems.has(auctionId)
}));
