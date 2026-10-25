"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TestimonialItem {
  quote: string;
  name: string;
  designation: string;
}

export function AnimatedTestimonials({
  testimonials,
  className,
}: {
  testimonials: TestimonialItem[];
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  if (!testimonials?.length) return null;
  const current = testimonials[active];

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#FED7AA] bg-white p-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#FFF0E6] border border-[#C2410C]/20 flex items-center justify-center text-[#C2410C] shrink-0">
          <Quote className="w-4 h-4" />
        </div>
        <div className="flex-1 min-h-[80px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <p className="text-sm text-slate-700 leading-relaxed">
                &ldquo;{current.quote}&rdquo;
              </p>
              <div className="mt-3">
                <div className="text-xs font-bold text-[#1C1917]">{current.name}</div>
                <div className="text-[11px] text-slate-500">{current.designation}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {testimonials.length > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() =>
              setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length)
            }
            className="p-1.5 rounded-lg border border-[#FED7AA] bg-[#FFF8F2] text-[#1C1917] hover:bg-[#FFF0E6] hover:text-[#C2410C]"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActive((prev) => (prev + 1) % testimonials.length)}
            className="p-1.5 rounded-lg border border-[#FED7AA] bg-[#FFF8F2] text-[#1C1917] hover:bg-[#FFF0E6] hover:text-[#C2410C]"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
