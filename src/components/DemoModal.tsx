'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Calendar, Clock, CheckCircle2, Building, Mail, Phone, User, ArrowRight } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    buildingsCount: '3-10',
    preferredDate: '',
    preferredTime: '11:00 AM - 12:00 PM',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid corporate email is required';
    if (!formData.phone.trim() || formData.phone.length < 8) errs.phone = 'Valid phone number is required';
    if (!formData.company.trim()) errs.company = 'Company / Facility name is required';
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
          type: 'DEMO',
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          assetCount: formData.buildingsCount,
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit demo request');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setServerError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setIsSubmitted(false);
    setServerError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={resetAndClose}
    >
      <div
        className="relative max-w-xl w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-[#023E8A] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0077B6] flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Book a 15-Minute Workflow Review</h3>
              <p className="text-xs text-cyan-200 mt-0.5">
                Review your asset rosters, inspection schedules, and compliance workflows directly with our product team
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-navy-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-extrabold text-[#023E8A]">
                Workflow Review Requested!
              </h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{formData.fullName}</strong>. A member of the VigilAMC team will reach out with the calendar invite and dial-in link to <strong>{formData.email}</strong>.
              </p>
              <div className="pt-4">
                <button
                  onClick={resetAndClose}
                  className="px-6 py-2.5 bg-[#0077B6] hover:bg-[#023E8A] text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Return to Website
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                        errors.fullName ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                      } focus:outline-none focus:ring-2 focus:ring-[#0077B6]`}
                    />
                  </div>
                  {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Work Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                        errors.email ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                      } focus:outline-none focus:ring-2 focus:ring-[#0077B6]`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone / Mobile *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      placeholder="+91 98200 12345"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                        errors.phone ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                      } focus:outline-none focus:ring-2 focus:ring-[#0077B6]`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Company / Facility *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Nexus Tech Parks"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                        errors.company ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                      } focus:outline-none focus:ring-2 focus:ring-[#0077B6]`}
                    />
                  </div>
                  {errors.company && <p className="text-xs text-red-600 mt-1">{errors.company}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Estimated Buildings / Towers Managed
                </label>
                <select
                  value={formData.buildingsCount}
                  onChange={(e) => setFormData({ ...formData, buildingsCount: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
                >
                  <option value="1-2">1 to 2 Towers (Up to 250 assets)</option>
                  <option value="3-10">3 to 10 Towers (250 - 1,500 assets)</option>
                  <option value="11-25">11 to 25 Towers (1,500 - 5,000 assets)</option>
                  <option value="25+">25+ Facilities / Enterprise AMC Fleet</option>
                </select>
              </div>

              <div className="p-3 bg-ocean-50 rounded-xl border border-ocean-200 text-xs text-[#023E8A] space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0077B6]" />
                  What you will see in this 15-minute session:
                </p>
                <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                  <li>Instant QR code scanning &amp; digital asset tagging</li>
                  <li>Form-B 1-click generation with fire authority compliance stamps</li>
                  <li>WhatsApp automated renewal alerts for clients &amp; technicians</li>
                </ul>
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
                  className="w-full py-3 px-4 bg-[#0077B6] hover:bg-[#023E8A] disabled:opacity-60 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? 'Reserving Review Session...' : 'Confirm 15-Minute Workflow Review'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
