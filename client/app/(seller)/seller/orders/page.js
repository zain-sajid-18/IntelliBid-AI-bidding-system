"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Clock, CheckCircle2, Truck, AlertCircle, MapPin, User, DollarSign, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SellerOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [shipmentTrackings, setShipmentTrackings] = useState({}); // orderId -> trackingNumber
    const [shippingOrderId, setShippingOrderId] = useState(null); // tracking input visible for orderId
    const [shippingSubmitLoading, setShippingSubmitLoading] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api("/api/seller/orders");
            if (res.success) {
                setOrders(res.data || []);
            } else {
                setError("Failed to fetch orders");
            }
        } catch (err) {
            setError(err.message || "Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleShipOrder = async (orderId) => {
        const trackingNumber = shipmentTrackings[orderId];
        if (!trackingNumber || !trackingNumber.trim()) {
            alert("Please enter a valid tracking number");
            return;
        }
        setShippingSubmitLoading(true);
        try {
            const res = await api(`/api/seller/orders/${orderId}/ship`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackingNumber })
            });
            if (res.success) {
                alert("Order marked as shipped!");
                setShippingOrderId(null);
                fetchOrders();
            } else {
                alert("Failed to update shipping status");
            }
        } catch (err) {
            alert(err.message || "Failed to update shipping status");
        } finally {
            setShippingSubmitLoading(false);
        }
    };

    // Filter orders by tab
    const filteredOrders = orders.filter(order => {
        if (activeTab === "all") return true;
        if (activeTab === "pending") return order.status === "pending";
        if (activeTab === "paid") return order.status === "paid";
        if (activeTab === "shipped") return order.status === "shipped" || order.status === "completed";
        return true;
    });

    const getStatusStyles = (status) => {
        switch (status) {
            case "pending":
                return { label: "Awaiting Payment", bg: "var(--sunset)", text: "white" };
            case "paid":
                return { label: "Awaiting Shipment", bg: "var(--acid)", text: "var(--ink)" };
            case "shipped":
                return { label: "Shipped", bg: "var(--electric)", text: "white" };
            case "completed":
                return { label: "Completed", bg: "var(--acid)", text: "var(--ink)" };
            case "cancelled":
                return { label: "Cancelled", bg: "var(--hotpink)", text: "white" };
            default:
                return { label: status, bg: "var(--muted)", text: "var(--muted-foreground)" };
        }
    };

    const getCardColor = (index) => {
        const colors = ["var(--acid)", "var(--electric)", "var(--hotpink)", "var(--sunset)"];
        return colors[index % colors.length];
    };

    return (
        <div className="min-h-screen bg-[var(--background)] p-6 md:p-10 max-w-[1400px] mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-[4px] border-[var(--ink)] pb-8">
                <div>
                    <Link href="/seller/dashboard" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider mb-2 opacity-50 hover:opacity-100 hover:text-[var(--hotpink)] transition-all">
                        <ArrowLeft size={14} strokeWidth={3} /> Seller Hub
                    </Link>
                    <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                        Manage <span className="text-[var(--hotpink)] underline decoration-[6px] underline-offset-8">Sales</span>
                    </h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-3 border-b-[2px] border-[var(--ink)] pb-4">
                {[
                    { id: "all", label: "All Sales", icon: Package },
                    { id: "pending", label: "Awaiting Payment", icon: Clock },
                    { id: "paid", label: "Awaiting Shipment", icon: Truck },
                    { id: "shipped", label: "Shipped & Completed", icon: CheckCircle2 }
                ].map(tab => {
                    const Icon = tab.icon;
                    const count = tab.id === "all" ? orders.length : orders.filter(o => {
                        if (tab.id === "pending") return o.status === "pending";
                        if (tab.id === "paid") return o.status === "paid";
                        if (tab.id === "shipped") return o.status === "shipped" || o.status === "completed";
                    }).length;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 border-[3px] border-[var(--ink)] rounded-xl font-display font-black uppercase text-xs tracking-wider transition-all ${
                                activeTab === tab.id
                                    ? "bg-[var(--ink)] text-white shadow-[2px_2px_0_0_var(--hotpink)] translate-y-[2px]"
                                    : "bg-white text-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--ink)]"
                            }`}
                        >
                            <Icon size={14} strokeWidth={2.5} />
                            {tab.label}
                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black text-white bg-black/10">
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--electric)] text-black shadow-[4px_4px_0_0_var(--ink)] animate-pulse">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                </div>
            ) : error ? (
                <div className="brutal bg-white p-8 border-[3px] border-[var(--ink)] shadow-[6px_6px_0_0_var(--hotpink)] text-center rounded-2xl max-w-md mx-auto">
                    <AlertCircle size={40} className="mx-auto text-[var(--hotpink)] mb-4" />
                    <p className="font-bold text-[var(--ink)]">{error}</p>
                    <button onClick={fetchOrders} className="mt-4 px-4 py-2 bg-[var(--electric)] text-black border-[2px] border-[var(--ink)] font-bold uppercase text-xs rounded-xl shadow-[3px_3px_0_0_var(--ink)]">Retry</button>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="brutal bg-white p-12 text-center border-[3px] border-[var(--ink)] shadow-[6px_6px_0_0_var(--ink)] rounded-2xl">
                    <p className="font-display text-xl font-black uppercase text-[var(--ink)]">No sales record found in this section</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredOrders.map((order, index) => {
                        const statusStyle = getStatusStyles(order.status);
                        const buyer = order.buyer || {};
                        const auction = order.auction || {};
                        const cardColor = getCardColor(index);
                        const textColor = "var(--ink)"; // Use black text everywhere!
                        const mutedTextColor = "rgba(0,0,0,0.7)";
                        return (
                            <motion.div
                                key={order._id}
                                layout
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="brutal p-6 border-[3px] border-[var(--ink)] shadow-[6px_6px_0_0_var(--ink)] rounded-2xl flex flex-col lg:flex-row gap-6 justify-between"
                                style={{ background: cardColor, color: textColor }}
                            >
                                {/* Left Side: Product Details & Buyer */}
                                <div className="flex flex-col sm:flex-row gap-5 flex-1">
                                    <div className="w-24 h-24 border-[3px] border-[var(--ink)] rounded-xl overflow-hidden shrink-0 bg-white">
                                        <img src={auction.images?.[0] || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="font-display font-black text-xl uppercase leading-tight" style={{ color: textColor }}>{auction.title}</h3>
                                            <div className="flex flex-wrap gap-2 mt-2 items-center">
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border-[2px] border-[var(--ink)]"
                                                    style={{ background: 'white', color: 'var(--ink)' }}>
                                                    {statusStyle.label}
                                                </span>
                                                <span className="text-[10px] font-mono font-bold" style={{ color: mutedTextColor }}>Order ID: {order._id}</span>
                                            </div>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t text-xs" style={{ borderColor: 'rgba(0,0,0,0.3)' }}>
                                            <div className="space-y-1.5">
                                                <p className="font-black uppercase tracking-widest flex items-center gap-1" style={{ color: mutedTextColor }}><User size={12} /> Buyer Details</p>
                                                <p className="font-bold" style={{ color: textColor }}>{buyer.firstName} {buyer.lastName}</p>
                                                <p style={{ color: mutedTextColor }}>{buyer.email}</p>
                                            </div>

                                            {order.status !== 'pending' && (
                                                <div className="space-y-1.5">
                                                    <p className="font-black uppercase tracking-widest flex items-center gap-1" style={{ color: mutedTextColor }}><MapPin size={12} /> Shipping Address</p>
                                                    {order.shippingAddress || buyer.shippingAddress ? (
                                                        <p className="font-medium" style={{ color: mutedTextColor }}>
                                                            {order.shippingAddress?.street || buyer.shippingAddress?.street || ""},<br />
                                                            {order.shippingAddress?.city || buyer.shippingAddress?.city || ""}, {order.shippingAddress?.state || buyer.shippingAddress?.state || ""} {order.shippingAddress?.zip || buyer.shippingAddress?.zip || ""}, {order.shippingAddress?.country || buyer.shippingAddress?.country || ""}
                                                        </p>
                                                    ) : (
                                                        <p className="font-bold" style={{ color: 'var(--hotpink)' }}>Address not provided by buyer yet</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Financials & Action Buttons */}
                                <div className="lg:w-80 flex flex-col justify-between border-t-[3px] lg:border-t-0 lg:border-l-[3px] pt-4 lg:pt-0 lg:pl-6 space-y-4" style={{ borderColor: 'rgba(0,0,0,0.3)' }}>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: mutedTextColor }}>Final Price</p>
                                            <p className="font-display text-3xl font-black">
                                                <span className="bg-white text-[var(--ink)] px-2 py-0.5 rounded-lg">${order.amount?.toLocaleString()}</span>
                                            </p>
                                        </div>
                                        {order.platformFee > 0 && (
                                            <div className="text-right text-[10px] font-bold" style={{ color: mutedTextColor }}>
                                                <p>Platform Fee (5%): -${order.platformFee?.toFixed(2)}</p>
                                                <p className="font-black text-xs" style={{ color: textColor }}>Payout: ${order.sellerPayout?.toFixed(2)}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action logic */}
                                    {order.status === 'paid' && (
                                        <div className="space-y-3">
                                            {shippingOrderId === order._id ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter tracking number"
                                                        value={shipmentTrackings[order._id] || ""}
                                                        onChange={(e) => setShipmentTrackings({
                                                            ...shipmentTrackings,
                                                            [order._id]: e.target.value
                                                        })}
                                                        className="w-full px-3 py-2 border-[2px] border-[var(--ink)] font-bold text-xs rounded-lg bg-white text-[var(--ink)] focus:outline-none"
                                                        style={{ color: 'var(--ink)' }}
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleShipOrder(order._id)}
                                                            disabled={shippingSubmitLoading}
                                                            className="flex-1 py-2 bg-green-500 text-white font-black uppercase tracking-wider text-xs border-[2px] border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)] rounded-lg hover:translate-y-[-1px] transition-all disabled:opacity-50"
                                                        >
                                                            Confirm Shipping
                                                        </button>
                                                        <button
                                                            onClick={() => setShippingOrderId(null)}
                                                            className="px-3 py-2 bg-white text-[var(--ink)] font-bold uppercase tracking-wider text-xs border-[2px] border-[var(--ink)] rounded-lg"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setShippingOrderId(order._id)}
                                                    className="w-full py-3 bg-white text-[var(--ink)] font-black uppercase tracking-widest text-xs border-[3px] border-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] rounded-xl hover:translate-y-[-2px] hover:shadow-[5px_5px_0_0_var(--ink)] transition-all"
                                                >
                                                    Ship Package
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {order.status === 'pending' && (
                                        <div className="bg-white bg-opacity-20 border-[2px] border-[var(--ink)] p-3 rounded-lg flex items-center gap-2 text-xs font-bold text-left" style={{ color: textColor }}>
                                            <Clock size={16} /> Awaiting payment from the buyer. Item will remain reserved.
                                        </div>
                                    )}

                                    {(order.status === 'shipped' || order.status === 'completed') && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs font-bold bg-white bg-opacity-20 p-2.5 rounded-lg border border-[var(--ink)] text-left" style={{ color: textColor }}>
                                                <CheckCircle2 size={16} /> Shipped via Tracking
                                            </div>
                                            {order.trackingNumber && (
                                                <p className="text-[10px] font-mono font-bold bg-white px-2 py-1 rounded border border-[var(--ink)] text-left" style={{ color: 'var(--ink)' }}>
                                                    Track: <span style={{ color: 'var(--electric)' }}>{order.trackingNumber}</span>
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
