import bcrypt from 'bcryptjs';
import User from '../../models/user.model.js';
import { generateToken, generateVerificationToken } from '../../services/token.service.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../services/email.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const signupService = async (data) => {
    // Check if user already exists
    const existing = await User.findOne({ email: data.email });
    if (existing) throw new ApiError(400, 'Email already registered');

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Generate email verification token
    const emailToken = generateVerificationToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Determine user role: only INITIAL_ADMIN_EMAIL becomes admin, otherwise use provided role (buyer/seller only)
    const isInitialAdmin = process.env.INITIAL_ADMIN_EMAIL && 
        data.email.toLowerCase() === process.env.INITIAL_ADMIN_EMAIL.toLowerCase();
    const userRole = isInitialAdmin ? 'admin' : (data.role === 'admin' ? 'buyer' : data.role); // Never allow random admin signups!

    // Create user in DB
    const user = await User.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        role: userRole,
        isVerified: process.env.BYPASS_EMAIL_VERIFICATION === 'true' || isInitialAdmin, // Admin bypasses email verification
        emailVerificationToken: isInitialAdmin ? undefined : emailToken, // Admin doesn't need verification token
        emailVerificationExpires: isInitialAdmin ? undefined : expires,
    });

    // Send verification email only if not admin and not bypassing verification
    if (!isInitialAdmin && process.env.BYPASS_EMAIL_VERIFICATION !== 'true') {
        try {
            await sendVerificationEmail(user.email, emailToken);
        } catch (error) {
            console.error("Failed to send verification email:", error.message);
        }
    }

    // Generate JWT
    const token = generateToken(user);

    return { token, user: { id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName, walletBalance: user.walletBalance ?? 0 } };
};

export const loginService = async (data) => {
    // Find user
    const user = await User.findOne({ email: data.email });
    if (!user) {
        console.log(`Login failed: User not found for email ${data.email}`);
        throw new ApiError(401, 'Invalid email or password');
    }

    // Auto-upgrade to admin if email matches INITIAL_ADMIN_EMAIL
    const isInitialAdmin = process.env.INITIAL_ADMIN_EMAIL && 
        user.email.toLowerCase() === process.env.INITIAL_ADMIN_EMAIL.toLowerCase();
    if (isInitialAdmin && user.role !== 'admin') {
        user.role = 'admin';
        user.isVerified = true; // Admin is always verified
        await user.save();
    }

    // Check verification (admin always bypasses)
    if (!user.isVerified && process.env.BYPASS_EMAIL_VERIFICATION !== 'true' && !isInitialAdmin) {
        throw new ApiError(401, 'Please verify your email before logging in');
    }

    // Compare password
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
        console.log(`Login failed: Password mismatch for user ${data.email}`);
        throw new ApiError(401, 'Invalid email or password');
    }

    // Check account status (Banned/Suspended)
    if (user.status === 'suspended' || user.status === 'banned') {
        throw new ApiError(403, `Your account is ${user.status}. Please contact support.`);
    }

    // Generate JWT
    const token = generateToken(user);

    return { token, user: { id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName, walletBalance: user.walletBalance ?? 0 } };
};

export const verifyEmailService = async (token) => {
    const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() }, // not expired
    });

    if (!user) throw new ApiError(400, 'Invalid or expired verification link');

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
};

export const googleLoginService = async (idToken) => {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, sub: googleId, given_name, family_name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
        // Create new user if not found (Social Login)
        const isInitialAdmin = process.env.INITIAL_ADMIN_EMAIL && 
            email.toLowerCase() === process.env.INITIAL_ADMIN_EMAIL.toLowerCase();
        user = await User.create({
            firstName: given_name,
            lastName: family_name,
            email,
            password: Math.random().toString(36).slice(-10), // Random password for social accounts
            isVerified: true, // Google accounts are pre-verified
            role: isInitialAdmin ? 'admin' : 'buyer', // Only admin email becomes admin
        });
    } else {
        // Existing user: auto-upgrade to admin if email matches
        const isInitialAdmin = process.env.INITIAL_ADMIN_EMAIL && 
            email.toLowerCase() === process.env.INITIAL_ADMIN_EMAIL.toLowerCase();
        if (isInitialAdmin && user.role !== 'admin') {
            user.role = 'admin';
            user.isVerified = true;
            await user.save();
        } else {
            // Ensure verified (Google confirmed email), but KEEP existing role!
            if (!user.isVerified) {
                user.isVerified = true;
                await user.save();
            }
        }
    }

    const token = generateToken(user);
    return { token, user: { id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName, walletBalance: user.walletBalance ?? 0 } };
};

export const forgotPasswordService = async (email) => {
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, 'User not found');

    const resetToken = generateVerificationToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);
    return { message: 'Password reset email sent' };
};

export const resetPasswordService = async (token, newPassword) => {
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) throw new ApiError(400, 'Invalid or expired reset token');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password reset successfully' };
};