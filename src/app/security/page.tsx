'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Database, KeyRound, Lock, Server, Users2, RefreshCw } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { SITE_CONFIG } from '@/lib/siteConfig';

export default function SecurityPage() {
  const securityLayers = [
    {
      icon: KeyRound,
      title: 'Authentication & Session Security',
      status: 'LIVE' as const,
      description:
        'User authentication is powered by Supabase Auth with industry-standard JSON Web Tokens (JWT). All authenticated requests to internal APIs require cryptographically verified bearer tokens with automatic session expiration.',
    },
    {
      icon: Database,
      title: 'Database Architecture & Multi-Tenant Isolation',
      status: 'LIVE' as const,
      description:
        'All application data is hosted in dedicated PostgreSQL databases on Supabase cloud infrastructure. Records are strictly segregated by Organization ID, ensuring each AMC agency and contractor accesses only their own client rosters and service records.',
    },
    {
      icon: Lock,
      title: 'Transport Encryption & API Security',
      status: 'LIVE' as const,
      description:
        'Strict HTTPS (TLS 1.3) is enforced on all connections via Vercel Edge networks. Queries are executed via Prisma ORM using parameterized queries to protect against SQL injection vulnerabilities.',
    },
    {
      icon: Users2,
      title: 'Role-Based Access Control (RBAC)',
      status: 'LIVE' as const,
      description:
        'Granular permissions divide users into defined tiers: Organization Admins (full management), Field Technicians (restricted to recording asset details, floor notes, GPS position, and photos), and Clients (read-only certificate and asset viewing).',
    },
    {
      icon: Server,
      title: 'Data Storage & Evidence Retention',
      status: 'LIVE' as const,
      description:
        'Inspection records, service timestamps, defect photographs, and Form-B generation history are stored with tamper-evident creation timestamps to support statutory audit trails.',
    },
    {
      icon: RefreshCw,
      title: 'Backups & Disaster Recovery',
      status: 'LIVE' as const,
      description:
        'The underlying database benefits from automated daily snapshots and point-in-time recovery capabilities managed directly on Supabase cloud infrastructure.',
    },
  ];

  return (
    <div className="w-full bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#0077B6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-ocean-50 px-3 py-1 rounded-full border border-ocean-200">
              Technical Architecture &amp; Privacy
            </span>
            <StatusBadge status="LIVE" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#023E8A] mt-3">
            Security &amp; Data Lock Guarantee
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
            A transparent overview of how VigilAMC protects your facility rosters, inspection records, and organization credentials.
          </p>
        </div>

        {/* Explicit Partner Non-Compete & Client Data Lock Trust Banner */}
        <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Lock className="w-5 h-5 shrink-0" />
            <span>100% Built for AMC Contractors &mdash; Never Your Competitor</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            VigilAMC is pure software. We do NOT provide physical fire AMC services, sell refills, or pitch buildings directly. Your client building list, pricing, and contract expiry dates belong strictly to your agency and are never shared or contacted by us.
          </p>
        </div>

        {/* What We Promise vs Avoid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-2">
            <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              What We Do
            </h3>
            <ul className="space-y-1.5 text-emerald-900 list-disc pl-4 leading-relaxed">
              <li>Enforce TLS/HTTPS encryption on 100% of network traffic.</li>
              <li>Isolate data by tenant Organization ID in PostgreSQL.</li>
              <li>Validate JWT signatures server-side on every protected API call.</li>
              <li>Employ parameterized queries via Prisma ORM against injection attacks.</li>
              <li>Maintain immutable creation timestamps on all inspection evidence.</li>
              <li>Allow full 1-click export of your complete asset registers anytime.</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-600" />
              Transparent Disclaimers
            </h3>
            <p className="text-slate-600 leading-relaxed">
              We do not use exaggerated marketing phrases like &ldquo;bank-grade&rdquo; or &ldquo;military-grade&rdquo;. Security is an ongoing operational commitment. We maintain modern, documented engineering practices and encourage customers to report any potential security inquiries directly to our engineering team.
            </p>
          </div>
        </div>

        {/* Security Layers Grid */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-[#023E8A]">
            Core Technical Implementations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityLayers.map((layer, idx) => (
              <div key={idx} className="p-6 rounded-xl border border-slate-200 bg-white hover:border-[#0077B6]/40 transition-colors shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-ocean-50 text-[#0077B6] flex items-center justify-center">
                    <layer.icon className="w-5 h-5" />
                  </div>
                  <StatusBadge status={layer.status} />
                </div>
                <h3 className="text-base font-bold text-slate-900">{layer.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{layer.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Verification & Questions */}
        <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Security Inquiries &amp; Vulnerability Reporting</h3>
          <p className="text-slate-600 leading-relaxed">
            If you have technical questions regarding data handling or wish to report a security inquiry, please contact our engineering team directly at <a href={`mailto:${SITE_CONFIG.SUPPORT_EMAIL}`} className="text-[#0077B6] font-bold underline">{SITE_CONFIG.SUPPORT_EMAIL}</a>. We acknowledge and address inquiries promptly.
          </p>
        </div>
      </div>
    </div>
  );
}
