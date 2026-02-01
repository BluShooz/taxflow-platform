import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/config/dbConfig';
import { logger } from '@/backend/utils/logger';

export const dynamic = 'force-dynamic';

// GET /api/tenant/[id]/users
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: tenantId } = await params;
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');

        const users = await prisma.user.findMany({
            where: {
                tenantId,
                role: role ? (role as any) : undefined
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                lastLoginAt: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ users });
    } catch (error) {
        logger.error('Error fetching tenant users', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
