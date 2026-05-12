import { z } from 'zod';

export const registerSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username cannot exceed 30 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
    email: z.string()
        .email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one digit')
});

export const loginSchema = z.object({
    email: z.string()
        .email('Invalid email address'),
    password: z.string()
        .min(1, 'Password is required')
});

export const experimentSchema = z.object({
    name: z.string()
        .min(1, 'Experiment name is required')
        .max(100, 'Experiment name cannot exceed 100 characters'),
    description: z.string()
        .max(500, 'Description cannot exceed 500 characters')
        .optional(),
    config: z.object({
        modelType: z.enum(['neural_network', 'decision_tree', 'random_forest']).optional(),
        parameters: z.record(z.any()).optional(),
        dataPath: z.string().optional()
    }).optional()
});

export const updateExperimentSchema = experimentSchema.partial();

export const changePasswordSchema = z.object({
    currentPassword: z.string()
        .min(1, 'Current password is required'),
    newPassword: z.string()
        .min(8, 'New password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one digit'),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

export const updateProfileSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username cannot exceed 30 characters')
        .optional(),
    profilePicture: z.string().url('Invalid URL').optional()
});

export const validateData = (schema, data) => {
    try {
        return { valid: true, data: schema.parse(data) };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                valid: false,
                errors: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            };
        }
        throw error;
    }
};
