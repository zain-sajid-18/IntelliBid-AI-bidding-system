import express from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import {
    getSellerStats,
    getActiveListings,
    getSellerActivity,
    getSellerInsights,
    activateSeller,
    getSellerOrders,
    shipOrder
} from './seller.controller.js';
import {
    createListing,
    aiEnhanceListing,
    getMyListings,
    updateListing,
    deleteListing,
} from '../listing/listing.controller.js';
import { uploadAuctionImages } from '../../config/cloudinary.js';

const router = express.Router();

// Protect all seller routes with auth middleware
router.use(auth);

// Seller Dashboard endpoints
router.post('/activate', activateSeller);
router.get('/dashboard/stats', getSellerStats);
router.get('/listings/active', getActiveListings);
router.get('/activity/recent', getSellerActivity);
router.get('/insights/ai', getSellerInsights);
router.get('/orders', getSellerOrders);
router.post('/orders/:orderId/ship', shipOrder);

// Listing CRUD
router.post('/listings', uploadAuctionImages.array('images', 6), createListing);
router.post('/listings/ai-enhance', aiEnhanceListing);
router.get('/listings', getMyListings);
router.put('/listings/:id', updateListing);
router.delete('/listings/:id', deleteListing);

export default router;
