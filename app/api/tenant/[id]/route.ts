import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/config/dbConfig';
import { transitionTenantState } from '@/backend/services/lifecycle';
import { tenantStateTransitionSchema } from '@/backend/utils/validators';
import { logger } from '@/backend/utils/logger';

// GET /api/tenant/[id]
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const tenantId = params.id;

        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: {
                id: true,
                name: true,
                email: true,
                state: true,
                trialEndsAt: true,
                gracePeriodStartedAt: true,
                suspendedAt: true,
                archivedAt: true,
                logoUrl: true,
                primaryColor: true,
                customDomain: true,
                subdomain: true,
                maxClients: true,
                maxStorageGB: true,
                enableMFA: true,
                subscriptionStatus: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        return NextResponse.json({ tenant });
    } catch (error) {
        logger.error('Error fetching tenant', error);
        return NextResponse.json({ error: 'Failed to fetch tenant' }, { status: 500 });
    }
}

// PATCH /api/tenant/[id]/state
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const tenantId = params.id;
        const body = await req.json();
        const validation = tenantStateTransitionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.issues },
                { status: 400 }
            );
        }

        const { newState, reason } = validation.data;
        const actorId = body.actorId; // Optional

        const result = await transitionTenantState(tenantId, newState, reason, actorId);

        if (!result.success) {
            return NextResponse.json({ error: result.message }, { status: 400 });
        }

        return NextResponse.json({
            message: result.message,
            tenant: result.tenant,
        });
    } catch (error) {
        logger.error('Error transitioning tenant state', error);
        return NextResponse.json({ error: 'Failed to transition state' }, { status: 500 });
    }
}
