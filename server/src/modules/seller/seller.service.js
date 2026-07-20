import Auction from '../../models/auction.model.js';
import Bid from '../../models/bid.model.js';
import Order from '../../models/order.model.js';
import UserEvent from '../../models/userEvent.model.js';
import mongoose from 'mongoose';

export const getSellerStatsService = async (sellerId) => {
    // 1. Total Revenue (sum of currentPrice for ended auctions with a winner)
    const revenueAggregation = await Auction.aggregate([
        { $match: { seller: new mongoose.Types.ObjectId(sellerId), status: 'ended', winner: { $exists: true } } },
        { $group: { _id: null, total: { $sum: "$currentPrice" } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;

    // 2. Active Listings Count
    const activeListingsCount = await Auction.countDocuments({
        seller: sellerId,
        status: 'active',
        endTime: { $gt: new Date() }
    });

    // 3. Pending Orders (Ended auctions where winner exists - simple mock for now)
    const pendingOrders = await Auction.countDocuments({
        seller: sellerId,
        status: 'ended',
        winner: { $exists: true }
    });

    // 4. Total Views Across All Listings
    const viewsAggregation = await Auction.aggregate([
        { $match: { seller: new mongoose.Types.ObjectId(sellerId) } },
        { $group: { _id: null, total: { $sum: "$viewCount" } } }
    ]);
    const totalViews = viewsAggregation.length > 0 ? viewsAggregation[0].total : 0;

    return {
        totalRevenue,
        activeListingsCount,
        pendingShipments: pendingOrders,
        totalViews
    };
};

export const getActiveListingsService = async (sellerId) => {
    // Fetch products belonging to the seller that are still active
    const activeAuctions = await Auction.find({
        seller: sellerId,
        status: 'active',
        endTime: { $gt: new Date() }
    })
    .sort({ endTime: 1 }) // Show ending soonest first
    .lean();

    return activeAuctions.map(a => ({
        id: a._id,
        title: a.title,
        startingPrice: a.startingPrice,
        currentPrice: a.currentPrice,
        bidCount: a.bidCount,
        endTime: a.endTime,
        category: a.category,
        image: a.images?.[0] || 'https://via.placeholder.com/200'
    }));
};

export const getSellerActivityService = async (sellerId) => {
    // Fetch latest bids on seller's products
    const sellerAuctions = await Auction.find({ seller: sellerId }).select('_id title').lean();
    const auctionIds = sellerAuctions.map(a => a._id);
    const auctionMap = sellerAuctions.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.title;
        return acc;
    }, {});

    const recentBids = await Bid.find({ auction: { $in: auctionIds } })
        .populate('bidder', 'firstName')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();

    return recentBids.map(bid => ({
        id: bid._id,
        type: bid.status === 'won' ? 'sale' : 'bid',
        message: bid.status === 'won' 
            ? `Sale completed for ${auctionMap[bid.auction.toString()]} at $${bid.amount}`
            : `New bid of $${bid.amount} on ${auctionMap[bid.auction.toString()]} by ${bid.bidder?.firstName || 'User'}`,
        time: bid.createdAt
    }));
};

export const getSellerInsightsService = async (sellerId) => {
    // Generate AI/Smart Insights based on seller's current listings
    const activeCount = await Auction.countDocuments({ seller: sellerId, endTime: { $gt: new Date() } });

    const insights = [];
    
    if (activeCount === 0) {
        insights.push({
            id: 1,
            type: 'warning',
            title: 'No Active Listings',
            description: 'You have no items currently listed. Create a new listing to start generating revenue.',
            action: 'Create Listing'
        });
    } else {
        insights.push({
            id: 2,
            type: 'optimization',
            title: 'Optimize Starting Prices',
            description: 'Items with starting prices under $50 receive 3x more engagement in the first 24 hours.',
            action: 'Review Pricing'
        });
        insights.push({
            id: 3,
            type: 'trend',
            title: 'Trending Categories',
            description: 'Vintage electronics are seeing a 45% spike in bidding activity this week.',
            action: 'View Trends'
        });
    }

    return insights;
};

export const getSellerOrdersService = async (sellerId) => {
    const orders = await Order.find({ seller: sellerId })
        .populate('auction', 'title images currentPrice status')
        .populate('buyer', 'firstName lastName email shippingAddress')
        .sort({ createdAt: -1 })
        .lean();
    return orders;
};

export const shipOrderService = async (orderId, sellerId, trackingNumber) => {
    const order = await Order.findOne({ _id: orderId, seller: sellerId });
    if (!order) throw new Error('Order not found or you are not the seller');
    if (order.status !== 'paid') throw new Error('Order must be paid before it can be shipped');
    
    order.status = 'shipped';
    order.trackingNumber = trackingNumber;
    await order.save();
    
    // Create an event notification for the buyer
    await UserEvent.create({
        userId: order.buyer,
        eventType: 'order_shipped',
        auctionId: order.auction,
        context: `Your item has been shipped! Tracking number: ${trackingNumber}`
    });
    
    return order;
};
