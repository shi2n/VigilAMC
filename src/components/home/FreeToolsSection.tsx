'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
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
    icon: <Sparkles className="w-6 h-6 text-[#C2410C]" />,
    badge: 'INTERACTIVE WALKTHROUGH',
    badgeColor: 'bg-[#FFF0E6] text-[#C2410C] border-[#FED7AA]',
    title: 'Live Product Demo',
    description: 'Explore the full admin dashboard, approvals queue, and technician workflows without creating an account.',
    ctaText: 'Open Live Demo',
    href: '/demo',
    testId: 'free-tool-demo',
  },
  {
    icon: <Calculator className="w-6 h-6 text-emerald-700" />,
    badge: 'STATUTORY TOOL (IS 2190)',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    title: 'Extinguisher Calculator',
    description: 'Calculate statutory fire extinguisher quantities, rating codes, and max travel distance based on NBC occupancy hazard.',
    ctaText: 'Calculate Requirements',
    href: '/tools/extinguisher-calculator',
    testId: 'free-tool-calculator',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-blue-700" />,
    badge: 'PUBLIC AUDIT RADAR',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    title: 'Verify Compliance Record',
    description: 'Verify tamper-evident physical asset tags, service history, GPS coordinates, and inspection certificates online.',
    ctaText: 'Verify Asset Tag',
    href: '/verify',
    testId: 'free-tool-verify',
  },
  {
    icon: <Building2 className="w-6 h-6 text-purple-700" />,
    badge: 'CLIENT ACCESS',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    title: 'Client Portal Login',
    description: 'Facility directors and building owners can sign in to view real-time compliance status and download Form-B records.',
    ctaText: 'Access Client Portal',
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#FED7AA] shadow-[0_2px_8px_rgba(234,88,12,0.08)] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
              No Signup Required
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#1C1917]">
            Free Tools &amp; Live Demos
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
              className="glass-panel rounded-2xl p-6 border border-[#FED7AA]/80 shadow-[0_10px_30px_-10px_rgba(28,25,23,0.08)] hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#FED7AA] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    {card.icon}
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${card.badgeColor}`}
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
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA] hover:border-[#EA580C] font-bold text-xs shadow-xs transition-all duration-200 group-hover:bg-[#C2410C] group-hover:text-white"
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
