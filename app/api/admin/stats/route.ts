import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/config/dbConfig';
import { logger } from '@/backend/utils/logger';

export const dynamic = 'force-dynamic';

// GET /api/admin/stats
export async function GET(req: NextRequest) {
    try {
        // 0. Check for Demo Mode Fallback
        try {
            await prisma.$queryRaw`SELECT 1`;
        } catch (dbError) {
            console.warn('Database connection failed, returning demo admin stats...');
            const { DEMO_STATS } = require('@/backend/utils/demoData');
            return NextResponse.json({
                overview: {
                    totalTenants: 12,
                    totalUsers: 450,
                    totalFiles: 4200,
                    totalStorageUsed: 85000000000, // 85GB
                    tenantsByState: [
                        { state: 'ACTIVE', _count: 10 },
                        { state: 'SUSPENDED', _count: 2 }
                    ]
                },
                recentActivity: DEMO_STATS.recentLogs.map((log: any) => ({
                    ...log,
                    tenant: { name: 'Demo Tenant' }
                }))
            });
        }

        // 1. Total Tenants by state
        const tenantsByState = await prisma.tenant.groupBy({
            by: ['state'],
            _count: true
        });

        // 2. Global Totals
        const totalTenants = await prisma.tenant.count();
        const totalUsers = await prisma.user.count();

        const totalFiles = await prisma.file.count({ where: { deletedAt: null } });
        const storageResult = await prisma.file.aggregate({
            _sum: { sizeBytes: true },
            where: { deletedAt: null }
        });

        const totalStorageUsed = Number(storageResult._sum.sizeBytes || 0);

        // 3. System Activity (Global Audit Logs)
        const recentGlobalLogs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                user: { select: { email: true, firstName: true, lastName: true } },
                tenant: { select: { name: true } }
            }
        });

        return NextResponse.json({
            overview: {
                totalTenants,
                totalUsers,
                totalFiles,
                totalStorageUsed,
                tenantsByState
            },
            recentActivity: recentGlobalLogs
        });
    } catch (error) {
        logger.error('Error fetching admin global stats', error);
        return NextResponse.json({ error: 'Failed to fetch global stats' }, { status: 500 });
    }
}
