"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function Ripple({
  className,
  color = "rgba(232, 89, 12, 0.14)",
}: {
  className?: string;
  color?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) {
    return <div aria-hidden="true" data-slot="ripple" className="ripple-effect pointer-events-none hidden" />;
  }

  return (
    <div
      aria-hidden="true"
      data-slot="ripple"
      className={cn(
        "ripple-effect pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]",
        className
      )}
    >
      <motion.span
        initial={{ scale: 0.6, opacity: 0.55 }}
        animate={{ scale: 1.85, opacity: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        style={{ backgroundColor: color }}
        className="animate-ripple absolute inset-0 m-auto h-24 w-24 rounded-full"
      />
    </div>
  );
}
