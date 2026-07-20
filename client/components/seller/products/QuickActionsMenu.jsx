"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Edit, Zap, Ban, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useListingStore } from "@/store/listingStore";

export default function QuickActionsMenu({ listing, onClose, onDeleted, onEnded }) {
    const router = useRouter();
    const { setTitle, setDescription, setCategory, setTags, setStep } = useListingStore();
    const [loading, setLoading] = useState(null);
    const [confirmCancel, setConfirmCancel] = useState(false);

    const handleEndEarly = async () => {
        setLoading('end');
        try {
            await api(`/api/seller/listings/${listing.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'ended' }),
            });
            onEnded?.(listing.id);
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(null);
            onClose();
        }
    };

    const handleCancel = async () => {
        setLoading('cancel');
        try {
            await api(`/api/seller/listings/${listing.id}`, { method: 'DELETE' });
            onDeleted?.(listing.id);
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(null);
            onClose();
        }
    };

    const handleRelist = async () => {
        setLoading('relist');
        
        // Pre-fill the create wizard with this listing's data
        setTitle(listing.title);
        setDescription('');
        setCategory(listing.category);
        setTags([]);
        
        const { setExistingImages } = useListingStore.getState();
        if (listing.images && listing.images.length > 0) {
            await setExistingImages(listing.images);
        }
        
        setStep(0); // Go to step 0 (Images) so they can verify/add new images
        router.push('/seller/listings/create');
        onClose();
    };

    const actions = [
        listing.status === 'draft' && {
            key: 'publish',
            icon: Zap,
            label: 'Publish Now',
            color: 'var(--electric)',
            onClick: async () => {
                setLoading('publish');
                try {
                    await api(`/api/seller/listings/${listing.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ status: 'active' }),
                    });
                    onEnded?.(listing.id); // Re-trigger refresh
                } catch (e) { alert(e.message); }
                setLoading(null);
                onClose();
            }
        },
        listing.status === 'active' && {
            key: 'end',
            icon: Ban,
            label: 'End Early',
            color: 'var(--sunset)',
            onClick: handleEndEarly,
        },
        listing.status === 'ended' && {
            key: 'relist',
            icon: RotateCcw,
            label: 'Re-list',
            color: 'var(--acid)',
            onClick: handleRelist,
        },
        (listing.status === 'active' || listing.status === 'draft') && {
            key: 'cancel',
            icon: Ban,
            label: listing.bidCount > 0 ? 'Cancel (has bids)' : 'Cancel Listing',
            color: 'var(--hotpink)',
            disabled: listing.bidCount > 0,
            onClick: () => setConfirmCancel(true),
        },
    ].filter(Boolean);

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={onClose} />

            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -8 }}
                    className="absolute bottom-10 right-0 z-50 w-44 overflow-hidden rounded-xl border-[3px] border-[var(--ink)] bg-white shadow-[5px_5px_0_0_var(--ink)]"
                >
                    {confirmCancel ? (
                        <div className="p-3">
                            <p className="text-xs font-bold mb-2">Are you sure? This cannot be undone.</p>
                            <div className="flex gap-2">
                                <button onClick={handleCancel} className="flex-1 rounded-lg border-[2px] border-[var(--ink)] bg-[var(--hotpink)] py-1.5 text-[10px] font-black uppercase text-white">
                                    {loading === 'cancel' ? <Loader2 className="mx-auto h-3 w-3 animate-spin" /> : 'Yes, cancel'}
                                </button>
                                <button onClick={() => setConfirmCancel(false)} className="flex-1 rounded-lg border-[2px] border-[var(--ink)] bg-white py-1.5 text-[10px] font-black uppercase">
                                    Back
                                </button>
                            </div>
                        </div>
                    ) : (
                        actions.map(action => (
                            <button
                                key={action.key}
                                onClick={action.disabled ? undefined : action.onClick}
                                disabled={action.disabled || !!loading}
                                className="flex w-full items-center gap-2.5 border-b-[2px] border-[var(--ink)]/10 px-3 py-2.5 text-left text-xs font-bold transition-colors last:border-0 hover:bg-[var(--background)] disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-[2px] border-[var(--ink)]" style={{ background: action.color }}>
                                    {loading === action.key ? (
                                        <Loader2 className="h-3 w-3 animate-spin text-white" />
                                    ) : (
                                        <action.icon className="h-3 w-3 text-white" strokeWidth={3} />
                                    )}
                                </span>
                                {action.label}
                            </button>
                        ))
                    )}
                </motion.div>
            </AnimatePresence>
        </>
    );
}
