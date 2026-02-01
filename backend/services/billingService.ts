import stripe, { stripeConfig } from '../config/stripeConfig';
import prisma from '../config/dbConfig';
import { transitionTenantState } from './lifecycle';
import { logger } from '../utils/logger';
import { sendEmail, getPaymentFailedEmail, getReactivationEmail } from './emailService';

export interface CreateSubscriptionInput {
    tenantId: string;
    priceId: string;
    paymentMethodId?: string;
}

export async function createSubscription(input: CreateSubscriptionInput) {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id: input.tenantId },
        });

        if (!tenant) {
            throw new Error('Tenant not found');
        }

        let customerId = tenant.stripeCustomerId;

        // Create Stripe customer if doesn't exist
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: tenant.email,
                name: tenant.name,
                metadata: {
                    tenantId: tenant.id,
                },
            });
            customerId = customer.id;

            await prisma.tenant.update({
                where: { id: tenant.id },
                data: { stripeCustomerId: customerId },
            });
        }

        // Attach payment method if provided
        if (input.paymentMethodId) {
            await stripe.paymentMethods.attach(input.paymentMethodId, {
                customer: customerId,
            });

            await stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: input.paymentMethodId,
                },
            });
        }

        // Create subscription
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: input.priceId }],
            metadata: {
                tenantId: tenant.id,
            },
        });

        // Update tenant with subscription details
        await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
                stripeSubscriptionId: subscription.id,
                stripePriceId: input.priceId,
                subscriptionStatus: subscription.status,
            },
        });

        logger.info('Subscription created successfully', {
            tenantId: tenant.id,
            subscriptionId: subscription.id,
        });

        return subscription;
    } catch (error) {
        logger.error('Error creating subscription', error, { tenantId: input.tenantId });
        throw error;
    }
}

export async function updateSubscription(tenantId: string, newPriceId: string) {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant || !tenant.stripeSubscriptionId) {
            throw new Error('Tenant or subscription not found');
        }

        const subscription = await stripe.subscriptions.retrieve(tenant.stripeSubscriptionId);

        const updatedSubscription = await stripe.subscriptions.update(tenant.stripeSubscriptionId, {
            items: [
                {
                    id: subscription.items.data[0].id,
                    price: newPriceId,
                },
            ],
        });

        await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                stripePriceId: newPriceId,
                subscriptionStatus: updatedSubscription.status,
            },
        });

        logger.info('Subscription updated successfully', {
            tenantId,
            newPriceId,
        });

        return updatedSubscription;
    } catch (error) {
        logger.error('Error updating subscription', error, { tenantId });
        throw error;
    }
}

export async function cancelSubscription(tenantId: string) {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant || !tenant.stripeSubscriptionId) {
            throw new Error('Tenant or subscription not found');
        }

        const subscription = await stripe.subscriptions.update(tenant.stripeSubscriptionId, {
            cancel_at_period_end: true,
        });

        await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                subscriptionStatus: subscription.status,
            },
        });

        logger.info('Subscription canceled (at period end)', { tenantId });

        return subscription;
    } catch (error) {
        logger.error('Error canceling subscription', error, { tenantId });
        throw error;
    }
}

export async function handleWebhookEvent(event: any) {
    try {
        logger.info('Processing Stripe webhook event', { type: event.type, id: event.id });

        switch (event.type) {
            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object);
                break;

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;

            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;

            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(event.data.object);
                break;

            default:
                logger.debug('Unhandled webhook event type', { type: event.type });
        }
    } catch (error) {
        logger.error('Error handling webhook event', error, { eventType: event.type });
        throw error;
    }
}

async function handleSubscriptionCreated(subscription: any) {
    const tenantId = subscription.metadata.tenantId;
    if (!tenantId) return;

    await prisma.tenant.update({
        where: { id: tenantId },
        data: {
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
        },
    });

    // Transition to ACTIVE if payment succeeded
    if (subscription.status === 'active') {
        await transitionTenantState(tenantId, 'ACTIVE', 'Subscription activated via Stripe');
    }
}

async function handleSubscriptionUpdated(subscription: any) {
    const tenantId = subscription.metadata.tenantId;
    if (!tenantId) return;

    await prisma.tenant.update({
        where: { id: tenantId },
        data: {
            subscriptionStatus: subscription.status,
        },
    });
}

async function handleSubscriptionDeleted(subscription: any) {
    const tenantId = subscription.metadata.tenantId;
    if (!tenantId) return;

    await transitionTenantState(tenantId, 'GRACE_PERIOD', 'Subscription canceled');
}

async function handlePaymentFailed(invoice: any) {
    const customerId = invoice.customer;
    const tenant = await prisma.tenant.findFirst({
        where: { stripeCustomerId: customerId },
    });

    if (!tenant) return;

    await transitionTenantState(tenant.id, 'GRACE_PERIOD', 'Payment failed');

    // Send email notification
    const emailTemplate = getPaymentFailedEmail(tenant.name, tenant.email);
    await sendEmail(emailTemplate);
}

async function handlePaymentSucceeded(invoice: any) {
    const customerId = invoice.customer;
    const tenant = await prisma.tenant.findFirst({
        where: { stripeCustomerId: customerId },
    });

    if (!tenant) return;

    // If tenant was in grace period, reactivate
    if (tenant.state === 'GRACE_PERIOD') {
        await transitionTenantState(tenant.id, 'ACTIVE', 'Payment succeeded');

        // Send reactivation email
        const emailTemplate = getReactivationEmail(tenant.name, tenant.email);
        await sendEmail(emailTemplate);
    }
}
