import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(email, code) {
  if (!process.env.SMTP_USER) {
    logger.warn(`SMTP not configured; OTP for ${email}: ${code}`);
    return { preview: true, code };
  }

  const mailOptions = {
    from: `"CyberHex" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your CyberHex Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px; letter-spacing: 0.5px;">⚡ CyberHex</h1>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #f9fafb; margin: 0 0 8px; font-size: 18px;">Verify your email</h2>
          <p style="color: #9ca3af; margin: 0 0 24px; font-size: 14px; line-height: 1.6;">
            Use the code below to complete your registration. This code expires in 10 minutes.
          </p>
          <div style="background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #06b6d4;">${code}</span>
          </div>
          <p style="color: #6b7280; margin: 0; font-size: 12px;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`OTP email sent to ${email}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    logger.error(`Failed to send OTP email to ${email}: ${err.message}`);
    throw err;
  }
}