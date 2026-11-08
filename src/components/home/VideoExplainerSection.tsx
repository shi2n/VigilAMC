// UI 'unslop' pass method by Damir Sokolovsky (@heydamir) — github.com/heydamir/unslop (CC BY 4.0)
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Play,
  Volume2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Flame,
} from 'lucide-react';

export function VideoExplainerSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  const videoId = 'qNqN0RMSZ44';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;

  const transcript =
    "Managing fire safety shouldn't mean endless paperwork and missed deadlines. Meet VigilAMC — your smarter way to manage fire safety operations. Manage clients, buildings, and fire safety equipment from one dashboard. Track asset records, maintenance schedules, and upcoming expiry dates effortlessly. Empower technicians with mobile inspections: capture GPS-verified visits, live photo evidence, voice-to-text remarks, and digital signatures directly from the field. Generate professional fire safety reports and manage your operations smarter. VigilAMC — built for fire safety AMC agencies across India. Start your free 30-day pilot.";

  return (
    <section
      id="video-explainer"
      data-testid="video-explainer-section"
      className="py-16 sm:py-24 bg-white border-t border-slate-200/80 relative"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF0E6] border border-[#FED7AA] shadow-[0_1px_3px_rgba(28,25,23,0.05)] mb-4">
            <Flame className="w-3.5 h-3.5 text-[#C2410C]" />
            <span className="text-xs font-semibold text-[#C2410C]">
              40-second service explainer
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#1C1917]">
            How fire-safety agencies run on VigilAMC<span className="text-[#EA580C]">.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#44403C] leading-relaxed">
            Watch how modern fire AMC teams eliminate paperwork, verify physical visits with live GPS, and print statutory
            reports in seconds.
          </p>
        </div>

        {/* Video Facade Container: Reserved 16:9 Aspect Ratio to Guarantee Zero CLS */}
        <div className="relative mx-auto max-w-4xl rounded-2xl sm:rounded-3xl overflow-hidden glass-panel border border-[#FED7AA]/80 shadow-[0_24px_60px_-20px_rgba(28,25,23,0.22)] bg-[#1C1917]">
          {/* 16:9 Reserved Aspect-Ratio Box */}
          <div className="relative aspect-video w-full overflow-hidden">
            {!isPlaying ? (
              <div
                data-testid="video-facade-poster"
                className="relative w-full h-full group cursor-pointer flex items-center justify-center"
                onClick={() => setIsPlaying(true)}
              >
                {/* Local Poster Image (Zero External Hotlink at Runtime) */}
                <Image
                  src="/video-poster.jpg"
                  alt="VigilAMC 40-second service explainer video preview"
                  fill
                  priority={false}
                  quality={85}
                  sizes="(min-width: 1024px) 896px, 100vw"
                  className="object-cover group-hover:scale-102 transition-transform duration-300"
                />

                {/* Dark Vignette Overlay */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/30 group-hover:bg-black/30 transition-colors"
                />

                {/* Central Play Button Overlay */}
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <button
                    type="button"
                    aria-label="Play VigilAMC product explainer video"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#C2410C] hover:bg-[#9A3412] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-[background-color,box-shadow,transform] duration-180 hover:scale-105 cursor-pointer"
                  >
                    <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-white translate-x-0.5" />
                  </button>
                  <span className="text-white text-xs sm:text-sm font-semibold tracking-normal px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20">
                    Watch in 40 seconds
                  </span>
                </div>

                {/* Video Info Pill Bottom-Left */}
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 flex items-center gap-2 text-white/90 text-xs font-medium bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                  <Volume2 className="w-3.5 h-3.5 text-[#FF8C42]" />
                  <span>Click to play with audio (HD)</span>
                </div>
              </div>
            ) : (
              /* Privacy-Enhanced YouTube Embed (Loaded strictly on explicit user action) */
              <iframe
                src={embedUrl}
                title="VigilAMC — Smarter Fire Safety Operations"
                data-testid="youtube-embed-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0 rounded-2xl sm:rounded-3xl"
              />
            )}
          </div>
        </div>

        {/* Video Transcript Accordion (SEO + Accessibility) */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setTranscriptOpen((prev) => !prev)}
              data-testid="video-transcript-toggle"
              className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-800 hover:text-[#C2410C] hover:bg-slate-100/60 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#EA580C]" />
                <span>Video Transcript &amp; Spoken Highlights</span>
              </span>
              {transcriptOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {transcriptOpen && (
              <div
                data-testid="video-transcript-content"
                className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200 space-y-2 bg-white"
              >
                <p className="italic text-slate-700">&ldquo;{transcript}&rdquo;</p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Real Spoken Audio Transcript</span>
                  </span>
                  <span>&bull;</span>
                  <span>Duration: 40 seconds</span>
                  <span>&bull;</span>
                  <span>Target: Fire Safety AMC Agencies Across India</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section Call to Action (Aligned with video outro: "Start your free 30-day pilot") */}
        <div className="mt-10 text-center">
          <Link
            href="/login"
            data-testid="video-cta-pilot"
            className="btn-flame inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm shadow-[0_10px_25px_-5px_rgba(234,88,12,0.4)]"
          >
            <span>Start your free 30-day pilot</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-[#78716C] mt-2 font-medium">
            1-building pilot onboarded in 24 hours &bull; No hardware or credit card required
          </p>
        </div>
      </div>
    </section>
  );
}
