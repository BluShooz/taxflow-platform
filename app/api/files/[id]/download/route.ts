import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getPresignedDownloadUrl } from '@/backend/services/fileService';
import { logger } from '@/backend/utils/logger';

// GET /api/files/[id]/download
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: fileId } = await params;
        const userId = req.nextUrl.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Get presigned URL
        const url = await getPresignedDownloadUrl(fileId, userId);

        return NextResponse.json({ downloadUrl: url });
    } catch (error: any) {
        logger.error('Error getting download URL', error);
        return NextResponse.json({ error: error.message || 'Failed to get download URL' }, { status: 500 });
    }
}
