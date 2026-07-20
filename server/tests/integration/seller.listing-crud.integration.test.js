/**
 * Integration: Seller Route → Auth → Listing Controller → Listing Service → Auction Model
 */
import { jest, describe, test, expect, beforeAll, afterAll, afterEach, beforeEach } from '@jest/globals';
import request from 'supertest';
import Auction from '../../../src/models/auction.model.js';
import { connectTestDB, disconnectTestDB, clearTestDB } from '../setup/db.js';
import { getTestApp } from '../setup/bootstrap.js';
import { createVerifiedUser, createActiveAuction } from '../helpers/factories.js';
import { buildAuthCookie } from '../helpers/auth.js';

describe('Integration — Seller Listing CRUD', () => {
    let app;
    let seller;
    let otherSeller;

    beforeAll(async () => {
        await connectTestDB();
        app = await getTestApp();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    beforeEach(async () => {
        await clearTestDB();
        ({ user: seller } = await createVerifiedUser({ role: 'seller', email: 'seller.crud@gmail.com' }));
        ({ user: otherSeller } = await createVerifiedUser({ role: 'seller', email: 'seller.other@gmail.com' }));
    });

    test('POST /api/seller/listings creates auction via controller + service + DB', async () => {
        const res = await request(app)
            .post('/api/seller/listings')
            .set('Cookie', buildAuthCookie(seller))
            .field('title', 'Polaroid SX-70 Alpha')
            .field('description', 'Classic instant camera in working condition with original leather case.')
            .field('category', 'Electronics')
            .field('startingPrice', '1200')
            .field('durationDays', '5')
            .field('tags', 'polaroid,camera,vintage')
            .attach('images', Buffer.from('fake-image'), 'camera.jpg');

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.title).toBe('Polaroid SX-70 Alpha');

        const stored = await Auction.findById(res.body.data._id);
        expect(stored.seller.toString()).toBe(seller._id.toString());
        expect(stored.currentPrice).toBe(1200);
        expect(stored.status).toBe('active');
        expect(stored.images[0]).toMatch(/cdn.test/);
    });

    test('GET /api/seller/listings returns only seller-owned listings', async () => {
        await createActiveAuction(seller._id, { title: 'Seller A Listing' });
        await createActiveAuction(otherSeller._id, { title: 'Seller B Listing' });

        const res = await request(app)
            .get('/api/seller/listings')
            .set('Cookie', buildAuthCookie(seller));

        expect(res.status).toBe(200);
        expect(res.body.listings).toHaveLength(1);
        expect(res.body.listings[0].title).toBe('Seller A Listing');
    });

    test('PUT /api/seller/listings/:id updates owned listing', async () => {
        const listing = await createActiveAuction(seller._id);

        const res = await request(app)
            .put(`/api/seller/listings/${listing._id}`)
            .set('Cookie', buildAuthCookie(seller))
            .send({ title: 'Updated Auction Title', description: 'Updated description with more detail.' });

        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe('Updated Auction Title');

        const refreshed = await Auction.findById(listing._id);
        expect(refreshed.title).toBe('Updated Auction Title');
    });

    test('DELETE /api/seller/listings/:id cancels listing without bids', async () => {
        const listing = await createActiveAuction(seller._id, { bidCount: 0 });

        const res = await request(app)
            .delete(`/api/seller/listings/${listing._id}`)
            .set('Cookie', buildAuthCookie(seller));

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/cancelled/i);

        const refreshed = await Auction.findById(listing._id);
        expect(refreshed.status).toBe('cancelled');
    });

    test('DELETE /api/seller/listings/:id rejects cancellation when bids exist', async () => {
        const listing = await createActiveAuction(seller._id, { bidCount: 2 });

        const res = await request(app)
            .delete(`/api/seller/listings/${listing._id}`)
            .set('Cookie', buildAuthCookie(seller));

        expect(res.status).toBe(500);
        expect(res.body.message).toMatch(/already has bids/i);
    });
});
