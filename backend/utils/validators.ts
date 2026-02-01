import { z } from 'zod';

// Email validation
export const emailSchema = z.string().email('Invalid email address');

// Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// User registration schema
export const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    tenantId: z.string().cuid().optional(),
});

// User login schema
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
    mfaToken: z.string().length(6).optional(),
});

// File upload validation
export const fileUploadSchema = z.object({
    fileName: z.string().min(1).max(255),
    mimeType: z.string().regex(/^[a-z]+\/[a-z0-9\-\+\.]+$/i, 'Invalid MIME type'),
    sizeBytes: z.number().positive().max(100 * 1024 * 1024), // 100MB max
});

// Tenant creation schema
export const createTenantSchema = z.object({
    name: z.string().min(1).max(100),
    email: emailSchema,
    subdomain: z
        .string()
        .min(3)
        .max(63)
        .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, 'Invalid subdomain format'),
});

// Tenant state transition schema
export const tenantStateTransitionSchema = z.object({
    newState: z.enum(['TRIAL', 'ACTIVE', 'GRACE_PERIOD', 'SUSPENDED', 'ARCHIVED']),
    reason: z.string().min(1).max(500),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type TenantStateTransitionInput = z.infer<typeof tenantStateTransitionSchema>;
