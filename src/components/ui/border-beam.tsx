"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
}

export function BorderBeam({
  className,
  duration = 8,
  colorFrom = "#0077B6",
  colorTo = "#023E8A",
}: BorderBeamProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div
        aria-hidden="true"
        data-slot="border-beam"
        className={cn(
          "border-beam pointer-events-none absolute inset-0 rounded-[inherit] border border-[#0077B6]/35",
          className
        )}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      data-slot="border-beam"
      className={cn(
        "border-beam pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0.55 }}
        animate={{ opacity: [0.45, 0.9, 0.45] }}
        transition={{ duration: duration / 2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          borderImage: `linear-gradient(135deg, ${colorFrom}, ${colorTo}, #0096C7) 1`,
        }}
        className="border-beam-track absolute inset-0 rounded-[inherit] border-2 border-[#0077B6]/40"
      />
    </div>
  );
}
