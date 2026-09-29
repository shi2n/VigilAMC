'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  Scan,
  Printer,
  Home,
  LogIn
} from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  // The landing page has its own dedicated header matching the exact marketing copy
  if (pathname === '/') {
    return null;
  }

  return (
    <header className="no-print bg-[#080d1a]/95 backdrop-blur-md border-b border-slate-800/80 text-slate-100 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="bg-white p-1 rounded-lg shrink-0 shadow-sm transition-transform group-hover:scale-105">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt="VigilAMC"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white whitespace-nowrap leading-none">
                  Vigil<span className="text-[#0077B6]">AMC</span>
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-[#0077B6]/20 text-cyan-300 border border-[#0077B6]/40 whitespace-nowrap leading-none shrink-0">
                  AMC OS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight whitespace-nowrap leading-none mt-1">
                Fire Safety &amp; Compliance Tracker
              </p>
            </div>
          </Link>

          {/* Agency License Badge */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 bg-slate-900/90 px-3 py-1 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Agency Lic: <strong className="font-mono text-amber-400 font-semibold">DL/FIRE/LIC/2026/042</strong></span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <Link
            href="/dashboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              pathname.startsWith('/dashboard')
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/scan"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Scan className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Technician Scan</span>
          </Link>

          <Link
            href="/assets/print-qr"
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              pathname.startsWith('/assets/print-qr')
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>QR Labels</span>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/40 text-xs font-semibold transition-colors"
          >
            <LogIn className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Sign In</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
