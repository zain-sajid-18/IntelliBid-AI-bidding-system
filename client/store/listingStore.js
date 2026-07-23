import { create } from 'zustand';

const CATEGORIES = [
    'Electronics', 'Cameras', 'Watches', 'Sneakers', 'Art',
    'Jewelry', 'Music', 'Vintage', 'Collectibles', 'Fashion', 'Sports', 'Other'
];

const DURATIONS = [
    { label: '3 Days', value: 3 },
    { label: '5 Days', value: 5 },
    { label: '7 Days', value: 7 },
    { label: '14 Days', value: 14 },
];

const LIVE_DURATIONS = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
];

export { CATEGORIES, DURATIONS, LIVE_DURATIONS };

export const useListingStore = create((set, get) => ({
    // Wizard step (0 = images, 1 = details, 2 = pricing)
    step: 0,

    // Step 1: Images
    imageFiles: [],      // File objects for upload
    imagePreviews: [],   // Data URL strings for preview

    // Step 2: Details (AI-enhanced)
    title: '',
    description: '',
    category: '',
    tags: [],
    aiLoading: false,
    aiError: null,
    aiUsed: false,

    // Step 3: Pricing
    startingPrice: '',
    reservePrice: '',
    durationDays: 7,
    status: 'active',   // 'active' | 'draft'
    // Live Bidding
    type: 'standard', // 'standard' | 'live'
    scheduledStartTime: '',
    liveDurationMinutes: 60, // default 1 hour

    // Submission
    submitting: false,
    submitError: null,
    submitSuccess: false,
    createdListingId: null,

    // ── Actions ──────────────────────────────────────────────────────────────

    setStep: (step) => set({ step }),
    nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 2) })),
    prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),

    addImages: (files) => set((s) => {
        const remaining = 6 - s.imageFiles.length;
        const newFiles = Array.from(files).slice(0, remaining);
        const newPreviews = newFiles.map(f => URL.createObjectURL(f));
        return {
            imageFiles: [...s.imageFiles, ...newFiles],
            imagePreviews: [...s.imagePreviews, ...newPreviews],
        };
    }),

    setExistingImages: async (imageUrls) => {
        try {
            const files = await Promise.all(imageUrls.map(async (url, index) => {
                const response = await fetch(url);
                const blob = await response.blob();
                // Extract original extension or fallback to jpg
                const ext = url.split('.').pop().split('?')[0] || 'jpg';
                return new File([blob], `relist-image-${index}.${ext}`, { type: blob.type });
            }));
            
            const newPreviews = files.map(f => URL.createObjectURL(f));
            set({
                imageFiles: files,
                imagePreviews: newPreviews
            });
        } catch (e) {
            console.error("Failed to load existing images:", e);
        }
    },

    removeImage: (index) => set((s) => {
        const previews = [...s.imagePreviews];
        URL.revokeObjectURL(previews[index]);
        previews.splice(index, 1);
        const files = [...s.imageFiles];
        files.splice(index, 1);
        return { imageFiles: files, imagePreviews: previews };
    }),

    setTitle: (title) => set({ title }),
    setDescription: (description) => set({ description }),
    setCategory: (category) => set({ category }),
    setTags: (tags) => set({ tags }),
    addTag: (tag) => set((s) => {
        const cleaned = tag.trim().toLowerCase();
        if (!cleaned || s.tags.includes(cleaned) || s.tags.length >= 8) return {};
        return { tags: [...s.tags, cleaned] };
    }),
    removeTag: (tag) => set((s) => ({ tags: s.tags.filter(t => t !== tag) })),

    setStartingPrice: (v) => set({ startingPrice: v }),
    setReservePrice: (v) => set({ reservePrice: v }),
    setDurationDays: (v) => set({ durationDays: v }),
    setStatus: (v) => set({ status: v }),
    setType: (v) => set({ type: v }),
    setScheduledStartTime: (v) => set({ scheduledStartTime: v }),
    setLiveDurationMinutes: (v) => set({ liveDurationMinutes: v }),

    runAiEnhance: async () => {
        const { title, category, imagePreviews } = get();
        if (!title || !category) return;
        set({ aiLoading: true, aiError: null });

        console.log('[AI Enhance] Starting enhancement for:', { title, category });

        try {
            const { api } = await import('@/lib/api');
            const res = await api('/api/seller/listings/ai-enhance', {
                method: 'POST',
                body: JSON.stringify({ 
                    rawTitle: title, 
                    category, 
                    imageCount: imagePreviews.length 
                }),
            });

            console.log('[AI Enhance] API Response:', res);

            if (res.success && res.data) {
                set({
                    title: res.data.enhancedTitle || title,
                    description: res.data.description || '',
                    tags: Array.isArray(res.data.tags) ? res.data.tags : [],
                    startingPrice: res.data.suggestedStartingPrice > 0 
                        ? String(res.data.suggestedStartingPrice) 
                        : get().startingPrice,
                    aiUsed: true,
                    aiLoading: false,
                    aiError: null
                });
                console.log('[AI Enhance] State updated successfully');
            } else {
                const errMsg = res.message || 'AI enhancement failed to return data';
                set({ aiError: errMsg, aiLoading: false });
                console.error('[AI Enhance] Enhancement failed:', errMsg);
            }
        } catch (e) {
            console.error('[AI Enhance] Error during enhancement:', e);
            set({ aiError: e.message || 'Network error occurred', aiLoading: false });
        }
    },

    submitListing: async () => {
        const s = get();
        set({ submitting: true, submitError: null });

        try {
            const { api } = await import('@/lib/api');
            const formData = new FormData();

            s.imageFiles.forEach(f => formData.append('images', f));
            formData.append('title', s.title);
            formData.append('description', s.description);
            formData.append('category', s.category);
            formData.append('tags', JSON.stringify(s.tags));
            formData.append('startingPrice', s.startingPrice);
            if (s.reservePrice) formData.append('reservePrice', s.reservePrice);
            formData.append('durationDays', String(s.durationDays));
            formData.append('status', s.status);
            formData.append('type', s.type);
            if (s.type === 'live') {
                formData.append('scheduledStartTime', s.scheduledStartTime);
                formData.append('liveDurationMinutes', String(s.liveDurationMinutes));
            }

            const res = await api('/api/seller/listings', {
                method: 'POST',
                body: formData,
            });

            if (res.success) {
                set({ submitting: false, submitSuccess: true, createdListingId: res.data._id });
            } else {
                set({ submitting: false, submitError: res.message || 'Failed to create listing' });
            }
        } catch (e) {
            set({ submitting: false, submitError: e.message });
        }
    },

    reset: () => set({
        step: 0, imageFiles: [], imagePreviews: [], title: '', description: '',
        category: '', tags: [], aiLoading: false, aiError: null, aiUsed: false,
        startingPrice: '', reservePrice: '', durationDays: 7, status: 'active',
        type: 'standard', scheduledStartTime: '', liveDurationMinutes: 60,
        submitting: false, submitError: null, submitSuccess: false, createdListingId: null,
    }),
}));
