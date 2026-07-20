import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    user: null,
    viewMode: null,
    setViewMode: (mode) => set({ viewMode: mode }),
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
    checkAuth: async () => {
        try {
            const { api } = await import('@/lib/api');
            const res = await api('/api/auth/me');
            if (res.success) set({ user: res.user });
        } catch (err) {
            set({ user: null });
        }
    }
}));