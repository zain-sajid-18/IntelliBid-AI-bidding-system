import Auction from '../../models/auction.model.js';
import UserProfile from '../../models/userProfile.model.js';
import UserEvent from '../../models/userEvent.model.js';
import { scoreAuctionForUser, softShuffle } from './feed.scorer.js';

const FEED_SIZE = 20;
const CANDIDATES_MULTIPLIER = 4;
const PERSONALIZED_RATIO = 0.65;
const URGENCY_RATIO = 0.20;
const FRESH_RATIO = 0.15;

const COLD_START_THRESHOLD = 5;

const deduplicate = (items) => {
    const seen = new Set();
    return items.filter(item => {
        const id = item._id.toString();
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    });
};

export const getFeedService = async (userId, { page = 1, category, minPrice, maxPrice } = {}) => {
    const offset = (page - 1) * FEED_SIZE;

    // Build query filter
    const filter = { status: 'active', endTime: { $gt: new Date() } };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
        filter.currentPrice = {};
        if (minPrice) filter.currentPrice.$gte = Number(minPrice);
        if (maxPrice) filter.currentPrice.$lte = Number(maxPrice);
    }

    const totalActive = await Auction.countDocuments(filter);

    // Load user profile
    const userProfile = await UserProfile.findOne({ userId }).lean();
    const isColdStart = !userProfile || userProfile.interactionCount < COLD_START_THRESHOLD;

    if (isColdStart) {
        return getColdStartFeed(FEED_SIZE, offset, { category, minPrice, maxPrice }, totalActive);
    }

    // Get auction IDs user already bid on — exclude from feed
    const biddedEvents = await UserEvent.distinct('auctionId', {
        userId,
        eventType: 'bid_placed',
        auctionId: { $ne: null },
    });
    const excludedIds = new Set(biddedEvents.map(id => id.toString()));

    // Fetch candidates with offset to allow infinite scroll
    const candidates = await Auction.find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(FEED_SIZE * CANDIDATES_MULTIPLIER)
        .lean();

    // Score candidates
    const scored = candidates
        .map(auction => ({ ...auction, feedScore: scoreAuctionForUser(auction, userProfile, excludedIds) }))
        .filter(a => a.feedScore >= 0)
        .sort((a, b) => b.feedScore - a.feedScore);

    // Assemble feed slots
    const nPersonal = Math.floor(FEED_SIZE * PERSONALIZED_RATIO);
    const nUrgent   = Math.floor(FEED_SIZE * URGENCY_RATIO);
    const nFresh    = FEED_SIZE - nPersonal - nUrgent;

    const personalized = scored.slice(0, nPersonal);

    // Fetch urgent and fresh with offset
    const urgentItems = await Auction.find({
        ...filter,
        endTime: { $gt: new Date(), $lt: new Date(Date.now() + 6 * 3600000) },
    }).skip(Math.floor(offset * URGENCY_RATIO)).limit(nUrgent).lean();

    const freshCutoff = new Date(Date.now() - 24 * 3600000);
    const freshItems = await Auction.find({
        ...filter,
        createdAt: { $gte: freshCutoff },
    }).sort({ createdAt: -1 }).skip(Math.floor(offset * FRESH_RATIO)).limit(nFresh).lean();

    const combined = deduplicate([...personalized, ...urgentItems, ...freshItems]);
    const shuffled = softShuffle(combined).slice(0, FEED_SIZE);

    return {
        items: shuffled,
        page,
        hasMore: offset + shuffled.length < totalActive,
        type: 'personalized',
    };
};

const getColdStartFeed = async (limit, offset, filters = {}, totalActive) => {
    const filter = { status: 'active', endTime: { $gt: new Date() } };
    if (filters.category) filter.category = filters.category;

    const items = await Auction.aggregate([
        { $match: filter },
        {
            $addFields: {
                trendingScore: {
                    $add: [
                        { $multiply: ['$bidCount', 0.5] },
                        { $multiply: ['$viewCount', 0.1] },
                        {
                            $cond: [
                                { $lt: ['$endTime', new Date(Date.now() + 3600000)] },
                                50,
                                {
                                    $cond: [
                                        { $lt: ['$endTime', new Date(Date.now() + 21600000)] },
                                        30,
                                        { $cond: [{ $lt: ['$endTime', new Date(Date.now() + 86400000)] }, 15, 0] }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }
        },
        { $sort: { trendingScore: -1 } },
        { $skip: offset },
        { $limit: limit },
    ]);

    return { 
        items, 
        page: Math.floor(offset / limit) + 1, 
        hasMore: offset + items.length < totalActive, 
        type: 'trending' 
    };
};
