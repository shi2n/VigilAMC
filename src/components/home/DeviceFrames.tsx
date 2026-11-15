import React from 'react';

interface LightBrowserFrameProps {
  url?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Clean Apple-light browser chrome frame (no dark-mode mockups).
 */
export function LightBrowserFrame({
  url = 'app.vigilamc.com',
  children,
  className = '',
}: LightBrowserFrameProps) {
  return (
    <div
      className={`rounded-2xl bg-white border border-[#E7E5E4] shadow-[0_24px_60px_-24px_rgba(28,25,23,0.16)] overflow-hidden ${className}`}
    >
      <div className="h-9 px-3.5 bg-[#FAF8F6] border-b border-[#E7E5E4] flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FCA5A5] border border-[#F87171]/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FCD34D] border border-[#F59E0B]/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#6EE7B7] border border-[#10B981]/40" />
        </div>
        <div className="flex-1 max-w-[260px] mx-auto px-3 py-1 rounded-md bg-white border border-[#E7E5E4] text-[11px] font-medium text-[#44403C] text-center truncate">
          {url}
        </div>
        <div className="w-10 shrink-0" aria-hidden="true" />
      </div>
      {children}
    </div>
  );
}

interface LightPhoneFrameProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Clean light-titanium smartphone bezel (no dark-mode mockups).
 */
export function LightPhoneFrame({
  children,
  className = '',
}: LightPhoneFrameProps) {
  return (
    <div
      className={`rounded-[38px] bg-[#F5F2EE] p-2.5 sm:p-3 border-2 border-[#D6D3D1] shadow-[0_28px_64px_-22px_rgba(28,25,23,0.22)] ${className}`}
    >
      <div className="w-16 h-1.5 rounded-full bg-[#D6D3D1] mx-auto mb-2" aria-hidden="true" />
      <div className="rounded-[28px] overflow-hidden bg-white border border-[#E7E5E4]">
        {children}
      </div>
      <div className="w-16 h-1 rounded-full bg-[#D6D3D1] mx-auto mt-2" aria-hidden="true" />
    </div>
  );
}
