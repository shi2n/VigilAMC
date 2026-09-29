'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, FileCheck, Scale } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="w-full bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#0077B6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="border-b border-slate-200 pb-6">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-ocean-50 px-3 py-1 rounded-full border border-ocean-200">
            Terms of Use
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#023E8A] mt-3">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Last Updated: September 2026 &bull; Effective Date: September 2026
          </p>
        </div>

        {/* Prominent Statutory Disclaimer Callout */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 leading-relaxed">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Important Statutory Notice:</strong>
            <p className="mt-0.5 text-amber-800">
              VigilAMC is a software platform designed to assist fire safety AMC contractors and facility managers in organizing asset rosters, scheduling service routines, recording field service evidence, and compiling client documentation. VigilAMC is not a government agency, municipal fire directorate, or legal advisor. The software does not itself inspect physical hardware, grant statutory fire NOCs, or guarantee regulatory certification. All physical inspections, maintenance, and statutory filings must be conducted and validated by qualified, licensed fire safety professionals in accordance with applicable local laws.
            </p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing our website (vigilamc.vercel.app), requesting a free pilot, booking a workflow review, or creating an account, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. Scope of Software Services</h2>
            <p>
              VigilAMC provides digital tooling including:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Digital registry for fire safety equipment (extinguishers, hydrants, hose reels, alarm panels).</li>
              <li>QR code assignment for physical equipment identification.</li>
              <li>Mobile web interface for technician check-in and inspection checklist capture.</li>
              <li>Maintenance schedule monitoring (refill deadlines, hydrostatic tests, quarterly audits).</li>
              <li>Compilation of recorded data into structured client reports (such as model Form-B templates).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">3. User Responsibilities</h2>
            <p>Users and subscriber organizations agree to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Provide accurate, genuine information regarding equipment inventories and physical inspection results.</li>
              <li>Ensure only authorized technicians and personnel access the system.</li>
              <li>Verify that all statutory certifications (e.g., Form-B submissions) are reviewed, approved, and digitally or physically signed by an authorized, certified inspecting officer.</li>
              <li>Maintain the confidentiality of their account credentials.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">4. Regulatory Requirements &amp; Jurisdictional Variation</h2>
            <p>
              Fire safety laws, inspection intervals, mandatory testing procedures, and certificate formats (including Form-B certificates under the Maharashtra Fire Prevention and Life Safety Measures Act and NBC 2016 Part 4) vary significantly by Indian state, municipality, and building classification. It is your sole responsibility to ensure that all workflows configured within VigilAMC satisfy the specific requirements of your jurisdiction.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">5. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, VigilAMC, its founders, and contributors shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages resulting from:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Equipment malfunctions, physical fire hazards, or life safety incidents at customer premises.</li>
              <li>Inaccurate data entry, false technician records, or failure by field personnel to properly perform physical service.</li>
              <li>Rejection, denial, or penalty by municipal fire authorities, fire officers, or insurance underwriters.</li>
              <li>Temporary service interruptions or technical downtime.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">6. Modifications to Service</h2>
            <p>
              As an evolving SaaS application, VigilAMC reserves the right to modify, add, or retire features with appropriate notice. Pilot participants acknowledge that early-stage features may receive iterative enhancements based on user feedback.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">7. Contact &amp; Governance</h2>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <p className="font-bold text-slate-900">VigilAMC</p>
              <p className="text-slate-600">[ADD COMPANY LEGAL DETAILS &bull; Official Registration Details Pending Final Incorporation]</p>
              <p className="text-slate-600">Governing Law: Jurisdiction of courts in New Delhi, India</p>
              <p className="text-slate-600">Support / Legal Inquiries: vigilamc@gmail.com &bull; +91 83838 90483</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
