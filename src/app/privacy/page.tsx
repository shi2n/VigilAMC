'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, FileText, Mail, Phone, MapPin } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
            Legal &amp; Transparency
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#023E8A] mt-3">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Last Updated: September 2026 &bull; Effective Date: September 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Overview &amp; Commitment</h2>
            <p>
              VigilAMC (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) provides software for fire safety AMC contractors, facility teams, and service engineers to organize asset registries, technician service visits, and compliance documentation. We respect your privacy and are committed to protecting the business and personal information you provide when using our website and software.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. Information We Collect</h2>
            <p>We collect information only where necessary to deliver our services, facilitate pilot evaluations, and maintain system security:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Account &amp; Profile Details:</strong> Name, work email address, telephone/WhatsApp number, company name, and role permissions.
              </li>
              <li>
                <strong>Facility &amp; Asset Data:</strong> Premise addresses, equipment types (extinguishers, hydrants, alarm panels), serial numbers, installation dates, service due dates, and floor/wing locations provided by your organization.
              </li>
              <li>
                <strong>Field Service Verification Records:</strong> Inspection timestamps, technician notes, check-in verification records, and service photo evidence uploaded during maintenance audits.
              </li>
              <li>
                <strong>Inquiries &amp; Pilot Requests:</strong> Contact information, fleet sizes, and service requirements submitted via our pilot or workflow review forms.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">3. How We Use Information</h2>
            <p>Your information is used strictly to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Provide, maintain, and secure your VigilAMC organization workspace.</li>
              <li>Send scheduled service alerts, renewal notices, and inspection status updates.</li>
              <li>Compile client compliance documentation (such as model Form-B reports) based on your recorded field data.</li>
              <li>Respond to technical support, onboarding, and workflow inquiries.</li>
            </ul>
            <p className="font-semibold text-slate-800">
              We do not sell, rent, or monetize your company data or customer lists to third-party advertisers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">4. Data Storage &amp; Infrastructure</h2>
            <p>
              VigilAMC utilizes industry-standard managed cloud infrastructure. Our database is hosted on Supabase (PostgreSQL) with encrypted connections (TLS/HTTPS) enforced across all endpoints. Access to organization data is protected by multi-tenant role-based access controls and secure authentication mechanisms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">5. Data Retention &amp; Deletion</h2>
            <p>
              We retain inspection records for as long as your account remains active or as required by your business to satisfy statutory audit timelines. You may request the export or deletion of your organization records at any time by contacting our support team.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">6. Contact Information &amp; Entity Notice</h2>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <p className="font-bold text-slate-900">VigilAMC</p>
              <p className="text-slate-600">[ADD COMPANY LEGAL DETAILS &bull; Official Registration Details Pending Final Incorporation]</p>
              <p className="text-slate-600">Headquarters / Operational Contact: New Delhi 110092, India</p>
              <p className="text-slate-600">Direct Contact: +91 83838 90483 &bull; Email: vigilamc@gmail.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
