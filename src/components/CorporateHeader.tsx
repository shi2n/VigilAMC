'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ArrowUpRight,
  LogIn,
  Smartphone,
} from 'lucide-react';

interface CorporateHeaderProps {
  onOpenDemoModal?: () => void;
}

const NAV_LINKS: Array<{
  name: string;
  href: string;
  testId: string;
  icon?: typeof Smartphone;
}> = [
  {
    name: 'Technician App',
    href: '/technician-app',
    testId: 'nav-technician-app',
    icon: Smartphone,
  },
  {
    name: 'Features',
    href: '/features',
    testId: 'nav-features',
  },
  {
    name: 'Pricing',
    href: '/pricing',
    testId: 'nav-pricing',
  },
  {
    name: 'Contact',
    href: '/contact',
    testId: 'nav-contact',
  },
];

export function CorporateHeader({ onOpenDemoModal: _onOpenDemoModal }: CorporateHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      data-testid="public-glass-navbar"
      className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-md shadow-slate-900/5 transition-all"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo Lockup */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 min-h-[44px] px-1 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C] group shrink-0"
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

        {/* Desktop Nav Links: Technician App | Features | Pricing | Contact (direct single-click links, no dropdown) */}
        <nav
          aria-label="Main Navigation"
          data-testid="desktop-main-nav"
          className="hidden md:flex items-center gap-1"
        >
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href === '/features' && pathname === '/how-it-works');
            return (
              <Link
                key={link.name}
                href={link.href}
                data-testid={link.testId}
                className={`min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C] ${
                  isActive
                    ? 'text-[#C2410C] bg-[#FFF4EC] font-semibold'
                    : 'text-[#44403C] font-medium hover:text-[#1C1917] hover:bg-[#FFF8F2]'
                }`}
              >
                {Icon && (
                  <Icon className="w-3.5 h-3.5 text-[#EA580C]" aria-hidden="true" />
                )}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA Button Group: [ Login ] [ Book a Free Demo ↗ ] */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            href="/login"
            className="min-h-[44px] h-[44px] px-5 rounded-xl border border-[#C2410C] text-[#C2410C] hover:bg-[#FFF0E6] font-bold text-sm inline-flex items-center justify-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C] transition-colors"
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            <span>Login</span>
          </Link>
          <Link
            href="/contact"
            className="btn-flame min-h-[44px] inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-[0_6px_20px_-4px_rgba(194,65,12,0.38)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
          >
            <span>Book a Free Demo</span>
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/contact"
            className="btn-flame min-h-[44px] inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-white text-xs font-bold whitespace-nowrap shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
          >
            <span className="sm:hidden">Book Demo</span>
            <span className="hidden sm:inline">Book a Free Demo</span>
          </Link>
          <button
            type="button"
            data-testid="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-[#1C1917] hover:bg-[#FFF4EC] border border-[#FED7AA]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          data-testid="mobile-nav-drawer"
          className="md:hidden bg-white/98 backdrop-blur-md border-t border-slate-200/80 shadow-lg shadow-slate-900/10 px-4 pt-3 pb-5 space-y-3"
        >
          {/* Mobile CTA Stack: Login + Book a Free Demo */}
          <div className="flex flex-col gap-2.5 pb-3 border-b border-slate-200/80">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[48px] h-12 w-full rounded-xl border border-[#C2410C] text-[#C2410C] hover:bg-[#FFF0E6] font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>Login</span>
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-flame min-h-[48px] h-12 w-full rounded-xl text-white font-bold text-sm inline-flex items-center justify-center gap-1.5 shadow-[0_6px_20px_-4px_rgba(194,65,12,0.38)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
            >
              <span>Book a Free Demo</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Mobile 4 Direct Links mirroring Desktop */}
          <nav aria-label="Mobile Navigation" className="space-y-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href === '/features' && pathname === '/how-it-works');
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  data-testid={`mobile-${link.testId}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`min-h-[44px] flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C] ${
                    isActive
                      ? 'bg-[#FFF4EC] text-[#C2410C]'
                      : 'text-[#1C1917] hover:bg-[#FFF4EC] hover:text-[#C2410C]'
                  }`}
                >
                  {Icon && (
                    <Icon className="w-4 h-4 text-[#EA580C] shrink-0" aria-hidden="true" />
                  )}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
