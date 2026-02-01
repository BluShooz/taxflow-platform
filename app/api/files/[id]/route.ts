import { NextRequest, NextResponse } from 'next/server';
import { deleteFile } from '@/backend/services/fileService';
import { logger } from '@/backend/utils/logger';

// DELETE /api/files/[id]
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: fileId } = await params;
        const userId = req.nextUrl.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        await deleteFile(fileId, userId);

        return NextResponse.json({ message: 'File deleted successfully' });
    } catch (error: any) {
        logger.error('Error deleting file', error);
        return NextResponse.json({ error: error.message || 'Failed to delete file' }, { status: 500 });
    }
}
