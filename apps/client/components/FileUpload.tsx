'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
    tenantId: string;
    userId: string;
    onUploadSuccess?: (file: any) => void;
    onUploadError?: (error: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    tenantId,
    userId,
    onUploadSuccess,
    onUploadError,
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [progress, setProgress] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = async (files: FileList) => {
        const file = files[0];
        if (!file) return;

        // Basic client-side validation
        if (file.size > 100 * 1024 * 1024) {
            setError('File size exceeds 100MB limit');
            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(false);
        setProgress(0);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('tenantId', tenantId);
        formData.append('userId', userId);

        try {
            // Small simulation of progress if needed, or just let the fetch handle it
            const response = await fetch('/api/files/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setSuccess(true);
            if (onUploadSuccess) onUploadSuccess(data.file);

            // Clear input
            if (inputRef.current) inputRef.current.value = '';
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred during upload');
            if (onUploadError) onUploadError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            <div
                className={`relative p-8 border-2 border-dashed rounded-2xl transition-all duration-300 ${dragActive
                        ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                        : 'border-slate-300 hover:border-slate-400 bg-white'
                    } ${error ? 'border-red-300 bg-red-50/10' : ''} ${success ? 'border-emerald-300 bg-emerald-50/10' : ''
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                    disabled={uploading}
                />

                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    {uploading ? (
                        <div className="flex flex-col items-center space-y-4">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                            <div className="space-y-1">
                                <p className="text-lg font-semibold text-slate-900">Uploading file...</p>
                                <p className="text-sm text-slate-500">Please don't close this window</p>
                            </div>
                        </div>
                    ) : success ? (
                        <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="p-3 bg-emerald-100 rounded-full">
                                <CheckCircle className="w-10 h-10 text-emerald-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-semibold text-emerald-900">Upload Complete!</p>
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 underline underline-offset-4"
                                >
                                    Upload another file
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 bg-slate-50 rounded-full border border-slate-100">
                                <Upload className="w-8 h-8 text-slate-400" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-lg font-semibold text-slate-900">
                                    Drag and drop your file here
                                </p>
                                <p className="text-sm text-slate-500">
                                    Or <button onClick={() => inputRef.current?.click()} className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">browse</button> for files (Max 100MB)
                                </p>
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 animate-in slide-in-from-top-2 duration-300">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                            <button onClick={() => setError(null)} className="ml-1">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
