'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestLoginPage() {
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const testLogin = async () => {
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
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            setResult(data);

            // Set cookie
            document.cookie = `taxflow_token=${data.accessToken}; path=/; max-age=3600; SameSite=Lax; Secure`;

            // Store in localStorage
            localStorage.setItem('taxflow_session', JSON.stringify({
                ...data.user,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken
            }));

            // Try to navigate
            setTimeout(() => {
                router.push('/portal/admin');
            }, 1000);

        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Login Test Page</h1>
                
                <button
                    onClick={testLogin}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                >
                    Test Login (owner@taxflow.com)
                </button>

                {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 font-bold">Error: {error}</p>
                    </div>
                )}

                {result && (
                    <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                        <h2 className="text-xl font-bold text-green-900 mb-4">Login Successful!</h2>
                        <pre className="text-xs bg-white p-4 rounded border overflow-auto">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                        <p className="mt-4 text-sm text-green-700">
                            Cookie set. LocalStorage updated. Redirecting to portal in 1 second...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
