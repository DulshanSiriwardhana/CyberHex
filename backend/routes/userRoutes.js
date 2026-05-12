

import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();


const sendResponse = (res, status, data) => {
  res.status(status).json(data);
};


router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return sendResponse(res, 404, { error: 'User not found' });
    sendResponse(res, 200, { user });
  } catch (error) {
    next(error);
  }
});


router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password');
    sendResponse(res, 200, { user });
  } catch (error) {
    next(error);
  }
});

export default router;