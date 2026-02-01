import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/s3Config';
import { getTenantsForArchival } from '../services/lifecycle';
import { getFilesForArchival } from '../services/fileService';
import { transitionTenantState } from '../services/lifecycle';
import prisma from '../config/dbConfig';
import { logger } from '../utils/logger';

/**
 * Retention/Archival Cron Job
 * 
 * This job should run weekly (via AWS Lambda + EventBridge)
 * It performs two main tasks:
 * 1. Archive/delete files that have exceeded their retention period
 * 2. Archive tenants that have been suspended for too long
 */
export async function runRetentionJob() {
    logger.info('Starting retention cron job');

    try {
        const filesArchived = await archiveExpiredFiles();
        const tenantsArchived = await archiveSuspendedTenants();

        logger.info('Retention cron job completed', {
            filesArchived,
            tenantsArchived,
        });

        return {
            success: true,
            filesArchived,
            tenantsArchived,
        };
    } catch (error) {
        logger.error('Error running retention cron job', error);
        throw error;
    }
}

async function archiveExpiredFiles(): Promise<number> {
    logger.info('Archiving expired files');

    try {
        const files = await getFilesForArchival();
        logger.info(`Found ${files.length} files to archive`);

        let archivedCount = 0;

        for (const file of files) {
            try {
                // Delete from S3
                const deleteCommand = new DeleteObjectCommand({
                    Bucket: file.s3Bucket,
                    Key: file.s3Key,
                });

                await s3Client.send(deleteCommand);

                // Mark as deleted in database
                await prisma.file.update({
                    where: { id: file.id },
                    data: { deletedAt: new Date() },
                });

                // Audit log
                await prisma.auditLog.create({
                    data: {
                        action: 'FILE_DELETE',
                        tenantId: file.tenantId,
                        resourceType: 'file',
                        resourceId: file.id,
                        fileId: file.id,
                        metadata: {
                            reason: 'Retention policy expired',
                            fileName: file.originalName,
                        },
                    },
                });

                archivedCount++;

                logger.info('File archived successfully', {
                    fileId: file.id,
                    fileName: file.originalName,
                });
            } catch (error) {
                logger.error('Error archiving file', error, {
                    fileId: file.id,
                });
            }
        }

        logger.info(`Archived ${archivedCount} files`);
        return archivedCount;
    } catch (error) {
        logger.error('Error in archiveExpiredFiles', error);
        return 0;
    }
}

async function archiveSuspendedTenants(): Promise<number> {
    logger.info('Archiving suspended tenants');

    try {
        const tenants = await getTenantsForArchival();
        logger.info(`Found ${tenants.length} tenants to archive`);

        let archivedCount = 0;

        for (const tenant of tenants) {
            try {
                const result = await transitionTenantState(
                    tenant.id,
                    'ARCHIVED',
                    'Suspended for extended period'
                );

                if (result.success) {
                    archivedCount++;
                    logger.info('Tenant archived successfully', {
                        tenantId: tenant.id,
                        tenantName: tenant.name,
                    });
                } else {
                    logger.warn('Failed to archive tenant', {
                        tenantId: tenant.id,
                        reason: result.message,
                    });
                }
            } catch (error) {
                logger.error('Error archiving tenant', error, {
                    tenantId: tenant.id,
                });
            }
        }

        logger.info(`Archived ${archivedCount} tenants`);
        return archivedCount;
    } catch (error) {
        logger.error('Error in archiveSuspendedTenants', error);
        return 0;
    }
}

// Lambda handler for AWS
export const handler = async () => {
    return await runRetentionJob();
};
