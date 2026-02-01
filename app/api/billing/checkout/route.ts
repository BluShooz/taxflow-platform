import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/backend/config/stripeConfig';
import prisma from '@/backend/config/dbConfig';
import { logger } from '@/backend/utils/logger';

export const dynamic = 'force-dynamic';

// POST /api/billing/checkout
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { tenantId, priceId } = body;

        if (!tenantId || !priceId) {
            return NextResponse.json({ error: 'Tenant ID and Price ID required' }, { status: 400 });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId }
        });

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/settings/billing?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/settings/billing?canceled=true`,
            customer: tenant.stripeCustomerId || undefined,
            customer_email: tenant.stripeCustomerId ? undefined : tenant.email,
            metadata: {
                tenantId: tenant.id
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        logger.error('Error creating checkout session', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
