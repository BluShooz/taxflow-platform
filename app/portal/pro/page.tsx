'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    FileText,
    Database,
    History,
    LayoutDashboard,
    Settings,
    LogOut,
    ChevronRight,
    TrendingUp,
    Activity,
    UserCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TaxProDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('taxflow_session');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        const userData = JSON.parse(storedUser);
        if (userData.role !== 'TAX_PRO') {
            router.push('/portal/client');
            return;
        }
        setUser(userData);
        fetchDashboardData(userData.tenantId);
    }, []);

    const fetchDashboardData = async (tenantId: string) => {
        try {
            const [statsRes, clientsRes] = await Promise.all([
                fetch(`/api/tenant/${tenantId}/stats`),
                fetch(`/api/tenant/${tenantId}/users?role=CLIENT`)
            ]);

            const statsData = await statsRes.json();
            const clientsData = await clientsRes.json();

            setStats(statsData);
            setClients(clientsData.users || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('taxflow_session');
        router.push('/login');
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!user || loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
                <div className="p-6 flex items-center gap-2">
                    <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center">
                        <UserCheck className="text-white h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold">TaxFlow<span className="text-primary">Pro</span></span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Firm Overview" active />
                    <NavItem icon={<Users size={20} />} label="Clients" badge={clients.length.toString()} />
                    <NavItem icon={<History size={20} />} label="Audit Logs" />
                    <NavItem icon={<Settings size={20} />} label="Firm Settings" />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 w-full rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                    <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged in as</p>
                        <p className="text-sm font-bold truncate">{user.firstName} {user.lastName}</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 overflow-y-auto">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-slate-900">Firm Owner Dashboard</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
                            <TrendingUp size={14} />
                            {user.tenantState}
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            icon={<Users className="text-blue-500" />}
                            label="Active Clients"
                            value={stats?.stats?.clientCount || 0}
                            description="Total managed accounts"
                            bgColor="bg-blue-50"
                        />
                        <StatCard
                            icon={<FileText className="text-purple-500" />}
                            label="Stored Documents"
                            value={stats?.stats?.fileCount || 0}
                            description="Across all clients"
                            bgColor="bg-purple-50"
                        />
                        <StatCard
                            icon={<Database className="text-orange-500" />}
                            label="Storage Usage"
                            value={formatBytes(stats?.stats?.totalStorageUsed || 0)}
                            description={`Of ${stats?.stats?.storageLimitGB || 10}GB limit`}
                            bgColor="bg-orange-50"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Client List */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="text-lg font-bold">Client Directory</h3>
                                    <button className="text-xs font-bold text-primary hover:underline">Add New Client</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50">
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Name</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Email</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Last Login</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {clients.map((client) => (
                                                <tr key={client.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-900">{client.firstName} {client.lastName}</div>
                                                        <div className="text-[10px] text-slate-400 font-medium">ID: {client.id}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">{client.email}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-500">
                                                        {client.lastLoginAt ? new Date(client.lastLoginAt).toLocaleDateString() : 'Never'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                                                    </td>
                                                </tr>
                                            ))}
                                            {clients.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No clients found for this firm.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <div className="flex items-center gap-2 mb-6 text-slate-900">
                                    <Activity size={20} className="text-primary" />
                                    <h3 className="text-lg font-bold">Audit Trail</h3>
                                </div>
                                <div className="space-y-6">
                                    {stats?.recentLogs?.map((log: any) => (
                                        <div key={log.id} className="relative pl-6 border-l-2 border-slate-100">
                                            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white border-2 border-primary"></div>
                                            <p className="text-xs font-bold text-slate-900">{log.action.replace(/_/g, ' ')}</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">
                                                {log.user?.firstName} • {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    ))}
                                    {(!stats?.recentLogs || stats.recentLogs.length === 0) && (
                                        <p className="text-xs text-slate-400 italic">No recent activity found.</p>
                                    )}
                                </div>
                                <button className="w-full mt-8 py-3 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors">
                                    View Full Audit Log
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false, badge }: { icon: React.ReactNode, label: string, active?: boolean, badge?: string }) {
    return (
        <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}>
            {icon}
            <span className="font-medium flex-1">{label}</span>
            {badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                    {badge}
                </span>
            )}
        </a>
    );
}

function StatCard({ icon, label, value, description, bgColor }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className={`h-12 w-12 rounded-xl ${bgColor} flex items-center justify-center p-2.5`}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">{description}</p>
            </div>
        </div>
    );
}
