"use client";

import { create } from 'zustand';

export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      duration: 4000,
      ...toast,
    };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    // Auto-dismiss
    if (newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
      }, newToast.duration);
    }
    return id;
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),
  // Shortcut helpers
  success: (message, opts = {}) => useToastStore.getState().addToast({ type: 'success', message, ...opts }),
  error: (message, opts = {}) => useToastStore.getState().addToast({ type: 'error', message, ...opts }),
  info: (message, opts = {}) => useToastStore.getState().addToast({ type: 'info', message, ...opts }),
  warning: (message, opts = {}) => useToastStore.getState().addToast({ type: 'warning', message, ...opts }),
}));

// Global helper (so we can use anywhere without importing store every time)
if (typeof window !== 'undefined') {
  window.toast = useToastStore.getState();
  
  // GLOBAL SAFETY NET: Replace native alert() with toast.warning!
  // This catches ALL remaining alert() calls throughout the app without editing each file
  window.nativeAlert = window.alert.bind(window);
  window.alert = function(message) {
    try {
      // Don't spam repeated same messages
      const store = useToastStore.getState();
      if (store && store.warning) {
        store.warning(String(message), { duration: 4500 });
      } else {
        window.nativeAlert(message);
      }
    } catch (e) {
      window.nativeAlert(message);
    }
  };
  // Also set confirm to just always proceed (since we use toasts for warnings now)
  // Keep nativeConfirm available if code needs it
  window.nativeConfirm = window.confirm.bind(window);
}
