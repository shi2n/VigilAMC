'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface EmberWaypoint {
  id: string;
  label: string;
  topPct: string;
}

const DEFAULT_WAYPOINTS: EmberWaypoint[] = [
  { id: 'hero-screen', label: '01 · Overview', topPct: '16%' },
  { id: 'how-it-works', label: '02 · 3-Step Flow', topPct: '50%' },
  { id: 'proof-screen', label: '03 · Proof & Action', topPct: '84%' },
];

export function EmberLine({
  waypoints = DEFAULT_WAYPOINTS,
}: {
  waypoints?: EmberWaypoint[];
}) {
  const progressLineRef = useRef<HTMLDivElement>(null);
  const riderDotRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string>(waypoints[0]?.id || 'hero-screen');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(mq.matches);
    updateMotion();
    mq.addEventListener('change', updateMotion);

    // IntersectionObserver for section waypoints
    const sectionEls = waypoints
      .map((w) => document.getElementById(w.id))
      .filter((el): el is HTMLElement => Boolean(el));

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target.id) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-25% 0px -45% 0px', threshold: 0.05 }
    );

    sectionEls.forEach((el) => io.observe(el));

    let rafId = 0;
    const updateScroll = () => {
      rafId = 0;
      if (mq.matches) {
        if (progressLineRef.current) {
          progressLineRef.current.style.transform = 'scaleY(1)';
        }
        if (riderDotRef.current) {
          riderDotRef.current.style.transform = 'translate3d(0, 0px, 0)';
        }
        return;
      }

      const docEl = document.documentElement;
      const maxScroll = Math.max(1, docEl.scrollHeight - window.innerHeight);
      const rawProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      // Keep minimum visible ember fill at top of page (0.08 -> 1.0)
      const displayScale = 0.08 + rawProgress * 0.92;

      if (progressLineRef.current) {
        progressLineRef.current.style.transform = `scaleY(${displayScale.toFixed(4)})`;
        progressLineRef.current.setAttribute('data-progress', rawProgress.toFixed(3));
      }

      if (riderDotRef.current && trackRef.current) {
        const trackHeight = trackRef.current.clientHeight || window.innerHeight;
        const yPos = rawProgress * Math.max(0, trackHeight - 16) + 8;
        riderDotRef.current.style.transform = `translate3d(0, ${yPos.toFixed(1)}px, 0)`;
      }
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateScroll);
      }
    };

    updateScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      mq.removeEventListener('change', updateMotion);
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [waypoints]);

  return (
    <div
      ref={trackRef}
      aria-hidden="true"
      data-testid="ember-line"
      className="no-print pointer-events-none fixed left-2.5 sm:left-5 lg:left-7 top-0 bottom-0 z-30 flex flex-col items-center"
    >
      {/* Base 1px neutral structural line */}
      <div
        className="h-full w-[1px]"
        style={{ backgroundColor: 'rgba(28, 25, 23, 0.10)' }}
      />

      {/* Scroll-progress scrubbed gradient line */}
      <div
        ref={progressLineRef}
        data-testid="ember-line-progress"
        data-progress="0.000"
        className="absolute top-0 left-0 w-[2px] h-full origin-top"
        style={{
          background: 'linear-gradient(180deg, #FF8C42 0%, #EA580C 55%, #C2410C 100%)',
          boxShadow: '0 0 12px rgba(234, 88, 12, 0.45)',
          transform: reducedMotion ? 'scaleY(1)' : 'scaleY(0.08)',
          willChange: 'transform',
        }}
      />

      {/* Riding ember glow-dot at reading position */}
      {!reducedMotion && (
        <div
          ref={riderDotRef}
          data-testid="ember-line-rider"
          className="absolute top-0 -left-[4px] w-2.5 h-2.5 rounded-full bg-[#EA580C] ring-4 ring-[#FF8C42]/35"
          style={{
            boxShadow: '0 0 16px 4px rgba(234, 88, 12, 0.65)',
            transform: 'translate3d(0, 8px, 0)',
            willChange: 'transform',
          }}
        />
      )}

      {/* Section Waypoint Dots */}
      {waypoints.map((wp) => {
        const isActive = activeSection === wp.id;
        return (
          <div
            key={wp.id}
            style={{ top: wp.topPct }}
            className="absolute -left-[4px] flex items-center gap-2"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full transition-transform duration-300 ${
                isActive
                  ? 'bg-[#EA580C] scale-125 ring-4 ring-[#EA580C]/25 shadow-[0_0_12px_rgba(234,88,12,0.7)]'
                  : 'bg-[#FFFFFF] border border-[#C2410C]/40 scale-100'
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}

export default EmberLine;
