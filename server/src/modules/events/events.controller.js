import { trackEventService } from './events.service.js';

export const trackEvent = async (req, res) => {
    try {
        const { auctionId, eventType, metadata } = req.body;

        if (!eventType) {
            return res.status(400).json({ success: false, message: 'eventType is required' });
        }

        await trackEventService(req.user.id, { auctionId, eventType, metadata });
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
