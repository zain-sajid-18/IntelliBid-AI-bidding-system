import UserEvent from '../../models/userEvent.model.js';
import UserProfile from '../../models/userProfile.model.js';
import User from '../../models/user.model.js';

const DECAY_FACTOR = 0.95;
const RECENCY_WINDOW_DAYS = 30;

const buildProfileForUser = async (userId) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RECENCY_WINDOW_DAYS);

    const events = await UserEvent.find({ userId, createdAt: { $gte: cutoff } }).lean();

    if (events.length === 0) return;

    const categoryScores = new Map();
    const tagScores = new Map();
    const pricePoints = [];

    for (const event of events) {
        const daysAgo = (Date.now() - new Date(event.createdAt).getTime()) / 86400000;
        const decayedWeight = event.weight * Math.pow(DECAY_FACTOR, daysAgo);

        if (event.category) {
            categoryScores.set(event.category, (categoryScores.get(event.category) || 0) + decayedWeight);
        }

        for (const tag of (event.tags || [])) {
            tagScores.set(tag, (tagScores.get(tag) || 0) + decayedWeight * 0.5);
        }

        if (event.metadata?.bidAmount) {
            pricePoints.push(Number(event.metadata.bidAmount));
        }
    }

    // Normalize to 0–1
    const maxCat = Math.max(...categoryScores.values(), 1);
    const maxTag = Math.max(...tagScores.values(), 1);

    const normalizedCat = new Map([...categoryScores].map(([k, v]) => [k, v / maxCat]));
    const normalizedTag = new Map([...tagScores].map(([k, v]) => [k, v / maxTag]));

    const priceRange = {
        min: pricePoints.length > 0 ? Math.min(...pricePoints) * 0.7 : 0,
        max: pricePoints.length > 0 ? Math.max(...pricePoints) * 1.3 : 999999,
        avg: pricePoints.length > 0 ? pricePoints.reduce((a, b) => a + b, 0) / pricePoints.length : 0,
    };

    await UserProfile.findOneAndUpdate(
        { userId },
        {
            userId,
            categoryScores: Object.fromEntries(normalizedCat),
            tagScores: Object.fromEntries(normalizedTag),
            priceRange,
            interactionCount: events.length,
            lastRebuildAt: new Date(),
        },
        { upsert: true, new: true }
    );
};

export const runProfileBuilder = async () => {
    console.log('[ProfileBuilder] Starting profile rebuild job...');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Only rebuild profiles for users who had activity in the last 7 days
    const activeUserIds = await UserEvent.distinct('userId', { createdAt: { $gte: sevenDaysAgo } });

    let rebuilt = 0;
    for (const userId of activeUserIds) {
        try {
            await buildProfileForUser(userId);
            rebuilt++;
        } catch (err) {
            console.error(`[ProfileBuilder] Failed for user ${userId}:`, err.message);
        }
    }

    console.log(`[ProfileBuilder] Done. Rebuilt ${rebuilt}/${activeUserIds.length} profiles.`);
};
