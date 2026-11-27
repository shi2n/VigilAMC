'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ArrowUpRight,
  LogIn,
  ChevronDown,
  Layers,
  Workflow,
  Smartphone,
} from 'lucide-react';

interface CorporateHeaderProps {
  onOpenDemoModal?: () => void;
}

const FEATURES_DROPDOWN_ITEMS = [
  {
    name: 'All Features',
    description: 'Asset registers, GPS photo proof & Form-B reports',
    href: '/features',
    icon: Layers,
  },
  {
    name: 'How it works',
    description: '3-step field inspection to client compliance workflow',
    href: '/how-it-works',
    icon: Workflow,
  },
] as const;

export function CorporateHeader({ onOpenDemoModal: _onOpenDemoModal }: CorporateHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const openedByRef = useRef<'hover' | 'click' | null>(null);

  const isFeaturesActive =
    pathname === '/features' || pathname === '/how-it-works';

  // Close menus on navigation; auto-open mobile accordion when viewing a Features child page
  useEffect(() => {
    setMobileMenuOpen(false);
    openedByRef.current = null;
    setFeaturesOpen(false);
    setMobileFeaturesOpen(
      pathname === '/features' || pathname === '/how-it-works'
    );
  }, [pathname]);

  // Close desktop dropdown on outside click or Escape key
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        openedByRef.current = null;
        setFeaturesOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        openedByRef.current = null;
        setFeaturesOpen(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const openFeaturesDropdown = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setFeaturesOpen((wasOpen) => {
      if (!wasOpen) {
        openedByRef.current = 'hover';
      }
      return true;
    });
  };

  const handleFeaturesTriggerClick = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    // If hover just opened the dropdown, clicking pins it open instead of closing it
    if (featuresOpen && openedByRef.current === 'hover') {
      openedByRef.current = 'click';
      return;
    }
    setFeaturesOpen((prev) => {
      const next = !prev;
      openedByRef.current = next ? 'click' : null;
      return next;
    });
  };

  const scheduleCloseFeaturesDropdown = () => {
    if (openedByRef.current === 'click') {
      return;
    }
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = window.setTimeout(() => {
      openedByRef.current = null;
      setFeaturesOpen(false);
      closeTimeoutRef.current = null;
    }, 120);
  };

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

        {/* Desktop Nav Links: Technician App | Features (Dropdown) | Pricing | Contact */}
        <nav
          aria-label="Main Navigation"
          data-testid="desktop-main-nav"
          className="hidden md:flex items-center gap-1"
        >
          {/* 1. Technician App */}
          <Link
            href="/#technician-app"
            data-testid="nav-technician-app"
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-[#44403C] hover:text-[#1C1917] hover:bg-[#FFF8F2] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#EA580C]" aria-hidden="true" />
            <span>Technician App</span>
          </Link>

          {/* 2. Features Dropdown */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={openFeaturesDropdown}
            onMouseLeave={scheduleCloseFeaturesDropdown}
          >
            <button
              type="button"
              data-testid="nav-features-trigger"
              aria-expanded={featuresOpen}
              aria-haspopup="menu"
              onClick={handleFeaturesTriggerClick}
              className={`min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C] ${
                isFeaturesActive || featuresOpen
                  ? 'text-[#C2410C] bg-[#FFF4EC] font-semibold'
                  : 'text-[#44403C] font-medium hover:text-[#1C1917] hover:bg-[#FFF8F2]'
              }`}
            >
              <span>Features</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  featuresOpen ? 'rotate-180 text-[#EA580C]' : 'text-[#64748B]'
                }`}
                aria-hidden="true"
              />
            </button>

            {/* Dropdown Panel */}
            <div
              role="menu"
              data-testid="nav-features-dropdown"
              aria-label="Features submenu"
              className={`absolute left-0 top-full pt-2 w-72 transition-all duration-150 origin-top-left ${
                featuresOpen
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 -translate-y-1 pointer-events-none'
              }`}
            >
              <div className="rounded-2xl bg-white/98 backdrop-blur-md border border-slate-200/90 shadow-lg shadow-slate-900/10 p-2 space-y-1">
                {FEATURES_DROPDOWN_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      role="menuitem"
                      data-testid={`nav-dropdown-${item.href.replace('/', '')}`}
                      onClick={() => setFeaturesOpen(false)}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] ${
                        active
                          ? 'bg-[#FFF4EC] text-[#C2410C]'
                          : 'hover:bg-[#FFF8F2] text-[#1C1917]'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                          active
                            ? 'bg-white border-[#FED7AA] text-[#EA580C]'
                            : 'bg-[#FFF8F2] border-[#FED7AA]/70 text-[#C2410C]'
                        }`}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <span className="flex flex-col min-w-0">
                        <span className="text-sm font-bold leading-snug">
                          {item.name}
                        </span>
                        <span className="text-xs text-[#44403C] leading-snug mt-0.5 font-normal">
                          {item.description}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Pricing */}
          <Link
            href="/pricing"
            data-testid="nav-pricing"
            className={`min-h-[44px] inline-flex items-center px-3.5 py-2 rounded-xl text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C] ${
              pathname === '/pricing'
                ? 'text-[#C2410C] bg-[#FFF4EC] font-semibold'
                : 'text-[#44403C] font-medium hover:text-[#1C1917] hover:bg-[#FFF8F2]'
            }`}
          >
            Pricing
          </Link>

          {/* 4. Contact */}
          <Link
            href="/contact"
            data-testid="nav-contact"
            className={`min-h-[44px] inline-flex items-center px-3.5 py-2 rounded-xl text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C] ${
              pathname === '/contact'
                ? 'text-[#C2410C] bg-[#FFF4EC] font-semibold'
                : 'text-[#44403C] font-medium hover:text-[#1C1917] hover:bg-[#FFF8F2]'
            }`}
          >
            Contact
          </Link>
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

          {/* Mobile 4 Top-Level Items mirroring Desktop */}
          <nav aria-label="Mobile Navigation" className="space-y-1">
            {/* 1. Technician App */}
            <Link
              href="/#technician-app"
              data-testid="mobile-nav-technician-app"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#1C1917] hover:bg-[#FFF4EC] hover:text-[#C2410C] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C]"
            >
              <Smartphone className="w-4 h-4 text-[#EA580C] shrink-0" aria-hidden="true" />
              <span>Technician App</span>
            </Link>

            {/* 2. Features Expandable Accordion */}
            <div className="rounded-xl overflow-hidden">
              <button
                type="button"
                data-testid="mobile-nav-features-accordion"
                aria-expanded={mobileFeaturesOpen}
                onClick={() => setMobileFeaturesOpen((prev) => !prev)}
                className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] ${
                  isFeaturesActive || mobileFeaturesOpen
                    ? 'bg-[#FFF4EC] text-[#C2410C]'
                    : 'text-[#1C1917] hover:bg-[#FFF4EC] hover:text-[#C2410C]'
                }`}
              >
                <span>Features</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    mobileFeaturesOpen ? 'rotate-180 text-[#EA580C]' : 'text-[#64748B]'
                  }`}
                  aria-hidden="true"
                />
              </button>

              {mobileFeaturesOpen && (
                <div
                  data-testid="mobile-nav-features-items"
                  className="mt-1 ml-3 pl-3 border-l-2 border-[#FED7AA] space-y-1 py-1"
                >
                  {FEATURES_DROPDOWN_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        data-testid={`mobile-nav-${item.href.replace('/', '')}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`min-h-[44px] flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] ${
                          active
                            ? 'bg-[#FFF4EC] text-[#C2410C] font-bold'
                            : 'text-[#44403C] font-medium hover:bg-[#FFF8F2] hover:text-[#1C1917]'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-[#EA580C] shrink-0" aria-hidden="true" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Pricing */}
            <Link
              href="/pricing"
              data-testid="mobile-nav-pricing"
              onClick={() => setMobileMenuOpen(false)}
              className={`min-h-[44px] flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] ${
                pathname === '/pricing'
                  ? 'bg-[#FFF4EC] text-[#C2410C]'
                  : 'text-[#1C1917] hover:bg-[#FFF4EC] hover:text-[#C2410C]'
              }`}
            >
              Pricing
            </Link>

            {/* 4. Contact */}
            <Link
              href="/contact"
              data-testid="mobile-nav-contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`min-h-[44px] flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] ${
                pathname === '/contact'
                  ? 'bg-[#FFF4EC] text-[#C2410C]'
                  : 'text-[#1C1917] hover:bg-[#FFF4EC] hover:text-[#C2410C]'
              }`}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
