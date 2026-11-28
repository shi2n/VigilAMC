'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileSpreadsheet,
  MailCheck,
  MapPin,
  Smartphone,
  Users,
} from 'lucide-react';
import { AppleReveal } from '@/components/home/AppleReveal';
import { LightBrowserFrame, LightPhoneFrame } from '@/components/home/DeviceFrames';
import scenePump from '../../../public/images/scene-pump.jpg';
import sceneGps from '../../../public/images/scene-gps.jpg';
import sceneSignoff from '../../../public/images/scene-signoff.jpg';

const FIRST_WEEK = [
  {
    day: 'Day 1',
    title: 'Setup',
    detail: 'Add your buildings and import your existing Excel equipment sheet, then invite your technicians.',
  },
  {
    day: 'Day 2–3',
    title: 'First inspections',
    detail: 'Technicians run live checklists offline on Android with GPS-stamped camera photos.',
  },
  {
    day: 'Day 4',
    title: 'First reports to clients',
    detail: 'Export your first 5-page white-label Form B PDF and share Portal access in one click.',
  },
  {
    day: 'Day 5',
    title: "You're running on it",
    detail: 'Recurring service cycles, overdue alerts, and repair re-scheduling run on autopilot.',
  },
];

export function HowItWorksContent({ embedded = false }: { embedded?: boolean }) {
  return (
    <div id="how-it-works" className="scroll-mt-20">
      {embedded && (
        <section
          aria-labelledby="combined-how-it-works-heading"
          className="pt-16 pb-10 sm:pt-20 sm:pb-12 bg-[#FFF8F2] border-t border-[#FED7AA]/70 text-center px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-[820px] mx-auto">
            <p className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.12em] text-[#C2410C] mb-2.5">
              How It Works · Simple Agency Setup
            </p>
            <h2
              id="combined-how-it-works-heading"
              className="font-display text-[32px] sm:text-[46px] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#1C1917] text-balance"
            >
              Get your agency live <span className="text-[#C2410C]">in one day.</span>
            </h2>
            <p className="mt-3.5 text-[16px] sm:text-[18px] leading-relaxed text-[#44403C] max-w-[640px] mx-auto">
              Three clear steps take your agency from scattered spreadsheets and WhatsApp updates to GPS-stamped proof and automated Form B compliance.
            </p>
          </div>
        </section>
      )}

      {/* Step 1: Set up */}
      <section className="py-16 sm:py-24 bg-white border-y border-[#E7E5E4]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <AppleReveal className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF8F2] border border-[#FED7AA] text-xs font-extrabold text-[#C2410C]">
              <span>STEP 01 · SET UP</span>
            </div>
            <h2 className="font-sans font-bold text-[30px] sm:text-[40px] leading-[1.1] tracking-[-0.03em] text-[#1C1917]">
              Bring your buildings, equipment &amp; field team in minutes.
            </h2>
            <p className="text-[17px] text-[#44403C] leading-relaxed">
              Add client buildings and assets manually or upload your existing Excel register, then
              invite your technicians with Staff IDs and 6-digit PINs.
            </p>
            <div className="rounded-2xl bg-[#FFF8F2] border border-[#FED7AA] px-4 py-3 text-sm font-bold text-[#9A3412] flex items-center gap-2.5">
              <Clock className="w-4 h-4 shrink-0 text-[#C2410C]" aria-hidden="true" />
              <span>Most agencies finish setup the same afternoon.</span>
            </div>
            <ul className="space-y-2.5 pt-1 text-[15px] text-[#1C1917]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0 mt-1" aria-hidden="true" />
                <span>Map towers, basements, floors, zones, extinguishers, hydrants &amp; pumps</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0 mt-1" aria-hidden="true" />
                <span>Upload `.xlsx` / `.csv` sheets directly with validation before import</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0 mt-1" aria-hidden="true" />
                <span>Assign technicians to sites and set monthly, quarterly, or annual cycles</span>
              </li>
            </ul>
          </AppleReveal>

          <AppleReveal delayMs={70} className="lg:col-span-7 space-y-4">
            <LightBrowserFrame url="vigilamc.com/dashboard · Bulk Import & Team Invite">
              <div className="p-5 sm:p-6 bg-[#FFFDFB] grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                <div className="sm:col-span-7 space-y-3">
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#E7E5E4]">
                    <span className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-[#C2410C]" aria-hidden="true" />
                      <span>Agency_Master_Register.xlsx</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#065F46] text-[10px] font-bold">
                      48 Units Parsed
                    </span>
                  </div>
                  <div className="rounded-xl bg-white border border-[#E7E5E4] p-3 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#1C1917]">Horizon IT Park · B2 Pump Room</div>
                      <div className="text-[#44403C]">Main Jockey Pump + 18 Hydrant Valves</div>
                    </div>
                    <span className="font-bold text-[#047857]">Ready</span>
                  </div>
                  <div className="rounded-xl bg-white border border-[#E7E5E4] p-3 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#1C1917]">Sunrise Plaza · Floors 1–6</div>
                      <div className="text-[#44403C]">30 ABC &amp; CO2 Extinguishers</div>
                    </div>
                    <span className="font-bold text-[#047857]">Ready</span>
                  </div>
                  <div className="rounded-xl bg-[#FFF8F2] border border-[#FED7AA] p-3 text-xs flex items-center gap-2 text-[#9A3412] font-semibold">
                    <Users className="w-4 h-4 shrink-0 text-[#C2410C]" aria-hidden="true" />
                    <span>3 Field Technicians invited via Staff ID + PIN</span>
                  </div>
                </div>
                <div className="sm:col-span-5">
                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-[#E7E5E4] bg-[#FFF8F2]">
                    <Image
                      src={scenePump}
                      alt="Fire engineer inspecting pump room fire safety equipment during agency setup"
                      fill
                      sizes="(min-width: 1024px) 260px, 90vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </LightBrowserFrame>
          </AppleReveal>
        </div>
      </section>

      {/* Step 2: Inspect */}
      <section className="py-16 sm:py-24 bg-[#FFF8F2] border-b border-[#FED7AA]/70">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <AppleReveal delayMs={70} className="lg:col-span-7 order-2 lg:order-1">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-6 flex justify-center">
                <div className="w-[215px]">
                  <LightPhoneFrame>
                    <div className="relative aspect-[9/19] w-full bg-[#FFF8F2]">
                      <Image
                        src="/screenshots/tech-checklist-detail.png"
                        alt="VigilAMC Field Android checklist screen working offline with GPS proof"
                        fill
                        sizes="215px"
                        className="object-cover object-top"
                      />
                    </div>
                  </LightPhoneFrame>
                </div>
              </div>
              <div className="sm:col-span-6 space-y-4">
                <div className="rounded-2xl bg-white border border-[#FED7AA] p-3 shadow-sm">
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#FFF8F2]">
                    <Image
                      src={sceneGps}
                      alt="Technician logging hydrant inspection on phone with GPS coordinates"
                      fill
                      sizes="(min-width: 1024px) 280px, 90vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="pt-2.5 px-1 flex items-center justify-between text-xs font-bold text-[#1C1917]">
                    <span className="inline-flex items-center gap-1 text-[#C2410C]">
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                      GPS + Timestamp Locked
                    </span>
                    <span className="text-[#047857]">Offline Outbox OK</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-[#E7E5E4] p-4 space-y-2 text-xs">
                  <div className="font-bold text-[#1C1917] flex items-center justify-between">
                    <span>Live Office Status Sync</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#065F46] font-bold">
                      Updated
                    </span>
                  </div>
                  <p className="text-[#44403C]">
                    Completed floors, pressure readings, defect flags, and camera photos appear directly on the office dashboard.
                  </p>
                </div>
              </div>
            </div>
          </AppleReveal>

          <AppleReveal className="lg:col-span-5 space-y-4 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#FED7AA] text-xs font-extrabold text-[#C2410C]">
              <span>STEP 02 · INSPECT</span>
            </div>
            <h2 className="font-sans font-bold text-[30px] sm:text-[40px] leading-[1.1] tracking-[-0.03em] text-[#1C1917]">
              Your field team inspects offline, with GPS-stamped proof.
            </h2>
            <p className="text-[17px] text-[#44403C] leading-relaxed">
              Technicians follow guided floor and zone checklists in their preferred Indian language,
              capture rear-camera photos with GPS coordinates, and record voice remarks even with no basement signal.
            </p>
            <ul className="space-y-2.5 pt-1 text-[15px] text-[#1C1917]">
              <li className="flex items-start gap-2.5">
                <Smartphone className="w-4 h-4 text-[#C2410C] shrink-0 mt-1" aria-hidden="true" />
                <span>Lock-screen push alerts wake technicians for urgent work orders</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0 mt-1" aria-hidden="true" />
                <span>Local outbox stores inspections safely offline and syncs automatically</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0 mt-1" aria-hidden="true" />
                <span>Office sees live building progress and flagged defects immediately</span>
              </li>
            </ul>
          </AppleReveal>
        </div>
      </section>

      {/* Step 3: Report & relax */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#E7E5E4]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <AppleReveal className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF8F2] border border-[#FED7AA] text-xs font-extrabold text-[#C2410C]">
              <span>STEP 03 · REPORT &amp; RELAX</span>
            </div>
            <h2 className="font-sans font-bold text-[30px] sm:text-[40px] leading-[1.1] tracking-[-0.03em] text-[#1C1917]">
              Form B reports, client alerts &amp; renewals go out automatically.
            </h2>
            <p className="text-[17px] text-[#44403C] leading-relaxed">
              No Sunday nights stitching photos into Word documents. Generate your 5-page white-label Form B PDF in minutes, email due-date alerts, and let clients check their Portal anytime.
            </p>
            <div className="pt-2">
              <Link
                href="/sample-report"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#C2410C] hover:text-[#9A3412] underline underline-offset-4"
              >
                <span>Inspect sample 5-page Form B report</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </AppleReveal>

          <AppleReveal delayMs={70} className="lg:col-span-7">
            <LightBrowserFrame url="vigilamc.com/reports · Automated Form B & Digests">
              <div className="p-5 sm:p-6 bg-[#FFFDFB] grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                <div className="sm:col-span-7 space-y-3">
                  <div className="rounded-xl bg-[#FFF8F2] border border-[#FED7AA] p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                        <FileCheck2 className="w-4 h-4 text-[#C2410C]" aria-hidden="true" />
                        <span>Form B Biannual Declaration</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#065F46] text-[10px] font-bold">
                        5 Pages Ready
                      </span>
                    </div>
                    <p className="text-xs text-[#44403C]">
                      Stamped with your agency header, license number, verified units &amp; signatory block.
                    </p>
                  </div>

                  <div className="rounded-xl bg-white border border-[#E7E5E4] p-3.5 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-semibold text-[#1C1917]">
                      <MailCheck className="w-4 h-4 text-[#047857]" aria-hidden="true" />
                      <span>Client Portal Delivery Receipt</span>
                    </span>
                    <span className="font-bold text-[#047857]">Acknowledged</span>
                  </div>

                  <div className="rounded-xl bg-white border border-[#E7E5E4] p-3.5 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-semibold text-[#1C1917]">
                      <BellRing className="w-4 h-4 text-[#C2410C]" aria-hidden="true" />
                      <span>60 / 30 / 7-Day Renewal Alerts</span>
                    </span>
                    <span className="font-bold text-[#C2410C]">Scheduled</span>
                  </div>
                </div>

                <div className="sm:col-span-5">
                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-[#E7E5E4] bg-[#FFF8F2]">
                    <Image
                      src={sceneSignoff}
                      alt="Facility manager reviewing digital compliance report sign-off in building lobby"
                      fill
                      sizes="(min-width: 1024px) 260px, 90vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </LightBrowserFrame>
          </AppleReveal>
        </div>
      </section>

      {/* "Your first week" Honest Mini-Timeline */}
      <section
        aria-labelledby="first-week-heading"
        className="py-16 sm:py-24 bg-[#FFF8F2] border-b border-[#FED7AA]/70"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <AppleReveal className="text-center max-w-[680px] mx-auto mb-12">
            <p className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.12em] text-[#C2410C] mb-2.5">
              Realistic rollout
            </p>
            <h2
              id="first-week-heading"
              className="font-sans font-bold text-[30px] sm:text-[42px] leading-[1.1] tracking-[-0.03em] text-[#1C1917]"
            >
              Your first week on VigilAMC.
            </h2>
            <p className="mt-3 text-[16px] sm:text-[18px] text-[#44403C]">
              A realistic day-by-day rollout you can run without outside consultants.
            </p>
          </AppleReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FIRST_WEEK.map((item, idx) => (
              <AppleReveal key={item.day} delayMs={idx * 55}>
                <div className="h-full rounded-2xl bg-white border border-[#FED7AA]/80 p-6 shadow-[0_12px_30px_-20px_rgba(28,25,23,0.12)] flex flex-col justify-between">
                  <div>
                    <span className="inline-flex px-3 py-1 rounded-full bg-[#C2410C] text-white text-xs font-bold">
                      {item.day}
                    </span>
                    <h3 className="mt-4 font-sans font-bold text-lg text-[#1C1917]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-[#44403C] leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </AppleReveal>
            ))}
          </div>

          {/* Honest Statutory Responsibility Note */}
          <div className="mt-10 max-w-[900px] mx-auto rounded-2xl bg-white border border-[#FED7AA] p-5 flex items-start gap-3 text-xs sm:text-[13px] text-[#44403C]">
            <AlertTriangle className="w-5 h-5 text-[#C2410C] shrink-0 mt-0.5" aria-hidden="true" />
            <p className="leading-relaxed">
              <strong className="text-[#1C1917]">Statutory Responsibility Note:</strong> VigilAMC compiles inspection records into standardized 5-page Form B formats aligned with IS 2190 and NBC 2016 Part 4. Final legal certification and authority submission remain signed and stamped by a licensed fire-safety contractor.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
