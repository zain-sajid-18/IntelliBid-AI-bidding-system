
import Auction from '../../models/auction.model.js';
import Bid from '../../models/bid.model.js';
import Order from '../../models/order.model.js';
import User from '../../models/user.model.js';
import UserEvent from '../../models/userEvent.model.js';
import { getIO } from '../../config/socket.js';

// Join live bidding room
export const joinLiveRoomService = async (auctionId, userId) => {
    const auction = await Auction.findById(auctionId);
    if (!auction) throw new Error('Auction not found');
    if (auction.type !== 'live') throw new Error('Not a live bidding room');
    if (auction.status === 'ended' || auction.status === 'cancelled') throw new Error('Room is closed');

    const now = new Date();
    if (auction.scheduledStartTime && now < new Date(auction.scheduledStartTime)) {
        throw new Error('Live bidding room has not started yet');
    }

    if (auction.status === 'scheduled' && auction.scheduledStartTime && new Date(auction.scheduledStartTime) <= now) {
        auction.status = 'live';
    }

    const userIdStr = userId.toString();
    // Idempotence: if already in room, return auction state without throwing error
    if (auction.participants.some(p => p.toString() === userIdStr)) {
        if (auction.isModified()) await auction.save();
        return auction;
    }

    // Hard backend limit: max 5 active participants
    if (auction.participants.length >= auction.maxParticipants) {
        throw new Error('Room is full');
    }

    auction.participants.push(userId);
    await auction.save();

    // Broadcast to room that user joined
    const io = getIO();
    io.to(`auction:${auctionId}`).emit('live:participantJoined', { userId: userIdStr, participantCount: auction.participants.length });

    return auction;
};

// Leave live bidding room
export const leaveLiveRoomService = async (auctionId, userId) => {
    const auction = await Auction.findById(auctionId);
    if (!auction) throw new Error('Auction not found');

    const userIdStr = userId.toString();
    const initialCount = auction.participants.length;
    auction.participants = auction.participants.filter(p => p.toString() !== userIdStr);

    if (auction.participants.length !== initialCount) {
        await auction.save();
        // Broadcast to room that user left
        const io = getIO();
        io.to(`auction:${auctionId}`).emit('live:participantLeft', { userId: userIdStr, participantCount: auction.participants.length });
    }

    return auction;
};

// Place live bid
export const placeLiveBidService = async (auctionId, userId, bidAmount) => {
    const auction = await Auction.findById(auctionId);
    if (!auction) throw new Error('Auction not found');
    if (auction.type !== 'live') throw new Error('Not a live bidding room');

    const now = new Date();
    if (auction.scheduledStartTime && now < new Date(auction.scheduledStartTime)) {
        throw new Error('Live bidding room has not started yet');
    }
    if (now >= new Date(auction.endTime)) {
        throw new Error('Live bidding room has ended');
    }

    if (auction.status === 'scheduled' && auction.scheduledStartTime && new Date(auction.scheduledStartTime) <= now) {
        auction.status = 'live';
        await auction.save();
    }

    if (auction.status !== 'live') throw new Error('Room is not active for bidding');

    const userIdStr = userId.toString();
    if (auction.seller.toString() === userIdStr) {
        throw new Error('You cannot bid on your own auction');
    }

    if (!auction.participants.some(p => p.toString() === userIdStr)) {
        throw new Error('Not an active participant in this live bidding room');
    }

    const parsedBidAmount = Number(bidAmount);
    if (!parsedBidAmount || parsedBidAmount <= auction.currentPrice) {
        throw new Error(`Bid must be higher than current price of $${auction.currentPrice.toLocaleString()}`);
    }

    // Atomic update to handle simultaneous bids safely
    const updatedAuction = await Auction.findOneAndUpdate(
        { _id: auctionId, currentPrice: { $lt: parsedBidAmount }, status: 'live' },
        { $set: { currentPrice: parsedBidAmount }, $inc: { bidCount: 1, bidVersion: 1 } },
        { new: true }
    );

    if (!updatedAuction) {
        throw new Error('Your bid was beaten by another bidder! Please refresh and try a higher amount.');
    }

    // Create bid
    const bid = await Bid.create({
        auction: auctionId,
        bidder: userId,
        amount: parsedBidAmount,
        status: 'winning'
    });
    await bid.populate('bidder', 'firstName lastName avatar');
    const bidderName = bid.bidder ? `${bid.bidder.firstName} ${bid.bidder.lastName?.charAt(0) || ''}.` : 'Bidder';
    const bidderAvatar = bid.bidder?.avatar;

    // Update previous winning bid to outbid
    const previousWinningBid = await Bid.findOne({ auction: auctionId, status: 'winning', _id: { $ne: bid._id } });
    if (previousWinningBid) {
        previousWinningBid.status = 'outbid';
        await previousWinningBid.save();
    }

    // Broadcast new bid
    const io = getIO();
    io.to(`auction:${auctionId}`).emit('live:newBid', {
        auctionId,
        bidId: bid._id,
        bidderId: userIdStr,
        bidderName,
        bidderAvatar,
        amount: parsedBidAmount,
        timestamp: new Date().toISOString(),
        currentPrice: parsedBidAmount,
        bidCount: updatedAuction.bidCount
    });
    io.to(`auction:${auctionId}`).emit('bid:new', {
        auctionId,
        newPrice: parsedBidAmount,
        bidCount: updatedAuction.bidCount,
        bidderId: userIdStr,
        bidderName,
        timestamp: new Date().toISOString(),
    });

    // Notify outbid user if any
    if (previousWinningBid && previousWinningBid.bidder.toString() !== userIdStr) {
        io.to(`user:${previousWinningBid.bidder.toString()}`).emit('notification:new', {
            type: 'outbid',
            title: "You've been outbid!",
            body: `Someone placed a higher bid on live auction. Current price: $${parsedBidAmount.toLocaleString()}`,
            auctionId,
            timestamp: new Date().toISOString(),
        });
    }

    return bid;
};

