import Auction from '../../models/auction.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Primary model with fallback for rate limits / empty-output errors
const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.0-flash-lite';

// ── Create a new auction listing ─────────────────────────────────────────────
export const createListingService = async (sellerId, data, imageUrls) => {
    const {
        title, description, category, tags,
        startingPrice, reservePrice, durationDays, status
    } = data;

    const endTime = new Date();
    endTime.setDate(endTime.getDate() + Number(durationDays || 7));

    const auction = await Auction.create({
        title: title.trim(),
        description: description.trim(),
        category,
        tags: Array.isArray(tags) ? tags : (tags || '').split(',').map(t => t.trim()).filter(Boolean),
        images: imageUrls,
        startingPrice: Number(startingPrice),
        currentPrice: Number(startingPrice),
        reservePrice: reservePrice ? Number(reservePrice) : undefined,
        seller: sellerId,
        endTime,
        status: status === 'draft' ? 'draft' : 'active',
    });

    return auction;
};

// ── AI Enhance listing content ────────────────────────────────────────────────
export const getAiEnhancedContentService = async (rawTitle, category, imageCount = 0) => {
    const imageContext = imageCount > 0 
        ? `The seller has uploaded ${imageCount} image(s) of the item.` 
        : 'No images provided yet.';

    const prompt = `
You are an expert auction copywriter for IntelliBid, a premium AI-powered auction marketplace.

A seller is creating a listing with:
- Raw title (typed by seller): "${rawTitle}"
- Category: "${category}"
- ${imageContext}

Generate a high-converting auction listing. Return ONLY a valid JSON object with these exact keys:
{
  "enhancedTitle": "Compelling title under 70 chars",
  "description": "Professional 150-220 word description",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "suggestedStartingPrice": 100
}

Rules:
- Output MUST be valid JSON.
- No markdown formatting.
- No backticks.
- No extra words.
- suggestedStartingPrice must be a number.
- tags must be an array of strings.
`.trim();

    const tryGenerateWithModel = async (modelName) => {
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { 
                responseMimeType: 'application/json',
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
        });
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    };

    try {
        let parsed;
        try {
            parsed = await tryGenerateWithModel(PRIMARY_MODEL);
        } catch (primaryErr) {
            const msg = primaryErr.message || '';
            // Fall back on rate-limit (429) or empty output errors
            if (msg.includes('429') || msg.includes('quota') || msg.includes('model output')) {
                console.warn('[AI Listing] Primary model failed, trying fallback:', msg.slice(0, 80));
                parsed = await tryGenerateWithModel(FALLBACK_MODEL);
            } else {
                throw primaryErr;
            }
        }

        return {
            enhancedTitle: (parsed.enhancedTitle || rawTitle).slice(0, 70),
            description: parsed.description || 'Professional description unavailable.',
            tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8) : [],
            suggestedStartingPrice: Number(parsed.suggestedStartingPrice) || 0,
        };
    } catch (error) {
        console.error('[AI Listing] Gemini enhancement failed:', error.message);
        if (error.message.includes('API key') || error.message.includes('credentials')) {
            throw new Error('AI service configuration error. Please contact support.');
        }
        throw new Error('AI enhancement temporarily unavailable. Please fill in details manually.');
    }
};

// ── Get seller's own listings (paginated) ─────────────────────────────────────
export const getMyListingsService = async (sellerId, { status, page = 1, limit = 12 } = {}) => {
    const filter = { seller: sellerId };
    if (status && status !== 'all') filter.status = status;

    const skip = (page - 1) * limit;
    const [listings, total] = await Promise.all([
        Auction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Auction.countDocuments(filter),
    ]);

    return {
        listings: listings.map(l => ({
            id: l._id,
            title: l.title,
            category: l.category,
            image: l.images?.[0] || null,
            currentPrice: l.currentPrice,
            startingPrice: l.startingPrice,
            bidCount: l.bidCount,
            viewCount: l.viewCount,
            endTime: l.endTime,
            status: l.status,
            createdAt: l.createdAt,
        })),
        total,
        page: Number(page),
        hasMore: skip + listings.length < total,
    };
};

// ── Update a listing (seller must own it) ─────────────────────────────────────
export const updateListingService = async (listingId, sellerId, data) => {
    const auction = await Auction.findOne({ _id: listingId, seller: sellerId });
    if (!auction) throw new Error('Listing not found or access denied');
    if (auction.status === 'ended') throw new Error('Cannot edit an ended auction');

    const allowedUpdates = ['title', 'description', 'tags', 'reservePrice', 'status'];
    allowedUpdates.forEach(field => {
        if (data[field] !== undefined) auction[field] = data[field];
    });

    await auction.save();
    return auction;
};

// ── Soft-delete (cancel) a listing ────────────────────────────────────────────
export const deleteListingService = async (listingId, sellerId) => {
    const auction = await Auction.findOne({ _id: listingId, seller: sellerId });
    if (!auction) throw new Error('Listing not found or access denied');
    if (auction.bidCount > 0) throw new Error('Cannot cancel an auction that already has bids');

    auction.status = 'cancelled';
    await auction.save();
    return { message: 'Listing cancelled successfully' };
};
