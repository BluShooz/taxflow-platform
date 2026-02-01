import { getTenantsForGracePeriodExpiry, transitionTenantState } from '../services/lifecycle';
import { sendEmail, getGracePeriodWarningEmail, getSuspensionNoticeEmail } from '../services/emailService';
import { logger } from '../utils/logger';

/**
 * Grace Period Cron Job
 * 
 * This job should run daily (via AWS Lambda + EventBridge)
 * It checks for tenants in GRACE_PERIOD state that have exceeded the grace period duration
 * and transitions them to SUSPENDED state.
 */
export async function runGracePeriodJob() {
    logger.info('Starting grace period cron job');

    try {
        const tenants = await getTenantsForGracePeriodExpiry();

        logger.info(`Found ${tenants.length} tenants to suspend`);

        for (const tenant of tenants) {
            try {
                // Transition to SUSPENDED
                const result = await transitionTenantState(
                    tenant.id,
                    'SUSPENDED',
                    'Grace period expired'
                );

                if (result.success) {
                    // Send suspension notice email
                    const emailTemplate = getSuspensionNoticeEmail(tenant.name, tenant.email);
                    await sendEmail(emailTemplate);

                    logger.info('Tenant suspended due to grace period expiry', {
                        tenantId: tenant.id,
                        tenantName: tenant.name,
                    });
                } else {
                    logger.warn('Failed to suspend tenant', {
                        tenantId: tenant.id,
                        reason: result.message,
                    });
                }
            } catch (error) {
                logger.error('Error processing tenant for suspension', error, {
                    tenantId: tenant.id,
                });
            }
        }

        logger.info('Grace period cron job completed', {
            tenantsProcessed: tenants.length,
        });

        return {
            success: true,
            tenantsProcessed: tenants.length,
        };
    } catch (error) {
        logger.error('Error running grace period cron job', error);
        throw error;
    }
}

/**
 * Grace Period Warning Job
 * 
 * This job should run daily to send warning emails to tenants
 * approaching the end of their grace period.
 */
export async function runGracePeriodWarningJob() {
    logger.info('Starting grace period warning job');

    try {
        const gracePeriodDays = parseInt(process.env.GRACE_PERIOD_DAYS || '7', 10);
        const warningThreshold = 2; // Send warning 2 days before expiry

        const tenants = await getTenantsForGracePeriodExpiry();

        // Filter tenants that are within warning threshold
        const tenantsToWarn = tenants.filter((tenant) => {
            if (!tenant.gracePeriodStartedAt) return false;

            const daysSinceGracePeriod = Math.floor(
                (Date.now() - tenant.gracePeriodStartedAt.getTime()) / (1000 * 60 * 60 * 24)
            );

            const daysRemaining = gracePeriodDays - daysSinceGracePeriod;
            return daysRemaining <= warningThreshold && daysRemaining > 0;
        });

        logger.info(`Found ${tenantsToWarn.length} tenants to warn`);

        for (const tenant of tenantsToWarn) {
            try {
                const daysSinceGracePeriod = Math.floor(
                    (Date.now() - tenant.gracePeriodStartedAt!.getTime()) / (1000 * 60 * 60 * 24)
                );
                const daysRemaining = gracePeriodDays - daysSinceGracePeriod;

                const emailTemplate = getGracePeriodWarningEmail(
                    tenant.name,
                    tenant.email,
                    daysRemaining
                );
                await sendEmail(emailTemplate);

                logger.info('Grace period warning sent', {
                    tenantId: tenant.id,
                    daysRemaining,
                });
            } catch (error) {
                logger.error('Error sending grace period warning', error, {
                    tenantId: tenant.id,
                });
            }
        }

        logger.info('Grace period warning job completed', {
            tenantsWarned: tenantsToWarn.length,
        });

        return {
            success: true,
            tenantsWarned: tenantsToWarn.length,
        };
    } catch (error) {
        logger.error('Error running grace period warning job', error);
        throw error;
    }
}

// Lambda handler for AWS
export const handler = async (event: any) => {
    const jobType = event.jobType || 'expiry';

    if (jobType === 'warning') {
        return await runGracePeriodWarningJob();
    } else {
        return await runGracePeriodJob();
    }
};