// Seller confirms sale
export const confirmSaleService = async (auctionId, sellerId) => {
    const auction = await Auction.findOne({ _id: auctionId, seller: sellerId });
    if (!auction) throw new Error('Auction not found or access denied');
    if (auction.status !== 'awaiting_seller_confirmation') throw new Error('Auction is not awaiting confirmation');
    if (!auction.winner) throw new Error('No winner to confirm sale');

    auction.status = 'sale_confirmed';
    await auction.save();

    // Create order
    const highestBid = await Bid.findOne({ auction: auctionId, status: 'won' });
    if (highestBid) {
        // Get buyer's shipping address
        const buyer = await User.findById(highestBid.bidder);
        const shippingAddress = buyer?.shippingAddress || undefined;

        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
        await Order.create({
            auction: auctionId,
            buyer: highestBid.bidder,
            seller: sellerId,
            amount: highestBid.amount,
            status: 'pending',
            shippingAddress,
            expiresAt
        });
    }

    // Notify winner via socket and event
    const io = getIO();
    io.to(`user:${auction.winner}`).emit('notification:new', {
        type: 'sale_confirmed',
        title: 'Sale Confirmed!',
        body: `Your winning bid for "${auction.title}" has been confirmed by the seller.`,
        auctionId,
        timestamp: new Date().toISOString()
    });

    await UserEvent.create({
        userId: auction.winner,
        eventType: 'sale_confirmed',
        auctionId,
        context: `Seller confirmed your winning bid for ${auction.title}`
    });

    return auction;
};

// Seller rejects sale
export const rejectSaleService = async (auctionId, sellerId) => {
    const auction = await Auction.findOne({ _id: auctionId, seller: sellerId });
    if (!auction) throw new Error('Auction not found or access denied');
    if (auction.status !== 'awaiting_seller_confirmation') throw new Error('Auction is not awaiting confirmation');

    auction.status = 'sale_rejected';
    await auction.save();

    // Notify winner (if any)
    if (auction.winner) {
        const io = getIO();
        io.to(`user:${auction.winner}`).emit('notification:new', {
            type: 'sale_rejected',
            title: 'Sale Rejected',
            body: `The seller has rejected the sale for "${auction.title}".`,
            auctionId,
            timestamp: new Date().toISOString()
        });

        await UserEvent.create({
            userId: auction.winner,
            eventType: 'sale_rejected',
            auctionId,
            context: `Seller rejected the sale for ${auction.title}`
        });
    }

    return auction;
};

export default {
    joinLiveRoomService,
    leaveLiveRoomService,
    placeLiveBidService,
    confirmSaleService,
    rejectSaleService
};
