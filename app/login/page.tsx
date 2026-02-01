'use client';

import React, { useState } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('owner@taxflow.com');
    const [password, setPassword] = useState('admin123');
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [showDebug, setShowDebug] = useState(false);

    const log = (msg: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
        console.log(msg);
    };

    const handleLogin = async () => {
        if (loading) return;
        setLoading(true);
        setLogs([]); // Clear previous logs
        log('🚀 Starting login sequence...');

        try {
            // STEP 1: API LOGIN
            log('Step 1: Sending credentials to /api/auth/login...');
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            log(`API Response Status: ${response.status}`);

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // STEP 2: SET COOKIE
            log('Step 2: Setting secure cookie...');
            const isProduction = window.location.protocol === 'https:';
            const cookieString = `taxflow_token=${data.accessToken}; path=/; max-age=3600; SameSite=Lax${isProduction ? '; Secure' : ''}`;
            document.cookie = cookieString;

            // Verify cookie was set
            if (document.cookie.includes('taxflow_token')) {
                log('✅ Cookie exists in document.cookie');
            } else {
                log('⚠️ WARNING: Cookie NOT found in document.cookie immediately after setting!');
                // Check if browser is blocking it
                if (isProduction && window.location.protocol !== 'https:') {
                    log('❌ ERROR: Secure cookie blocked because protocol is HTTP!');
                }
            }

            // STEP 3: LOCAL STORAGE
            log('Step 3: Updating LocalStorage...');
            localStorage.setItem('taxflow_session', JSON.stringify({
                ...data.user,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken
            }));
            log('✅ LocalStorage updated');

            // STEP 4: SERVER-SIDE VERIFICATION
            log('Step 4: Verifying session with server...');
            try {
                const verifyRes = await fetch('/api/auth/verify');
                const verifyData = await verifyRes.json();

                if (verifyRes.ok && verifyData.ok) {
                    log('✅ Server accepted session cookie!');
                } else {
                    log(`❌ Server REJECTED session cookie! Error: ${verifyData.error}`);
                    log('This means Middleware will likely block the redirect.');
                    // Don't stop, try redirect anyway but warn user
                }
            } catch (vErr) {
                log('⚠️ Verification check failed (network/server error)');
            }

            // STEP 5: REDIRECT
            const target = data.user.role === 'CLIENT' ? '/portal/client'
                : data.user.role === 'TAX_PRO' ? '/portal/pro'
                    : '/portal/admin';

            log(`Step 5: Redirecting to ${target}...`);
            await new Promise(r => setTimeout(r, 1000)); // Short pause to let user see logs
            window.location.href = target;

        } catch (err: any) {
            log(`❌ CRITICAL ERROR: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (e: string, p: string) => {
        setEmail(e);
        setPassword(p);
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-indigo-600 p-6 text-center">
                    <h1 className="text-2xl font-bold text-white">TaxFlow Login</h1>
                    <p className="text-indigo-100 text-sm mt-1">Diagnostic Mode v2.0</p>
                </div>

                <div className="p-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all"
                        >
                            {loading ? 'Running Diagnostics...' : 'Log In & Diagnose'}
                        </button>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={showDebug}
                                onChange={e => setShowDebug(e.target.checked)}
                                id="debug"
                            />
                            <label htmlFor="debug" className="text-xs text-slate-500">Show Real-time Logs</label>
                        </div>

                        {(loading || logs.length > 0) && (
                            <div className="bg-slate-900 text-green-400 p-4 rounded-xl text-xs font-mono overflow-auto max-h-48">
                                <p className="text-slate-500 border-b border-slate-800 pb-2 mb-2">SYSTEM LOGS:</p>
                                {logs.map((L, i) => (
                                    <div key={i} className="mb-1">{L}</div>
                                ))}
                                {loading && <div className="animate-pulse">_</div>}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="grid gap-2">
                            <button
                                type="button"
                                onClick={() => fillDemo('owner@taxflow.com', 'admin123')}
                                className="p-2 text-center bg-slate-50 border rounded text-xs"
                            >
                                Fill Admin Demo
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemo('client@taxflow.com', 'client123')}
                                className="p-2 text-center bg-slate-50 border rounded text-xs"
                            >
                                Fill Client Demo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
