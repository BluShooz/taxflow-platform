'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('owner@taxflow.com');
    const [password, setPassword] = useState('admin123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('');
    const router = useRouter();

    const handleLogin = async () => {
        if (loading) return;

        setLoading(true);
        setStatus('Connecting to secure server...');
        setError(null);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            setStatus('Authenticating...');

            // Set cookie for middleware (Secure flag required for HTTPS production)
            const isProduction = window.location.protocol === 'https:';
            const cookieString = `taxflow_token=${data.accessToken}; path=/; max-age=3600; SameSite=Lax${isProduction ? '; Secure' : ''}`;
            document.cookie = cookieString;

            // Store user data in localStorage
            localStorage.setItem('taxflow_session', JSON.stringify({
                ...data.user,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken
            }));

            setStatus('Redirecting to portal...');

            // Redirect to appropriate portal
            if (data.user.role === 'CLIENT') {
                window.location.href = '/portal/client';
            } else if (data.user.role === 'TAX_PRO') {
                window.location.href = '/portal/pro';
            } else if (data.user.role === 'SAAS_OWNER') {
                window.location.href = '/portal/admin';
            } else {
                setError('Role not recognized for portal entry.');
            }
        } catch (err: any) {
            setError(err.message);
            setStatus('');
            setLoading(false);
        }
    };

    const fillDemo = (e: string, p: string) => {
        setEmail(e);
        setPassword(p);
    };

    return (
        <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950 flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md relative">

                {/* Decoration */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>

                <div className="text-center mb-8 relative z-10">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/30">
                        <LogIn className="text-white h-7 w-7" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Welcome Back</h1>
                    <p className="text-slate-400 mt-2 font-medium">Log in to your TaxFlow account</p>
                </div>

                <div className="relative z-10 backdrop-blur-xl bg-slate-900/60 border border-white/10 p-8 rounded-3xl shadow-2xl">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-4 text-slate-200 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium placeholder:text-slate-600"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-4 text-slate-200 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium placeholder:text-slate-600"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-500/10 text-red-200 rounded-2xl text-sm border border-red-500/20 animate-in slide-in-from-top-2">
                                <AlertCircle size={18} className="text-red-500" />
                                <span className="font-semibold">{error}</span>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl py-4 font-black shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5" />
                                    <span>{status || 'Processing...'}</span>
                                </>
                            ) : (
                                'Log In to Dashboard'
                            )}
                        </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-800 text-center">
                        <p className="text-[10px] text-slate-500 mb-4 tracking-widest uppercase font-black">Quick Fill Access</p>
                        <div className="grid grid-cols-1 gap-2">
                            <button onClick={() => fillDemo('owner@taxflow.com', 'admin123')} className="group flex items-center justify-between p-3 rounded-xl bg-slate-950/30 hover:bg-slate-800/50 border border-transparent hover:border-slate-700 transition-all">
                                <div className="text-left">
                                    <p className="text-xs font-bold text-white group-hover:text-primary transition-colors">SaaS Owner</p>
                                    <p className="text-[10px] text-slate-500">owner@taxflow.com</p>
                                </div>
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            </button>
                            <button onClick={() => fillDemo('pro@taxflow.com', 'pro123')} className="group flex items-center justify-between p-3 rounded-xl bg-slate-950/30 hover:bg-slate-800/50 border border-transparent hover:border-slate-700 transition-all">
                                <div className="text-left">
                                    <p className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">Tax Pro</p>
                                    <p className="text-[10px] text-slate-500">pro@taxflow.com</p>
                                </div>
                            </button>
                            <button onClick={() => fillDemo('client@taxflow.com', 'client123')} className="group flex items-center justify-between p-3 rounded-xl bg-slate-950/30 hover:bg-slate-800/50 border border-transparent hover:border-slate-700 transition-all">
                                <div className="text-left">
                                    <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">Client</p>
                                    <p className="text-[10px] text-slate-500">client@taxflow.com</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
