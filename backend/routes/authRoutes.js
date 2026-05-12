import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { asyncHandler, ValidationError, ConflictError, AuthenticationError, NotFoundError } from '../middleware/errorHandler.js';
import { validateData, registerSchema, loginSchema, changePasswordSchema } from '../utils/validators.js';
import logger from '../utils/logger.js';

const router = express.Router();

const tokenBlacklist = new Set();

router.post('/register', asyncHandler(async (req, res) => {
    const validation = validateData(registerSchema, req.body);
    if (!validation.valid) {
        throw new ValidationError('Registration validation failed', validation.errors);
    }

    const { username, email, password } = validation.data;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        throw new ConflictError(
            existingUser.email === email ? 'Email already registered' : 'Username already taken'
        );
    }

    const user = new User({ username, email, password });
    await user.save();
    logger.info(`User registered: ${email}`);

    const accessToken = jwt.sign(
        { userId: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
        message: 'User registered successfully',
        user: user.toJSON(),
        accessToken
    });
}));

router.post('/login', asyncHandler(async (req, res) => {
    const validation = validateData(loginSchema, req.body);
    if (!validation.valid) {
        throw new ValidationError('Login validation failed', validation.errors);
    }

    const { email, password } = validation.data;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
        throw new AuthenticationError('Invalid email or password');
    }

    logger.info(`User logged in: ${email}`);

    const accessToken = jwt.sign(
        { userId: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
        message: 'Login successful',
        user: user.toJSON(),
        accessToken
    });
}));

router.post('/refresh', (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                error: 'Refresh token required',
                code: 'NO_REFRESH_TOKEN'
            });
        }

        if (tokenBlacklist.has(refreshToken)) {
            return res.status(403).json({
                error: 'Refresh token has been revoked',
                code: 'TOKEN_REVOKED'
            });
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
            if (err) {
                logger.warn(`Invalid refresh token attempt`);
                return res.status(403).json({
                    error: 'Invalid refresh token',
                    code: 'INVALID_REFRESH_TOKEN'
                });
            }

            const newAccessToken = jwt.sign(
                { userId: user.userId, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
            );

            res.json({
                message: 'Token refreshed successfully',
                accessToken: newAccessToken
            });
        });
    } catch (error) {
        next(error);
    }
});

router.post('/logout', authenticateToken, (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            tokenBlacklist.add(refreshToken);
        }

        res.clearCookie('refreshToken');
        logger.info(`User logged out: ${req.user.userId}`);

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Logout failed' });
    }
});

router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId);
    if (!user) {
        throw new NotFoundError('User not found');
    }
    res.json({
        user: user.toJSON()
    });
}));

router.post('/change-password', authenticateToken, asyncHandler(async (req, res) => {
    const validation = validateData(changePasswordSchema, req.body);
    if (!validation.valid) {
        throw new ValidationError('Password change validation failed', validation.errors);
    }

    const { currentPassword, newPassword } = validation.data;
    const user = await User.findById(req.user.userId);

    if (!user || !(await user.comparePassword(currentPassword))) {
        throw new AuthenticationError('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();
    logger.info(`Password changed for user: ${user.email}`);

    res.json({ message: 'Password changed successfully' });
}));

export default router;
