import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

const JWT_ACCESS_SECRET = new TextEncoder().encode(
    'emergency-hardcoded-secret-fix-2026-middleware'
);

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('taxflow_token')?.value;

        if (!token) {
            return NextResponse.json({ ok: false, error: 'No cookie found' }, { status: 401 });
        }

        try {
            await jwtVerify(token, JWT_ACCESS_SECRET);
            return NextResponse.json({ ok: true });
        } catch (e: any) {
            return NextResponse.json({ ok: false, error: 'Token verification failed: ' + e.message }, { status: 401 });
        }
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: 'Server error: ' + error.message }, { status: 500 });
    }
}
