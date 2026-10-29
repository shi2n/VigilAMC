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
} from 'lucide-react';
import sectorHospitals from '../../../public/images/sector-hospitals.jpg';
import sectorItParks from '../../../public/images/sector-itparks.jpg';
import sectorSocieties from '../../../public/images/sector-societies.jpg';
import sectorFactories from '../../../public/images/sector-factories.jpg';
import sectorSchools from '../../../public/images/sector-schools.jpg';
import sectorHotels from '../../../public/images/sector-hotels.jpg';
import sectorMalls from '../../../public/images/sector-malls.jpg';
import sectorDataCentres from '../../../public/images/sector-datacentres.jpg';

interface SectorTile {
  label: string;
  sub: string;
  icon: typeof Building2;
  photo: StaticImageData;
}

const SECTORS: SectorTile[] = [
  {
    label: 'Hospitals & NABH Clinics',
    sub: 'ICU & OT Fire Protocols',
    icon: Stethoscope,
    photo: sectorHospitals,
  },
  {
    label: 'IT Parks & Commercial Towers',
    sub: 'High-Rise Hydrant Banks',
    icon: Building2,
    photo: sectorItParks,
  },
  {
    label: 'Residential Societies & RWAs',
    sub: 'Multi-Tower Evacuation & Pumps',
    icon: Building2,
    photo: sectorSocieties,
  },
  {
    label: 'Factories & Warehouses',
    sub: 'Early Suppression Sprinklers',
    icon: Factory,
    photo: sectorFactories,
  },
  {
    label: 'Schools & Universities',
    sub: 'Campus Evacuation Routes',
    icon: GraduationCap,
    photo: sectorSchools,
  },
  {
    label: 'Hotels & Hospitality',
    sub: 'Kitchen Hood Suppression',
    icon: Hotel,
    photo: sectorHotels,
  },
  {
    label: 'Malls & Multiplexes',
    sub: 'Public Zone Sprinklers',
    icon: ShoppingBag,
    photo: sectorMalls,
  },
  {
    label: 'Data Centres & Labs',
    sub: 'Clean Agent Gas Flooding',
    icon: Server,
    photo: sectorDataCentres,
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
        const oneRepeatWidth = Math.max(400, trackRef.current.scrollWidth / 3);
        currentOffset += direction * basePxPerSec * clampedMult * dt;

        if (currentOffset <= -oneRepeatWidth) {
          currentOffset += oneRepeatWidth;
        } else if (currentOffset > 0) {
          currentOffset -= oneRepeatWidth;
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
        className="group relative flex flex-col justify-end w-[220px] sm:w-[240px] h-24 sm:h-28 rounded-2xl overflow-hidden border border-white/80 shadow-[0_12px_30px_-12px_rgba(28,25,23,0.18)] shrink-0 transition-transform duration-300 hover:-translate-y-1 bg-[#1C1917]"
      >
        <Image
          src={sector.photo}
          alt={sector.label}
          fill
          loading="lazy"
          quality={85}
          sizes="240px"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/90 via-[#1C1917]/40 to-black/10"
        />
        <div className="relative z-10 p-3 text-white flex flex-col justify-end h-full">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25 w-fit mb-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] shadow-[0_0_6px_#FF8C42]" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
              {sector.sub}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5 text-[#FF8C42] shrink-0" />
            <span className="text-xs font-bold leading-tight truncate drop-shadow-sm text-white">
              {sector.label}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-12 sm:mt-16 relative">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
          Built for every building type under Indian fire safety norms
        </div>
        {/* Small flying stat chip overlapping marquee edge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/85 border border-[#FED7AA] text-[11px] font-semibold text-[#1C1917] shadow-sm backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
          <span>Active in 500+ commercial sites</span>
        </div>
      </div>

      {/* Mobile (<640px): 2-column photo grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:hidden">
        {SECTORS.map((sector) => {
          const Icon = sector.icon;
          return (
            <div
              key={sector.label}
              className="group relative rounded-xl overflow-hidden border border-[#FED7AA] h-20 shadow-sm flex flex-col justify-end p-2 bg-[#1C1917]"
            >
              <Image
                src={sector.photo}
                alt={sector.label}
                fill
                loading="lazy"
                quality={85}
                sizes="180px"
                className="object-cover object-center"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/90 via-[#1C1917]/50 to-transparent"
              />
              <div className="relative z-10 text-white">
                <div className="flex items-center gap-1">
                  <Icon className="w-3 h-3 text-[#FF8C42] shrink-0" />
                  <span className="truncate text-[11px] font-bold leading-tight drop-shadow-sm">{sector.label}</span>
                </div>
              </div>
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
          {(reducedMotion ? SECTORS : [...SECTORS, ...SECTORS, ...SECTORS]).map((sector, idx) =>
            renderTile(sector, `${sector.label}-${idx}`)
          )}
        </div>
      </div>
    </div>
  );
}

export default SectorMarquee;
