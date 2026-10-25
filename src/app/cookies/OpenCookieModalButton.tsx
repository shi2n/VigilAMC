'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { openCookiePreferences } from '@/components/CookieConsentBanner';

export function OpenCookieModalButton() {
  return (
    <button
      type="button"
      onClick={openCookiePreferences}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C2410C] hover:bg-[#1C1917] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
    >
      <SlidersHorizontal className="w-3.5 h-3.5" />
      <span>Manage Cookie Preferences</span>
    </button>
  );
}
