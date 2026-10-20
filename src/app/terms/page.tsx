import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, ShieldCheck, Scale, CheckCircle2, Building, Mail, Phone, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms and Conditions | VigilAMC — Fire Safety AMC Software',
  description: 'Terms and Conditions for VigilAMC, a fire safety AMC compliance and operations platform serving agencies across India, operated by Shaizan from New Delhi.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
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

        {/* Page Header */}
        <div className="border-b border-slate-200 pb-6">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-ocean-50 px-3 py-1 rounded-full border border-ocean-200">
            Legal &amp; Service Agreement
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#023E8A] mt-3">
            Terms and Conditions
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Last updated: 12 October 2026
          </p>
        </div>

        {/* Statutory Notice Callout */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 leading-relaxed">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Important Notice:</strong>
            <p className="mt-0.5 text-amber-800">
              VigilAMC organizes records and workflow. It is not a licensed fire safety contractor, does not perform inspections, does not replace statutory inspections, and does not guarantee an NOC or regulatory approval. Report formats and intervals vary by state and jurisdiction, so customers must verify reports with qualified fire-compliance professionals.
            </p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Table of Contents
          </h2>
          <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <a href="#about" className="text-[#0077B6] hover:underline">1. About VigilAMC &amp; Who We Are</a>
            <a href="#acceptance" className="text-[#0077B6] hover:underline">2. Acceptance &amp; Authorized Users</a>
            <a href="#testing" className="text-[#0077B6] hover:underline">3. Free Testing Phase &amp; Beta Terms</a>
            <a href="#accounts" className="text-[#0077B6] hover:underline">4. Account Registration &amp; Security</a>
            <a href="#customer-data" className="text-[#0077B6] hover:underline">5. Customer Data &amp; Ownership</a>
            <a href="#location-photos" className="text-[#0077B6] hover:underline">6. GPS Location, Floor Notes &amp; Photos</a>
            <a href="#disclaimer" className="text-[#0077B6] hover:underline">7. Statutory Compliance Disclaimer</a>
            <a href="#acceptable-use" className="text-[#0077B6] hover:underline">8. Acceptable Use Policy</a>
            <a href="#ip" className="text-[#0077B6] hover:underline">9. Intellectual Property</a>
            <a href="#availability" className="text-[#0077B6] hover:underline">10. Availability &amp; Support</a>
            <a href="#liability" className="text-[#0077B6] hover:underline">11. Limitation of Liability</a>
            <a href="#termination" className="text-[#0077B6] hover:underline">12. Suspension &amp; Termination</a>
            <a href="#feedback" className="text-[#0077B6] hover:underline">13. Feedback</a>
            <a href="#changes" className="text-[#0077B6] hover:underline">14. Changes to These Terms</a>
            <a href="#governing-law" className="text-[#0077B6] hover:underline">15. Governing Law &amp; Jurisdiction</a>
            <a href="#contact" className="text-[#0077B6] hover:underline">16. Contact Details</a>
          </nav>
        </div>

        {/* Content Body */}
        <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-8 leading-relaxed">
          {/* Section 1 */}
          <section id="about" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">1. Who We Are and What VigilAMC Is</h2>
            <p>
              VigilAMC is a software platform designed specifically for fire safety annual maintenance contract (AMC) companies, contractors, and service teams across India. Operated by its founder <strong>Shaizan</strong> from New Delhi, India, VigilAMC provides digital tools to record field inspections, track equipment maintenance due dates (such as cylinder refills and hydrostatic pressure tests), and generate structured, client-ready Form-B style compliance reports.
            </p>
            {/* TODO: Add registered legal entity name, corporate registration number, and GSTIN once officially incorporated */}
          </section>

          {/* Section 2 */}
          <section id="acceptance" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">2. Acceptance of Terms &amp; Who May Use the Service</h2>
            <p>
              By accessing our website (<code>vigilamc.com</code>), applying for free testing, or creating an account, you agree to these Terms and Conditions.
            </p>
            <p>
              The service is intended solely for commercial fire protection agencies, life-safety service providers, facility management companies, and their authorized technicians or administrative staff. You represent that you have the authority to bind your organization to these terms.
            </p>
          </section>

          {/* Section 3 */}
          <section id="testing" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">3. Testing Phase &amp; Beta Features</h2>
            <p>
              VigilAMC is currently in its testing phase and is <strong>free for every agency that joins</strong> during this period.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Beta Functionality:</strong> Certain features—including mobile GPS verification, photo evidence capture, and offline mobile record caching—are labeled as <strong>BETA</strong> and are undergoing continuous optimization.
              </li>
              <li>
                <strong>Modifications:</strong> During testing, features may change, experience intermittent availability, or be revised based on operational feedback from participating agencies.
              </li>
              <li>
                <strong>Future Pricing:</strong> We may introduce commercial subscription plans in the future. We will provide advance notice before any fee is introduced. Nothing will ever be charged without the customer&apos;s explicit prior agreement.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="accounts" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">4. Account Registration &amp; Security</h2>
            <p>
              When creating an account, you must provide accurate, complete, and current information. You are responsible for safeguarding your login credentials and for all activities carried out by your staff, technicians, or administrators under your agency account. You agree to notify us immediately at <code>support@vigilamc.com</code> of any unauthorized access or security breach.
            </p>
          </section>

          {/* Section 5 */}
          <section id="customer-data" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">5. Customer Data &amp; Ownership</h2>
            <p>
              <strong>You own your data.</strong> All equipment rosters, inspection records, premise details, floor notes, GPS coordinates, defect logs, photos, and generated reports uploaded or created by your organization remain your property.
            </p>
            <p>
              We use your data strictly to operate, maintain, secure, and improve the VigilAMC software for your agency. We do not sell your customer or facility data to third parties. You confirm that your agency has all necessary rights, permissions, and client authorizations to record and upload equipment details and photographic records from client premises.
            </p>
          </section>

          {/* Section 6 */}
          <section id="location-photos" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">6. GPS Location, Floor Notes &amp; Inspection Photos</h2>
            <p>
              GPS coordinates and inspection photos are recorded solely as proof of physical service visits and to feed statutory maintenance schedules.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <strong>Indoor Positioning Reality:</strong> Satellite GPS signals can be attenuated or inaccurate inside multi-story commercial buildings, basements, and pump houses. Technicians must always record descriptive <strong>floor and location notes</strong> alongside GPS coordinates. VigilAMC makes no claim of centimeter-level indoor positioning accuracy.
            </div>
          </section>

          {/* Section 7 */}
          <section id="disclaimer" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">7. Statutory Compliance Disclaimer</h2>
            <p>
              VigilAMC is a software productivity and documentation tool. <strong>It is not a licensed fire safety contractor, does not perform fire inspections, does not replace statutory fire safety inspections, and does not guarantee an NOC (No Objection Certificate) or regulatory clearance from any municipal or state fire directorate.</strong>
            </p>
            <p>
              Fire safety laws, inspection intervals, mandatory testing standards and certification formats vary by state, municipal jurisdiction, building occupancy type and facility scale. Requirements may vary by state, facility and applicable regulations. Compliance information should always be reviewed with a qualified fire-compliance professional and the applicable local authorities. Your agency remains solely responsible for the technical accuracy of physical field work, the truthfulness of entered records, and compliance with all statutory life-safety laws. All reports must be verified and signed by qualified, licensed fire safety professionals.
            </p>
          </section>

          {/* Section 8 */}
          <section id="acceptable-use" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">8. Acceptable Use Policy</h2>
            <p>You agree not to misuse the VigilAMC platform. You will not:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Upload intentionally fabricated, fraudulent, or deceptive inspection data or false photos.</li>
              <li>Attempt to probe, scan, or breach system security, authentication mechanisms, or rate limits.</li>
              <li>Reverse-engineer, decompile, or copy the software code, interface design, or intellectual property.</li>
              <li>Introduce viruses, malware, or harmful automated scraping scripts.</li>
              <li>Use the service to harass, violate privacy, or infringe on third-party property rights.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section id="ip" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">9. Intellectual Property</h2>
            <p>
              We own all right, title, and interest in and to the VigilAMC platform, including the brand, logo, codebase, visual design, documentation, and user interfaces. As established above, you retain full ownership of your customer and inspection data.
            </p>
          </section>

          {/* Section 10 */}
          <section id="availability" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">10. Service Availability &amp; Support</h2>
            <p>
              During the testing phase, the service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without uptime guarantees or formal Service Level Agreements (SLAs). Technical support, data import assistance, and onboarding are provided on a reasonable-effort basis directly by our founding team.
            </p>
          </section>

          {/* Section 11 */}
          <section id="liability" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">11. Limitation of Liability &amp; No Warranties</h2>
            <p>
              To the maximum extent permitted by applicable law, VigilAMC, its founder, and service operators will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, missed compliance deadlines, statutory penalties, municipal fines, or property damage arising out of your use or inability to use the service.
            </p>
          </section>

          {/* Section 12 */}
          <section id="termination" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">12. Suspension &amp; Termination</h2>
            <p>
              Either party may terminate or suspend the service relationship at any time. You may stop using VigilAMC and request an export or complete deletion of your agency data by contacting us. We may suspend or terminate access if these Terms are violated or if necessary to safeguard the integrity of the platform.
            </p>
          </section>

          {/* Section 13 */}
          <section id="feedback" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">13. Feedback</h2>
            <p>
              We welcome suggestions, bug reports, and workflow feedback. By submitting feedback, you agree that VigilAMC may freely use, apply, and incorporate your ideas to refine and enhance the platform without obligation or compensation.
            </p>
          </section>

          {/* Section 14 */}
          <section id="changes" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">14. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. When changes occur, we will post the updated version on this page and revise the &ldquo;Last updated&rdquo; date at the top. Continued use of the platform after updates indicates your acceptance of the revised Terms.
            </p>
          </section>

          {/* Section 15 */}
          <section id="governing-law" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">15. Governing Law &amp; Jurisdiction</h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes, claims, or controversies arising out of or related to these terms shall be subject to the exclusive jurisdiction of the competent courts in <strong>New Delhi, India</strong>.
            </p>
          </section>

          {/* Section 16 */}
          <section id="contact" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">16. Contact Details</h2>
            <p>If you have any questions about these Terms and Conditions, please contact us directly:</p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <p className="font-bold text-slate-900">VigilAMC Technologies</p>
              <p className="text-slate-600">Founder: Shaizan</p>
              <p className="text-slate-600">Location: New Delhi 110092, India</p>
              <p className="text-slate-600">
                Email: <a href="mailto:shaizan@vigilamc.com" className="text-[#0077B6] font-semibold hover:underline">shaizan@vigilamc.com</a>
              </p>
              <p className="text-slate-600">
                Phone / WhatsApp: <a href="tel:+918383890483" className="text-[#0077B6] font-semibold hover:underline">+91 83838 90483</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
