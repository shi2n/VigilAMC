'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  X,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Sliders,
  IndianRupee,
  FileCheck2,
  Building2,
  Clock,
  PhoneCall,
  AlertTriangle
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [assetCount, setAssetCount] = useState<number>(600);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Dynamic estimate: based on custom scale (INR)
  const baseMonthlyPricePerAsset = 15;
  const estimatedCost = Math.round(assetCount * (billingCycle === 'annual' ? baseMonthlyPricePerAsset * 0.8 : baseMonthlyPricePerAsset));

  const comparisonRows = [
    { name: 'Fire Assets Included', starter: 'Up to 300 Assets', pro: 'Up to 1,800 Assets', ent: 'High Volume Fleet' },
    { name: 'Facilities / Sites Supported', starter: 'Up to 3 Sites', pro: 'Up to 15 Sites', ent: 'Enterprise Custom' },
    { name: 'Technician Mobile App (Offline Mode)', starter: true, starterBadge: 'BETA', pro: true, proBadge: 'BETA', ent: true, entBadge: 'BETA' },
    { name: 'Asset Details, Floor Notes and Photo Proof', starter: true, starterBadge: 'BETA', pro: true, proBadge: 'BETA', ent: true, entBadge: 'BETA' },
    { name: 'Statutory Form-B PDF Generation', starter: true, starterBadge: 'LIVE', pro: true, proBadge: 'LIVE', ent: true, entBadge: 'LIVE' },
    { name: 'Automated Renewal Alerts (Email)', starter: true, pro: true, ent: true },
    { name: 'SMS & WhatsApp Renewal Alerts', starter: false, pro: true, ent: true },
    { name: 'Client Self-Service Compliance Portal', starter: false, pro: 'When Live', proBadge: 'COMING SOON', ent: 'When Live', entBadge: 'COMING SOON' },
    { name: 'Defect Summary & Photo Logs', starter: 'Basic', pro: true, ent: true },
    { name: 'Timestamp & Geolocation Logging', starter: true, pro: true, ent: true },
    { name: 'Hydrostatic Pressure Test Scheduler', starter: true, pro: true, ent: true },
    { name: 'Bulk Spreadsheet Asset Importer', starter: true, pro: true, ent: true },
    { name: 'Dedicated Technical Onboarding Support', starter: false, pro: true, ent: true },
    { name: 'Support Target', starter: 'Email (Next Business Day)', pro: 'Priority Email & Phone', ent: 'Direct Account Lead' },
  ];

  const pricingFaqs = [
    {
      q: 'What is included in the free testing program?',
      a: 'Free for every agency during testing. Your agency gets full access to the asset registry, the simple mobile form for technicians (recording details, floor notes, GPS position, and photos), and Form-B PDF generation. You also get direct onboarding support from our founder.',
    },
    {
      q: 'What counts as an "Asset" in the pricing tiers?',
      a: 'An asset is any individual piece of life-safety equipment registered with its type, capacity, serial number, and floor notes. This includes portable fire extinguishers (ABC, CO2, Foam, Clean Agent), wet riser landing valves, first-aid hose reels, fire alarm control panels (FACP), and main sprinkler jockey pumps.',
    },
    {
      q: 'How are inspections recorded on site?',
      a: 'Technicians use a simple mobile form to record asset details, floor and location notes, GPS position, a photo proof, and the inspection timestamp. These records serve as field proof and automatically feed the Form-B compliance report.',
    },
    {
      q: 'Can I add or remove facilities mid-cycle?',
      a: 'Yes. When you take on new client maintenance contracts or conclude an existing facility term, you can adjust your tier and asset allocation accordingly.',
    },
    {
      q: 'Does VigilAMC charge any fees during testing?',
      a: 'No. VigilAMC is completely free for every agency during testing. There are no setup fees or hidden charges, and we assist you in importing your existing equipment inventory from Excel.',
    },
  ];

  return (
    <div className="w-full bg-white">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-ocean-50 to-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#C2410C] bg-white px-3.5 py-1.5 rounded-full border border-ocean-200 shadow-sm">
            Transparent Pricing
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-[#1C1917] tracking-[-0.03em] mt-4 text-balance">
            Predictable Plans for Modern Fire AMC Operations
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto text-pretty">
            Choose the right plan to eliminate forgotten maintenance cycles, standardize field inspections, and generate client-ready Form-B reports.
          </p>

          {/* Monthly / Annual Toggle Switch */}
          <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-300">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-[#1C1917] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-[#C2410C] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-200 text-[#1C1917] font-extrabold">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Plan 1: Starter AMC */}
          <div className="corp-card p-8 bg-white flex flex-col justify-between h-full border border-slate-200 shadow-card hover:shadow-card-hover">
            <div>
              <div className="flex justify-between items-center">
                <h3 className="font-display text-xl font-bold text-slate-900">Starter AMC</h3>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                  Up to 3 Facilities
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Ideal for independent fire safety contractors and small facility operations.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-black text-[#1C1917] tabular-nums tracking-tight">
                  G�{billingCycle === 'annual' ? '3,999' : '4,999'}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ month</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {billingCycle === 'annual' ? 'Billed annually (G�47,988/yr) G�� Save 20%' : 'Billed month-to-month'}
              </p>

              <div className="mt-8 space-y-3 text-xs text-slate-700">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Included Capabilities:
                </p>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Up to <strong>300 Fire Assets</strong> (Extinguishers, Hydrants)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Simple Mobile Form for Technicians (BETA)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Form-B PDF Generation Engine</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Automated Email Expiry Notifications</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Bulk Excel Data Import Template</span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-slate-100">
              <Link
                href="/#pilot-section"
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-[#C2410C] bg-ocean-50 hover:bg-ocean-100 text-center block transition-all border border-ocean-200 active:scale-[0.98]"
              >
                Join the free testing
              </Link>
            </div>
          </div>

          {/* Plan 2: Pro Fleet */}
          <div className="corp-card p-8 bg-white border-2 border-[#C2410C] shadow-xl ring-4 ring-[#C2410C]/15 relative flex flex-col justify-between h-full">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#C2410C] to-[#1C1917] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
              Recommended for AMC Fleets
            </div>

            <div>
              <div className="flex justify-between items-center mt-1">
                <h3 className="font-display text-xl font-bold text-[#1C1917]">Pro Fleet AMC</h3>
                <span className="text-xs font-semibold px-2.5 py-1 bg-ocean-50 text-[#C2410C] rounded-md border border-ocean-200">
                  Up to 15 Facilities
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                For growing fire safety AMC agencies managing multi-building commercial portfolios.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-black text-[#1C1917] tabular-nums tracking-tight">
                  G�{billingCycle === 'annual' ? '6,399' : '7,999'}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ month</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {billingCycle === 'annual' ? 'Billed annually (G�76,788/yr) G�� Save 20%' : 'Billed month-to-month'}
              </p>

              <div className="mt-8 space-y-3 text-xs text-slate-700">
                <p className="font-bold text-[#1C1917] uppercase tracking-wider text-[11px]">
                  Everything in Starter, plus:
                </p>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Up to <strong>1,800 Fire Safety Assets</strong></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Automated WhatsApp &amp; SMS Renewal Alerts</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Client Compliance Portal Access (When Live)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Defect Quotation Summaries &amp; Photo Logs</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Priority Technical Onboarding Support</span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-slate-100">
              <Link
                href="/#pilot-section"
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#C2410C] to-[#1C1917] hover:from-[#9A3412] hover:to-[#9A3412] text-center block transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                Join the free testing
              </Link>
            </div>
          </div>

          {/* Plan 3: Custom / Enterprise */}
          <div className="corp-card p-8 bg-white flex flex-col justify-between h-full border border-slate-200 shadow-card hover:shadow-card-hover">
            <div>
              <div className="flex justify-between items-center">
                <h3 className="font-display text-xl font-bold text-slate-900">Custom / Enterprise AMC</h3>
                <span className="text-xs font-semibold px-2.5 py-1 bg-navy-50 text-[#1C1917] rounded-md">
                  Unlimited
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                For large facility conglomerates, industrial complexes, and multi-city operations.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-black text-[#1C1917] tracking-tight">Custom</span>
                <span className="text-xs text-slate-500 font-medium">tailored to fleet size</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {billingCycle === 'annual' ? 'Volume licensing discount G�� Annual agreements' : 'Flexible monthly fleet rollout'}
              </p>

              <div className="mt-8 space-y-3 text-xs text-slate-700">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Enterprise-Grade Features:
                </p>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>High Volume Asset Registry &amp; Multi-Branch</strong></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Dedicated Technical Account Lead</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Custom CSV Data Mapping &amp; Migration Assistance</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>99.9% Platform Availability Target</span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-slate-100">
              <Link
                href="/contact"
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-[#1C1917] bg-slate-100 hover:bg-slate-200 text-center block transition-all active:scale-[0.98]"
              >
                Contact for Enterprise Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Asset Slider Estimator */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto corp-card p-8 bg-white border-ocean-200 shadow-md">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
              Custom Scale Estimator
            </span>
            <h3 className="text-2xl font-bold text-[#1C1917] mt-1">
              Have a Custom Equipment Fleet Count?
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Adjust the slider to view an estimated monthly rate.
            </p>
          </div>

          <div className="space-y-6 max-w-xl mx-auto">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  Total Fire Assets
                </span>
                <span className="px-3 py-1 bg-ocean-50 text-[#C2410C] font-black text-sm rounded-lg border border-ocean-200">
                  {assetCount.toLocaleString()} Assets
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                value={assetCount}
                onChange={(e) => setAssetCount(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#C2410C]"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                <span>100 Assets</span>
                <span>2,500 Assets</span>
                <span>5,000+ Assets</span>
              </div>
            </div>

            <div className="p-4 bg-ocean-50 rounded-xl border border-ocean-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-600">Estimated Monthly Investment</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-black text-[#1C1917]">
                    G�{estimatedCost.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ month</span>
                </div>
                <p className="text-[11px] text-[#C2410C] font-semibold mt-0.5">
                  Includes Form-B engine &amp; mobile offline checklist
                </p>
              </div>

              <Link
                href="/#pilot-section"
                className="px-6 py-2.5 bg-[#C2410C] hover:bg-[#1C1917] text-white text-xs font-bold rounded-xl shadow transition-colors whitespace-nowrap"
              >
                Join the free testing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917]">
            Comprehensive Plan Comparison Matrix
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Detailed breakdown of features across our three tiers.
          </p>
        </div>

        <div className="overflow-x-auto corp-card border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-900 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 font-bold text-sm">Feature / Quota</th>
                <th className="py-4 px-6 font-bold text-slate-700">Starter AMC</th>
                <th className="py-4 px-6 font-black text-[#C2410C] bg-ocean-50/50">Pro Fleet (Recommended)</th>
                <th className="py-4 px-6 font-bold text-[#1C1917]">Custom / Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-6 font-semibold text-slate-900">{row.name}</td>
                  <td className="py-3 px-6">
                    {typeof row.starter === 'boolean' ? (
                      row.starter ? (
                        <div className="flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600" />
                          {row.starterBadge && <StatusBadge status={row.starterBadge as any} />}
                        </div>
                      ) : (
                        <X className="w-4 h-4 text-slate-300" />
                      )
                    ) : (
                      row.starter
                    )}
                  </td>
                  <td className="py-3 px-6 bg-ocean-50/30 font-semibold text-[#C2410C]">
                    {typeof row.pro === 'boolean' ? (
                      row.pro ? (
                        <div className="flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600" />
                          {row.proBadge && <StatusBadge status={row.proBadge as any} />}
                        </div>
                      ) : (
                        <X className="w-4 h-4 text-slate-300" />
                      )
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span>{row.pro}</span>
                        {row.proBadge && <StatusBadge status={row.proBadge as any} />}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-6 font-bold text-[#1C1917]">
                    {typeof row.ent === 'boolean' ? (
                      row.ent ? (
                        <div className="flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600" />
                          {row.entBadge && <StatusBadge status={row.entBadge as any} />}
                        </div>
                      ) : (
                        <X className="w-4 h-4 text-slate-300" />
                      )
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span>{row.ent}</span>
                        {row.entBadge && <StatusBadge status={row.entBadge as any} />}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing FAQs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917]">
              Frequently Asked Pricing Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Common questions on free testing participation, on-site recording, and plans.
            </p>
          </div>

          <div className="space-y-4">
            {pricingFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`corp-card overflow-hidden bg-white transition-all ${
                    isOpen ? 'border-[#C2410C]/40 shadow-card' : 'border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                  >
                    <span className="text-sm font-bold text-slate-900">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-[#C2410C]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Statutory Disclaimer Box */}
      <section className="py-8 px-4 max-w-4xl mx-auto">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Statutory Compliance Note:</strong> VigilAMC software subscriptions cover software tools, data storage, and report formatting. They do not constitute fire safety certification, licensed inspection services, or statutory approvals. All statutory certificates must be signed by an authorized licensed agency in accordance with local Fire Safety Acts.
          </p>
        </div>
      </section>
    </div>
  );
}
