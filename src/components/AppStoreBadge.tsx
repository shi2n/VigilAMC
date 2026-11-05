'use client';

import React from 'react';
import { toast } from 'sonner';

interface AppStoreBadgeProps {
  className?: string;
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  comingSoon?: boolean;
}

export function AppStoreBadge({
  className = '',
  theme = 'dark',
  size = 'md',
  comingSoon = true,
}: AppStoreBadgeProps) {
  const heightClasses = {
    sm: 'h-9 text-xs',
    md: 'h-10 text-xs',
    lg: 'h-12 text-sm',
  }[size];

  const handleClick = () => {
    toast.info('Apple iOS App Store release is currently in review and launching very soon! In the meantime, iPhone users can access the web app.', {
      duration: 4000,
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="VigilAMC Field on Apple App Store - Coming Soon"
      title="Apple App Store - Coming Soon"
      className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border transition-all duration-200 active:scale-95 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF8C42] cursor-pointer ${
        theme === 'dark'
          ? 'bg-black text-white border-white/20 hover:border-[#FF8C42] hover:bg-stone-900 shadow-sm'
          : 'bg-white text-stone-900 border-stone-300 hover:border-[#EA580C] hover:bg-orange-50/50 shadow-xs'
      } ${heightClasses} ${className}`}
    >
      {/* Official Apple Icon */}
      <svg
        className="w-5 h-5 shrink-0 fill-current"
        viewBox="0 0 170 170"
        aria-hidden="true"
      >
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.07-7.7-7.85-12-14.34-6.3-9.52-11.22-20.2-14.74-32.06-3.53-11.86-5.3-23.08-5.3-33.68 0-14.88 3.82-27.27 11.45-37.18 7.63-9.91 17.1-14.93 28.41-15.06 4.9.12 10.37 1.37 16.42 3.75 6.05 2.38 9.91 3.63 11.58 3.75 1.9-.25 5.92-1.63 12.06-4.13 6.13-2.5 11.46-3.69 15.98-3.57 11.5.76 20.8 5.16 27.87 13.2-10.15 6.15-15.12 14.8-14.91 25.96.2 9.04 3.69 16.64 10.45 22.8 6.76 6.17 14.77 9.68 24.04 10.53-2.25 7.02-4.8 13.52-7.65 19.5zM119.22 31.84c0-7.39 2.65-14.28 7.94-20.67 5.29-6.39 11.8-10.46 19.53-12.22-.05 1.05-.07 1.94-.07 2.67 0 7.42-2.73 14.33-8.19 20.73-5.46 6.4-12.05 10.58-19.78 12.54-.42-1.04-.63-2.06-.63-3.05z" />
      </svg>
      <div className="flex flex-col text-left leading-none">
        <span className="text-[8px] uppercase tracking-wider font-medium opacity-80">
          {comingSoon ? 'Coming soon on' : 'Download on the'}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[12px] sm:text-[13px] font-bold tracking-tight">
            App Store
          </span>
          {comingSoon && (
            <span className="px-1.5 py-0.2 rounded-md bg-[#EA580C] text-white text-[9px] font-black uppercase tracking-wider">
              SOON
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default AppStoreBadge;
