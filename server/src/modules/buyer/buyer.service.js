import Bid from '../../models/bid.model.js';
import User from '../../models/user.model.js';
import Auction from '../../models/auction.model.js';
import { trackEventService } from '../events/events.service.js';
import { broadcastBid } from '../../config/socket.js';
import mongoose from 'mongoose';
import Order from '../../models/order.model.js';
import UserEvent from '../../models/userEvent.model.js';

export const getBuyerStatsService = async (userId) => {
    const userIdObj = new mongoose.Types.ObjectId(userId);
    const now = new Date();

    // 1. Active Bids Count (Strictly: Bid is NOT 'won', Auction is 'active', and EndTime hasn't passed)
    const activeBidsAggregation = await Bid.aggregate([
        { 
            $match: { 
                bidder: userIdObj, 
                status: { $in: ['winning', 'outbid'] } 
            } 
        },
        {
            $lookup: {
                from: 'auctions',
                localField: 'auction',
                foreignField: '_id',
                as: 'auctionData'
            }
        },
        { $unwind: "$auctionData" },
        { 
            $match: { 
                "auctionData.status": "active",
                "auctionData.endTime": { $gt: now }
            } 
        },
        { $group: { _id: "$auctionData._id" } },
        { $count: "count" }
    ]);
    const activeBidsCount = activeBidsAggregation.length > 0 ? activeBidsAggregation[0].count : 0;

    // 2. Items Won Count (Unique auctions where user has won)
    const itemsWonAggregation = await Bid.aggregate([
        { $match: { bidder: userIdObj, status: 'won' } },
        { $group: { _id: "$auction" } },
        { $count: "count" }
    ]);
    const itemsWonCount = itemsWonAggregation.length > 0 ? itemsWonAggregation[0].count : 0;

    // 3. Total Spent
    const spentAggregation = await Bid.aggregate([
        { $match: { bidder: userIdObj, status: 'won' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalSpent = spentAggregation.length > 0 ? spentAggregation[0].total : 0;

    // 4. Lost / Outbid Count (Unique auctions where user was outbid AND auction has ended)
    const lostAggregation = await Bid.aggregate([
        { $match: { bidder: userIdObj, status: 'outbid' } },
        {
            $lookup: {
                from: 'auctions',
                localField: 'auction',
                foreignField: '_id',
                as: 'auctionData'
            }
        },
        { $unwind: "$auctionData" },
        {
            $match: {
                $or: [
                    { "auctionData.status": { $ne: "active" } },
                    { "auctionData.endTime": { $lte: now } }
                ]
            }
        },
        { $group: { _id: "$auctionData._id" } },
        { $count: "count" }
    ]);
    const lostCount = lostAggregation.length > 0 ? lostAggregation[0].count : 0;

    // 5. Saved Items Count
    const user = await User.findById(userId).select('watchlist walletBalance');
    const savedItemsCount = user?.watchlist?.length || 0;
    const walletBalance = user?.walletBalance ?? 0;

    return {
        activeBids: activeBidsCount,
        itemsWon: itemsWonCount,
        lost: lostCount,
        totalSpent: totalSpent,
        savedItems: savedItemsCount,
        walletBalance,
    };
};

export const getMyBidsService = async (userId, tab = 'active', page = 1, limit = 12) => {
    const skip = (page - 1) * limit;
    const userIdObj = new mongoose.Types.ObjectId(userId);

    let matchQuery = { bidder: userIdObj };

    if (tab === 'active') {
        matchQuery.status = { $in: ['winning', 'outbid'] };
    } else if (tab === 'won') {
        matchQuery.status = 'won';
    } else if (tab === 'lost') {
        matchQuery.status = 'outbid';
    }

    // Use aggregation to group by auction and get the latest bid for each
    const aggregationPipeline = [
        { $match: matchQuery },
        { $sort: { updatedAt: -1 } },
        { 
            $group: { 
                _id: "$auction", 
                latestBid: { $first: "$$ROOT" } 
            } 
        },
        { $replaceRoot: { newRoot: "$latestBid" } },
        {
            $lookup: {
                from: 'auctions',
                localField: 'auction',
                foreignField: '_id',
                as: 'auction'
            }
        },
        { $unwind: "$auction" },
        // Filter based on auction status and time
        {
            $match: tab === 'active' 
                ? { 
                    "auction.status": "active",
                    "auction.endTime": { $gt: new Date() }
                  } 
                : tab === 'lost' 
                ? { 
                    $or: [
                        { "auction.status": { $ne: "active" } },
                        { "auction.endTime": { $lte: new Date() } }
                    ]
                  }
                : {}
        },
        { $sort: { updatedAt: -1 } },
        {
            $lookup: {
                from: 'orders',
                let: { auctionId: '$auction._id', buyerId: '$bidder' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$auction', '$$auctionId'] },
                                    { $eq: ['$buyer', '$$buyerId'] }
                                ]
                            }
                        }
                    }
                ],
                as: 'order'
            }
        }
    ];

    // Execute count for pagination
    const totalCountResult = await Bid.aggregate([
        ...aggregationPipeline.slice(0, 7), // Up to the auction status filter
        { $count: "count" }
    ]);
    const total = totalCountResult.length > 0 ? totalCountResult[0].count : 0;

    // Execute paginated results
    const bids = await Bid.aggregate([
        ...aggregationPipeline,
        { $skip: skip },
        { $limit: Number(limit) }
    ]);

    const formattedBids = bids.map(b => ({
        _id: b._id,
        id: b._id,
        amount: b.amount,
        status: b.status,
        updatedAt: b.updatedAt,
        order: b.order && b.order[0] ? {
            _id: b.order[0]._id,
            status: b.order[0].status,
            trackingNumber: b.order[0].trackingNumber,
            expiresAt: b.order[0].expiresAt
        } : null,
        auction: {
            _id: b.auction._id,
            id: b.auction._id,
            title: b.auction.title,
            images: b.auction.images,
            endTime: b.auction.endTime,
            currentPrice: b.auction.currentPrice,
            status: b.auction.status,
            bidCount: b.auction.bidCount
        }
    }));

    return {
        bids: formattedBids,
        total,
        page: Number(page),
        hasMore: skip + bids.length < total
    };
};

