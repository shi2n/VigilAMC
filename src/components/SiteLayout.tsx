'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { CorporateHeader } from './CorporateHeader';
import { CorporateFooter } from './CorporateFooter';

interface SiteLayoutProps {
  children: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  const pathname = usePathname();

  // Product surfaces (/dashboard, /technician, /report, /login, /founder, /verify)
  // bypass the public marketing header & footer and keep their product layout.
  const isProductOrStandaloneSurface =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/technician') ||
    pathname?.startsWith('/report') ||
    pathname?.startsWith('/verify') ||
    pathname?.startsWith('/login');

  if (isProductOrStandaloneSurface) {
    return (
      <div className="min-h-screen font-sans selection:bg-[#C2410C] selection:text-white print:bg-white w-full max-w-full overflow-x-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1C1917] font-sans selection:bg-[#EA580C] selection:text-white w-full max-w-full overflow-x-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#EA580C] focus:text-white focus:font-semibold focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EA580C]"
      >
        Skip to main content
      </a>
      <div className="print:hidden no-print sticky top-0 z-50">
        <CorporateHeader />
      </div>

      <main id="main-content" tabIndex={-1} className="flex-1 w-full focus:outline-none">
        {children}
      </main>

      <div className="print:hidden no-print">
        <CorporateFooter />
      </div>
    </div>
  );
}
