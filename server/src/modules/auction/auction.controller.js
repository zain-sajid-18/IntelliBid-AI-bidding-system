import mongoose from 'mongoose';
import { asyncHandler } from '../../utils/asyncHandler.js';
import Auction from '../../models/auction.model.js';
import Bid from '../../models/bid.model.js';
import User from '../../models/user.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.0-flash-lite';

export const getAuctionById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    let auction = await Auction.findById(id)
        .populate('seller', 'firstName lastName avatar rating totalRatings createdAt')
        .lean();

    if (!auction) {
        return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    // Auto-promote scheduled live auction to 'live' if start time has arrived
    if (auction.type === 'live' && auction.status === 'scheduled' && auction.scheduledStartTime && new Date(auction.scheduledStartTime) <= new Date()) {
        await Auction.findByIdAndUpdate(id, { status: 'live' });
        auction.status = 'live';
    }

    // Fetch bid history (last 10 bids)
    const bidHistory = await Bid.find({ auction: id })
        .populate('bidder', 'firstName lastName avatar')
        .sort({ amount: -1 }) // Highest first
        .limit(10)
        .lean();

    // Map bid history to remove sensitive info
    const safeBidHistory = bidHistory.map(bid => ({
        id: bid._id,
        amount: bid.amount,
        time: bid.createdAt,
        bidderName: `${bid.bidder.firstName} ${bid.bidder.lastName.charAt(0)}.`,
        bidderAvatar: bid.bidder.avatar
    }));

    res.status(200).json({
        success: true,
        data: {
            ...auction,
            bidHistory: safeBidHistory
        }
    });
});

export const searchAuctions = asyncHandler(async (req, res) => {
    const { q, category, sort } = req.query;

    let filter = { status: { $in: ['active', 'scheduled', 'live'] }, endTime: { $gt: new Date() } };

    if (category && category !== 'All') {
        filter.category = category;
    }

    let sortQuery = { createdAt: -1 };
    if (sort === 'ending') sortQuery = { endTime: 1 };
    else if (sort === 'popular') sortQuery = { viewCount: -1 };
    else if (sort === 'price_asc') sortQuery = { currentPrice: 1 };
    else if (sort === 'price_desc') sortQuery = { currentPrice: -1 };

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 1: DATABASE SEARCH USING TEXT INDEX (FAST!)
    // If query exists, use MongoDB text search which leverages our existing index
    // ─────────────────────────────────────────────────────────────────────────
    let results = [];
    if (q && q.trim()) {
        // Use MongoDB text search for fast, indexed results
        filter.$text = { $search: q.trim() };
        results = await Auction.find(filter, { score: { $meta: "textScore" } })
            .sort({ score: { $meta: "textScore" }, ...sortQuery })
            .limit(30)
            .lean();
    } else {
        // No query: just use standard sort
        results = await Auction.find(filter)
            .sort(sortQuery)
            .limit(30)
            .lean();
    }

    // Return top 12 results
    const topResults = results.slice(0, 12);

    res.status(200).json({
        success: true,
        data: topResults
    });
});

export const processPayment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const auction = await Auction.findById(id);

    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
    if (auction.status !== 'ended') return res.status(400).json({ success: false, message: 'Auction is not ended' });
    if (auction.winner?.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'You are not the winner' });

    // Mark as paid (add simple field or update status)
    // We could create an order, but for simplicity we just acknowledge it
    res.status(200).json({ success: true, message: 'Payment processed successfully' });
});

export const forfeitAuction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const auction = await Auction.findById(id);

    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
    if (auction.winner?.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'You are not the winner' });

    // Block the current winner's account
    const user = await User.findById(req.user._id);
    if (user) {
        user.isBlocked = true;
        await user.save();
    }

    // Find the next highest bidder
    const highestBids = await Bid.find({ auction: id }).sort({ amount: -1 }).limit(2);
    if (highestBids.length > 1) {
        const nextBid = highestBids[1];
        auction.winner = nextBid.bidder;
        await auction.save();

        nextBid.status = 'winning';
        await nextBid.save();
    } else {
        auction.winner = null; // No second bidder
        await auction.save();
    }

    res.status(200).json({ success: true, message: 'Auction forfeited and account blocked' });
});
