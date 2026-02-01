'use client';

import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    FileText,
    UploadCloud,
    MessageSquare,
    Settings,
    LogOut,
    Bell,
    CheckCircle2,
    Clock,
    AlertCircle,
    Download
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CrashGuard } from '@/components/ui/CrashGuard';

export default function ClientDashboard() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('taxflow_session');
            if (!stored) {
                window.location.href = '/login';
                return;
            }
            setUser(JSON.parse(stored));
            setLoading(false);
        } catch (e) {
            window.location.href = '/login';
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('taxflow_session');
        window.location.href = '/login';
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-20">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="bg-indigo-600 h-8 w-8 rounded-lg flex items-center justify-center">
                            <LayoutDashboard className="text-white h-5 w-5" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">TaxFlow<span className="text-indigo-600">Client</span></span>
                    </div>

                    <nav className="space-y-1">
                        <NavItem href="/portal/client" icon={<LayoutDashboard size={18} />} label="Overview" active />
                        <NavItem href="/portal/client/documents" icon={<FileText size={18} />} label="My Documents" />
                        <NavItem href="/portal/client/upload" icon={<UploadCloud size={18} />} label="Upload Center" />
                        <NavItem href="/portal/client/messages" icon={<MessageSquare size={18} />} label="Messages" badge="2" />
                        <NavItem href="/portal/client/settings" icon={<Settings size={18} />} label="Settings" />
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-slate-100">
                    <button onClick={handleLogout} className="flex items-center gap-3 text-slate-500 hover:text-red-600 transition-colors w-full text-sm font-medium">
                        <LogOut size={18} />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64">
                <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Welcome back, {user?.firstName || 'Client'}</h1>
                        <p className="text-sm text-slate-500">Here is what's happening with your tax return.</p>
                    </div>
                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-600">
                        <span className="font-bold">{user?.firstName?.[0] || 'C'}</span>
                    </div>
                </header>

                <div className="p-8 space-y-8">
                    {/* Status Tracker */}
                    <CrashGuard name="Status Tracker">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6">Return Status</h2>
                            <div className="relative">
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2"></div>
                                <div className="relative flex justify-between">
                                    <StatusStep icon={<CheckCircle2 />} label="Documents" status="complete" />
                                    <StatusStep icon={<Clock />} label="Preparation" status="active" />
                                    <StatusStep icon={<AlertCircle />} label="Review" status="pending" />
                                    <StatusStep icon={<Download />} label="Filing" status="pending" />
                                </div>
                            </div>
                        </div>
                    </CrashGuard>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <CrashGuard name="Action Cards">
                            <ActionCard
                                icon={<UploadCloud className="text-indigo-600" />}
                                title="Upload Documents"
                                desc="Securely upload W-2s, 1099s, and other tax forms."
                            />
                            <ActionCard
                                icon={<MessageSquare className="text-emerald-600" />}
                                title="Message CPA"
                                desc="Ask questions directly to your dedicated tax pro."
                            />
                            <ActionCard
                                icon={<FileText className="text-blue-600" />}
                                title="Previous Returns"
                                desc="Access and download your tax returns from prior years."
                            />
                        </CrashGuard>
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active, badge, href }: any) {
    return (
        <a href={href || '#'} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>
            {icon}
            <span className="text-sm">{label}</span>
            {badge && <span className="ml-auto bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>}
        </a>
    )
}

function StatusStep({ icon, label, status }: any) {
    const colors = status === 'complete' ? 'bg-emerald-500 text-white ring-4 ring-emerald-50'
        : status === 'active' ? 'bg-indigo-600 text-white ring-4 ring-indigo-50'
            : 'bg-slate-100 text-slate-400';

    return (
        <div className="flex flex-col items-center gap-2 bg-white z-10 px-2">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${colors}`}>
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <span className={`text-xs font-bold ${status === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>{label}</span>
        </div>
    )
}

function ActionCard({ icon, title, desc }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="mb-4 bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
        </div>
    )
}
