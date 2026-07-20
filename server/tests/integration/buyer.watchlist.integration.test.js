/**
 * Integration: Buyer Route → Auth → Watchlist Service → User.watchlist ↔ Auction Model
 */
import { describe, test, expect, beforeAll, afterAll, afterEach, beforeEach } from '@jest/globals';
import request from 'supertest';
import User from '../../../src/models/user.model.js';
import { connectTestDB, disconnectTestDB, clearTestDB } from '../setup/db.js';
import { getTestApp } from '../setup/bootstrap.js';
import { createVerifiedUser, createActiveAuction } from '../helpers/factories.js';
import { buildAuthCookie } from '../helpers/auth.js';

describe('Integration — Buyer Watchlist Flow', () => {
    let app;
    let buyer;
    let auction;

    beforeAll(async () => {
        await connectTestDB();
        app = await getTestApp();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    beforeEach(async () => {
        await clearTestDB();
        ({ user: buyer } = await createVerifiedUser({ email: 'watchlist.buyer@gmail.com' }));
        const { user: seller } = await createVerifiedUser({ role: 'seller', email: 'watchlist.seller@gmail.com' });
        auction = await createActiveAuction(seller._id, { title: 'Omega Speedmaster Professional' });
    });

    afterEach(async () => {
        await clearTestDB();
    });

    test('POST /api/buyer/watchlist/toggle adds auction to user watchlist in DB', async () => {
        const res = await request(app)
            .post('/api/buyer/watchlist/toggle')
            .set('Cookie', buildAuthCookie(buyer))
            .send({ auctionId: auction._id.toString() });

        expect(res.status).toBe(200);
        expect(res.body.added).toBe(true);

        const refreshedUser = await User.findById(buyer._id);
        expect(refreshedUser.watchlist.map(String)).toContain(auction._id.toString());
    });

    test('toggling twice removes auction from watchlist', async () => {
        const cookie = buildAuthCookie(buyer);

        await request(app)
            .post('/api/buyer/watchlist/toggle')
            .set('Cookie', cookie)
            .send({ auctionId: auction._id.toString() });

        const removeRes = await request(app)
            .post('/api/buyer/watchlist/toggle')
            .set('Cookie', cookie)
            .send({ auctionId: auction._id.toString() });

        expect(removeRes.body.added).toBe(false);

        const refreshedUser = await User.findById(buyer._id);
        expect(refreshedUser.watchlist).toHaveLength(0);
    });

    test('GET /api/buyer/watchlist returns populated active auctions', async () => {
        await User.findByIdAndUpdate(buyer._id, { $push: { watchlist: auction._id } });

        const res = await request(app)
            .get('/api/buyer/watchlist')
            .set('Cookie', buildAuthCookie(buyer));

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].title).toBe('Omega Speedmaster Professional');
    });

    test('GET /api/buyer/dashboard/stats reflects saved watchlist count', async () => {
        await User.findByIdAndUpdate(buyer._id, { $push: { watchlist: auction._id } });

        const res = await request(app)
            .get('/api/buyer/dashboard/stats')
            .set('Cookie', buildAuthCookie(buyer));

        expect(res.status).toBe(200);
        expect(res.body.data.savedItems).toBe(1);
    });
});
