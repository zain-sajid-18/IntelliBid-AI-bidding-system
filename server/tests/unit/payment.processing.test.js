/**
 * payment.processing.test.js
 * Unit tests for payment processing, validation, and failure handling.
 */

import { jest } from '@jest/globals';

// ─── Simulated Payment Service ───────────────────────────────────────────────

const stripeChargeMock = jest.fn();

async function processPayment({ userId, auctionId, amount, paymentMethodId }) {
    if (!userId) throw new Error('User ID is required');
    if (!auctionId) throw new Error('Auction ID is required');
    if (!amount || amount <= 0) throw new Error('Payment amount must be positive');
    if (!paymentMethodId) throw new Error('Payment method is required');

    // Simulate Stripe charge
    const charge = await stripeChargeMock({
        amount: Math.round(amount * 100), // convert to cents
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true,
    });

    if (charge.status !== 'succeeded') {
        throw new Error(`Payment failed: ${charge.error || 'Unknown error'}`);
    }

    return {
        success: true,
        chargeId: charge.id,
        amount,
        status: 'paid',
    };
}

function validatePaymentDetails({ cardNumber, expiryDate, cvv, amount }) {
    const errors = [];

    if (!cardNumber || !/^\d{16}$/.test(cardNumber.replace(/\s/g, '')))
        errors.push('Invalid card number');
    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate))
        errors.push('Invalid expiry date (MM/YY)');
    if (!cvv || !/^\d{3,4}$/.test(cvv))
        errors.push('Invalid CVV');
    if (!amount || amount <= 0)
        errors.push('Invalid payment amount');

    return { isValid: errors.length === 0, errors };
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('Payment — Processing', () => {
    const validPayload = {
        userId: 'user-id-001',
        auctionId: 'auction-id-001',
        amount: 8750,
        paymentMethodId: 'pm_test_visa_123',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('processes payment successfully', async () => {
        stripeChargeMock.mockResolvedValue({ id: 'ch_test_001', status: 'succeeded' });

        const result = await processPayment(validPayload);

        expect(result.success).toBe(true);
        expect(result.status).toBe('paid');
        expect(result.chargeId).toBe('ch_test_001');
        expect(result.amount).toBe(8750);
        expect(stripeChargeMock).toHaveBeenCalledTimes(1);
    });

    test('converts amount to cents when calling payment provider', async () => {
        stripeChargeMock.mockResolvedValue({ id: 'ch_test_002', status: 'succeeded' });

        await processPayment(validPayload);

        expect(stripeChargeMock).toHaveBeenCalledWith(
            expect.objectContaining({ amount: 875000 }) // 8750 * 100
        );
    });

    test('fails when amount is zero', async () => {
        await expect(processPayment({ ...validPayload, amount: 0 })).rejects.toThrow(
            'Payment amount must be positive'
        );
    });

    test('fails when amount is negative', async () => {
        await expect(processPayment({ ...validPayload, amount: -50 })).rejects.toThrow(
            'Payment amount must be positive'
        );
    });

    test('fails when payment method is missing', async () => {
        await expect(
            processPayment({ ...validPayload, paymentMethodId: undefined })
        ).rejects.toThrow('Payment method is required');
    });

    test('fails when userId is missing', async () => {
        await expect(
            processPayment({ ...validPayload, userId: undefined })
        ).rejects.toThrow('User ID is required');
    });
});

describe('Payment — Failure Handling', () => {
    const validPayload = {
        userId: 'user-id-001',
        auctionId: 'auction-id-001',
        amount: 5000,
        paymentMethodId: 'pm_test_declined',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('throws error when payment provider returns non-success status', async () => {
        stripeChargeMock.mockResolvedValue({
            status: 'failed',
            error: 'Your card was declined.',
        });

        await expect(processPayment(validPayload)).rejects.toThrow(
            'Payment failed: Your card was declined.'
        );
    });

    test('propagates provider errors correctly', async () => {
        stripeChargeMock.mockRejectedValue(new Error('Network timeout — payment provider unreachable'));

        await expect(processPayment(validPayload)).rejects.toThrow(
            'Network timeout — payment provider unreachable'
        );
    });
});

describe('Payment — Validation', () => {
    test('validates correct card details', () => {
        const result = validatePaymentDetails({
            cardNumber: '4111 1111 1111 1111',
            expiryDate: '12/26',
            cvv: '123',
            amount: 1500,
        });

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    test('rejects invalid card number', () => {
        const result = validatePaymentDetails({
            cardNumber: '1234',
            expiryDate: '12/26',
            cvv: '123',
            amount: 1500,
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid card number');
    });

    test('rejects invalid expiry date format', () => {
        const result = validatePaymentDetails({
            cardNumber: '4111111111111111',
            expiryDate: '2026-12',
            cvv: '123',
            amount: 1500,
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid expiry date (MM/YY)');
    });

    test('rejects invalid CVV', () => {
        const result = validatePaymentDetails({
            cardNumber: '4111111111111111',
            expiryDate: '12/26',
            cvv: '99',
            amount: 1500,
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid CVV');
    });

    test('returns multiple errors for multiple invalid fields', () => {
        const result = validatePaymentDetails({
            cardNumber: 'abc',
            expiryDate: 'bad',
            cvv: 'x',
            amount: -50,
        });

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
});
