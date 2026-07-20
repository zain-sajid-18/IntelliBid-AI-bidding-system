import { getFeedService } from './feed.service.js';

export const getFeed = async (req, res) => {
    try {
        const { page, category, minPrice, maxPrice } = req.query;
        const result = await getFeedService(req.user.id, {
            page: parseInt(page) || 1,
            category,
            minPrice,
            maxPrice,
        });
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
