'use client';

import React from 'react';
import { FileText, Download, Trash2, Calendar, HardDrive, User, ExternalLink } from 'lucide-react';

interface FileItem {
    id: string;
    originalName: string;
    mimeType: string;
    sizeBytes: string;
    uploadedAt: string;
    lastAccessedAt: string | null;
    expiresAt: string | null;
    uploadedBy: {
        firstName: string;
        lastName: string;
    };
}

interface FileListProps {
    files: FileItem[];
    userId: string;
    tenantState: string;
    onDownload: (fileId: string) => void;
    onDelete: (fileId: string) => void;
    loading?: boolean;
}

export const FileList: React.FC<FileListProps> = ({
    files,
    userId,
    tenantState,
    onDownload,
    onDelete,
    loading,
}) => {
    const formatBytes = (bytes: string) => {
        const b = parseInt(bytes);
        if (b === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(b) / Math.log(k));
        return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const isRestricted = tenantState === 'GRACE_PERIOD' || tenantState === 'SUSPENDED' || tenantState === 'ARCHIVED';

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-slate-100 rounded-xl"></div>
                ))}
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No files found</h3>
                <p className="text-slate-500">Upload your first document to get started.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200">
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">File Name</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Uploaded At</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {files.map((file) => (
                            <tr key={file.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-900 truncate max-w-[200px]" title={file.originalName}>
                                                {file.originalName}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {file.mimeType}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                        <HardDrive className="w-4 h-4 text-slate-400" />
                                        {formatBytes(file.sizeBytes)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        {formatDate(file.uploadedAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onDownload(file.id)}
                                            disabled={tenantState === 'SUSPENDED' || tenantState === 'ARCHIVED'}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-30"
                                            title="Download"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                        {!isRestricted && (
                                            <button
                                                onClick={() => onDelete(file.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
