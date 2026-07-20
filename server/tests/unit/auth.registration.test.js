/**
 * auth.registration.test.js
 * API tests for POST /api/auth/signup
 *
 * Uses jest.unstable_mockModule for ESM compatibility.
 * Modules are dynamically imported AFTER mocking.
 */

import { jest } from '@jest/globals';

// ─── ESM-Compatible Mocks ────────────────────────────────────────────────────

const mockFindOne = jest.fn();
const mockCreate = jest.fn();

jest.unstable_mockModule('../src/models/user.model.js', () => ({
    default: { findOne: mockFindOne, create: mockCreate },
}));

jest.unstable_mockModule('../src/services/token.service.js', () => ({
    generateToken: jest.fn(() => 'mock-jwt-token'),
    generateVerificationToken: jest.fn(() => 'mock-verification-token'),
}));

jest.unstable_mockModule('../src/services/email.service.js', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
}));

jest.unstable_mockModule('bcryptjs', () => ({
    default: {
        hash: jest.fn().mockResolvedValue('hashed-password'),
        compare: jest.fn(),
    },
}));

// ─── Dynamically Import App After Mocks ─────────────────────────────────────

const { default: request } = await import('supertest');
const { default: app } = await import('../src/app.js');

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('Auth — Registration', () => {
    const validUser = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'securePass123',
        role: 'buyer',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('POST /api/auth/signup — success with valid data', async () => {
        mockFindOne.mockResolvedValue(null);
        mockCreate.mockResolvedValue({
            _id: 'user123',
            email: validUser.email,
            role: validUser.role,
        });

        const res = await request(app).post('/api/auth/signup').send(validUser);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/check your email/i);
        expect(res.body.user.email).toBe(validUser.email);
    });

    test('POST /api/auth/signup — fails when email already registered', async () => {
        mockFindOne.mockResolvedValue({ email: validUser.email });

        const res = await request(app).post('/api/auth/signup').send(validUser);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/email already registered/i);
    });

    test('POST /api/auth/signup — fails with invalid email format', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ ...validUser, email: 'not-an-email' });

        expect(res.status).toBe(400);
    });

    test('POST /api/auth/signup — fails when password is too short', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ ...validUser, password: '123' });

        expect(res.status).toBe(400);
    });

    test('POST /api/auth/signup — fails with invalid role', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ ...validUser, role: 'superuser' });

        expect(res.status).toBe(400);
    });

    test('POST /api/auth/signup — sets HTTP-only cookie on success', async () => {
        mockFindOne.mockResolvedValue(null);
        mockCreate.mockResolvedValue({ _id: 'user123', email: validUser.email, role: validUser.role });

        const res = await request(app).post('/api/auth/signup').send(validUser);

        expect(res.status).toBe(201);
        const cookieHeader = res.headers['set-cookie'];
        expect(cookieHeader).toBeDefined();
        expect(cookieHeader[0]).toMatch(/token=/);
    });
});
