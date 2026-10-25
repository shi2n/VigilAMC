"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

const BRAND_COLORS = ["#0077B6", "#023E8A", "#0E9F6E", "#0096C7", "#EAF6FF"];

export function ConfettiBurst({ active }: { active: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  if (!active || prefersReducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const dx = Math.cos(angle) * 28;
        const dy = Math.sin(angle) * 22;
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 0.9 }}
            animate={{ x: dx, y: dy, scale: 0.3, opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{ backgroundColor: BRAND_COLORS[i % BRAND_COLORS.length] }}
            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
          />
        );
      })}
    </div>
  );
}
