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
    pathname?.startsWith('/founder') ||
    pathname?.startsWith('/technician') ||
    pathname?.startsWith('/report') ||
    pathname?.startsWith('/verify') ||
    pathname?.startsWith('/login');

  if (isProductOrStandaloneSurface) {
    return (
      <div className="min-h-screen font-sans selection:bg-[#C2410C] selection:text-white print:bg-white">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1C1917] font-sans selection:bg-[#EA580C] selection:text-white">
      <div className="print:hidden no-print sticky top-0 z-50">
        <CorporateHeader />
      </div>

      <main className="flex-1 w-full">
        {children}
      </main>

      <div className="print:hidden no-print">
        <CorporateFooter />
      </div>
    </div>
  );
}
