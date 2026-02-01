'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SafeAdminDashboard() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        try {
            const stored = localStorage.getItem('taxflow_session');
            if (!stored) {
                window.location.href = '/login';
                return;
            }
            const userData = JSON.parse(stored);
            if (userData.role !== 'SAAS_OWNER') {
                window.location.href = '/login';
                return;
            }
            setUser(userData);

            // Fetch data safely
            fetch('/api/admin/stats')
                .then(r => r.json())
                .then(d => setStats(d))
                .catch(e => console.error(e))
                .finally(() => setLoading(false));

        } catch (e) {
            console.error(e);
            window.location.href = '/login';
        }
    }, []);

    if (loading) return <div className="p-10 font-mono text-lg">System Loading...</div>;
    if (!user) return <div className="p-10 font-mono text-lg">Access Denied</div>;

    return (
        <div className="min-h-screen bg-white text-slate-900 p-8 font-mono">
            <div className="max-w-4xl mx-auto border-2 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h1 className="text-3xl font-black uppercase mb-4 border-b-2 border-slate-900 pb-4">
                    ADMIN PORTAL (SAFE MODE)
                </h1>

                <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                    <p className="font-bold">⚠️ DIAGNOSTIC MODE ACTIVE</p>
                    <p>The standard UI has been temporarily disabled to prevent browser crashes. This is a failsafe view.</p>
                </div>

                <div className="grid gap-6 mb-8">
                    <div className="p-4 border border-slate-200 bg-slate-50">
                        <h2 className="font-bold mb-2">CURRENT USER</h2>
                        <p>ID: {user.id}</p>
                        <p>EMAIL: {user.email}</p>
                        <p>ROLE: <span className="text-blue-600 font-bold">{user.role}</span></p>
                    </div>

                    <div className="p-4 border border-slate-200 bg-slate-50">
                        <h2 className="font-bold mb-2">SYSTEM STATS</h2>
                        <pre className="text-xs overflow-auto">
                            {JSON.stringify(stats || { message: "No stats available" }, null, 2)}
                        </pre>
                    </div>
                </div>

                <button
                    onClick={() => {
                        localStorage.removeItem('taxflow_session');
                        window.location.href = '/login';
                    }}
                    className="bg-red-600 text-white font-bold py-3 px-6 hover:bg-red-700"
                >
                    LOGOUT
                </button>
            </div>
        </div>
    );
}
