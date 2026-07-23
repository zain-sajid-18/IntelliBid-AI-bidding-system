import { asyncHandler } from '../../utils/asyncHandler.js';
import User from '../../models/user.model.js';
import SellerProfile from '../../models/sellerProfile.model.js';
import { encrypt } from '../../utils/encryption.js';
import {
    getSellerStatsService,
    getActiveListingsService,
    getSellerActivityService,
    getSellerInsightsService,
    getSellerOrdersService,
    shipOrderService
} from './seller.service.js';
import {
    confirmSaleService,
    rejectSaleService
} from '../live-bidding/live-bidding.service.js';

export const getSellerStats = asyncHandler(async (req, res) => {
    const stats = await getSellerStatsService(req.user.id);
    res.status(200).json({ success: true, data: stats });
});

export const getActiveListings = asyncHandler(async (req, res) => {
    const listings = await getActiveListingsService(req.user.id);
    res.status(200).json({ success: true, data: listings });
});

export const getSellerActivity = asyncHandler(async (req, res) => {
    const activity = await getSellerActivityService(req.user.id);
    res.status(200).json({ success: true, data: activity });
});

export const getSellerInsights = asyncHandler(async (req, res) => {
    const insights = await getSellerInsightsService(req.user.id);
    res.status(200).json({ success: true, data: insights });
});

export const getSellerOrders = asyncHandler(async (req, res) => {
    const orders = await getSellerOrdersService(req.user.id);
    res.status(200).json({ success: true, data: orders });
});

export const shipOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { trackingNumber } = req.body;
    if (!trackingNumber) {
        return res.status(400).json({ success: false, message: 'Tracking number is required' });
    }
    const order = await shipOrderService(orderId, req.user.id, trackingNumber);
    res.status(200).json({ success: true, message: 'Order marked as shipped', data: order });
});

export const activateSeller = asyncHandler(async (req, res) => {
    const {
        businessName,
        businessCategory,
        website,
        bankAccountHolder,
        bankName,
        iban,
        swiftCode,
        termsAccepted
    } = req.body;

    if (!termsAccepted) {
        return res.status(400).json({ success: false, message: 'You must accept terms to become a seller' });
    }

    // Update User
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.role = 'seller';
    user.businessName = businessName;
    user.businessCategory = businessCategory;
    user.website = website;
    user.sellerStatus = 'active'; // Default to active for now
    user.sellerActivatedAt = new Date();
    await user.save();

    // Create/Update Seller Profile
    const profileData = {
        user: user._id,
        bankAccountHolder,
        bankName,
        iban: encrypt(iban),
        swiftCode,
        termsAccepted,
        termsAcceptedAt: new Date()
    };

    await SellerProfile.findOneAndUpdate(
        { user: user._id },
        profileData,
        { upsert: true, new: true }
    );

    res.status(200).json({
        success: true,
        message: 'Seller account activated successfully',
        user
    });
});

// Confirm sale for live auction
export const confirmSale = asyncHandler(async (req, res) => {
    const { auctionId } = req.params;
    const auction = await confirmSaleService(auctionId, req.user.id);
    res.status(200).json({
        success: true,
        message: 'Sale confirmed successfully',
        data: auction
    });
});

// Reject sale for live auction
export const rejectSale = asyncHandler(async (req, res) => {
    const { auctionId } = req.params;
    const auction = await rejectSaleService(auctionId, req.user.id);
    res.status(200).json({
        success: true,
        message: 'Sale rejected successfully',
        data: auction
    });
});

// Accept highest bid early for standard listing
export const acceptEarly = asyncHandler(async (req, res) => {
    const { auctionId } = req.params;
    const { acceptEarlyService } = await import('./seller.service.js');
    const auction = await acceptEarlyService(auctionId, req.user.id);
    res.status(200).json({
        success: true,
        message: 'Current highest bid accepted and auction closed',
        data: auction
    });
});

