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
  X
} from 'lucide-react';

export default function FeaturesPage() {
  const [activePersona, setActivePersona] = useState<'contractor' | 'technician' | 'facility' | 'auditor'>('contractor');

  const comparisonData = [
    {
      feature: 'Asset Physical QR Tagging & Calibration History',
      vigil: true,
      excel: false,
      legacy: 'Partial',
    },
    {
      feature: 'Biannual Form-B PDF Generation (State Fire Act Compliant)',
      vigil: true,
      excel: false,
      legacy: false,
    },
    {
      feature: '100% Offline Mobile Inspection in Deep Basements',
      vigil: true,
      excel: false,
      legacy: false,
    },
    {
      feature: 'Geofenced GPS Anti-Proxy Check-In Verification',
      vigil: true,
      excel: false,
      legacy: false,
    },
    {
      feature: 'Automated 60/30/7-Day WhatsApp & SMS Renewal Alerts',
      vigil: true,
      excel: false,
      legacy: 'Email only',
    },
    {
      feature: 'Client Self-Service Compliance Portal with Live Scores',
      vigil: true,
      excel: false,
      legacy: 'Add-on ($$$)',
    },
    {
      feature: 'Instant Defect Workorder & Refilling Quotation Flow',
      vigil: true,
      excel: false,
      legacy: 'Manual',
    },
    {
      feature: 'NFPA 10, 25 & 72 and NBC 2016 Part 4 Pre-built Checklists',
      vigil: true,
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
            Enterprise Architecture &amp; Capabilities
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#023E8A] tracking-tight mt-4">
            Engineered Specifically for Fire Safety AMC Operations
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Generic field service software doesn&apos;t know what Form-B is or understand hydrostatic pressure test regulations. VigilAMC is purpose-built for life safety compliance.
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
            Click a role to explore how VigilAMC solves their exact day-to-day pain points.
          </p>

          <div className="mt-6 inline-flex flex-wrap justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActivePersona('contractor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePersona === 'contractor'
                  ? 'bg-[#0077B6] text-white shadow'
                  : 'text-slate-700 hover:text-[#0077B6]'
              }`}
            >
              AMC Agency Owners
            </button>
            <button
              onClick={() => setActivePersona('technician')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePersona === 'technician'
                  ? 'bg-[#0077B6] text-white shadow'
                  : 'text-slate-700 hover:text-[#0077B6]'
              }`}
            >
              Field Service Technicians
            </button>
            <button
              onClick={() => setActivePersona('facility')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePersona === 'facility'
                  ? 'bg-[#0077B6] text-white shadow'
                  : 'text-slate-700 hover:text-[#0077B6]'
              }`}
            >
              Client Facility Directors
            </button>
            <button
              onClick={() => setActivePersona('auditor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePersona === 'auditor'
                  ? 'bg-[#0077B6] text-white shadow'
                  : 'text-slate-700 hover:text-[#0077B6]'
              }`}
            >
              Fire Directorate Officers
            </button>
          </div>
        </div>

        {/* Dynamic Persona Card */}
        <div className="corp-card p-8 bg-slate-50 border-ocean-200 shadow-md">
          {activePersona === 'contractor' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#0077B6] uppercase tracking-wider">
                  For Fire AMC Business Leaders &amp; Service Heads
                </span>
                <h3 className="text-2xl font-bold text-[#023E8A]">
                  Retain 100% of Clients &amp; Scale From 5 to 500 Towers
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Never suffer the humiliation of losing a 50-lakh AMC contract because a technician missed a single hydro-test date. Monitor your entire technician fleet, route efficiency, refilling revenue pipelines, and client renewal health on one unified glass cockpit.
                </p>
                <div className="space-y-2 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Real-time billing pipeline for refilling and spare parts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Technician attendance and productivity benchmarking</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">
                  Agency Executive KPI Overview
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2.5 rounded bg-ocean-50 text-xs">
                    <span className="font-bold text-[#023E8A]">Annual Contract Retention Rate</span>
                    <span className="font-black text-emerald-600">99.4% (+18%)</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded bg-slate-50 text-xs">
                    <span className="font-bold text-slate-700">Refilling Quotation Turnaround</span>
                    <span className="font-bold text-[#0077B6]">Under 2 Hours</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded bg-slate-50 text-xs">
                    <span className="font-bold text-slate-700">Form-B Audit Readiness</span>
                    <span className="font-black text-emerald-600">100% Guaranteed</span>
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
                  Zero Paper Clipboards, 100% Offline Smartphone Speed
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  No more messy carbon-copy log sheets, soggy clipboards, or deciphering illegible handwriting. Technicians scan the QR, tap simple pass/fail checkboxes, snap a photo of the pressure gauge, and finish a 30-extinguisher floor in under 15 minutes.
                </p>
                <div className="space-y-2 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Works smoothly without any cell signal in basements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Instant camera barcode/QR scanner with flash support</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 text-white p-6 rounded-xl shadow-inner font-mono text-xs space-y-2">
                <p className="text-cyan-400 font-bold">&gt; VIGIL_SCANNER_APP_ACTIVE</p>
                <p className="text-slate-300">Target: Pillar 4B, Basement Hydrant 02</p>
                <p className="text-emerald-400">Status: Pressure 6.8 Bar ✓ PASS</p>
                <p className="text-emerald-400">Timestamp: 10:42:19 AM &bull; GPS: 19.0760, 72.8777</p>
                <div className="p-2 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                  Audit logged offline. 14 items queued for auto-sync.
                </div>
              </div>
            </div>
          )}

          {activePersona === 'facility' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#0077B6] uppercase tracking-wider">
                  For Corporate Facility Managers &amp; Society Chairs
                </span>
                <h3 className="text-2xl font-bold text-[#023E8A]">
                  Total Visibility Over Life Safety With Zero Audit Fear
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Log into your executive portal from your phone or desktop. Verify exactly when each extinguisher was last inspected, view live health ratings, download valid Form-B certificates on demand, and prove compliance instantly during unexpected fire audits.
                </p>
                <div className="space-y-2 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>24/7 on-demand download of government compliance certificates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Instant 1-click digital approval of defect repairs</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">CyberHub Tower Compliance Score</span>
                  <span className="text-sm font-black text-emerald-600">98.8% / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#0077B6] h-full rounded-full" style={{ width: '98.8%' }} />
                </div>
                <p className="text-[11px] text-slate-500">
                  All 480 safety assets verified. Next statutory renewal due in 74 days.
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
                  Unforgeable Cryptographic Audit Trails &amp; NFPA Compliance
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Every record in VigilAMC contains unalterable timestamps, technician identifiers, geolocation coordinates, and photographic verification. Surveyors can scan any on-site extinguisher QR code with any public smartphone to verify its legal validity instantly.
                </p>
                <div className="space-y-2 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Compliant with Maharashtra Fire Act Sec 3(1) &amp; NBC 2016</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Eliminates fraudulent paper backdated log entries</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
                <div className="p-2.5 rounded bg-emerald-50 text-emerald-800 flex justify-between font-bold">
                  <span>PUBLIC VERIFICATION PORTAL</span>
                  <span>AUTHENTIC</span>
                </div>
                <p className="text-slate-600">
                  License Number: <strong>MH/FIRE/LIC/2022/A-412</strong>
                </p>
                <p className="text-slate-600">
                  Supervisor: <strong>Chief Fire Officer (Retd.) K. V. Rao</strong>
                </p>
                <p className="text-slate-600">
                  Digital SHA-256 Audit Seal: <span className="font-mono text-[10px]">8f4d9a...e21c</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature Deep-Dive Modules */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-[#023E8A]">
              Six Pillars of the VigilAMC Platform
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Everything integrated into a single, cohesive cloud ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="corp-card p-6 bg-white">
              <div className="w-10 h-10 rounded-lg bg-ocean-50 text-[#0077B6] flex items-center justify-center mb-4">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">QR Asset Identity Hub</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Unique serial number, manufacturing year, capacity, agent type, floor plan coordinate, and service history for every piece of equipment.
              </p>
            </div>

            <div className="corp-card p-6 bg-white">
              <div className="w-10 h-10 rounded-lg bg-navy-50 text-[#023E8A] flex items-center justify-center mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Statutory Form-B Engine</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Automated collation of Biannual Fire Safety Declarations matching legal state government formats, ready for regulatory submission.
              </p>
            </div>

            <div className="corp-card p-6 bg-white">
              <div className="w-10 h-10 rounded-lg bg-ocean-50 text-[#0077B6] flex items-center justify-center mb-4">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Offline Field Inspection App</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                High-speed scanning with zero network requirement. Includes flashlight control, camera capture, and GPS anti-proxy check-in controls.
              </p>
            </div>

            <div className="corp-card p-6 bg-white">
              <div className="w-10 h-10 rounded-lg bg-navy-50 text-[#023E8A] flex items-center justify-center mb-4">
                <Wrench className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Defect &amp; Refilling Workorders</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Depressurized cylinders and leaking valves instantly trigger prioritized repair tickets with client approval workflows.
              </p>
            </div>

            <div className="corp-card p-6 bg-white">
              <div className="w-10 h-10 rounded-lg bg-ocean-50 text-[#0077B6] flex items-center justify-center mb-4">
                <BellRing className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Multi-Channel Expiry Alerts</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Automated WhatsApp messages, SMS notifications, and email digests warn clients and technicians before deadlines elapse.
              </p>
            </div>

            <div className="corp-card p-6 bg-white">
              <div className="w-10 h-10 rounded-lg bg-navy-50 text-[#023E8A] flex items-center justify-center mb-4">
                <Radio className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">IoT Telemetry Ready</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Optionally connect wireless pressure transducers to jockey pump risers and water reservoir level meters for 24/7 autonomous monitoring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix vs Excel and Legacy */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#023E8A]">
            Why Modern AMC Fleets Choose VigilAMC
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            See how VigilAMC compares against legacy paper/Excel methods and general ERPs.
          </p>
        </div>

        <div className="overflow-x-auto corp-card border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#023E8A] text-white">
              <tr>
                <th className="py-4 px-6 font-bold text-sm">Platform Capability</th>
                <th className="py-4 px-6 font-black text-sm text-cyan-200 bg-[#0077B6]">VigilAMC Autopilot</th>
                <th className="py-4 px-6 font-semibold">Manual Excel &amp; Paper</th>
                <th className="py-4 px-6 font-semibold">Generic Field ERP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {comparisonData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-6 font-medium text-slate-900">{row.feature}</td>
                  <td className="py-3.5 px-6 bg-ocean-50/50 font-bold text-emerald-600 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    <span>Included</span>
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
          <h2 className="text-3xl font-extrabold">Ready to Experience Every Feature Live?</h2>
          <p className="text-cyan-100 text-sm">
            Schedule a personalized 15-minute walkthrough with our fire compliance engineers.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0077B6] hover:bg-white hover:text-[#023E8A] font-bold text-sm rounded-xl transition-all shadow-lg"
            >
              <span>Book Your Feature Walkthrough</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
