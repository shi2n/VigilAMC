'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  ShieldCheck,
  Menu,
  X,
  PhoneCall,
  Clock,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Building,
  Wrench,
  FileCheck,
  Award,
  Linkedin,
  Instagram,
  Youtube
} from 'lucide-react';

interface CorporateHeaderProps {
  onOpenDemoModal?: () => void;
}

export function CorporateHeader({ onOpenDemoModal }: CorporateHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Features', href: '/features' },
    { name: 'Sample Report', href: '/sample-report' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="w-full relative z-40">
      {/* Top Utility Bar (Compliance & Direct Helpline) */}
      <div className="bg-[#023E8A] text-white text-[11px] sm:text-xs py-1.5 px-4 border-b border-navy-700/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 truncate">
            <span className="inline-flex items-center gap-1.5 font-medium text-cyan-200 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Built for Fire-Safety AMC &amp; Service Teams
            </span>
            <span className="hidden md:inline text-navy-300">|</span>
            <span className="hidden lg:inline text-slate-200 truncate">
              QR-Based Service Verification &bull; Client Compliance Reports
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-[11px] sm:text-xs">
            <div className="hidden xl:flex items-center gap-2.5 pr-2 border-r border-navy-700/60 text-cyan-200">
              <span className="text-[10px] text-cyan-300 font-semibold">@vigilamc</span>
              <a
                href="https://www.linkedin.com/company/vigilamc/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                title="LinkedIn: vigilamc"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-3 h-3" />
              </a>
              <a
                href="https://www.instagram.com/vigilamc"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                title="Instagram: @vigilamc"
                aria-label="Instagram"
              >
                <Instagram className="w-3 h-3" />
              </a>
              <a
                href="https://x.com/vigilamc"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                title="X (Twitter): @vigilamc"
                aria-label="X (Twitter)"
              >
                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@vigilamc"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                title="YouTube: @vigilamc"
                aria-label="YouTube"
              >
                <Youtube className="w-3 h-3" />
              </a>
            </div>
            <a
              href="tel:+918383890483"
              className="flex items-center gap-1.5 text-slate-100 hover:text-cyan-200 transition-colors font-medium"
            >
              <PhoneCall className="w-3 h-3 text-cyan-300" />
              <span className="hidden sm:inline">AMC Helpline:</span>
              <strong className="tracking-wide">+91 83838 90483</strong>
            </a>
            <span className="text-navy-400 hidden sm:inline">|</span>
            <Link
              href="/login"
              className="text-white hover:text-cyan-200 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Client Portal</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Unified Navigation Bar */}
      <nav
        className={`w-full transition-all duration-200 border-b ${
          isScrolled
            ? 'sticky top-0 bg-white/95 backdrop-blur-md shadow-md border-slate-200/90 py-2.5'
            : 'bg-white border-slate-100 py-3.5 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo & Tagline */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="bg-white p-1 rounded-xl border border-slate-100 shadow-sm transition-transform duration-200 group-hover:scale-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.jpg"
                  alt="VigilAMC"
                  className="h-9 sm:h-10 w-auto object-contain mix-blend-multiply"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#023E8A]">
                    Vigil<span className="text-[#0077B6]">AMC</span>
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-ocean-50 text-[#0077B6] border border-ocean-200/80">
                    Form-B Autopilot
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium tracking-tight hidden sm:block">
                  Never miss a compliance deadline again
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      isActive
                        ? 'text-[#0077B6] bg-ocean-50/90 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-[#0077B6] hover:bg-slate-50'
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#0077B6] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Quick Actions */}
            <div className="hidden sm:flex items-center space-x-2.5">
              <Link
                href="/scan"
                className="text-xs font-semibold text-slate-600 hover:text-[#0077B6] px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 border border-slate-200/60"
                title="Technician field scanning utility"
              >
                <span>Scan QR</span>
              </Link>
              <Link
                href="/#pilot-form"
                className="text-xs font-semibold text-[#023E8A] hover:text-[#0077B6] px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Join Pilot
              </Link>
              <button
                onClick={onOpenDemoModal}
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-[#0077B6] to-[#023E8A] hover:from-[#006494] hover:to-[#011F48] shadow-sm hover:shadow transition-all group active:scale-[0.98]"
              >
                <span>Workflow Review</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={onOpenDemoModal}
                className="text-xs font-bold text-white bg-[#0077B6] px-3 py-1.5 rounded-lg active:scale-95"
              >
                Review
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-700 hover:text-[#0077B6] hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-slate-800" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-800" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 shadow-xl px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="grid gap-1 pb-3 border-b border-slate-100">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? 'text-[#0077B6] bg-ocean-50 font-bold'
                        : 'text-slate-700 hover:text-[#0077B6] hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.name}</span>
                    {isActive && <CheckCircle2 className="w-4 h-4 text-[#0077B6]" />}
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/scan"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg active:scale-[0.98]"
              >
                Technician QR Scanner
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDemoModal?.();
                }}
                className="w-full text-center py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#0077B6] to-[#023E8A] rounded-lg shadow active:scale-[0.98]"
              >
                Book 15-Minute Workflow Review
              </button>
              <div className="text-center pt-2 text-xs text-slate-500">
                Helpline: <a href="tel:+918383890483" className="text-[#0077B6] font-bold">+91 83838 90483</a>
              </div>
              <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500">Follow @vigilamc:</span>
                <a
                  href="https://www.linkedin.com/company/vigilamc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-md bg-slate-100 text-[#0A66C2] flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-colors"
                  aria-label="LinkedIn"
                  title="LinkedIn: vigilamc"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.instagram.com/vigilamc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-md bg-slate-100 text-pink-600 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors"
                  aria-label="Instagram"
                  title="Instagram: @vigilamc"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://x.com/vigilamc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-md bg-slate-100 text-slate-800 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                  aria-label="X (Twitter)"
                  title="X (Twitter): @vigilamc"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@vigilamc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-md bg-slate-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                  aria-label="YouTube"
                  title="YouTube: @vigilamc"
                >
                  <Youtube className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
