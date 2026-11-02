'use client';

import React from 'react';
import { SITE_CONFIG } from '@/lib/siteConfig';

interface GooglePlayBadgeProps {
  className?: string;
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

export function GooglePlayBadge({
  className = '',
  theme = 'dark',
  size = 'md',
}: GooglePlayBadgeProps) {
  const heightClasses = {
    sm: 'h-9',
    md: 'h-10',
    lg: 'h-12',
  }[size];

  return (
    <a
      href={SITE_CONFIG.GOOGLE_PLAY_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Get VigilAMC Field on Google Play"
      className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border transition-all duration-200 active:scale-95 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF8C42] ${
        theme === 'dark'
          ? 'bg-black text-white border-white/20 hover:border-[#FF8C42] hover:bg-stone-900 shadow-sm'
          : 'bg-white text-stone-900 border-stone-300 hover:border-[#EA580C] hover:bg-orange-50/50 shadow-xs'
      } ${heightClasses} ${className}`}
    >
      {/* Official Google Play Tri-color Play Icon */}
      <svg
        className="w-5 h-5 shrink-0"
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M325.3 234.3L104.6 13l280.8 161.9-60.1 59.4z"
          fill="#00E676"
        />
        <path
          d="M47 38.8C43.5 45.4 41.5 53.6 41.5 63v386c0 9.4 2 17.6 5.5 24.2l200.7-200.7L47 38.8z"
          fill="#00B0FF"
        />
        <path
          d="M325.3 277.7l60.1 59.4L104.6 499l220.7-221.3z"
          fill="#FF3D00"
        />
        <path
          d="M451.9 238.9l-66.5-38.3-60.1 33.7 60.1 43.4 66.5-38.3c14.2-8.2 14.2-21.7 0-30.5z"
          fill="#FFD600"
        />
      </svg>
      <div className="flex flex-col text-left leading-none">
        <span className="text-[9px] uppercase tracking-wider font-medium opacity-80">
          Get it on
        </span>
        <span className="text-[13px] font-bold tracking-tight">
          Google Play
        </span>
      </div>
    </a>
  );
}

export default GooglePlayBadge;
