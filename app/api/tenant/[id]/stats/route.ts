import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/config/dbConfig';
import { logger } from '@/backend/utils/logger';

export const dynamic = 'force-dynamic';

// GET /api/tenant/[id]/stats
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: tenantId } = await params;

        // 1. Get Client count
        const clientCount = await prisma.user.count({
            where: {
                tenantId,
                role: 'CLIENT'
            }
        });

        // 2. Get File count and Total storage
        const files = await prisma.file.findMany({
            where: {
                tenantId,
                deletedAt: null
            },
            select: {
                sizeBytes: true
            }
        });

        const fileCount = files.length;
        const totalStorageUsed = files.reduce((acc: number, file: { sizeBytes: bigint }) => acc + Number(file.sizeBytes), 0);

        // 3. Get Recent Audit Logs
        const recentLogs = await prisma.auditLog.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        return NextResponse.json({
            stats: {
                clientCount,
                fileCount,
                totalStorageUsed,
                storageLimitGB: 10 // Placeholder for now, could be dynamic from tenant
            },
            recentLogs
        });
    } catch (error) {
        logger.error('Error fetching tenant stats', error);
        return NextResponse.json({ error: 'Failed to fetch tenant stats' }, { status: 500 });
    }
}
