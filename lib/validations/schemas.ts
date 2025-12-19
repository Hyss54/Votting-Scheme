import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    role: z.enum(['voter', 'nominee']),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export const eventSchema = z.object({
    name: z.string().min(3, 'Event name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    vote_price: z.number().positive('Vote price must be positive'),
    start_date: z.string(),
    end_date: z.string(),
    status: z.enum(['draft', 'active', 'paused', 'ended']).default('draft'),
});

export const positionSchema = z.object({
    name: z.string().min(2, 'Position name must be at least 2 characters'),
    description: z.string().optional(),
    event_id: z.string().uuid(),
    display_order: z.number().int().positive(),
});

export const nomineeSchema = z.object({
    name: z.string().min(2, 'Nominee name must be at least 2 characters'),
    bio: z.string().optional(),
    image_url: z.string().url().optional().or(z.literal('')),
    event_id: z.string().uuid(),
    position_id: z.string().uuid(),
    user_id: z.string().uuid().optional(),
});

export const voteSchema = z.object({
    nominee_id: z.string().uuid(),
    event_id: z.string().uuid(),
    position_id: z.string().uuid(),
    payment_method: z.enum(['paystack', 'mtn_momo', 'hubtel']),
});

export const paymentInitSchema = z.object({
    amount: z.number().positive(),
    payment_method: z.enum(['paystack', 'mtn_momo', 'hubtel']),
    nominee_id: z.string().uuid(),
    event_id: z.string().uuid(),
    position_id: z.string().uuid(),
});
