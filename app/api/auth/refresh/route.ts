import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/config/dbConfig';

export const dynamic = 'force-dynamic';
import { verifyRefreshToken, generateTokenPair, getRefreshTokenExpiry } from '@/backend/utils/jwt';
import { logger } from '@/backend/utils/logger';

// POST /api/auth/refresh
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { refreshToken } = body;

        if (!refreshToken) {
            return NextResponse.json({ error: 'Refresh token required' }, { status: 400 });
        }

        // Verify refresh token
        const payload = (await verifyRefreshToken(refreshToken)) as any;

        if (!payload) {
            return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
        }

        // Check if refresh token exists in database
        const user = await prisma.user.findFirst({
            where: {
                id: payload.userId,
                refreshToken,
            },
            include: { tenant: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
        }

        // Check if refresh token is expired
        if (user.refreshTokenExp && user.refreshTokenExp < new Date()) {
            return NextResponse.json({ error: 'Refresh token expired' }, { status: 401 });
        }

        // Generate tokens
        const tokens = (await generateTokenPair({
            userId: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            tenantState: user.tenant.state,
        })) as any;

        // Update refresh token in database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                refreshToken: tokens.refreshToken,
                refreshTokenExp: getRefreshTokenExpiry(),
            },
        });

        logger.info('Tokens refreshed successfully', { userId: user.id });

        return NextResponse.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
    } catch (error) {
        logger.error('Error refreshing tokens', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
