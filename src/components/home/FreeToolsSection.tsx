// UI 'unslop' pass method by Damir Sokolovsky (@heydamir) — github.com/heydamir/unslop (CC BY 4.0)
'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Calculator,
  ShieldCheck,
  Building2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface ToolCard {
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  ctaText: string;
  href: string;
  testId: string;
}

const toolCards: ToolCard[] = [
  {
    icon: <LayoutDashboard className="w-6 h-6 text-[#C2410C]" />,
    badge: 'Interactive demo',
    badgeColor: 'bg-[#FFF0E6] text-[#C2410C] border-[#FED7AA]',
    title: 'Live product demo',
    description: 'Explore the full admin dashboard, approvals queue, and technician workflows without creating an account.',
    ctaText: 'Open live demo',
    href: '/demo',
    testId: 'free-tool-demo',
  },
  {
    icon: <Calculator className="w-6 h-6 text-[#C2410C]" />,
    badge: 'IS 2190 calculator',
    badgeColor: 'bg-[#FFF8F2] text-[#44403C] border-[#FED7AA]',
    title: 'Extinguisher calculator',
    description: 'Calculate statutory fire extinguisher quantities, rating codes, and max travel distance based on NBC occupancy hazard.',
    ctaText: 'Calculate requirements',
    href: '/tools/extinguisher-calculator',
    testId: 'free-tool-calculator',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-[#C2410C]" />,
    badge: 'Audit verification',
    badgeColor: 'bg-[#FFF8F2] text-[#44403C] border-[#FED7AA]',
    title: 'Verify compliance record',
    description: 'Verify tamper-evident physical asset tags, service history, GPS coordinates, and inspection certificates online.',
    ctaText: 'Verify asset tag',
    href: '/verify',
    testId: 'free-tool-verify',
  },
  {
    icon: <Building2 className="w-6 h-6 text-[#C2410C]" />,
    badge: 'Client portal',
    badgeColor: 'bg-[#FFF8F2] text-[#44403C] border-[#FED7AA]',
    title: 'Client portal login',
    description: 'Facility directors and building owners can sign in to view real-time compliance status and download Form-B records.',
    ctaText: 'Access client portal',
    href: '/portal/login',
    testId: 'free-tool-portal',
  },
];

export function FreeToolsSection() {
  return (
    <section
      id="free-tools"
      data-testid="free-tools-section"
      className="py-16 sm:py-24 bg-[#FFF8F2] border-t border-[#FED7AA]/60 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#FED7AA] shadow-[0_1px_3px_rgba(28,25,23,0.06)] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
            <span className="text-xs font-semibold text-[#C2410C]">
              No signup required
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#1C1917]">
            Free tools and live demos<span className="text-[#EA580C]">.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#44403C] leading-relaxed">
            Test the platform right now, calculate your facility fire safety requirements, or verify an existing asset inspection.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {toolCards.map((card, idx) => (
            <div
              key={idx}
              data-testid={card.testId}
              className="glass-panel rounded-2xl p-6 border border-[#FED7AA]/80 shadow-[0_10px_30px_-10px_rgba(28,25,23,0.08)] hover:shadow-md transition-[box-shadow,border-color] duration-180 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#FED7AA] flex items-center justify-center shadow-xs">
                    {card.icon}
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-[#1C1917] tracking-tight group-hover:text-[#C2410C] transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#44403C] mt-2 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="pt-6">
                <Link
                  href={card.href}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA] hover:border-[#EA580C] font-semibold text-xs shadow-xs transition-[background-color,color,border-color] duration-150 group-hover:bg-[#C2410C] group-hover:text-white"
                >
                  <span>{card.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
