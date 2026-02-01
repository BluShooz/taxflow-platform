'use client';

import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Check,
    ArrowRight,
    Zap,
    Shield,
    Rocket,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

const PLANS = [
    {
        id: 'price_basic_id', // Placeholder - in real app would come from env/config
        name: 'Basic',
        price: '$49',
        description: 'Perfect for solo practitioners',
        features: ['Up to 10 clients', '5GB Secure storage', 'Standard support', 'Public portal entry'],
        icon: <Shield className="text-blue-500" />
    },
    {
        id: 'price_pro_id',
        name: 'Professional',
        price: '$149',
        description: 'The standard for growing firms',
        features: ['Up to 50 clients', '100GB Secure storage', 'Priority support', 'White-labeling', 'MFA security'],
        icon: <Zap className="text-purple-500" />,
        popular: true
    },
    {
        id: 'price_premium_id',
        name: 'Enterprise',
        price: '$499',
        description: 'Unrestricted power for large firms',
        features: ['Unlimited clients', '1TB Secure storage', '24/7 Dedicated support', 'Custom domain', 'Advanced audit logs'],
        icon: <Rocket className="text-orange-500" />
    }
];

function BillingContent() {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    useEffect(() => {
        const storedUser = localStorage.getItem('taxflow_session');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, []);

    const handleUpgrade = async (priceId: string) => {
        setLoading(true);
        try {
            const response = await fetch('/api/billing/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tenantId: user.tenantId, priceId })
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Failed to initiate checkout: ' + data.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 p-8 pt-12">
            <div className="max-w-6xl mx-auto space-y-12">
                <header className="text-center space-y-4">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Scale Your Practice</h1>
                    <p className="text-slate-500 max-w-2xl mx-auto font-medium">
                        Choose the plan that fits your firm's growth. Upgrade or downgrade at any time with transparent billing.
                    </p>
                </header>

                {success && (
                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center gap-4 text-emerald-700 animate-in fade-in slide-in-from-top-4 duration-500">
                        <CheckCircle2 size={24} />
                        <div>
                            <p className="font-bold">Subscription Successful!</p>
                            <p className="text-sm font-medium">Your account features have been upgraded. Your next statement will reflect the change.</p>
                        </div>
                    </div>
                )}

                {canceled && (
                    <div className="bg-orange-50 border border-orange-100 p-6 rounded-3xl flex items-center gap-4 text-orange-700">
                        <AlertCircle size={24} />
                        <div>
                            <p className="font-bold">Checkout Canceled</p>
                            <p className="text-sm font-medium">No changes were made to your account. You can retry whenever you're ready.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {PLANS.map((plan) => (
                        <div key={plan.name} className={`relative bg-white rounded-[2.5rem] border ${plan.popular ? 'border-primary shadow-2xl scale-105 z-10' : 'border-slate-200 shadow-sm'} p-10 flex flex-col`}>
                            {plan.popular && (
                                <div className="absolute top-0 right-10 -translate-y-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                                {React.cloneElement(plan.icon as React.ReactElement, { size: 28 } as any)}
                            </div>

                            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                                <span className="text-slate-400 font-bold text-sm">/mo</span>
                            </div>
                            <p className="text-slate-500 text-sm mt-4 font-medium h-10">{plan.description}</p>

                            <ul className="mt-8 space-y-4 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                        <div className="bg-emerald-50 text-emerald-600 rounded-full p-1 border border-emerald-100">
                                            <Check size={12} />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={loading}
                                className={`mt-10 w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${plan.popular
                                    ? 'bg-primary text-white shadow-xl shadow-primary/30 hover:bg-primary-hover'
                                    : 'bg-slate-900 text-white hover:bg-black'
                                    } disabled:opacity-50`}
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                    <>
                                        Upgrade Now
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] group-hover:bg-primary/30 transition-all duration-1000"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 max-w-md">
                            <h2 className="text-3xl font-black tracking-tight">Enterprise Custom</h2>
                            <p className="text-slate-400 font-medium">Need something more specific? We offer tailored solutions for large-scale tax organizations.</p>
                        </div>
                        <button className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl">
                            Talk to Sales
                        </button>
                    </div>
                </div>

                <footer className="flex flex-col md:flex-row items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-widest pt-8 border-t border-slate-200">
                    <div className="flex items-center gap-6">
                        <Link href="/portal/client" className="hover:text-primary transition-colors">Dashboard</Link>
                        <Link href="/" className="hover:text-primary transition-colors">Platform</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Support</Link>
                    </div>
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <CreditCard size={14} className="text-slate-300" />
                        Card Processing Secured by Stripe
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default function BillingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
            <BillingContent />
        </Suspense>
    );
}
