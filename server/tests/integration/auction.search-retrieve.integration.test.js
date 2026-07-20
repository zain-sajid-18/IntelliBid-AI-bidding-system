/**
 * Integration: Auction Route → Controller → Auction Model (search + detail retrieval)
 */
import { describe, test, expect, beforeAll, afterAll, afterEach, beforeEach } from '@jest/globals';
import request from 'supertest';
import Bid from '../../../src/models/bid.model.js';
import { connectTestDB, disconnectTestDB, clearTestDB } from '../setup/db.js';
import { getTestApp } from '../setup/bootstrap.js';
import { createVerifiedUser, createActiveAuction } from '../helpers/factories.js';

describe('Integration — Auction Search & Retrieval', () => {
    let app;
    let seller;

    beforeAll(async () => {
        await connectTestDB();
        app = await getTestApp();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    beforeEach(async () => {
        await clearTestDB();
        ({ user: seller } = await createVerifiedUser({ role: 'seller', email: 'search.seller@gmail.com' }));

        await createActiveAuction(seller._id, {
            title: 'Rolex Submariner Black Dial',
            tags: ['rolex', 'watch', 'luxury'],
            category: 'Watches',
        });
        await createActiveAuction(seller._id, {
            title: 'Sony Walkman TPS-L2',
            tags: ['sony', 'electronics', 'vintage'],
            category: 'Electronics',
        });
    });

    test('GET /api/auction/search finds auctions by keyword across title/tags', async () => {
        const res = await request(app).get('/api/auction/search').query({ q: 'rolex' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        expect(res.body.data[0].title).toMatch(/Rolex/i);
    });

    test('GET /api/auction/search filters by category', async () => {
        const res = await request(app)
            .get('/api/auction/search')
            .query({ category: 'Electronics' });

        expect(res.status).toBe(200);
        expect(res.body.data.every(item => item.category === 'Electronics')).toBe(true);
    });

    test('GET /api/auction/:id returns auction detail with bid history', async () => {
        const auction = await createActiveAuction(seller._id, { title: 'Detail View Auction' });
        const { user: bidder } = await createVerifiedUser({ email: 'bidder.search@gmail.com' });

        await Bid.create({
            auction: auction._id,
            bidder: bidder._id,
            amount: 5500,
            status: 'winning',
        });

        const res = await request(app).get(`/api/auction/${auction._id}`);

        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe('Detail View Auction');
        expect(res.body.data.bidHistory).toHaveLength(1);
        expect(res.body.data.bidHistory[0].amount).toBe(5500);
        expect(res.body.data.bidHistory[0].bidderName).toMatch(/Integration T\./);
    });

    test('GET /api/auction/:id returns 404 for unknown auction', async () => {
        const res = await request(app).get('/api/auction/507f1f77bcf86cd799439011');

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/not found/i);
    });
});
