"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function SparklesText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-1.5 font-extrabold text-[#1C1917]",
        className
      )}
    >
      <Sparkles className="w-4 h-4 text-[#C2410C] shrink-0" />
      <span>{text}</span>
    </span>
  );
}
