import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import {
    joinLiveRoomService,
    leaveLiveRoomService,
    placeLiveBidService
} from './live-bidding.service.js';

// Join live bidding room
export const joinLiveRoom = asyncHandler(async (req, res, next) => {
    const { auctionId } = req.params;
    const userId = req.user.id;

    const auction = await joinLiveRoomService(auctionId, userId);

    res.status(200).json({
        success: true,
        message: 'Joined live room successfully',
        data: auction
    });
});

// Leave live bidding room
export const leaveLiveRoom = asyncHandler(async (req, res, next) => {
    const { auctionId } = req.params;
    const userId = req.user.id;

    const auction = await leaveLiveRoomService(auctionId, userId);

    res.status(200).json({
        success: true,
        message: 'Left live room successfully',
        data: auction
    });
});

// Place live bid
export const placeLiveBid = asyncHandler(async (req, res, next) => {
    const { auctionId } = req.params;
    const { amount } = req.body;
    const userId = req.user.id;

    const bid = await placeLiveBidService(auctionId, userId, amount);

    res.status(200).json({
        success: true,
        message: 'Bid placed successfully',
        data: bid
    });
});
