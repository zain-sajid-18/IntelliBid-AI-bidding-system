import bcrypt from 'bcryptjs';
import User from '../../../src/models/user.model.js';
import Auction from '../../../src/models/auction.model.js';
import Bid from '../../../src/models/bid.model.js';
import Order from '../../../src/models/order.model.js';

let userCounter = 0;

export async function createVerifiedUser(overrides = {}) {
    userCounter += 1;
    const password = overrides.password || 'SecurePass123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        firstName: overrides.firstName || 'Integration',
        lastName: overrides.lastName || 'Tester',
        email: overrides.email || `integ.user.${userCounter}@gmail.com`,
        password: hashedPassword,
        role: overrides.role || 'buyer',
        isVerified: overrides.isVerified ?? true,
        status: overrides.status || 'active',
        ...overrides,
    });

    return { user, password };
}

export async function createActiveAuction(sellerId, overrides = {}) {
    const endTime = overrides.endTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return Auction.create({
        title: overrides.title || 'Vintage Rolex Submariner 16610',
        description: overrides.description || 'A stunning 1998 Rolex Submariner in excellent condition with box and papers.',
        category: overrides.category || 'Watches',
        images: overrides.images || ['https://cdn.test/intellibid/rolex.jpg'],
        startingPrice: overrides.startingPrice ?? 5000,
        currentPrice: overrides.currentPrice ?? overrides.startingPrice ?? 5000,
        reservePrice: overrides.reservePrice,
        seller: sellerId,
        endTime,
        status: overrides.status || 'active',
        tags: overrides.tags || ['watch', 'rolex', 'luxury', 'submariner'],
        bidCount: overrides.bidCount ?? 0,
    });
}

export async function createEndedAuctionWithWinner({ sellerId, winnerId, winningAmount = 9000 }) {
    const auction = await createActiveAuction(sellerId, {
        status: 'ended',
        endTime: new Date(Date.now() - 60 * 1000),
        currentPrice: winningAmount,
        winner: winnerId,
    });

    await Bid.create({
        auction: auction._id,
        bidder: winnerId,
        amount: winningAmount,
        status: 'won',
    });

    return auction;
}

export async function createPendingOrder({ buyerId, sellerId, auctionId, amount = 9000 }) {
    return Order.create({
        auction: auctionId,
        buyer: buyerId,
        seller: sellerId,
        amount,
        status: 'pending',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    });
}
