"use client";

import React, { useEffect, useState, useRef } from "react";
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
  const safeTarget = Number.isFinite(value) ? Math.max(0, value) : 0;
  
  const [displayValue, setDisplayValue] = useState<number>(() => {
    if (prefersReducedMotion) return safeTarget;
    if (direction === "down") return safeTarget;
    return 0;
  });

  const prevTargetRef = useRef<number>(safeTarget);
  const isFirstMountRef = useRef<boolean>(true);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(safeTarget);
      prevTargetRef.current = safeTarget;
      isFirstMountRef.current = false;
      return;
    }

    // Don't restart count-up animation on tab re-focus if target hasn't changed after first mount
    if (!isFirstMountRef.current && safeTarget === prevTargetRef.current) {
      return;
    }

    isFirstMountRef.current = false;
    const startVal = displayValue;
    const diff = safeTarget - startVal;
    prevTargetRef.current = safeTarget;

    if (diff === 0) return;

    let rafId: number;
    const timeout = window.setTimeout(() => {
      const startTime = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        // Cubic ease-out
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.max(0, startVal + diff * eased);
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

  // Sanitize formatting: Math.max(0, rounded), guard Object.is(x, -0), never render "-0"
  let rounded = Number(displayValue.toFixed(decimalPlaces));
  if (Object.is(rounded, -0) || isNaN(rounded) || rounded < 0 || Math.abs(rounded) < 1e-9) {
    rounded = 0;
  }
  rounded = Math.max(0, rounded);

  let formatted = rounded.toLocaleString(formatLocale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  if (formatted === "-0" || formatted.startsWith("-0")) {
    formatted = "0";
  }

  return (
    <span
      data-slot="NumberTicker"
      className={cn("NumberTicker inline-block tabular-nums tracking-tight", className)}
      {...props}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
