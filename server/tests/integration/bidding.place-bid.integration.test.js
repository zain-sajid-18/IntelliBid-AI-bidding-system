/**
 * Integration: Buyer Route → Auth Middleware → placeBidService → Auction + Bid Models → Socket
 */
import { jest, describe, test, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import Bid from '../../../src/models/bid.model.js';
import Auction from '../../../src/models/auction.model.js';
import { connectTestDB, disconnectTestDB, clearTestDB } from '../setup/db.js';
import { getTestApp, mockBroadcastBid } from '../setup/bootstrap.js';
import { createVerifiedUser, createActiveAuction } from '../helpers/factories.js';
import { buildAuthCookie } from '../helpers/auth.js';

describe('Integration — Bidding Flow (Route → Service → Database)', () => {
    let app;
    let seller;
    let buyerOne;
    let buyerTwo;
    let auction;

    beforeAll(async () => {
        await connectTestDB();
        app = await getTestApp();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await clearTestDB();

        ({ user: seller } = await createVerifiedUser({ role: 'seller', email: 'seller.bid@gmail.com' }));
        ({ user: buyerOne } = await createVerifiedUser({ email: 'buyer.one@gmail.com' }));
        ({ user: buyerTwo } = await createVerifiedUser({ email: 'buyer.two@gmail.com' }));
        auction = await createActiveAuction(seller._id);
    });

    test('places a bid and persists auction price + bid record atomically', async () => {
        const res = await request(app)
            .post('/api/buyer/bids/place')
            .set('Cookie', buildAuthCookie(buyerOne))
            .send({ auctionId: auction._id.toString(), bidAmount: 5500 });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.newCurrentPrice).toBe(5500);

        const updatedAuction = await Auction.findById(auction._id);
        expect(updatedAuction.currentPrice).toBe(5500);
        expect(updatedAuction.bidCount).toBe(1);

        const winningBid = await Bid.findOne({ auction: auction._id, status: 'winning' });
        expect(winningBid.bidder.toString()).toBe(buyerOne._id.toString());
        expect(winningBid.amount).toBe(5500);
        expect(mockBroadcastBid).toHaveBeenCalledTimes(1);
    });

    test('outbids previous winner and marks prior bid as outbid', async () => {
        await request(app)
            .post('/api/buyer/bids/place')
            .set('Cookie', buildAuthCookie(buyerOne))
            .send({ auctionId: auction._id.toString(), bidAmount: 5500 });

        const res = await request(app)
            .post('/api/buyer/bids/place')
            .set('Cookie', buildAuthCookie(buyerTwo))
            .send({ auctionId: auction._id.toString(), bidAmount: 6000 });

        expect(res.status).toBe(201);

        const bids = await Bid.find({ auction: auction._id }).sort({ amount: -1 });
        expect(bids).toHaveLength(2);
        expect(bids[0].status).toBe('winning');
        expect(bids[0].bidder.toString()).toBe(buyerTwo._id.toString());
        expect(bids[1].status).toBe('outbid');

        const latestBroadcast = mockBroadcastBid.mock.calls.at(-1)[0];
        expect(latestBroadcast.outbidUserId).toBe(buyerOne._id.toString());
    });

    test('rejects seller bidding on own auction through service validation', async () => {
        const res = await request(app)
            .post('/api/buyer/bids/place')
            .set('Cookie', buildAuthCookie(seller))
            .send({ auctionId: auction._id.toString(), bidAmount: 6000 });

        expect(res.status).toBe(500);
        expect(res.body.message).toMatch(/cannot bid on your own auction/i);
        expect(await Bid.countDocuments({ auction: auction._id })).toBe(0);
    });

    test('rejects bid lower than current price', async () => {
        const res = await request(app)
            .post('/api/buyer/bids/place')
            .set('Cookie', buildAuthCookie(buyerOne))
            .send({ auctionId: auction._id.toString(), bidAmount: 4000 });

        expect(res.status).toBe(500);
        expect(res.body.message).toMatch(/greater than current price/i);
    });

    test('GET /api/buyer/bids/active returns bids linked to live auctions', async () => {
        await request(app)
            .post('/api/buyer/bids/place')
            .set('Cookie', buildAuthCookie(buyerOne))
            .send({ auctionId: auction._id.toString(), bidAmount: 5500 });

        const res = await request(app)
            .get('/api/buyer/bids/active')
            .set('Cookie', buildAuthCookie(buyerOne));

        expect(res.status).toBe(200);
        expect(res.body.bids).toHaveLength(1);
        expect(res.body.bids[0].auction.title).toMatch(/Rolex/i);
        expect(res.body.bids[0].status).toBe('winning');
    });
});
