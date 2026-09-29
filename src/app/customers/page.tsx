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
  ZoomIn,
  AlertTriangle,
  Download
} from 'lucide-react';
import { ImageLightbox, LightboxImage } from '@/components/ImageLightbox';
import { StatusBadge } from '@/components/StatusBadge';

export default function CustomersPage() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const galleryImages: LightboxImage[] = [
    {
      src: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
      title: 'Commercial Multi-Tenant Complex',
      category: 'Reference Scenario [Sample]',
      building: 'Multi-Story High-Rise Facility (Representative)',
      auditDate: 'Inspection Scenario',
      description: 'Extinguishers, landing valves, and yard hydrants mapped to statutory municipal audit cycles with digital timestamps.',
    },
    {
      src: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
      title: 'Healthcare & Hospital Facilities',
      category: 'Healthcare Scenario [Sample]',
      building: 'Critical Care Healthcare Campus (Representative)',
      auditDate: 'Inspection Scenario',
      description: 'Systematic safety tracking with logging of wet risers, clean-agent suppression in server rooms, and digital records.',
    },
    {
      src: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=1200&q=80',
      title: 'Industrial Logistics & Warehouses',
      category: 'Industrial Scenario [Sample]',
      building: 'Logistics & Warehousing Complex (Representative)',
      auditDate: 'Inspection Scenario',
      description: 'Foam systems, yard hydrants, and flame detectors tracked across large industrial footprints with quarterly hydro-pressure schedules.',
    },
    {
      src: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80',
      title: 'Residential High-Rise Communities',
      category: 'Residential Scenario [Sample]',
      building: 'Multi-Tower Residential Society (Representative)',
      auditDate: 'Inspection Scenario',
      description: 'Form-B biannual certification readiness. Clear extinguisher pressure logs and defect reporting for resident welfare committees.',
    },
    {
      src: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80',
      title: 'Weatherproof Metallic QR Tagging',
      category: 'Hardware Benchmark [Sample]',
      building: 'Industrial Hardware Specification',
      auditDate: 'Hardware Specification',
      description: 'Anodized aluminum and durable vinyl QR labels installed on cylinders. Resistant to UV exposure, dust, and industrial washdowns.',
    },
    {
      src: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      title: 'Hydrant Flow & Pressure Verification',
      category: 'Testing Scenario [Sample]',
      building: 'Standard Hydraulic Verification',
      auditDate: 'Technical Benchmark',
      description: 'Technicians log dynamic pressure at landing valves. Certified Form-B schedule auto-updates upon inspection completion.',
    },
  ];

  const handleOpenLightbox = (index: number) => {
    setActiveImageIndex(index);
    setLightboxOpen(true);
  };

  const operationalProfiles = [
    {
      client: 'Fire Protection AMC Agency Profile [Representative]',
      type: 'Contractor Operations Scenario',
      portfolio: 'Multi-Facility Commercial Deployment',
      challenge: 'Agencies relying on handwritten paper checklists face lost records, disputed billing, and frantic manual Form-B report assembly before audit deadlines.',
      solution: 'VigilAMC equips field teams with serialized QR asset tags, mobile inspection checklists, and automated Form-B PDF generation.',
      results: [
        'Centralized digital asset inventory replacing fragmented spreadsheets',
        'Direct Form-B report compilation from timestamped field checks',
        'Automated 60-day, 30-day, and 7-day renewal notifications',
        'Structured equipment schedules aligned with IS 2190 guidelines',
      ],
    },
    {
      client: 'Critical Facility Maintenance Profile [Representative]',
      type: 'Campus Facility Operations Scenario',
      portfolio: 'High-Density Life Safety Environment',
      challenge: 'Healthcare and industrial sites require meticulous maintenance documentation, but basement pump rooms and shielded shafts lack cell reception.',
      solution: 'VigilAMC offline-capable mobile checklist allows technicians to record gauge levels, valve states, and photos locally with automatic cloud synchronization.',
      results: [
        'Uninterrupted offline logging in underground basements and pump rooms',
        'Verifiable physical inspection proof with tamper-resistant QR codes',
        'Centralized operations dashboard with instant PDF export capabilities',
      ],
    },
  ];

  return (
    <div className="w-full bg-white">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-ocean-50 to-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-white px-3.5 py-1.5 rounded-full border border-ocean-200 shadow-sm">
            Facility Scenarios &amp; Case Studies
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#023E8A] tracking-tight mt-4">
            Reference Facility Profiles &amp; Inspection Scenarios
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Explore how VigilAMC solves operational challenges across commercial towers, healthcare environments, industrial plants, and residential societies.
          </p>
        </div>
      </section>

      {/* Standards & Guidelines Overview */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-2xl sm:text-3xl font-black text-[#023E8A]">NBC 2016</div>
            <p className="text-xs text-slate-500 font-semibold mt-1">Part 4 Life Safety Framework</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-2xl sm:text-3xl font-black text-[#0077B6]">IS 2190</div>
            <p className="text-xs text-slate-500 font-semibold mt-1">BIS Maintenance Protocols</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">Digital QR</div>
            <p className="text-xs text-slate-500 font-semibold mt-1">Timestamped Physical Tagging</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-2xl sm:text-3xl font-black text-[#023E8A]">Form-B Ready</div>
            <p className="text-xs text-slate-500 font-semibold mt-1">Structured PDF Export</p>
          </div>
        </div>
      </section>

      {/* Interactive Lightbox Gallery Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-ocean-50 px-3 py-1 rounded-full border border-ocean-200">
            Field Inspection Gallery
          </span>
          <h2 className="text-3xl font-extrabold text-[#023E8A] mt-3">
            Operational Inspection Scenarios
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Click any field image below to inspect operational equipment categories and inspection workflows. [Sample Demonstration Data]
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => handleOpenLightbox(idx)}
              className="corp-card overflow-hidden group cursor-pointer bg-white transition-all transform hover:-translate-y-1.5 border border-slate-200"
            >
              <div className="relative h-56 overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/10 transition-colors" />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/95 text-[#023E8A] text-xs font-bold shadow-sm">
                  {img.category}
                </span>
                <div className="absolute bottom-3 right-3 p-2 rounded-lg bg-slate-900/80 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 shadow">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Inspect Flow</span>
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
                    Inspection Protocol
                  </span>
                  <span className="text-slate-400">{img.auditDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Representative Facility Profiles */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-white px-3.5 py-1.5 rounded-full border border-slate-200">
              Operational Scenarios
            </span>
            <h2 className="text-3xl font-extrabold text-[#023E8A] mt-3">
              Representative Operational Scenarios
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Representative facility profiles demonstrating how VigilAMC addresses common fire protection maintenance bottlenecks.
            </p>
          </div>

          {operationalProfiles.map((cs, i) => (
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
                  Operational Value Delivered
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
            </div>
          ))}

          {/* Testimonial Placeholder Card */}
          <div className="p-8 rounded-2xl bg-amber-50/60 border border-amber-200 text-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 text-xs font-bold">
                Pilot Partner Feedback
              </span>
              <StatusBadge status="DEMO" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Verified Customer Testimonials &bull; Coming Soon
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed italic">
              [ADD VERIFIED CUSTOMER TESTIMONIAL] &bull; We are currently conducting pilot programs with licensed fire protection agencies. Formal case studies, contractor quotes, and facility reference letters will be published with explicit partner consent as pilot cohorts conclude.
            </p>
          </div>
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
          <h2 className="text-3xl font-extrabold">Ready to Modernize Your Fire AMC Operations?</h2>
          <p className="text-cyan-100 text-sm max-w-xl mx-auto leading-relaxed">
            Join the free pilot cohort to test QR tagging, mobile checklists, and Form-B generation across up to 3 facilities.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/#pilot-section"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0077B6] hover:bg-white hover:text-[#023E8A] font-bold text-sm rounded-xl transition-all shadow-lg"
            >
              <span>Apply for Free Pilot</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sample-report"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition-all border border-white/20"
            >
              <Download className="w-4 h-4" />
              <span>Inspect Sample Form-B</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
