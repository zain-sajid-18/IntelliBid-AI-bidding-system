import express from 'express';
import { signup, login, logout, verifyEmail, googleLogin, forgotPassword, resetPassword, getMe, upgradeToSeller } from './auth.controller.js';
import { auth } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/me', auth, getMe);
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', auth, logout);
router.get('/verify-email', verifyEmail);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/upgrade-to-seller', auth, upgradeToSeller);

export default router;