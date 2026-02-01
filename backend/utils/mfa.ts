import { authenticator } from '@otplib/preset-default';
import QRCode from 'qrcode';

export interface MFASetup {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
}

// Generate MFA secret
export function generateMFASecret(): string {
    return authenticator.generateSecret();
}

// Generate QR code for MFA setup
export async function generateMFAQRCode(email: string, secret: string): Promise<string> {
    const otpauth = authenticator.keyuri(email, 'TaxFlow Platform', secret);
    return QRCode.toDataURL(otpauth);
}

// Verify MFA token
export function verifyMFAToken(token: string, secret: string): boolean {
    try {
        return authenticator.verify({ token, secret });
    } catch (error) {
        return false;
    }
}

// Generate backup codes
export function generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        codes.push(code);
    }
    return codes;
}

// Complete MFA setup
export async function setupMFA(email: string): Promise<MFASetup> {
    const secret = generateMFASecret();
    const qrCodeUrl = await generateMFAQRCode(email, secret);
    const backupCodes = generateBackupCodes();

    return {
        secret,
        qrCodeUrl,
        backupCodes,
    };
}
