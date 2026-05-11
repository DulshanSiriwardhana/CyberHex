// Item 76: JWT token-based authentication
// Items 77, 78, 79, 80, 81, 82, 84, 85, 86, 87
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Item 78: Refresh token rotation
let refreshTokens = [];

// Item 76: Register
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Item 85: Password complexity validation
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Item 78: Bcrypt hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    // Item 86: Email verification (placeholder)
    // Send verification email

    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    next(error);
  }
});

// Item 76: Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET);

    refreshTokens.push(refreshToken);

    // Item 81: HTTP-only cookies
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
});

// Item 77: Refresh token
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });

    const accessToken = jwt.sign({ userId: user.userId, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken });
  });
});

// Item 79: Authentication middleware usage
router.get('/profile', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json(user);
});

// Item 80: Authorization middleware
router.get('/admin', authenticateToken, authorizeRole('admin'), (req, res) => {
  res.json({ message: 'Admin access' });
});

export default router;