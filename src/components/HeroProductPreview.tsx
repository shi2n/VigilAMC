'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  FileCheck2,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Camera,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Wifi,
  Sparkles,
  Clock,
  Building2,
  Wrench,
  FileText,
  BadgeAlert,
  ChevronRight,
} from 'lucide-react';
import { BorderBeam } from '@/components/ui/border-beam';

interface HeroProductPreviewProps {
  onOpenModal?: () => void;
}

export function HeroProductPreview({ onOpenModal }: HeroProductPreviewProps) {
  const [activeTab, setActiveTab] = useState<'inspection' | 'quote' | 'formB'>('inspection');
  const [isAutoPaused, setIsAutoPaused] = useState(false);

  // Auto-advance tabs every 6 seconds unless user interacted
  useEffect(() => {
    if (isAutoPaused) return;

    const timer = setInterval(() => {
      setActiveTab((prev) => {
        if (prev === 'inspection') return 'quote';
        if (prev === 'quote') return 'formB';
        return 'inspection';
      });
    }, 6000);

    return () => clearInterval(timer);
  }, [isAutoPaused]);

  const handleTabClick = (tab: 'inspection' | 'quote' | 'formB') => {
    setActiveTab(tab);
    setIsAutoPaused(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-10 sm:mt-14 text-left">
      {/* Outer Browser Mockup Window */}
      <div className="relative rounded-2xl bg-white border border-[#DCE7F2] shadow-xl shadow-slate-200/50 overflow-hidden transition-all duration-300 hover:border-[#0077B6]/40">
        <BorderBeam colorFrom="#0077B6" colorTo="#023E8A" />
        {/* Top Window Bar */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Window control dots */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/90 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block" />
            </div>

            {/* Simulated URL pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-slate-800/80 text-[11px] font-mono text-slate-300 border border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>app.vigilamc.com/agency/field-ops</span>
            </div>
          </div>

          {/* Interactive Navigation Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-800/90 border border-slate-700/70 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleTabClick('inspection')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'inspection'
                  ? 'bg-[#0077B6] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>1. Mobile Site Inspection</span>
            </button>

            <button
              onClick={() => handleTabClick('quote')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'quote'
                  ? 'bg-[#0077B6] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              <span>2. Defect &amp; Refill Quote</span>
            </button>

            <button
              onClick={() => handleTabClick('formB')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'formB'
                  ? 'bg-[#0077B6] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-cyan-300" />
              <span>3. Instant Form-B PDF</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display Area */}
        <div className="p-4 sm:p-6 lg:p-7 bg-[#F8FAFC] min-h-[440px] flex flex-col justify-center">
          {/* TAB 1: Mobile Site Inspection */}
          {activeTab === 'inspection' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center animate-fadeIn">
              {/* Left Column: Technician Phone Mockup */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="w-full max-w-[340px] rounded-3xl bg-slate-900 p-3 shadow-2xl border-4 border-slate-800 text-slate-100">
                  {/* Phone Speaker & Camera Notch */}
                  <div className="flex items-center justify-between px-3 pt-1 pb-2 text-[10px] text-slate-400 font-medium">
                    <span>11:42 AM</span>
                    <div className="w-16 h-3.5 bg-slate-800 rounded-full" />
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-emerald-400 font-bold">5G</span>
                      <div className="w-3 h-2 border border-slate-400 rounded-sm" />
                    </div>
                  </div>

                  {/* App Screen Container */}
                  <div className="rounded-2xl bg-slate-900 p-3.5 border border-slate-800/80 space-y-3">
                    {/* Top Bar with Offline Tag */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                      <div>
                        <div className="font-bold text-white text-xs">VigilAMC Mobile</div>
                        <div className="text-[10px] text-slate-400">Express Trade Towers • Tower B</div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                        <Wifi className="w-2.5 h-2.5" />
                        <span>Offline Sync Active</span>
                      </span>
                    </div>

                    {/* Active Asset Card */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                          EXT-0104
                        </span>
                        <span className="text-[10px] text-slate-400">Asset 18 of 24</span>
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">6kg ABC Dry Powder Extinguisher</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#0077B6]" />
                          <span>Tower B • 4th Floor North Staircase</span>
                        </div>
                      </div>

                      {/* Checklist items */}
                      <div className="space-y-1.5 pt-1 text-[11px]">
                        <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-300">Pressure Gauge Reading</span>
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> 14.5 Bar (Normal)
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-300">Safety Pin &amp; Lead Seal</span>
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Intact
                          </span>
                        </div>
                      </div>

                      {/* Stamped GPS verification pill */}
                      <div className="p-2 rounded-lg bg-blue-950/40 border border-blue-800/40 text-[10px] text-slate-300 space-y-1">
                        <div className="flex items-center justify-between text-cyan-300 font-mono">
                          <span>GPS: 28.5355° N, 77.3910° E</span>
                          <span className="text-emerald-400">✓ Accurate (±4m)</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Timestamp: 21 Oct 2026, 11:41 IST</span>
                          <span className="text-cyan-400 font-medium flex items-center gap-1">
                            <Camera className="w-2.5 h-2.5" /> 1 Photo Saved
                          </span>
                        </div>
                      </div>

                      <button className="w-full py-2 rounded-lg bg-gradient-to-r from-[#0077B6] to-[#023E8A] hover:from-[#006494] hover:to-[#011F48] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
                        <span>Save &amp; Next Asset</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Supervisor Sync Feed & Value Summary */}
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0077B6] text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tamper-Proof Field Execution</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  Technicians log real tests on mobile — offline or online.
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  No more paper sheets filled in the parking lot. VigilAMC enforces live GPS verification, photo
                  timestamps, and auto-syncs subterranean pump room checks as soon as the technician reaches surface network.
                </p>

                {/* Live Feed Card */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-2.5">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Live Agency Supervisor Dashboard</span>
                    <span className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      3 Techs Active
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                        RS
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">Rakesh S. logged Extinguisher EXT-0104</div>
                        <div className="text-[11px] text-slate-500">Express Trade Towers • Tower B (4th Fl) • 14.5 Bar ✓</div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">1m ago</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-[#0077B6] font-bold text-[10px] flex items-center justify-center shrink-0">
                        SK
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">Sunil K. tested Hydrant Riser #HYD-12</div>
                        <div className="text-[11px] text-slate-500">DLF Cyber City • Static Pressure 7.2 Bar ✓</div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">7m ago</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={onOpenModal}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0077B6] hover:bg-[#023E8A] text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    <span>See Live Field Demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-slate-500">Works on any basic Android / iOS smartphone</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Defect & Refill Quote */}
          {activeTab === 'quote' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center animate-fadeIn">
              {/* Left Column: Flagged Defect Cards */}
              <div className="lg:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                  <BadgeAlert className="w-3.5 h-3.5" />
                  <span>Immediate Revenue Capture</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  Turn flagged inspection defects into approved repair orders.
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  When a technician flags an underweight CO2 cylinder or leaking hydrant valve, VigilAMC compiles
                  the photo proof into an instant quotation that facility managers approve directly on WhatsApp.
                </p>

                {/* Defect Cards Container */}
                <div className="space-y-2.5 pt-1">
                  {/* Defect 1 */}
                  <div className="p-3.5 rounded-xl bg-white border border-rose-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                          DEFECT FLAGGED
                        </span>
                        <span className="text-xs font-bold text-slate-900">4.5kg CO2 Extinguisher (CO2-0042)</span>
                      </div>
                      <div className="text-xs text-slate-600">
                        Server Room • 2nd Floor — <strong className="text-rose-700">Loss: -0.70kg / -15.5% (&gt;10% IS 2190)</strong> (Tare: 10.20kg | Full Gross: 14.70kg | Measured Gross: 14.00kg • Net Gas: 3.80kg vs 4.50kg)
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span className="text-cyan-700 font-medium flex items-center gap-1">
                          <Camera className="w-3 h-3" /> Scale Photo Attached #IMG-8821
                        </span>
                      </div>
                    </div>
                    <div className="text-right sm:border-l sm:border-slate-100 sm:pl-4">
                      <div className="text-[11px] text-slate-400">Refill &amp; Hydro-Seal</div>
                      <div className="text-sm font-extrabold text-[#023E8A]">₹1,450</div>
                    </div>
                  </div>

                  {/* Defect 2 */}
                  <div className="p-3.5 rounded-xl bg-white border border-amber-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          REPAIR NEEDED
                        </span>
                        <span className="text-xs font-bold text-slate-900">63mm Landing Valve (HYD-0019)</span>
                      </div>
                      <div className="text-xs text-slate-600">
                        Tower A • 7th Floor Riser — <strong className="text-amber-700">Rubber Washer Degraded</strong> (0.4 bar weep)
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span className="text-cyan-700 font-medium flex items-center gap-1">
                          <Camera className="w-3 h-3" /> Valve Seep Photo #IMG-8824
                        </span>
                      </div>
                    </div>
                    <div className="text-right sm:border-l sm:border-slate-100 sm:pl-4">
                      <div className="text-[11px] text-slate-400">Neoprene Washer Overhaul</div>
                      <div className="text-sm font-extrabold text-[#023E8A]">₹1,950</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Instant Quotation Preview */}
              <div className="lg:col-span-5">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-md space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Client Defect Quotation</div>
                      <div className="text-[11px] text-slate-500">Ref: QT-2026-OCT-094</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      1-Click Approval
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>CO2 Cylinder Refilling (1x)</span>
                      <span className="font-medium text-slate-900">₹1,450</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Hydrant Landing Valve Overhaul (1x)</span>
                      <span className="font-medium text-slate-900">₹1,950</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Scheduled Quarterly Consumables</span>
                      <span className="font-medium text-slate-900">₹710</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-dashed border-slate-200">
                      <span>Subtotal</span>
                      <span>₹4,110</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>GST @ 18%</span>
                      <span>₹740</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                      <span className="text-[#023E8A]">Total Repair Quote</span>
                      <span className="text-[#023E8A] text-base">₹4,850</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium text-center">
                    ✓ Recovered ₹4,850 in billable parts that paper logs usually overlook.
                  </div>

                  <button
                    onClick={onOpenModal}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0077B6] to-[#023E8A] hover:from-[#006494] hover:to-[#011F48] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span>Schedule Quotation Walkthrough</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Instant Form-B PDF */}
          {activeTab === 'formB' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center animate-fadeIn">
              {/* Left Column: Mini A4 Certificate Mockup */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="w-full max-w-[380px] bg-white rounded-xl shadow-2xl border border-slate-300 p-5 space-y-3 font-serif text-slate-900">
                  {/* Certificate Top Header */}
                  <div className="text-center pb-2 border-b-2 border-slate-900 space-y-0.5">
                    <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-slate-500">
                      Schedule Under State Fire Prevention &amp; Life Safety Rules
                    </div>
                    <div className="text-sm font-bold tracking-tight uppercase">
                      FORM-B BIANNUAL CERTIFICATE
                    </div>
                    <div className="text-[10px] font-sans text-slate-600">
                      NBC 2016 Part 4 &bull; Periodic Maintenance &amp; Verification
                    </div>
                  </div>

                  {/* Building & Agency Meta */}
                  <div className="text-[10px] font-sans space-y-1 bg-slate-50 p-2 rounded border border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Premises:</span>
                      <strong className="text-slate-900">Express Trade Towers, Tower B</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Licensed Agency:</span>
                      <strong className="text-slate-900">Apex Fire Safety Solutions</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Licence / Reg No:</span>
                      <span className="font-mono text-slate-700">DFS/LIC/2026/042</span>
                    </div>
                  </div>

                  {/* System Schedule Table Preview */}
                  <table className="w-full text-[10px] font-sans border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-left border-b border-slate-300">
                        <th className="py-1 px-1.5 font-bold">Fire System</th>
                        <th className="py-1 px-1.5 font-bold text-center">Qty</th>
                        <th className="py-1 px-1.5 font-bold text-right">Condition</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-1 px-1.5 font-medium">Portable Extinguishers (IS 2190)</td>
                        <td className="py-1 px-1.5 text-center">48</td>
                        <td className="py-1 px-1.5 text-right text-emerald-700 font-bold">100% Valid</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-1.5 font-medium">Wet Riser &amp; Landing Valves</td>
                        <td className="py-1 px-1.5 text-center">14</td>
                        <td className="py-1 px-1.5 text-right text-emerald-700 font-bold">7.2 Bar Pass</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-1.5 font-medium">Automatic Sprinkler Header</td>
                        <td className="py-1 px-1.5 text-center">3</td>
                        <td className="py-1 px-1.5 text-right text-emerald-700 font-bold">Operational</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-1.5 font-medium">Main Diesel Fire Pump Engine</td>
                        <td className="py-1 px-1.5 text-center">1</td>
                        <td className="py-1 px-1.5 text-right text-emerald-700 font-bold">Auto-Start OK</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Official Stamp & Sign Box */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200 text-[10px] font-sans">
                    <div>
                      <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#0077B6]/70 flex items-center justify-center text-[8px] font-bold text-[#0077B6] uppercase text-center rotate-[-12deg]">
                        Agency<br />Seal Verified
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-serif italic font-bold text-slate-800">R. K. Verma</div>
                      <div className="text-[9px] text-slate-500">Authorized Signatory &bull; Lic. Fire Agency</div>
                      <div className="text-[8px] text-emerald-600 font-mono">Digitally Compiled via VigilAMC</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Explanatory & Link to /sample-report */}
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>1-Click Compliance Export</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  Official Form-B reports generated with zero Excel copy-paste.
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Every asset schedule, inspection reading, and photo annexure is auto-compiled into state-compliant
                  Form-B PDFs formatted for your Licensed Agency stamp and signature. Hand them to clients immediately.
                </p>

                <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-2 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0077B6]" />
                    <span>Included in every compiled Form-B packet:</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Complete equipment inventory with barcode/serial and location tags</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>GPS coordinates &amp; timestamped photo evidence annexure</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>State statutory compliance declarations (Maharashtra, Delhi, Karnataka)</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Link
                    href="/sample-report"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0077B6] hover:bg-[#023E8A] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer group"
                  >
                    <span>Open Full Interactive Sample Report</span>
                    <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <button
                    onClick={onOpenModal}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    <span>Book Agency Demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HeroProductPreview;
