import express from 'express';
import { getAuctionById, searchAuctions, processPayment, forfeitAuction } from './auction.controller.js';
import { auth } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/search', searchAuctions);
router.get('/:id', getAuctionById);

// Protected routes
router.post('/:id/pay', auth, processPayment);
router.post('/:id/forfeit', auth, forfeitAuction);

export default router;
