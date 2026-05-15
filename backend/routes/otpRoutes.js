import express from 'express';
import { sendOtp, verifyOtp } from '../controllers/otpController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.post('/send', asyncHandler(sendOtp));
router.post('/verify', asyncHandler(verifyOtp));

export default router;