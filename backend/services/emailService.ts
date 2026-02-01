import sgMail from '../config/sendgridConfig';
import { sendgridConfig } from '../config/sendgridConfig';
import { logger } from '../utils/logger';
import { TenantState } from '@prisma/client';

export interface EmailTemplate {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail(template: EmailTemplate): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
        logger.warn('SendGrid not configured, skipping email send', { to: template.to });
        return false;
    }

    try {
        await sgMail.send({
            from: {
                email: sendgridConfig.fromEmail,
                name: sendgridConfig.fromName,
            },
            to: template.to,
            subject: template.subject,
            html: template.html,
            text: template.text || '',
        });

        logger.info('Email sent successfully', { to: template.to, subject: template.subject });
        return true;
    } catch (error) {
        logger.error('Error sending email', error, { to: template.to });
        return false;
    }
}

// Email templates
export function getPaymentFailedEmail(tenantName: string, tenantEmail: string): EmailTemplate {
    return {
        to: tenantEmail,
        subject: 'Payment Failed - Action Required',
        html: `
      <h2>Payment Failed</h2>
      <p>Hello ${tenantName},</p>
      <p>We were unable to process your recent payment. Your account has been moved to a grace period.</p>
      <p>Please update your payment method within 7 days to avoid service interruption.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/billing">Update Payment Method</a></p>
      <p>Thank you,<br/>The TaxFlow Team</p>
    `,
        text: `Payment Failed\n\nHello ${tenantName},\n\nWe were unable to process your recent payment. Your account has been moved to a grace period.\n\nPlease update your payment method within 7 days to avoid service interruption.\n\nVisit ${process.env.NEXT_PUBLIC_APP_URL}/billing to update your payment method.\n\nThank you,\nThe TaxFlow Team`,
    };
}

export function getGracePeriodWarningEmail(tenantName: string, tenantEmail: string, daysRemaining: number): EmailTemplate {
    return {
        to: tenantEmail,
        subject: `Grace Period Ending Soon - ${daysRemaining} Days Remaining`,
        html: `
      <h2>Grace Period Ending Soon</h2>
      <p>Hello ${tenantName},</p>
      <p>Your account is in a grace period and will be suspended in ${daysRemaining} days if payment is not received.</p>
      <p>Please update your payment method immediately to avoid service interruption.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/billing">Update Payment Method</a></p>
      <p>Thank you,<br/>The TaxFlow Team</p>
    `,
        text: `Grace Period Ending Soon\n\nHello ${tenantName},\n\nYour account is in a grace period and will be suspended in ${daysRemaining} days if payment is not received.\n\nPlease update your payment method immediately.\n\nVisit ${process.env.NEXT_PUBLIC_APP_URL}/billing\n\nThank you,\nThe TaxFlow Team`,
    };
}

export function getSuspensionNoticeEmail(tenantName: string, tenantEmail: string): EmailTemplate {
    return {
        to: tenantEmail,
        subject: 'Account Suspended',
        html: `
      <h2>Account Suspended</h2>
      <p>Hello ${tenantName},</p>
      <p>Your account has been suspended due to non-payment. All services have been disabled.</p>
      <p>To reactivate your account, please update your payment method and contact support.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/billing">Update Payment Method</a></p>
      <p>Thank you,<br/>The TaxFlow Team</p>
    `,
        text: `Account Suspended\n\nHello ${tenantName},\n\nYour account has been suspended due to non-payment. All services have been disabled.\n\nTo reactivate your account, please update your payment method and contact support.\n\nVisit ${process.env.NEXT_PUBLIC_APP_URL}/billing\n\nThank you,\nThe TaxFlow Team`,
    };
}

export function getReactivationEmail(tenantName: string, tenantEmail: string): EmailTemplate {
    return {
        to: tenantEmail,
        subject: 'Account Reactivated',
        html: `
      <h2>Account Reactivated</h2>
      <p>Hello ${tenantName},</p>
      <p>Great news! Your account has been reactivated and all services are now available.</p>
      <p>Thank you for your payment.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Access Dashboard</a></p>
      <p>Thank you,<br/>The TaxFlow Team</p>
    `,
        text: `Account Reactivated\n\nHello ${tenantName},\n\nGreat news! Your account has been reactivated and all services are now available.\n\nThank you for your payment.\n\nVisit ${process.env.NEXT_PUBLIC_APP_URL}/dashboard\n\nThank you,\nThe TaxFlow Team`,
    };
}

export function getWelcomeEmail(tenantName: string, tenantEmail: string): EmailTemplate {
    return {
        to: tenantEmail,
        subject: 'Welcome to TaxFlow Platform',
        html: `
      <h2>Welcome to TaxFlow Platform</h2>
      <p>Hello ${tenantName},</p>
      <p>Thank you for signing up! Your account is now active.</p>
      <p>Get started by logging in and exploring the platform.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/login">Login Now</a></p>
      <p>Thank you,<br/>The TaxFlow Team</p>
    `,
        text: `Welcome to TaxFlow Platform\n\nHello ${tenantName},\n\nThank you for signing up! Your account is now active.\n\nGet started by logging in at ${process.env.NEXT_PUBLIC_APP_URL}/login\n\nThank you,\nThe TaxFlow Team`,
    };
}
