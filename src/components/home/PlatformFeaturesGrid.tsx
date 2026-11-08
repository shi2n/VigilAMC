// UI 'unslop' pass method by Damir Sokolovsky (@heydamir) — github.com/heydamir/unslop (CC BY 4.0)
'use client';

import React from 'react';
import {
  FileSpreadsheet,
  ShieldCheck,
  Wrench,
  RotateCw,
  Radar,
  Map,
  Award,
  Download,
  Mail,
  Building2,
  Flame,
} from 'lucide-react';

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: FeatureItem[] = [
  {
    icon: <FileSpreadsheet className="w-5 h-5 text-[#C2410C]" />,
    title: 'Excel import with templates',
    description: 'Bulk upload building inventories and client registers with pre-mapped Excel templates.',
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-[#C2410C]" />,
    title: 'Approvals queue',
    description: 'Managerial review desk to audit technician checklists, GPS accuracy, and photo proof before signoff.',
  },
  {
    icon: <Wrench className="w-5 h-5 text-[#C2410C]" />,
    title: 'Corrective-action tracking',
    description: 'Track defects, broken seals, and low-pressure units with aging days, severity tags, and workshop notes.',
  },
  {
    icon: <RotateCw className="w-5 h-5 text-[#C2410C]" />,
    title: 'Compliance cycles and auto tasks',
    description: 'Automated work order creation matching Maharashtra Form-B, Delhi Fire Rule 33, and NBC schedules.',
  },
  {
    icon: <Radar className="w-5 h-5 text-[#C2410C]" />,
    title: 'Expiry radar',
    description: 'Proactive 30, 60, and 90-day radar detecting cylinders due for refill, overhaul, or hydrostatic testing.',
  },
  {
    icon: <Map className="w-5 h-5 text-[#C2410C]" />,
    title: 'Floor-plan asset pins',
    description: 'Architectural floor schematics with pinned equipment tags for rapid orientation during field visits.',
  },
  {
    icon: <Award className="w-5 h-5 text-[#C2410C]" />,
    title: 'White-label reports',
    description: 'A4 statutory certificates carrying your agency letterhead, state license number, logo, and digital signature.',
  },
  {
    icon: <Download className="w-5 h-5 text-[#C2410C]" />,
    title: 'Monthly register export',
    description: 'Spreadsheet export (XLSX) formatted for statutory submission to fire brigades and client auditors.',
  },
  {
    icon: <Mail className="w-5 h-5 text-[#C2410C]" />,
    title: 'Email delivery receipts',
    description: 'Client delivery with pre-filled email summaries and direct view links requiring no client login.',
  },
  {
    icon: <Building2 className="w-5 h-5 text-[#C2410C]" />,
    title: 'Client portal',
    description: 'Dedicated read-only portal for facility managers to inspect compliance status and download certificates.',
  },
];

export function PlatformFeaturesGrid() {
  return (
    <section
      id="platform-features"
      data-testid="platform-features-grid"
      className="py-16 sm:py-24 bg-white border-t border-slate-200/80 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8F2] border border-[#FED7AA] shadow-[0_1px_3px_rgba(28,25,23,0.05)] mb-4">
            <Flame className="w-3.5 h-3.5 text-[#C2410C]" />
            <span className="text-xs font-semibold text-[#C2410C]">
              Engineered for fire AMC agencies
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#1C1917]">
            Everything needed to run a fire AMC business<span className="text-[#EA580C]">.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#44403C] leading-relaxed">
            From bulk asset onboarding to statutory compliance certificates — every core tool is built-in and ready on day one.
          </p>
        </div>

        {/* 10-Feature Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#FFF8F2]/60 hover:bg-[#FFF8F2] border border-[#FED7AA]/60 hover:border-[#FED7AA] shadow-xs hover:shadow-md transition-[background-color,border-color,box-shadow] duration-180 flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white border border-[#FED7AA] flex items-center justify-center shadow-xs mb-3.5">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-bold text-[#1C1917] tracking-tight group-hover:text-[#C2410C] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-[#44403C] mt-1.5 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
