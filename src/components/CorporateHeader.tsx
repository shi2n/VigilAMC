'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/siteConfig';

interface CorporateHeaderProps {
  onOpenDemoModal?: () => void;
}

export function CorporateHeader({ onOpenDemoModal }: CorporateHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Sample Report', href: '/sample-report' },
    { name: 'Field App', href: '/technician' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-[#FED7AA]/40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Wordmark "VigilAMC" with small ember-dot logo mark */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 min-h-[44px] px-1 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C] group"
        >
          <span
            aria-hidden="true"
            className="relative flex h-3.5 w-3.5 items-center justify-center"
          >
            <span className="h-3 w-3 rounded-full bg-gradient-to-br from-[#FF8C42] via-[#EA580C] to-[#C2410C] shadow-[0_0_10px_rgba(234,88,12,0.45)] transition-transform duration-200 group-hover:scale-110" />
          </span>
          <span className="font-display text-lg sm:text-xl font-bold tracking-[-0.02em] text-[#1C1917]">
            Vigil<span className="text-[#C2410C]">AMC</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`min-h-[44px] inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C] ${
                  isActive
                    ? 'text-[#C2410C] bg-[#FFF4EC] font-semibold'
                    : 'text-[#44403C] hover:text-[#1C1917] hover:bg-[#FFF8F2]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <Link
            href="/login"
            className="min-h-[44px] inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-medium text-[#44403C] hover:text-[#1C1917] hover:bg-[#FFF8F2] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C]"
          >
            Login
          </Link>
        </nav>

        {/* Desktop CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={SITE_CONFIG.WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onOpenDemoModal ? undefined : undefined}
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#EA580C] text-white text-sm font-bold shadow-[0_6px_20px_-4px_rgba(194,65,12,0.38)] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C]"
          >
            <span>Book a Free Demo</span>
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          <a
            href={SITE_CONFIG.WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] inline-flex items-center justify-center px-3.5 py-2 rounded-xl bg-[#C2410C] hover:bg-[#EA580C] text-white text-xs font-bold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C]"
          >
            Book a Free Demo
          </a>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-[#1C1917] hover:bg-[#FFF4EC] border border-[#FED7AA]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C]"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Glass Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-[#FED7AA]/60 px-4 pt-2 pb-5 space-y-1.5 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#1C1917] hover:bg-[#FFF4EC] hover:text-[#C2410C] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C2410C]"
            >
              <span>{link.name}</span>
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#44403C] hover:bg-[#FFF4EC] hover:text-[#C2410C] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C2410C]"
          >
            <span>Agency Login</span>
          </Link>
        </div>
      )}
    </header>
  );
}
