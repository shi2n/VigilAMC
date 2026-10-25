"use client";

import React, { useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function CardContainer({
  children,
  className,
  containerClassName,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [transform, setTransform] = useState("rotateY(0deg) rotateX(0deg)");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 35;
    const y = (e.clientY - rect.top - rect.height / 2) / 35;
    setTransform(`rotateY(${x.toFixed(2)}deg) rotateX(${(-y).toFixed(2)}deg)`);
  };

  const handleMouseLeave = () => {
    setTransform("rotateY(0deg) rotateX(0deg)");
  };

  return (
    <div
      className={cn("py-2 flex items-center justify-center", containerClassName)}
      style={{ perspective: "1000px" }}
    >
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: prefersReducedMotion ? undefined : transform,
          transformStyle: "preserve-3d",
        }}
        className={cn(
          "relative transition-transform duration-200 ease-out",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white border border-[#DCE7F2] p-6 shadow-sm hover:shadow-[0_8px_24px_rgba(0,119,182,0.12)] transition-shadow duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("w-fit transition duration-200", className)}>{children}</div>;
}