export const placeBidService = async (userId, auctionId, bidAmount) => {
    // Basic checks first
    const auctionCheck = await Auction.findById(auctionId);
    if (!auctionCheck) throw new Error('Auction not found');
    if (auctionCheck.status !== 'active') throw new Error('Auction is not active');
    if (new Date(auctionCheck.endTime) < new Date()) throw new Error('Auction has ended');
    if (auctionCheck.seller.toString() === userId.toString()) throw new Error('You cannot bid on your own auction');
    if (bidAmount <= auctionCheck.currentPrice) throw new Error(`Bid must be greater than current price of $${auctionCheck.currentPrice.toLocaleString()}`);

    // Check if user is already highest bidder
    const highestBid = await Bid.findOne({ auction: auctionId, status: 'winning' });
    if (highestBid && highestBid.bidder.toString() === userId.toString()) {
        throw new Error('You are already the highest bidder');
    }

    const outbidUserId = highestBid ? highestBid.bidder.toString() : null;

    // Concurrency-safe atomic update
    const updatedAuction = await Auction.findOneAndUpdate(
        { _id: auctionId, currentPrice: { $lt: bidAmount }, status: 'active' },
        { $set: { currentPrice: bidAmount }, $inc: { bidCount: 1, bidVersion: 1 } },
        { new: true }
    );

    if (!updatedAuction) {
        throw new Error('Your bid was just beaten by someone else! Please refresh and try a higher amount.');
    }

    // Mark old winning bids as outbid
    await Bid.updateMany(
        { auction: auctionId, status: 'winning' },
        { $set: { status: 'outbid' } }
    );

    // Create new bid
    const newBid = await Bid.create({
        auction: auctionId,
        bidder: userId,
        amount: bidAmount,
        status: 'winning'
    });

    const user = await User.findById(userId).select('firstName lastName');
    const bidderName = `${user.firstName} ${user.lastName}`;

    // Broadcast
    broadcastBid({
        auctionId,
        newPrice: bidAmount,
        bidCount: updatedAuction.bidCount,
        bidderId: userId,
        bidderName,
        outbidUserId
    });

    // Fire tracking event
    trackEventService(userId, {
        auctionId,
        eventType: 'bid_placed',
        metadata: { bidAmount }
    }).catch(err => console.error('Failed to track bid event', err));

    return { bid: newBid, newCurrentPrice: bidAmount };
};

