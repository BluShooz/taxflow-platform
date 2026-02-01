import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
    console.warn('SENDGRID_API_KEY not configured. Email functionality will be disabled.');
}

export const sendgridConfig = {
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@taxflow.com',
    fromName: process.env.SENDGRID_FROM_NAME || 'TaxFlow Platform',
};

export default sgMail;
