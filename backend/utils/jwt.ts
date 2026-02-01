import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
// @ts-ignore
import { UserRole, TenantState } from '@prisma/client';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
    tenantId: string;
    tenantState: TenantState;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

// Generate access token
export function generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_ACCESS_SECRET, {
        expiresIn: JWT_ACCESS_EXPIRY as any,
    });
}

// Generate refresh token
export function generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRY as any,
    });
}

// Generate both tokens
export function generateTokenPair(payload: JWTPayload): TokenPair {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
}

// Verify access token
export function verifyAccessToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as JWTPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}

// Verify refresh token
export function verifyRefreshToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// Calculate token expiry date
export function getRefreshTokenExpiry(): Date {
    const days = parseInt(JWT_REFRESH_EXPIRY.replace('d', ''), 10) || 7;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    return expiry;
}
