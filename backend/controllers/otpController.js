import Otp from '../models/Otp.js';
import User from '../models/User.js';
import { asyncHandler, ValidationError, ConflictError, AuthenticationError } from '../middleware/errorHandler.js';
import { sendOtpEmail } from '../services/emailService.js';
import logger from '../utils/logger.js';

export const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError('A valid email address is required');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  const MAX_ATTEMPTS = 5;
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
  const attemptCount = await Otp.countDocuments({
    email: email.toLowerCase(),
    createdAt: { $gte: fifteenMinAgo },
  });
  if (attemptCount >= MAX_ATTEMPTS) {
    throw new ValidationError('Too many OTP requests. Please wait 15 minutes before trying again.');
  }

  const code = Otp.generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Otp.deleteMany({ email: email.toLowerCase() });
  await Otp.create({ email: email.toLowerCase(), code, expiresAt });

  try {
    const result = await sendOtpEmail(email.toLowerCase(), code);
    logger.info(`OTP sent to ${email}`);

    if (result.preview) {
      return res.json({
        message: 'OTP sent successfully',
        preview: true,
        expiresIn: 600,
      });
    }

    res.json({
      message: 'OTP sent successfully',
      expiresIn: 600,
    });
  } catch (err) {
    await Otp.deleteMany({ email: email.toLowerCase() });
    throw new Error('Failed to send OTP email. Please try again later.');
  }
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    throw new ValidationError('Email and OTP code are required');
  }

  const otpRecord = await Otp.findOne({
    email: email.toLowerCase(),
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new ValidationError('OTP has expired or does not exist. Please request a new one.');
  }

  if (otpRecord.verified) {
    throw new ValidationError('OTP has already been used.');
  }

  if (otpRecord.attempts >= 5) {
    await Otp.deleteOne({ _id: otpRecord._id });
    throw new ValidationError('Too many failed attempts. Please request a new OTP.');
  }

  if (otpRecord.code !== code) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    const remaining = 5 - otpRecord.attempts;
    throw new AuthenticationError(
      remaining > 0
        ? `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        : 'Invalid OTP. No attempts remaining.'
    );
  }

  otpRecord.verified = true;
  await otpRecord.save();

  res.json({
    message: 'OTP verified successfully',
    verified: true,
  });
});