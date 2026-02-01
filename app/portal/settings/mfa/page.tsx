'use client';

import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Smartphone,
    Key,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MFASetupPage() {
    const [step, setStep] = useState(1);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('taxflow_session');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, []);

    const startMFASetup = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/auth/mfa/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, email: user.email })
            });
            const data = await response.json();
            if (response.ok) {
                setQrCodeUrl(data.qrCodeUrl);
                setStep(2);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to initiate MFA setup');
        } finally {
            setLoading(false);
        }
    };

    const verifyAndEnableMFA = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/auth/mfa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, token })
            });
            if (response.ok) {
                setStep(3);
                // Update local session to reflect MFA enabled if necessary
                const updatedUser = { ...user, mfaEnabled: true };
                localStorage.setItem('taxflow_session', JSON.stringify(updatedUser));
            } else {
                const data = await response.json();
                setError(data.error || 'Invalid verification code');
            }
        } catch (err) {
            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-lg">
                <Link
                    href="/portal/client"
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-8 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>

                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl p-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="bg-primary/10 h-14 w-14 rounded-2xl flex items-center justify-center text-primary">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Two-Factor Auth</h1>
                            <p className="text-slate-500 text-sm font-medium">Add an extra layer of security to your account</p>
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex gap-4">
                                <Smartphone className="text-primary shrink-0" size={24} />
                                <div>
                                    <p className="font-bold text-slate-900">How it works</p>
                                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                        Use an authenticator app (like Google Authenticator or Authy) to scan a QR code. The app will generate a 6-digit code for you to enter during login.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={startMFASetup}
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-hover text-white rounded-2xl py-4 font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Get Started'}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-900 mb-6">1. Scan this QR code with your app</p>
                                {qrCodeUrl && (
                                    <div className="inline-block p-4 bg-white border border-slate-200 rounded-3xl shadow-inner">
                                        <img src={qrCodeUrl} alt="MFA QR Code" className="w-48 h-48" />
                                    </div>
                                )}
                            </div>

                            <form onSubmit={verifyAndEnableMFA} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">2. Enter verification code</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={token}
                                            onChange={(e) => setToken(e.target.value)}
                                            placeholder="000 000"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono font-bold text-xl tracking-[0.5em]"
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-2xl text-sm border border-red-100 italic">
                                        <AlertCircle size={18} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primary-hover text-white rounded-2xl py-4 font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Verify and Activate'}
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                <CheckCircle2 size={48} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">MFA is Active</h3>
                                <p className="text-slate-500 mt-2">Your account is now protected with an additional layer of security.</p>
                            </div>
                            <Link
                                href="/portal/client"
                                className="w-full inline-block bg-slate-900 hover:bg-black text-white rounded-2xl py-4 font-bold shadow-xl transition-all"
                            >
                                Return to Dashboard
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center text-xs text-slate-400 font-medium">
                    <p>Secured by TaxFlow Platform Shield™</p>
                </div>
            </div>
        </div>
    );
}
