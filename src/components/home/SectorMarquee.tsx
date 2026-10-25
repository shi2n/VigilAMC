'use client';

import React from 'react';
import { useReducedMotion } from 'motion/react';

const SECTORS = [
  'Hospitals',
  'Malls',
  'Schools',
  'Housing Societies',
  'Warehouses',
  'Factories',
  'Hotels',
  'IT Parks',
  'Petrol Pumps',
] as const;

export function SectorMarquee() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-label="Sectors served across India"
      className="w-full rounded-2xl bg-[#FFF4EC] border border-[#FED7AA] py-4 px-4 overflow-hidden"
    >
      {/* Mobile (<640px) OR Reduced Motion: wrapped static chip row */}
      <div
        className={`flex-wrap items-center justify-center gap-2 ${
          shouldReduceMotion ? 'flex' : 'flex sm:hidden'
        }`}
      >
        {SECTORS.map((sector) => (
          <span
            key={sector}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#FED7AA] text-xs font-display font-semibold text-[#1C1917]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" aria-hidden="true" />
            <span>{sector}</span>
          </span>
        ))}
      </div>

      {/* Desktop (>=640px) with motion enabled: slow 40s loop, pauses on hover, duplicate hidden from screen readers */}
      {!shouldReduceMotion && (
        <div className="hidden sm:flex group overflow-hidden [--duration:40s] [--gap:0.75rem] gap-3">
          <div className="flex shrink-0 items-center justify-around gap-3 animate-marquee group-hover:[animation-play-state:paused]">
            {SECTORS.map((sector) => (
              <span
                key={sector}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#FED7AA] text-xs font-display font-semibold text-[#1C1917] shadow-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" aria-hidden="true" />
                <span>{sector}</span>
              </span>
            ))}
          </div>
          <div
            aria-hidden="true"
            className="flex shrink-0 items-center justify-around gap-3 animate-marquee group-hover:[animation-play-state:paused]"
          >
            {SECTORS.map((sector) => (
              <span
                key={`${sector}-dup`}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#FED7AA] text-xs font-display font-semibold text-[#1C1917] shadow-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
                <span>{sector}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
