import { asyncHandler } from '../../utils/asyncHandler.js';
import {
    getAdminStatsService,
    getRecentUsersService,
    getModerationQueueService,
    getSystemActivityService
} from './admin.service.js';

export const getAdminStats = asyncHandler(async (req, res) => {
    const stats = await getAdminStatsService();
    res.status(200).json({ success: true, data: stats });
});

export const getRecentUsers = asyncHandler(async (req, res) => {
    const users = await getRecentUsersService();
    res.status(200).json({ success: true, data: users });
});

export const getModerationQueue = asyncHandler(async (req, res) => {
    const queue = await getModerationQueueService();
    res.status(200).json({ success: true, data: queue });
});

export const getSystemActivity = asyncHandler(async (req, res) => {
    const activity = await getSystemActivityService();
    res.status(200).json({ success: true, data: activity });
});
