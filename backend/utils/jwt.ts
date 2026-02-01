import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
// @ts-ignore
import { UserRole, TenantState } from '@prisma/client';

const JWT_ACCESS_SECRET = new TextEncoder().encode('emergency-hardcoded-secret-fix-2026-middleware');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-12345678');
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
export async function generateAccessToken(payload: JWTPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(JWT_ACCESS_EXPIRY)
        .sign(JWT_ACCESS_SECRET);
}

// Generate refresh token
export async function generateRefreshToken(payload: JWTPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(JWT_REFRESH_EXPIRY)
        .sign(JWT_REFRESH_SECRET);
}

// Generate both tokens
export async function generateTokenPair(payload: JWTPayload): Promise<TokenPair> {
    return {
        accessToken: await generateAccessToken(payload),
        refreshToken: await generateRefreshToken(payload),
    };
}

// Verify access token
export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_ACCESS_SECRET);
        return payload as unknown as JWTPayload;
    } catch (error) {
        return null;
    }
}

// Verify refresh token
export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
        return payload as unknown as JWTPayload;
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
