'use client';

import React, { useState } from 'react';
import { CheckCircle2, User, Building, Phone, Mail, Users, FileSpreadsheet, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function FreePilotForm() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
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
    if (!formData.company.trim()) errs.company = 'Company / Agency name is required';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Valid work email is required';
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
      <div className="bg-gradient-to-r from-[#023E8A] to-[#0077B6] p-6 sm:p-8 text-white">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-200">
            Early Adopter Program
          </span>
          <StatusBadge status="BETA" />
        </div>
        <h3 className="text-2xl font-black text-white">
          Join the Free Pilot
        </h3>
        <p className="text-sm text-cyan-100 mt-2 leading-relaxed">
          We&apos;re onboarding selected fire-safety AMC and service teams to test VigilAMC with real workflows and feedback.
        </p>
      </div>

      <div className="p-6 sm:p-8">
        {isSubmitted ? (
          <div className="py-8 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-black text-[#023E8A]">
              Pilot Application Received!
            </h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you, <strong>{formData.name}</strong> from <strong>{formData.company}</strong>. Our team will review your fleet profile and contact you within 1 business day to set up your pilot workspace.
            </p>
            <div className="p-4 bg-ocean-50 rounded-xl border border-ocean-200 text-xs text-[#023E8A] max-w-md mx-auto text-left space-y-1">
              <p className="font-bold">What happens next:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
                <li>We schedule a 15-minute onboarding walkthrough.</li>
                <li>We help import a sample building equipment roster.</li>
                <li>Your field technicians test the offline QR scanner.</li>
              </ul>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    name: '',
                    company: '',
                    phone: '',
                    email: '',
                    technicianCount: '1-5',
                    assetCount: '100-500',
                    trackingMethod: 'Excel Spreadsheets',
                    message: '',
                  });
                }}
                className="text-xs text-[#0077B6] font-semibold underline hover:text-[#023E8A]"
              >
                Submit another request
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border ${
                      errors.name ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-[#0077B6]`}
                  />
                </div>
                {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Company / Agency Name *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Fire Engineering"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border ${
                      errors.company ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-[#0077B6]`}
                  />
                </div>
                {errors.company && <p className="text-[11px] text-red-600 mt-1">{errors.company}</p>}
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
                    } focus:outline-none focus:ring-2 focus:ring-[#0077B6]`}
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Work Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="rajesh@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border ${
                      errors.email ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-[#0077B6]`}
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
                >
                  <option value="1-5">1 &ndash; 5 Technicians</option>
                  <option value="6-15">6 &ndash; 15 Technicians</option>
                  <option value="16-30">16 &ndash; 30 Technicians</option>
                  <option value="30+">30+ Technicians</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Approx. Assets
                </label>
                <select
                  value={formData.assetCount}
                  onChange={(e) => setFormData({ ...formData, assetCount: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
                >
                  <option value="Under 100">Under 100 Assets</option>
                  <option value="100-500">100 &ndash; 500 Assets</option>
                  <option value="500-2000">500 &ndash; 2,000 Assets</option>
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
                >
                  <option value="Paper & Physical Logbooks">Paper Logbooks</option>
                  <option value="Excel Spreadsheets">Excel Spreadsheets</option>
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
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
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
                className="w-full py-3 px-6 bg-[#0077B6] hover:bg-[#023E8A] disabled:bg-slate-400 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <span>Submitting Application...</span>
                ) : (
                  <>
                    <span>Submit Free Pilot Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                No credit card required &bull; Direct access &bull; 100% confidential
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
