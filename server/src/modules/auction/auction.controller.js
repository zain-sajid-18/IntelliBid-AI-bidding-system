import { asyncHandler } from '../../utils/asyncHandler.js';
import Auction from '../../models/auction.model.js';
import Bid from '../../models/bid.model.js';
import User from '../../models/user.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.0-flash-lite';

export const getAuctionById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const auction = await Auction.findById(id)
        .populate('seller', 'firstName lastName avatar rating totalRatings createdAt')
        .lean();

    if (!auction) {
        return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    // Fetch bid history (last 10 bids)
    const bidHistory = await Bid.find({ auction: id })
        .populate('bidder', 'firstName lastName avatar')
        .sort({ amount: -1 }) // Highest first
        .limit(10)
        .lean();

    // Map bid history to remove sensitive info
    const safeBidHistory = bidHistory.map(bid => ({
        id: bid._id,
        amount: bid.amount,
        time: bid.createdAt,
        bidderName: `${bid.bidder.firstName} ${bid.bidder.lastName.charAt(0)}.`,
        bidderAvatar: bid.bidder.avatar
    }));

    res.status(200).json({
        success: true,
        data: {
            ...auction,
            bidHistory: safeBidHistory
        }
    });
});

export const searchAuctions = asyncHandler(async (req, res) => {
    const { q, category, sort } = req.query;

    let filter = { status: 'active', endTime: { $gt: new Date() } };

    if (category && category !== 'All') {
        filter.category = category;
    }

    let sortQuery = { createdAt: -1 };
    if (sort === 'ending') sortQuery = { endTime: 1 };
    else if (sort === 'popular') sortQuery = { viewCount: -1 };
    else if (sort === 'price_asc') sortQuery = { currentPrice: 1 };
    else if (sort === 'price_desc') sortQuery = { currentPrice: -1 };

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 1: AI QUERY EXPANSION  (runs when user types anything)
    // Ask Gemini to expand the raw query into related keywords.
    // "watches for boys" → ["watch","wristwatch","timepiece","boys","kids","children","male youth"]
    // ─────────────────────────────────────────────────────────────────────────
    let searchTerms = [];
    if (q) {
        if (process.env.GEMINI_API_KEY) {
            const expansionPrompt = `You are a search query expansion engine for an e-commerce auction platform.
The user searched for: "${q}"

Generate a compact JSON array of related keywords, synonyms, and related product terms that a seller might use when listing this item.
Rules:
- Maximum 10 keywords total
- Include the original key words (minus filler words like "for", "the", "a")
- Include common synonyms and alternate names for the product
- Include target audience descriptors (e.g. "boys" → also include "kids", "children", "male", "youth")
- Return ONLY a valid JSON array of strings. No explanation, no markdown.

Example output for "watches for boys": ["watch","wristwatch","timepiece","boys","kids","children","youth","male","junior"]`;

            const tryExpand = async (modelName) => {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(expansionPrompt);
                const rawText = result.response.text().trim();
                const jsonMatch = rawText.match(/\[[\s\S]*?\]/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    if (Array.isArray(parsed)) {
                        return parsed.map(t => String(t).trim()).filter(Boolean);
                    }
                }
                return [];
            };
            try {
                try {
                    searchTerms = await tryExpand(PRIMARY_MODEL);
                } catch (primaryErr) {
                    const msg = primaryErr.message || '';
                    if (msg.includes('429') || msg.includes('quota') || msg.includes('model output')) {
                        console.warn('[Search] Primary model failed, using fallback:', msg.slice(0, 80));
                        searchTerms = await tryExpand(FALLBACK_MODEL);
                    } else {
                        throw primaryErr;
                    }
                }
            } catch (err) {
                console.error('[Search] Gemini query expansion failed, falling back to tokenization:', err.message);
            }
        }

        // Fallback: basic tokenization if Gemini is unavailable
        if (searchTerms.length === 0) {
            const stopWords = new Set(['for', 'the', 'and', 'with', 'in', 'of', 'on', 'a', 'an', 'to', 'by']);
            searchTerms = q.toLowerCase()
                .split(/\s+/)
                .filter(t => !stopWords.has(t) && t.length > 1);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 2: MULTI-TERM DATABASE SEARCH
    // Build an OR query across all expanded terms — any match on title,
    // description, or tags counts. We use OR (not AND) for broader recall,
    // just like Google returns results for any of your keywords.
    // ─────────────────────────────────────────────────────────────────────────
    if (searchTerms.length > 0) {
        const regexClauses = searchTerms.map(term => {
            const re = new RegExp(term, 'i');
            return {
                $or: [
                    { title: { $regex: re } },
                    { description: { $regex: re } },
                    { tags: { $regex: re } }
                ]
            };
        });
        filter.$or = regexClauses.flatMap(c => c.$or);
    }

    let results = await Auction.find(filter)
        .sort(sortQuery)
        .limit(30)
        .lean();

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 3: RELEVANCE SCORING & RE-RANKING
    // Score each result by how many of the expanded search terms it matches.
    // Title matches score higher than description matches.
    // ─────────────────────────────────────────────────────────────────────────
    if (q && searchTerms.length > 0) {
        results = results.map(item => {
            let score = 0;
            for (const term of searchTerms) {
                const re = new RegExp(term, 'i');
                if (re.test(item.title)) score += 3;          // Title = highest weight
                if (re.test(item.description)) score += 1;    // Description = low weight
                if (item.tags?.some(tag => re.test(tag))) score += 2; // Tags = medium weight
            }
            return { ...item, _searchScore: score };
        });

        // Sort by our computed relevance score (highest first)
        results.sort((a, b) => b._searchScore - a._searchScore);
    }

    // Return top 12 results
    const topResults = results.slice(0, 12).map(({ _searchScore, ...rest }) => rest);

    res.status(200).json({
        success: true,
        data: topResults
    });
});

export const processPayment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const auction = await Auction.findById(id);

    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
    if (auction.status !== 'ended') return res.status(400).json({ success: false, message: 'Auction is not ended' });
    if (auction.winner?.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'You are not the winner' });

    // Mark as paid (add simple field or update status)
    // We could create an order, but for simplicity we just acknowledge it
    res.status(200).json({ success: true, message: 'Payment processed successfully' });
});

export const forfeitAuction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const auction = await Auction.findById(id);

    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
    if (auction.winner?.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'You are not the winner' });

    // Block the current winner's account
    const user = await User.findById(req.user._id);
    if (user) {
        user.isBlocked = true;
        await user.save();
    }

    // Find the next highest bidder
    const highestBids = await Bid.find({ auction: id }).sort({ amount: -1 }).limit(2);
    if (highestBids.length > 1) {
        const nextBid = highestBids[1];
        auction.winner = nextBid.bidder;
        await auction.save();

        nextBid.status = 'winning';
        await nextBid.save();
    } else {
        auction.winner = null; // No second bidder
        await auction.save();
    }

    res.status(200).json({ success: true, message: 'Auction forfeited and account blocked' });
});
