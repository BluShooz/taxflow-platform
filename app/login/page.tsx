'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('owner@taxflow.com');
    const [password, setPassword] = useState('admin123');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async () => {
        if (loading) return;

        setLoading(true);
        setStatus('Connecting to server...');
        setError(null);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            setStatus('Login successful! Securely storing credentials...');

            // Set cookie for middleware (Secure flag required for HTTPS production)
            const isProduction = window.location.protocol === 'https:';
            const cookieString = `taxflow_token=${data.accessToken}; path=/; max-age=3600; SameSite=Lax${isProduction ? '; Secure' : ''}`;
            document.cookie = cookieString;

            // Store user data in localStorage
            localStorage.setItem('taxflow_session', JSON.stringify({
                ...data.user,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken
            }));

            setStatus(`Redirecting to ${data.user.role} portal...`);

            // Redirect to appropriate portal
            if (data.user.role === 'CLIENT') {
                window.location.href = '/portal/client';
            } else if (data.user.role === 'TAX_PRO') {
                window.location.href = '/portal/pro';
            } else if (data.user.role === 'SAAS_OWNER') {
                window.location.href = '/portal/admin';
            } else {
                setError('Role not recognized for portal entry.');
            }
        } catch (err: any) {
            setError(err.message);
            setStatus('');
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
                    <p className="text-indigo-100 text-sm mt-1">Secure Client Access</p>
                </div>

                <div className="p-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                                <p className="font-bold">Login Error</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {status && (
                            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700">
                                <p className="font-bold">Status</p>
                                <p className="text-sm">{status}</p>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : 'Log In to Dashboard'}
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Demo Credentials</p>
                        <div className="grid gap-3">
                            <button
                                type="button"
                                onClick={() => fillDemo('client@taxflow.com', 'client123')}
                                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors"
                            >
                                <p className="text-indigo-600 font-bold text-xs">CLIENT</p>
                                <p className="text-slate-500 text-xs truncate">client@taxflow.com</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemo('pro@taxflow.com', 'pro123')}
                                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors"
                            >
                                <p className="text-purple-600 font-bold text-xs">TAX PRO</p>
                                <p className="text-slate-500 text-xs truncate">pro@taxflow.com</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemo('owner@taxflow.com', 'admin123')}
                                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors"
                            >
                                <p className="text-slate-900 font-bold text-xs">OWNER</p>
                                <p className="text-slate-500 text-xs truncate">owner@taxflow.com</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
