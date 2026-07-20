import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generate JWT for cookies
export const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Generate email verification token (random hex)
export const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};