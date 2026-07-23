import Auction from '../../models/auction.model.js';
import Bid from '../../models/bid.model.js';
import User from '../../models/user.model.js';

export const getAdminStatsService = async () => {
    // 1. Total Users
    const totalUsers = await User.countDocuments();

    // 2. Platform Revenue
    // Calculate total sum of won bids, then take a flat 5% platform fee
    const revenueAggregation = await Bid.aggregate([
        { $match: { status: 'won' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const grossVolume = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;
    const platformRevenue = grossVolume * 0.05; // 5% fee

    // 3. Active Auctions
    const activeAuctionsCount = await Auction.countDocuments({
        status: { $in: ['active', 'live'] },
        endTime: { $gt: new Date() }
    });

    // 4. Moderation Reports (Mock for now until Report model exists)
    const pendingReports = 0;

    return {
        totalUsers,
        platformRevenue,
        activeAuctionsCount,
        pendingReports
    };
};

export const getRecentUsersService = async () => {
    // Fetch latest users
    const users = await User.find()
        .select('firstName lastName email role isVerified createdAt')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

    return users.map(user => ({
        id: user._id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous User',
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        joinedAt: user.createdAt
    }));
};

export const getModerationQueueService = async () => {
    // Fetch products that might need review (e.g., extremely high starting prices)
    // This is a proxy for "flagged" items until a real reporting system is built
    const flaggedItems = await Auction.find({
        $or: [
            { startingPrice: { $gt: 10000 } } // Example threshold for manual review
        ]
    })
        .populate('seller', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    return flaggedItems.map(item => ({
        id: item._id,
        title: item.title,
        seller: `${item.seller?.firstName || ''} ${item.seller?.lastName || ''}`.trim() || item.seller?.email,
        reason: 'High Value / Automated Flag',
        status: 'pending_review',
        createdAt: item.createdAt
    }));
};

export const getSystemActivityService = async () => {
    // Audit log: Combine recent bids
    const recentBids = await Bid.find()
        .populate('auction', 'title')
        .populate('bidder', 'firstName')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    const activities = recentBids.map(bid => ({
        id: `bid_${bid._id}`,
        type: 'bid',
        message: `$${bid.amount} bid placed on ${bid.auction?.title || 'Unknown Item'} by ${bid.bidder?.firstName || 'User'}`,
        time: bid.createdAt
    }));

    // Sort combined activities
    return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);
};
