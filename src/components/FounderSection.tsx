'use client';

import React from 'react';
import Link from 'next/link';
import { Play, ArrowRight, Video, Mail, Phone, MapPin, Sparkles } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function FounderSection() {
  return (
    <section id="founder" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-ocean-50 text-[#0077B6] text-xs font-bold border border-ocean-200 mb-3">
            <span>Leadership &amp; Mission</span>
            <StatusBadge status="LIVE" size="xs" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#023E8A] tracking-tight">
            Why I Started VigilAMC
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            A personal commitment to bringing accountability, transparency, and simplicity to life safety maintenance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Founder Story */}
          <div className="lg:col-span-7 space-y-6 text-sm text-slate-700 leading-relaxed">
            <div className="p-4 rounded-xl bg-white border border-ocean-200/80 shadow-2xs space-y-1">
              <span className="text-xs uppercase font-extrabold text-[#0077B6] tracking-wider block">
                From the Founder
              </span>
              <h3 className="text-lg font-black text-[#023E8A]">
                Shaizan &bull; Founder, VigilAMC
              </h3>
              <p className="text-xs text-slate-500">
                New Delhi, India &bull; vigilamc@gmail.com
              </p>
            </div>

            <p>
              In talking with fire safety service providers and facility supervisors, one pattern kept surfacing: while fire safety hardware is strictly regulated by state fire acts and national codes, <strong>the day-to-day management of inspections and maintenance still runs on paper checklists, memory, and brittle spreadsheets.</strong>
            </p>

            <p>
              When an AMC agency handles hundreds of fire extinguishers, hose reels, and hydrant valves across dozens of commercial and residential towers, tracking hydrostatic pressure test due dates, quarterly refills, and defect repairs manually becomes overwhelming. Too often, a missed refill date is discovered only when a municipal fire officer arrives for an inspection or when an emergency occurs.
            </p>

            <p>
              <strong>We built VigilAMC to solve this specific problem.</strong> By pairing physical equipment with durable QR codes, field technicians can log verified inspection checks on mobile phones even when working in shielded basement pump rooms with zero network. Service managers gain a live radar of due dates, and clients receive clean, transparent compliance reports.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <a
                href="#pilot-form"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0077B6] hover:bg-[#023E8A] text-white text-xs font-bold shadow-md transition-all active:scale-[0.98]"
              >
                <span>Join the Free Pilot</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition-all"
              >
                <span>Meet the Founder &bull; Book a Call</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Founder Video Placeholder */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
                <span className="flex items-center gap-1.5 text-[#023E8A]">
                  <Video className="w-4 h-4 text-[#0077B6]" />
                  Founder Video Message
                </span>
                <StatusBadge status="COMING SOON" size="xs" />
              </div>

              {/* Clean Video Placeholder Box */}
              {/* TO REPLACE WITH REAL FOUNDER VIDEO:
                  Replace this inner div with your YouTube/Vimeo embed or an HTML5 <video> tag:
                  <video src="/founder-story.mp4" poster="/founder-poster.jpg" controls className="w-full rounded-xl" />
              */}
              <div className="relative aspect-video w-full rounded-xl bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center text-white border border-slate-800 shadow-inner group">
                <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-cyan-300 mb-3 group-hover:scale-105 group-hover:bg-[#0077B6] group-hover:text-white transition-all shadow-md">
                  <Play className="w-6 h-6 ml-0.5 fill-current" />
                </div>
                <h4 className="font-bold text-sm text-white">
                  Founder Story &mdash; Coming Soon
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                  [ADD REAL FOUNDER VIDEO]
                </p>
                <p className="text-[10px] text-cyan-200/70 mt-2">
                  A personal walkthrough on building VigilAMC for Indian fire safety teams
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
                <span className="font-mono text-[10px] text-slate-500 uppercase font-bold">Status:</span>
                <span className="text-[11px]">Recording founder interview &bull; Uploading shortly</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
