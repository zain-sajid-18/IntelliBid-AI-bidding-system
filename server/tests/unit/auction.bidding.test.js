/**
 * auction.bidding.test.js
 * Unit tests for bid placement logic:
 *   - Place bid
 *   - Bid must be higher than current price
 *   - Detect winner logic
 *   - Auction end process
 */

import { jest } from '@jest/globals';

// ─── Simulated Bid Service ───────────────────────────────────────────────────

function placeBid({ auction, bidderId, amount }) {
    if (!auction) throw new Error('Auction not found');
    if (auction.status !== 'active') throw new Error('Auction is not active');
    if (new Date(auction.auctionEndTime) < new Date()) throw new Error('Auction has ended');
    if (amount <= auction.currentPrice) throw new Error('Bid must be higher than current price');
    if (auction.seller.toString() === bidderId) throw new Error('Sellers cannot bid on their own auction');

    // Record the bid
    auction.bids.push({ bidder: bidderId, amount, timestamp: new Date() });
    auction.currentPrice = amount;
    return { success: true, currentPrice: amount };
}

function endAuction(auction) {
    if (!auction) throw new Error('Auction not found');
    auction.status = 'ended';

    if (auction.bids.length === 0) {
        auction.winner = null;
        return { status: 'ended', winner: null, message: 'No bids placed' };
    }

    // Winner is the highest bidder (last bid in sorted order)
    const highestBid = [...auction.bids].sort((a, b) => b.amount - a.amount)[0];

    // Check reserve price
    if (auction.reservePrice && highestBid.amount < auction.reservePrice) {
        auction.winner = null;
        return { status: 'ended', winner: null, message: 'Reserve price not met' };
    }

    auction.winner = highestBid.bidder;
    return { status: 'ended', winner: highestBid.bidder, winningBid: highestBid.amount };
}

// ─── Sample Data ─────────────────────────────────────────────────────────────

function makeAuction(overrides = {}) {
    return {
        _id: 'auction-001',
        title: 'Air Jordan 1 Chicago',
        seller: 'seller-id-001',
        currentPrice: 5000,
        startingBid: 5000,
        reservePrice: 8000,
        auctionEndTime: new Date(Date.now() + 3600 * 1000).toISOString(),
        status: 'active',
        bids: [],
        winner: null,
        ...overrides,
    };
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('Auction — Place Bid', () => {
    test('places bid successfully when amount is higher than current price', () => {
        const auction = makeAuction();
        const result = placeBid({ auction, bidderId: 'buyer-001', amount: 6000 });

        expect(result.success).toBe(true);
        expect(result.currentPrice).toBe(6000);
        expect(auction.bids).toHaveLength(1);
        expect(auction.currentPrice).toBe(6000);
    });

    test('fails when bid is equal to current price', () => {
        const auction = makeAuction();
        expect(() => placeBid({ auction, bidderId: 'buyer-001', amount: 5000 })).toThrow(
            'Bid must be higher than current price'
        );
    });

    test('fails when bid is lower than current price', () => {
        const auction = makeAuction();
        expect(() => placeBid({ auction, bidderId: 'buyer-001', amount: 4000 })).toThrow(
            'Bid must be higher than current price'
        );
    });

    test('fails when auction is not active (already ended)', () => {
        const auction = makeAuction({ status: 'ended' });
        expect(() => placeBid({ auction, bidderId: 'buyer-001', amount: 6000 })).toThrow(
            'Auction is not active'
        );
    });

    test('fails when auction end time has passed', () => {
        const auction = makeAuction({
            auctionEndTime: new Date(Date.now() - 1000).toISOString(),
        });
        expect(() => placeBid({ auction, bidderId: 'buyer-001', amount: 7000 })).toThrow(
            'Auction has ended'
        );
    });

    test('fails when seller tries to bid on their own auction', () => {
        const auction = makeAuction();
        expect(() =>
            placeBid({ auction, bidderId: 'seller-id-001', amount: 7000 })
        ).toThrow("Sellers cannot bid on their own auction");
    });

    test('records multiple bids in order', () => {
        const auction = makeAuction();
        placeBid({ auction, bidderId: 'buyer-001', amount: 5500 });
        placeBid({ auction, bidderId: 'buyer-002', amount: 6000 });
        placeBid({ auction, bidderId: 'buyer-001', amount: 7500 });

        expect(auction.bids).toHaveLength(3);
        expect(auction.currentPrice).toBe(7500);
    });
});

describe('Auction — End Process & Winner Detection', () => {
    test('ends auction and correctly identifies the winner', () => {
        const auction = makeAuction({ reservePrice: 0 });
        placeBid({ auction, bidderId: 'buyer-001', amount: 5500 });
        placeBid({ auction, bidderId: 'buyer-002', amount: 8500 });

        const result = endAuction(auction);

        expect(result.status).toBe('ended');
        expect(result.winner).toBe('buyer-002');
        expect(result.winningBid).toBe(8500);
    });

    test('ends auction with no winner if no bids were placed', () => {
        const auction = makeAuction();
        const result = endAuction(auction);

        expect(result.status).toBe('ended');
        expect(result.winner).toBeNull();
        expect(result.message).toMatch(/no bids/i);
    });

    test('ends auction with no winner when reserve price is not met', () => {
        const auction = makeAuction({ reservePrice: 10000 });
        placeBid({ auction, bidderId: 'buyer-001', amount: 6000 });

        const result = endAuction(auction);

        expect(result.status).toBe('ended');
        expect(result.winner).toBeNull();
        expect(result.message).toMatch(/reserve price not met/i);
    });

    test('sets auction status to ended after end process', () => {
        const auction = makeAuction({ reservePrice: 0 });
        placeBid({ auction, bidderId: 'buyer-001', amount: 5500 });
        endAuction(auction);

        expect(auction.status).toBe('ended');
    });
});
