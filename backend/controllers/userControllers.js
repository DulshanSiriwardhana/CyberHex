import User from '../models/User.js';
import { asyncHandler, NotFoundError, ValidationError, ConflictError, AuthorizationError } from '../middleware/errorHandler.js';
import { validateData, updateProfileSchema, changePasswordSchema } from '../utils/validators.js';
import logger from '../utils/logger.js';

export const getAllUsers = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        throw new AuthorizationError('Only admins can view all users');
    }

    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;
    if (search) {
        query.$or = [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
        .select('-password')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    res.json({
        message: 'Users retrieved successfully',
        data: users,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
        }
    });
});

export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    res.json({
        message: 'User profile retrieved successfully',
        user: user.toJSON()
    });
});

export const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
        throw new NotFoundError('User not found');
    }

    if (req.user.userId !== user._id.toString() && req.user.role !== 'admin') {
        throw new AuthorizationError('Cannot access other user profiles');
    }

    res.json({
        message: 'User retrieved successfully',
        user: user.toJSON()
    });
});

export const updateUserProfile = asyncHandler(async (req, res) => {
    const validation = validateData(updateProfileSchema, req.body);
    if (!validation.valid) {
        throw new ValidationError('Profile update validation failed', validation.errors);
    }

    const { username, profilePicture } = validation.data;
    const user = await User.findById(req.user.userId);

    if (!user) {
        throw new NotFoundError('User not found');
    }

    if (username) {
        const existingUser = await User.findOne({ username, _id: { $ne: user._id } });
        if (existingUser) {
            throw new ConflictError('Username already taken');
        }
        user.username = username;
    }

    if (profilePicture) {
        user.profilePicture = profilePicture;
    }

    user.updatedAt = new Date();
    await user.save();
    logger.info(`Profile updated for user: ${user.email}`);

    res.json({
        message: 'Profile updated successfully',
        user: user.toJSON()
    });
});

export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (req.user.userId !== id && req.user.role !== 'admin') {
        throw new AuthorizationError('Cannot delete other user accounts');
    }

    const user = await User.findById(id);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    await User.findByIdAndDelete(id);
    logger.info(`User deleted: ${user.email}`);

    res.json({ message: 'User deleted successfully' });
});

export const changePassword = asyncHandler(async (req, res) => {
    const validation = validateData(changePasswordSchema, req.body);
    if (!validation.valid) {
        throw new ValidationError('Password change validation failed', validation.errors);
    }

    const { currentPassword, newPassword } = validation.data;
    const user = await User.findById(req.user.userId);

    if (!user) {
        throw new NotFoundError('User not found');
    }

    const isCorrect = await user.comparePassword(currentPassword);
    if (!isCorrect) {
        throw new ValidationError('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();
    logger.info(`Password changed for user: ${user.email}`);

    res.json({ message: 'Password changed successfully' });
});

export const verifyEmail = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    user.emailVerified = true;
    await user.save();
    logger.info(`Email verified for user: ${user.email}`);

    res.json({ message: 'Email verified successfully' });
});
