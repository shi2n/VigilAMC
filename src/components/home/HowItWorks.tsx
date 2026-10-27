'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image, { type StaticImageData } from 'next/image';
import {
  BellRing,
  Smartphone,
  FileCheck2,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import scenePump from '../../../public/images/scene-pump.jpg';
import sceneGps from '../../../public/images/scene-gps.jpg';
import sceneSignoff from '../../../public/images/scene-signoff.jpg';

interface Step {
  number: string;
  title: string;
  summary: string;
  proofPill: string;
  icon: typeof BellRing;
  photo: StaticImageData;
  photoAlt: string;
  photoPosition: string;
  badge: string;
  badgeRot: number;
}

/* Verified step copy — titles + body text unchanged */
const STEPS: Step[] = [
  {
    number: '01',
    title: 'Before the Visit — Automatic Reminders',
    summary:
      'VigilAMC remembers every cylinder, alarm, and pump expiry date for you — and sends WhatsApp & email alerts 30, 15, and 7 days before anything expires.',
    proofPill: 'No more forgotten spreadsheets',
    icon: BellRing,
    photo: scenePump,
    photoAlt: 'Fire technician reviewing a tablet beside red fire pumps and pressure gauges in a pump room',
    photoPosition: 'object-[40%_35%]',
    badge: '30/15/7-day alerts',
    badgeRot: -3,
  },
  {
    number: '02',
    title: 'On Site — Proof the Technician Was Really There',
    summary:
      'Your technician opens the mobile checklist at the building. The app locks GPS within 20 metres, takes a live camera photo of the pressure gauge, and supports voice-to-text remarks.',
    proofPill: 'GPS + Asset Tag ID + Camera Photo Proof',
    icon: Smartphone,
    photo: sceneGps,
    photoAlt: 'Technician holding a phone next to a red hydrant landing valve on a rooftop at golden hour',
    photoPosition: 'object-[55%_45%]',
    badge: 'GPS · Camera · Voice',
    badgeRot: 2,
  },
  {
    number: '03',
    title: 'Instant Certificate — Audit-Ready PDF in 10 Seconds',
    summary:
      'The moment the technician and building manager sign on screen, VigilAMC builds your NBC 2016 / IS 2190 compliant Fire Safety Certificate — ready for fire officers and insurers.',
    proofPill: 'Shareable link + printable A4 PDF',
    icon: FileCheck2,
    photo: sceneSignoff,
    photoAlt: 'Facility manager signing on a tablet held by a fire technician in a bright building lobby',
    photoPosition: 'object-[50%_45%]',
    badge: 'Dual-signed · Tamper-evident',
    badgeRot: -2,
  },
];

export function HowItWorks() {
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
      { rootMargin: '0px 0px -15% 0px', threshold: 0.08 }
    );
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      aria-labelledby="how-it-works-heading"
      className="relative py-12 sm:py-14 lg:py-14 overflow-hidden border-t border-[#FED7AA]/70"
      style={{
        background: 'linear-gradient(180deg, #FFF8F2 0%, #FFF4EC 50%, #FFEBDD 100%)',
      }}
    >
      <div aria-hidden="true" className="glow-blob top-[30%] left-[8%] w-[440px] h-[380px]" />
      <div aria-hidden="true" className="glow-blob top-[34%] right-[8%] w-[460px] h-[380px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Plain-language explainer (comprehension anchor — position unchanged) */}
        <div
          className={`sc-reveal ${revealed ? 'is-visible' : ''} glass-panel-dense max-w-4xl mx-auto mb-10 rounded-2xl p-5 sm:p-6 border-l-4 !border-l-[#EA580C]`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 mb-3 border-b border-[#1C1917]/10">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#C2410C]">
              <Sparkles className="w-4 h-4 text-[#EA580C]" />
              <span>Wait — What is a &ldquo;Fire AMC&rdquo; in plain English?</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-xs font-semibold text-[#C2410C] w-fit">
              <ShieldAlert className="w-3.5 h-3.5" />
              Mandatory by Indian Fire Law
            </span>
          </div>
          <p className="text-sm sm:text-[15px] text-[#1C1917] leading-relaxed font-medium">
            An <strong className="font-bold text-[#C2410C]">AMC (Annual Maintenance Contract)</strong> is a yearly promise that a trained fire technician will inspect every extinguisher, smoke detector, hydrant valve, and water pump in a building every quarter.{' '}
            <span className="text-[#44403C] font-normal">
              If a check is skipped or faked on paper, equipment can fail during a real fire — and the building risks losing its Fire NOC or insurance payout. VigilAMC makes every check automatic, honest, and provable.
            </span>
          </p>
        </div>

        {/* Section heading */}
        <div
          style={{ transitionDelay: '60ms' }}
          className={`sc-reveal ${revealed ? 'is-visible' : ''} text-center max-w-3xl mx-auto mb-9`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#FED7AA] text-xs font-bold uppercase tracking-wider text-[#C2410C] mb-3 backdrop-blur-sm">
            Simple 3-Step Story
          </div>
          <h2
            id="how-it-works-heading"
            className="font-display font-bold tracking-[-0.02em] text-[#1C1917] text-[clamp(1.6rem,3vw,2.35rem)] leading-[1.15]"
          >
            How VigilAMC Keeps Every Building Safe — Step by Step
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-[#44403C]">
            No complicated training. No hardware stickers that peel off. Just three clear steps from reminder to certificate.
          </p>
        </div>

        {/* 3 step cards: photo header + flying badge + glass body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <article
                key={step.number}
                data-testid={`step-card-${step.number}`}
                style={{ transitionDelay: `${120 + index * 70}ms`, background: 'rgba(255, 255, 255, 0.62)' }}
                className={`sc-reveal-step ${revealed ? 'is-visible' : ''} glass-panel group relative rounded-3xl flex flex-col`}
              >
                {/* Photo header strip */}
                <div className="relative h-[132px] sm:h-[150px] rounded-t-3xl overflow-hidden">
                  <Image
                    src={step.photo}
                    alt={step.photoAlt}
                    fill
                    placeholder="blur"
                    sizes="(min-width: 1024px) 400px, 92vw"
                    className={`object-cover ${step.photoPosition} transition-transform duration-700 ease-out group-hover:scale-[1.04]`}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(180deg, rgba(28,25,23,0) 50%, rgba(28,25,23,0.22) 100%)' }}
                  />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C2410C] text-white font-display font-bold text-xs tracking-wide shadow-md">
                    STEP {step.number}
                  </span>
                </div>

                {/* Flying badge overlapping the photo corner */}
                <div className="absolute right-4 top-[112px] sm:top-[128px] z-20">
                  <div
                    className="fly-idle"
                    style={{ '--fly-dur': `${5 + index * 0.7}s`, '--fly-phase': `${-index * 1.3}s` } as React.CSSProperties}
                  >
                    <div
                      className="float-card inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#9A3412] whitespace-nowrap"
                      style={{ transform: `rotate(${step.badgeRot}deg)` }}
                    >
                      <Icon className="w-3.5 h-3.5 text-[#EA580C]" />
                      {step.badge}
                    </div>
                  </div>
                </div>

                {/* Glass body */}
                <div className="p-5 sm:p-6 pt-6 sm:pt-7 flex flex-col flex-1">
                  <h3 className="font-display font-bold text-lg text-[#1C1917] mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#44403C] leading-relaxed mb-4">{step.summary}</p>
                  <div className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#9A3412]">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                    <span>{step.proofPill}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* E3: verified trust line */}
        <div
          style={{ transitionDelay: '320ms' }}
          className={`sc-reveal ${revealed ? 'is-visible' : ''} mt-8 flex justify-center`}
        >
          <p
            data-testid="whatsapp-trust-line"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 border border-[#FED7AA] text-sm font-semibold text-[#1C1917] shadow-sm"
          >
            <MessageCircle className="w-4 h-4 text-[#059669]" />
            If you can use WhatsApp, you can run VigilAMC.
          </p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
