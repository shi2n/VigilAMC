'use client';

import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Building,
  Mail,
  User,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  Calendar,
  DollarSign,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  investorType: string;
  organization: string;
  websiteLinkedin: string;
  investmentExperience: string;
  investmentRange: string;
  investmentTimeline: string;
  interestMessage: string;
  contributionMessage: string;
  consent: boolean;
  botField: string;
  companyWebsite: string;
}

const INITIAL_STATE: FormState = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  country: 'India',
  investorType: 'Angel Investor',
  organization: '',
  websiteLinkedin: '',
  investmentExperience: 'Active Angel (1-5 deals)',
  investmentRange: '₹10 Lakhs - ₹25 Lakhs',
  investmentTimeline: '1 - 3 months',
  interestMessage: '',
  contributionMessage: '',
  consent: false,
  botField: '',
  companyWebsite: '',
};

export function InvestorForm() {
  const [formData, setFormData] = useState<FormState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name is required (min 2 characters).';
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'A valid email address is required.';
    }

    if (!formData.investorType) {
      newErrors.investorType = 'Please specify your investor profile.';
    }

    if (!formData.consent) {
      newErrors.consent = 'Please confirm the acknowledgment checkbox to continue.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to submit expression of interest.');
      }

      setSubmitted(true);
      setSubmittedId(data.id || null);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(
        err.message || 'An error occurred while submitting your interest. Please try again or write directly to vigilamc@gmail.com.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-navy-950 to-slate-900 border border-emerald-500/30 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-400 block mb-2">
          Expression of Interest Received
        </span>

        <h3 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
          Thank You, {formData.fullName.split(' ')[0]}
        </h3>

        <p className="mt-3 text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          Your information has been logged directly with our founding team. We evaluate strategic synergies and will reach out to you within 24–48 business hours.
        </p>

        {submittedId && (
          <div className="mt-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-cyan-300">
            <span>Reference ID:</span>
            <strong className="text-white font-bold">{submittedId}</strong>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-slate-800 text-xs text-slate-400 max-w-md mx-auto space-y-2">
          <p>
            Have immediate questions or want to review our product architecture directly?
          </p>
          <p className="text-slate-300 font-medium">
            Contact Shaizan Siddiqui directly at{' '}
            <a href="mailto:vigilamc@gmail.com" className="text-cyan-300 underline hover:text-white">
              vigilamc@gmail.com
            </a>{' '}
            or call{' '}
            <a href="tel:+918383890483" className="text-cyan-300 underline hover:text-white">
              +91 83838 90483
            </a>.
          </p>
        </div>

        <button
          onClick={() => {
            setSubmitted(false);
            setFormData(INITIAL_STATE);
          }}
          className="mt-8 text-xs font-semibold text-slate-400 hover:text-white transition-colors underline"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-10 rounded-3xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-2xl relative overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#0077B6]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Honeypot anti-spam fields (hidden from human users) */}
      <div className="hidden" aria-hidden="true">
        <input
          type="text"
          name="botField"
          value={formData.botField}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
        <input
          type="text"
          name="companyWebsite"
          value={formData.companyWebsite}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0077B6]/20 border border-[#0077B6]/40 text-cyan-300 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Confidential Founder Connect</span>
        </div>
        <h3 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
          Express Investment Interest
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
          Tell us about your background, investment thesis, and what interests you about digitizing India’s AMC and recurring service sector.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Row 1: Full Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Full Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border ${
                  errors.fullName ? 'border-red-500' : 'border-slate-800 focus:border-[#0077B6]'
                } text-white placeholder-slate-500 text-xs sm:text-sm outline-none transition-all`}
              />
            </div>
            {errors.fullName && <p className="text-[11px] text-red-400 mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Email Address <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="rahul@venturefund.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border ${
                  errors.email ? 'border-red-500' : 'border-slate-800 focus:border-[#0077B6]'
                } text-white placeholder-slate-500 text-xs sm:text-sm outline-none transition-all`}
              />
            </div>
            {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Row 2: Phone & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Phone / WhatsApp
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-[#0077B6] text-white placeholder-slate-500 text-xs sm:text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              City
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. New Delhi, Bengaluru"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-[#0077B6] text-white placeholder-slate-500 text-xs sm:text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Country
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="India"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-[#0077B6] text-white placeholder-slate-500 text-xs sm:text-sm outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Investor Classification & Organization */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Investor Classification <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                name="investorType"
                value={formData.investorType}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-[#0077B6] text-white text-xs sm:text-sm outline-none transition-all"
              >
                <option value="Angel Investor">Angel Investor</option>
                <option value="Micro VC / Early-Stage VC">Micro VC / Early-Stage VC</option>
                <option value="Family Office">Family Office</option>
                <option value="Strategic / Industry Partner">Strategic / Facilities Industry Partner</option>
                <option value="Operator / Founder-Angel">Operator / Founder-Angel</option>
                <option value="Syndicate Lead">Syndicate Lead</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Organization / Fund / Syndicate Name
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="e.g. Apex Ventures / Independent"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-[#0077B6] text-white placeholder-slate-500 text-xs sm:text-sm outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Row 4: LinkedIn & Investment Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              LinkedIn Profile or Website
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                name="websiteLinkedin"
                value={formData.websiteLinkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-[#0077B6] text-white placeholder-slate-500 text-xs sm:text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Investment Experience Level
            </label>
            <select
              name="investmentExperience"
              value={formData.investmentExperience}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-[#0077B6] text-white text-xs sm:text-sm outline-none transition-all"
            >
              <option value="First-time Angel">First-time Angel Investor</option>
              <option value="Active Angel (1-5 deals)">Active Angel (1–5 portfolio deals)</option>
              <option value="Experienced Angel (5+ deals)">Experienced Angel (5+ portfolio deals)</option>
              <option value="Institutional VC">Institutional VC / Fund Partner</option>
              <option value="Family Office Principal">Family Office Principal</option>
              <option value="Strategic / Industry Operator">Strategic / Industry Operator</option>
            </select>
          </div>
        </div>

        {/* Row 5: Investment Range & Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Anticipated Cheque / Ticket Size
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                name="investmentRange"
                value={formData.investmentRange}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-[#0077B6] text-white text-xs sm:text-sm outline-none transition-all"
              >
                <option value="₹5 Lakhs - ₹10 Lakhs">₹5 Lakhs – ₹10 Lakhs</option>
                <option value="₹10 Lakhs - ₹25 Lakhs">₹10 Lakhs – ₹25 Lakhs</option>
                <option value="₹25 Lakhs - ₹50 Lakhs">₹25 Lakhs – ₹50 Lakhs</option>
                <option value="₹50 Lakhs - ₹1 Crore">₹50 Lakhs – ₹1 Crore</option>
                <option value="₹1 Crore+">₹1 Crore+</option>
                <option value="Flexible / Syndicate / Exploring">Flexible / Syndicate / Exploring</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Investment Timeline
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                name="investmentTimeline"
                value={formData.investmentTimeline}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-[#0077B6] text-white text-xs sm:text-sm outline-none transition-all"
              >
                <option value="Immediate (< 30 days)">Immediate (&lt; 30 days)</option>
                <option value="1 - 3 months">1 – 3 months</option>
                <option value="3 - 6 months">3 – 6 months</option>
                <option value="Tracking for future rounds">Tracking progress for future rounds</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 6: What excites you / Thesis */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Why VigilAMC? / What excites you about this space?
          </label>
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <textarea
              name="interestMessage"
              rows={3}
              value={formData.interestMessage}
              onChange={handleChange}
              placeholder="e.g. Looking to back vertical B2B SaaS tackling unorganized Indian enterprise service contracts..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-[#0077B6] text-white placeholder-slate-500 text-xs sm:text-sm outline-none transition-all resize-y"
            />
          </div>
        </div>

        {/* Row 7: Value Add beyond capital */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            How can you contribute beyond capital? (Optional)
          </label>
          <textarea
            name="contributionMessage"
            rows={2}
            value={formData.contributionMessage}
            onChange={handleChange}
            placeholder="e.g. Enterprise facilities management intros, enterprise GTM advisory, SaaS scaling guidance..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-[#0077B6] text-white placeholder-slate-500 text-xs sm:text-sm outline-none transition-all resize-y"
          />
        </div>

        {/* Statutory Consent Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
              className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-950 text-[#0077B6] focus:ring-0 focus:ring-offset-0 transition-colors"
            />
            <span className="text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed">
              I understand that submitting this form is a private expression of interest and does not constitute an offer, sale, or public solicitation of securities. I agree to receive communications from the VigilAMC founding team.
            </span>
          </label>
          {errors.consent && <p className="text-[11px] text-red-400 mt-1">{errors.consent}</p>}
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#0077B6] via-[#023E8A] to-[#0077B6] hover:from-[#006494] hover:to-[#011F48] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-[#0077B6]/25 hover:shadow-2xl hover:shadow-[#0077B6]/40 transition-all transform hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Transmitting Expression of Interest...</span>
              </>
            ) : (
              <>
                <span>Submit Expression of Interest</span>
                <Send className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
