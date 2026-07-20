/**
 * Integration: Auth Middleware → JWT Verification → User Status Check → Protected Route
 */
import { jest, describe, test, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import { connectTestDB, disconnectTestDB, clearTestDB } from '../setup/db.js';
import { getTestApp } from '../setup/bootstrap.js';
import { createVerifiedUser } from '../helpers/factories.js';
import { buildAuthCookie } from '../helpers/auth.js';

describe('Integration — Auth Middleware & Protected Routes', () => {
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

    test('GET /api/auth/me returns full profile when JWT cookie is valid', async () => {
        const { user } = await createVerifiedUser({ role: 'buyer' });

        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', buildAuthCookie(user));

        expect(res.status).toBe(200);
        expect(res.body.user.id).toBe(user._id.toString());
        expect(res.body.user.role).toBe('buyer');
    });

    test('GET /api/auth/me rejects missing auth cookie', async () => {
        const res = await request(app).get('/api/auth/me');

        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/not authenticated/i);
    });

    test('GET /api/auth/me rejects invalid JWT token', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', 'token=not-a-valid-jwt');

        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/invalid token/i);
    });

    test('GET /api/auth/me blocks suspended accounts via middleware + DB lookup', async () => {
        const { user } = await createVerifiedUser({ status: 'suspended' });

        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', buildAuthCookie(user));

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/suspended/i);
    });

    test('POST /api/auth/logout clears session cookie through auth-protected route', async () => {
        const { user } = await createVerifiedUser();

        const res = await request(app)
            .post('/api/auth/logout')
            .set('Cookie', buildAuthCookie(user));

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
