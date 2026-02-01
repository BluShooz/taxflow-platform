import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-01-27.acacia' as any,
    typescript: true,
});

export const stripeConfig = {
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    prices: {
        basic: process.env.STRIPE_PRICE_BASIC || '',
        pro: process.env.STRIPE_PRICE_PRO || '',
        premium: process.env.STRIPE_PRICE_PREMIUM || '',
    },
};

export default stripe;
