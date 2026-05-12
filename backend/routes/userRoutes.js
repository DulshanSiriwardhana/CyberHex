import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
    getAllUsers,
    getUserProfile,
    getUserById,
    updateUserProfile,
    deleteUser,
    changePassword,
    verifyEmail
} from '../controllers/userControllers.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/profile', asyncHandler(getUserProfile));

router.get('/', asyncHandler(authorizeRole('admin'), getAllUsers));

router.get('/:id', asyncHandler(getUserById));

router.put('/profile', asyncHandler(updateUserProfile));

router.post('/change-password', asyncHandler(changePassword));

router.post('/verify-email', asyncHandler(verifyEmail));

router.delete('/:id', asyncHandler(deleteUser));

export default router;
