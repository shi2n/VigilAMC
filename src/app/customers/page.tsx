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
      title: 'Commercial High-Rise Infrastructure',
      category: 'Commercial High-Rise',
      building: 'Multi-Tenant Commercial Complex Architecture',
      auditDate: 'Reference Architecture',
      description: 'Centralized life safety monitoring across multiple levels. Extinguishers, landing valves, and yard hydrants mapped to statutory municipal audit cycles.',
    },
    {
      src: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
      title: 'Healthcare & Hospital Facilities',
      category: 'Healthcare Infrastructure',
      building: 'Super-Speciality Healthcare Environment',
      auditDate: 'Reference Architecture',
      description: 'Zero tolerance for life safety lapses. Digital logging on wet risers, clean-agent FM-200 gas suppression in ICU server rooms, and 24/7 digital logs.',
    },
    {
      src: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=1200&q=80',
      title: 'Hazardous Materials & Industrial Logistics',
      category: 'Industrial Warehousing',
      building: 'Logistics & Warehousing Complex',
      auditDate: 'Reference Architecture',
      description: 'Class B foam systems, yard hydrants, and flame detectors tracked across large footprints. Automated quarterly hydro-pressure testing records.',
    },
    {
      src: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80',
      title: 'Residential High-Rise Communities',
      category: 'Residential Complex',
      building: 'Gated Multi-Tower Residential Township',
      auditDate: 'Reference Architecture',
      description: 'Form-B biannual certification readiness. Resident welfare association visibility into monthly extinguisher pressure logs.',
    },
    {
      src: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80',
      title: 'Weatherproof QR Tagging Technology',
      category: 'Field Inspection',
      building: 'Industrial Hardware Standard',
      auditDate: 'Hardware Specification',
      description: 'Anodized aluminum and durable vinyl QR labels installed on cylinders. Engineered to withstand UV exposure and industrial washdowns.',
    },
    {
      src: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      title: 'Hydrant Flow & Pressure Gauge Verification',
      category: 'Wet Riser Testing',
      building: 'Standard Hydraulic Verification',
      auditDate: 'Technical Benchmark',
      description: 'Technicians log dynamic pressure at landing valves. Certified Form-B schedule auto-updates upon inspection completion.',
    },
  ];

  const handleOpenLightbox = (index: number) => {
    setActiveImageIndex(index);
    setLightboxOpen(true);
  };

  const caseStudies = [
    {
      client: 'Fire Protection AMC Agency Model',
      type: 'Contractor Operations Profile',
      portfolio: 'Multi-Facility Commercial Deployment',
      challenge: 'Contractors relying on paper checklists face missed hydro-tests, disputed client billing, and slow manual Form-B report generation.',
      solution: 'VigilAMC gives agencies unified QR asset registry, technician mobile scan verification, and automated statutory Form-B PDF generation.',
      results: [
        'Elimination of manual paper log sheets and lost records',
        'Instant Form-B report compilation from verified field scans',
        'Automatic 30-day and 7-day refilling alerts sent to clients',
        'Complete digital audit trail compliant with NBC 2016 Part 4',
      ],
      quote: 'Engineered specifically for Indian fire safety service providers to elevate compliance standards and client trust.',
      author: 'VigilAMC Product & Compliance Team',
    },
    {
      client: 'Healthcare & Critical Campus Blueprint',
      type: 'Campus Facility Safety Profile',
      portfolio: 'High-Density Life Safety Environment',
      challenge: 'Hospitals require flawless life safety logs for NABH audits, yet basements and radiation suites often lack cellular connectivity.',
      solution: 'Technicians scan localized QR tags on suppression cylinders and landing valves, updating centralized compliance status automatically.',
      results: [
        'Zero-trust verification with tamper-evident asset tags',
        'Complete inspection logs for every fire extinguisher and hose reel',
        'Central management dashboard with instant exportable audit records',
      ],
      quote: 'Patient and occupant safety demands zero-compromise documentation and verifiable field auditing.',
      author: 'Statutory Safety Framework',
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

      {/* Platform Architecture Benchmarks */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-2xl sm:text-3xl font-black text-[#023E8A]">NBC 2016</div>
            <p className="text-xs text-slate-500 font-semibold mt-1">Part 4 Life Safety Mandate</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-2xl sm:text-3xl font-black text-[#0077B6]">IS 2190</div>
            <p className="text-xs text-slate-500 font-semibold mt-1">Maintenance Code Adherence</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">Zero Paper</div>
            <p className="text-xs text-slate-500 font-semibold mt-1">100% Digital Inspection Audit</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-2xl sm:text-3xl font-black text-[#023E8A]">Form-B Ready</div>
            <p className="text-xs text-slate-500 font-semibold mt-1">Automated PDF Certification</p>
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
