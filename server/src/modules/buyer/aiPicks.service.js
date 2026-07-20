import Auction from '../../models/auction.model.js';
import UserProfile from '../../models/userProfile.model.js';
import UserEvent from '../../models/userEvent.model.js';
import { scoreAuctionForUser } from '../feed/feed.scorer.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.0-flash-lite';

const tagPick = (auction, userProfile) => {
    const hoursLeft = (new Date(auction.endTime).getTime() - Date.now()) / 3600000;
    const isSteal = hoursLeft > 0 && hoursLeft < 3 && auction.currentPrice <= (auction.startingPrice * 1.3) && auction.bidCount < 3;
    if (isSteal) return { tag: 'steal', label: '🔥 The Steal' };

    const isHot = auction.bidCount >= 5;
    if (isHot) return { tag: 'hot', label: '⚡ Going Fast' };

    const catScore = userProfile?.categoryScores?.[auction.category] || 0;
    const isMatch = catScore > 0.6;
    if (isMatch) return { tag: 'match', label: '✨ Perfect Match' };

    const isFresh = (Date.now() - new Date(auction.createdAt).getTime()) < 86400000;
    if (isFresh) return { tag: 'fresh', label: '🆕 Just Listed' };

    return { tag: 'recommended', label: '🎯 Recommended' };
};

const enrichWithGemini = async (topPicks, userProfile) => {
    if (!topPicks || topPicks.length === 0) return [];
    
    // We only enrich the top 5 to save quota and latency
    const toEnrich = topPicks.slice(0, 5);
    
    // Extract top categories
    const categories = Object.entries(userProfile?.categoryScores || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([c, s]) => `${c} (${s.toFixed(2)})`)
        .join(', ');

    const prompt = `
You are IntelliBid's AI matchmaker. Be concise and persuasive.

User Context:
- Top categories: ${categories || 'New user, exploring'}
- Price comfort zone: $${userProfile?.priceRange?.min || 0} - $${userProfile?.priceRange?.max || 9999}

Auctions to analyze:
${toEnrich.map((a, i) => `${i + 1}. ID: ${a._id} | "${a.title}" | Cat: ${a.category} | Price: $${a.currentPrice} | ${a.bidCount} bids`).join('\n')}

For each auction, write ONE persuasive sentence starting with "Because" that explains
why this specific user would want this item. Be specific, reference their profile.
Return valid JSON array: [{"id": "xxx", "hook": "Because..."}]
    `.trim();

    const tryEnrich = async (modelName) => {
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    };

    try {
        let hooksArray;
        try {
            hooksArray = await tryEnrich(PRIMARY_MODEL);
        } catch (primaryErr) {
            const msg = primaryErr.message || '';
            if (msg.includes('429') || msg.includes('quota') || msg.includes('model output')) {
                console.warn('[AI Picks] Primary model failed, using fallback:', msg.slice(0, 80));
                hooksArray = await tryEnrich(FALLBACK_MODEL);
            } else {
                throw primaryErr;
            }
        }

        // Map hooks back to auctions
        const hookMap = {};
        hooksArray.forEach(h => {
            if (h.id && h.hook) hookMap[h.id] = h.hook;
        });

        return topPicks.map(pick => {
            const hook = hookMap[pick._id.toString()];
            return hook ? { ...pick, hook } : pick;
        });
    } catch (error) {
        console.error('[AI Picks] Failed to enrich with Gemini:', error.message);
        return topPicks; // Fallback to raw picks without hooks
    }
};

export const getAiPicksService = async (userId, forceRefresh = false) => {
    // 1. Load User Profile
    let userProfile = await UserProfile.findOne({ userId });
    
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    let aiPicksCount = 0;
    let lastAiPicksAt = null;
    let cachedPicks = [];
    
    if (userProfile) {
        aiPicksCount = userProfile.aiPicksCount || 0;
        lastAiPicksAt = userProfile.lastAiPicksAt;
        cachedPicks = userProfile.cachedAiPicks || [];
        
        if (lastAiPicksAt && (now.getTime() - lastAiPicksAt.getTime()) > oneDay) {
            aiPicksCount = 0;
            userProfile.aiPicksCount = 0;
            await userProfile.save();
        }
    }
    
    const remainingRefreshes = Math.max(0, 3 - aiPicksCount);
    
    // If not force refresh and we have cached picks, return cache
    if (!forceRefresh && cachedPicks && cachedPicks.length > 0) {
        return {
            picks: cachedPicks,
            remainingRefreshes
        };
    }
    
    // Otherwise, generate new picks (either force refresh or first load)
    if (aiPicksCount >= 3) {
        const error = new Error('Daily AI Picks limit reached (3/3). Try again tomorrow.');
        error.statusCode = 429;
        throw error;
    }
    
    let profileForScoring;
    if (userProfile) {
        profileForScoring = userProfile.toObject();
    } else {
        // Cold start - create a profile
        const newProfile = await UserProfile.create({ 
            userId, 
            aiPicksCount: 0, 
            lastAiPicksAt: now 
        });
        userProfile = newProfile;
        profileForScoring = newProfile.toObject();
        profileForScoring.categoryScores = {};
        profileForScoring.tagScores = {};
        profileForScoring.priceRange = { min: 0, max: 999999 };
    }

    // 2. Get Exclusions (items already bidded on)
    const biddedEvents = await UserEvent.distinct('auctionId', {
        userId,
        eventType: 'bid_placed',
        auctionId: { $ne: null },
    });
    const excludedIds = new Set(biddedEvents.map(id => id.toString()));

    // 3. Fetch Candidates (Broad filter)
    const filter = { status: 'active', endTime: { $gt: new Date() } };
    
    // Optimize: Only fetch items in user's price range if they have a history
    if (profileForScoring.interactionCount > 5) {
        filter.currentPrice = { 
            $gte: profileForScoring.priceRange.min * 0.5, 
            $lte: profileForScoring.priceRange.max * 1.5 
        };
    }

    const candidates = await Auction.find(filter).limit(100).lean();

    // 4. Score & Filter
    const scoredPicks = candidates
        .map(auction => {
            const score = scoreAuctionForUser(auction, profileForScoring, excludedIds);
            return { ...auction, aiScore: score };
        })
        .filter(a => a.aiScore > 0)
        .sort((a, b) => b.aiScore - a.aiScore)
        .slice(0, 5); // Top 5 picks to optimize API calls

    // 5. Tagging
    const taggedPicks = scoredPicks.map(pick => ({
        ...pick,
        tagInfo: tagPick(pick, profileForScoring)
    }));

    // 6. Gemini Enrichment
    const enrichedPicks = await enrichWithGemini(taggedPicks, profileForScoring);

    // Format response
    const formattedPicks = enrichedPicks.map(p => ({
        id: p._id,
        title: p.title,
        category: p.category,
        image: p.images?.[0] || 'https://via.placeholder.com/300',
        currentPrice: p.currentPrice,
        startingPrice: p.startingPrice,
        endTime: p.endTime,
        bidCount: p.bidCount,
        score: p.aiScore,
        tag: p.tagInfo.tag,
        tagLabel: p.tagInfo.label,
        hook: p.hook || null
    }));

    // Save to user profile cached picks and increment count
    userProfile.cachedAiPicks = formattedPicks;
    userProfile.aiPicksCount = aiPicksCount + 1;
    userProfile.lastAiPicksAt = now;
    await userProfile.save();

    return {
        picks: formattedPicks,
        remainingRefreshes: Math.max(0, 3 - (aiPicksCount + 1))
    };
};
