import express from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import {
    getBuyerStats,
    getMyBids,
    placeBid,
    getRecommendations,
    getRecentActivity,
    getAiPicks,
    toggleWatchlist,
    getWatchlist,
    getMyOrders,
    depositFunds,
    sandboxDepositSuccess,
    completeOrder,
    refundOrder
} from './buyer.controller.js';

const router = express.Router();

// All buyer routes protected by auth middleware
router.use(auth);

// Dashboard routes
router.get('/dashboard/stats', getBuyerStats);
router.get('/bids/:tab?', getMyBids);
router.post('/bids/place', placeBid);
router.get('/recommendations', getRecommendations);
router.get('/activity', getRecentActivity);
router.get('/ai-picks', getAiPicks);
router.get('/orders', getMyOrders);
router.post('/orders/:orderId/complete', completeOrder);
router.post('/orders/:orderId/refund', refundOrder);

// Wallet
router.post('/wallet/deposit', depositFunds);
router.post('/wallet/sandbox-deposit-success', sandboxDepositSuccess);

// Watchlist routes
router.get('/watchlist', getWatchlist);
router.post('/watchlist/toggle', toggleWatchlist);

export default router;
