import express from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import { upload } from '../../config/cloudinary.js';
import {
    getMyProfile,
    updateProfile,
    uploadAvatar,
    changePassword,
    deleteAccount,
    getPublicProfile
} from './profile.controller.js';

const router = express.Router();

// Public route - only match valid MongoDB ObjectIds
router.get('/:id([0-9a-fA-F]{24})', getPublicProfile);

// Protected routes
router.use(auth);

router.get('/me', getMyProfile);
router.put('/update', updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.put('/change-password', changePassword);
router.delete('/delete-account', deleteAccount);

export default router;
