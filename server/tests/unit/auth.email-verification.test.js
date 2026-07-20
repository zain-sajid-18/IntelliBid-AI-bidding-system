/**
 * auth.email-verification.test.js
 * API tests for GET /api/auth/verify-email
 *
 * Uses jest.unstable_mockModule for ESM (type: module) compatibility.
 */

import { jest } from '@jest/globals';

// ─── ESM-Compatible Mocks ────────────────────────────────────────────────────

const mockFindOne = jest.fn();
const mockSave = jest.fn().mockResolvedValue(true);

jest.unstable_mockModule('../src/models/user.model.js', () => ({
    default: { findOne: mockFindOne },
}));

jest.unstable_mockModule('../src/services/token.service.js', () => ({
    generateToken: jest.fn(),
    generateVerificationToken: jest.fn(),
}));

jest.unstable_mockModule('../src/services/email.service.js', () => ({
    sendVerificationEmail: jest.fn(),
}));

jest.unstable_mockModule('bcryptjs', () => ({
    default: { hash: jest.fn(), compare: jest.fn() },
}));

// ─── Dynamically Import After Mocks ─────────────────────────────────────────

const { default: request } = await import('supertest');
const { default: app } = await import('../src/app.js');

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('Auth — Email Verification', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/auth/verify-email — success with valid token', async () => {
        mockFindOne.mockResolvedValue({
            _id: 'user-001',
            email: 'user@example.com',
            isVerified: false,
            emailVerificationToken: 'valid-token',
            emailVerificationExpires: new Date(Date.now() + 60000),
            save: mockSave,
        });

        const res = await request(app)
            .get('/api/auth/verify-email')
            .query({ token: 'valid-token' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/email verified/i);
    });

    test('GET /api/auth/verify-email — fails with invalid or unknown token', async () => {
        mockFindOne.mockResolvedValue(null);

        const res = await request(app)
            .get('/api/auth/verify-email')
            .query({ token: 'bad-token' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/invalid or expired/i);
    });

    test('GET /api/auth/verify-email — fails with expired token (no user returned from DB)', async () => {
        mockFindOne.mockResolvedValue(null); // DB returns null because token is expired

        const res = await request(app)
            .get('/api/auth/verify-email')
            .query({ token: 'expired-token' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test('GET /api/auth/verify-email — marks user as verified in DB', async () => {
        const mockUser = {
            _id: 'user-002',
            email: 'verify@example.com',
            isVerified: false,
            emailVerificationToken: 'token-abc',
            emailVerificationExpires: new Date(Date.now() + 60000),
            save: mockSave,
        };
        mockFindOne.mockResolvedValue(mockUser);

        await request(app).get('/api/auth/verify-email').query({ token: 'token-abc' });

        expect(mockUser.isVerified).toBe(true);
        expect(mockSave).toHaveBeenCalledTimes(1);
    });
});
