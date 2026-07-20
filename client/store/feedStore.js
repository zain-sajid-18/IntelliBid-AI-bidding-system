import { create } from 'zustand';
import { api } from '@/lib/api';

export const useFeedStore = create((set, get) => ({
    items: [],
    page: 1,
    loading: false,
    hasMore: true,
    feedType: 'personalized',
    filters: { category: '', minPrice: '', maxPrice: '' },

    fetchNextPage: async () => {
        const { page, loading, hasMore, filters, items } = get();
        if (loading || !hasMore) return;

        set({ loading: true });

        try {
            const params = new URLSearchParams({ page });
            if (filters.category) params.append('category', filters.category);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

            const data = await api(`/api/feed?${params.toString()}`);

            set((state) => {
                const newItems = page === 1 ? data.items : [...state.items, ...data.items];
                
                // Final client-side deduplication to prevent key collisions
                const uniqueItems = Array.from(new Map(newItems.map(item => [item._id, item])).values());

                return {
                    items: uniqueItems,
                    page: state.page + 1,
                    hasMore: data.hasMore,
                    feedType: data.type,
                };
            });
        } catch (error) {
            console.error('[FeedStore] Failed to fetch feed:', error);
        } finally {
            set({ loading: false });
        }
    },

    resetFeed: () => set({ items: [], page: 1, hasMore: true, loading: false }),

    setFilter: (key, value) => {
        set((state) => ({ filters: { ...state.filters, [key]: value } }));
        get().resetFeed();
    },
}));
