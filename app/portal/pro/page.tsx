'use client';

import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    Users,
    FileCheck,
    Calendar,
    Search,
    Bell,
    LogOut,
    TrendingUp,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CrashGuard } from '@/components/ui/CrashGuard';

export default function ProDashboard() {
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
            <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col fixed h-full z-20">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="bg-purple-600 h-8 w-8 rounded-lg flex items-center justify-center">
                            <Briefcase className="text-white h-5 w-5" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-white">TaxFlow<span className="text-purple-400">Pro</span></span>
                    </div>

                    <nav className="space-y-1">
                        <NavItem href="/portal/pro" icon={<Briefcase size={18} />} label="Workspace" active />
                        <NavItem href="/portal/pro/clients" icon={<Users size={18} />} label="Clients" />
                        <NavItem href="/portal/pro/returns" icon={<FileCheck size={18} />} label="Returns" badge="12" />
                        <NavItem href="/portal/pro/schedule" icon={<Calendar size={18} />} label="Schedule" />
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-slate-800">
                    <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full text-sm font-medium">
                        <LogOut size={18} />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 bg-slate-50">
                <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4 w-full max-w-md bg-slate-100 px-4 py-2 rounded-lg">
                        <Search size={18} className="text-slate-400" />
                        <input type="text" placeholder="Search clients, returns, or forms..." className="bg-transparent border-none outline-none text-sm w-full" />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="h-9 w-9 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold border border-purple-200">
                            {user?.firstName?.[0] || 'P'}
                        </div>
                    </div>
                </header>

                <div className="p-8 space-y-8">
                    <CrashGuard name="Stats Grid">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatCard label="Pending Review" value="12" icon={<AlertCircle className="text-orange-500" />} />
                            <StatCard label="Completed Today" value="5" icon={<CheckCircle className="text-emerald-500" />} />
                            <StatCard label="Active Clients" value="48" icon={<Users className="text-blue-500" />} />
                            <StatCard label="Efficiency" value="+18%" icon={<TrendingUp className="text-purple-500" />} />
                        </div>
                    </CrashGuard>

                    <CrashGuard name="Task List">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">Priority Tasks</h3>
                                <button className="text-sm text-purple-600 font-bold hover:underline">View All</button>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                        <div className="flex items-center gap-4">
                                            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">Review 1040 for Smith Family Trust</p>
                                                <p className="text-xs text-slate-500">Due Today • 1040 Indiv</p>
                                            </div>
                                        </div>
                                        <button className="px-3 py-1 text-xs font-bold border border-slate-200 rounded-lg hover:border-purple-500 hover:text-purple-600 transition-colors">Start</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CrashGuard>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active, badge, href }: any) {
    return (
        <a href={href || '#'} className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${active ? 'bg-purple-600/20 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            {icon}
            <span className="text-sm font-medium">{label}</span>
            {badge && <span className="ml-auto bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>}
        </a>
    )
}

function StatCard({ label, value, icon }: any) {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-purple-200 transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                {icon}
            </div>
            <p className="text-2xl font-black text-slate-900">{value}</p>
        </div>
    )
}
