import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { verifyMFAToken } from '@/backend/utils/mfa';
import prisma from '@/backend/config/dbConfig';
import { logger } from '@/backend/utils/logger';

// POST /api/auth/mfa/verify
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, token } = body;

        if (!userId || !token) {
            return NextResponse.json({ error: 'User ID and token required' }, { status: 400 });
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.mfaSecret) {
            return NextResponse.json({ error: 'MFA not configured' }, { status: 400 });
        }

        // Verify token
        const isValid = verifyMFAToken(token, user.mfaSecret);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid MFA token' }, { status: 401 });
        }

        // Enable MFA
        await prisma.user.update({
            where: { id: userId },
            data: {
                mfaEnabled: true,
            },
        });

        logger.info('MFA enabled successfully', { userId });

        return NextResponse.json({ message: 'MFA enabled successfully' });
    } catch (error) {
        logger.error('Error verifying MFA', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
