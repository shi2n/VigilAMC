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
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { AppleReveal } from './AppleReveal';

export function VideoExplainerSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  const videoSrc = '/videos/vigilamc-explainer.mp4';

  const transcript =
    "Still chasing Excel sheets and WhatsApp messages for fire safety AMCs? VigilAMC is built for Indian fire-safety agencies. Import your Excel asset register and set up monthly, quarterly, and annual AMC service cycles in minutes. Field technicians use the offline mobile app to take rear-camera photos stamped with GPS coordinates even in basements with no signal, record voice-to-text remarks in 10 Indian languages, and collect digital guard or client sign-offs. From there, generate 5-page NBC 2016 and IS 2190 statutory Form B reports with 30, 15, and 7-day due alerts, with no extra hardware to buy.";

  return (
    <section
      id="video-explainer"
      data-testid="video-explainer-section"
      aria-labelledby="video-explainer-heading"
      className="py-20 sm:py-28 bg-white border-t border-[#E7E5E4]"
    >
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        <AppleReveal className="text-center max-w-[700px] mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8F2] border border-[#FED7AA] mb-4">
            <Flame className="w-3.5 h-3.5 text-[#C2410C]" aria-hidden="true" />
            <span className="text-xs font-bold text-[#C2410C]">
              Quick product walkthrough
            </span>
          </div>
          <h2
            id="video-explainer-heading"
            className="font-sans font-bold text-[32px] sm:text-[42px] lg:text-[48px] leading-[1.1] tracking-[-0.03em] text-[#1C1917]"
          >
            See VigilAMC in action.
          </h2>
          <p className="mt-4 text-[17px] sm:text-[18px] text-[#44403C] max-w-[560px] mx-auto leading-relaxed">
            Watch how Indian fire-safety agencies connect field inspections, office scheduling, and Form B reports in one flow.
          </p>
        </AppleReveal>

        {/* Video Frame: Reserved 16:9 Aspect Ratio -> CLS 0 */}
        <div className="relative mx-auto max-w-[900px] rounded-3xl overflow-hidden border border-[#E7E5E4] shadow-[0_24px_60px_-24px_rgba(28,25,23,0.20)] bg-[#FFF8F2]">
          <div className="relative aspect-video w-full overflow-hidden">
            {!isPlaying ? (
              <div
                data-testid="video-facade-poster"
                className="relative w-full h-full group cursor-pointer flex items-center justify-center"
                onClick={() => {
                  setVideoError(false);
                  setIsPlaying(true);
                }}
              >
                <Image
                  src="/video-poster.jpg"
                  alt="VigilAMC product walkthrough video preview"
                  fill
                  priority={false}
                  quality={85}
                  sizes="(min-width: 1024px) 900px, 100vw"
                  className="object-cover"
                />

                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/15"
                />

                <div className="relative z-10 flex flex-col items-center gap-3">
                  <button
                    type="button"
                    aria-label="Play VigilAMC walkthrough video"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#C2410C] hover:bg-[#9A3412] text-white flex items-center justify-center shadow-lg transition-transform duration-150 hover:scale-105 cursor-pointer"
                  >
                    <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-white translate-x-0.5" />
                  </button>
                  <span className="text-white text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full bg-black/75 border border-white/20">
                    Watch walkthrough
                  </span>
                </div>
              </div>
            ) : videoError ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center bg-[#FFF8F2]">
                <p className="text-sm font-semibold text-[#1C1917]">
                  Unable to load the walkthrough video right now.
                </p>
                <button
                  type="button"
                  onClick={() => setVideoError(false)}
                  className="btn-flame px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  Retry playback
                </button>
              </div>
            ) : (
              <video
                src={videoSrc}
                poster="/video-poster.jpg"
                controls
                autoPlay
                playsInline
                preload="metadata"
                data-testid="explainer-video-player"
                aria-label="VigilAMC Fire Safety Operations Walkthrough"
                onError={() => setVideoError(true)}
                className="w-full h-full object-contain bg-[#1C1917]"
              />
            )}
          </div>
        </div>

        {/* Accessible Transcript Accordion */}
        <div className="mt-6 max-w-[900px] mx-auto">
          <div className="rounded-2xl border border-[#E7E5E4] bg-[#FFF8F2]/60 overflow-hidden">
            <button
              type="button"
              onClick={() => setTranscriptOpen((prev) => !prev)}
              data-testid="video-transcript-toggle"
              className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-[#1C1917] hover:text-[#C2410C] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#C2410C]" aria-hidden="true" />
                <span>Video Transcript &amp; Highlights</span>
              </span>
              {transcriptOpen ? (
                <ChevronUp className="w-4 h-4 text-[#44403C]" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#44403C]" aria-hidden="true" />
              )}
            </button>

            {transcriptOpen && (
              <div
                data-testid="video-transcript-content"
                className="px-5 pb-5 pt-3 text-xs sm:text-sm text-[#44403C] leading-relaxed border-t border-[#E7E5E4] space-y-2 bg-white"
              >
                <p className="italic">&ldquo;{transcript}&rdquo;</p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#44403C]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#047857]" aria-hidden="true" />
                    <span>Spoken Transcript</span>
                  </span>
                  <span>&bull;</span>
                  <span>Built for Fire-Safety Agencies Across India</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 text-center flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/contact"
            className="btn-flame min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm"
          >
            <span>Book a Free Demo</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            href="/demo"
            className="btn-ghost-flame min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-white"
          >
            <span>Explore Interactive Demo</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default VideoExplainerSection;
