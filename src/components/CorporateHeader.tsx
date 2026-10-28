'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight, LogIn } from 'lucide-react';
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
    <header
      data-testid="public-glass-navbar"
      className="sticky top-0 z-50 w-full glass-panel-dense border-t-0 border-x-0 transition-colors"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Mark + Wordmark Lockup: V-tile (36px) + gap 10px + VigilAMC */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 min-h-[44px] px-1 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C] group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-tile-192.png"
            alt="VigilAMC Logo"
            width={36}
            height={36}
            className="w-9 h-9 rounded-xl object-cover shadow-sm shrink-0 transition-transform duration-200 group-hover:scale-105"
          />
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
                className={`min-h-[44px] inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C] ${
                  isActive
                    ? 'text-[#C2410C] bg-[#FFF4EC] font-semibold'
                    : 'text-[#44403C] hover:text-[#1C1917] hover:bg-[#FFF8F2]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA Button Group: [ Login ] [ Book a Free Demo ↗ ] */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="min-h-[44px] h-[44px] px-5 rounded-xl border border-[#C2410C] text-[#C2410C] hover:bg-[#FFF0E6] font-bold text-sm inline-flex items-center justify-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C] transition-colors"
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            <span>Login</span>
          </Link>
          <a
            href={SITE_CONFIG.WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onOpenDemoModal ? undefined : undefined}
            className="btn-flame min-h-[44px] inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-[0_6px_20px_-4px_rgba(194,65,12,0.38)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
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
            className="btn-flame min-h-[44px] inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-white text-xs font-bold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
          >
            Book a Free Demo
          </a>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-[#1C1917] hover:bg-[#FFF4EC] border border-[#FED7AA]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Glass Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-dialog border-t-0 border-x-0 px-4 pt-3 pb-5 space-y-3">
          {/* Mobile CTA Stack: Login (outline) first, Book a Free Demo (solid) second, both 48px tall */}
          <div className="flex flex-col gap-2.5 pb-2 border-b border-[#FED7AA]/40">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[48px] h-12 w-full rounded-xl border border-[#C2410C] text-[#C2410C] hover:bg-[#FFF0E6] font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>Login</span>
            </Link>
            <a
              href={SITE_CONFIG.WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-flame min-h-[48px] h-12 w-full rounded-xl text-white font-bold text-sm inline-flex items-center justify-center gap-1.5 shadow-[0_6px_20px_-4px_rgba(194,65,12,0.38)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
            >
              <span>Book a Free Demo</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#1C1917] hover:bg-[#FFF4EC] hover:text-[#C2410C] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
              >
                <span>{link.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
