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
  Twitter,
  Youtube,
  Github,
  Facebook,
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
    <footer className="bg-[#03045E] text-slate-200 border-t-4 border-[#0077B6] pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Highlight Banner */}
        <div className="bg-[#023E8A] rounded-2xl p-6 sm:p-8 mb-16 shadow-xl border border-navy-400/30 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0077B6] flex items-center justify-center text-white shrink-0 shadow-md">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
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
              className="w-full lg:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-[#023E8A] bg-white hover:bg-slate-100 rounded-xl shadow transition-all whitespace-nowrap"
            >
              Get Free AMC Health Check
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* Multi-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-navy-700/60">
          {/* Column 1: About VigilAMC */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block bg-white p-2.5 rounded-xl shadow-md group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt="VigilAMC - Premium AMC Services"
                className="h-12 sm:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              AMC teams track hundreds of extinguishers, hydrants and panels across dozens of buildings — on paper and Excel. Renewals slip, clients fail their fire NOC audit, and the contract goes to a competitor. VigilAMC puts every asset, due date and client report on autopilot.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-navy-800 text-cyan-200 border border-navy-600 font-medium">
                ISO 9001:2015
              </span>
              <span className="px-2.5 py-1 rounded-md bg-navy-800 text-cyan-200 border border-navy-600 font-medium">
                NFPA 10/25/72
              </span>
              <span className="px-2.5 py-1 rounded-md bg-navy-800 text-cyan-200 border border-navy-600 font-medium">
                NBC 2016 Compliant
              </span>
            </div>

            {/* Social Media Links */}
            <div className="pt-3">
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2.5">
                Connect With Us
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-[#0077B6] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-[#0077B6] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-[#0077B6] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-[#0077B6] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-[#0077B6] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
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
                <Link href="/customers" className="text-slate-300 hover:text-cyan-300 transition-colors">
                  Customer Case Studies
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-slate-300 hover:text-cyan-300 transition-colors">
                  Pricing &amp; Plans
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-300 hover:text-cyan-300 transition-colors">
                  About Our Team
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-300 hover:text-cyan-300 transition-colors">
                  Contact &amp; Book Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: AMC Solutions */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Solutions
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/features" className="hover:text-cyan-300 transition-colors">
                  Fire Extinguisher QR Tagging
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-cyan-300 transition-colors">
                  Hydrant &amp; Wet Riser Telemetry
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-cyan-300 transition-colors">
                  Fire Alarm Panel Audit Hub
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-cyan-300 transition-colors">
                  Form-B Automated PDF Reports
                </Link>
              </li>
              <li>
                <Link href="/customers" className="hover:text-cyan-300 transition-colors">
                  Commercial Towers &amp; IT Parks
                </Link>
              </li>
              <li>
                <Link href="/customers" className="hover:text-cyan-300 transition-colors">
                  Hospitals &amp; Healthcare Facilities
                </Link>
              </li>
              <li>
                <Link href="/scan" className="hover:text-cyan-300 transition-colors">
                  Technician Mobile Scanner App
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
                  New Delhi 110092
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
                <span>Support: 24/7 Fire Audit Dispatch</span>
              </li>
            </ul>

            {/* Newsletter / NOC deadline tracker */}
            <div className="pt-3">
              <p className="text-xs font-semibold text-white mb-1.5">
                Fire Safety Regulatory Newsletter
              </p>
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter business email"
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
            &copy; {new Date().getFullYear()} VigilAMC Technologies Private Limited. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Link href="/about" className="hover:text-slate-200 transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link href="/about" className="hover:text-slate-200 transition-colors">
              Terms of Service
            </Link>
            <span>&bull;</span>
            <Link href="/about" className="hover:text-slate-200 transition-colors">
              NOC Audit Warranty
            </Link>
            <span>&bull;</span>
            <Link href="/about" className="hover:text-slate-200 transition-colors">
              Security &amp; Data Protection
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
