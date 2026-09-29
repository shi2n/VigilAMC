'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, ShieldCheck, Scale, FileText } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function TrustTransparencySection() {
  const whatWeDo = [
    'Organize equipment inventories, floor locations, and service histories in one central digital registry.',
    'Assign unique, serialized QR codes to fire extinguishers, hydrants, alarm panels, and hose reels.',
    'Provide an offline-ready mobile web scanner for field technicians to record inspections with timestamp verification.',
    'Track service cycles, refilling deadlines, and hydrostatic pressure testing schedules with automated alerts.',
    'Structure recorded field observations into client-facing Form-B inspection schedules and compliance summaries.',
    'Store photographic defect proof and maintenance notes for transparent client communication.',
  ];

  const whatWeDoNotDo = [
    'We do NOT perform physical maintenance, refilling, or testing — certified technicians and licensed agencies perform all physical work.',
    'We do NOT guarantee that municipal fire authorities will issue an NOC — compliance depends on actual physical equipment condition and adherence to local laws.',
    'We are NOT a government fire directorate, municipal agency, or legal regulatory body.',
    'We do NOT replace statutory inspections by licensed fire safety officers or municipal fire marshals.',
    'We do NOT issue legal certifications independently of licensed contractor verification and authorized signatures.',
  ];

  return (
    <section id="transparency" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-ocean-50 text-[#0077B6] text-xs font-bold border border-ocean-200 mb-3">
            <span>Honest &amp; Transparent Positioning</span>
            <StatusBadge status="LIVE" size="xs" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#023E8A] tracking-tight">
            Trust &amp; Transparency
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            VigilAMC helps teams organize the information and workflows needed for better compliance management. Here is exactly what our software does and does not do.
          </p>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* What VigilAMC Does */}
          <div className="p-8 rounded-2xl bg-emerald-50/50 border-2 border-emerald-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-emerald-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-emerald-950">
                    What VigilAMC Does
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Software capabilities built into the platform
                  </p>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-slate-700 leading-relaxed">
                {whatWeDo.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-200/80 text-[11px] text-emerald-800 font-medium">
              Purpose: Digital organization, field verification, and reliable record keeping.
            </div>
          </div>

          {/* What VigilAMC Does NOT Do */}
          <div className="p-8 rounded-2xl bg-slate-50 border-2 border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    What VigilAMC Does Not Do
                  </h3>
                  <p className="text-xs text-slate-500">
                    Clear boundaries on our role and software scope
                  </p>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-slate-700 leading-relaxed">
                {whatWeDoNotDo.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] text-slate-500 font-medium">
              Boundary: Software organizes records; licensed contractors execute physical life safety.
            </div>
          </div>
        </div>

        {/* Mandatory Regulatory Disclaimer Box */}
        <div className="mt-10 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="leading-relaxed">
            <strong className="font-bold text-amber-900 block text-xs">
              Statutory Fire Compliance Disclaimer:
            </strong>
            <p className="mt-0.5 text-amber-800 text-[11px]">
              Fire safety laws, inspection intervals, mandatory testing standards, and certification formats (including Form-B periodic audit certificates under the Delhi Fire Safety Act, Haryana Fire Safety Act in Delhi NCR, and NBC 2016 Part 4) vary by municipal jurisdiction, building occupancy type, and facility scale. <strong>Requirements may vary by state, facility, and applicable regulations. Compliance information should always be reviewed with a qualified fire-compliance professional and applicable local authorities.</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
