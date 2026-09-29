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
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';

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
            Operational Blueprint
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-[#023E8A] tracking-[-0.03em] mt-4 text-balance">
            How VigilAMC Works in the Field
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto text-pretty">
            From sticking physical serialized QR codes on equipment to generating statutory Form-B PDF certificates — here is how fire protection AMC workflows operate step by step.
          </p>
        </div>
      </section>

      {/* 4-Step Detailed Implementation Timeline */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="space-y-20">
          {/* Step 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="corp-card p-6 bg-slate-50 border-ocean-200/80 shadow-card">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">Asset Data Ingestion [Sample View]</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold tabular-nums">
                    48 ASSETS PARSED
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center shadow-xs">
                    <div>
                      <p className="font-bold text-[#023E8A]">Tower B — Floor 04</p>
                      <p className="text-slate-500">6kg ABC Powder #EXT-401 to #EXT-408</p>
                    </div>
                    <span className="text-emerald-600 font-bold">✓ Tag Assigned</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center shadow-xs">
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
                Phase 01 &bull; Asset Setup &amp; Tagging
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#023E8A] tracking-tight">
                Spreadsheet Import &amp; Rapid QR Tagging
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed text-pretty">
                Import existing facility equipment spreadsheets using structured CSV/Excel templates. Organize assets by building, wing, floor, and equipment classification.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed text-pretty">
                Pair each fire extinguisher, landing valve, hose reel, or alarm panel with a durable serialized QR code sticker. On-site technicians scan the tag with their smartphone camera to bind location and specifications in seconds.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Supports ABC, CO2, Foam, Wet Chemical, Hydrants</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Serialized alphanumeric QR identifiers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 text-[#023E8A] text-xs font-extrabold border border-navy-200">
                Phase 02 &bull; Scheduled Maintenance
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#023E8A] tracking-tight">
                Statutory Inspection Schedules &amp; Renewal Reminders
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Fire regulations mandate periodic inspection intervals: monthly visual inspections, quarterly functional checks, biannual Form-B certifications, and periodic hydrostatic pressure testing (as per IS 2190).
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                VigilAMC calculates the expiry window for each asset. When a renewal approaches, our reminder engine sends notifications to your operations desk 60, 30, and 7 days prior to expiry.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>60-30-7 day automated warning notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Prevents last-minute emergency refilling panics</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="corp-card p-6 bg-white border-navy-200 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-[#023E8A] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#0077B6]" />
                    Compliance Schedule [Sample View]
                  </span>
                  <span className="text-[10px] bg-ocean-50 text-[#0077B6] px-2 py-0.5 rounded font-bold">
                    ACTIVE CADENCE
                  </span>
                </div>
                <div className="mt-3 space-y-2.5 text-xs">
                  <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-emerald-900">Monthly Visual Check</p>
                      <p className="text-emerald-700 text-[11px]">Due in 4 days &bull; Technician Scheduled</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded text-[10px] font-bold">
                      SCHEDULED
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-amber-50 border border-amber-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-amber-900">Biannual Form-B Cycle</p>
                      <p className="text-amber-700 text-[11px]">Due in 18 days &bull; Summary In Progress</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded text-[10px] font-bold">
                      IN PROGRESS
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">Hydrostatic Pressure Testing</p>
                      <p className="text-slate-500 text-[11px]">12 Cylinders Due in 2027</p>
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
                    <span className="text-xs font-bold text-slate-200">Mobile Checklist [Sample View]</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                    OFFLINE CACHE
                  </span>
                </div>
                <div className="mt-4 space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                    <p className="text-slate-400">Scanned QR Code</p>
                    <p className="font-mono text-cyan-300 font-bold mt-0.5">VIGIL-EXT-2041 [Extinguisher #14]</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center p-2 rounded bg-slate-800">
                      <span>Pressure Gauge (14.2 Bar)</span>
                      <span className="text-emerald-400 font-bold">✓ PASS</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-slate-800">
                      <span>Safety Pin &amp; Seal Intact</span>
                      <span className="text-emerald-400 font-bold">✓ PASS</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-slate-800">
                      <span>Inspection Timestamp</span>
                      <span className="text-emerald-400 font-bold">✓ RECORDED</span>
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
                Mobile Field Checklist with Timestamped Verification
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Technicians scan each equipment QR code with their mobile device. The inspection checklist matches the specific asset class — checking pressure gauges, nozzles, hoses, and physical mounting brackets.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Checklists operate offline in basement pump rooms and shielded shafts. Inspection logs record timestamps and optional device coordinates to establish verifiable proof of physical inspection.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200">
                Phase 04 &bull; Form-B Certification
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#023E8A] tracking-tight">
                Automated Form-B Generation &amp; Client Reporting
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                At the end of each biannual cycle, generate a standardized Form-B certificate in PDF format. The system compiles every inspected asset, test date, and non-conformance rectification record into official legal formats for authorized contractor signature.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Deliver clean, professional documentation to building committees and municipal authorities, demonstrating thorough maintenance and protecting contract renewals.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="corp-card p-6 bg-gradient-to-br from-white to-emerald-50/50 border-emerald-200 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">Form-B Biannual Certificate</span>
                  </div>
                  <StatusBadge status="SAMPLE" />
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Statutory Reference:</span>
                    <strong className="text-slate-900">Maharashtra Fire Act Sec 3(1)</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Equipments Compiled:</span>
                    <strong className="text-slate-900">48 Units (44 OK / 4 Defect)</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Licensed Agency Review:</span>
                    <strong className="text-emerald-700">Ready for Endorsement</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Inspection Record:</span>
                    <strong className="text-emerald-700 font-extrabold">Complete &amp; Timestamped</strong>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200">
                  <Link
                    href="/sample-report"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg text-center block transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Inspect Sample Form-B PDF</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statutory Clarification Box */}
      <section className="py-6 px-4 max-w-4xl mx-auto">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Statutory Responsibility Clarification:</strong> Form-B certificates generated by VigilAMC provide standardized data compilation and formatting based on field logs. Final legal certification and Form-B submission must be signed and stamped by a licensed fire safety contractor holding a valid license issued by the relevant State Fire Authority.
          </p>
        </div>
      </section>

      {/* Interactive Simulator */}
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
              Select an asset type, toggle inspection parameters, and see how VigilAMC records condition checks.
            </p>
          </div>

          <div className="corp-card p-6 sm:p-8 bg-white border-ocean-200 shadow-xl">
            {/* Asset Selector Tabs */}
            <div className="flex flex-wrap gap-2 pb-6 border-b border-slate-200">
              <button
                onClick={() => setActiveAssetType('extinguisher')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeAssetType === 'extinguisher'
                    ? 'bg-[#0077B6] text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ABC Fire Extinguisher (6kg)
              </button>
              <button
                onClick={() => setActiveAssetType('hydrant')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeAssetType === 'hydrant'
                    ? 'bg-[#0077B6] text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Wet Riser Landing Valve
              </button>
              <button
                onClick={() => setActiveAssetType('panel')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeAssetType === 'panel'
                    ? 'bg-[#0077B6] text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Fire Alarm Control Panel
              </button>
            </div>

            {/* Checklist Simulator Options */}
            <div className="py-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {activeAssetType === 'extinguisher'
                      ? 'Pressure Gauge Needle Check'
                      : activeAssetType === 'hydrant'
                      ? 'Static Water Pressure (Min 3.5 Bar)'
                      : 'Mains & Battery Standby Power'}
                  </h4>
                  <p className="text-xs text-slate-500">Visual gauge verification and pressure status</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPressureCheck('pass')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pressureCheck === 'pass'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    ✓ In Green Zone
                  </button>
                  <button
                    onClick={() => setPressureCheck('fail')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                      ? 'Gland Packing Gasket & Spindle'
                      : 'Zone Fault Indicator Status'}
                  </h4>
                  <p className="text-xs text-slate-500">Physical integrity and tamper verification</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTamperCheck('pass')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tamperCheck === 'pass'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    ✓ Intact
                  </button>
                  <button
                    onClick={() => setTamperCheck('fail')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tamperCheck === 'fail'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    ⚠ Defective / Broken
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
                      : 'Manual Call Point (MCP) Glass'}
                  </h4>
                  <p className="text-xs text-slate-500">Physical damage, obstruction, and cleanliness check</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHoseCheck('pass')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      hoseCheck === 'pass'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    ✓ Clear &amp; Ready
                  </button>
                  <button
                    onClick={() => setHoseCheck('fail')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      hoseCheck === 'fail'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    ⚠ Damaged / Missing
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
                      Audit Status: Passed (Ready for Next Scheduled Cycle)
                    </h5>
                    <p className="text-xs text-emerald-700">
                      Inspection logged in local cache. Next maintenance window scheduled according to IS 2190 standards.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-red-800">
                  <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />
                  <div>
                    <h5 className="text-sm font-bold text-red-900">
                      Defect Logged: Added to Remediation Schedule
                    </h5>
                    <p className="text-xs text-red-700">
                      Non-conformance recorded with defect details. Marked for repair/refilling before Form-B finalization.
                    </p>
                  </div>
                </div>
              )}

              <Link
                href="/sample-report"
                className="px-5 py-2.5 bg-[#0077B6] hover:bg-[#023E8A] text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow cursor-pointer"
              >
                Inspect Sample Form-B
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl font-extrabold text-[#023E8A]">
            Ready to Put Your Operations on Autopilot?
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Join the free pilot cohort to test QR tagging and automated Form-B generation with your team.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/#pilot-section"
              className="px-8 py-3.5 bg-[#0077B6] hover:bg-[#023E8A] text-white font-bold text-sm rounded-xl shadow-lg transition-colors"
            >
              Apply for Free Pilot
            </Link>
            <Link
              href="/sample-report"
              className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-[#023E8A] font-bold text-sm rounded-xl transition-colors"
            >
              Download Sample Form-B PDF
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
