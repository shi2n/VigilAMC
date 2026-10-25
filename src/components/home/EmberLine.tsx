'use client';

import React from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

export function EmberLine() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const scaleY = useTransform(scrollYProgress, [0, 0.95], [0.08, 1]);
  const dotTop = useTransform(scrollYProgress, [0, 0.95], ['6%', '96%']);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.45, 0.85, 0.9, 0.6]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-4 sm:left-8 lg:left-1/2 lg:-translate-x-1/2 z-20 flex flex-col items-center"
    >
      {/* Mobile (<640px) or Reduced Motion: static 2px line at 30% opacity */}
      <div
        className={`w-[2px] h-full bg-gradient-to-b from-[#FF8C42] via-[#EA580C] to-transparent opacity-30 ${
          shouldReduceMotion ? 'block' : 'block sm:hidden'
        }`}
      />

      {/* Desktop (>=640px) with motion enabled: scroll-driven Ember Line seam */}
      {!shouldReduceMotion && (
        <div className="hidden sm:block relative w-[2px] h-full">
          {/* Subtle base seam track */}
          <div className="absolute inset-0 w-[2px] bg-gradient-to-b from-[#FED7AA]/30 via-[#FED7AA]/50 to-transparent" />

          {/* Active ignited Ember Line */}
          <motion.div
            style={{
              scaleY,
              transformOrigin: 'top',
              opacity: glowOpacity,
            }}
            className="w-[2px] h-full bg-gradient-to-b from-[#FF8C42] via-[#EA580C] to-transparent shadow-[0_0_12px_rgba(234,88,12,0.55)]"
          />

          {/* Travelling ember spark head */}
          <motion.div
            style={{ top: dotTop }}
            className="absolute -left-[3px] w-2 h-6 rounded-full bg-gradient-to-b from-[#FF8C42] to-[#EA580C] blur-[2px] shadow-[0_0_12px_rgba(234,88,12,0.75)]"
          />
        </div>
      )}
    </div>
  );
}
