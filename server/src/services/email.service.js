import nodemailer from 'nodemailer';

let transporter;

const getTransporter = () => {
    if (transporter) return transporter;
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 5000, // 5 seconds
        socketTimeout: 5000,
        greetingTimeout: 5000,
    });
    return transporter;
};

export const sendVerificationEmail = async (email, token) => {
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    console.log("-----------------------------------------");
    console.log(`📧 VERIFICATION EMAIL INFO FOR ${email}`);
    console.log(`Verify Link: ${verifyUrl}`);
    console.log("-----------------------------------------");

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log("📧 EMAIL MOCK (No credentials provided)");
        return;
    }

    try {
        const transporter = getTransporter();
        await transporter.sendMail({
            from: `"IntelliBid" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify your IntelliBid account ⚡',
            html: `
            <div style="font-family: 'Space Grotesk', sans-serif; background-color: #f0f0f0; padding: 40px 20px; text-align: center;">
                <div style="max-width: 500px; margin: 0 auto; background-color: white; border: 4px solid #000000; box-shadow: 12px 12px 0px 0px #000000; padding: 40px;">
                    <div style="background-color: #7c3aed; color: white; display: inline-block; padding: 10px 20px; font-size: 24px; font-weight: 900; border: 3px solid #000000; margin-bottom: 30px;">
                        IB
                    </div>
                    <h1 style="font-size: 32px; font-weight: 900; margin-bottom: 10px; text-transform: uppercase; letter-spacing: -1px;">Verify your identity</h1>
                    <p style="font-size: 16px; font-weight: 500; color: #666; margin-bottom: 30px;">Welcome to the future of bidding. Click the button below to activate your account.</p>
                    <a href="${verifyUrl}" style="display: inline-block; background-color: #d1ff00; color: #000; padding: 18px 35px; font-size: 18px; font-weight: 900; text-decoration: none; border: 3px solid #000; box-shadow: 6px 6px 0px 0px #000; text-transform: uppercase;">
                        Verify Account ⚡
                    </a>
                    <div style="margin-top: 40px; border-top: 2px solid #000; padding-top: 20px; font-size: 12px; font-weight: bold; color: #999; text-transform: uppercase;">
                        This link expires in 24 hours. If you didn't request this, ignore this email.
                    </div>
                </div>
            </div>
            `,
        });
        console.log(`✅ Verification email sent to: ${email}`);
    } catch (error) {
        console.error(`❌ Failed to send verification email to ${email}:`, error.message);
        console.log("ℹ️ Bypassing throw: Verification link was logged to console above.");
    }
};

export const sendPasswordResetEmail = async (email, token) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    console.log("-----------------------------------------");
    console.log(`🔑 PASSWORD RESET EMAIL INFO FOR ${email}`);
    console.log(`Reset Link: ${resetUrl}`);
    console.log("-----------------------------------------");

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log("📧 EMAIL MOCK (No credentials provided)");
        return;
    }

    try {
        const transporter = getTransporter();
        await transporter.sendMail({
            from: `"IntelliBid" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Reset your IntelliBid password 🔐',
            html: `
            <div style="font-family: 'Space Grotesk', sans-serif; background-color: #f0f0f0; padding: 40px 20px; text-align: center;">
                <div style="max-width: 500px; margin: 0 auto; background-color: white; border: 4px solid #000000; box-shadow: 12px 12px 0px 0px #000000; padding: 40px;">
                    <div style="background-color: #ff0055; color: white; display: inline-block; padding: 10px 20px; font-size: 24px; font-weight: 900; border: 3px solid #000000; margin-bottom: 30px;">
                        IB
                    </div>
                    <h1 style="font-size: 32px; font-weight: 900; margin-bottom: 10px; text-transform: uppercase; letter-spacing: -1px;">Password Reset</h1>
                    <p style="font-size: 16px; font-weight: 500; color: #666; margin-bottom: 30px;">Lost your key? No worries. Click below to set a new password.</p>
                    <a href="${resetUrl}" style="display: inline-block; background-color: #7c3aed; color: #fff; padding: 18px 35px; font-size: 18px; font-weight: 900; text-decoration: none; border: 3px solid #000; box-shadow: 6px 6px 0px 0px #000; text-transform: uppercase;">
                        Reset Password 🔐
                    </a>
                    <div style="margin-top: 40px; border-top: 2px solid #000; padding-top: 20px; font-size: 12px; font-weight: bold; color: #999; text-transform: uppercase;">
                        This link expires in 1 hour. If you didn't request this, ignore this email.
                    </div>
                </div>
            </div>
            `,
        });
        console.log(`✅ Password reset email sent to: ${email}`);
    } catch (error) {
        console.error(`❌ Failed to send password reset email to ${email}:`, error.message);
        console.log("ℹ️ Bypassing throw: Reset link was logged to console above.");
    }
};