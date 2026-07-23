
let brevoApiKey = process.env.BREVO_API_KEY;
let brevoSenderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@intellibid.com';
let brevoSenderName = process.env.BREVO_SENDER_NAME || 'IntelliBid';

// Helper to send emails via Brevo API
const sendBrevoEmail = async ({ to, subject, html }) => {
    if (!brevoApiKey) {
        console.log("📧 EMAIL MOCK (No Brevo API key provided)");
        return;
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': brevoApiKey,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                sender: {
                    name: brevoSenderName,
                    email: brevoSenderEmail,
                },
                to: [{ email: to }],
                subject,
                htmlContent: html,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Brevo API error (${response.status}): ${errorData}`);
        }

        console.log(`✅ Email sent successfully to: ${to}`);
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error.message);
        console.log("ℹ️ Bypassing throw: Email info was logged to console above.");
    }
};

export const sendVerificationEmail = async (email, token) => {
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    console.log("-----------------------------------------");
    console.log(`📧 VERIFICATION EMAIL INFO FOR ${email}`);
    console.log(`Verify Link: ${verifyUrl}`);
    console.log("-----------------------------------------");

    await sendBrevoEmail({
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
};

export const sendPasswordResetEmail = async (email, token) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    console.log("-----------------------------------------");
    console.log(`🔑 PASSWORD RESET EMAIL INFO FOR ${email}`);
    console.log(`Reset Link: ${resetUrl}`);
    console.log("-----------------------------------------");

    await sendBrevoEmail({
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
};
