
const VALID_EMAIL = 'owner@taxflow.com';
const VALID_PASSWORD = 'admin123';
const BASE_URL = 'https://taxflow-platform.vercel.app';

async function test() {
    console.log(`1. Logging in to ${BASE_URL}...`);
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: VALID_EMAIL, password: VALID_PASSWORD })
    });

    const data = await loginRes.json();
    if (!loginRes.ok) {
        console.error('Login Failed:', data);
        process.exit(1);
    }

    const token = data.accessToken;
    console.log('Login Success. Token:', token.substring(0, 20) + '...');

    console.log('\n2. Testing Portal Access (Simulation)...');
    const portalRes = await fetch(`${BASE_URL}/portal/admin`, {
        method: 'HEAD',
        headers: {
            'Cookie': `taxflow_token=${token}`,
            'User-Agent': 'TestScript/1.0'
        },
        redirect: 'manual'
    });

    console.log(`Status: ${portalRes.status} ${portalRes.statusText}`);
    console.log('Headers:', Object.fromEntries(portalRes.headers.entries()));

    if (portalRes.status === 200) {
        console.log('\n✅ SUCCESS: Middleware ACCEPTED the token. Portal page is accessible.');
    } else if (portalRes.status === 307 || portalRes.status === 302 || portalRes.status === 308) {
        console.log(`\n❌ FAILURE: Middleware REDIRECTED to: ${portalRes.headers.get('location')}`);
        console.log('This confirms the Middleware REJECTED the token.');
    } else {
        console.log(`\n❓ UNEXPECTED: Got status ${portalRes.status}`);
    }
}

test();
