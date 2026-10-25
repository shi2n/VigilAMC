"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function TextReveal({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const words = text.split(" ");

  if (prefersReducedMotion) {
    return (
      <span data-slot="TextReveal" className={cn("TextReveal inline", className)}>
        {text}
      </span>
    );
  }

  return (
    <span data-slot="TextReveal" className={cn("TextReveal inline", className)}>
      {words.map((word, idx) => (
        <motion.span
          key={`${word}-${idx}`}
          initial={{ opacity: 0.15, y: 4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{
            duration: 0.28,
            delay: Math.min(idx * 0.035, 0.45),
            ease: "easeOut",
          }}
          className="inline-block mr-[0.26em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
