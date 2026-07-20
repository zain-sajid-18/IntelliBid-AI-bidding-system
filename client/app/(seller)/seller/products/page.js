"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import ProductCard from "@/components/seller/products/ProductCard";
import ProductFilters from "@/components/seller/products/ProductFilters";
import Link from "next/link";
import { Plus, Loader2, Package } from "lucide-react";

function SkeletonCard() {
    return (
        <div className="brutal bg-white overflow-hidden animate-pulse">
            <div className="h-44 bg-[var(--ink)]/10 border-b-[3px] border-[var(--ink)]" />
            <div className="p-4 space-y-3">
                <div className="h-3 w-20 rounded bg-[var(--ink)]/10" />
                <div className="h-4 w-full rounded bg-[var(--ink)]/10" />
                <div className="h-4 w-3/4 rounded bg-[var(--ink)]/10" />
                <div className="h-px bg-[var(--ink)]/10 mt-4" />
                <div className="flex justify-between mt-3">
                    <div className="h-3 w-20 rounded bg-[var(--ink)]/10" />
                    <div className="h-4 w-16 rounded bg-[var(--ink)]/10" />
                </div>
            </div>
        </div>
    );
}

function EmptyState({ status }) {
    const messages = {
        active:    { icon: '📡', title: 'No live listings', sub: 'Publish a listing to see it here.' },
        draft:     { icon: '📋', title: 'No drafts saved', sub: 'Start a listing and save it as a draft.' },
        ended:     { icon: '🏁', title: 'No ended auctions', sub: 'Completed auctions will appear here.' },
        cancelled: { icon: '🗑️', title: 'No cancelled listings', sub: 'Cancelled listings will appear here.' },
        all:       { icon: '📦', title: 'No listings yet', sub: "You haven't listed anything yet. Let's fix that!" },
    };
    const m = messages[status] || messages.all;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="brutal bg-[var(--acid)] col-span-full flex flex-col items-center justify-center py-20 text-center"
        >
            <div className="text-6xl mb-4">{m.icon}</div>
            <h3 className="font-display text-2xl font-black uppercase">{m.title}</h3>
            <p className="mt-2 font-medium text-[var(--ink)]/60">{m.sub}</p>
            <Link href="/seller/create" className="mt-6 flex items-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--ink)] px-6 py-3 font-display text-sm font-black uppercase text-white shadow-[4px_4px_0_0_var(--electric)] transition-all hover:-translate-y-1">
                <Plus className="h-4 w-4" strokeWidth={3} /> Create First Listing
            </Link>
        </motion.div>
    );
}

export default function MyProductsPage() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');

    const fetchListings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api('/api/seller/listings?limit=100');
            if (res.listings) setListings(res.listings);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchListings(); }, [fetchListings]);

    // Count per status for tabs
    const counts = useMemo(() => listings.reduce((acc, l) => {
        acc[l.status] = (acc[l.status] || 0) + 1;
        return acc;
    }, {}), [listings]);

    // Filter + search + sort (all client-side for snappiness)
    const displayed = useMemo(() => {
        let items = listings;
        if (status !== 'all') items = items.filter(l => l.status === status);
        if (search.trim()) {
            const q = search.toLowerCase();
            items = items.filter(l => l.title.toLowerCase().includes(q) || l.category?.toLowerCase().includes(q));
        }
        switch (sort) {
            case 'ending':    items = [...items].sort((a, b) => new Date(a.endTime) - new Date(b.endTime)); break;
            case 'mostbids':  items = [...items].sort((a, b) => (b.bidCount || 0) - (a.bidCount || 0)); break;
            case 'highprice': items = [...items].sort((a, b) => (b.currentPrice || 0) - (a.currentPrice || 0)); break;
            default:          items = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
        }
        return items;
    }, [listings, status, search, sort]);

    const handleDeleted = (id) => setListings(prev => prev.filter(l => l.id !== id));
    const handleEnded = () => fetchListings();

    return (
        <div className="min-h-screen bg-[var(--background)] p-6 md:p-10">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-[4px] border-[var(--ink)] pb-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--electric)] shadow-[4px_4px_0_0_var(--ink)]">
                        <Package className="h-7 w-7 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight">My Products</h1>
                        <p className="mt-0.5 font-medium text-[var(--ink)]/60">
                            {listings.length} listing{listings.length !== 1 ? 's' : ''} total
                        </p>
                    </div>
                </div>
                <Link
                    href="/seller/create"
                    className="flex items-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--hotpink)] px-6 py-3 font-display text-sm font-black uppercase text-white shadow-[4px_4px_0_0_var(--ink)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--ink)]"
                >
                    <Plus className="h-4 w-4" strokeWidth={3} /> New Listing
                </Link>
            </div>

            {/* Filters */}
            <div className="mb-6">
                <ProductFilters
                    status={status} setStatus={setStatus}
                    search={search} setSearch={setSearch}
                    sort={sort} setSort={setSort}
                    counts={counts}
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : displayed.length === 0 ? (
                <div className="grid gap-5">
                    <EmptyState status={status} />
                </div>
            ) : (
                <AnimatePresence mode="popLayout">
                    <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {displayed.map(listing => (
                            <ProductCard
                                key={listing.id}
                                listing={listing}
                                onDeleted={handleDeleted}
                                onEnded={handleEnded}
                            />
                        ))}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}
