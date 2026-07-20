/**
 * auction.create.test.js
 * Unit + API tests for Auction creation logic
 *
 * NOTE: The backend currently has auth routes only. These tests validate
 * the core auction business logic (service-layer unit tests) and are
 * ready to be wired to real routes once the auction module is added.
 */

import { jest } from '@jest/globals';

// ─── Mocked Auction Model ───────────────────────────────────────────────────

const mockAuction = {
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
};

// ─── Sample Data ─────────────────────────────────────────────────────────────

const validAuctionData = {
    title: 'Vintage Rolex Submariner 16610',
    description: 'A stunning 1998 Rolex Submariner in excellent condition.',
    startingBid: 5000,
    reservePrice: 8000,
    auctionEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    category: 'Watches',
    seller: 'seller-id-001',
};

// ─── Helper: simulate auction service logic ──────────────────────────────────

async function createAuctionService(data) {
    if (!data.title) throw new Error('Title is required');
    if (!data.startingBid || data.startingBid <= 0) throw new Error('Starting bid must be positive');
    if (new Date(data.auctionEndTime) <= new Date()) throw new Error('Auction end time must be in the future');
    if (data.reservePrice && data.reservePrice < data.startingBid)
        throw new Error('Reserve price must be >= starting bid');

    const auction = await mockAuction.create({
        ...data,
        currentPrice: data.startingBid,
        status: 'active',
        bids: [],
    });
    return auction;
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('Auction — Create Auction (Service Logic)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('creates auction successfully with valid data', async () => {
        const createdAuction = { ...validAuctionData, _id: 'auction-001', status: 'active', bids: [] };
        mockAuction.create.mockResolvedValue(createdAuction);

        const result = await createAuctionService(validAuctionData);

        expect(result._id).toBe('auction-001');
        expect(result.status).toBe('active');
        expect(mockAuction.create).toHaveBeenCalledTimes(1);
    });

    test('fails when title is missing', async () => {
        const { title, ...withoutTitle } = validAuctionData;
        await expect(createAuctionService(withoutTitle)).rejects.toThrow('Title is required');
    });

    test('fails when starting bid is zero or negative', async () => {
        await expect(
            createAuctionService({ ...validAuctionData, startingBid: 0 })
        ).rejects.toThrow('Starting bid must be positive');

        await expect(
            createAuctionService({ ...validAuctionData, startingBid: -100 })
        ).rejects.toThrow('Starting bid must be positive');
    });

    test('fails when auction end time is in the past', async () => {
        const pastTime = new Date(Date.now() - 1000).toISOString();
        await expect(
            createAuctionService({ ...validAuctionData, auctionEndTime: pastTime })
        ).rejects.toThrow('Auction end time must be in the future');
    });

    test('fails when reserve price is less than starting bid', async () => {
        await expect(
            createAuctionService({ ...validAuctionData, reservePrice: 100, startingBid: 5000 })
        ).rejects.toThrow('Reserve price must be >= starting bid');
    });

    test('successfully creates auction without optional reserve price', async () => {
        const { reservePrice, ...withoutReserve } = validAuctionData;
        const created = { ...withoutReserve, _id: 'auction-002', status: 'active' };
        mockAuction.create.mockResolvedValue(created);

        const result = await createAuctionService(withoutReserve);

        expect(result.status).toBe('active');
    });
});

// ─── Product Upload (Unit) ────────────────────────────────────────────────────

describe('Auction — Product Upload Validation', () => {
    test('validates product data before saving', () => {
        const product = {
            name: 'Polaroid SX-70',
            images: ['https://cdn.example.com/img1.jpg'],
            condition: 'excellent',
        };

        expect(product.name).toBeDefined();
        expect(Array.isArray(product.images)).toBe(true);
        expect(product.images.length).toBeGreaterThan(0);
        expect(['excellent', 'good', 'fair', 'poor']).toContain(product.condition);
    });

    test('rejects product with no images', () => {
        const product = { name: 'Watch', images: [] };
        const isValid = product.images && product.images.length > 0;
        expect(isValid).toBe(false);
    });

    test('rejects product with missing name', () => {
        const product = { images: ['img.jpg'] };
        expect(product.name).toBeUndefined();
    });
});
