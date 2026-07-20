/**
 * Integration: Complaint Route → Auth → Complaint Controller → Complaint Model
 */
import { jest, describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import Complaint from '../../../src/models/complaint.model.js';
import { connectTestDB, disconnectTestDB, clearTestDB } from '../setup/db.js';
import { getTestApp } from '../setup/bootstrap.js';
import { createVerifiedUser, createActiveAuction } from '../helpers/factories.js';
import { buildAuthCookie } from '../helpers/auth.js';

describe('Integration — Complaint System Flow', () => {
    let app;
    let buyer;
    let admin;
    let auction;

    beforeAll(async () => {
        await connectTestDB();
        app = await getTestApp();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    beforeEach(async () => {
        await clearTestDB();

        ({ user: buyer } = await createVerifiedUser({ role: 'buyer', email: 'complaint.buyer@gmail.com' }));
        ({ user: admin } = await createVerifiedUser({ role: 'admin', email: 'admin.support@gmail.com' }));
        
        auction = await createActiveAuction(admin._id, { title: 'Problematic Auction' }); // using admin as dummy seller
    });

    test('POST /api/complaints creates a complaint and GET /api/complaints retrieves it', async () => {
        // 1. Buyer raises a complaint
        const createRes = await request(app)
            .post('/api/complaints')
            .set('Cookie', buildAuthCookie(buyer))
            .send({
                auctionId: auction._id.toString(),
                subject: 'Item damaged',
                description: 'The item arrived with severe shipping damage not mentioned in the listing.',
            });

        expect(createRes.status).toBe(201);
        expect(createRes.body.success).toBe(true);
        expect(createRes.body.data.subject).toBe('Item damaged');
        
        const complaintId = createRes.body.data._id;

        // 2. Admin views complaints
        const viewRes = await request(app)
            .get('/api/complaints')
            .set('Cookie', buildAuthCookie(admin));

        expect(viewRes.status).toBe(200);
        expect(viewRes.body.complaints).toBeInstanceOf(Array);
        expect(viewRes.body.complaints.length).toBeGreaterThan(0);
        
        const fetchedComplaint = viewRes.body.complaints.find(c => c._id === complaintId);
        expect(fetchedComplaint).toBeDefined();
        expect(fetchedComplaint.status).toBe('open');
    });

    test('PUT /api/complaints/:id/respond allows admin to respond to a complaint', async () => {
        // Create an initial complaint directly via model for testing the response flow
        const complaint = await Complaint.create({
            user: buyer._id,
            auction: auction._id,
            subject: 'Fake item',
            description: 'The serial number on this watch does not match the manufacturer database.',
            status: 'open',
            responses: []
        });

        // Admin responds
        const respondRes = await request(app)
            .put(`/api/complaints/${complaint._id}/respond`)
            .set('Cookie', buildAuthCookie(admin))
            .send({
                message: 'We are suspending the seller while we investigate this.'
            });

        expect(respondRes.status).toBe(200);
        expect(respondRes.body.success).toBe(true);
        expect(respondRes.body.data.status).toBe('in-review');
        expect(respondRes.body.data.responses).toHaveLength(1);
        expect(respondRes.body.data.responses[0].message).toBe('We are suspending the seller while we investigate this.');

        // Verify in DB
        const updatedComplaint = await Complaint.findById(complaint._id);
        expect(updatedComplaint.status).toBe('in-review');
    });
});
