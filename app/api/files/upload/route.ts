import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { uploadFile } from '@/backend/services/fileService';
import { logger } from '@/backend/utils/logger';

// POST /api/files/upload
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const tenantId = formData.get('tenantId') as string;
        const userId = formData.get('userId') as string;
        const retentionDays = formData.get('retentionDays') as string;

        if (!file || !tenantId || !userId) {
            return NextResponse.json(
                { error: 'File, tenantId, and userId are required' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        // Upload file
        const uploadedFile = await uploadFile({
            tenantId,
            userId,
            fileName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
            fileBuffer,
            retentionDays: retentionDays ? parseInt(retentionDays, 10) : undefined,
        });

        return NextResponse.json({
            file: {
                id: uploadedFile.id,
                originalName: uploadedFile.originalName,
                mimeType: uploadedFile.mimeType,
                sizeBytes: uploadedFile.sizeBytes.toString(),
                uploadedAt: uploadedFile.uploadedAt,
                expiresAt: uploadedFile.expiresAt,
            },
        });
    } catch (error: any) {
        logger.error('Error uploading file', error);
        return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
    }
}
