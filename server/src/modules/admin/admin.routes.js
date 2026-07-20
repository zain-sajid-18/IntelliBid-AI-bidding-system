import express from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import { allowRoles } from '../../middleware/role.middleware.js';
import {
    getAdminStats,
    getRecentUsers,
    getModerationQueue,
    getSystemActivity
} from './admin.controller.js';

const router = express.Router();

// Apply global auth AND strict admin role verification to all routes in this file
router.use(auth, allowRoles('admin'));

// Admin Dashboard Endpoints
router.get('/dashboard/stats', getAdminStats);
router.get('/users/recent', getRecentUsers);
router.get('/moderation/queue', getModerationQueue);
router.get('/activity/system', getSystemActivity);

export default router;
