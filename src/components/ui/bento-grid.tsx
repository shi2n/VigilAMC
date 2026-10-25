"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function BentoGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[16rem] grid-cols-1 md:grid-cols-3 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  name: string;
  className?: string;
  background?: React.ReactNode;
  Icon: React.ElementType;
  description: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div
      className={cn(
        "group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-[#DCE7F2] p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,119,182,0.12)]",
        className
      )}
    >
      {background && <div className="pointer-events-none">{background}</div>}
      <div className="z-10 flex flex-col gap-1.5">
        <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] border border-[#0077B6]/20 flex items-center justify-center text-[#0077B6] mb-2">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-base font-bold text-[#023E8A]">{name}</h3>
        <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
      </div>
      {href && cta && (
        <a
          href={href}
          className="z-10 mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#0077B6] hover:text-[#023E8A]"
        >
          <span>{cta}</span>
          <span>&rarr;</span>
        </a>
      )}
    </div>
  );
}
