'use client';

import React, { useState, useEffect } from 'react';
import { FileUpload } from '@/app/components/FileUpload';
import { FileList } from '@/app/components/FileList';
import {
    LayoutDashboard,
    FileText,
    Settings,
    LogOut,
    Bell,
    Search,
    CloudUpload,
    ShieldQuestion
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ClientDashboard() {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        // Simple session check
        const storedUser = localStorage.getItem('taxflow_session');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        const userData = JSON.parse(storedUser);
        setUser(userData);
        fetchFiles(userData.tenantId, userData.id);
    }, []);

    const fetchFiles = async (tenantId: string, userId: string) => {
        try {
            const response = await fetch(`/api/files?tenantId=${tenantId}&userId=${userId}`);
            const data = await response.json();
            setFiles(data.files || []);
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = (newFile: any) => {
        setFiles((prev: any) => [newFile, ...prev]);
    };

    const handleDownload = async (fileId: string) => {
        try {
            const response = await fetch(`/api/files/${fileId}/download?userId=${user.id}`);
            const data = await response.json();
            if (data.downloadUrl) {
                window.open(data.downloadUrl, '_blank');
            }
        } catch (error) {
            console.error('Download error:', error);
        }
    };

    const handleDelete = async (fileId: string) => {
        if (!confirm('Are you sure you want to delete this file?')) return;

        try {
            const response = await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
            if (response.ok) {
                setFiles((prev) => prev.filter((f: any) => f.id !== fileId));
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('taxflow_session');
        router.push('/login');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-6 flex items-center gap-2">
                    <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center">
                        <CloudUpload className="text-white h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold">TaxFlow<span className="text-primary">Pro</span></span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
                    <NavItem icon={<FileText size={20} />} label="Documents" />
                    <NavItem icon={<Bell size={20} />} label="Notifications" badge="3" />
                    <NavItem icon={<Settings size={20} />} label="Settings" />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 w-full rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-full w-96">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            className="bg-transparent border-none outline-none text-sm w-full"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-slate-500 capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border-2 border-primary/20">
                            {user.firstName[0]}{user.lastName[0]}
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-6xl mx-auto space-y-10">
                    {/* Welcome Section */}
                    <div className="flex items-end justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Document Vault</h1>
                            <p className="text-slate-500 mt-1">Manage and securely upload your tax documents.</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                            <ShieldQuestion size={14} />
                            SECURE CHANNEL
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Upload */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold mb-4">Quick Upload</h3>
                                <FileUpload
                                    tenantId={user.tenantId}
                                    userId={user.id}
                                    onUploadSuccess={handleUploadSuccess}
                                />
                                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <p className="text-xs text-blue-700 leading-relaxed">
                                        <strong>Pro Tip:</strong> You can upload multiple files by dragging them into the zone. Files are automatically archived after 7 years per policy.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: File List */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold">Recent Documents</h3>
                                    <span className="text-xs font-medium text-slate-400">{files.length} Files Total</span>
                                </div>
                                <FileList
                                    files={files}
                                    userId={user.id}
                                    tenantState={user.tenantState}
                                    onDownload={handleDownload}
                                    onDelete={handleDelete}
                                    loading={loading}
                                />
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
