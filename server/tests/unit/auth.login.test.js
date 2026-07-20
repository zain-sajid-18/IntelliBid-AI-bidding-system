/**
 * auth.login.test.js
 * API tests for POST /api/auth/login
 *
 * Uses jest.unstable_mockModule for ESM (type: module) compatibility.
 */

import { jest } from '@jest/globals';

// ─── ESM-Compatible Mocks ────────────────────────────────────────────────────

const mockFindOne = jest.fn();

jest.unstable_mockModule('../src/models/user.model.js', () => ({
    default: { findOne: mockFindOne },
}));

jest.unstable_mockModule('../src/services/token.service.js', () => ({
    generateToken: jest.fn(() => 'mock-jwt-token'),
    generateVerificationToken: jest.fn(),
}));

jest.unstable_mockModule('../src/services/email.service.js', () => ({
    sendVerificationEmail: jest.fn(),
}));

const mockBcryptCompare = jest.fn();
jest.unstable_mockModule('bcryptjs', () => ({
    default: {
        hash: jest.fn().mockResolvedValue('hashed-password'),
        compare: mockBcryptCompare,
    },
}));

// ─── Dynamically Import After Mocks ─────────────────────────────────────────

const { default: request } = await import('supertest');
const { default: app } = await import('../src/app.js');

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('Auth — Login', () => {
    const credentials = { email: 'john.doe@example.com', password: 'password123' };

    const mockUser = {
        _id: 'user-id-001',
        email: credentials.email,
        password: 'hashed-password',
        role: 'buyer',
        isVerified: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('POST /api/auth/login — success with valid credentials', async () => {
        mockFindOne.mockResolvedValue(mockUser);
        mockBcryptCompare.mockResolvedValue(true);

        const res = await request(app).post('/api/auth/login').send(credentials);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/logged in/i);
        expect(res.body.user.email).toBe(credentials.email);
    });

    test('POST /api/auth/login — fails when user not found', async () => {
        mockFindOne.mockResolvedValue(null);

        const res = await request(app).post('/api/auth/login').send(credentials);

        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/invalid email or password/i);
    });

    test('POST /api/auth/login — fails with wrong password', async () => {
        mockFindOne.mockResolvedValue(mockUser);
        mockBcryptCompare.mockResolvedValue(false);

        const res = await request(app).post('/api/auth/login').send(credentials);

        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/invalid email or password/i);
    });

    test('POST /api/auth/login — fails when email is not verified', async () => {
        mockFindOne.mockResolvedValue({ ...mockUser, isVerified: false });
        mockBcryptCompare.mockResolvedValue(true);

        const res = await request(app).post('/api/auth/login').send(credentials);

        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/verify your email/i);
    });

    test('POST /api/auth/login — fails with missing email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ password: 'secret' });

        expect(res.status).toBe(400);
    });

    test('POST /api/auth/login — fails with missing password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: credentials.email });

        expect(res.status).toBe(400);
    });

    test('POST /api/auth/login — fails with invalid email format', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bad_email', password: 'password123' });

        expect(res.status).toBe(400);
    });

    test('POST /api/auth/login — sets HTTP-only cookie on success', async () => {
        mockFindOne.mockResolvedValue(mockUser);
        mockBcryptCompare.mockResolvedValue(true);

        const res = await request(app).post('/api/auth/login').send(credentials);

        expect(res.status).toBe(200);
        const cookieHeader = res.headers['set-cookie'];
        expect(cookieHeader).toBeDefined();
        expect(cookieHeader[0]).toMatch(/token=/);
    });
});
