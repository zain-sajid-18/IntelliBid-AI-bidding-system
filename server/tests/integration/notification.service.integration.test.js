/**
 * Integration: Notifications Route → Auth → Notification Controller → Notification Model
 */
import { jest, describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import Notification from '../../../src/models/notification.model.js';
import { connectTestDB, disconnectTestDB, clearTestDB } from '../setup/db.js';
import { getTestApp } from '../setup/bootstrap.js';
import { createVerifiedUser } from '../helpers/factories.js';
import { buildAuthCookie } from '../helpers/auth.js';

describe('Integration — Notification System Flow', () => {
    let app;
    let user;
    let otherUser;

    beforeAll(async () => {
        await connectTestDB();
        app = await getTestApp();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    beforeEach(async () => {
        await clearTestDB();

        ({ user } = await createVerifiedUser({ email: 'notify.user@gmail.com' }));
        ({ user: otherUser } = await createVerifiedUser({ email: 'notify.other@gmail.com' }));
    });

    test('GET /api/notifications retrieves notifications for the authenticated user', async () => {
        // Seed notifications
        await Notification.create([
            { user: user._id, type: 'outbid', message: 'You have been outbid!', read: false },
            { user: user._id, type: 'auction_won', message: 'You won the auction!', read: true },
            { user: otherUser._id, type: 'outbid', message: 'Other user outbid!', read: false }
        ]);

        const res = await request(app)
            .get('/api/notifications')
            .set('Cookie', buildAuthCookie(user));

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.notifications).toHaveLength(2);
        
        // Ensure they belong to 'user'
        const allMatchUser = res.body.notifications.every(n => n.user.toString() === user._id.toString());
        expect(allMatchUser).toBe(true);
    });

    test('PUT /api/notifications/:id/read marks a specific notification as read', async () => {
        const notif = await Notification.create({
            user: user._id,
            type: 'system',
            message: 'Welcome to IntelliBid',
            read: false
        });

        const res = await request(app)
            .put(`/api/notifications/${notif._id}/read`)
            .set('Cookie', buildAuthCookie(user));

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.read).toBe(true);

        const updated = await Notification.findById(notif._id);
        expect(updated.read).toBe(true);
    });
});
