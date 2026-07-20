/**
 * Integration: Auth Route → Controller → Service → User Model → Email Service
 *
 * Verifies the full registration → email verification → login workflow using a real
 * in-memory MongoDB while mocking only the external email provider.
 */
import { jest, describe, test, expect, beforeAll, afterAll, afterEach, beforeEach } from '@jest/globals';
import request from 'supertest';
import User from '../../../src/models/user.model.js';
import { connectTestDB, disconnectTestDB, clearTestDB } from '../setup/db.js';
import { getTestApp, mockSendVerificationEmail } from '../setup/bootstrap.js';
import { extractCookies } from '../helpers/auth.js';

describe('Integration — Auth Registration → Verification → Login Flow', () => {
    let app;

    const signupPayload = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe.integration@gmail.com',
        password: 'SecurePass123',
        role: 'buyer',
    };

    beforeAll(async () => {
        await connectTestDB();
        app = await getTestApp();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(async () => {
        await clearTestDB();
    });

    test('completes signup, verifies email, and logs in with real service + DB stack', async () => {
        const signupRes = await request(app).post('/api/auth/signup').send(signupPayload);

        expect(signupRes.status).toBe(201);
        expect(signupRes.body.success).toBe(true);
        expect(mockSendVerificationEmail).toHaveBeenCalledTimes(1);

        const userInDb = await User.findOne({ email: signupPayload.email });
        expect(userInDb).not.toBeNull();
        expect(userInDb.isVerified).toBe(false);
        expect(userInDb.emailVerificationToken).toBeTruthy();

        const verifyRes = await request(app)
            .get('/api/auth/verify-email')
            .query({ token: userInDb.emailVerificationToken });

        expect(verifyRes.status).toBe(200);
        expect(verifyRes.body.message).toMatch(/verified/i);

        const verifiedUser = await User.findById(userInDb._id);
        expect(verifiedUser.isVerified).toBe(true);

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: signupPayload.email, password: signupPayload.password });

        expect(loginRes.status).toBe(200);
        expect(loginRes.body.user.email).toBe(signupPayload.email);

        const cookies = extractCookies(loginRes.headers['set-cookie']);
        expect(cookies.token).toBeTruthy();

        const meRes = await request(app)
            .get('/api/auth/me')
            .set('Cookie', `token=${cookies.token}`);

        expect(meRes.status).toBe(200);
        expect(meRes.body.user.email).toBe(signupPayload.email);
        expect(meRes.body.user.firstName).toBe('Jane');
    });

    test('rejects login before email verification (service + validation integration)', async () => {
        await request(app).post('/api/auth/signup').send(signupPayload);

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: signupPayload.email, password: signupPayload.password });

        expect(loginRes.status).toBe(401);
        expect(loginRes.body.message).toMatch(/verify your email/i);
    });

    test('rejects duplicate registration at service + model layer', async () => {
        await request(app).post('/api/auth/signup').send(signupPayload);

        const duplicateRes = await request(app).post('/api/auth/signup').send(signupPayload);

        expect(duplicateRes.status).toBe(400);
        expect(duplicateRes.body.message).toMatch(/already registered/i);
        expect(await User.countDocuments({ email: signupPayload.email })).toBe(1);
    });
});
