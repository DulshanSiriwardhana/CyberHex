// Item 66: Async controllers
// Item 67: Connect to Mongoose User Models
import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Item 68: Structured HTTP responses
const sendResponse = (res, status, data) => {
  res.status(status).json(data);
};

// Get user profile
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return sendResponse(res, 404, { error: 'User not found' });
    sendResponse(res, 200, { user });
  } catch (error) {
    next(error);
  }
});

// Update user
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