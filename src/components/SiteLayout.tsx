'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { CorporateHeader } from './CorporateHeader';
import { CorporateFooter } from './CorporateFooter';
import { BackToTop } from './BackToTop';
import { StickyCTA } from './StickyCTA';
import { DemoModal } from './DemoModal';
import { ScrollObserver } from './ScrollObserver';
import { FloatingWhatsApp } from './FloatingWhatsApp';
import { CookieConsentBanner } from './CookieConsentBanner';

interface SiteLayoutProps {
  children: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const pathname = usePathname();

  // If user is inside the authenticated Admin OS (/dashboard), Founder portal (/founder), Technician portal (/technician),
  // OR viewing a standalone white-label Form-B report (/report/*) or QR Digital Passport (/verify/*),
  // completely bypass the public VigilAMC marketing header, footer, floating WhatsApp, demo modal, and cookie banner.
  const isAuthOrStandaloneApp =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/founder') ||
    pathname?.startsWith('/technician') ||
    pathname?.startsWith('/report') ||
    pathname?.startsWith('/verify');

  if (isAuthOrStandaloneApp) {
    return (
      <div className="min-h-screen font-sans selection:bg-[#0077B6] selection:text-white print:bg-white">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-[#0077B6] selection:text-white">
      <ScrollObserver />
      <div className="print:hidden no-print">
        <CorporateHeader onOpenDemoModal={() => setDemoModalOpen(true)} />
      </div>

      <main className="flex-1 w-full">
        {children}
      </main>

      <div className="print:hidden no-print">
        <CorporateFooter />
        <BackToTop />
        <FloatingWhatsApp />
        <StickyCTA onOpenDemo={() => setDemoModalOpen(true)} />
        <CookieConsentBanner />
        <DemoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
      </div>
    </div>
  );
}
