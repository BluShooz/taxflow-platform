'use client';

import React, { useState, useEffect } from 'react';

export default function SafeProDashboard() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem('taxflow_session');
        if (stored) setUser(JSON.parse(stored));
        else window.location.href = '/login';
    }, []);

    if (!user) return <div className="p-10">Loading...</div>;

    return (
        <div className="min-h-screen bg-white p-8 font-mono">
            <div className="max-w-4xl mx-auto border-2 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h1 className="text-3xl font-black uppercase mb-4">TAX PRO PORTAL (SAFE MODE)</h1>
                <p>Welcome, {user.firstName} {user.lastName}</p>
            </div>
        </div>
    );
}
