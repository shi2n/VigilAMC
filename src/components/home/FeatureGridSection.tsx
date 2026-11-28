'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  Languages,
  FileSpreadsheet,
  TableProperties,
  MailCheck,
  History,
  Users,
  Radar,
  CalendarSync,
  Building2,
  Layers,
  Download,
  type LucideIcon,
} from 'lucide-react';
import { AppleReveal } from './AppleReveal';

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  desc: string;
  isStatusIndicators?: boolean;
}

interface FeatureCategory {
  id: string;
  label: string;
  items: FeatureItem[];
}

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    id: 'reporting-compliance',
    label: 'Reporting & Compliance',
    items: [
      {
        icon: Award,
        title: 'White-label reports',
        desc: 'Your agency logo, license number & authorized signature on Form B.',
      },
      {
        icon: TableProperties,
        title: 'Monthly register .xlsx',
        desc: 'Download audit-ready monthly registers formatted for fire officers.',
      },
      {
        icon: MailCheck,
        title: 'Email reports & due alerts',
        desc: 'Send Form B links and upcoming due-date digests straight to clients.',
      },
      {
        icon: History,
        title: 'Asset history timeline',
        desc: 'Every inspection, refill, hydro-test, and repair recorded per unit.',
      },
    ],
  },
  {
    id: 'operations-scheduling',
    label: 'Operations & Scheduling',
    items: [
      {
        icon: Radar,
        title: 'Live status indicators',
        desc: 'Spot risk immediately across buildings and equipment.',
        isStatusIndicators: true,
      },
      {
        icon: CalendarSync,
        title: 'Re-schedule workflow',
        desc: 'Reschedule missed visits and track open repairs without losing history.',
      },
      {
        icon: Building2,
        title: 'Buildings & units',
        desc: 'Organize multi-tower societies, basements, floors, zones, and assets.',
      },
      {
        icon: Layers,
        title: 'Bulk operations',
        desc: 'Assign technicians, update schedules, or schedule dozens of assets together.',
      },
    ],
  },
  {
    id: 'team-data',
    label: 'Team & Data Control',
    items: [
      {
        icon: Users,
        title: 'Teams & roles',
        desc: 'Separate access for agency owners, office supervisors & field technicians.',
      },
      {
        icon: Languages,
        title: 'Multi-language admin (22)',
        desc: 'Run your office dashboard in English or 22 8th-Schedule Indian languages.',
      },
      {
        icon: FileSpreadsheet,
        title: 'Excel import/export',
        desc: 'Bring your entire equipment inventory in or export it cleanly anytime.',
      },
      {
        icon: Download,
        title: 'Data export',
        desc: 'Export all client records and inspection history in one click anytime.',
      },
    ],
  },
];

export function FeatureGridSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="py-20 sm:py-28 bg-white border-t border-[#E7E5E4]"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <AppleReveal className="text-center max-w-[700px] mx-auto mb-12 sm:mb-16">
          <p className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.12em] text-[#C2410C] mb-3">
            Built-in depth
          </p>
          <h2
            id="features-heading"
            className="font-sans font-bold text-[32px] sm:text-[42px] lg:text-[48px] leading-[1.1] tracking-[-0.03em] text-[#1C1917]"
          >
            And yes, everything else.
          </h2>
          <p className="mt-4 text-[17px] sm:text-[18px] text-[#44403C] max-w-[560px] mx-auto leading-relaxed">
            Every day-to-day workflow a growing fire-safety agency needs is included out of the box.
          </p>
          <div className="mt-4">
            <Link
              href="/features"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#C2410C] hover:text-[#9A3412] underline underline-offset-4"
            >
              <span>Explore all features</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </AppleReveal>

        <div className="space-y-10 sm:space-y-12">
          {FEATURE_CATEGORIES.map((category) => (
            <div key={category.id} aria-labelledby={`feature-cat-${category.id}`}>
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                <h3
                  id={`feature-cat-${category.id}`}
                  className="font-sans font-bold text-xs sm:text-[13px] uppercase tracking-[0.1em] text-[#C2410C] shrink-0"
                >
                  {category.label}
                </h3>
                <div className="h-px flex-1 bg-[#FED7AA]/70" aria-hidden="true" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {category.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <AppleReveal key={item.title} delayMs={(idx % 4) * 45}>
                      <div className="h-full rounded-2xl bg-[#FFF8F2]/65 hover:bg-[#FFF8F2] border border-[#FED7AA]/70 p-5 transition-colors duration-150 flex flex-col justify-between">
                        <div>
                          <div className="w-10 h-10 rounded-xl bg-white border border-[#FED7AA] flex items-center justify-center mb-3.5 shadow-xs">
                            <Icon className="w-5 h-5 text-[#C2410C]" aria-hidden="true" />
                          </div>
                          <h4 className="font-sans font-bold text-[15px] text-[#1C1917]">
                            {item.title}
                          </h4>
                          <p className="mt-1.5 text-[13px] text-[#44403C] leading-relaxed">
                            {item.desc}
                          </p>
                        </div>

                        {item.isStatusIndicators && (
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#991B1B] border border-[#DC2626]/40 text-[10px] font-bold">
                              EXPIRED
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#D97706]/40 text-[10px] font-bold">
                              DUE SOON
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#065F46] border border-[#059669]/40 text-[10px] font-bold">
                              OK
                            </span>
                          </div>
                        )}
                      </div>
                    </AppleReveal>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureGridSection;
