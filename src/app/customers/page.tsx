'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Award,
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink,
  ZoomIn,
  AlertTriangle,
  Download,
  Flame,
  Gauge,
  Activity,
  BellRing
} from 'lucide-react';
import { ImageLightbox, LightboxImage } from '@/components/ImageLightbox';
import { StatusBadge } from '@/components/StatusBadge';

export default function CustomersPage() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const galleryImages: LightboxImage[] = [
    {
      id: 'extinguishers',
      title: 'Portable Fire Extinguishers (IS 2190)',
      category: 'IS 2190 Protocol',
      specs: '6kg ABC Powder / 4.5kg CO2 / 9L Water Mist',
      building: 'Commercial Multi-Tenant Complex (Representative)',
      auditDate: 'Quarterly Physical Inspection + Annual Refill Log',
      reading: '14.5 Bar [NORMAL]',
      description: 'Extinguishers, landing valves, and yard hydrants mapped to statutory municipal audit cycles with digital timestamps.',
    },
    {
      id: 'hydrants',
      title: 'Wet Riser & Hydrant Landing Valves',
      category: 'NBC Part 4 Protocol',
      specs: '63mm Single/Double Headed Landing Valve & 30m Hose Reel',
      building: 'Healthcare & Critical Care Campus (Representative)',
      auditDate: 'Monthly Hydraulic Flow & Pressure Verification',
      reading: 'Static 7.0 Bar / Dyn 3.5 Bar',
      description: 'Systematic safety tracking with logging of wet risers, clean-agent suppression in server rooms, and digital records.',
    },
    {
      id: 'pumps',
      title: 'Basement Fire Pump House (Offline Mode)',
      category: 'Pump Room Protocol',
      specs: 'Main Electrical, Diesel Standby & Jockey Pumps',
      building: 'Industrial Logistics & Warehousing Complex',
      auditDate: 'Weekly Auto-Cut In/Out Operational Test',
      reading: 'Cut-In 5.5 Bar / Cut-Out 7.0 Bar',
      description: 'Main electrical, diesel standby, and jockey pumps tracked across large industrial footprints with offline-capable mobile checklists.',
    },
    {
      id: 'alarms',
      title: 'Addressable & Conventional Fire Alarm Panels',
      category: 'IS 2189 Protocol',
      specs: '4-8 Loop Panels • Smoke/Heat Detectors • MCPs & Sounders',
      building: 'Multi-Tower Residential Society (Representative)',
      auditDate: 'Monthly Loop Walkthrough & Standby Power Check',
      reading: 'Loops Normal • 27.2V Standby',
      description: 'Loop health, detector maintenance dates, and power supply verification producing clean compliance logs for resident welfare committees.',
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
      solution: 'VigilAMC equips field teams with GPS-verified inspections, photo proof, floor location notes, and automated Form-B PDF generation.',
      results: [
        'Centralized digital asset inventory replacing fragmented spreadsheets',
        'Direct Form-B report compilation from timestamped, GPS-verified field checks',
        'Automated 60-day, 30-day, and 7-day renewal notifications',
        'Structured equipment schedules aligned with IS 2190 guidelines',
      ],
    },
    {
      client: 'Critical Facility Maintenance Profile [Representative]',
      type: 'Campus Facility Operations Scenario',
      portfolio: 'High-Density Mixed-Use Facility',
      challenge: 'Commercial tech parks manage thousands of life safety assets across multiple towers. Tracking hydro-testing windows and defect repairs manually leads to compliance lapses.',
      solution: 'VigilAMC provides real-time visibility into equipment statuses, inspection timestamps, and unresolved defect tickets across all towers.',
      results: [
        'Instant visibility of overdue or expiring fire extinguishers',
        'Photo-verified defect tickets for rapid quotation and repair approval',
        'Multi-facility portfolio overview for operations managers',
        'One-click statutory Form-B compliance certificate compilation',
      ],
    },
  ];

  return (
    <div className="w-full bg-white">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-ocean-50 to-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-white px-3.5 py-1.5 rounded-full border border-ocean-200 shadow-sm">
            Inspection Protocols &amp; Scenarios
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#023E8A] tracking-tight mt-4">
            Field Scenarios &amp; Operational Benchmarks
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Review how asset details, floor and location notes, GPS position, and condition photos are captured across diverse facility types.
          </p>
        </div>
      </section>

      {/* Visual Inspection Protocols Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {galleryImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => handleOpenLightbox(idx)}
              className="corp-card overflow-hidden group cursor-pointer bg-white transition-all transform hover:-translate-y-1.5 border border-slate-200 shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div className="p-5 bg-gradient-to-br from-[#0A1A33] via-[#0F274D] to-[#08152B] text-white">
                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 pb-2 border-b border-slate-700/60">
                  <span className="truncate pr-1">{img.category}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold shrink-0">
                    {img.reading}
                  </span>
                </div>

                <div className="pt-3 pb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#0077B6]/30 border border-cyan-400/30 flex items-center justify-center text-cyan-300 mb-2 group-hover:scale-110 transition-transform">
                    {idx === 0 && <Flame className="w-5 h-5 text-amber-400" />}
                    {idx === 1 && <Gauge className="w-5 h-5 text-cyan-400" />}
                    {idx === 2 && <Activity className="w-5 h-5 text-emerald-400" />}
                    {idx === 3 && <BellRing className="w-5 h-5 text-blue-400" />}
                  </div>
                  <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-cyan-200 transition-colors">
                    {img.title}
                  </h4>
                  <p className="text-[11px] text-cyan-100/70 font-mono mt-0.5 line-clamp-1">
                    {img.specs}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800 font-mono">
                  <span>GPS &bull; Time &bull; Photo</span>
                  <span className="text-cyan-300 group-hover:underline">Inspect &rarr;</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-500">
                  {img.building}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Inspection Protocol
                  </span>
                  <span className="text-slate-400 text-[11px]">{img.auditDate}</span>
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
        </div>
      </section>

      {/* Lightbox Component */}
      <ImageLightbox
        images={galleryImages}
        initialIndex={activeImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
