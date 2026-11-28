'use client';

import React from 'react';
import Link from 'next/link';
import {
  CalendarClock,
  Wrench,
  FileSpreadsheet,
  FileCheck2,
  Mail,
  Users,
  CheckCircle2,
  ArrowRight,
  RotateCw,
  MapPin,
} from 'lucide-react';
import { AppleReveal } from './AppleReveal';
import { LightBrowserFrame } from './DeviceFrames';

export function AdminDashboardSection({ showDemoCta = false }: { showDemoCta?: boolean }) {
  return (
    <section
      id="admin-dashboard"
      aria-labelledby="admin-dashboard-heading"
      className="py-20 sm:py-28 bg-white border-t border-[#E7E5E4]"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <AppleReveal className="text-center max-w-[760px] mx-auto mb-16 sm:mb-20">
          <p className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.12em] text-[#C2410C] mb-3">
            Admin Dashboard · The office, organized
          </p>
          <h2
            id="admin-dashboard-heading"
            className="font-sans font-bold text-[32px] sm:text-[42px] lg:text-[48px] leading-[1.09] tracking-[-0.03em] text-[#1C1917] text-balance"
          >
            Built for how fire-safety offices actually work.
          </h2>
          <p className="mt-4 text-[17px] sm:text-[18px] text-[#44403C] max-w-[600px] mx-auto leading-relaxed">
            Keep equipment registers, service reminders, repair jobs, and Form B reports in one workspace instead of scattered spreadsheets.
          </p>
        </AppleReveal>

        <div className="space-y-16 sm:space-y-24">
          {/* ROW 1: Text Left · Visual Right — Equipment Registry, Service Cycles & Run Scheduling Now */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <AppleReveal className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF8F2] border border-[#FED7AA] text-xs font-bold text-[#C2410C]">
                <CalendarClock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Registry &amp; Auto AMC Cycles</span>
              </div>
              <h3 className="font-sans font-bold text-[26px] sm:text-[32px] leading-[1.15] tracking-[-0.02em] text-[#1C1917]">
                Equipment registry, service cycles &amp; Run scheduling now.
              </h3>
              <p className="text-[16px] text-[#44403C] leading-relaxed">
                Track every extinguisher, hydrant, sprinkler pump, and alarm panel with live status chips: EXPIRED, DUE SOON, or OK.
              </p>
              <ul className="space-y-2.5 pt-1 text-[15px] text-[#1C1917]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0 mt-1" aria-hidden="true" />
                  <span>Configure monthly, quarterly, or annual cycles per building</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0 mt-1" aria-hidden="true" />
                  <span>Click <strong>Run scheduling now</strong> to auto-create OPEN work orders</span>
                </li>
              </ul>
            </AppleReveal>

            <AppleReveal delayMs={70} className="lg:col-span-7">
              <LightBrowserFrame url="app.vigilamc.com/dashboard · Expiry Radar &amp; Cycles">
                <div className="p-4 sm:p-6 bg-[#FFFDFB] space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E7E5E4]">
                    <div>
                      <div className="text-sm font-bold text-[#1C1917]">Equipment &amp; Compliance Cycles</div>
                      <div className="text-xs text-[#44403C]">Lead-time window: 7 days before due date</div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C2410C] text-white text-xs font-bold">
                      <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
                      Run scheduling now
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="rounded-xl bg-white border border-[#E7E5E4] p-3.5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-[#1C1917]">EXT-104 · 6kg ABC Powder</div>
                        <div className="text-[11px] text-[#44403C]">Emerald Heights · Tower B Lobby</div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#991B1B] border border-[#DC2626]/40 text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                        EXPIRED
                      </span>
                    </div>

                    <div className="rounded-xl bg-white border border-[#E7E5E4] p-3.5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-[#1C1917]">HYD-012 · Basement Jockey Pump</div>
                        <div className="text-[11px] text-[#44403C]">Horizon IT Park · B2 Pump Room</div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#D97706]/40 text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                        DUE SOON · 6d left
                      </span>
                    </div>

                    <div className="rounded-xl bg-white border border-[#E7E5E4] p-3.5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-[#1C1917]">EXT-208 · 4.5kg CO2 Server Room</div>
                        <div className="text-[11px] text-[#44403C]">Sunrise Commercial Plaza · Floor 4</div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D1FAE5] text-[#065F46] border border-[#059669]/40 text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                        OK · Verified
                      </span>
                    </div>
                  </div>
                </div>
              </LightBrowserFrame>
            </AppleReveal>
          </div>

          {/* ROW 2: Visual Left · Text Right — Inspections, Repairs with Re-Schedule & Teams */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <AppleReveal delayMs={70} className="lg:col-span-7 order-2 lg:order-1">
              <LightBrowserFrame url="app.vigilamc.com/dashboard · Inspections &amp; Teams">
                <div className="p-4 sm:p-6 bg-[#FFFDFB] space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E7E5E4]">
                    <div className="text-sm font-bold text-[#1C1917]">Active Inspections &amp; Repair Queue</div>
                    <span className="px-2.5 py-1 rounded-full bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA] text-[11px] font-bold">
                      GPS + Photo Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white border border-[#E7E5E4] p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#C2410C]">WO-418 · Inspection</span>
                        <span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#065F46] font-bold">COMPLETED</span>
                      </div>
                      <div className="text-xs font-bold text-[#1C1917]">Apex Towers (Wing A)</div>
                      <div className="text-[11px] text-[#44403C] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C2410C]" aria-hidden="true" />
                        <span>Assigned: Rahul Verma · 14m GPS</span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-white border border-[#E7E5E4] p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#991B1B]">REP-109 · Low Pressure</span>
                        <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] font-bold">IN_PROGRESS</span>
                      </div>
                      <div className="text-xs font-bold text-[#1C1917]">Refill 6kg ABC · B1 Parking</div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-[#44403C]">Tech: Amit Nair</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#FFF8F2] border border-[#FED7AA] text-[10px] font-bold text-[#C2410C]">
                          Re-schedule
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </LightBrowserFrame>
            </AppleReveal>

            <AppleReveal className="lg:col-span-5 space-y-4 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF8F2] border border-[#FED7AA] text-xs font-bold text-[#C2410C]">
                <Wrench className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Inspections, Repairs &amp; Teams</span>
              </div>
              <h3 className="font-sans font-bold text-[26px] sm:text-[32px] leading-[1.15] tracking-[-0.02em] text-[#1C1917]">
                Approve inspections, track repairs &amp; assign teams cleanly.
              </h3>
              <p className="text-[16px] text-[#44403C] leading-relaxed">
                Verify GPS location and live photos before sign-off. When a cylinder fails pressure check, open a repair job, re-schedule visits, and assign the right technician.
              </p>
              <ul className="space-y-2.5 pt-1 text-[15px] text-[#1C1917]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0 mt-1" aria-hidden="true" />
                  <span>One-click re-schedule when a building delays access</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-[#C2410C] shrink-0 mt-1" aria-hidden="true" />
                  <span>Clear team roles for agency admins, supervisors &amp; technicians</span>
                </li>
              </ul>
            </AppleReveal>
          </div>

          {/* ROW 3: Text Left · Visual Right — Excel Bulk Import */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <AppleReveal className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF8F2] border border-[#FED7AA] text-xs font-bold text-[#C2410C]">
                <FileSpreadsheet className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Zero Manual Re-Typing</span>
              </div>
              <h3 className="font-sans font-bold text-[26px] sm:text-[32px] leading-[1.15] tracking-[-0.02em] text-[#1C1917]">
                Bring your entire Excel register in at once.
              </h3>
              <p className="text-[16px] text-[#44403C] leading-relaxed">
                Already managing hundreds of buildings in Excel? Upload your `.xlsx` sheets once and map the columns. Your assets, floor notes, serial numbers, and next due dates go live right away.
              </p>
              <ul className="space-y-2.5 pt-1 text-[15px] text-[#1C1917]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0 mt-1" aria-hidden="true" />
                  <span>Import single-building or multi-client registers in minutes</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0 mt-1" aria-hidden="true" />
                  <span>Download monthly audit registers back to Excel anytime</span>
                </li>
              </ul>
            </AppleReveal>

            <AppleReveal delayMs={70} className="lg:col-span-7">
              <LightBrowserFrame url="app.vigilamc.com/dashboard · Excel Register Import">
                <div className="p-4 sm:p-6 bg-[#FFFDFB] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#047857]" aria-hidden="true" />
                      <span className="text-xs sm:text-sm font-bold text-[#1C1917]">Fire_Register_2026.xlsx</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#D1FAE5] text-[#065F46] text-[11px] font-bold">
                      Ready to import
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#E7E5E4] text-[#44403C]">
                          <th className="py-2 pr-3 font-semibold">Asset Tag</th>
                          <th className="py-2 pr-3 font-semibold">Type</th>
                          <th className="py-2 pr-3 font-semibold">Floor / Zone</th>
                          <th className="py-2 font-semibold">Next Due</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7E5E4]/60 text-[#1C1917]">
                        <tr>
                          <td className="py-2 pr-3 font-mono font-semibold">EXT-001</td>
                          <td className="py-2 pr-3">ABC 6 kg</td>
                          <td className="py-2 pr-3">Basement 1 · Pump Room</td>
                          <td className="py-2 font-medium">15 Dec 2026</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-3 font-mono font-semibold">EXT-002</td>
                          <td className="py-2 pr-3">CO2 4.5 kg</td>
                          <td className="py-2 pr-3">Floor 2 · Panel Room</td>
                          <td className="py-2 font-medium">22 Dec 2026</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-3 font-mono font-semibold">HYD-008</td>
                          <td className="py-2 pr-3">Landing Valve</td>
                          <td className="py-2 pr-3">Tower A · Staircase 2</td>
                          <td className="py-2 font-medium">04 Jan 2027</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </LightBrowserFrame>
            </AppleReveal>
          </div>

          {/* ROW 4: Visual Left · Text Right — 5-Page White-Label Form B & Email Due Digests */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <AppleReveal delayMs={70} className="lg:col-span-7 order-2 lg:order-1">
              <LightBrowserFrame url="app.vigilamc.com/report · 5-Page White-Label Form B">
                <div className="p-4 sm:p-6 bg-[#FFFDFB] grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch">
                  {/* White-label Form B Sheet Preview */}
                  <div className="sm:col-span-7 rounded-xl bg-white border border-[#E7E5E4] p-4 shadow-xs flex flex-col justify-between space-y-3">
                    <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#E7E5E4]">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C]">
                          Your Agency Letterhead &amp; Logo
                        </div>
                        <div className="text-xs font-bold text-[#1C1917] mt-0.5">
                          STATUTORY FORM B REPORT
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#FFF0E6] text-[#C2410C] text-[10px] font-bold">
                        Page 1 of 5
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-[#44403C]">
                      <div className="flex justify-between">
                        <span>Compliance Regime:</span>
                        <span className="font-semibold text-[#1C1917]">NBC 2016 · IS 2190</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GPS &amp; Photo Log:</span>
                        <span className="font-semibold text-[#047857]">Included</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Signatory Block:</span>
                        <span className="font-semibold text-[#1C1917]">Your Seal &amp; Signature</span>
                      </div>
                    </div>
                  </div>

                  {/* Client Email Digest Card */}
                  <div className="sm:col-span-5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] p-4 flex flex-col justify-between space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#C2410C]">
                      <Mail className="w-4 h-4" aria-hidden="true" />
                      <span>Due-Date Email Digest</span>
                    </div>
                    <div className="text-xs text-[#1C1917] leading-relaxed">
                      Automated 30, 15 &amp; 7-day due-date alerts and Form B PDF delivery emails sent straight to building managers.
                    </div>
                    <div className="text-[11px] font-semibold text-[#047857]">
                      Delivery status tracked
                    </div>
                  </div>
                </div>
              </LightBrowserFrame>
            </AppleReveal>

            <AppleReveal className="lg:col-span-5 space-y-4 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF8F2] border border-[#FED7AA] text-xs font-bold text-[#C2410C]">
                <FileCheck2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>White-Label Form B &amp; Email Digests</span>
              </div>
              <h3 className="font-sans font-bold text-[26px] sm:text-[32px] leading-[1.15] tracking-[-0.02em] text-[#1C1917]">
                5-page white-label Form B reports &amp; automatic client alerts.
              </h3>
              <p className="text-[16px] text-[#44403C] leading-relaxed">
                Generate 5-page Form B compliance reports stamped with <strong>your</strong> agency logo, license number, and digital signature, and send due-date alerts and email digests to clients automatically.
              </p>
              <div className="pt-2">
                <Link
                  href="/sample-report"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#C2410C] hover:text-[#9A3412] underline underline-offset-4"
                >
                  <span>Inspect a live sample Form B report</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </AppleReveal>
          </div>
        </div>

        {showDemoCta && (
          <div className="mt-14 text-center">
            <Link
              href="/contact"
              className="btn-flame min-h-[48px] px-7 py-3 rounded-2xl text-white font-bold text-[15px] inline-flex items-center justify-center gap-2 shadow-[0_12px_28px_-8px_rgba(194,65,12,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
            >
              <span>Book a Free Demo</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminDashboardSection;
