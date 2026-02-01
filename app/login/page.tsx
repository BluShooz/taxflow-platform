'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, AlertCircle, Loader2, Link as LinkIcon } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('client@acmetax.com');
    const [password, setPassword] = useState('password123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
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

            // Store user data in localStorage for the "battle test"
            localStorage.setItem('taxflow_session', JSON.stringify({
                ...data.user,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken
            }));

            // Redirect to appropriate portal
            if (data.user.role === 'CLIENT') {
                router.push('/portal/client');
            } else {
                setError('Only client portal is currently active in this build.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="bg-primary h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/30">
                        <LogIn className="text-white h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
                    <p className="text-slate-500 mt-2 font-medium">Log in to your TaxFlow account</p>
                </div>

                <div className="glass-morphism p-8 rounded-3xl border-white/20 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full bg-white/50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-2xl text-sm border border-red-100 animate-in slide-in-from-top-2">
                                <AlertCircle size={18} />
                                <span className="font-semibold">{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-hover text-white rounded-2xl py-4 font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Log In to Dashboard'}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-200 text-center">
                        <p className="text-sm text-slate-500 mb-4">Demo Credentials</p>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="bg-slate-100 p-3 rounded-xl text-xs font-mono text-left">
                                <p className="text-primary font-bold">Email: client@acmetax.com</p>
                                <p className="text-slate-500">Pass: password123</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <p className="text-sm text-slate-500">
                        Don't have an account? <a href="#" className="text-primary font-bold hover:underline">Request Access</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
