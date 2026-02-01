import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/config/dbConfig';

export const dynamic = 'force-dynamic';
import { comparePassword, generateTokenPair, getRefreshTokenExpiry } from '@/backend/utils/jwt';
import { verifyMFAToken } from '@/backend/utils/mfa';
import { loginSchema } from '@/backend/utils/validators';
import { logger } from '@/backend/utils/logger';
// Enum workarounds for build stability
const AuditAction = {
    USER_LOGIN: 'USER_LOGIN' as any,
    USER_LOGOUT: 'USER_LOGOUT' as any,
} as const;

// POST /api/auth/login
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = loginSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.issues },
                { status: 400 }
            );
        }

        const { email, password, mfaToken } = validation.data;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: { tenant: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.passwordHash);

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Check MFA if enabled
        if (user.mfaEnabled) {
            if (!mfaToken) {
                return NextResponse.json({ error: 'MFA token required', mfaRequired: true }, { status: 401 });
            }

            if (!user.mfaSecret) {
                return NextResponse.json({ error: 'MFA not configured' }, { status: 500 });
            }

            const isMfaValid = verifyMFAToken(mfaToken, user.mfaSecret);

            if (!isMfaValid) {
                return NextResponse.json({ error: 'Invalid MFA token' }, { status: 401 });
            }
        }

        // Generate tokens
        const tokens = generateTokenPair({
            userId: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            tenantState: user.tenant.state,
        });

        // Store refresh token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                refreshToken: tokens.refreshToken,
                refreshTokenExp: getRefreshTokenExpiry(),
                lastLoginAt: new Date(),
            },
        });

        // Audit log
        await prisma.auditLog.create({
            data: {
                action: AuditAction.USER_LOGIN,
                userId: user.id,
                tenantId: user.tenantId,
                resourceType: 'user',
                resourceId: user.id,
                ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
                userAgent: req.headers.get('user-agent') || 'unknown',
            },
        });

        logger.info('User logged in successfully', { userId: user.id, email: user.email });

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                tenantId: user.tenantId,
                tenantState: user.tenant.state,
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
    } catch (error: any) {
        logger.error('Error in user login', error);
        return NextResponse.json({
            error: 'Internal server error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
