'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { CorporateHeader } from './CorporateHeader';
import { CorporateFooter } from './CorporateFooter';
import { BackToTop } from './BackToTop';
import { StickyCTA } from './StickyCTA';
import { DemoModal } from './DemoModal';
import { ScrollObserver } from './ScrollObserver';

interface SiteLayoutProps {
  children: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const pathname = usePathname();

  // If user is inside the authenticated Admin OS (/dashboard) or Technician portal (/technician),
  // completely separate the UI: do NOT display the public marketing header, footer, or CTA.
  const isAuthApp = pathname?.startsWith('/dashboard') || pathname?.startsWith('/technician');

  if (isAuthApp) {
    return (
      <div className="min-h-screen bg-[#080d1a] text-slate-100 font-sans selection:bg-[#0077B6] selection:text-white">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-[#0077B6] selection:text-white">
      <ScrollObserver />
      <CorporateHeader onOpenDemoModal={() => setDemoModalOpen(true)} />

      <main className="flex-1 w-full">
        {children}
      </main>

      <CorporateFooter />
      <BackToTop />
      <StickyCTA onOpenDemo={() => setDemoModalOpen(true)} />
      <DemoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </div>
  );
}
