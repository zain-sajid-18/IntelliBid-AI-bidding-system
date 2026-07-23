import Auction from '../../models/auction.model.js';
import Bid from '../../models/bid.model.js';
import UserEvent from '../../models/userEvent.model.js';
import Order from '../../models/order.model.js';
import User from '../../models/user.model.js';
import { getIO } from '../../config/socket.js';

export const resolveEndedAuctions = async () => {
    try {
        // First, start any scheduled live rooms that are ready
        const roomsToStart = await Auction.find({
            type: 'live',
            status: 'scheduled',
            scheduledStartTime: { $lte: new Date() },
            endTime: { $gt: new Date() }
        });

        for (const auction of roomsToStart) {
            auction.status = 'live';
            await auction.save();

            const io = getIO();
            io.to(`auction:${auction._id}`).emit('live:roomStarted', {
                auctionId: auction._id,
                title: auction.title,
                startingPrice: auction.startingPrice,
                currentPrice: auction.currentPrice
            });
        }

        // Now, handle all ended auctions (standard and live)
        const endedAuctions = await Auction.find({
            endTime: { $lte: new Date() },
            status: { $in: ['active', 'live'] }
        });

        for (const auction of endedAuctions) {
            const io = getIO();

            if (auction.bidCount > 0) {
                // Find highest bid
                const highestBid = await Bid.findOne({ auction: auction._id }).sort({ amount: -1 });
                
                if (highestBid) {
                    auction.winner = highestBid.bidder;

                    // Mark this bid as won, and others as outbid
                    await Bid.updateMany(
                        { auction: auction._id, _id: { $ne: highestBid._id } },
                        { $set: { status: 'outbid' } }
                    );

                    highestBid.status = 'won'; 
                    await highestBid.save();

                    if (auction.type === 'standard') {
                        // Standard auction: set status to ended and create order immediately
                        auction.status = 'ended';

                        // Create Order for the winner (Expires in 48 hours)
                        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
                        await Order.create({
                            auction: auction._id,
                            buyer: highestBid.bidder,
                            seller: auction.seller,
                            amount: highestBid.amount,
                            status: 'pending',
                            expiresAt
                        });

                        // Create event for winner notification
                        await UserEvent.create({
                            userId: highestBid.bidder,
                            eventType: 'auction_won',
                            auctionId: auction._id,
                            context: `You won the auction for ${auction.title} with a bid of $${highestBid.amount}! Payment is due within 48 hours.`
                        });
                    } else {
                        // Live auction: set status to awaiting_seller_confirmation first, send notification to seller and winner
                        auction.status = 'awaiting_seller_confirmation';

                        // Notify winner
                        await UserEvent.create({
                            userId: auction.winner,
                            eventType: 'auction_won',
                            auctionId: auction._id,
                            context: `You won the live auction for ${auction.title} with a bid of $${highestBid.amount}! Waiting for seller to confirm the sale.`
                        });

                        // Notify seller via socket
                        io.to(`user:${auction.seller}`).emit('notification:new', {
                            type: 'live_auction_ended',
                            title: 'Live Auction Ended',
                            body: `Your live auction for "${auction.title}" has ended. The winning bid is $${highestBid.amount}! Review the bid and confirm or reject the sale.`,
                            auctionId: auction._id,
                            timestamp: new Date().toISOString()
                        });
                    }

                    io.to(`auction:${auction._id}`).emit('live:roomEnded', {
                        auctionId: auction._id,
                        winnerId: highestBid.bidder,
                        winningAmount: highestBid.amount
                    });
                }
            } else {
                // No bids, auction just ends without a winner
                auction.status = 'ended';
                io.to(`auction:${auction._id}`).emit('live:roomEnded', {
                    auctionId: auction._id,
                    winnerId: null
                });
            }

            await auction.save();
        }
        
        if (roomsToStart.length > 0 || endedAuctions.length > 0) {
            console.log(`[AuctionJob] Started ${roomsToStart.length} live rooms, resolved ${endedAuctions.length} ended auctions.`);
        }
    } catch (error) {
        console.error('[AuctionJob] Error resolving auctions:', error);
    }
};

export const processExpiredOrders = async () => {
    try {
        // Find pending orders that have expired
        const expiredOrders = await Order.find({
            status: 'pending',
            expiresAt: { $lte: new Date() }
        });

        for (const order of expiredOrders) {
            // 1. Blacklist/Suspend the delinquent buyer
            await User.findByIdAndUpdate(order.buyer, { status: 'suspended' });

            // Notify delinquent buyer
            await UserEvent.create({
                userId: order.buyer,
                eventType: 'account_suspended',
                context: `Your account has been suspended for failing to pay for an auction within 48 hours.`
            });

            // 2. Mark order as cancelled
            order.status = 'cancelled';
            await order.save();

            // 3. Find the NEXT highest bidder who is not suspended and whose bid is not winning
            const auction = await Auction.findById(order.auction);
            
            // Revert the old winning bid to outbid
            await Bid.findOneAndUpdate(
                { auction: auction._id, bidder: order.buyer },
                { status: 'outbid' }
            );

            // Find the next highest bid
            const nextHighestBid = await Bid.findOne({ 
                auction: auction._id,
                status: 'outbid', // Was previously marked outbid
                bidder: { $ne: order.buyer }
            }).sort({ amount: -1 }).populate('bidder');

            if (nextHighestBid && nextHighestBid.bidder.status !== 'suspended') {
                // Assign new winner
                auction.winner = nextHighestBid.bidder._id;
                await auction.save();

                nextHighestBid.status = 'winning';
                await nextHighestBid.save();

                // Generate new order for the fallback winner
                const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
                await Order.create({
                    auction: auction._id,
                    buyer: nextHighestBid.bidder._id,
                    seller: auction.seller,
                    amount: nextHighestBid.amount,
                    status: 'pending',
                    expiresAt
                });

                // Notify new winner
                await UserEvent.create({
                    userId: nextHighestBid.bidder._id,
                    eventType: 'auction_won',
                    auctionId: auction._id,
                    context: `Good news! The previous winner defaulted. You have won the auction for ${auction.title} with your bid of $${nextHighestBid.amount}. Payment is due within 48 hours.`
                });
            } else {
                // No valid fallback winner found, auction ends completely without a successful sale
                auction.winner = null;
                await auction.save();
            }
        }

        if (expiredOrders.length > 0) {
            console.log(`[AuctionJob] Processed ${expiredOrders.length} expired orders and executed fallback mechanism.`);
        }
    } catch (error) {
        console.error('[AuctionJob] Error processing expired orders:', error);
    }
};
