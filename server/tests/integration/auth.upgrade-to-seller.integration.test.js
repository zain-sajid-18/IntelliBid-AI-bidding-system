/**
 * Integration: Auth Route → upgradeToSeller Controller → User Model → JWT re-issue
 */
import { describe, test, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import User from '../../../src/models/user.model.js';
import { connectTestDB, disconnectTestDB, clearTestDB } from '../setup/db.js';
import { getTestApp } from '../setup/bootstrap.js';
import { createVerifiedUser } from '../helpers/factories.js';
import { buildAuthCookie, extractCookies } from '../helpers/auth.js';

describe('Integration — Buyer Upgrade to Seller', () => {
    let app;

    beforeAll(async () => {
        await connectTestDB();
        app = await getTestApp();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    afterEach(async () => {
        await clearTestDB();
    });

    test('POST /api/auth/upgrade-to-seller updates role and re-issues auth cookie', async () => {
        const { user: buyer } = await createVerifiedUser({ role: 'buyer', email: 'upgrade.buyer@gmail.com' });

        const res = await request(app)
            .post('/api/auth/upgrade-to-seller')
            .set('Cookie', buildAuthCookie(buyer));

        expect(res.status).toBe(200);
        expect(res.body.user.role).toBe('seller');

        const updatedUser = await User.findById(buyer._id);
        expect(updatedUser.role).toBe('seller');

        const cookies = extractCookies(res.headers['set-cookie']);
        const meRes = await request(app)
            .get('/api/auth/me')
            .set('Cookie', `token=${cookies.token}`);

        expect(meRes.body.user.role).toBe('seller');
    });

    test('POST /api/auth/upgrade-to-seller rejects users who are already sellers', async () => {
        const { user: seller } = await createVerifiedUser({ role: 'seller', email: 'already.seller@gmail.com' });

        const res = await request(app)
            .post('/api/auth/upgrade-to-seller')
            .set('Cookie', buildAuthCookie(seller));

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/already a seller/i);
    });
});
