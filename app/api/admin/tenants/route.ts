import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/config/dbConfig';
import { logger } from '@/backend/utils/logger';

export const dynamic = 'force-dynamic';

// GET /api/admin/tenants
export async function GET(req: NextRequest) {
    try {
        const tenants = await prisma.tenant.findMany({
            include: {
                _count: {
                    select: { users: true, files: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ tenants });
    } catch (error) {
        logger.error('Error fetching all tenants', error);
        return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
    }
}
