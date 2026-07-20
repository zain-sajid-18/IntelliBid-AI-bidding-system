import UserEvent, { EVENT_WEIGHTS } from '../../models/userEvent.model.js';
import Auction from '../../models/auction.model.js';

export const trackEventService = async (userId, { auctionId, eventType, metadata = {} }) => {
    const weight = EVENT_WEIGHTS[eventType];
    if (weight === undefined) throw new Error(`Invalid event type: ${eventType}`);

    let category = null;
    let tags = [];

    if (auctionId) {
        const auction = await Auction.findById(auctionId).select('category tags bidCount viewCount').lean();
        if (auction) {
            category = auction.category;
            tags = auction.tags || [];

            // Inline real-time counter updates
            const update = {};
            if (eventType === 'item_view' || eventType === 'time_on_page') {
                update.$inc = { viewCount: 1 };
            } else if (eventType === 'bid_placed') {
                update.$inc = { bidCount: 1 };
            }
            if (Object.keys(update).length > 0) {
                await Auction.findByIdAndUpdate(auctionId, update);
            }
        }
    }

    const event = await UserEvent.create({
        userId,
        auctionId: auctionId || null,
        eventType,
        weight,
        category,
        tags,
        metadata,
    });

    return event;
};
