"use client";

import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function AnimatedList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const items = React.Children.toArray(children);

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <AnimatePresence initial={false}>
        {items.map((item, idx) => (
          <motion.div
            key={(item as React.ReactElement)?.key ?? idx}
            initial={
              prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.18,
              delay: prefersReducedMotion ? 0 : Math.min(idx, 7) * 0.025,
              ease: "easeOut",
            }}
          >
            {item}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
