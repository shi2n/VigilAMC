'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { XCircle, CheckCircle2 } from 'lucide-react';
import problemOwner from '../../../public/images/problem-owner.jpg';
import { refreshScroll } from '@/lib/scrollEngine';

/* Verified copy — do not edit without approval */
export const OLD_WAY = [
  'Paper registers that get lost, wet, or backdated the night before an inspection',
  'Technicians ticking "OK" from home without checking a single pressure gauge',
  'Scrambling for 3 days in Excel & WhatsApp when the Fire Officer or insurer asks for proof',
];

export const VIGIL_WAY = [
  'Live building dashboard — see every green (safe), amber (due soon), and red (expired) asset in 5 seconds',
  'GPS + Asset Tag ID + Floor/Zone checklist + live camera photo proves every visit is real',
  'One-click NBC 2016 & IS 2190 PDF report ready to hand to any Fire Officer or committee',
];

const BUBBLES = [
  {
    text: 'Did the technician actually visit?',
    initials: 'RS',
    who: 'Society secretary',
    avatarBg: 'linear-gradient(135deg,#FF8C42,#EA580C)',
    slot: 'left-3 top-3 sm:-left-6 sm:top-6',
    rot: -3,
    dur: 5.4,
    phase: -1.2,
    rate: 0.1,
  },
  {
    text: 'Where is the photo proof?',
    initials: 'IN',
    who: 'Insurance surveyor',
    avatarBg: 'linear-gradient(135deg,#C2410C,#9A3412)',
    slot: 'right-3 top-[34%] sm:-right-8 sm:top-[30%]',
    rot: 3,
    dur: 6.2,
    phase: -3.1,
    rate: 0.06,
  },
  {
    text: 'Fire Officer needs the report TODAY.',
    initials: 'FM',
    who: 'Facility manager',
    avatarBg: 'linear-gradient(135deg,#D97706,#B45309)',
    slot: 'left-4 bottom-4 sm:left-8 sm:-bottom-5',
    rot: -2,
    dur: 4.8,
    phase: -2.4,
    rate: 0.14,
  },
];

export function PainScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const resolveRef = useRef<HTMLDivElement>(null);
  const [sceneIn, setSceneIn] = useState(false);
  const [resolveIn, setResolveIn] = useState(false);

  useEffect(() => {
    refreshScroll();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSceneIn(true);
      setResolveIn(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target === sceneRef.current) setSceneIn(true);
          if (entry.target === resolveRef.current) setResolveIn(true);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
    );
    if (sceneRef.current) io.observe(sceneRef.current);
    if (resolveRef.current) io.observe(resolveRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="pain-scene"
      aria-labelledby="pain-heading"
      className="relative overflow-hidden py-12 sm:py-14 lg:py-14 border-t border-[#FED7AA]/60"
      style={{ background: 'linear-gradient(180deg, #FFF4EC 0%, #FFFFFF 55%, #FFF8F2 100%)' }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={sceneRef}
          data-sc-scene=""
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center"
        >
          {/* LEFT: the pain photo + question bubbles */}
          <div className="lg:col-span-5 relative mx-auto w-full max-w-[520px] lg:max-w-none">
            <div aria-hidden="true" className="glow-blob -inset-10" style={{ opacity: 0.8 }} />
            <div
              className="photo-tilt relative z-10 aspect-[4/3] rounded-3xl overflow-hidden border-[6px] border-white shadow-[0_36px_70px_-30px_rgba(28,25,23,0.38)]"
              style={{ '--photo-rot': '1.5deg' } as React.CSSProperties}
            >
              {/* Slow parallax on the photo itself (inset so edges never show) */}
              <div data-sc-parallax="0.04" className="absolute -inset-[10%]">
                <Image
                  src={problemOwner}
                  alt="Stressed building owner on a phone call at a desk covered in paper registers and inspection files"
                  fill
                  placeholder="blur"
                  quality={90}
                  sizes="(min-width: 1024px) 520px, 92vw"
                  className="object-cover object-[50%_40%]"
                />
              </div>
            </div>

            {BUBBLES.map((b, i) => (
              <div
                key={b.text}
                data-testid={`pain-bubble-${i + 1}`}
                data-sc-parallax={b.rate}
                className={`fly-slot z-20 ${b.slot}`}
              >
                <div
                  className={`fly-enter ${sceneIn ? 'is-in' : ''}`}
                  style={
                    {
                      '--fly-rot': `${b.rot}deg`,
                      '--fly-delay': `${200 + i * 260}ms`,
                      '--fly-from-x': '0px',
                      '--fly-from-y': '18px',
                    } as React.CSSProperties
                  }
                >
                  <div
                    className="fly-idle"
                    style={{ '--fly-dur': `${b.dur}s`, '--fly-phase': `${b.phase}s` } as React.CSSProperties}
                  >
                    <div className="q-bubble flex items-center gap-2.5 pl-2 pr-3.5 py-2">
                      <span
                        aria-hidden="true"
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ background: b.avatarBg }}
                      >
                        {b.initials}
                      </span>
                      <span className="leading-tight">
                        <span className="block text-[12px] sm:text-[13px] font-semibold text-[#1C1917] whitespace-nowrap">
                          {b.text}
                        </span>
                        <span className="block text-[10.5px] text-[#57534E] whitespace-nowrap">{b.who}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: headline + verified "old way" lines */}
          <div className={`lg:col-span-7 sc-reveal ${sceneIn ? 'is-visible' : ''}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DC2626]/10 border border-[#DC2626]/25 text-xs font-bold text-[#991B1B] mb-4">
              <XCircle className="w-4 h-4 text-[#DC2626]" />
              <span>THE OLD WAY · PAPER LOGBOOKS &amp; WHATSAPP</span>
            </div>
            <h2
              id="pain-heading"
              className="font-display font-bold tracking-[-0.02em] text-[#1C1917] text-[clamp(1.6rem,3vw,2.35rem)] leading-[1.15] max-w-[22ch]"
            >
              Your agency shouldn&rsquo;t run on paper registers and WhatsApp proofs.
            </h2>
            <ul className="mt-5 space-y-3">
              {OLD_WAY.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm sm:text-[15px] text-[#44403C] leading-relaxed">
                  <XCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Resolution row: verified "VigilAMC way" wins */}
        <div ref={resolveRef} className="mt-12 sm:mt-14">
          <div className="flex items-center justify-center lg:justify-start mb-3.5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#059669]/15 border border-[#059669]/30 text-xs font-bold text-[#065F46]">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              THE VIGILAMC WAY · LIVE PROOF IN 10 SECONDS
            </span>
          </div>
          <ul data-testid="vigil-way-row" className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            {VIGIL_WAY.map((item, i) => (
              <li
                key={item}
                style={{ transitionDelay: `${i * 90}ms`, background: 'rgba(255,255,255,0.72)' }}
                className={`sc-spring ${resolveIn ? 'is-visible' : ''} glass-panel rounded-2xl px-4 py-3.5 flex items-start gap-2.5 text-sm text-[#1C1917] font-medium leading-relaxed`}
              >
                <span className="w-6 h-6 rounded-full bg-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default PainScene;
