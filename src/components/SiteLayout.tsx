'use client';

import React, { useState } from 'react';
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
