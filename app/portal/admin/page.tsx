'use client';

import React, { useState } from 'react';
import {
    Building2,
    Users,
    Database,
    ShieldCheck,
    BarChart3,
    Globe,
    LogOut,
    Activity,
    Server,
    ChevronRight,
    Search,
    AlertTriangle
} from 'lucide-react';
import { CrashGuard } from '@/components/ui/CrashGuard';

// PURE STATIC DEBUG MODE - NO LOGIC, NO LOCALSTORAGE, NO FETCH
export default function SaaSAdminDashboard() {
    // Hardcoded static data to guarantee rendering
    const staticStats = {
        overview: {
            totalTenants: 12,
            totalUsers: 148,
            totalStorageUsed: 4820000000,
        },
        recentActivity: [
            { id: 1, action: 'SYSTEM_INIT', user: { email: 'admin@taxflow.com' }, createdAt: new Date().toISOString(), tenant: { name: 'System' } }
        ]
    };

    const staticTenants = [
        { id: '1', name: 'Smith & Assoc', subdomain: 'smith', state: 'ACTIVE', _count: { users: 4, files: 120 } },
        { id: '2', name: 'Metro Tax', subdomain: 'metro', state: 'TRIAL', _count: { users: 2, files: 45 } },
        { id: '3', name: 'Global Finance', subdomain: 'global', state: 'ACTIVE', _count: { users: 15, files: 890 } },
    ];

    const formatBytes = (bytes: number) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">

            {/* TEMPORARY SYSTEM BANNER */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-[10px] font-bold text-center py-1">
                SYSTEM MAINTENANCE: REAL-TIME DATA STREAM INTERRUPTED - DISPLAYING CACHED VIEW
            </div>

            {/* Dark Sidebar */}
            <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full z-20 hidden md:flex pt-6">
                <div className="p-8 flex items-center gap-3">
                    <div className="bg-primary h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Server className="text-white h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-xl font-black tracking-tight block">TaxFlow<span className="text-primary">Admin</span></span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Platform Engine</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-6">
                    <AdminNavItem icon={<BarChart3 size={20} />} label="Global Overview" active />
                    <AdminNavItem icon={<Building2 size={20} />} label="Tenant Management" badge="12" />
                    <AdminNavItem icon={<Activity size={20} />} label="System Audit" />
                    <AdminNavItem icon={<ShieldCheck size={20} />} label="Security Policies" />
                    <AdminNavItem icon={<Globe size={20} />} label="Global Settings" />
                </nav>

                <div className="p-6 border-t border-slate-800">
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 w-full rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        <span className="font-bold text-sm">System Shutdown</span>
                    </button>
                    <div className="mt-6 flex items-center gap-3 p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                        <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
                            A
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold truncate">Admin User</p>
                            <p className="text-[10px] text-slate-500 font-medium">Platform Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-72 pt-6">
                <header className="bg-slate-950/50 backdrop-blur-xl px-4 md:px-12 py-6 flex items-center justify-between sticky top-0 z-10 border-b border-white/5">
                    <div className="hidden md:flex items-center gap-6 bg-slate-900 px-5 py-2.5 rounded-2xl w-full max-w-xl border border-slate-800 focus-within:border-primary/50 transition-colors">
                        <Search size={20} className="text-slate-500" />
                        <input
                            type="text"
                            placeholder="Static View Only..."
                            disabled
                            className="bg-transparent border-none outline-none text-sm w-full text-slate-500 cursor-not-allowed"
                        />
                    </div>
                    <div className="flex items-center gap-6 ml-auto">
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-black uppercase tracking-tighter">
                            <ShieldCheck size={16} />
                            ROOT ACCESS
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-12 space-y-12">

                    {/* Platform KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <AdminKpiCard
                            label="Active Tenants"
                            value={staticStats.overview.totalTenants}
                            trend="+12%"
                            icon={<Building2 />}
                        />
                        <AdminKpiCard
                            label="Global Users"
                            value={staticStats.overview.totalUsers}
                            trend="+4.2%"
                            icon={<Users />}
                        />
                        <AdminKpiCard
                            label="Total Storage"
                            value={formatBytes(staticStats.overview.totalStorageUsed)}
                            trend="Healthy"
                            icon={<Database />}
                        />
                        <AdminKpiCard
                            label="System Uptime"
                            value="99.98%"
                            icon={<ShieldCheck />}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-12">
                        {/* Tenant Registry */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl shadow-black/50 overflow-hidden">
                                <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                                    <h3 className="text-xl font-bold flex items-center gap-3">
                                        <Building2 className="text-primary" />
                                        Tenant Registry
                                    </h3>
                                    <div className="flex gap-2">
                                        <span className="text-[10px] font-black px-2 py-1 rounded-md bg-slate-800 text-slate-400 uppercase">
                                            ACTIVE: 10
                                        </span>
                                        <span className="text-[10px] font-black px-2 py-1 rounded-md bg-slate-800 text-slate-400 uppercase">
                                            TRIAL: 2
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-800/30">
                                                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Firm Name</th>
                                                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                                                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Usage</th>
                                                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {staticTenants.map((tenant) => (
                                                <tr key={tenant.id} className="hover:bg-slate-800/40 transition-all cursor-pointer group">
                                                    <td className="px-8 py-6">
                                                        <div className="font-black text-slate-200">{tenant.name}</div>
                                                        <div className="text-xs text-slate-500 font-medium">{tenant.subdomain}.taxflow.pro</div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${tenant.state === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                            tenant.state === 'TRIAL' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                                'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                                            }`}>
                                                            {tenant.state}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="text-xs font-bold text-slate-300">{tenant._count?.users || 0} Users</div>
                                                        <div className="text-[10px] text-slate-600 font-medium">{tenant._count?.files || 0} Documents</div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-primary transition-colors" />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Stream */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-8 h-full">
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="bg-primary/20 p-2 rounded-lg">
                                        <Activity size={20} className="text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold">Global Event Bus</h3>
                                </div>
                                <div className="space-y-8 relative">
                                    <div className="absolute left-2.5 top-0 bottom-0 w-px bg-slate-800"></div>
                                    <div className="relative pl-10 group">
                                        <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full bg-slate-950 border-2 border-slate-800 group-hover:border-primary transition-colors"></div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] font-black uppercase text-slate-500">SYSTEM</p>
                                            <p className="text-xs font-bold text-slate-200">MAINTENANCE_MODE_ACTIVE</p>
                                            <p className="text-[10px] text-slate-600 font-medium">
                                                System • Just now
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function AdminNavItem({ icon, label, active = false, badge }: any) {
    return (
        <a href="#" className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all ${active
            ? 'bg-primary text-white shadow-xl shadow-primary/20'
            : 'text-slate-500 hover:bg-slate-800 hover:text-slate-100'
            }`}>
            {icon}
            <span className="font-bold text-sm tracking-tight flex-1">{label}</span>
            {badge && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${active ? 'bg-white text-primary' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                    {badge}
                </span>
            )}
        </a>
    );
}

function AdminKpiCard({ label, value, trend, icon }: any) {
    return (
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl shadow-black/20 group hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-slate-800 rounded-2xl text-slate-400 group-hover:text-primary transition-colors">
                    {React.cloneElement(icon, { size: 24 })}
                </div>
                {trend && (
                    <span className="text-[10px] font-black px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-4xl font-black text-slate-100 tracking-tighter">{value}</p>
            </div>
        </div>
    );
}
