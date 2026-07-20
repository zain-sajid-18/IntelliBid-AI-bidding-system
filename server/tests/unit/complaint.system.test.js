/**
 * complaint.system.test.js
 * Unit tests for the complaint system:
 *   - Raise a complaint
 *   - Respond to complaint
 *   - View complaints
 */

import { jest } from '@jest/globals';

// ─── Mocked Complaint Repository ─────────────────────────────────────────────

const ComplaintDB = {
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
};

// ─── Simulated Complaint Service ─────────────────────────────────────────────

async function raiseComplaint({ userId, auctionId, subject, description }) {
    if (!userId) throw new Error('User ID is required');
    if (!subject || subject.trim().length < 5) throw new Error('Subject must be at least 5 characters');
    if (!description || description.trim().length < 20)
        throw new Error('Description must be at least 20 characters');

    const complaint = await ComplaintDB.create({
        user: userId,
        auction: auctionId || null,
        subject: subject.trim(),
        description: description.trim(),
        status: 'open',
        responses: [],
        createdAt: new Date(),
    });

    return complaint;
}

async function respondToComplaint({ complaintId, adminId, message }) {
    if (!complaintId) throw new Error('Complaint ID is required');
    if (!adminId) throw new Error('Admin ID is required');
    if (!message || message.trim().length === 0) throw new Error('Response message cannot be empty');

    const complaint = await ComplaintDB.findById(complaintId);
    if (!complaint) throw new Error('Complaint not found');
    if (complaint.status === 'resolved') throw new Error('Complaint is already resolved');

    const updatedComplaint = await ComplaintDB.findByIdAndUpdate(
        complaintId,
        {
            $push: { responses: { admin: adminId, message: message.trim(), at: new Date() } },
            status: 'in-review',
        },
        { new: true }
    );

    return updatedComplaint;
}

async function viewComplaints({ filter = {}, page = 1, limit = 10 } = {}) {
    if (page < 1) throw new Error('Page must be >= 1');
    if (limit < 1 || limit > 100) throw new Error('Limit must be between 1 and 100');

    const complaints = await ComplaintDB.find(filter);
    return { complaints, page, limit, total: complaints.length };
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('Complaint System — Raise Complaint', () => {
    const validComplaint = {
        userId: 'user-id-001',
        auctionId: 'auction-id-001',
        subject: 'Item not as described',
        description:
            'The seller described the item as mint condition but it arrived with significant scratches and dents.',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('raises complaint successfully with valid data', async () => {
        const created = {
            _id: 'complaint-001',
            ...validComplaint,
            status: 'open',
            responses: [],
        };
        ComplaintDB.create.mockResolvedValue(created);

        const result = await raiseComplaint(validComplaint);

        expect(result._id).toBe('complaint-001');
        expect(result.status).toBe('open');
        expect(ComplaintDB.create).toHaveBeenCalledTimes(1);
    });

    test('fails when subject is too short', async () => {
        await expect(
            raiseComplaint({ ...validComplaint, subject: 'Bad' })
        ).rejects.toThrow('Subject must be at least 5 characters');
    });

    test('fails when description is too short', async () => {
        await expect(
            raiseComplaint({ ...validComplaint, description: 'Short desc' })
        ).rejects.toThrow('Description must be at least 20 characters');
    });

    test('fails when userId is missing', async () => {
        const { userId, ...withoutUser } = validComplaint;
        await expect(raiseComplaint(withoutUser)).rejects.toThrow('User ID is required');
    });

    test('creates complaint without auctionId (general complaint)', async () => {
        const { auctionId, ...withoutAuction } = validComplaint;
        ComplaintDB.create.mockResolvedValue({
            _id: 'complaint-002',
            ...withoutAuction,
            auction: null,
            status: 'open',
        });

        const result = await raiseComplaint(withoutAuction);

        expect(result.auction).toBeNull();
    });
});

describe('Complaint System — Respond to Complaint', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('admin responds to complaint successfully', async () => {
        ComplaintDB.findById.mockResolvedValue({ _id: 'complaint-001', status: 'open', responses: [] });
        ComplaintDB.findByIdAndUpdate.mockResolvedValue({
            _id: 'complaint-001',
            status: 'in-review',
            responses: [{ admin: 'admin-001', message: 'We are investigating this issue.' }],
        });

        const result = await respondToComplaint({
            complaintId: 'complaint-001',
            adminId: 'admin-001',
            message: 'We are investigating this issue.',
        });

        expect(result.status).toBe('in-review');
        expect(result.responses).toHaveLength(1);
    });

    test('fails when complaint is already resolved', async () => {
        ComplaintDB.findById.mockResolvedValue({ _id: 'complaint-001', status: 'resolved' });

        await expect(
            respondToComplaint({
                complaintId: 'complaint-001',
                adminId: 'admin-001',
                message: 'Following up.',
            })
        ).rejects.toThrow('Complaint is already resolved');
    });

    test('fails when complaint does not exist', async () => {
        ComplaintDB.findById.mockResolvedValue(null);

        await expect(
            respondToComplaint({
                complaintId: 'nonexistent-id',
                adminId: 'admin-001',
                message: 'Hello.',
            })
        ).rejects.toThrow('Complaint not found');
    });

    test('fails with empty response message', async () => {
        await expect(
            respondToComplaint({ complaintId: 'complaint-001', adminId: 'admin-001', message: '' })
        ).rejects.toThrow('Response message cannot be empty');
    });
});

describe('Complaint System — View Complaints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('fetches all open complaints', async () => {
        ComplaintDB.find.mockResolvedValue([
            { _id: 'c1', status: 'open', subject: 'Issue 1' },
            { _id: 'c2', status: 'open', subject: 'Issue 2' },
        ]);

        const result = await viewComplaints({ filter: { status: 'open' } });

        expect(result.complaints).toHaveLength(2);
        expect(result.total).toBe(2);
        expect(ComplaintDB.find).toHaveBeenCalledWith({ status: 'open' });
    });

    test('returns empty array when no complaints exist', async () => {
        ComplaintDB.find.mockResolvedValue([]);

        const result = await viewComplaints();

        expect(result.complaints).toHaveLength(0);
        expect(result.total).toBe(0);
    });

    test('fails with invalid page number', async () => {
        await expect(viewComplaints({ page: 0 })).rejects.toThrow('Page must be >= 1');
    });

    test('fails with limit exceeding 100', async () => {
        await expect(viewComplaints({ limit: 200 })).rejects.toThrow(
            'Limit must be between 1 and 100'
        );
    });
});
