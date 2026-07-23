import express from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import {
    joinLiveRoom,
    leaveLiveRoom,
    placeLiveBid
} from './live-bidding.controller.js';

const router = express.Router();

router.route('/:auctionId/join').post(auth, joinLiveRoom);
router.route('/:auctionId/leave').post(auth, leaveLiveRoom);
router.route('/:auctionId/bid').post(auth, placeLiveBid);

export default router;
