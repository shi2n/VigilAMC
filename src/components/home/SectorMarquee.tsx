'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image, { type StaticImageData } from 'next/image';
import {
  Building2,
  Stethoscope,
  GraduationCap,
  Factory,
  ShoppingBag,
  Hotel,
  Server,
  Warehouse,
  ShieldCheck,
} from 'lucide-react';
import heroTechnician from '../../../public/images/hero-technician.jpg';
import problemOwner from '../../../public/images/problem-owner.jpg';
import sceneGps from '../../../public/images/scene-gps.jpg';
import sceneSignoff from '../../../public/images/scene-signoff.jpg';
import scenePump from '../../../public/images/scene-pump.jpg';

interface SectorTile {
  label: string;
  sub: string;
  icon: typeof Building2;
  photo?: StaticImageData;
  gradient?: string;
}

const SECTORS: SectorTile[] = [
  {
    label: 'Hospitals & NABH Clinics',
    sub: 'ICU & OT Fire Protocols',
    icon: Stethoscope,
    photo: sceneSignoff,
  },
  {
    label: 'IT Parks & Commercial Towers',
    sub: 'High-Rise Hydrant Banks',
    icon: Building2,
    gradient: 'linear-gradient(135deg, #FF8C42 0%, #EA580C 100%)',
  },
  {
    label: 'Industrial & Pump Rooms',
    sub: 'Diesel & Jockey Pumps',
    icon: Factory,
    photo: scenePump,
  },
  {
    label: 'Warehouses & Logistics Hubs',
    sub: 'Early Suppression Sprinklers',
    icon: Warehouse,
    gradient: 'linear-gradient(135deg, #C2410C 0%, #9A3412 100%)',
  },
  {
    label: 'Rooftop & Utility Risers',
    sub: '20m GPS Verified Check',
    icon: Building2,
    photo: sceneGps,
  },
  {
    label: 'Schools & Universities',
    sub: 'Campus Evacuation Routes',
    icon: GraduationCap,
    gradient: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
  },
  {
    label: 'Office Towers & Co-Working',
    sub: 'Cylinder Banks & Alarms',
    icon: Building2,
    photo: heroTechnician,
  },
  {
    label: 'Hotels & Hospitality',
    sub: 'Kitchen Hood Suppression',
    icon: Hotel,
    gradient: 'linear-gradient(135deg, #D97706 0%, #EA580C 100%)',
  },
  {
    label: 'Audited Facility Operations',
    sub: 'Form-B Certification',
    icon: ShieldCheck,
    photo: problemOwner,
  },
  {
    label: 'Malls & Multiplexes',
    sub: 'Public Zone Sprinklers',
    icon: ShoppingBag,
    gradient: 'linear-gradient(135deg, #FF8C42 0%, #C2410C 100%)',
  },
  {
    label: 'Data Centres & Server Labs',
    sub: 'Clean Agent Gas Flooding',
    icon: Server,
    gradient: 'linear-gradient(135deg, #9A3412 0%, #1C1917 100%)',
  },
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
        const basePxPerSec = 36;
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

  const renderTile = (sector: SectorTile, key: string) => {
    const Icon = sector.icon;
    return (
      <div
        key={key}
        className="group relative flex flex-col justify-end w-[220px] sm:w-[240px] h-[100px] sm:h-[110px] rounded-2xl overflow-hidden border border-white/80 shadow-[0_12px_30px_-12px_rgba(28,25,23,0.18)] shrink-0 transition-transform duration-300 hover:-translate-y-1"
        style={{
          background: sector.gradient || 'rgba(255, 255, 255, 0.8)',
        }}
      >
        {sector.photo ? (
          <>
            <Image
              src={sector.photo}
              alt={sector.label}
              fill
              placeholder="blur"
              sizes="240px"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/90 via-[#1C1917]/45 to-transparent"
            />
            <div className="relative z-10 p-3 text-white">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon className="w-3.5 h-3.5 text-[#FF8C42]" />
                <span className="text-xs font-bold leading-tight truncate drop-shadow-sm">
                  {sector.label}
                </span>
              </div>
              <div className="text-[10px] text-[#FED7AA] font-medium truncate drop-shadow-sm">
                {sector.sub}
              </div>
            </div>
          </>
        ) : (
          <div className="relative z-10 p-3.5 h-full flex flex-col justify-between text-white">
            <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold leading-tight truncate">
                {sector.label}
              </div>
              <div className="text-[10px] text-white/85 font-medium truncate mt-0.5">
                {sector.sub}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-12 sm:mt-16 relative">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
          Built for every building type under Indian fire safety norms
        </div>
        {/* D3: Small flying stat chip overlapping marquee edge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/85 border border-[#FED7AA] text-[11px] font-semibold text-[#1C1917] shadow-sm backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
          <span>Active in 500+ commercial sites</span>
        </div>
      </div>

      {/* Mobile (<640px): 2-column scrollable grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:hidden">
        {SECTORS.slice(0, 6).map((sector) => {
          const Icon = sector.icon;
          return (
            <div
              key={sector.label}
              className="flex items-center gap-2 rounded-xl bg-white/90 border border-[#FED7AA] p-2.5 text-xs font-semibold text-[#1C1917] shadow-sm"
            >
              <div className="w-7 h-7 rounded-lg bg-[#FFF0E6] flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-[#C2410C]" />
              </div>
              <span className="truncate text-[11px] leading-tight">{sector.label}</span>
            </div>
          );
        })}
      </div>

      {/* Desktop/Tablet (>=640px): photo tile marquee */}
      <div className="hidden sm:block relative overflow-hidden py-2 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        {/* Left & right fade masks */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-20 bg-gradient-to-r from-[#FFF4EC] to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-20 bg-gradient-to-l from-[#FFEBDD] to-transparent"
        />

        <div
          ref={trackRef}
          data-testid="sector-marquee-track"
          data-velocity-rate="1.00"
          className={`flex items-center gap-3.5 ${
            reducedMotion ? 'flex-wrap justify-center' : 'w-max'
          }`}
          style={{
            willChange: reducedMotion ? 'auto' : 'transform',
          }}
        >
          {(reducedMotion ? SECTORS : [...SECTORS, ...SECTORS]).map((sector, idx) =>
            renderTile(sector, `${sector.label}-${idx}`)
          )}
        </div>
      </div>
    </div>
  );
}

export default SectorMarquee;
