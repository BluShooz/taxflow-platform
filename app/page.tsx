import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Workflow,
  Database,
  ArrowRight,
  Layers,
  Zap,
  CheckCircle2,
  FileText,
  Users
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-gradient-mesh min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full glass-morphism border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg shadow-lg">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">TaxFlow<span className="text-primary">Pro</span></span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity">Features</a>
            <a href="#how-it-works" className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity">Workflow</a>
            <a href="#pricing" className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/api/auth/login" className="text-sm font-semibold opacity-80 hover:opacity-100">Login</Link>
            <Link
              href="/api/auth/register"
              className="bg-primary hover:bg-primary-hover rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-48 pb-32 text-center">
        <div className="absolute top-48 -z-10 h-[400px] w-[600px] bg-primary/20 blur-[120px] rounded-full" />

        <div className="animate-float mb-6 inline-flex items-center gap-2 rounded-full border bg-white/50 px-4 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-md dark:bg-black/50">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="opacity-80 uppercase tracking-widest">Next-Gen Tax Infrastructure</span>
        </div>

        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl">
          The Modern Operating System for <span className="text-gradient">Tax Professionals</span>
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed opacity-70 sm:text-xl">
          Streamline your firm with automated tenant lifecycle management, secure S3-powered document vaults, and seamless Stripe integration. Built for scale, locked for security.
        </p>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/api/auth/register"
            className="shimmer-effect bg-primary hover:bg-primary-hover flex items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all hover:scale-105"
          >
            Start Free Trial <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#features"
            className="flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 text-lg font-bold transition-all hover:bg-white/10"
          >
            View Demo
          </a>
        </div>

        {/* Dashboard Preview Component Placeholder */}
        <div className="mt-24 w-full max-w-5xl px-4">
          <div className="glass-morphism relative overflow-hidden rounded-3xl p-2 shadow-2xl shadow-primary/20 border-white/20">
            <div className="bg-slate-900 aspect-video rounded-2xl p-6 text-left font-mono text-sm overflow-hidden flex flex-col gap-4">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="space-y-4 opacity-80">
                <p className="text-primary font-bold">➜ taxflow-platform git:(main) export TENANT_ID="tax-firm-delta"</p>
                <p className="text-emerald-400">➜ Initializing secure environment...</p>
                <div className="grid grid-cols-3 gap-4 border-l-2 border-primary/30 pl-4">
                  <div className="space-y-1">
                    <p className="text-xs opacity-50 uppercase">Tenant Status</p>
                    <p className="text-blue-400 font-bold">ACTIVE</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs opacity-50 uppercase">Subscription</p>
                    <p className="text-purple-400 font-bold">PRO_TIER</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs opacity-50 uppercase">Storage Used</p>
                    <p className="text-orange-400 font-bold">14.2 GB</p>
                  </div>
                </div>
                <p className="text-zinc-500 italic">// Enforcing RBAC policies for tenant: tax-firm-delta</p>
                <p className="text-zinc-500 italic">// Syncing automated file retention: 7 years default</p>
                <p className="animate-pulse">_</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-32">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Built for Scale, Sealed for Trust</h2>
          <p className="mt-4 opacity-70">Everything you need to automate your tax operation from Day 1.</p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<ShieldCheck className="h-8 w-8 text-primary" />}
            title="Iron-Clad Isolation"
            description="Tenant-level data isolation ensured at the database and storage layers. Zero cross-contamination."
          />
          <FeatureCard
            icon={<Workflow className="h-8 w-8 text-secondary" />}
            title="Lifecycle Engine"
            description="Automated state machine transitions based on billing, grace periods, and retention policies."
          />
          <FeatureCard
            icon={<Database className="h-8 w-8 text-accent" />}
            title="S3 Document Vault"
            description="High-fidelity file management with presigned URL security and automated archival."
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-amber-500" />}
            title="Instant Scaling"
            description="Propagate updates across thousands of tenants instantly with our robust backend architecture."
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-emerald-500" />}
            title="Granular RBAC"
            description="Fine-tuned access controls for partners, preparers, and clients across the platform."
          />
          <FeatureCard
            icon={<FileText className="h-8 w-8 text-rose-500" />}
            title="Audit Ready"
            description="Complete tamper-proof audit trails for every API call, state change, and file access."
          />
        </div>
      </section>

      {/* Portal CTA Section */}
      <section className="mx-auto max-w-5xl px-6 py-32">
        <div className="glass-morphism rounded-3xl p-12 text-center border-white/20 shadow-2xl">
          <h2 className="text-4xl font-bold">Ready to Elevate Your Practice?</h2>
          <p className="mt-4 text-lg opacity-80">Choose your entry point and start managing your tax flow with precision.</p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <div className="group bg-white/5 dark:bg-black/20 rounded-2xl p-8 hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20">
              <h3 className="text-2xl font-bold">Firm Owners</h3>
              <p className="mt-2 text-sm opacity-60">Complete control over firm settings, billing, and team permissions.</p>
              <Link href="/api/auth/login" className="mt-6 inline-flex items-center text-primary font-bold gap-2">
                Launch Owner Portal <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="group bg-white/5 dark:bg-black/20 rounded-2xl p-8 hover:bg-secondary/10 transition-colors border border-transparent hover:border-secondary/20">
              <h3 className="text-2xl font-bold">Clients</h3>
              <p className="mt-2 text-sm opacity-60">Securely upload documents and track your tax preparation status.</p>
              <Link href="/api/auth/login" className="mt-6 inline-flex items-center text-secondary font-bold gap-2">
                Open Client Vault <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">TaxFlow<span className="text-primary">Pro</span></span>
          </div>
          <p className="text-sm opacity-50">&copy; 2026 TaxFlow Professional. All rights reserved.</p>
          <div className="flex gap-6 opacity-60 text-sm">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-morphism group rounded-2xl p-8 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 border-white/10">
      <div className="mb-4 inline-block rounded-xl bg-white/50 p-3 shadow-inner dark:bg-black/50">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
        {description}
      </p>
    </div>
  );
}
