'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Building2,
  Stethoscope,
  GraduationCap,
  Factory,
  ShoppingBag,
  Hotel,
  Server,
  Home,
} from 'lucide-react';

const SECTORS = [
  { label: 'Hospitals & NABH Clinics', icon: Stethoscope },
  { label: 'IT Parks & Commercial Towers', icon: Building2 },
  { label: 'Residential Societies & RWAs', icon: Home },
  { label: 'Factories & Warehouses', icon: Factory },
  { label: 'Schools & Universities', icon: GraduationCap },
  { label: 'Hotels & Hospitality', icon: Hotel },
  { label: 'Malls & Multiplexes', icon: ShoppingBag },
  { label: 'Data Centres & Labs', icon: Server },
];

export function SectorMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePref = () => setReducedMotion(mq.matches);
    updatePref();
    mq.addEventListener('change', updatePref);

    let rafId = 0;
    let lastTime = performance.now();
    let lastScrollY = window.scrollY;
    let currentOffset = 0;
    let direction = -1; // -1 = leftwards default, +1 = rightwards on upward scroll
    let velocityBoost = 1; // clamped 0.5x - 2.0x
    let isHovered = false;

    const trackEl = trackRef.current;
    const onEnter = () => {
      isHovered = true;
    };
    const onLeave = () => {
      isHovered = false;
    };
    if (trackEl) {
      trackEl.addEventListener('mouseenter', onEnter);
      trackEl.addEventListener('mouseleave', onLeave);
    }

    const onScroll = () => {
      const sy = window.scrollY;
      const dy = sy - lastScrollY;
      lastScrollY = sy;
      if (Math.abs(dy) > 0.5) {
        direction = dy > 0 ? -1 : 1;
        // Clamp speed multiplier between 0.5x and 2.0x based on |scroll delta|
        const rawRate = 0.5 + Math.min(1.5, Math.abs(dy) / 28);
        velocityBoost = Math.min(2.0, Math.max(0.5, rawRate));
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const tick = (now: number) => {
      const dt = Math.min(64, now - lastTime) / 1000;
      lastTime = now;

      // Decay velocity multiplier smoothly toward 1.0x when scroll settles (clamped 0.5x - 2.0x)
      velocityBoost += (1.0 - velocityBoost) * Math.min(1, dt * 4);
      const clampedMult = Math.min(2.0, Math.max(0.5, velocityBoost));

      if (mq.matches || window.innerWidth < 640) {
        if (trackRef.current) {
          trackRef.current.style.transform = 'none';
          trackRef.current.setAttribute('data-velocity-rate', '0.00');
        }
      } else if (!isHovered && trackRef.current) {
        const basePxPerSec = 42;
        const halfWidth = Math.max(400, trackRef.current.scrollWidth / 2);
        currentOffset += direction * basePxPerSec * clampedMult * dt;

        if (currentOffset <= -halfWidth) {
          currentOffset += halfWidth;
        } else if (currentOffset > 0) {
          currentOffset -= halfWidth;
        }

        trackRef.current.style.transform = `translate3d(${currentOffset.toFixed(2)}px, 0, 0)`;
        trackRef.current.setAttribute('data-velocity-rate', clampedMult.toFixed(2));
        trackRef.current.setAttribute('data-direction', direction === -1 ? 'left' : 'right');
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      mq.removeEventListener('change', updatePref);
      window.removeEventListener('scroll', onScroll);
      if (trackEl) {
        trackEl.removeEventListener('mouseenter', onEnter);
        trackEl.removeEventListener('mouseleave', onLeave);
      }
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="mt-8 sm:mt-10">
      <div className="text-center text-xs font-semibold uppercase tracking-wider text-[#44403C] mb-3.5">
        Built for Every Building Type Under Indian Fire Safety Norms
      </div>

      {/* Mobile (<640px): static 2-column grid for instant thumb-readability */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        {SECTORS.map((sector) => {
          const Icon = sector.icon;
          return (
            <div
              key={sector.label}
              className="flex items-center gap-2 rounded-xl bg-white border border-[#FED7AA] px-3 py-2 text-xs font-semibold text-[#1C1917]"
            >
              <Icon className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
              <span className="truncate">{sector.label}</span>
            </div>
          );
        })}
      </div>

      {/* Desktop/Tablet (>=640px): scroll-velocity reactive reversible marquee */}
      <div className="hidden sm:block relative overflow-hidden py-1">
        <div
          ref={trackRef}
          data-testid="sector-marquee-track"
          data-velocity-rate="1.00"
          className={`flex items-center gap-3 ${
            reducedMotion ? 'flex-wrap justify-center' : 'w-max'
          }`}
          style={{
            willChange: reducedMotion ? 'auto' : 'transform',
          }}
        >
          {(reducedMotion ? SECTORS : [...SECTORS, ...SECTORS]).map((sector, idx) => {
            const Icon = sector.icon;
            return (
              <div
                key={`${sector.label}-${idx}`}
                className="inline-flex items-center gap-2 rounded-full bg-white/75 backdrop-blur-md border border-[#FED7AA] px-4 py-2 text-xs font-semibold text-[#1C1917] shadow-sm whitespace-nowrap hover:border-[#EA580C] transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-[#C2410C]" />
                <span>{sector.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SectorMarquee;
