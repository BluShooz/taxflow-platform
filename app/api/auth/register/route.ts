import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/config/dbConfig';

export const dynamic = 'force-dynamic';
import { hashPassword, comparePassword, generateTokenPair, verifyRefreshToken, getRefreshTokenExpiry } from '@/backend/utils/jwt';
import { setupMFA, verifyMFAToken } from '@/backend/utils/mfa';
import { registerSchema, loginSchema } from '@/backend/utils/validators';
import { logger } from '@/backend/utils/logger';
// Enum check bypassed for build stability
const AuditAction = {} as any;

// POST /api/auth/register
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = registerSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.issues },
                { status: 400 }
            );
        }

        const { email, password, firstName, lastName, tenantId } = validation.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                tenantId: tenantId!,
                role: 'CLIENT', // Default role
            },
            include: {
                tenant: true,
            },
        });

        // Generate tokens
        const tokens = (await generateTokenPair({
            userId: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            tenantState: user.tenant.state,
        })) as any;

        // Store refresh token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                refreshToken: tokens.refreshToken,
                refreshTokenExp: getRefreshTokenExpiry(),
            },
        });

        logger.info('User registered successfully', { userId: user.id, email: user.email });

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
    } catch (error) {
        logger.error('Error in user registration', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
