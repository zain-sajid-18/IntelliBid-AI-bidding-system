import { z } from 'zod';

export const signupSchema = z.object({
    firstName: z.string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must be at most 50 characters')
        .refine(val => !/^\d+$/.test(val), 'First name cannot be only digits'),
    lastName: z.string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must be at most 50 characters'),
    email: z.string()
        .email('Invalid email format')
        .refine(val => val.toLowerCase().endsWith('@gmail.com'), 'Only @gmail.com emails are allowed'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['buyer', 'seller', 'admin']).default('buyer'),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password required'),
});