import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/config/dbConfig';
import { logger } from '@/backend/utils/logger';
import { AuditAction } from '@prisma/client';

// POST /api/auth/logout
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Clear refresh token
        await prisma.user.update({
            where: { id: userId },
            data: {
                refreshToken: null,
                refreshTokenExp: null,
            },
        });

        // Audit log
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (user) {
            await prisma.auditLog.create({
                data: {
                    action: AuditAction.USER_LOGOUT,
                    userId: user.id,
                    tenantId: user.tenantId,
                    resourceType: 'user',
                    resourceId: user.id,
                    ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
                    userAgent: req.headers.get('user-agent') || 'unknown',
                },
            });
        }

        logger.info('User logged out successfully', { userId });

        return NextResponse.json({ message: 'Logged out successfully' });
    } catch (error) {
        logger.error('Error logging out user', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
