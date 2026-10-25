"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  background?: string;
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "rgba(234, 246, 255, 0.45)",
      background = "linear-gradient(135deg, #C2410C 0%, #1C1917 100%)",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        style={{ background }}
        className={cn(
          "group relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-[0_8px_24px_rgba(232, 89, 12,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(232, 89, 12,0.3)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C] focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          style={{
            background: `linear-gradient(110deg, transparent 25%, ${shimmerColor} 50%, transparent 75%)`,
          }}
          className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out motion-reduce:hidden"
        />
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";
