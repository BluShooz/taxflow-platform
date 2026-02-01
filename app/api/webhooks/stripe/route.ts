import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
import stripe, { stripeConfig } from '@/backend/config/stripeConfig';
import { handleWebhookEvent } from '@/backend/services/billingService';
import { logger } from '@/backend/utils/logger';
import prisma from '@/backend/config/dbConfig';

// Enum workaround
const AuditAction = {
    SUBSCRIPTION_UPDATED: 'SUBSCRIPTION_UPDATED' as any,
} as const;

// POST /api/webhooks/stripe
export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature');

        if (!signature) {
            logger.warn('Missing Stripe signature');
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        // Verify webhook signature
        let event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, stripeConfig.webhookSecret);
        } catch (err: any) {
            logger.error('Webhook signature verification failed', err);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // Check for duplicate events (idempotency)
        const existingLog = await prisma.auditLog.findFirst({
            where: {
                metadata: {
                    path: ['stripeEventId'],
                    equals: event.id,
                },
            },
        });

        if (existingLog) {
            logger.info('Duplicate webhook event, skipping', { eventId: event.id });
            return NextResponse.json({ received: true, duplicate: true });
        }

        // Process webhook event
        await handleWebhookEvent(event);

        // Log webhook event in audit log
        await prisma.auditLog.create({
            data: {
                action: AuditAction.SUBSCRIPTION_UPDATED,
                resourceType: 'webhook',
                resourceId: event.id,
                metadata: {
                    stripeEventId: event.id,
                    eventType: event.type,
                },
            },
        });

        logger.info('Webhook processed successfully', { eventId: event.id, type: event.type });

        return NextResponse.json({ received: true });
    } catch (error) {
        logger.error('Error processing webhook', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
