import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, FileText, Mail, Phone, MapPin, Smartphone } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Privacy Policy & Mobile App Data Notice | VigilAMC',
  description:
    'Privacy policy and mobile app data disclosure for VigilAMC and the VigilAMC Field Android application in compliance with the DPDP Act 2023.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy & Mobile App Data Notice | VigilAMC',
    description:
      'Privacy policy and mobile app data disclosure for VigilAMC and the VigilAMC Field Android application in compliance with the DPDP Act 2023.',
    url: `${SITE_CONFIG.SITE_URL}/privacy`,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy & Mobile App Data Notice | VigilAMC',
    description:
      'Privacy policy and mobile app data disclosure for VigilAMC.',
    creator: '@vigilamc',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#C2410C] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="border-b border-slate-200 pb-6">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#C2410C] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            Legal &amp; Transparency
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1C1917] mt-3">
            Privacy Policy &amp; Mobile App Data Notice
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Last Updated: November 2026 &bull; Effective Date: November 2026 &bull; DPDP Act 2023 Compliant
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Overview &amp; Commitment</h2>
            <p>
              VigilAMC Technologies (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) provides software for fire safety AMC contractors, facility management teams, and service engineers to organize asset registries, technician service visits, and statutory compliance documentation. We respect your privacy and are committed to protecting personal and business data in compliance with the Digital Personal Data Protection (DPDP) Act, 2023 of India.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. Information We Collect</h2>
            <p>We collect information only where necessary to deliver our services, facilitate pilot evaluations, and maintain system security:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Account &amp; Profile Details:</strong> Name, work email address, telephone/WhatsApp number, company name, employee ID, and role permissions.
              </li>
              <li>
                <strong>Facility &amp; Asset Data:</strong> Premise addresses, equipment types (extinguishers, hydrants, alarm panels, sprinkler risers), serial numbers, installation dates, service due dates, and floor/wing locations provided by your organization.
              </li>
              <li>
                <strong>Field Service Verification Records:</strong> Inspection timestamps, checklist responses, technician notes, check-in verification records, and service photo evidence uploaded during maintenance audits.
              </li>
              <li>
                <strong>Inquiries &amp; Pilot Requests:</strong> Contact information, fleet sizes, and service requirements submitted via our pilot or workflow review forms.
              </li>
            </ul>
          </section>

          {/* Section 2A: Dedicated Mobile App Data Collection */}
          <section className="space-y-3 bg-[#FFF8F2] border border-[#FED7AA] p-5 rounded-2xl">
            <div className="flex items-center gap-2 text-[#C2410C]">
              <Smartphone className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-bold text-[#1C1917] m-0">
                3. Mobile App Data Collection (VigilAMC Field Android App)
              </h2>
            </div>
            <p className="text-slate-700">
              For users operating the <strong>VigilAMC Field</strong> native Android application (<code className="text-xs bg-white px-1.5 py-0.5 rounded border border-[#FED7AA]">com.vigilamc</code>), we collect and process specific device data strictly to enable core field-engineering capabilities:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>
                <strong>Precise &amp; Coarse Geolocation (while app is in use only):</strong>
                <br />
                <em>What:</em> GPS latitude, longitude, and satellite accuracy coordinates.
                <br />
                <em>Why:</em> To create statutory, tamper-evident proof of site maintenance visits under NBC 2016 and IS 2190 standards, and to permanently burn coordinates into inspection photos.
                <br />
                <em>Scope:</em> Location is captured <strong>strictly while the app is active and foregrounded</strong>. We do <strong>NOT</strong> track technicians in the background or monitor off-duty movement.
              </li>
              <li>
                <strong>Camera &amp; Photo Evidence:</strong>
                <br />
                <em>What:</em> Visual photographs of fire extinguishers, pressure gauges, control panels, safety seals, and on-site physical defects.
                <br />
                <em>Why:</em> To provide verifiable proof of physical asset condition for building owners, fire department auditors, and insurance compliance.
                <br />
                <em>Scope:</em> The camera is accessed only when the technician taps the &ldquo;Capture Photo&rdquo; button. We do not access existing personal camera rolls without explicit user selection.
              </li>
              <li>
                <strong>Push Notification Device Tokens (Firebase Cloud Messaging):</strong>
                <br />
                <em>What:</em> Unique FCM device tokens registered on Android.
                <br />
                <em>Why:</em> To deliver immediate task assignment notifications, 48-hour due-soon reminders, and critical outbox sync diagnostics.
                <br />
                <em>Opt-Out:</em> Technicians can disable push notification permissions in Android OS settings at any time.
              </li>
              <li>
                <strong>Microphone &amp; Regional Speech-to-Text:</strong>
                <br />
                <em>What:</em> Live voice input transcribed to text for technician observation remarks.
                <br />
                <em>Why:</em> Hands-free documentation in 10 Indian regional languages. Audio stream is converted locally or via standard OS speech services and is not retained as audio files.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">4. How We Use Information</h2>
            <p>Your information is used strictly to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Provide, maintain, and secure your VigilAMC organization workspace.</li>
              <li>Dispatch real-time work orders, site assignments, and renewal reminders.</li>
              <li>Compile client compliance documentation (such as model Form-B reports) based on recorded field data.</li>
              <li>Respond to technical support, onboarding, and workflow inquiries.</li>
            </ul>
            <p className="font-semibold text-slate-800">
              We do not sell, rent, or monetize your company data, technician coordinates, or customer lists to third-party advertisers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">5. Data Storage, Security &amp; Infrastructure</h2>
            <p>
              VigilAMC utilizes industry-standard managed cloud infrastructure. Our database is hosted on Supabase (PostgreSQL) with encrypted connections (TLS 1.3 / HTTPS) enforced across all endpoints. Inspection photos are stored in private, encrypted object storage (Cloudflare R2). Access to organization data is protected by multi-tenant role-based access controls and secure authentication mechanisms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">6. Data Retention &amp; Deletion Rights</h2>
            <p>
              We retain inspection records for as long as your contractor account remains active or as required by your business to satisfy statutory audit timelines under Indian fire-safety regulations (typically 3 to 5 years).
            </p>
            <p>
              Under the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>, data principals (technicians and agency staff) possess:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>The right to access a summary of personal data processed.</li>
              <li>The right to correction and completion of inaccurate data.</li>
              <li>The right to erasure of personal data that is no longer necessary for compliance or contractual purposes.</li>
              <li>The right to readily available grievance redressal.</li>
            </ul>
            <p>
              You may also request account deletion directly from the app: Profile &rarr; Request account deletion. Requests are processed within 7 days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">7. DPDP Grievance Officer &amp; Entity Notice</h2>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <p className="font-bold text-slate-900">VigilAMC Technologies (DPIIT-Recognized Startup)</p>
              <p className="text-slate-600">Operational Headquarters: New Delhi 110092, India</p>
              <p className="text-slate-600">
                <strong>Grievance Officer:</strong> Shaizan (Founder, VigilAMC Technologies)
              </p>
              <p className="text-slate-600">
                Email: <a href="mailto:vigilamc@gmail.com" className="text-[#C2410C] font-semibold underline">vigilamc@gmail.com</a> &bull; Direct Phone: +91 83838 90483
              </p>
              <p className="text-slate-500 text-[11px] pt-1">
                Grievance inquiries are acknowledged within 24 hours and addressed within statutory DPDP timelines.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
