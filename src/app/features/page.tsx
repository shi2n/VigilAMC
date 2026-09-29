'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  QrCode,
  FileCheck2,
  BellRing,
  Smartphone,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  Radio,
  Clock,
  Sparkles,
  ArrowRight,
  Database,
  Lock,
  Download,
  Share2,
  Layers,
  MapPin,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';

export default function FeaturesPage() {
  const [activePersona, setActivePersona] = useState<'contractor' | 'technician' | 'facility' | 'auditor'>('contractor');

  const comparisonData = [
    {
      feature: 'Asset Physical QR Tagging & Calibration History',
      vigil: true,
      vigilStatus: 'LIVE',
      excel: false,
      legacy: 'Partial',
    },
    {
      feature: 'Biannual Form-B PDF Generation (State Fire Act Compliant Layout)',
      vigil: true,
      vigilStatus: 'LIVE',
      excel: false,
      legacy: false,
    },
    {
      feature: 'Offline Mobile Inspection Checklist in Basements',
      vigil: true,
      vigilStatus: 'BETA',
      excel: false,
      legacy: false,
    },
    {
      feature: 'Technician Geolocation & Timestamp Logging',
      vigil: true,
      vigilStatus: 'BETA',
      excel: false,
      legacy: false,
    },
    {
      feature: 'Multi-Channel Expiry Notifications (Email & SMS)',
      vigil: true,
      vigilStatus: 'LIVE',
      excel: false,
      legacy: 'Email only',
    },
    {
      feature: 'Client Self-Service Compliance Portal',
      vigil: true,
      vigilStatus: 'COMING SOON',
      excel: false,
      legacy: 'Custom ($$$)',
    },
    {
      feature: 'Defect Workorder & Part Replacement Tracking',
      vigil: true,
      vigilStatus: 'SAMPLE',
      excel: false,
      legacy: 'Manual',
    },
    {
      feature: 'IS 2190 & NBC 2016 Part 4 Inspection Checklists',
      vigil: true,
      vigilStatus: 'LIVE',
      excel: false,
      legacy: false,
    },
  ];

  return (
    <div className="w-full bg-white">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-ocean-50 to-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-white px-3.5 py-1.5 rounded-full border border-ocean-200 shadow-sm">
            Platform Capabilities &amp; Architecture
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#023E8A] tracking-tight mt-4">
            Engineered Specifically for Fire Safety AMC Operations
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Generic field service software doesn&apos;t know what Form-B is or understand hydrostatic pressure test regulations. VigilAMC is purpose-built for life-safety maintenance workflows.
          </p>
        </div>
      </section>

      {/* Persona Customizer Tabs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#023E8A]">
            Tailored Experiences for Every Stakeholder
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Select a role to explore how VigilAMC addresses their operational needs.
          </p>

          <div className="mt-6 inline-flex flex-wrap justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActivePersona('contractor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePersona === 'contractor'
                  ? 'bg-[#0077B6] text-white shadow'
                  : 'text-slate-700 hover:text-[#0077B6]'
              }`}
            >
              AMC Agency Owners
            </button>
            <button
              onClick={() => setActivePersona('technician')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePersona === 'technician'
                  ? 'bg-[#0077B6] text-white shadow'
                  : 'text-slate-700 hover:text-[#0077B6]'
              }`}
            >
              Field Service Technicians
            </button>
            <button
              onClick={() => setActivePersona('facility')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePersona === 'facility'
                  ? 'bg-[#0077B6] text-white shadow'
                  : 'text-slate-700 hover:text-[#0077B6]'
              }`}
            >
              Client Facility Heads
            </button>
            <button
              onClick={() => setActivePersona('auditor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePersona === 'auditor'
                  ? 'bg-[#0077B6] text-white shadow'
                  : 'text-slate-700 hover:text-[#0077B6]'
              }`}
            >
              Fire Directorate &amp; Surveyors
            </button>
          </div>
        </div>

        {/* Dynamic Persona Card */}
        <div className="corp-card p-8 bg-slate-50 border-ocean-200 shadow-md">
          {activePersona === 'contractor' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#0077B6] uppercase tracking-wider">
                  For Fire AMC Business Owners &amp; Operations Heads
                </span>
                <h3 className="text-2xl font-bold text-[#023E8A]">
                  Protect Contracts &amp; Scale From 3 to 30+ Facilities
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Avoid contract disputes caused by missing logbooks or overlooked hydrostatic testing deadlines. Monitor scheduled visits, asset counts, open defects, and certificate preparation in one unified operations view.
                </p>
                <div className="space-y-2 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Centralized equipment registry with serialized QR identities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Automated Form-B collation saves hours of manual compilation</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">
                  Agency Operations Focus
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2.5 rounded bg-ocean-50 text-xs">
                    <span className="font-bold text-[#023E8A]">Form-B Generation</span>
                    <span className="font-bold text-[#0077B6]">PDF Export in Minutes</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded bg-slate-50 text-xs">
                    <span className="font-bold text-slate-700">Asset Defect Tracking</span>
                    <span className="font-bold text-slate-900">Photo Logs &amp; Estimates</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded bg-slate-50 text-xs">
                    <span className="font-bold text-slate-700">Audit Preparedness</span>
                    <span className="font-bold text-emerald-700">Verifiable History</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePersona === 'technician' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#0077B6] uppercase tracking-wider">
                  For On-Site Field Technicians
                </span>
                <h3 className="text-2xl font-bold text-[#023E8A]">
                  Zero Paper Clipboards, Fast Offline Mobile Checklists
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  No more messy paper log sheets or trying to read faded inspection cards. Technicians scan asset QR codes on their phone, follow standardized safety checks, photograph damaged parts, and finish audits smoothly.
                </p>
                <div className="space-y-2 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Works offline in subterranean pump rooms and basements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Quick camera QR scanner with instant equipment identification</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 text-white p-6 rounded-xl shadow-inner font-mono text-xs space-y-2">
                <p className="text-cyan-400 font-bold">&gt; VIGIL_MOBILE_AUDIT_DEMO [Sample Data]</p>
                <p className="text-slate-300">Target Asset: Pillar 4B, Extinguisher 04</p>
                <p className="text-emerald-400">Pressure Gauge: 14.5 Bar ✓ NORMAL</p>
                <p className="text-emerald-400">Seal &amp; Pin: Intact ✓ PASS</p>
                <div className="p-2 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                  Record stored locally. Will sync automatically upon reconnection.
                </div>
              </div>
            </div>
          )}

          {activePersona === 'facility' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#0077B6] uppercase tracking-wider">
                  For Facility Managers &amp; Society Committees
                </span>
                <h3 className="text-2xl font-bold text-[#023E8A]">
                  Clear Equipment Health Records Without Frantic Pre-Audit Rushes
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Review exactly when each extinguisher or wet riser was last tested, inspect high-resolution defect photos, and receive client-ready Form-B reports formatted for authorized contractor signature.
                </p>
                <div className="space-y-2 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Digital access to scheduled inspection records</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Clear defect notes for fast maintenance approval</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Facility Equipment Status [Sample View]</span>
                  <span className="text-xs font-bold text-emerald-600">44 Operational / 4 Pending Refill</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#0077B6] h-full rounded-full" style={{ width: '92%' }} />
                </div>
                <p className="text-[11px] text-slate-500">
                  Representative commercial facility schedule. Biannual Form-B cycle active.
                </p>
              </div>
            </div>
          )}

          {activePersona === 'auditor' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#0077B6] uppercase tracking-wider">
                  For Fire Directorate &amp; Insurance Surveyors
                </span>
                <h3 className="text-2xl font-bold text-[#023E8A]">
                  Verifiable Audit Trails &amp; Standardized Inspection Schedules
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Every record in VigilAMC carries inspection timestamps, technician identifiers, and test findings matching IS 2190 and NBC 2016 Part 4 requirements, supporting thorough compliance evaluations.
                </p>
                <div className="space-y-2 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Structured Form-B format for authorized licensed agency endorsement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Replaces unverifiable handwritten paper logbooks</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
                <div className="p-2.5 rounded bg-emerald-50 text-emerald-800 flex justify-between font-bold">
                  <span>AUDIT RECORD PREVIEW</span>
                  <span>SAMPLE DATA</span>
                </div>
                <p className="text-slate-600">
                  Statutory Reference: <strong>Delhi Fire Prevention &amp; Safety Rules / NBC 2016 Format</strong>
                </p>
                <p className="text-slate-600">
                  Sample Equipment Log: <strong>48 Units Inspected &amp; Pressure-Tested</strong>
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  Note: Official certificates require physical/digital signature of licensed fire agency.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Six Pillars of the VigilAMC Platform */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-white px-3.5 py-1.5 rounded-full border border-slate-200">
              Platform Modules
            </span>
            <h2 className="text-3xl font-extrabold text-[#023E8A] mt-3">
              Six Pillars of the VigilAMC Platform
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Modular capabilities designed to support every phase of fire protection maintenance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="corp-card p-6 bg-white border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-ocean-50 text-[#0077B6] flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <StatusBadge status="LIVE" />
              </div>
              <h4 className="text-base font-bold text-slate-900">QR Asset Identity Hub</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Unique serial number, manufacturing year, capacity, agent type, floor plan coordinate, and service history for every piece of equipment.
              </p>
            </div>

            <div className="corp-card p-6 bg-white border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-navy-50 text-[#023E8A] flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <StatusBadge status="LIVE" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Statutory Form-B Engine</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Automated collation of Biannual Fire Safety Declarations matching legal state government formats, ready for licensed contractor review and submission.
              </p>
            </div>

            <div className="corp-card p-6 bg-white border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-ocean-50 text-[#0077B6] flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <StatusBadge status="BETA" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Offline Field Inspection App</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Mobile scanning and checklist logging that functions without network coverage in basement pump rooms. Auto-syncs when online.
              </p>
            </div>

            <div className="corp-card p-6 bg-white border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-navy-50 text-[#023E8A] flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <StatusBadge status="SAMPLE" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Defect &amp; Refilling Workorders</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Depressurized cylinders and leaking valves instantly trigger prioritized repair tickets with client approval summaries.
              </p>
            </div>

            <div className="corp-card p-6 bg-white border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-ocean-50 text-[#0077B6] flex items-center justify-center">
                  <BellRing className="w-5 h-5" />
                </div>
                <StatusBadge status="LIVE" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Multi-Channel Expiry Alerts</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Automated email digests and reminder notifications warn your team 60, 30, and 7 days before statutory renewal deadlines.
              </p>
            </div>

            <div className="corp-card p-6 bg-white border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-navy-50 text-[#023E8A] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <StatusBadge status="COMING SOON" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Client Compliance Portal</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Dedicated client login for facility managers to inspect real-time safety asset status and download past certificates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#023E8A]">
            Why Modern AMC Fleets Choose VigilAMC
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            See how specialized life-safety software compares against manual spreadsheets and generic field tools.
          </p>
        </div>

        <div className="overflow-x-auto corp-card border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#023E8A] text-white">
              <tr>
                <th className="py-4 px-6 font-bold text-sm">Platform Capability</th>
                <th className="py-4 px-6 font-black text-sm text-cyan-200 bg-[#0077B6]">VigilAMC</th>
                <th className="py-4 px-6 font-semibold">Manual Excel &amp; Paper</th>
                <th className="py-4 px-6 font-semibold">Generic Field ERP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {comparisonData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-6 font-medium text-slate-900 flex items-center justify-between gap-2">
                    <span>{row.feature}</span>
                    <StatusBadge status={row.vigilStatus as any} />
                  </td>
                  <td className="py-3.5 px-6 bg-ocean-50/50 font-bold text-emerald-600">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      <span>Supported</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-red-600">
                    <span className="flex items-center gap-1">
                      <X className="w-4 h-4 text-red-500" />
                      <span>No</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-500">
                    {typeof row.legacy === 'boolean' ? (
                      row.legacy ? 'Yes' : 'No'
                    ) : (
                      row.legacy
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-[#023E8A] text-white text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl font-extrabold">Ready to Join the Free Pilot Program?</h2>
          <p className="text-cyan-100 text-sm max-w-xl mx-auto leading-relaxed">
            Test QR tagging, mobile checklists, and Form-B report generation on up to 3 of your facilities with direct founder onboarding.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/#pilot-section"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0077B6] hover:bg-white hover:text-[#023E8A] font-bold text-sm rounded-xl transition-all shadow-lg"
            >
              <span>Apply for Free Pilot</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sample-report"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition-all border border-white/20"
            >
              <span>Inspect Sample Report</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
