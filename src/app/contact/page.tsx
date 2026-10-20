'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Send,
  Building,
  User,
  ArrowRight,
  MessageCircle,
  FileSpreadsheet,
  Lock,
  Linkedin,
  Instagram,
  Youtube
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/siteConfig';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    facilityType: 'contractor',
    assetCount: '300-1000',
    preferredDate: '',
    preferredTime: '11:00 AM IST',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Valid email address is required (e.g. sharmafire@gmail.com)';
    }
    if (!formData.phone.trim() || formData.phone.replace(/[^0-9]/g, '').length < 8) {
      errs.phone = 'Valid phone or WhatsApp number is required';
    }
    if (!formData.company.trim()) errs.company = 'Agency / Company name is required';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setServerError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CONTACT',
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          facilityType: formData.facilityType,
          assetCount: formData.assetCount,
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
          message: formData.message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit enquiry');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setServerError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white">
      {/* Header Banner: Framed for AMC Contractors */}
      <section className="bg-gradient-to-b from-ocean-50 to-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-white px-3.5 py-1.5 rounded-full border border-ocean-200 shadow-sm">
            Agency Onboarding &amp; Setup
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#023E8A] tracking-tight mt-4">
            Schedule an Agency Demo or Request Workflow Setup
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Speak directly with our product team. We&apos;ll show you how to import your client asset rosters, configure mobile field checklists, and compile client-ready Form-B reports in minutes.
          </p>
        </div>
      </section>

      {/* Main Form & Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Info & Quick WhatsApp Option */}
          <div className="lg:col-span-5 space-y-8">
            <div className="corp-card p-6 bg-slate-50 border-ocean-200">
              <h3 className="text-base font-bold text-[#023E8A] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0077B6]" />
                Direct Agency Onboarding Support
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Want to get started immediately or have questions about importing your Excel client rosters? Contact our founder desk directly:
              </p>

              <div className="mt-5 space-y-3.5 text-xs text-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#0077B6] shadow-sm">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Helpline &amp; Calls</span>
                    <a href={SITE_CONFIG.PHONE_TEL} className="font-extrabold text-[#023E8A] text-sm hover:underline">
                      {SITE_CONFIG.PHONE_DISPLAY}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                    <MessageCircle className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">WhatsApp Direct</span>
                    <a
                      href={SITE_CONFIG.WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-extrabold text-emerald-700 hover:underline"
                    >
                      Chat on WhatsApp (+91 83838 90483)
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#0077B6] shadow-sm">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Inquiries</span>
                    <a href={`mailto:${SITE_CONFIG.CONTACT_EMAIL}`} className="font-bold text-slate-800 hover:text-[#0077B6]">
                      {SITE_CONFIG.CONTACT_EMAIL}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#0077B6] shadow-sm">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Support Hours</span>
                    <span className="font-semibold text-slate-700">Mon &ndash; Sat: 9:00 AM &ndash; 7:00 PM IST</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Non-Compete Guarantee Callout */}
            <div className="corp-card p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                <span>Partner Non-Compete Guarantee</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                VigilAMC is pure software for fire protection contractors. We never contact your client buildings, pitch renewals, or provide physical AMC services. Your agency data is 100% confidential.
              </p>
            </div>

            {/* Official Social Media Channels */}
            <div className="corp-card p-6 bg-slate-50 border-ocean-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-[#023E8A] uppercase tracking-wider">
                  Connect On Social Media
                </h4>
                <span className="text-[11px] font-semibold text-[#0077B6] bg-ocean-50 px-2 py-0.5 rounded-full border border-ocean-200">
                  @vigilamc
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Follow our official company channels for fire compliance updates and software release logs:
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={SITE_CONFIG.SOCIAL.LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#0A66C2] hover:bg-sky-50/50 transition-all text-xs font-semibold text-slate-700 hover:text-[#0A66C2] shadow-xs group"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-[#0A66C2] group-hover:bg-[#0A66C2] group-hover:text-white transition-colors shrink-0">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="block font-bold">LinkedIn</span>
                    <span className="text-[10px] text-slate-500 font-normal">vigilamc</span>
                  </div>
                </a>

                <a
                  href={SITE_CONFIG.SOCIAL.INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-pink-500 hover:bg-pink-50/40 transition-all text-xs font-semibold text-slate-700 hover:text-pink-600 shadow-xs group"
                >
                  <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600 group-hover:bg-gradient-to-tr group-hover:from-[#f09433] group-hover:via-[#dc2743] group-hover:to-[#bc1888] group-hover:text-white transition-all shrink-0">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="block font-bold">Instagram</span>
                    <span className="text-[10px] text-slate-500 font-normal">@vigilamc</span>
                  </div>
                </a>

                <a
                  href={SITE_CONFIG.SOCIAL.TWITTER}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-800 hover:bg-slate-100 transition-all text-xs font-semibold text-slate-700 hover:text-black shadow-xs group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-black group-hover:text-white transition-colors shrink-0">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <div className="truncate">
                    <span className="block font-bold">X (Twitter)</span>
                    <span className="text-[10px] text-slate-500 font-normal">@vigilamc</span>
                  </div>
                </a>

                <a
                  href={SITE_CONFIG.SOCIAL.YOUTUBE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-red-500 hover:bg-red-50/40 transition-all text-xs font-semibold text-slate-700 hover:text-red-600 shadow-xs group"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-[#FF0000] group-hover:text-white transition-colors shrink-0">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="block font-bold">YouTube</span>
                    <span className="text-[10px] text-slate-500 font-normal">@vigilamc</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Onboarding Form */}
          <div className="lg:col-span-7">
            <div className="corp-card p-8 sm:p-10 bg-white border border-slate-200 shadow-xl rounded-2xl">
              {isSubmitted ? (
                <div className="text-center py-10 space-y-4 animate-in fade-in duration-300">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-[#023E8A]">
                    Demo &amp; Onboarding Request Received!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong>{formData.fullName}</strong>. Our onboarding team will connect with you at <strong>{formData.email}</strong> or on WhatsApp at <strong>{formData.phone}</strong>.
                  </p>
                  <div className="p-4 bg-ocean-50 rounded-xl border border-ocean-200 text-xs text-[#023E8A] max-w-md mx-auto text-left space-y-1">
                    <p className="font-bold">Next Steps:</p>
                    <p className="text-slate-600 text-[11px]">
                      We will review your equipment count, set up your trial workspace, and help import a sample building equipment roster.
                    </p>
                  </div>
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={SITE_CONFIG.WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#25D366] hover:bg-[#20BA5C] text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Chat on WhatsApp Directly</span>
                    </a>
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({
                          fullName: '',
                          email: '',
                          phone: '',
                          company: '',
                          facilityType: 'contractor',
                          assetCount: '300-1000',
                          preferredDate: '',
                          preferredTime: '11:00 AM IST',
                          message: '',
                        });
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 bg-[#0077B6] hover:bg-[#023E8A] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div>
                    <h3 className="text-xl font-extrabold text-[#023E8A]">
                      Book 15-Minute Agency Walkthrough
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      See how VigilAMC sets up your client buildings, logs GPS inspections, and compiles Form-B reports.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Contact Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="e.g. Ramesh Kulkarni"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                            errors.fullName ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                          } focus:outline-none focus:ring-2 focus:ring-[#0077B6]`}
                        />
                      </div>
                      {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          placeholder="e.g. sharmafire@gmail.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                            errors.email ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                          } focus:outline-none focus:ring-2 focus:ring-[#0077B6]`}
                        />
                      </div>
                      {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Phone / WhatsApp *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          placeholder="+91 98200 45678"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                            errors.phone ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                          } focus:outline-none focus:ring-2 focus:ring-[#0077B6]`}
                        />
                      </div>
                      {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Agency / Company Name *
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="e.g. Apex Fire Protection Services"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                            errors.company ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                          } focus:outline-none focus:ring-2 focus:ring-[#0077B6]`}
                        />
                      </div>
                      {errors.company && <p className="text-xs text-red-600 mt-1">{errors.company}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Agency Profile
                      </label>
                      <select
                        value={formData.facilityType}
                        onChange={(e) => setFormData({ ...formData, facilityType: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
                      >
                        <option value="contractor">Fire Safety AMC Agency (Multi-Site)</option>
                        <option value="licensed-agency">State Licensed Fire Agency (Form-B Signatory)</option>
                        <option value="commercial">Commercial Tower / IT Park Facility Team</option>
                        <option value="hospital">Hospital / Healthcare Campus</option>
                        <option value="residential">Residential Society Facility Management</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Estimated Fire Asset Count
                      </label>
                      <select
                        value={formData.assetCount}
                        onChange={(e) => setFormData({ ...formData, assetCount: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
                      >
                        <option value="under-300">Under 300 Assets (1-3 Buildings)</option>
                        <option value="300-1000">300 to 1,000 Assets (4-10 Buildings)</option>
                        <option value="1000-3000">1,000 to 3,000 Assets (10-25 Buildings)</option>
                        <option value="3000+">3,000+ Assets (Enterprise Fleet)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Preferred Demo Date
                      </label>
                      <input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Preferred Time Window
                      </label>
                      <select
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
                      >
                        <option value="10:00 AM IST">10:00 AM - 11:00 AM IST</option>
                        <option value="11:30 AM IST">11:30 AM - 12:30 PM IST</option>
                        <option value="02:30 PM IST">02:30 PM - 03:30 PM IST</option>
                        <option value="04:30 PM IST">04:30 PM - 05:30 PM IST</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Current Tracking Setup or Questions (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Currently tracking 850 extinguishers on Excel across 6 buildings. Want to see how Form-B PDF reports are compiled."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
                    />
                  </div>

                  {serverError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                      {serverError}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 bg-[#0077B6] hover:bg-[#023E8A] disabled:bg-slate-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span>Reserving Your Live Session...</span>
                      ) : (
                        <>
                          <span>Confirm 15-Minute Agency Demo</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-slate-400 mt-2">
                      Zero spam guarantee &bull; 100% confidential &bull; Free Excel import for your first 3 buildings
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Location */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="max-w-lg mx-auto corp-card p-6 bg-white border border-slate-200 shadow-md rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-ocean-50 text-[#0077B6] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">Headquarters</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {SITE_CONFIG.ADDRESS_DISPLAY}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold">
                  <a href={SITE_CONFIG.PHONE_TEL} className="text-[#0077B6] hover:underline">
                    {SITE_CONFIG.PHONE_DISPLAY}
                  </a>
                  <span className="text-slate-300">&bull;</span>
                  <a href={`mailto:${SITE_CONFIG.CONTACT_EMAIL}`} className="text-[#0077B6] hover:underline">
                    {SITE_CONFIG.CONTACT_EMAIL}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
