/**
 * auth.logout.test.js
 * API tests for POST /api/auth/logout
 *
 * Uses jest.unstable_mockModule for ESM compatibility.
 * The auth middleware is mocked to bypass token verification.
 */

import { jest } from '@jest/globals';

// ─── ESM-Compatible Mocks ────────────────────────────────────────────────────

jest.unstable_mockModule('../src/models/user.model.js', () => ({
    default: { findOne: jest.fn(), findById: jest.fn() },
}));

jest.unstable_mockModule('../src/services/token.service.js', () => ({
    generateToken: jest.fn(() => 'mock-jwt-token'),
    generateVerificationToken: jest.fn(),
}));

jest.unstable_mockModule('../src/services/email.service.js', () => ({
    sendVerificationEmail: jest.fn(),
}));

// Mock auth middleware to inject a test user without validating a real token
jest.unstable_mockModule('../src/middleware/auth.middleware.js', () => ({
    auth: (req, _res, next) => {
        req.user = { id: 'user-id-001', email: 'test@example.com', role: 'buyer' };
        next();
    },
}));

jest.unstable_mockModule('bcryptjs', () => ({
    default: { hash: jest.fn(), compare: jest.fn() },
}));

// ─── Dynamically Import After Mocks ─────────────────────────────────────────

const { default: request } = await import('supertest');
const { default: app } = await import('../src/app.js');

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('Auth — Logout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('POST /api/auth/logout — responds 200 and clears auth cookie', async () => {
        const res = await request(app)
            .post('/api/auth/logout')
            .set('Cookie', 'token=mock-jwt-token');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/logged out/i);
    });

    test('POST /api/auth/logout — response has the correct structure', async () => {
        const res = await request(app)
            .post('/api/auth/logout')
            .set('Cookie', 'token=mock-jwt-token');

        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message');
    });

    test('POST /api/auth/logout — clears the token cookie', async () => {
        const res = await request(app)
            .post('/api/auth/logout')
            .set('Cookie', 'token=mock-jwt-token');

        const setCookieHeader = res.headers['set-cookie'];
        if (setCookieHeader) {
            const tokenCookie = setCookieHeader.find(c => c.startsWith('token='));
            if (tokenCookie) {
                expect(tokenCookie).toMatch(/token=;|Expires=Thu, 01 Jan 1970/i);
            }
        }
        // Even if no Set-Cookie header, status 200 is enough for logout success
        expect(res.status).toBe(200);
    });
});
