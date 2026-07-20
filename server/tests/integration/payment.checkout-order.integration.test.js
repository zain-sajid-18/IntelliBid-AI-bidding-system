/**
 * Integration: Payment Route → Auth → Payment Controller → Order Model + Stripe (mocked)
 */
import { jest, describe, test, expect, beforeAll, afterAll, afterEach, beforeEach } from '@jest/globals';
import request from 'supertest';
import Order from '../../../src/models/order.model.js';
import { connectTestDB, disconnectTestDB, clearTestDB } from '../setup/db.js';
import { getTestApp, mockStripeCheckoutCreate } from '../setup/bootstrap.js';
import { createVerifiedUser, createActiveAuction, createPendingOrder } from '../helpers/factories.js';
import { buildAuthCookie } from '../helpers/auth.js';

describe('Integration — Payment Checkout Flow', () => {
    let app;
    let buyer;
    let seller;
    let auction;
    let order;

    beforeAll(async () => {
        await connectTestDB();
        app = await getTestApp();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await clearTestDB();

        ({ user: seller } = await createVerifiedUser({ role: 'seller', email: 'pay.seller@gmail.com' }));
        ({ user: buyer } = await createVerifiedUser({ email: 'pay.buyer@gmail.com' }));
        auction = await createActiveAuction(seller._id, { title: 'Payment Test Auction', currentPrice: 7500 });
        order = await createPendingOrder({
            buyerId: buyer._id,
            sellerId: seller._id,
            auctionId: auction._id,
            amount: 7500,
        });

        mockStripeCheckoutCreate.mockResolvedValue({
            id: 'cs_test_integration_001',
            url: 'https://checkout.stripe.com/pay/cs_test_integration_001',
        });
    });

    test('POST /api/payments/create-checkout creates Stripe session for pending order', async () => {
        const res = await request(app)
            .post('/api/payments/create-checkout')
            .set('Cookie', buildAuthCookie(buyer))
            .send({ orderId: order._id.toString() });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.url).toMatch(/checkout.stripe.com/);
        expect(mockStripeCheckoutCreate).toHaveBeenCalledTimes(1);

        const stripePayload = mockStripeCheckoutCreate.mock.calls[0][0];
        expect(stripePayload.line_items[0].price_data.unit_amount).toBe(750000);
        expect(stripePayload.client_reference_id).toBe(order._id.toString());
    });

    test('POST /api/payments/create-checkout rejects non-pending orders', async () => {
        await Order.findByIdAndUpdate(order._id, { status: 'paid' });

        const res = await request(app)
            .post('/api/payments/create-checkout')
            .set('Cookie', buildAuthCookie(buyer))
            .send({ orderId: order._id.toString() });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/not pending/i);
        expect(mockStripeCheckoutCreate).not.toHaveBeenCalled();
    });

    test('POST /api/payments/create-checkout requires authentication', async () => {
        const res = await request(app)
            .post('/api/payments/create-checkout')
            .send({ orderId: order._id.toString() });

        expect(res.status).toBe(401);
    });

    test('POST /api/payments/create-checkout returns 404 for missing order', async () => {
        const res = await request(app)
            .post('/api/payments/create-checkout')
            .set('Cookie', buildAuthCookie(buyer))
            .send({ orderId: '507f1f77bcf86cd799439011' });

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/order not found/i);
    });
});
