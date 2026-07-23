import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  createListingService,
  getAiEnhancedContentService,
  getMyListingsService,
  updateListingService,
  deleteListingService,
} from './listing.service.js';

// POST /api/seller/listings
export const createListing = asyncHandler(async (req, res) => {
  const imageUrls = req.files ? req.files.map(f => f.secure_url || f.path) : [];

  if (imageUrls.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one image is required' });
  }

  const auction = await createListingService(req.user.id, req.body, imageUrls);
  res.status(201).json({ success: true, data: auction });
});

// POST /api/seller/listings/ai-enhance
export const aiEnhanceListing = asyncHandler(async (req, res) => {
    const { rawTitle, category, imageCount } = req.body;

    if (!rawTitle || !category) {
        return res.status(400).json({ success: false, message: 'rawTitle and category are required' });
    }

    const enhanced = await getAiEnhancedContentService(rawTitle, category, imageCount || 0);
    res.status(200).json({ success: true, data: enhanced });
});

// GET /api/seller/listings
export const getMyListings = asyncHandler(async (req, res) => {
    const { status, page, limit } = req.query;
    const result = await getMyListingsService(req.user.id, { status, page, limit });
    res.status(200).json({ success: true, ...result });
});

// PUT /api/seller/listings/:id
export const updateListing = asyncHandler(async (req, res) => {
    const auction = await updateListingService(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, data: auction });
});

// DELETE /api/seller/listings/:id
export const deleteListing = asyncHandler(async (req, res) => {
    const result = await deleteListingService(req.params.id, req.user.id);
    res.status(200).json({ success: true, ...result });
});
