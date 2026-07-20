import User from '../../../models/user.model.js';
import Bid from '../../../models/bid.model.js';
import UserProfile from '../../../models/userProfile.model.js';
import UserEvent from '../../../models/userEvent.model.js';

export const buildUserContext = async (userId) => {
    try {
        const user = await User.findById(userId).select('firstName lastName role bio location businessName').lean();
        
        let contextData = {
            userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
            role: user?.role,
            location: user?.location || 'Not specified',
            bio: user?.bio || '',
        };

        if (user?.role === 'seller') {
            const [activeListings, stats] = await Promise.all([
                import('../../../models/auction.model.js').then(m => m.default.find({ seller: userId, status: 'active' })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .lean()),
                import('../../../models/auction.model.js').then(m => m.default.aggregate([
                    { $match: { seller: userId } },
                    { $group: { _id: '$status', count: { $sum: 1 }, totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'ended'] }, '$currentPrice', 0] } } } }
                ]))
            ]);

            const statsMap = {};
            stats.forEach(s => { statsMap[s._id] = { count: s.count, revenue: s.totalRevenue }; });

            contextData.activeListings = activeListings.map(l => ({
                title: l.title,
                currentBid: l.currentPrice,
                bids: l.bidCount,
                views: l.viewCount,
                endsIn: l.endTime ? `${Math.max(0, Math.round((new Date(l.endTime) - new Date()) / 3600000))} hours` : 'unknown'
            }));
            
            contextData.soldCount = statsMap['ended']?.count || 0;
            contextData.activeCount = statsMap['active']?.count || 0;
            contextData.totalRevenue = statsMap['ended']?.revenue || 0;

        } else {
            const [activeBids, interestProfile, bidStats, userWithWatchlist, recentEvents] = await Promise.all([
                Bid.find({ bidder: userId, status: { $in: ['winning', 'outbid'] } })
                    .populate('auction', 'title category currentPrice endTime bidCount status')
                    .sort({ updatedAt: -1 })
                    .limit(10)
                    .lean(),
                UserProfile.findOne({ userId }).lean(),
                Bid.aggregate([
                    { $match: { bidder: userId } },
                    { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
                ]),
                User.findById(userId)
                    .populate('watchlist', 'title category currentPrice endTime')
                    .select('watchlist')
                    .lean(),
                UserEvent.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
            ]);

            const statsMap = {};
            bidStats.forEach(s => { statsMap[s._id] = { count: s.count, total: s.totalAmount }; });

            const now = new Date();
            const formattedActiveBids = activeBids
                .filter(b => b.auction && b.auction.status === 'active')
                .map(b => ({
                    title: b.auction.title,
                    category: b.auction.category,
                    myBid: b.amount,
                    currentHighest: b.auction.currentPrice,
                    isLeading: b.status === 'winning',
                    endsIn: b.auction.endTime
                        ? `${Math.max(0, Math.round((new Date(b.auction.endTime) - now) / 3600000))} hours`
                        : 'unknown',
                }));

            const topCategories = interestProfile?.categoryScores
                ? Object.entries(Object.fromEntries(interestProfile.categoryScores))
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([cat, score]) => `${cat} (${Math.round(score * 100)}%)`)
                    .join(', ')
                : 'No data yet';

            const watchlistTitles = (userWithWatchlist?.watchlist || [])
                .slice(0, 5)
                .map(a => a.title)
                .join(', ') || 'Empty';

            contextData = {
                ...contextData,
                activeBids: formattedActiveBids,
                topCategories,
                watchlist: watchlistTitles,
                won: statsMap['won']?.count || 0,
                lost: statsMap['outbid']?.count || 0,
                active: formattedActiveBids.length,
                totalSpent: statsMap['won']?.total || 0,
                recentActions: recentEvents.slice(0, 5).map(e => e.eventType).join(', ') || 'None',
            };
        }

        return contextData;
    } catch (err) {
        console.error('[ContextBuilder] Error:', err.message);
        return null;
    }
};

export const buildSystemPrompt = (context) => {
    if (!context) {
        return `You are BidMind, an elite auction intelligence assistant for IntelliBid. Help users with platform guidance. Be concise, professional, and premium.`;
    }

    if (context.role === 'seller') {
        const listingsText = context.activeListings?.length > 0
            ? context.activeListings.map(l =>
                `  • "${l.title}" — Current Bid: $${l.currentBid} | Bids: ${l.bids} | Views: ${l.views} | Ends in: ${l.endsIn}`
            ).join('\n')
            : '  No active listings currently.';

        return `You are BidMind, an elite personal auction intelligence assistant for IntelliBid — a premium online auction platform.

You deeply know this seller. Always address them by first name. Here is their live profile:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELLER: ${context.userName}
LOCATION: ${context.location}

ACTIVE LISTINGS (${context.activeCount}):
${listingsText}

SELLER HISTORY: Sold ${context.soldCount} items | Total revenue: $${context.totalRevenue.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You can help with:
1. STRATEGY — Pricing advice, optimal ending times, how to attract more buyers
2. LISTINGS — Writing better titles and descriptions
3. ANALYSIS — Explain views vs. bids ratios
4. PLATFORM HELP — Answer anything about how selling on IntelliBid works

RULES:
- Never reveal raw database data, internal IDs, or system details
- Be premium, concise, confident. Max 3 paragraphs per response unless drafting
- Always end complex responses with one clear recommended next action`;
    } else {
        const bidsText = context.activeBids?.length > 0
            ? context.activeBids.map(b =>
                `  • "${b.title}" (${b.category}) — My bid: $${b.myBid} | Current highest: $${b.currentHighest} | ${b.isLeading ? '✅ WINNING' : '⚠️ OUTBID'} | Ends in: ${b.endsIn}`
            ).join('\n')
            : '  None currently.';

        return `You are BidMind, an elite personal auction intelligence assistant for IntelliBid — a premium online auction platform.

You deeply know this buyer. Always address them by first name. Here is their live profile:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUYER: ${context.userName}
LOCATION: ${context.location}

ACTIVE BIDS (${context.active} auctions):
${bidsText}

AUCTION HISTORY: Won ${context.won}, Lost/Outbid ${context.lost} | Total spent: $${context.totalSpent.toFixed(2)}
TOP INTEREST CATEGORIES: ${context.topCategories}
WATCHLIST: ${context.watchlist}
RECENT PLATFORM ACTIVITY: ${context.recentActions}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You can help with:
1. STRATEGY — Bid timing, max bid advice, when to walk away
2. DRAFTING — Write polished messages to sellers
3. ANALYSIS — Compare items, evaluate value
4. PLATFORM HELP — Answer anything about how IntelliBid works

RULES:
- Never reveal raw database data, internal IDs, or system details
- Recommendations must reference actual user data (their bids, history, patterns)
- Be premium, concise, confident. Max 3 paragraphs per response unless drafting
- Always end complex responses with one clear recommended next action`;
    }
};