export const getRecommendationsService = async (userId) => {
    const userBids = await Bid.find({ bidder: userId }).select('auction');
    const biddedAuctionIds = userBids.map(b => b.auction);

    const recommendations = await Auction.find({
        _id: { $nin: biddedAuctionIds },
        status: 'active',
        endTime: { $gt: new Date() }
    })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();

    return recommendations.map(auction => ({
        id: auction._id,
        title: auction.title,
        startingPrice: auction.startingPrice,
        currentPrice: auction.currentPrice,
        image: auction.images && auction.images.length > 0 ? auction.images[0] : 'https://via.placeholder.com/300'
    }));
};

export const getRecentActivityService = async (userId) => {
    const recentBids = await Bid.find({ bidder: userId })
        .populate('auction', 'title images')
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean();

    return recentBids.map(bid => {
        let message = '';
        if (bid.status === 'winning') message = `You placed a winning bid on ${bid.auction?.title}`;
        else if (bid.status === 'outbid') message = `You were outbid on ${bid.auction?.title}`;
        else if (bid.status === 'won') message = `You won ${bid.auction?.title}`;

        return {
            id: bid._id,
            type: bid.status,
            message,
            time: bid.updatedAt
        };
    });
};

export const toggleWatchlistService = async (userId, auctionId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const index = user.watchlist.indexOf(auctionId);
    let added = false;

    if (index === -1) {
        user.watchlist.push(auctionId);
        added = true;
        trackEventService(userId, {
            auctionId,
            eventType: 'watchlist_add'
        }).catch(() => { });
    } else {
        user.watchlist.splice(index, 1);
        trackEventService(userId, {
            auctionId,
            eventType: 'watchlist_remove'
        }).catch(() => { });
    }

    await user.save();
    return { added };
};

export const getWatchlistService = async (userId) => {
    const user = await User.findById(userId).populate({
        path: 'watchlist',
        select: 'title images currentPrice startingPrice status endTime bidCount',
        match: { status: 'active' }
    });
    if (!user) throw new Error('User not found');
    return user.watchlist.filter(item => item !== null);
};

export const getMyOrdersService = async (userId) => {
    const userIdObj = new mongoose.Types.ObjectId(userId);
    
    // Group by auction to ensure unique entries per product
    const orders = await Order.aggregate([
        { $match: { buyer: userIdObj } },
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: "$auction",
                latestOrder: { $first: "$$ROOT" }
            }
        },
        { $replaceRoot: { newRoot: "$latestOrder" } },
        {
            $lookup: {
                from: 'auctions',
                localField: 'auction',
                foreignField: '_id',
                as: 'auction'
            }
        },
        { $unwind: "$auction" },
        {
            $lookup: {
                from: 'users',
                localField: 'seller',
                foreignField: '_id',
                as: 'seller'
            }
        },
        { $unwind: "$seller" },
        { $sort: { createdAt: -1 } }
    ]);
    return orders;
};

export const completeOrderService = async (orderId, buyerId) => {
    const order = await Order.findOne({ _id: orderId, buyer: buyerId });
    if (!order) throw new Error('Order not found or you are not the buyer');
    if (order.status !== 'shipped') throw new Error('Order must be shipped before it can be completed');
    
    order.status = 'completed';
    await order.save();
    
    // Pay seller from escrow
    await User.findByIdAndUpdate(order.seller, {
        $inc: { walletBalance: order.sellerPayout }
    });
    
    // Create user event for seller notification
    await UserEvent.create({
        userId: order.seller,
        eventType: 'order_completed',
        auctionId: order.auction,
        context: `The buyer has marked the item as received. $${order.sellerPayout} has been credited to your wallet!`
    });
    
    return order;
};

export const refundOrderService = async (orderId, buyerId, reason) => {
    const order = await Order.findOne({ _id: orderId, buyer: buyerId });
    if (!order) throw new Error('Order not found or you are not the buyer');
    if (order.status !== 'shipped') throw new Error('Refunds are only available for shipped orders');
    
    order.status = 'refunded';
    await order.save();
    
    // Refund buyer (full amount, minus platform fee? Or full? Let's do full amount for now)
    await User.findByIdAndUpdate(buyerId, {
        $inc: { walletBalance: order.amount }
    });
    
    // Create user events for both buyer and seller
    await UserEvent.create({
        userId: buyerId,
        eventType: 'order_refunded',
        auctionId: order.auction,
        context: `Your order has been refunded $${order.amount} for reason: ${reason}`
    });
    
    await UserEvent.create({
        userId: order.seller,
        eventType: 'order_refunded',
        auctionId: order.auction,
        context: `The order has been refunded to the buyer for reason: ${reason}`
    });
    
    return order;
};
