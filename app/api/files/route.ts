import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/config/dbConfig';

export const dynamic = 'force-dynamic';
import { logger } from '@/backend/utils/logger';

// GET /api/files
export async function GET(req: NextRequest) {
    try {
        const tenantId = req.nextUrl.searchParams.get('tenantId');
        const userId = req.nextUrl.searchParams.get('userId');

        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        // Build query
        const where: any = {
            tenantId,
            deletedAt: null,
        };

        // If userId provided, filter by uploaded files
        if (userId) {
            where.uploadedById = userId;
        }

        const files = await prisma.file.findMany({
            where,
            orderBy: {
                uploadedAt: 'desc',
            },
            select: {
                id: true,
                originalName: true,
                mimeType: true,
                sizeBytes: true,
                uploadedAt: true,
                lastAccessedAt: true,
                expiresAt: true,
                uploadedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({ files });
    } catch (error) {
        logger.error('Error fetching files', error);
        return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }
}
