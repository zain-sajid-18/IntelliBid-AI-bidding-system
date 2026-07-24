import { asyncHandler } from '../../utils/asyncHandler.js';
import User from '../../models/user.model.js';
import {
    getBuyerStatsService,
    getMyBidsService,
    placeBidService,
    getRecommendationsService,
    getRecentActivityService,
    toggleWatchlistService,
    getWatchlistService,
    completeOrderService,
    refundOrderService
} from './buyer.service.js';

export const getBuyerStats = asyncHandler(async (req, res) => {
    const stats = await getBuyerStatsService(req.user.id);
    res.status(200).json({ success: true, data: stats });
});

export const getMyBids = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const tab = req.params.tab || req.query.tab || 'active';
    const result = await getMyBidsService(req.user.id, tab, page, limit);
    res.status(200).json({ success: true, ...result });
});

export const placeBid = asyncHandler(async (req, res) => {
    const { auctionId, bidAmount } = req.body;
    if (!auctionId || !bidAmount) return res.status(400).json({ success: false, message: 'auctionId and bidAmount are required' });
    const result = await placeBidService(req.user.id, auctionId, Number(bidAmount));
    res.status(201).json({ success: true, ...result });
});

export const getRecommendations = asyncHandler(async (req, res) => {
    const recommendations = await getRecommendationsService(req.user.id);
    res.status(200).json({ success: true, data: recommendations });
});

export const getRecentActivity = asyncHandler(async (req, res) => {
    const activity = await getRecentActivityService(req.user.id);
    res.status(200).json({ success: true, data: activity });
});

export const getAiPicks = asyncHandler(async (req, res) => {
    const { getAiPicksService } = await import('./aiPicks.service.js');
    const refresh = req.query.refresh === 'true';
    const result = await getAiPicksService(req.user.id, refresh);
    res.status(200).json({ 
        success: true, 
        data: result.picks, 
        remainingRefreshes: result.remainingRefreshes 
    });
});

export const toggleWatchlist = asyncHandler(async (req, res) => {
    const { auctionId } = req.body;
    if (!auctionId) return res.status(400).json({ success: false, message: 'auctionId is required' });
    const result = await toggleWatchlistService(req.user.id, auctionId);
    res.status(200).json({ success: true, ...result });
});

export const getWatchlist = asyncHandler(async (req, res) => {
    const watchlist = await getWatchlistService(req.user.id);
    res.status(200).json({ success: true, data: watchlist });
});

export const depositFunds = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount < 5) return res.status(400).json({ success: false, message: 'Minimum deposit is $5' });

    // Fallback: If Stripe is not configured, redirect to sandbox deposit page!
    const isStripeConfigured = process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder');
    if (!isStripeConfigured) {
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        return res.status(200).json({
            success: true,
            url: `${clientUrl}/order/sandbox-deposit?amount=${amount}`,
            isSandbox: true
        });
    }

    try {
        const stripeModule = await import('stripe');
        const Stripe = stripeModule.default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: 'IntelliBid Wallet Deposit', description: `Deposit funds into your wallet.` },
                    unit_amount: Math.round(amount * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard?deposit=success`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard?deposit=cancelled`,
            client_reference_id: `deposit:${req.user.id}`,
        });
        res.status(200).json({ success: true, url: session.url });
    } catch (err) {
        console.warn('Stripe checkout session creation failed for deposit. Falling back to sandbox:', err.message);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.status(200).json({
            success: true,
            url: `${clientUrl}/order/sandbox-deposit?amount=${amount}`,
            isSandbox: true
        });
    }
});

export const sandboxDepositSuccess = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid deposit amount' });
    }

    // Increment wallet balance and return the updated balance
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $inc: { walletBalance: Number(amount) } },
        { new: true }
    ).select('walletBalance');

    console.log(`[Sandbox] Deposit success: Credited $${amount} to User ${userId}. New balance: $${updatedUser?.walletBalance}`);
    res.status(200).json({ 
        success: true, 
        message: 'Sandbox deposit processed successfully',
        newBalance: updatedUser?.walletBalance ?? 0
    });
});

export const getMyOrders = asyncHandler(async (req, res) => {
    const { getMyOrdersService } = await import('./buyer.service.js');
    const orders = await getMyOrdersService(req.user.id);
    res.status(200).json({ success: true, data: orders });
});

export const completeOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const order = await completeOrderService(orderId, req.user.id);
    res.status(200).json({ success: true, message: 'Order marked as completed', data: order });
});

export const refundOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: 'Refund reason is required' });
    const order = await refundOrderService(orderId, req.user.id, reason);
    res.status(200).json({ success: true, message: 'Order refunded successfully', data: order });
});
