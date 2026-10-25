"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function HeroHighlight({
  children,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-full bg-[#FFF8F2]",
        containerClassName
      )}
    >
      <div className={cn("relative z-20", className)}>{children}</div>
    </div>
  );
}

export function Highlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.span
      initial={{
        backgroundSize: prefersReducedMotion ? "100% 100%" : "0% 100%",
      }}
      animate={{
        backgroundSize: "100% 100%",
      }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.65,
        ease: "easeOut",
        delay: 0.15,
      }}
      style={{
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left center",
        display: "inline",
      }}
      className={cn(
        "relative inline-block pb-0.5 px-1.5 rounded-lg bg-gradient-to-r from-[#FFF0E6] to-[#D5EEFF] text-[#C2410C] border border-[#C2410C]/20",
        className
      )}
    >
      {children}
    </motion.span>
  );
}
