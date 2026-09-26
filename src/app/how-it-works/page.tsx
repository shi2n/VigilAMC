'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Calendar,
  Smartphone,
  ShieldCheck,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Gauge,
  Clock,
  Check,
  ChevronRight,
  Layers,
  Wrench,
  Radio,
  FileSpreadsheet
} from 'lucide-react';

export default function HowItWorksPage() {
  // Interactive inspection simulator state
  const [activeAssetType, setActiveAssetType] = useState<'extinguisher' | 'hydrant' | 'panel'>('extinguisher');
  const [pressureCheck, setPressureCheck] = useState<'pass' | 'fail'>('pass');
  const [tamperCheck, setTamperCheck] = useState<'pass' | 'fail'>('pass');
  const [hoseCheck, setHoseCheck] = useState<'pass' | 'fail'>('pass');

  return (
    <div className="w-full bg-white">
      {/* Page Header Banner */}
      <section className="bg-gradient-to-b from-ocean-50 to-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-white px-3.5 py-1.5 rounded-full border border-ocean-200 shadow-sm">
            End-To-End Implementation Blueprint
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#023E8A] tracking-tight mt-4">
            How VigilAMC Puts Fire Compliance on Autopilot
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            From sticking your first tamper-resistant QR code to generating statutory Form-B certificates for the Fire Directorate — here is exactly how our 4-phase autopilot works.
          </p>
        </div>
      </section>

      {/* 4-Step Detailed Implementation Timeline */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="space-y-20">
          {/* Step 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="corp-card p-6 bg-slate-50 border-ocean-200 shadow-md">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">Bulk Asset Importer</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                    420 ASSETS PARSED
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#023E8A]">North Tower — Floor 04</p>
                      <p className="text-slate-500">6kg ABC Powder #EXT-401 to #EXT-415</p>
                    </div>
                    <span className="text-emerald-600 font-bold">✓ Geo-tagged</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#023E8A]">Basement 2 Pump Room</p>
                      <p className="text-slate-500">Wet Riser Landing Valves &amp; Jockey Pump</p>
                    </div>
                    <span className="text-emerald-600 font-bold">✓ QR Assigned</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ocean-50 text-[#0077B6] text-xs font-extrabold border border-ocean-200">
                Phase 01 &bull; 24-Hour Onboarding
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#023E8A] tracking-tight">
                Bulk Import &amp; 12-Second QR Tagging
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Upload your existing Excel equipment registries into VigilAMC in one click. Our AI validation engine maps each equipment type, capacity, manufacture date, and last hydrostatic test date.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                We supply pre-printed, industrial-grade serialized metallic QR stickers built to withstand outdoor grease, heat, and sunlight. Your field team sticks the QR onto the cylinder or hydrant valve and pairs it with the mobile camera in 12 seconds.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Supports ABC, CO2, Foam, Wet Chemical</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Interactive architectural floor plan mapping</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 text-[#023E8A] text-xs font-extrabold border border-navy-200">
                Phase 02 &bull; Automated Scheduling
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#023E8A] tracking-tight">
                Intelligent Audit Cadence &amp; WhatsApp Alert Matrix
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Fire regulations mandate strict, staggered schedules: monthly visual inspections, quarterly functional checks, biannual Form-B sign-offs, and 3-year hydrostatic pressure testing.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                VigilAMC calculates the exact compliance window for each asset. When a renewal approaches, our notification engine triggers automated WhatsApp, email, and SMS alerts to both your AMC dispatch desk and the client facility director.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>60-30-7 day automated warning escalations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Prevents last-minute emergency refilling rushes</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="corp-card p-6 bg-white border-navy-200 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-[#023E8A] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#0077B6]" />
                    Automated Compliance Matrix
                  </span>
                  <span className="text-[10px] bg-ocean-50 text-[#0077B6] px-2 py-0.5 rounded font-bold">
                    LIVE CALENDAR
                  </span>
                </div>
                <div className="mt-3 space-y-2.5 text-xs">
                  <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-emerald-900">Monthly Visual Check</p>
                      <p className="text-emerald-700 text-[11px]">Due in 4 days &bull; Technician Assigned</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded text-[10px] font-bold">
                      ON TRACK
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-amber-50 border border-amber-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-amber-900">Quarterly Form-B Audit</p>
                      <p className="text-amber-700 text-[11px]">Due in 18 days &bull; Client Alert Sent</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded text-[10px] font-bold">
                      SCHEDULED
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">Hydrostatic Pressure Testing</p>
                      <p className="text-slate-500 text-[11px]">32 Cylinders Due Q1 2027</p>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-bold">
                      PLANNED
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="corp-card p-6 bg-slate-900 text-white shadow-xl rounded-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#48CAE4]" />
                    <span className="text-xs font-bold text-slate-200">Technician Mobile Scan View</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                    OFFLINE MODE
                  </span>
                </div>
                <div className="mt-4 space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                    <p className="text-slate-400">Scan QR Code</p>
                    <p className="font-mono text-cyan-300 font-bold mt-0.5">VIGIL-EXT-2041 [Extinguisher #14]</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center p-2 rounded bg-slate-800">
                      <span>Pressure Gauge (14.2 Bar)</span>
                      <span className="text-emerald-400 font-bold">✓ PASS</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-slate-800">
                      <span>Safety Lead Seal Intact</span>
                      <span className="text-emerald-400 font-bold">✓ PASS</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-slate-800">
                      <span>Geo-tag &amp; Photo Timestamp</span>
                      <span className="text-emerald-400 font-bold">✓ VERIFIED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ocean-50 text-[#0077B6] text-xs font-extrabold border border-ocean-200">
                Phase 03 &bull; Field Execution
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#023E8A] tracking-tight">
                Mobile Inspection with Zero False Reporting
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Technicians scan each equipment QR code with their mobile device. The inspection checklist is tailored strictly to that asset class — an addressable smoke detector gets a detector chamber aerosol response test, while a wet riser gets a static pressure and landing valve spindle check.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Because technicians must scan the physical sticker and upload a timestamped photo, proxy check-ins from the parking lot are completely eliminated. Every record is stored with GPS latitude, longitude, and cryptographic audit hash.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200">
                Phase 04 &bull; Certification &amp; Renewal
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#023E8A] tracking-tight">
                1-Click Form-B Generation &amp; Client Retention
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                At the end of the audit cycle, click once to compile the official Form-B Biannual Fire Safety Certificate. VigilAMC formats every asset serial number, inspection timestamp, non-conformance rectification record, and licensed supervisor signature into the legally mandated PDF format.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Clients receive the clean PDF along with login credentials to their own compliance dashboard. When contract renewal time comes, your competitor cannot touch you because you have proven 100% compliance with indisputable digital records.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="corp-card p-6 bg-gradient-to-br from-white to-emerald-50/50 border-emerald-200 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">Form-B Biannual Certificate</span>
                  </div>
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">
                    OFFICIAL PDF
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Fire Directorate Licensing:</span>
                    <strong className="text-slate-900">Valid &amp; Approved</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Equipments Certified:</span>
                    <strong className="text-slate-900">420/420 Assets</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Supervisor Digital Signature:</span>
                    <strong className="text-emerald-700">✓ Cryptographically Stamped</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Fire NOC Status:</span>
                    <strong className="text-emerald-700 font-extrabold">100% COMPLIANT</strong>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200">
                  <Link
                    href="/contact"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg text-center block transition-colors"
                  >
                    Request Sample Certificate PDF
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE SIMULATOR: Try the Field Inspection Flow
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-white px-3 py-1 rounded-full border border-slate-200">
              Interactive Test Drive
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#023E8A] tracking-tight mt-3">
              Simulate a Live Field Asset Audit
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Select an asset type below, toggle inspection parameters, and see how VigilAMC calculates compliance in real time.
            </p>
          </div>

          <div className="corp-card p-6 sm:p-8 bg-white border-ocean-200 shadow-xl">
            {/* Asset Selector Tabs */}
            <div className="flex flex-wrap gap-2 pb-6 border-b border-slate-200">
              <button
                onClick={() => setActiveAssetType('extinguisher')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeAssetType === 'extinguisher'
                    ? 'bg-[#0077B6] text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ABC Fire Extinguisher (6kg)
              </button>
              <button
                onClick={() => setActiveAssetType('hydrant')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeAssetType === 'hydrant'
                    ? 'bg-[#0077B6] text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Wet Riser Landing Valve &amp; Hydrant
              </button>
              <button
                onClick={() => setActiveAssetType('panel')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeAssetType === 'panel'
                    ? 'bg-[#0077B6] text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Addressable Fire Alarm Panel (FACP)
              </button>
            </div>

            {/* Checklist Simulator Options */}
            <div className="py-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {activeAssetType === 'extinguisher'
                      ? 'Pressure Gauge Level'
                      : activeAssetType === 'hydrant'
                      ? 'Static Water Pressure (Min 3.5 Bar)'
                      : 'Loop 1 to 4 Battery & Mains Power'}
                  </h4>
                  <p className="text-xs text-slate-500">Visual needle reading &amp; transducer calibration</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPressureCheck('pass')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      pressureCheck === 'pass'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    ✓ In Green Zone
                  </button>
                  <button
                    onClick={() => setPressureCheck('fail')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      pressureCheck === 'fail'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    ⚠ Depressurized
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {activeAssetType === 'extinguisher'
                      ? 'Tamper Seal & Safety Pull Pin'
                      : activeAssetType === 'hydrant'
                      ? 'Flange & Gland Packing Gasket'
                      : 'Smoke Detector Zone Fault Indicator'}
                  </h4>
                  <p className="text-xs text-slate-500">Physical integrity and non-tamper verification</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTamperCheck('pass')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      tamperCheck === 'pass'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    ✓ Intact
                  </button>
                  <button
                    onClick={() => setTamperCheck('fail')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      tamperCheck === 'fail'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    ⚠ Broken / Leaking
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {activeAssetType === 'extinguisher'
                      ? 'Discharge Horn, Nozzle & Hose'
                      : activeAssetType === 'hydrant'
                      ? 'Canvas Hose Reel & Fog Nozzle'
                      : 'Manual Call Point (MCP) Glass & Key'}
                  </h4>
                  <p className="text-xs text-slate-500">Clear pathway, unobstructed nozzle check</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHoseCheck('pass')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      hoseCheck === 'pass'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    ✓ Clear &amp; Tested
                  </button>
                  <button
                    onClick={() => setHoseCheck('fail')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      hoseCheck === 'fail'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    ⚠ Damaged / Clogged
                  </button>
                </div>
              </div>
            </div>

            {/* Calculated Status Result */}
            <div className="p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
              {pressureCheck === 'pass' && tamperCheck === 'pass' && hoseCheck === 'pass' ? (
                <div className="flex items-center gap-3 text-emerald-800">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <h5 className="text-sm font-bold text-emerald-900">
                      Audit Status: 100% Passed (Compliant)
                    </h5>
                    <p className="text-xs text-emerald-700">
                      Digital certificate updated. Next monthly cycle automatically scheduled for October 2026.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-red-800">
                  <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />
                  <div>
                    <h5 className="text-sm font-bold text-red-900">
                      Defect Flagged: Immediate Priority Ticket Dispatched
                    </h5>
                    <p className="text-xs text-red-700">
                      Instant WhatsApp alert sent to facility head. Refilling quotation auto-generated in client portal.
                    </p>
                  </div>
                </div>
              )}

              <Link
                href="/contact"
                className="px-5 py-2.5 bg-[#0077B6] hover:bg-[#023E8A] text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow"
              >
                Schedule Full Platform Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl font-extrabold text-[#023E8A]">
            Ready to Onboard Your Buildings?
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Our onboarding team migrates your existing Excel inventory in 24 hours and ships your pre-printed weatherproof QR label starter pack directly to your office.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-3.5 bg-[#0077B6] hover:bg-[#023E8A] text-white font-bold text-sm rounded-xl shadow-lg transition-colors"
            >
              Request Free Onboarding Consultation
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-[#023E8A] font-bold text-sm rounded-xl transition-colors"
            >
              View Transparent Pricing Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
