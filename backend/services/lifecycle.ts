import { TenantState, AuditAction } from '@prisma/client';
import prisma from '../config/dbConfig';
import { logger } from '../utils/logger';

// Valid state transitions
const stateTransitions: Record<TenantState, TenantState[]> = {
    TRIAL: ['ACTIVE', 'SUSPENDED'],
    ACTIVE: ['GRACE_PERIOD', 'SUSPENDED'],
    GRACE_PERIOD: ['ACTIVE', 'SUSPENDED'],
    SUSPENDED: ['ACTIVE', 'ARCHIVED'],
    ARCHIVED: [], // No transitions from archived
};

export function canTransition(currentState: TenantState, newState: TenantState): boolean {
    return stateTransitions[currentState].includes(newState);
}

export interface StateTransitionResult {
    success: boolean;
    message: string;
    tenant?: any;
}

export async function transitionTenantState(
    tenantId: string,
    newState: TenantState,
    reason: string,
    actorId?: string
): Promise<StateTransitionResult> {
    try {
        // Fetch current tenant
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            return {
                success: false,
                message: 'Tenant not found',
            };
        }

        // Check if transition is valid
        if (!canTransition(tenant.state, newState)) {
            logger.warn('Invalid state transition attempted', {
                tenantId,
                currentState: tenant.state,
                newState,
                reason,
            });
            return {
                success: false,
                message: `Cannot transition from ${tenant.state} to ${newState}`,
            };
        }

        // Prepare update data
        const updateData: any = {
            state: newState,
        };

        // Set lifecycle timestamps
        switch (newState) {
            case 'GRACE_PERIOD':
                updateData.gracePeriodStartedAt = new Date();
                break;
            case 'SUSPENDED':
                updateData.suspendedAt = new Date();
                break;
            case 'ARCHIVED':
                updateData.archivedAt = new Date();
                break;
            case 'ACTIVE':
                // Clear grace period timestamp when returning to active
                updateData.gracePeriodStartedAt = null;
                break;
        }

        // Update tenant state
        const updatedTenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: updateData,
        });

        // Log state change in audit log
        await logStateChange(tenantId, tenant.state, newState, reason, actorId);

        logger.info('Tenant state transitioned successfully', {
            tenantId,
            oldState: tenant.state,
            newState,
            reason,
        });

        return {
            success: true,
            message: `Tenant transitioned from ${tenant.state} to ${newState}`,
            tenant: updatedTenant,
        };
    } catch (error) {
        logger.error('Error transitioning tenant state', error, { tenantId, newState, reason });
        return {
            success: false,
            message: 'Internal error during state transition',
        };
    }
}

export async function logStateChange(
    tenantId: string,
    oldState: TenantState,
    newState: TenantState,
    reason: string,
    actorId?: string
): Promise<void> {
    try {
        await prisma.auditLog.create({
            data: {
                action: AuditAction.TENANT_STATE_CHANGE,
                tenantId,
                userId: actorId || null,
                resourceType: 'tenant',
                resourceId: tenantId,
                beforeState: { state: oldState },
                afterState: { state: newState },
                metadata: { reason },
            },
        });
    } catch (error) {
        logger.error('Error logging state change', error, { tenantId, oldState, newState });
    }
}

// Helper function to check if tenant is in good standing
export function isTenantActive(state: TenantState): boolean {
    return state === 'TRIAL' || state === 'ACTIVE';
}

// Helper function to check if tenant can access services
export function canAccessServices(state: TenantState): boolean {
    return state === 'TRIAL' || state === 'ACTIVE' || state === 'GRACE_PERIOD';
}

// Get tenants in grace period that need to be suspended
export async function getTenantsForGracePeriodExpiry(): Promise<any[]> {
    const gracePeriodDays = parseInt(process.env.GRACE_PERIOD_DAYS || '7', 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - gracePeriodDays);

    return prisma.tenant.findMany({
        where: {
            state: 'GRACE_PERIOD',
            gracePeriodStartedAt: {
                lte: cutoffDate,
            },
        },
    });
}

// Get tenants in suspended state that need to be archived
export async function getTenantsForArchival(): Promise<any[]> {
    const suspensionDays = parseInt(process.env.SUSPENSION_TO_ARCHIVE_DAYS || '30', 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - suspensionDays);

    return prisma.tenant.findMany({
        where: {
            state: 'SUSPENDED',
            suspendedAt: {
                lte: cutoffDate,
            },
        },
    });
}
