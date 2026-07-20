import User from '../../models/user.model.js';
import Bid from '../../models/bid.model.js';
import Auction from '../../models/auction.model.js';
import bcrypt from 'bcryptjs';

export const getProfileService = async (userId) => {
    const user = await User.findById(userId).select('-password -emailVerificationToken -emailVerificationExpires -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
        throw new Error('User not found');
    }

    let stats = {};

    if (user.role === 'buyer') {
        const totalBids = await Bid.countDocuments({ bidder: userId });
        const itemsWon = await Bid.countDocuments({ bidder: userId, status: 'won' });
        
        const spentAggregation = await Bid.aggregate([
            { $match: { bidder: userId, status: 'won' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalSpent = spentAggregation.length > 0 ? spentAggregation[0].total : 0;

        stats = { totalBids, itemsWon, totalSpent };
    } else if (user.role === 'seller') {
        const totalListings = await Auction.countDocuments({ seller: userId });
        
        const sellerAuctions = await Auction.find({ seller: userId }).select('_id');
        const auctionIds = sellerAuctions.map(a => a._id);

        const revenueAggregation = await Bid.aggregate([
            { $match: { auction: { $in: auctionIds }, status: 'won' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;

        const itemsSold = await Bid.countDocuments({ auction: { $in: auctionIds }, status: 'won' });

        stats = { totalListings, totalRevenue, itemsSold };
    }

    return { user, stats };
};

export const updateProfileService = async (userId, updateData) => {
    const allowedFields = ['firstName', 'lastName', 'bio', 'phone', 'location', 'avatar', 'businessName', 'businessCategory', 'website', 'notificationsEnabled', 'profileVisibility'];
    
    const filteredUpdate = {};
    Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
            filteredUpdate[key] = updateData[key];
        }
    });

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: filteredUpdate },
        { new: true, runValidators: true }
    ).select('-password');

    return user;
};

export const changePasswordService = async (userId, oldPassword, newPassword) => {
    const user = await User.findById(userId);
    
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        throw new Error('Incorrect current password');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return true;
};

export const deleteAccountService = async (userId) => {
    // We do a soft delete for platform integrity
    await User.findByIdAndUpdate(userId, { isDeleted: true });
    return true;
};

export const getPublicProfileService = async (userId) => {
    const user = await User.findById(userId).select('firstName lastName bio avatar businessName businessCategory website location phone rating totalRatings role createdAt profileVisibility isDeleted');
    
    if (!user || user.profileVisibility === 'private' || user.isDeleted) {
        throw new Error('Profile not found or private');
    }

    let result = { user };

    if (user.role === 'seller') {
        const activeListings = await Auction.find({ 
            seller: userId, 
            status: 'active',
            endTime: { $gt: new Date() }
        })
        .select('title images currentPrice startingPrice endTime bidCount')
        .sort({ createdAt: -1 })
        .limit(12);

        // Calculate items sold
        const sellerAuctions = await Auction.find({ seller: userId }).select('_id');
        const auctionIds = sellerAuctions.map(a => a._id);
        const totalSales = await Bid.countDocuments({ auction: { $in: auctionIds }, status: 'won' });

        result.activeListings = activeListings;
        result.stats = { 
            totalSales, 
            rating: user.rating,
            totalRatings: user.totalRatings,
        };
    } else if (user.role === 'buyer') {
        const totalBids = await Bid.countDocuments({ bidder: userId });
        const itemsWon = await Bid.countDocuments({ bidder: userId, status: 'won' });
        result.stats = { totalBids, itemsWon };
    }

    return result;
};
