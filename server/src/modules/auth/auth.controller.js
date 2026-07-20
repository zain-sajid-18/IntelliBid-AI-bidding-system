import { signupService, loginService, verifyEmailService, googleLoginService, forgotPasswordService, resetPasswordService } from './auth.service.js';
import { signupSchema, loginSchema } from './auth.validation.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendTokenCookie } from '../../utils/cookie.js';
import User from '../../models/user.model.js';

export const signup = asyncHandler(async (req, res) => {
    // Validate input with Zod
    const data = signupSchema.parse(req.body);

    // Run signup business logic
    const { token, user } = await signupService(data);

    // Store JWT in HTTP-only cookie
    sendTokenCookie(res, token);

    // Send response
    res.status(201).json({
        success: true,
        message: 'Account created. Check your email to verify.',
        token,
        user,
    });
});

export const login = asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const { token, user } = await loginService(data);
    sendTokenCookie(res, token);

    res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        token,
        user,
    });
});

export const logout = asyncHandler(async (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logged out' });
});

export const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;
    const result = await verifyEmailService(token);
    res.status(200).json({ success: true, ...result });
});

export const googleLogin = asyncHandler(async (req, res) => {
    const { idToken } = req.body;
    const { token, user } = await googleLoginService(idToken);

    sendTokenCookie(res, token);

    res.status(200).json({ success: true, token, user });
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await forgotPasswordService(email);
    res.status(200).json({ success: true, ...result });
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    const result = await resetPasswordService(token, password);
    res.status(200).json({ success: true, ...result });
});

export const getMe = asyncHandler(async (req, res) => {
    // req.user only contains { id, role, email } from the JWT
    // We need to fetch the full user from the DB to get avatar, names, etc.
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
        success: true,
        user: {
            id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            walletBalance: user.walletBalance ?? 0,
        },
    });
});

import { generateToken } from '../../services/token.service.js';

export const upgradeToSeller = asyncHandler(async (req, res) => {
    // req.user is from JWT payload, not a DB document. We must fetch the actual user.
    const user = await User.findById(req.user.id);
    
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'seller' || user.role === 'admin') {
        return res.status(400).json({ success: false, message: 'Already a seller or admin' });
    }
    
    // Update role
    user.role = 'seller';
    await user.save();

    // Issue a new token since the role has changed
    const newToken = generateToken(user);
    sendTokenCookie(res, newToken);

    res.status(200).json({
        success: true,
        message: 'Congratulations! Your account has been upgraded to Seller.',
        token: newToken,
        user: {
            id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            walletBalance: user.walletBalance ?? 0,
        },
    });
});