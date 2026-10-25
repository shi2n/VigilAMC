'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  User,
  Building,
  Phone,
  Mail,
  Users,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/siteConfig';

export function FreePilotForm() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    state: '',
    city: '',
    phone: '',
    email: '',
    technicianCount: '1-5',
    assetCount: '100-500',
    trackingMethod: 'Excel Spreadsheets',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Contact name is required';
    if (!formData.company.trim()) errs.company = 'Agency / Company name is required';
    if (!formData.state.trim()) errs.state = 'Please select your State / UT';
    if (!formData.city.trim()) errs.city = 'City name is required';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Valid email address is required (e.g. sharmafire@gmail.com)';
    }
    if (!formData.phone.trim() || formData.phone.replace(/[^0-9]/g, '').length < 8) {
      errs.phone = 'Valid phone or WhatsApp number is required';
    }
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
          type: 'PILOT',
          name: formData.name,
          company: formData.company,
          state: formData.state,
          city: formData.city,
          phone: formData.phone,
          email: formData.email,
          technicianCount: formData.technicianCount,
          assetCount: formData.assetCount,
          trackingMethod: formData.trackingMethod,
          message: formData.message,
          source: 'Free Pilot Application Form',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit pilot request');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setServerError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="pilot-form" className="w-full max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden scroll-mt-24">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-[#1C1917] to-[#C2410C] p-6 sm:p-8 text-white">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-200">
            Testing Phase &bull; Free Founding Access
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-400 text-[#1C1917]">
            60 Days Free
          </span>
        </div>
        <h3 className="text-2xl font-black text-white">
          Join the Free Testing Program
        </h3>
        <p className="text-sm text-cyan-100 mt-2 leading-relaxed">
          VigilAMC is 100% free for founding agencies during testing. Test asset registration, GPS and photo-verified inspections, and Form-B generation with your real building rosters.
        </p>
      </div>

      <div className="p-6 sm:p-8">
        {isSubmitted ? (
          <div className="py-8 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-black text-[#1C1917]">
              Testing Application Received!
            </h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you, <strong>{formData.name}</strong> from <strong>{formData.company}</strong>. Our team will review your fleet profile and contact you within 1 business day to set up your testing workspace.
            </p>
            <div className="p-4 bg-ocean-50 rounded-xl border border-ocean-200 text-xs text-[#1C1917] max-w-md mx-auto text-left space-y-1">
              <p className="font-bold">What happens next:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
                <li>We schedule a 15-minute onboarding walkthrough.</li>
                <li>We help import your first 3 client building rosters completely free.</li>
                <li>Your field technicians test the simple mobile form on site.</li>
              </ul>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={SITE_CONFIG.WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20BA5C] text-white text-xs font-bold rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat on WhatsApp Directly</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    name: '',
                    company: '',
                    state: '',
                    city: '',
                    phone: '',
                    email: '',
                    technicianCount: '1-5',
                    assetCount: '100-500',
                    trackingMethod: 'Excel Spreadsheets',
                    message: '',
                  });
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#C2410C] hover:bg-[#1C1917] text-white text-xs font-bold rounded-xl transition-colors"
              >
                Submit Another Facility
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Quick WhatsApp conversion row */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-slate-700">
              <div className="flex items-center gap-2 text-emerald-950 font-medium">
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 fill-current" />
                <span>Prefer messaging directly on WhatsApp?</span>
              </div>
              <a
                href={SITE_CONFIG.WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20BA5C] text-white font-bold text-[11px] whitespace-nowrap shadow-xs"
              >
                <span>Message Shaizan</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border ${
                      errors.name ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-[#C2410C]`}
                  />
                </div>
                {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Agency / Company Name *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Fire Protection Services"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border ${
                      errors.company ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-[#C2410C]`}
                  />
                </div>
                {errors.company && <p className="text-[11px] text-red-600 mt-1">{errors.company}</p>}
              </div>
            </div>

            {/* State and City Fields (Pan-India) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  State / UT *
                </label>
                <select
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${
                    errors.state ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-[#C2410C] bg-white text-slate-900`}
                >
                  <option value="">Select State / Union Territory</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Goa">Goa</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="Other">Other State / UT</option>
                </select>
                {errors.state && <p className="text-[11px] text-red-600 mt-1">{errors.state}</p>}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai, Bengaluru, Delhi NCR"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${
                    errors.city ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-[#C2410C]`}
                />
                {errors.city && <p className="text-[11px] text-red-600 mt-1">{errors.city}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone / WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98200 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border ${
                      errors.phone ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-[#C2410C]`}
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. sharmafire@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border ${
                      errors.email ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-[#C2410C]`}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Field Technicians
                </label>
                <select
                  value={formData.technicianCount}
                  onChange={(e) => setFormData({ ...formData, technicianCount: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C2410C]"
                >
                  <option value="1-5">1 to 5 Technicians</option>
                  <option value="6-15">6 to 15 Technicians</option>
                  <option value="16-30">16 to 30 Technicians</option>
                  <option value="30+">30+ Field Staff</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Total Managed Assets
                </label>
                <select
                  value={formData.assetCount}
                  onChange={(e) => setFormData({ ...formData, assetCount: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C2410C]"
                >
                  <option value="Under 100">Under 100 Assets</option>
                  <option value="100-500">100 - 500 Assets</option>
                  <option value="500-2000">500 - 2,000 Assets</option>
                  <option value="2000+">2,000+ Assets</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Current Tracking
                </label>
                <select
                  value={formData.trackingMethod}
                  onChange={(e) => setFormData({ ...formData, trackingMethod: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C2410C]"
                >
                  <option value="Excel Spreadsheets">Excel Spreadsheets</option>
                  <option value="Paper Checklists">Paper Checklists / Tags</option>
                  <option value="Generic Form App">Generic Form App</option>
                  <option value="None / Ad-hoc">Ad-hoc</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Specific Workflow Needs or Questions (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Need to track 200 extinguishers and 2 alarm panels across 3 commercial buildings."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C2410C]"
              />
            </div>

            {serverError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                {serverError}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 bg-[#C2410C] hover:bg-[#1C1917] disabled:bg-slate-400 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Submitting Application...</span>
                ) : (
                  <>
                    <span>Join Free Testing Phase (60 Days Free)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                100% free for founding agencies &bull; Free Excel import for first 3 buildings &bull; Zero lock-in
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
