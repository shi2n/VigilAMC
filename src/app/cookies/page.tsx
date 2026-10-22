import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Cookie, ShieldCheck, CheckCircle2, AlertCircle, Info, Lock } from 'lucide-react';
import { OpenCookieModalButton } from './OpenCookieModalButton';

export const metadata: Metadata = {
  title: 'Cookie Policy | VigilAMC — Fire Safety AMC Software',
  description: 'Cookie Policy for VigilAMC. Learn how we use cookies and browser storage, and why we do not use third-party marketing trackers or non-essential cookies.',
  alternates: {
    canonical: '/cookies',
  },
};

export default function CookiePolicyPage() {
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
            Privacy &amp; Data Transparency
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#023E8A] mt-3">
            Cookie Policy
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Last updated: 12 October 2026
          </p>
        </div>

        {/* Direct Transparency Summary */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 leading-relaxed">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">No Third-Party Advertising or Tracking Cookies:</strong>
              <p className="mt-0.5 text-emerald-900">
                VigilAMC does <strong>not</strong> use advertising cookies, marketing pixels (such as Meta Pixel), cross-site tracking scripts, or profiling analytics. We only use strictly necessary session cookies required for authenticated agency access, and browser local storage for user preferences. You can review or adjust your granular cookie preferences at any time.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <OpenCookieModalButton />
          </div>
        </div>

        {/* Table of Contents */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Table of Contents
          </h2>
          <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <a href="#what-are-cookies" className="text-[#0077B6] hover:underline">1. What Are Cookies &amp; Local Storage?</a>
            <a href="#categories" className="text-[#0077B6] hover:underline">2. Categories of Cookies We Use</a>
            <a href="#cookie-inventory" className="text-[#0077B6] hover:underline">3. Complete Cookie &amp; Storage Inventory</a>
            <a href="#third-parties" className="text-[#0077B6] hover:underline">4. Third-Party Services &amp; Embeds</a>
            <a href="#browser-controls" className="text-[#0077B6] hover:underline">5. How to Manage or Clear Cookies in Browsers</a>
            <a href="#essential-notice" className="text-[#0077B6] hover:underline">6. Why Essential Cookies Cannot Be Disabled</a>
            <a href="#updates-contact" className="text-[#0077B6] hover:underline">7. Policy Updates &amp; Contact Details</a>
          </nav>
        </div>

        {/* Content Body */}
        <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-8 leading-relaxed">
          {/* Section 1 */}
          <section id="what-are-cookies" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">1. What Are Cookies and Similar Technologies?</h2>
            <p>
              Cookies are small text files that websites place on your computer or mobile device when you browse pages. They allow websites to remember user actions, retain login sessions, and support core functionality.
            </p>
            <p>
              Similar technologies include <strong>Local Storage</strong> and <strong>Session Storage</strong>, which are web storage mechanisms within HTML5 that store small pieces of configuration or state information locally on your device without transmitting data over every HTTP request.
            </p>
          </section>

          {/* Section 2 */}
          <section id="categories" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">2. Categories of Cookies</h2>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider mb-1">
                  1. Strictly Necessary (Essential) Cookies — <span className="text-emerald-600">USED</span>
                </span>
                <p className="text-xs text-slate-600">
                  These cookies and storage tokens are vital for the operation of the software. They enable authenticated users to log in securely, navigate the admin dashboard, access authorized equipment databases, and prevent CSRF attacks. Without these, the platform cannot function securely.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider mb-1">
                  2. Functional &amp; Preference Storage — <span className="text-emerald-600">USED</span>
                </span>
                <p className="text-xs text-slate-600">
                  Used in local storage to remember simple interface states, such as dismissed UI banners or chosen dashboard filters, so you do not need to reconfigure them each time you navigate.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider mb-1">
                  3. Analytics &amp; Performance Cookies — <span className="text-slate-500">NOT USED</span>
                </span>
                <p className="text-xs text-slate-600">
                  We do not run Google Analytics, Segment, PostHog, or Hotjar on this website. Any operational system statistics displayed inside the software (such as contract renewal counts or inspection totals) are computed directly from your own database records.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider mb-1">
                  4. Advertising &amp; Marketing Tracking Cookies — <span className="text-slate-500">NOT USED</span>
                </span>
                <p className="text-xs text-slate-600">
                  We do not use advertising networks, Meta/Facebook Pixels, Google Ads conversion tags, or third-party profiling trackers. We do not track your browsing across different websites.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="cookie-inventory" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">3. Complete Cookie &amp; Storage Inventory</h2>
            <p>
              The table below outlines the exact cookies and local storage items used across VigilAMC:
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-200">Name / Storage Key</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Category</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Provider</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Purpose</th>
                    <th className="py-2.5 px-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 border-r border-slate-200">
                      sb-*-auth-token
                    </td>
                    <td className="py-2.5 px-3 text-emerald-700 font-semibold border-r border-slate-200">
                      Strictly Necessary
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 border-r border-slate-200">
                      Supabase Auth / First-party
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 border-r border-slate-200">
                      Maintains secure session state and authentication tokens when agency technicians and admins log in.
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      Session / up to 7 days
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 border-r border-slate-200">
                      vigil_offline_queue
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-semibold border-r border-slate-200">
                      Functional (LocalStorage)
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 border-r border-slate-200">
                      VigilAMC (Local device)
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 border-r border-slate-200">
                      Temporarily caches inspection drafts locally on the device when a technician operates in basements with poor cellular signal (Beta).
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      Persistent until synchronized
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 border-r border-slate-200">
                      vigil_dismissed_notices
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-semibold border-r border-slate-200">
                      Functional (LocalStorage)
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 border-r border-slate-200">
                      VigilAMC (Local device)
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 border-r border-slate-200">
                      Remembers if the user has dismissed informative onboarding banners or informational alerts.
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      Up to 12 months
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 border-r border-slate-200">
                      vigilamc_cookie_consent_v1 / vigilamc_consent
                    </td>
                    <td className="py-2.5 px-3 text-emerald-700 font-semibold border-r border-slate-200">
                      Strictly Necessary
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 border-r border-slate-200">
                      VigilAMC (First-party)
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 border-r border-slate-200">
                      Persists your granular cookie consent selections across sessions in LocalStorage and a lightweight first-party browser cookie.
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      365 days
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4 */}
          <section id="third-parties" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">4. Third-Party Services and Embeds</h2>
            <p>
              We prioritize minimal third-party scripts to safeguard data privacy:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Hosting:</strong> The website and application are hosted on Vercel infrastructure. Vercel acts as a hosting and content delivery provider without setting tracking cookies on visitors.
              </li>
              <li>
                <strong>Authentication &amp; Database:</strong> User authentication and database services are handled via Supabase and PostgreSQL. Authentication cookies are set only when you deliberately log in to access your agency dashboard.
              </li>
              <li>
                <strong>Free Testing Inquiries:</strong> When you submit our free testing or contact forms, the data is delivered directly to our backend API (<code>/api/enquiries</code>) to notify our founder. We do not pass your contact data to third-party ad exchanges or data brokers.
              </li>
              <li>
                <strong>Fonts &amp; Assets:</strong> We avoid loading third-party advertising or tracker libraries.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="browser-controls" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">5. How to Manage or Clear Cookies in Your Browser</h2>
            <p>
              You can control and manage cookies using your web browser settings. Most browsers allow you to delete existing cookies, prevent new cookies from being stored, or notify you when a cookie is placed:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Google Chrome:</strong> Settings &rarr; Privacy and security &rarr; Cookies and other site data &rarr; Clear browsing data.
              </li>
              <li>
                <strong>Mozilla Firefox:</strong> Settings &rarr; Privacy &amp; Security &rarr; Cookies and Site Data &rarr; Clear Data.
              </li>
              <li>
                <strong>Apple Safari:</strong> Preferences / Settings &rarr; Privacy &rarr; Manage Website Data.
              </li>
              <li>
                <strong>Microsoft Edge:</strong> Settings &rarr; Cookies and site permissions &rarr; Manage and delete cookies and site data.
              </li>
            </ul>
            <p className="text-xs text-slate-500">
              For mobile devices, you can manage storage and cookies in your device&apos;s browser settings (e.g., Safari on iOS, Chrome on Android).
            </p>
          </section>

          {/* Section 6 */}
          <section id="essential-notice" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">6. Why Essential Cookies Cannot Be Disabled</h2>
            <p>
              Strictly necessary authentication cookies cannot be switched off within our system because they are required to protect your account and verify that you are authorized to view your agency&apos;s customer data and Form-B reports. If you configure your browser to block all cookies, you will not be able to log in to the administrative portal.
            </p>
          </section>

          {/* Section 7 */}
          <section id="updates-contact" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">7. Policy Updates &amp; Contact Information</h2>
            <p>
              We may revise this Cookie Policy if we introduce new essential platform capabilities. Any updates will appear on this page with a revised &ldquo;Last updated&rdquo; timestamp.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <p className="font-bold text-slate-900">VigilAMC Technologies</p>
              <p className="text-slate-600">Founder: Shaizan</p>
              <p className="text-slate-600">Location: New Delhi 110092, India</p>
              <p className="text-slate-600">
                Email: <a href="mailto:support@vigilamc.com" className="text-[#0077B6] font-semibold hover:underline">support@vigilamc.com</a>
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
