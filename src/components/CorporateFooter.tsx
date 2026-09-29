'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Linkedin,
  Instagram,
  Youtube,
  FileCheck2,
  Clock,
  Send
} from 'lucide-react';

export function CorporateFooter() {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) return;
    try {
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'NEWSLETTER',
          email: emailInput,
        }),
      });
      setSubscribed(true);
      setTimeout(() => {
        setEmailInput('');
        setSubscribed(false);
      }, 4000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <footer className="bg-[#080d1a] text-slate-300 border-t border-slate-800/80 pt-16 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Highlight Banner */}
        <div className="bg-gradient-to-r from-[#023E8A] via-[#004B6E] to-[#011F48] rounded-2xl p-6 sm:p-8 mb-16 shadow-xl border border-cyan-400/20 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0077B6] to-[#023E8A] flex items-center justify-center text-white shrink-0 shadow-md border border-cyan-300/30">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
                Worried about your upcoming Fire NOC audit deadline?
              </h3>
              <p className="text-sm text-cyan-100 mt-1">
                Upload your asset inventory or talk to a certified fire safety compliance specialist.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Link
              href="/contact"
              className="w-full lg:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-[#023E8A] bg-white hover:bg-slate-100 rounded-xl shadow transition-all whitespace-nowrap active:scale-[0.98]"
            >
              <span>Get Free AMC Health Check</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* Multi-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/70">
          {/* Column 1: About VigilAMC */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block bg-white p-2 rounded-xl shadow-md group border border-slate-700/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt="VigilAMC - Premium AMC Services"
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 mix-blend-multiply"
              />
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm text-pretty">
              VigilAMC helps fire-safety AMC and service teams track assets, service schedules, QR-based visits, evidence and client compliance reports from one platform.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-slate-900/90 text-cyan-200 border border-slate-700/70 font-medium">
                Built for Fire AMC
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900/90 text-cyan-200 border border-slate-700/70 font-medium">
                QR Service Verification
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900/90 text-cyan-200 border border-slate-700/70 font-medium">
                Form-B Structuring
              </span>
            </div>

            {/* Social Media Links */}
            <div className="pt-3">
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                <span>Connect With Us</span>
                <span className="text-[11px] font-medium text-cyan-300 normal-case tracking-normal">(@vigilamc)</span>
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://www.linkedin.com/company/vigilamc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-[#0A66C2] flex items-center justify-center text-slate-300 hover:text-white transition-all border border-slate-700/60 hover:border-cyan-400/40 hover:scale-105"
                  aria-label="LinkedIn"
                  title="LinkedIn: vigilamc"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://www.instagram.com/vigilamc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] flex items-center justify-center text-slate-300 hover:text-white transition-all border border-slate-700/60 hover:border-pink-500/40 hover:scale-105"
                  aria-label="Instagram (@vigilamc)"
                  title="Instagram: @vigilamc"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://x.com/vigilamc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-black flex items-center justify-center text-slate-300 hover:text-white transition-all border border-slate-700/60 hover:border-slate-500 hover:scale-105"
                  aria-label="X / Twitter (@vigilamc)"
                  title="X (Twitter): @vigilamc"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@vigilamc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-[#FF0000] flex items-center justify-center text-slate-300 hover:text-white transition-all border border-slate-700/60 hover:border-red-500/40 hover:scale-105"
                  aria-label="YouTube (@vigilamc)"
                  title="YouTube: @vigilamc"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Platform &amp; Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slate-300 hover:text-cyan-300 transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-slate-300 hover:text-cyan-300 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-slate-300 hover:text-cyan-300 transition-colors">
                  Key Features
                </Link>
              </li>
              <li>
                <Link href="/sample-report" className="text-slate-300 hover:text-cyan-300 transition-colors">
                  Sample Report (PDF)
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-slate-300 hover:text-cyan-300 transition-colors">
                  Pricing &amp; Pilot
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-300 hover:text-cyan-300 transition-colors">
                  About &amp; Mission
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-300 hover:text-cyan-300 transition-colors">
                  Contact &amp; Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: AMC Solutions */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Capabilities
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/features" className="hover:text-cyan-300 transition-colors">
                  Fire Extinguisher QR Tagging
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-cyan-300 transition-colors">
                  Hydrant &amp; Riser Maintenance Logs
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-cyan-300 transition-colors">
                  Fire Alarm Panel Inspection Hub
                </Link>
              </li>
              <li>
                <Link href="/sample-report" className="hover:text-cyan-300 transition-colors">
                  Model Form-B Compliance Reports
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-cyan-300 transition-colors">
                  Security &amp; Data Architecture
                </Link>
              </li>
              <li>
                <Link href="/scan" className="hover:text-cyan-300 transition-colors">
                  Technician Mobile Scanner
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Newsletter */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Direct Contact
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#48CAE4] shrink-0 mt-0.5" />
                <span>
                  New Delhi 110092, India
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#48CAE4] shrink-0" />
                <a href="tel:+918383890483" className="hover:text-cyan-300 transition-colors font-medium">
                  Direct: +91 83838 90483
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#48CAE4] shrink-0" />
                <a href="mailto:vigilamc@gmail.com" className="hover:text-cyan-300 transition-colors">
                  vigilamc@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#48CAE4] shrink-0" />
                <span>Mon &ndash; Sat: 9:00 AM &ndash; 7:00 PM IST</span>
              </li>
            </ul>

            {/* Newsletter / Regulatory notice */}
            <div className="pt-3">
              <p className="text-xs font-semibold text-white mb-1.5">
                Fire Safety Regulatory Updates
              </p>
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter work email"
                    className="w-full text-xs px-3 py-2 rounded-l-lg bg-navy-900 border border-navy-700 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#0077B6] hover:bg-[#0096C7] text-white text-xs font-bold rounded-r-lg flex items-center justify-center transition-colors"
                    aria-label="Subscribe to updates"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                {subscribed && (
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Subscribed to compliance updates!
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Bottom row: Disclaimers and copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>
            &copy; {new Date().getFullYear()} VigilAMC. [ADD COMPANY LEGAL DETAILS]. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Link href="/privacy" className="hover:text-slate-200 transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:text-slate-200 transition-colors">
              Terms of Service
            </Link>
            <span>&bull;</span>
            <Link href="/security" className="hover:text-slate-200 transition-colors">
              Security &amp; Data
            </Link>
            <span>&bull;</span>
            <Link href="/sample-report" className="hover:text-slate-200 transition-colors">
              Sample Report
            </Link>
            <span>&bull;</span>
            <Link href="/contact" className="hover:text-slate-200 transition-colors">
              Support
            </Link>
          </div>
        </div>

        {/* Statutory Fire Safety Disclaimer Notice */}
        <div className="pt-4 text-[10px] text-slate-500 text-center leading-relaxed">
          Requirements, report formats, and inspection cadences vary by state, municipal jurisdiction, building occupancy type, and applicable fire regulations. VigilAMC is software for organizing service records and workflow documentation. Compliance information should be reviewed with a qualified fire-compliance professional and applicable local authorities.
        </div>
      </div>
    </footer>
  );
}
