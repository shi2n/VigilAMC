// UI 'unslop' pass method by Damir Sokolovsky (@heydamir) — github.com/heydamir/unslop (CC BY 4.0)
'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Smartphone,
  WifiOff,
  MapPin,
  BellRing,
  CheckCircle2,
  Mic,
  ShieldCheck,
} from 'lucide-react';
import { GooglePlayBadge } from '@/components/GooglePlayBadge';
import { AppStoreBadge } from '@/components/AppStoreBadge';

const BULLETS = [
  '100% offline inspections & checklists — auto-sync on reconnect',
  'GPS-stamped photo evidence (date, time & coordinates burned in)',
  'Push alerts for new tasks & due-soon reminders',
  'Task history, visit stamps & digital guard signatures',
  '10 Indian languages with voice-to-text remarks',
];

export function FieldAppSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setRevealed(true);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.1 }
    );
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="field-app"
      ref={sectionRef}
      data-testid="homepage-app-section"
      aria-labelledby="field-app-heading"
      className="relative py-12 sm:py-16 lg:py-20 overflow-hidden border-t border-[#FED7AA]/70"
      style={{
        background:
          'linear-gradient(180deg, #FFFFFF 0%, #FFF8F2 50%, #FFF0E6 100%)',
      }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`sc-reveal ${
            revealed ? 'is-visible' : ''
          } glass-panel rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#FED7AA]`}
          style={{ background: 'rgba(255, 255, 255, 0.72)' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Copy + Exact Claims + Official Badges */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-xs font-semibold text-[#C2410C] shadow-xs">
                <Smartphone className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Mobile app · Android live · iOS App Store soon</span>
              </div>

              <h2
                id="field-app-heading"
                className="font-display font-bold tracking-[-0.02em] text-[#1C1917] text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.12]"
              >
                Your technicians deserve a real field app<span className="text-[#EA580C]">.</span>
              </h2>

              <p className="text-sm sm:text-base text-[#44403C] leading-relaxed max-w-2xl">
                VigilAMC Field — the offline-first mobile app for fire-safety technicians across India. Live on Android, with Apple App Store rolling out soon. Included free with every VigilAMC workspace.
              </p>

              <ul className="space-y-3 pt-1">
                {BULLETS.map((claim) => (
                  <li
                    key={claim}
                    className="flex items-start gap-2.5 text-sm sm:text-[15px] font-medium text-[#1C1917]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                    <span>{claim}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-3 flex flex-wrap items-center gap-3 sm:gap-4">
                <GooglePlayBadge size="lg" theme="dark" />
                <AppStoreBadge size="lg" theme="dark" comingSoon />
                <span className="text-xs font-medium text-[#44403C] block w-full sm:w-auto">
                  Android 8.0+ (Live) · iOS 15.0+ (App Store Soon) · Free with agency account
                </span>
              </div>
            </div>

            {/* Right Column: Lit-Glass Field App Preview Card (CLS 0 fixed structure) */}
            <div className="lg:col-span-5">
              <div
                className="glass-panel-dense rounded-2xl p-5 sm:p-6 border border-[#FED7AA] space-y-4 shadow-[0_20px_50px_-20px_rgba(232,89,12,0.20)]"
                style={{ background: 'rgba(255, 255, 255, 0.88)' }}
              >
                {/* App Header Bar */}
                <div className="flex items-center justify-between pb-3.5 border-b border-[#FED7AA]/70">
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/brand/logo-tile-192.png"
                      alt="VigilAMC Field Icon"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-xl object-cover shadow-xs shrink-0"
                    />
                    <div>
                      <div className="font-display font-bold text-sm text-[#1C1917]">
                        VigilAMC Field
                      </div>
                      <div className="text-[11px] font-medium text-[#44403C]">
                        Technician Mobile App · Android &amp; iOS (Soon)
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D1FAE5] text-[#059669] text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                    Offline Ready
                  </span>
                </div>

                {/* Live Field Feature Cards */}
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-[#FFF8F2] border border-[#FED7AA]/80 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center text-[#C2410C] shrink-0">
                      <WifiOff className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#1C1917]">
                        Basement &amp; Pump-Room Outbox
                      </div>
                      <div className="text-[11px] text-[#44403C]">
                        Saves checks locally with zero signal; auto-syncs on reconnect
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FFF8F2] border border-[#FED7AA]/80 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center text-[#C2410C] shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#1C1917]">
                        Burned-In Geo &amp; Timestamp Watermark
                      </div>
                      <div className="text-[11px] text-[#44403C]">
                        Live camera capture with coordinates, date &amp; time stamped
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FFF8F2] border border-[#FED7AA]/80 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center text-[#C2410C] shrink-0">
                      <BellRing className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#1C1917]">
                        Instant FCM Task Dispatch
                      </div>
                      <div className="text-[11px] text-[#44403C]">
                        Push notifications for assigned work orders &amp; due-soon checks
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FFF8F2] border border-[#FED7AA]/80 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center text-[#C2410C] shrink-0">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#1C1917]">
                        10 Indian Languages + Voice Mic
                      </div>
                      <div className="text-[11px] text-[#44403C]">
                        Speak inspection remarks in Hindi, Marathi, Tamil, Telugu &amp; more
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Trust Strip */}
                <div className="pt-2 border-t border-[#FED7AA]/60 flex items-center justify-between text-[11px] font-semibold text-[#44403C]">
                  <span className="inline-flex items-center gap-1.5 text-[#059669]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Staff ID + 6-Digit PIN Login
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#C2410C]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    No QR Stickers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FieldAppSection;
