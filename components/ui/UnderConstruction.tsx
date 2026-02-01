'use client';

import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
    title: string;
    description?: string;
}

export default function UnderConstruction({ title, description }: Props) {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl shadow-2xl max-w-lg w-full relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

                <div className="bg-primary/10 h-24 w-24 rounded-3xl mx-auto flex items-center justify-center mb-8 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                    <Construction className="text-primary h-12 w-12" />
                </div>

                <h1 className="text-3xl font-black text-white mb-4 tracking-tight">{title}</h1>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    {description || "This advanced module is currently being calibrated for maximum performance. Check back shortly."}
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 hover:text-white transition-all text-sm uppercase tracking-wider"
                    >
                        <ArrowLeft size={18} />
                        Return to Dashboard
                    </button>
                    <p className="text-[10px] text-slate-600 font-mono uppercase">System Build v2.4.0 • Module: {title.replace(/\s+/g, '_').toUpperCase()}</p>
                </div>
            </div>
        </div>
    );
}
