'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface StartupDirectoryBadgesProps {
  variant?: 'glass' | 'footer';
}

const DIRECTORIES = [
  {
    name: 'BetaList',
    label: 'Verified Startup',
    href: 'https://betalist.com',
    monogram: 'B',
    badgeBg: 'bg-[#EA580C]',
  },
  {
    name: 'Product Hunt',
    label: 'Featured Launch',
    href: 'https://www.producthunt.com',
    monogram: 'P',
    badgeBg: 'bg-[#DA552F]',
  },
  {
    name: 'Indie Hackers',
    label: 'Verified Startup',
    href: 'https://www.indiehackers.com',
    monogram: 'IH',
    badgeBg: 'bg-[#1C1917]',
  },
  {
    name: 'SideProjectors',
    label: 'Verified Project',
    href: 'https://www.sideprojectors.com',
    monogram: 'SP',
    badgeBg: 'bg-[#C2410C]',
  },
  {
    name: 'LaunchIgniter',
    label: 'Verified Launch',
    href: 'https://launchigniter.com/',
    monogram: 'LI',
    badgeBg: 'bg-[#EA580C]',
  },
  {
    name: 'PeerPush',
    label: 'Verified Startup',
    href: 'https://peerpush.com/',
    monogram: 'PP',
    badgeBg: 'bg-[#9A3412]',
  },
];

export function StartupDirectoryBadges({ variant = 'glass' }: StartupDirectoryBadgesProps) {
  if (variant === 'footer') {
    return (
      <div
        data-testid="footer-startup-badges"
        className="pt-5 mt-5 border-t border-[#FAFAF9]/10 flex flex-col gap-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#FF8C42]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF8C42]" />
            <span>Verified &amp; Featured Startup On</span>
          </div>
          <span className="text-[11px] text-[#A8A29E]">
            Recognized across global startup &amp; maker launch directories
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Official Fazier Launch Badge */}
          <a
            href="https://fazier.com/launches/vigilamc.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg bg-white px-2 py-1 shadow-sm hover:scale-[1.02] transition-transform"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=light"
              width={120}
              alt="Fazier badge"
              className="h-7 w-auto"
            />
          </a>

          {DIRECTORIES.map((dir) => (
            <a
              key={dir.name}
              href={dir.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 transition-all hover:-translate-y-0.5"
            >
              <span
                className={`w-5 h-5 rounded-md ${dir.badgeBg} text-white font-display font-bold text-[10px] flex items-center justify-center shrink-0`}
              >
                {dir.monogram}
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-[9px] uppercase tracking-wider text-[#A8A29E] font-medium">
                  {dir.label}
                </span>
                <span className="text-xs font-bold text-[#FAFAF9] mt-0.5">{dir.name}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="verified-startup-badges-band"
      style={{
        background: 'rgba(255, 255, 255, 0.78)',
      }}
      className="glass-panel border border-[#FED7AA] rounded-2xl p-6 sm:p-7 mb-10 sm:mb-12 shadow-[0_12px_36px_-12px_rgba(232,89,12,0.12)]"
    >
      <div className="text-center max-w-2xl mx-auto mb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-[11px] font-bold uppercase tracking-wider text-[#C2410C] mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>Verified Startup Directories</span>
        </div>
        <h3 className="font-display font-bold text-base sm:text-lg text-[#1C1917]">
          Verified Startup on BetaList, Fazier, Product Hunt, Indie Hackers, SideProjectors, LaunchIgniter &amp; PeerPush
        </h3>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-3.5">
        {/* Official Fazier Launch Badge */}
        <a
          href="https://fazier.com/launches/vigilamc.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-xl bg-white border border-[#FED7AA] px-3 py-2 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=light"
            width={120}
            alt="Fazier badge"
            className="h-8 w-auto"
          />
        </a>

        {DIRECTORIES.map((dir) => (
          <a
            key={dir.name}
            href={dir.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-[#FED7AA] shadow-sm hover:border-[#EA580C] hover:-translate-y-0.5 hover:shadow-md transition-all"
          >
            <span
              className={`w-7 h-7 rounded-lg ${dir.badgeBg} text-white font-display font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}
            >
              {dir.monogram}
            </span>
            <span className="flex flex-col text-left leading-tight">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#C2410C]">
                {dir.label}
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#1C1917]">{dir.name}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
