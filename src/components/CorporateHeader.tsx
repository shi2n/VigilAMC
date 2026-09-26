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
  Award
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
    { name: 'Customers', href: '/customers' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="w-full relative z-40 bg-white">
      {/* Top Utility Bar (Compliance & Hotline) */}
      <div className="bg-[#023E8A] text-white text-xs py-2 px-4 border-b border-navy-700/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-medium text-cyan-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Govt. Directorate &amp; NFPA 10/25/72 Audit Standard
            </span>
            <span className="hidden md:inline text-navy-300">|</span>
            <span className="hidden md:inline text-slate-200">
              Automating 14,800+ life safety assets across 450+ towers
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href="tel:+918383890483"
              className="flex items-center gap-1.5 text-slate-100 hover:text-cyan-200 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-cyan-300" />
              <span>AMC Helpline: <strong>+91 83838 90483</strong></span>
            </a>
            <span className="text-navy-300 hidden sm:inline">|</span>
            <Link
              href="/login"
              className="text-white hover:text-cyan-200 font-semibold flex items-center gap-1 underline-offset-4 hover:underline"
            >
              Client Login
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Center Logo Section */}
      <div className="py-5 px-4 sm:px-6 lg:px-8 border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left subtle assurance badge */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
            <Award className="w-4 h-4 text-[#0077B6]" />
            <span>Form-B Certification &amp; 100% Fire NOC Guarantee</span>
          </div>

          {/* Centered Brand Logo */}
          <Link href="/" className="flex flex-col items-center group text-center py-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="VigilAMC - Premium AMC Services"
              className="h-16 sm:h-20 w-auto object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
            />
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-wide mt-1">
              Never miss a compliance deadline again.
            </p>
          </Link>

          {/* Right Action: Quick Consultation / Demo Link */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg text-[#023E8A] bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              Request Free Audit
            </Link>
            <button
              onClick={onOpenDemoModal}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-lg text-white bg-[#0077B6] hover:bg-[#023E8A] shadow-sm hover:shadow transition-all"
            >
              Book 15-Min Demo
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Below (Sticky with shadow & backdrop blur) */}
      <nav
        className={`w-full bg-white transition-all duration-200 border-b border-slate-200 ${
          isScrolled ? 'sticky top-0 shadow-md backdrop-blur-md bg-white/95' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Scrolled Mini Logo for brand consistency */}
            <div className="flex items-center md:hidden">
              <Link href="/" className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.jpg"
                  alt="VigilAMC"
                  className="h-9 w-auto object-contain mix-blend-multiply"
                />
              </Link>
            </div>

            {/* Desktop Centered Navigation Items */}
            <div className="hidden md:flex flex-1 items-center justify-center space-x-1 lg:space-x-3">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      isActive
                        ? 'text-[#0077B6] bg-ocean-50/80 font-bold'
                        : 'text-slate-700 hover:text-[#0077B6] hover:bg-slate-50'
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#0077B6] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Action on Nav Bar */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/scan"
                className="text-xs font-semibold text-slate-600 hover:text-[#0077B6] px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
                title="Technician field scanning utility"
              >
                Scan Asset QR
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0077B6] hover:bg-[#023E8A] px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all"
              >
                Schedule Demo
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center gap-2">
              <Link
                href="/contact"
                className="text-xs font-bold text-white bg-[#0077B6] px-3 py-1.5 rounded-lg"
              >
                Demo
              </Link>
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
          <div className="md:hidden bg-white border-t border-slate-100 shadow-xl px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-4 duration-200">
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
                className="w-full text-center py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Technician QR Scanner
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-bold text-white bg-[#0077B6] hover:bg-[#023E8A] rounded-lg shadow"
              >
                Book Live Walkthrough
              </Link>
              <div className="text-center pt-2 text-xs text-slate-500">
                Helpline: <a href="tel:+918383890483" className="text-[#0077B6] font-bold">+91 83838 90483</a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
