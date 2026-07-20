/**
 * Registers ESM mocks for external integrations, then exposes the Express app.
 * Real implementations: controllers, services, middleware, Mongoose models.
 */
import { jest } from '@jest/globals';
import multer from 'multer';

const memoryUpload = multer({ storage: multer.memoryStorage() });

export const mockSendVerificationEmail = jest.fn().mockResolvedValue(true);
export const mockSendPasswordResetEmail = jest.fn().mockResolvedValue(true);
export const mockBroadcastBid = jest.fn();
export const mockStripeCheckoutCreate = jest.fn();

jest.unstable_mockModule('../../../src/services/email.service.js', () => ({
    sendVerificationEmail: mockSendVerificationEmail,
    sendPasswordResetEmail: mockSendPasswordResetEmail,
}));

jest.unstable_mockModule('../../../src/config/socket.js', () => ({
    initSocket: jest.fn(),
    getIO: jest.fn(),
    broadcastBid: mockBroadcastBid,
}));

jest.unstable_mockModule('../../../src/config/cloudinary.js', () => ({
    upload: memoryUpload,
    uploadAuctionImages: {
        array: (field, max) => {
            const parser = memoryUpload.array(field, max);
            return (req, res, next) => {
                parser(req, res, (err) => {
                    if (err) return next(err);
                    if (req.files?.length) {
                        req.files = req.files.map((file, index) => ({
                            ...file,
                            path: `https://cdn.test/intellibid/${Date.now()}-${index}.jpg`,
                        }));
                    }
                    next();
                });
            };
        },
    },
    default: {},
}));

jest.unstable_mockModule('stripe', () => ({
    default: jest.fn().mockImplementation(() => ({
        checkout: {
            sessions: {
                create: mockStripeCheckoutCreate,
            },
        },
        webhooks: {
            constructEvent: jest.fn(),
        },
    })),
}));

let appPromise;

export async function getTestApp() {
    if (!appPromise) {
        const { default: app } = await import('../../../src/app.js');
        appPromise = app;
    }
    return appPromise;
}
