import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as s3RequestPresigner from '@aws-sdk/s3-request-presigner';
const { getSignedUrl } = s3RequestPresigner;
import { s3Client, s3Config } from '../config/s3Config';
import prisma from '../config/dbConfig';
import { logger } from '../utils/logger';
import { AuditAction } from '@prisma/client';
import { canPerformAction } from '../utils/rbac';

export interface UploadFileInput {
    tenantId: string;
    userId: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    fileBuffer: Buffer;
    retentionDays?: number;
}

export interface FileAccessCheck {
    allowed: boolean;
    reason?: string;
}

export async function uploadFile(input: UploadFileInput) {
    try {
        // Check tenant state allows uploads
        const tenant = await prisma.tenant.findUnique({
            where: { id: input.tenantId },
        });

        if (!tenant) {
            throw new Error('Tenant not found');
        }

        if (!canPerformAction(tenant.state, 'canUploadFiles')) {
            throw new Error(`Cannot upload files in ${tenant.state} state`);
        }

        // Generate S3 key
        const fileId = generateFileId();
        const s3Key = `tenant-${input.tenantId}/files/${fileId}-${input.fileName}`;

        // Upload to S3
        const uploadCommand = new PutObjectCommand({
            Bucket: s3Config.bucket,
            Key: s3Key,
            Body: input.fileBuffer,
            ContentType: input.mimeType,
            Metadata: {
                tenantId: input.tenantId,
                uploadedBy: input.userId,
            },
        });

        await s3Client.send(uploadCommand);

        // Calculate expiry date
        const retentionDays = input.retentionDays || parseInt(process.env.DEFAULT_FILE_RETENTION_DAYS || '2555', 10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + retentionDays);

        // Create file record in database
        const file = await prisma.file.create({
            data: {
                s3Key,
                s3Bucket: s3Config.bucket,
                originalName: input.fileName,
                mimeType: input.mimeType,
                sizeBytes: BigInt(input.sizeBytes),
                retentionDays,
                expiresAt,
                tenantId: input.tenantId,
                uploadedById: input.userId,
            },
        });

        // Audit log
        await prisma.auditLog.create({
            data: {
                action: AuditAction.FILE_UPLOAD,
                tenantId: input.tenantId,
                userId: input.userId,
                resourceType: 'file',
                resourceId: file.id,
                fileId: file.id,
                metadata: {
                    fileName: input.fileName,
                    sizeBytes: input.sizeBytes,
                },
            },
        });

        logger.info('File uploaded successfully', {
            fileId: file.id,
            tenantId: input.tenantId,
            fileName: input.fileName,
        });

        return file;
    } catch (error) {
        logger.error('Error uploading file', error, {
            tenantId: input.tenantId,
            fileName: input.fileName,
        });
        throw error;
    }
}

export async function getPresignedDownloadUrl(
    fileId: string,
    userId: string,
    expirySeconds: number = 3600
): Promise<string> {
    try {
        const file = await prisma.file.findUnique({
            where: { id: fileId },
            include: { tenant: true },
        });

        if (!file) {
            throw new Error('File not found');
        }

        if (file.deletedAt) {
            throw new Error('File has been deleted');
        }

        // Check tenant state allows downloads
        if (!canPerformAction(file.tenant.state, 'canDownloadFiles')) {
            throw new Error(`Cannot download files in ${file.tenant.state} state`);
        }

        // Generate presigned URL
        const command = new GetObjectCommand({
            Bucket: file.s3Bucket,
            Key: file.s3Key,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: expirySeconds });

        // Update last accessed timestamp
        await prisma.file.update({
            where: { id: fileId },
            data: { lastAccessedAt: new Date() },
        });

        // Audit log
        await prisma.auditLog.create({
            data: {
                action: AuditAction.FILE_DOWNLOAD,
                tenantId: file.tenantId,
                userId,
                resourceType: 'file',
                resourceId: fileId,
                fileId,
                metadata: {
                    fileName: file.originalName,
                },
            },
        });

        logger.info('Presigned download URL generated', { fileId, userId });

        return url;
    } catch (error) {
        logger.error('Error generating presigned URL', error, { fileId });
        throw error;
    }
}

export async function deleteFile(fileId: string, userId: string): Promise<void> {
    try {
        const file = await prisma.file.findUnique({
            where: { id: fileId },
            include: { tenant: true },
        });

        if (!file) {
            throw new Error('File not found');
        }

        // Check tenant state allows deletes
        if (!canPerformAction(file.tenant.state, 'canDeleteFiles')) {
            throw new Error(`Cannot delete files in ${file.tenant.state} state`);
        }

        // Soft delete in database
        await prisma.file.update({
            where: { id: fileId },
            data: { deletedAt: new Date() },
        });

        // Audit log
        await prisma.auditLog.create({
            data: {
                action: AuditAction.FILE_DELETE,
                tenantId: file.tenantId,
                userId,
                resourceType: 'file',
                resourceId: fileId,
                fileId,
                metadata: {
                    fileName: file.originalName,
                },
            },
        });

        logger.info('File deleted (soft delete)', { fileId, userId });
    } catch (error) {
        logger.error('Error deleting file', error, { fileId });
        throw error;
    }
}

export async function enforceAccessPolicy(fileId: string, userId: string): Promise<FileAccessCheck> {
    try {
        const file = await prisma.file.findUnique({
            where: { id: fileId },
            include: { tenant: true },
        });

        if (!file) {
            return { allowed: false, reason: 'File not found' };
        }

        if (file.deletedAt) {
            return { allowed: false, reason: 'File has been deleted' };
        }

        // Check tenant state
        const tenantState = file.tenant.state;
        if (tenantState === 'SUSPENDED' || tenantState === 'ARCHIVED') {
            return { allowed: false, reason: `Tenant is ${tenantState}` };
        }

        return { allowed: true };
    } catch (error) {
        logger.error('Error checking file access policy', error, { fileId });
        return { allowed: false, reason: 'Internal error' };
    }
}

// Get files that need to be archived based on retention policy
export async function getFilesForArchival(): Promise<any[]> {
    return prisma.file.findMany({
        where: {
            expiresAt: {
                lte: new Date(),
            },
            deletedAt: null,
        },
    });
}

// Helper to generate unique file ID
function generateFileId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
