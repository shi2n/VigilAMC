'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Award,
  ArrowRight,
  Star,
  Quote,
  TrendingUp,
  Clock,
  Sparkles,
  ExternalLink,
  ZoomIn
} from 'lucide-react';
import { ImageLightbox, LightboxImage } from '@/components/ImageLightbox';

export default function CustomersPage() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const galleryImages: LightboxImage[] = [
    {
      src: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
      title: 'Prestige CyberTech Park — 42 Floors',
      category: 'Commercial High-Rise',
      building: 'Prestige CyberTech Tower A & B, Bengaluru',
      auditDate: 'September 2026',
      description: '1,450 life safety assets monitored. Extinguishers, landing valves, and yard hydrants 100% compliant during surprise municipal Fire Directorate audit.',
    },
    {
      src: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
      title: 'MetroHealth Super-Speciality Hospital',
      category: 'Healthcare Infrastructure',
      building: 'MetroHealth Central Hospital, Mumbai',
      auditDate: 'August 2026',
      description: 'Zero tolerance for life safety lapses. Real-time telemetry on wet risers, clean-agent FM-200 gas suppression in ICU server rooms, and 24/7 digital logs.',
    },
    {
      src: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=1200&q=80',
      title: 'Apex Industrial Chemical Logistics Hub',
      category: 'Hazardous Materials & Warehousing',
      building: 'Apex Logistics Mega-Hub, Pune',
      auditDate: 'September 2026',
      description: 'Class B foam systems, yard hydrants, and flame detectors tracked across 450,000 sq ft. Automated quarterly hydro-pressure testing records.',
    },
    {
      src: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80',
      title: 'Greenfield Heights Residential Township',
      category: 'Residential Complex',
      building: 'Greenfield Heights (18 Towers), Gurugram',
      auditDate: 'September 2026',
      description: 'All 18 towers certified for Form-B biannual submission. Resident committee dashboard with transparent monthly extinguisher pressure logs.',
    },
    {
      src: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80',
      title: 'Weatherproof Metal QR Tagging in Action',
      category: 'Field Inspection',
      building: 'Orion Global Tech Hub, Hyderabad',
      auditDate: 'August 2026',
      description: 'Anodized aluminum QR label installed on CO2 cylinder. Withstands UV exposure and industrial washdowns.',
    },
    {
      src: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      title: 'Hydrant Flow & Pressure Gauge Verification',
      category: 'Wet Riser Testing',
      building: 'Starlight Commercial Tower, Navi Mumbai',
      auditDate: 'September 2026',
      description: 'Technician logged 7.5 Bar dynamic pressure using digital transducer sync. Certified Form-B schedule auto-updated.',
    },
  ];

  const handleOpenLightbox = (index: number) => {
    setActiveImageIndex(index);
    setLightboxOpen(true);
  };

  const caseStudies = [
    {
      client: 'SafeShield Engineering & Services',
      type: 'Leading Fire Safety AMC Contractor',
      portfolio: '38 Commercial Buildings &bull; 8,200 Assets',
      challenge: 'Previously relied on paper logs and Excel sheets. Lost a major IT park client when an overdue hydrostatic test was flagged during a Fire Directorate inspection.',
      solution: 'Deployed VigilAMC across their entire 24-technician team. Tagged all 8,200 assets with serialized QR stickers in 3 weeks.',
      results: [
        '100% on-time audit completion across all 38 facilities',
        '0 client churn in the last 24 months',
        'Form-B certification time cut from 4 days to 3 seconds',
        'Increased spare refilling revenue by 42% through automated defect alerts',
      ],
      quote: 'VigilAMC turned compliance from our biggest liability into our strongest competitive sales weapon. We now show our prospective clients our live dashboard during sales pitches.',
      author: 'Anand R. Verma, Managing Director',
    },
    {
      client: 'CarePoint Healthcare System',
      type: 'Multi-Location Hospital Network',
      portfolio: '4 Super-Speciality Hospitals &bull; 1,850 Assets',
      challenge: 'NABH and municipal fire safety regulations require immaculate audit trails. Basement medical gas plants and ICU wards have zero cell reception.',
      solution: 'Equipped in-house facility engineers with the VigilAMC offline mobile app. Integrated clean-agent FM-200 and sprinkler valve audits.',
      results: [
        'Passed NABH Life Safety audit with zero non-conformances',
        'Offline mobile audits ensure zero gaps in underground radiation bunkers',
        'Executive clinical dashboard provides 24/7 live fire safety scores',
      ],
      quote: 'In our hospitals, patient safety is sacred. VigilAMC gives our board complete transparency over every extinguisher, valve, and smoke sensor across all 4 campuses.',
      author: 'Dr. Sneha Desai, Chief of Infrastructure',
    },
  ];

  return (
    <div className="w-full bg-white">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-ocean-50 to-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-white px-3.5 py-1.5 rounded-full border border-ocean-200 shadow-sm">
            Customer Success Stories
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#023E8A] tracking-tight mt-4">
            How Fire AMC Leaders Guarantee 100% Audit Success
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Discover how leading AMC agencies and facility management corporations eliminated Excel errors, automated statutory Form-B filings, and locked in client contracts.
          </p>
        </div>
      </section>

      {/* Aggregate Impact Stats */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-3xl sm:text-4xl font-black text-[#023E8A]">100%</div>
            <p className="text-xs text-slate-500 font-semibold mt-1">Fire NOC Audit Pass Rate</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-3xl sm:text-4xl font-black text-[#0077B6]">78%</div>
            <p className="text-xs text-slate-500 font-semibold mt-1">Faster Audit Execution</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-3xl sm:text-4xl font-black text-emerald-600">0</div>
            <p className="text-xs text-slate-500 font-semibold mt-1">Missed Statutory Deadlines</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-3xl sm:text-4xl font-black text-[#023E8A]">450+</div>
            <p className="text-xs text-slate-500 font-semibold mt-1">Towers Managed on Autopilot</p>
          </div>
        </div>
      </section>

      {/* Interactive Image Lightbox Gallery Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-ocean-50 px-3 py-1 rounded-full border border-ocean-200">
            Field Verification Gallery
          </span>
          <h2 className="text-3xl font-extrabold text-[#023E8A] mt-3">
            Real Audits &bull; Real Hardware &bull; Real Compliance
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Click any field image below to launch the high-resolution lightbox inspector with verified audit metadata.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => handleOpenLightbox(idx)}
              className="corp-card overflow-hidden group cursor-pointer bg-white transition-all transform hover:-translate-y-1.5"
            >
              <div className="relative h-56 overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/10 transition-colors" />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/95 text-[#023E8A] text-xs font-bold shadow-sm">
                  {img.category}
                </span>
                <div className="absolute bottom-3 right-3 p-2 rounded-lg bg-slate-900/80 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 shadow">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Inspect Audit</span>
                </div>
              </div>

              <div className="p-5">
                <h4 className="text-base font-bold text-slate-900 group-hover:text-[#0077B6] transition-colors">
                  {img.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {img.building}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified On-Site
                  </span>
                  <span className="text-slate-400">{img.auditDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* In-Depth Case Studies */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-[#023E8A]">
              Detailed Enterprise Case Studies
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              See the measurable impact of replacing manual processes with VigilAMC.
            </p>
          </div>

          {caseStudies.map((cs, i) => (
            <div key={i} className="corp-card p-8 sm:p-10 bg-white border-slate-200 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-[#0077B6]">
                    {cs.type}
                  </span>
                  <h3 className="text-2xl font-black text-[#023E8A] mt-1">{cs.client}</h3>
                </div>
                <span className="px-3.5 py-1.5 rounded-full bg-ocean-50 text-[#0077B6] text-xs font-bold border border-ocean-200 self-start sm:self-auto">
                  {cs.portfolio}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 text-xs sm:text-sm">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                    The Challenge
                  </h4>
                  <p className="text-slate-600 leading-relaxed">{cs.challenge}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                    The VigilAMC Solution
                  </h4>
                  <p className="text-slate-600 leading-relaxed">{cs.solution}</p>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-[#023E8A] uppercase tracking-wider text-xs mb-3">
                  Verified Business Impact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                  {cs.results.map((res, rIdx) => (
                    <div key={rIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{res}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex items-start gap-3">
                <Quote className="w-6 h-6 text-[#0077B6] shrink-0 opacity-40" />
                <p className="text-xs sm:text-sm italic text-slate-600 leading-relaxed">
                  &ldquo;{cs.quote}&rdquo; — <strong className="text-slate-800 font-semibold">{cs.author}</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      <ImageLightbox
        images={galleryImages}
        initialIndex={activeImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Bottom CTA */}
      <section className="py-20 px-4 bg-[#023E8A] text-white text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl font-extrabold">Ready to Join the Zero-Failure Club?</h2>
          <p className="text-cyan-100 text-sm">
            Put your fire safety inventory on autopilot with a 14-day free pilot.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0077B6] hover:bg-white hover:text-[#023E8A] font-bold text-sm rounded-xl transition-all shadow-lg"
            >
              <span>Get Your Free AMC Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
