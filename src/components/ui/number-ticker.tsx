"use client";

import React, { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface NumberTickerProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  direction?: "up" | "down";
  delay?: number;
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  formatLocale?: string;
}

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  prefix = "",
  suffix = "",
  durationMs = 600,
  formatLocale = "en-IN",
  ...props
}: NumberTickerProps) {
  const prefersReducedMotion = useReducedMotion();
  const safeTarget = Number.isFinite(value) ? value : 0;
  const [displayValue, setDisplayValue] = useState<number>(
    prefersReducedMotion ? safeTarget : direction === "down" ? safeTarget : 0
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(safeTarget);
      return;
    }

    let rafId: number;
    const startVal = displayValue;
    const diff = safeTarget - startVal;
    if (diff === 0) return;

    const timeout = window.setTimeout(() => {
      const startTime = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        // Cubic ease-out
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = startVal + diff * eased;
        setDisplayValue(current);
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          setDisplayValue(safeTarget);
        }
      };
      rafId = requestAnimationFrame(tick);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeTarget, prefersReducedMotion, delay, durationMs]);

  const formatted = Number(displayValue.toFixed(decimalPlaces)).toLocaleString(
    formatLocale,
    {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }
  );

  return (
    <span
      className={cn("inline-block tabular-nums tracking-tight", className)}
      {...props}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
