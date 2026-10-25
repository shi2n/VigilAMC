'use client';

import React, { useState } from 'react';
import {
  PlusCircle,
  MapPin,
  Camera,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  AlertTriangle,
  Receipt,
  Smartphone,
  Gauge,
  Clock
} from 'lucide-react';

export function ProductWorkflowSection() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      step: 1,
      title: 'Register Assets (Excel Import or 1-Click Entry)',
      shortTitle: '1. Register Assets',
      category: 'Inventory Setup',
      icon: PlusCircle,
      description:
        'Import your client equipment rosters from Excel or register extinguishers, hydrants, hose reels, and alarm panels manually. Track capacities, serial numbers, locations, and statutory refill & hydro-test due dates.',
    },
    {
      step: 2,
      title: 'Record on Site (GPS, Offline Checks & Photo)',
      shortTitle: '2. Record on Site',
      category: 'Field Inspection',
      icon: MapPin,
      description:
        'Technicians record gauge pressure readings, pin/seal integrity, floor notes, GPS position, and timestamped condition photos on mobile phones — even 100% offline in underground basement pump rooms.',
    },
    {
      step: 3,
      title: 'Flag Defects & Auto-Generate Client Repair Quotes',
      shortTitle: '3. Flag Defects & Quote',
      category: 'Defect Remediation & Revenue',
      icon: Camera,
      description:
        'Depressurized cylinders, leaking hydrant valves, or dead alarm batteries are logged with timestamped photo proof. Instantly generates an itemized client refill & repair estimate so facility managers approve without delays.',
    },
    {
      step: 4,
      title: 'Compile Standardized Form-B Compliance Report',
      shortTitle: '4. Generate Form-B',
      category: 'Statutory Deliverable',
      icon: FileCheck2,
      description:
        '1-click compilation of verified equipment logs, locations, and photo evidence into a model Form-B compliance certificate formatted for your licensed agency seal and authorized signatory.',
    },
  ];

  const current = steps.find((s) => s.step === activeStep) || steps[0];

  return (
    <section id="workflow" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-ocean-50 text-[#0077B6] text-xs font-bold border border-ocean-200 mb-3">
            <span>End-to-End AMC Lifecycle</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#023E8A] tracking-tight">
            How VigilAMC Works in Practice
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            From client asset registration and GPS field checks to photo-approved defect billing and Form-B compliance certificates.
          </p>
        </div>

        {/* Step Navigation Pill Strip */}
        <div className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin">
          {steps.map((s) => {
            const isSelected = activeStep === s.step;
            return (
              <button
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#0077B6] text-white shadow-md scale-105'
                    : 'bg-white text-slate-600 hover:text-[#0077B6] border border-slate-200 hover:border-[#0077B6]/40'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isSelected ? 'bg-white text-[#0077B6]' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {s.step}
                </span>
                <span>{s.shortTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Active Step Feature Showcase Card */}
        <div className="corp-card p-6 sm:p-10 bg-white border border-slate-200 shadow-xl rounded-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Description & Controls */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold text-[#0077B6] tracking-wider">
                Step 0{current.step} of 04 &bull; {current.category}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-[#023E8A]">
              {current.title}
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed">
              {current.description}
            </p>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setActiveStep((prev) => (prev === 4 ? 1 : prev + 1))}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0077B6] hover:bg-[#023E8A] text-white text-xs font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <span>{activeStep === 4 ? 'Start Over (Step 1)' : 'Next Step'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400">
                Click any step above to jump
              </span>
            </div>
          </div>

          {/* Right Column: Realistic Live Product UI Preview */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-gradient-to-br from-[#0B1528] via-[#0F1E36] to-[#0A1628] text-white shadow-2xl p-5 border border-slate-700/80">
              {/* Window chrome header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700/60 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-[11px] text-cyan-300 font-bold">
                    VigilAMC &bull; Step {activeStep} Live Preview
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {current.category}
                </span>
              </div>

              {/* Dynamic UI Previews matching Step 1-4 */}
              {activeStep === 1 && (
                <div className="space-y-3 font-sans animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1">
                    <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Apex Tower B &bull; Asset Master Table
                    </span>
                    <span className="text-emerald-400 font-mono">Excel Import Active</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-mono text-cyan-200 font-bold">
                      <span>VIGIL-DP-4019</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                        REGISTERED
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                      <div>
                        <span className="text-slate-500 block">Equipment:</span>
                        <strong className="text-white">6kg ABC Dry Powder</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Location:</span>
                        <strong className="text-white">Tower A, 4th Floor Lobby</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Refill Frequency:</span>
                        <span className="text-slate-300">Annual (Nov 2026)</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Hydro Test (HPT):</span>
                        <strong className="text-amber-400">Due Nov 2027</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 text-[11px] text-slate-300">
                    <span>Batch Import: <strong>48 assets mapped from Excel</strong></span>
                    <span className="text-emerald-400 font-semibold">0 Errors</span>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-3 font-sans animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1">
                    <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                      <Smartphone className="w-3.5 h-3.5" />
                      Technician Mobile Form &bull; Offline Mode
                    </span>
                    <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
                      GPS LOCKED
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold text-white">Pressure Reading:</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs">
                        14.5 Bar [GREEN ZONE]
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400">Safety Pin &amp; Tamper Seal:</span>
                      <span className="text-emerald-400 font-semibold">Intact &bull; Verified</span>
                    </div>

                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 space-y-1 text-[11px] font-mono text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">GPS Position:</span>
                        <span className="text-cyan-300">28.4595° N, 77.0266° E</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Timestamp:</span>
                        <span className="text-slate-300">Today, 11:42 AM IST</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Photo Proof:</span>
                        <span className="text-emerald-400">IMG_2026_0102.jpg [Attached]</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-blue-950/40 border border-blue-800/40 text-[11px] text-cyan-200 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Cached locally in subterranean basement &bull; Syncs on network</span>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-3 font-sans animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1">
                    <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Defect Flagged on Site &bull; Quote Created
                    </span>
                    <span className="text-red-400 font-mono text-[10px] bg-red-950/80 px-2 py-0.5 rounded border border-red-700/50">
                      ACTION REQUIRED
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-red-900/40 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-red-300 font-bold">VIGIL-CO-0102 &bull; 4.5kg CO2</span>
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold">
                        UNDERWEIGHT -0.70KG (-15.5%)
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Tare 10.20kg &bull; Full Gross 14.70kg &bull; Measured Gross 14.00kg (Net Gas: 3.80kg vs 4.50kg &bull; Loss: -0.70kg / -15.5% &gt; 10% IS 2190 threshold &mdash; Immediate Refill Required). Photo evidence logged.
                    </p>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-slate-400 font-mono">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Receipt className="w-3.5 h-3.5 text-cyan-400" />
                          Auto-Generated Client Quote:
                        </span>
                        <strong className="text-emerald-400 font-bold text-xs">₹1,450.00</strong>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Item: 4.5kg CO2 Gas Refill + High-Pressure Discharge Horn Seal Servicing
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-200">
                    <span>1-Tap Send to Facility Manager via WhatsApp/Email</span>
                    <strong className="text-white">Fast Quote Approval</strong>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="space-y-3 font-sans animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1">
                    <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                      <FileCheck2 className="w-3.5 h-3.5" />
                      Model Form-B Certificate Package Ready
                    </span>
                    <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
                      PRINT READY A4
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <span className="font-bold text-white block">Apex Business Towers (Tower B)</span>
                        <span className="text-[10px] text-slate-400">Biannual Statutory Maintenance Filing</span>
                      </div>
                      <span className="font-mono text-cyan-300 font-bold text-xs">FORM-B/2026/042</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                      <div>
                        <span className="text-slate-500 block">Audited Assets:</span>
                        <strong className="text-white">48 Units Compiled</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Status:</span>
                        <strong className="text-emerald-400">44 Operational / 4 Quoted</strong>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Authorized Agency Seal Block:</span>
                      <span className="text-cyan-300 font-mono">DL/FIRE/LIC/2026/042</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 text-[11px] text-slate-300">
                    <span>Generated in under 60 seconds from field logs</span>
                    <span className="text-cyan-300 font-semibold">Ready for Signature</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
