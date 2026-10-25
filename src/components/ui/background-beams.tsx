"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Light-brand BackgroundBeams — public marketing landing ONLY.
 * Strictly prohibits on /technician or /report.
 */
export function BackgroundBeams({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden opacity-40 motion-reduce:hidden",
        className
      )}
    >
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 600"
        fill="none"
      >
        <path
          d="M-100 100 C 300 260, 900 -40, 1540 220"
          stroke="url(#vigil-beam-1)"
          strokeWidth="1.5"
        />
        <path
          d="M-100 320 C 420 120, 980 420, 1540 140"
          stroke="url(#vigil-beam-2)"
          strokeWidth="1.5"
        />
        <defs>
          <linearGradient id="vigil-beam-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0077B6" stopOpacity="0" />
            <stop offset="50%" stopColor="#0077B6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#023E8A" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="vigil-beam-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#023E8A" stopOpacity="0" />
            <stop offset="50%" stopColor="#0096C7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0077B6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
