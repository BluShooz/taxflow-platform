import { NextRequest, NextResponse } from 'next/server';
import { setupMFA, verifyMFAToken } from '@/backend/utils/mfa';
import prisma from '@/backend/config/dbConfig';
import { logger } from '@/backend/utils/logger';

// POST /api/auth/mfa/setup
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, email } = body;

        if (!userId || !email) {
            return NextResponse.json({ error: 'User ID and email required' }, { status: 400 });
        }

        // Generate MFA setup
        const mfaSetup = await setupMFA(email);

        // Store MFA secret (but don't enable yet)
        await prisma.user.update({
            where: { id: userId },
            data: {
                mfaSecret: mfaSetup.secret,
                mfaEnabled: false, // Will be enabled after verification
            },
        });

        logger.info('MFA setup initiated', { userId });

        return NextResponse.json({
            qrCodeUrl: mfaSetup.qrCodeUrl,
            backupCodes: mfaSetup.backupCodes,
        });
    } catch (error) {
        logger.error('Error setting up MFA', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
