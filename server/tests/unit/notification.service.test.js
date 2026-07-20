/**
 * notification.service.test.js
 * Unit tests for:
 *   - Send notification
 *   - Fetch user notifications
 *   - Mark notifications as read
 */

import { jest } from '@jest/globals';

// ─── Mocked Notification Repository ─────────────────────────────────────────

const NotificationDB = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateMany: jest.fn(),
};

// ─── Simulated Notification Channels ─────────────────────────────────────────

const emailSender = jest.fn();
const socketEmitter = jest.fn();

// ─── Simulated Notification Service ─────────────────────────────────────────

async function sendNotification({ userId, type, title, message, channels = ['in-app'] }) {
    if (!userId) throw new Error('User ID is required');
    if (!type) throw new Error('Notification type is required');
    if (!title) throw new Error('Notification title is required');
    if (!message) throw new Error('Notification message is required');

    const validTypes = ['bid_update', 'auction_won', 'payment_success', 'payment_failed', 'complaint_update', 'system'];
    if (!validTypes.includes(type)) throw new Error(`Invalid notification type: ${type}`);

    const notification = await NotificationDB.create({
        user: userId,
        type,
        title,
        message,
        read: false,
        createdAt: new Date(),
    });

    // Send through requested channels
    const results = [];
    for (const channel of channels) {
        if (channel === 'email') {
            await emailSender({ userId, subject: title, body: message });
            results.push('email');
        }
        if (channel === 'realtime') {
            socketEmitter(`user:${userId}`, { type, title, message });
            results.push('realtime');
        }
        if (channel === 'in-app') {
            results.push('in-app');
        }
    }

    return { notification, deliveredVia: results };
}

async function fetchNotifications({ userId, onlyUnread = false, page = 1, limit = 20 } = {}) {
    if (!userId) throw new Error('User ID required to fetch notifications');
    if (page < 1) throw new Error('Page must be >= 1');

    const filter = { user: userId };
    if (onlyUnread) filter.read = false;

    const notifications = await NotificationDB.find(filter);
    return { notifications, unreadCount: notifications.filter(n => !n.read).length };
}

async function markNotificationRead({ notificationId, userId }) {
    if (!notificationId) throw new Error('Notification ID is required');
    const notification = await NotificationDB.findById(notificationId);
    if (!notification) throw new Error('Notification not found');
    if (notification.user.toString() !== userId) throw new Error('Unauthorized');

    return NotificationDB.findByIdAndUpdate(notificationId, { read: true }, { new: true });
}

async function markAllRead({ userId }) {
    if (!userId) throw new Error('User ID is required');
    return NotificationDB.updateMany({ user: userId, read: false }, { read: true });
}

// ─── Test Suite — Send Notification ────────────────────────────────────────────

describe('Notification — Send Notification', () => {
    const validPayload = {
        userId: 'user-id-001',
        type: 'bid_update',
        title: 'You have been outbid!',
        message: 'Someone placed a higher bid on Rolex Submariner. Current price: $9,000.',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        NotificationDB.create.mockResolvedValue({ _id: 'notif-001', ...validPayload, read: false });
    });

    test('sends in-app notification successfully', async () => {
        const result = await sendNotification(validPayload);

        expect(result.notification._id).toBe('notif-001');
        expect(result.deliveredVia).toContain('in-app');
        expect(NotificationDB.create).toHaveBeenCalledTimes(1);
    });

    test('sends email notification when email channel is specified', async () => {
        emailSender.mockResolvedValue(true);

        const result = await sendNotification({ ...validPayload, channels: ['email', 'in-app'] });

        expect(emailSender).toHaveBeenCalledTimes(1);
        expect(result.deliveredVia).toContain('email');
        expect(result.deliveredVia).toContain('in-app');
    });

    test('emits realtime notification via socket when realtime channel specified', async () => {
        await sendNotification({ ...validPayload, channels: ['realtime'] });

        expect(socketEmitter).toHaveBeenCalledWith(
            `user:${validPayload.userId}`,
            expect.objectContaining({ type: 'bid_update' })
        );
    });

    test('fails with invalid notification type', async () => {
        await expect(
            sendNotification({ ...validPayload, type: 'unknown_event' })
        ).rejects.toThrow('Invalid notification type: unknown_event');
    });

    test('fails when userId is missing', async () => {
        const { userId, ...withoutUser } = validPayload;
        await expect(sendNotification(withoutUser)).rejects.toThrow('User ID is required');
    });

    test('fails when title is missing', async () => {
        const { title, ...withoutTitle } = validPayload;
        await expect(sendNotification(withoutTitle)).rejects.toThrow('Notification title is required');
    });

    test('supports all valid notification types', async () => {
        const types = ['bid_update', 'auction_won', 'payment_success', 'payment_failed', 'complaint_update', 'system'];

        for (const type of types) {
            NotificationDB.create.mockResolvedValue({ _id: 'n-id', ...validPayload, type });
            const result = await sendNotification({ ...validPayload, type });
            expect(result.notification).toBeDefined();
        }
    });
});

