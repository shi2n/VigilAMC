'use client';

import React, { useState } from 'react';
import {
  PlusCircle,
  QrCode,
  Smartphone,
  Wrench,
  Camera,
  Database,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function ProductWorkflowSection() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      step: 1,
      title: 'Add Fire-Safety Asset',
      shortTitle: '1. Add Asset',
      category: 'Inventory Setup',
      icon: PlusCircle,
      description:
        'Register extinguishers, hydrants, hose reels, and alarm panels. Log equipment capacity, manufacturer, install dates, floor locations, and statutory test intervals.',
      previewText: 'ASSET REGISTRY: 6kg ABC Dry Powder &bull; Floor 4 North Wing &bull; Next Refill: Nov 2027',
      status: 'LIVE' as const,
    },
    {
      step: 2,
      title: 'Assign QR Code',
      shortTitle: '2. Assign QR',
      category: 'Field Identity',
      icon: QrCode,
      description:
        'Attach a durable, weatherproof QR tag to each physical asset. The platform links the unique tag ID directly to the equipment database record.',
      previewText: 'TAG ID: VIGIL-MH-4019 &bull; Serialized &bull; Weatherproof Anodized Aluminum',
      status: 'LIVE' as const,
    },
    {
      step: 3,
      title: 'Technician Scans QR',
      shortTitle: '3. Scan QR',
      category: 'Field Audit',
      icon: Smartphone,
      description:
        'Technicians scan the QR code using any smartphone browser. The mobile app functions 100% offline in shielded basements and underground pump houses.',
      previewText: 'SCANNER: Camera Viewfinder Active &bull; Offline Mode Engaged &bull; Zero Delay',
      status: 'LIVE' as const,
    },
    {
      step: 4,
      title: 'Perform Service',
      shortTitle: '4. Service Checks',
      category: 'Maintenance Routine',
      icon: Wrench,
      description:
        'Follow structured checklists: pressure gauge in green zone, safety pin & tamper seal intact, nozzle clear, hose uncracked, cylinder weight verified.',
      previewText: 'CHECKLIST: Pressure Gauge (14.5 Bar) &bull; Seal (Intact) &bull; Nozzle (Clean)',
      status: 'LIVE' as const,
    },
    {
      step: 5,
      title: 'Upload Service Evidence',
      shortTitle: '5. Upload Evidence',
      category: 'Proof of Service',
      icon: Camera,
      description:
        'Snap a timestamped photo of the inspected equipment and gauge reading. Capture immediate photographic evidence for any flagged defects.',
      previewText: 'EVIDENCE: Gauge Photo Attached &bull; Timestamped &bull; Geo-tagged (Lat/Lon)',
      status: 'LIVE' as const,
    },
    {
      step: 6,
      title: 'Update Service Record',
      shortTitle: '6. Sync Record',
      category: 'Audit Trail',
      icon: Database,
      description:
        'Inspection records sync automatically to the central cloud database as soon as the technician re-enters network coverage. Maintenance history updates instantly.',
      previewText: 'DATABASE: Record Synced &bull; Next Due Date Calculated &bull; Defect Logged',
      status: 'LIVE' as const,
    },
    {
      step: 7,
      title: 'Generate Client Compliance Report',
      shortTitle: '7. Generate Report',
      category: 'Client Deliverable',
      icon: FileCheck2,
      description:
        'Compile all verified equipment logs into a client-ready Biannual Form-B compliance report with a single click, ready for licensed engineer review and signing.',
      previewText: 'DELIVERABLE: Model Form-B PDF &bull; 100% Verified Asset Schedule &bull; Client Portal Ready',
      status: 'BETA' as const,
    },
  ];

  const current = steps.find((s) => s.step === activeStep) || steps[0];

  return (
    <section id="workflow" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-ocean-50 text-[#0077B6] text-xs font-bold border border-ocean-200 mb-3">
            <span>End-to-End Operational Lifecycle</span>
            <StatusBadge status="LIVE" size="xs" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#023E8A] tracking-tight">
            How VigilAMC Works in Practice
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            From physical equipment tagging to client-facing compliance reports — step by step through real-world workflows.
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
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#0077B6] text-white shadow-md scale-105'
                    : 'bg-white text-slate-600 hover:text-[#0077B6] border border-slate-200 hover:border-[#0077B6]/40'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  isSelected ? 'bg-white text-[#0077B6]' : 'bg-slate-100 text-slate-600'
                }`}>
                  {s.step}
                </span>
                <span>{s.shortTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Active Step Feature Showcase Card */}
        <div className="corp-card p-8 sm:p-10 bg-white border border-slate-200 shadow-xl rounded-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold text-[#0077B6] tracking-wider">
                Step 0{current.step} of 07 &bull; {current.category}
              </span>
              <StatusBadge status={current.status} size="xs" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-[#023E8A]">
              {current.title}
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed">
              {current.description}
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">
                Platform Action Simulation:
              </span>
              <p className="text-slate-800 font-semibold">{current.previewText}</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setActiveStep((prev) => (prev === 7 ? 1 : prev + 1))}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0077B6] hover:bg-[#023E8A] text-white text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
              >
                <span>{activeStep === 7 ? 'Start Over (Step 1)' : 'Next Step'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400">
                Click any step pill above to jump
              </span>
            </div>
          </div>

          {/* Right Visual Step Representation */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-navy-950 text-white shadow-lg space-y-4 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-cyan-200 pb-2 border-b border-slate-800">
                <span className="flex items-center gap-2 font-mono font-bold">
                  <current.icon className="w-4 h-4 text-cyan-400" />
                  Workflow Execution Node
                </span>
                <span className="text-[10px] text-slate-400">Step {current.step}/7</span>
              </div>

              <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-[#0077B6]/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
                  <current.icon className="w-8 h-8 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{current.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">{current.category}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-cyan-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified in production codebase</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
