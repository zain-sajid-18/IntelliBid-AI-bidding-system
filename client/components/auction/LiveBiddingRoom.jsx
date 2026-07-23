"use client";

import { useState, useEffect } from "react";
import { useAuctionStore } from "@/store/auctionStore";
import { useAuthStore } from "@/store/authStore";
import { useMessagesStore } from "@/store/messagesStore";
import { api } from "@/lib/api";
import { Gavel, Clock, Users, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function LiveBiddingRoom() {
    const { auction, joinAuctionRoom, leaveAuctionRoom } = useAuctionStore();
    const { user } = useAuthStore();
    const { socket } = useMessagesStore();
    const [isJoined, setIsJoined] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");
    const [bidInput, setBidInput] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loadingJoin, setLoadingJoin] = useState(false);
    const [loadingConfirm, setLoadingConfirm] = useState(false);
    const [loadingReject, setLoadingReject] = useState(false);

    const minBid = (auction?.currentPrice || auction?.startingPrice || 0) + 1;

    useEffect(() => {
        if (auction?._id) {
            joinAuctionRoom(auction._id);
        }

        return () => {
            if (auction?._id) leaveAuctionRoom(auction._id);
        };
    }, [auction?._id, joinAuctionRoom, leaveAuctionRoom]);

    const handleConfirmSale = async () => {
        setLoadingConfirm(true);
        setError(null);
        try {
            const res = await api(`/api/seller/listings/${auction._id}/confirm-sale`, { method: "POST" });
            if (res.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
                setTimeout(() => window.location.reload(), 1000);
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingConfirm(false);
        }
    };

    const handleRejectSale = async () => {
        setLoadingReject(true);
        setError(null);
        try {
            const res = await api(`/api/seller/listings/${auction._id}/reject-sale`, { method: "POST" });
            if (res.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
                setTimeout(() => window.location.reload(), 1000);
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingReject(false);
        }
    };

    useEffect(() => {
        if (socket) {
            socket.on("live:participantJoined", (data) => {
                if (data.userId === user?.id) setIsJoined(true);
            });
            socket.on("live:participantLeft", (data) => {
                if (data.userId === user?.id) setIsJoined(false);
            });
            socket.on("live:newBid", (data) => {
                if (data.auctionId === auction?._id) {
                    setSuccess(true);
                    setTimeout(() => setSuccess(false), 3000);
                }
            });
            socket.on("live:roomStarted", () => {
                // handle room started
            });
            socket.on("live:roomEnded", () => {
                // handle room ended
            });

            return () => {
                socket.off("live:participantJoined");
                socket.off("live:participantLeft");
                socket.off("live:newBid");
                socket.off("live:roomStarted");
                socket.off("live:roomEnded");
            };
        }
    }, [socket, auction?._id, user?.id]);

    useEffect(() => {
        if (auction?.endTime) {
            const calculateTimeLeft = () => {
                const diff = new Date(auction.endTime).getTime() - Date.now();
                if (diff <= 0) return "Ended";
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);
                return `${m}m ${s}s left`;
            };
            setTimeLeft(calculateTimeLeft());
            const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
            return () => clearInterval(timer);
        }
    }, [auction?.endTime]);

    useEffect(() => {
        if (!bidInput || Number(bidInput) < minBid) {
            setBidInput(minBid.toString());
        }
    }, [minBid]);

    const handleJoinRoom = async () => {
        setLoadingJoin(true);
        setError(null);
        try {
            const res = await api(`/api/live-bidding/${auction._id}/join`, { method: "POST" });
            if (res.success) {
                setIsJoined(true);
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingJoin(false);
        }
    };

    const handleLeaveRoom = async () => {
        setError(null);
        try {
            const res = await api(`/api/live-bidding/${auction._id}/leave`, { method: "POST" });
            if (res.success) {
                setIsJoined(false);
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleBid = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!user) {
            setError("Please sign in to bid");
            return;
        }

        if (!isJoined) {
            setError("Please join the room first");
            return;
        }

        const amount = Number(bidInput);
        if (isNaN(amount) || amount < minBid) {
            setError(`Bid must be at least $${minBid.toLocaleString()}`);
            return;
        }

        try {
            const res = await api(`/api/live-bidding/${auction._id}/bid`, {
                method: "POST",
                body: JSON.stringify({ amount }),
            });

            if (res.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
                setBidInput((amount + 1).toString());
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    // Check if user is owner: auction.seller could be string (id) or object (with _id)
    const auctionSellerId = typeof auction?.seller === 'string' ? auction.seller : auction?.seller?._id;
    const currentUserId = user?.id || user?._id;
    const isOwner = Boolean(currentUserId && auctionSellerId && currentUserId.toString() === auctionSellerId.toString());

    const hasStartArrived = auction?.scheduledStartTime ? new Date(auction.scheduledStartTime) <= new Date() : true;
    const isActive = auction?.status === "live" || (auction?.status === "scheduled" && hasStartArrived);
    const isScheduled = auction?.status === "scheduled" && !hasStartArrived;
    const isAwaitingConfirmation = auction?.status === "awaiting_seller_confirmation";
    const isSaleConfirmed = auction?.status === "sale_confirmed";
    const isSaleRejected = auction?.status === "sale_rejected";
    const participantCount = auction?.participants?.length || 0;
    const maxParticipants = auction?.maxParticipants || 5;
    const isFull = participantCount >= maxParticipants;

    return (
        <div className="brutal bg-[var(--electric)] text-black p-6 md:p-8 flex flex-col items-center text-center">
            <h3 className="font-display text-sm font-black uppercase tracking-widest opacity-70 mb-2">
                Live Bidding Room
            </h3>

            {/* Live Price Ticker */}
            <div className="relative font-display text-5xl md:text-6xl font-black drop-shadow-[4px_4px_0_var(--ink)] mb-1 tabular-nums">
                ${Number(auction?.currentPrice || auction?.startingPrice || 0).toLocaleString()}
                <span className="absolute -top-2 -right-6 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
            </div>

            <p className="text-sm font-bold opacity-80 mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" /> {participantCount}/{maxParticipants} Active
            </p>

            <p className="text-sm font-bold opacity-80 mb-6 flex items-center gap-2">
                <Clock className="h-4 w-4" /> {timeLeft}
            </p>

            {/* Status Alerts */}
            {isSaleConfirmed && (
                <div className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-green-500 py-3 px-4 font-display text-sm font-black uppercase text-white shadow-[4px_4px_0_0_var(--ink)]">
                    Sale confirmed!
                </div>
            )}
            {isSaleRejected && (
                <div className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-red-500 py-3 px-4 font-display text-sm font-black uppercase text-white shadow-[4px_4px_0_0_var(--ink)]">
                    Sale rejected.
                </div>
            )}
            {!isActive && !isScheduled && !isAwaitingConfirmation && !isSaleConfirmed && !isSaleRejected && (
                <div className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--acid)] py-3 px-4 font-display text-sm font-black uppercase text-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)]">
                    This live auction has ended.
                </div>
            )}

            {isScheduled && (
                <div className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--acid)] py-3 px-4 font-display text-sm font-black uppercase text-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)]">
                    This auction is scheduled to start soon.
                </div>
            )}

            {isAwaitingConfirmation && isOwner && (
                <div className="w-full space-y-3">
                    <div className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--acid)] py-3 px-4 font-display text-sm font-black uppercase text-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)]">
                        Auction ended! Please confirm or reject the sale.
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleConfirmSale}
                            disabled={loadingConfirm}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-green-500 py-3 font-display text-sm font-black uppercase text-white shadow-[4px_4px_0_0_var(--ink)] transition-all hover:-translate-y-1 disabled:opacity-50"
                        >
                            {loadingConfirm ? <Loader2 className="animate-spin h-4 w-4" /> : "Confirm Sale"}
                        </button>
                        <button
                            onClick={handleRejectSale}
                            disabled={loadingReject}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-red-500 py-3 font-display text-sm font-black uppercase text-white shadow-[4px_4px_0_0_var(--ink)] transition-all hover:-translate-y-1 disabled:opacity-50"
                        >
                            {loadingReject ? <Loader2 className="animate-spin h-4 w-4" /> : "Reject Sale"}
                        </button>
                    </div>
                </div>
            )}

            {isOwner && isActive && (
                <div className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--acid)] py-3 px-4 font-display text-sm font-black uppercase text-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)]">
                    You are the seller of this item.
                </div>
            )}

            {error && (
                <div className="w-full flex items-center justify-center gap-1.5 text-xs font-black uppercase bg-[var(--hotpink)] text-white py-1.5 px-3 rounded-lg border-[2px] border-[var(--ink)]">
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            {success && (
                <div className="w-full flex items-center justify-center gap-1.5 text-xs font-black uppercase bg-[var(--acid)] text-[var(--ink)] py-1.5 px-3 rounded-lg border-[2px] border-[var(--ink)]">
                    <CheckCircle2 size={14} /> Bid placed successfully!
                </div>
            )}

            {/* Join/Leave Room Buttons */}
            {isActive && !isOwner && (
                <div className="w-full flex flex-col gap-3">
                    {!isJoined && (
                        <button
                            onClick={handleJoinRoom}
                            disabled={loadingJoin || isFull}
                            className="w-full flex items-center justify-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--acid)] py-4 font-display text-lg font-black uppercase text-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--ink)] disabled:opacity-50"
                        >
                            {loadingJoin ? <Loader2 className="animate-spin h-6 w-6" /> : <Users className="h-6 w-6" />}
                            {isFull ? "Room Full" : "Join Room"}
                        </button>
                    )}

                    {isJoined && (
                        <>
                            <button
                                onClick={handleLeaveRoom}
                                className="w-full flex items-center justify-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-white text-[var(--ink)] py-2 font-display text-sm font-black uppercase shadow-[2px_2px_0_0_var(--ink)] transition-all hover:-translate-y-0.5"
                            >
                                Leave Room
                            </button>
                            <form onSubmit={handleBid} className="w-full max-w-sm flex flex-col gap-3">
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 font-display text-xl font-black text-[var(--ink)]">$</span>
                                    <input
                                        type="number"
                                        min={minBid}
                                        step="1"
                                        value={bidInput}
                                        onChange={(e) => {
                                            setBidInput(e.target.value);
                                            setError(null);
                                        }}
                                        className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-white pl-10 pr-4 py-4 font-display text-2xl font-black text-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] focus:outline-none focus:shadow-[6px_6px_0_0_var(--acid)] transition-all"
                                        placeholder="Enter amount"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--acid)] py-4 font-display text-lg font-black uppercase text-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--ink)]"
                                >
                                    <Gavel className="h-6 w-6" strokeWidth={3} />
                                    Place Bid
                                </button>
                                <p className="text-xs font-bold opacity-60">
                                    Minimum next bid: ${minBid.toLocaleString()}
                                </p>
                            </form>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
