'use client';

import React, { useState } from 'react';

export default function QuickTestPage() {
    const [status, setStatus] = useState('Ready to test');
    const [result, setResult] = useState<any>(null);

    const testDirectLogin = async () => {
        setStatus('Testing API...');
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'owner@taxflow.com',
                    password: 'admin123'
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('✅ API WORKS! Setting cookie...');

                // Set cookie exactly like login page
                const isProduction = window.location.protocol === 'https:';
                const cookieString = `taxflow_token=${data.accessToken}; path=/; max-age=3600; SameSite=Lax${isProduction ? '; Secure' : ''}`;
                document.cookie = cookieString;

                // Store in localStorage
                localStorage.setItem('taxflow_session', JSON.stringify({
                    ...data.user,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken
                }));

                setResult(data);
                setStatus('✅ COMPLETE! Cookie set. Try navigating to /portal/admin');
            } else {
                setStatus('❌ API Error: ' + data.error);
            }
        } catch (err: any) {
            setStatus('❌ Error: ' + err.message);
        }
    };

    const checkCookie = () => {
        const cookies = document.cookie;
        const hasCookie = cookies.includes('taxflow_token');
        setStatus(hasCookie ? '✅ Cookie exists!' : '❌ No cookie found');
        console.log('All cookies:', cookies);
    };

    const checkLocalStorage = () => {
        const session = localStorage.getItem('taxflow_session');
        setStatus(session ? '✅ Session exists!' : '❌ No session found');
        if (session) {
            console.log('Session:', JSON.parse(session));
        }
    };

    const goToPortal = () => {
        window.location.href = '/portal/admin';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
                <h1 className="text-4xl font-black text-slate-900 mb-2">🔧 Login Test Suite</h1>
                <p className="text-slate-600 mb-8">Emergency diagnostic tool</p>

                <div className="space-y-4">
                    <button
                        onClick={testDirectLogin}
                        className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg transition-all hover:scale-105 active:scale-95"
                    >
                        🚀 Test Full Login Flow
                    </button>

                    <button
                        onClick={checkCookie}
                        className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-lg shadow-lg transition-all hover:scale-105 active:scale-95"
                    >
                        🍪 Check Cookie Status
                    </button>

                    <button
                        onClick={checkLocalStorage}
                        className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-lg shadow-lg transition-all hover:scale-105 active:scale-95"
                    >
                        💾 Check LocalStorage
                    </button>

                    <button
                        onClick={goToPortal}
                        className="w-full px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-lg shadow-lg transition-all hover:scale-105 active:scale-95"
                    >
                        🎯 Navigate to Portal
                    </button>
                </div>

                <div className="mt-8 p-6 bg-slate-50 rounded-2xl border-2 border-slate-200">
                    <p className="text-sm font-bold text-slate-600 mb-2">STATUS:</p>
                    <p className="text-lg font-bold text-slate-900">{status}</p>
                </div>

                {result && (
                    <div className="mt-6 p-6 bg-green-50 rounded-2xl border-2 border-green-200">
                        <p className="text-sm font-bold text-green-800 mb-3">API RESPONSE:</p>
                        <pre className="text-xs bg-white p-4 rounded-xl overflow-auto border border-green-200">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}

                <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                        <strong>Protocol:</strong> {typeof window !== 'undefined' ? window.location.protocol : 'unknown'}<br />
                        <strong>Host:</strong> {typeof window !== 'undefined' ? window.location.host : 'unknown'}
                    </p>
                </div>
            </div>
        </div>
    );
}
