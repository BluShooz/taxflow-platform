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

        let user: any = null;
        let isDemoMode = false;

        try {
            // Find user in DB
            user = await prisma.user.findUnique({
                where: { email },
                include: { tenant: true },
            });
        } catch (dbError) {
            console.warn('Database connection failed, checking Demo Mode fallback...');
            isDemoMode = true;
        }

        // Demo Mode Fallback
        if (!user || isDemoMode) {
            // Use relative path for require to ensure it works in all environments
            const demoData = require('../../../backend/utils/demoData');
            const demoUser = demoData.DEMO_USERS.find((u: any) => u.email === email && u.password === password);

            if (demoUser) {
                user = {
                    ...demoUser,
                    passwordHash: 'DEMO', // Placeholder
                    tenant: { state: 'ACTIVE', id: demoUser.tenantId }
                };
                isDemoMode = true;
            } else if (!user) {
                return NextResponse.json({ error: 'Invalid credentials or DB unavailable' }, { status: 401 });
            }
        }

        // Verify password (if not in demo mode)
        if (!isDemoMode) {
            const isPasswordValid = await comparePassword(password, user.passwordHash);
            if (!isPasswordValid) {
                return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
            }
        }

        // Check MFA if enabled (ignored in Demo Mode for simplicity)
        if (user.mfaEnabled && !isDemoMode) {
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

        // Store refresh token & Audit log (only if not in demo mode)
        if (!isDemoMode) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    refreshToken: tokens.refreshToken,
                    refreshTokenExp: getRefreshTokenExpiry(),
                    lastLoginAt: new Date(),
                },
            });

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
        }

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
            isDemoMode
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
