import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_ACCESS_SECRET = new TextEncoder().encode(
    process.env.JWT_ACCESS_SECRET || 'fallback-secret-12345678'
);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Define public routes
    const isPublicRoute =
        pathname === '/' ||
        pathname === '/login' ||
        pathname.startsWith('/api/auth') ||
        pathname.includes('_next') ||
        pathname.includes('favicon.ico');

    if (isPublicRoute) {
        return NextResponse.next();
    }

    // 2. Get token from header or cookie
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        token = request.cookies.get('taxflow_token')?.value || null;
    }

    if (!token) {
        // If it's a browser navigation to a portal, redirect to login
        if (pathname.startsWith('/portal')) {
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
        // If it's an API call, return unauthorized
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 3. Verify token
        const { payload } = await jwtVerify(token, JWT_ACCESS_SECRET);
        const userRole = payload.role as string;
        const tenantId = payload.tenantId as string;

        // 4. Enforce RBAC
        // Client Portal
        if (pathname.startsWith('/portal/client') && userRole !== 'CLIENT') {
            return NextResponse.json({ error: 'Forbidden: Clients only' }, { status: 403 });
        }

        // Tax Pro Portal
        if (pathname.startsWith('/portal/pro') && userRole !== 'TAX_PRO') {
            return NextResponse.json({ error: 'Forbidden: Tax Pros only' }, { status: 403 });
        }

        // SaaS Admin Portal
        if (pathname.startsWith('/portal/admin') && userRole !== 'SAAS_OWNER') {
            return NextResponse.json({ error: 'Forbidden: SaaS Owners only' }, { status: 403 });
        }

        // 5. Cross-Tenant Protection (Lateral Movement Prevention)
        // If the path contains a tenant ID as a param /api/tenant/[id]
        const tenantMatch = pathname.match(/\/api\/tenant\/([^\/]+)/);
        if (tenantMatch && userRole !== 'SAAS_OWNER') {
            const requestedTenantId = tenantMatch[1];
            if (requestedTenantId !== tenantId) {
                return NextResponse.json({ error: 'Forbidden: Cross-tenant access denied' }, { status: 403 });
            }
        }

        // For /api/files, check tenantId in searchParams
        if (pathname.startsWith('/api/files') && userRole !== 'SAAS_OWNER') {
            const requestedTenantId = request.nextUrl.searchParams.get('tenantId');
            if (requestedTenantId && requestedTenantId !== tenantId) {
                return NextResponse.json({ error: 'Forbidden: Cross-tenant access denied' }, { status: 403 });
            }
        }

        // 6. Success
        return NextResponse.next();
    } catch (error) {
        console.error('Middleware JWT Error:', error);
        if (pathname.startsWith('/portal')) {
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/portal/:path*', '/api/:path*'],
};