describe('Notification — Fetch Notifications', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('fetches all notifications for a user', async () => {
        NotificationDB.find.mockResolvedValue([
            { _id: 'n1', read: true, user: 'user-id-001' },
            { _id: 'n2', read: false, user: 'user-id-001' },
            { _id: 'n3', read: false, user: 'user-id-001' },
        ]);

        const result = await fetchNotifications({ userId: 'user-id-001' });

        expect(result.notifications).toHaveLength(3);
        expect(result.unreadCount).toBe(2);
    });

    test('filters only unread notifications when onlyUnread is true', async () => {
        NotificationDB.find.mockResolvedValue([
            { _id: 'n2', read: false, user: 'user-id-001' },
        ]);

        const result = await fetchNotifications({ userId: 'user-id-001', onlyUnread: true });

        expect(NotificationDB.find).toHaveBeenCalledWith({ user: 'user-id-001', read: false });
        expect(result.notifications).toHaveLength(1);
    });

    test('fails when userId is not provided', async () => {
        await expect(fetchNotifications({})).rejects.toThrow('User ID required');
    });

    test('returns empty list when user has no notifications', async () => {
        NotificationDB.find.mockResolvedValue([]);

        const result = await fetchNotifications({ userId: 'user-id-new' });

        expect(result.notifications).toHaveLength(0);
        expect(result.unreadCount).toBe(0);
    });
});

describe('Notification — Mark as Read', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('marks single notification as read', async () => {
        NotificationDB.findById.mockResolvedValue({ _id: 'notif-001', user: 'user-id-001', read: false });
        NotificationDB.findByIdAndUpdate.mockResolvedValue({ _id: 'notif-001', user: 'user-id-001', read: true });

        const result = await markNotificationRead({ notificationId: 'notif-001', userId: 'user-id-001' });

        expect(result.read).toBe(true);
    });

    test('fails if notification does not exist', async () => {
        NotificationDB.findById.mockResolvedValue(null);

        await expect(
            markNotificationRead({ notificationId: 'nonexistent', userId: 'user-id-001' })
        ).rejects.toThrow('Notification not found');
    });

    test('fails if user does not own the notification', async () => {
        NotificationDB.findById.mockResolvedValue({ _id: 'notif-001', user: 'other-user-id', read: false });

        await expect(
            markNotificationRead({ notificationId: 'notif-001', userId: 'user-id-001' })
        ).rejects.toThrow('Unauthorized');
    });

    test('marks all unread notifications as read for a user', async () => {
        NotificationDB.updateMany.mockResolvedValue({ modifiedCount: 5 });

        const result = await markAllRead({ userId: 'user-id-001' });

        expect(NotificationDB.updateMany).toHaveBeenCalledWith(
            { user: 'user-id-001', read: false },
            { read: true }
        );
        expect(result.modifiedCount).toBe(5);
    });
});
