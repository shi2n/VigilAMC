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
  MessageSquare,
  Sparkles,
  Layers,
  AlertCircle
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    facilityType: 'commercial',
    assetCount: '300-1000',
    preferredDate: '',
    preferredTime: '11:00 AM IST',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.email.trim()) {
      errs.email = 'Corporate email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid work email address';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (formData.phone.replace(/[^0-9]/g, '').length < 8) {
      errs.phone = 'Please enter a valid phone number with area code';
    }
    if (!formData.company.trim()) errs.company = 'Company / Facility name is required';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 700);
  };

  const offices = [
    {
      city: 'New Delhi',
      address: 'New Delhi 110092',
      phone: '+91 83838 90483',
      email: 'vigilamc@gmail.com',
      hours: 'Mon - Sat: 9:00 AM - 7:00 PM IST',
    },
  ];

  return (
    <div className="w-full bg-white">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-ocean-50 to-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-white px-3.5 py-1.5 rounded-full border border-ocean-200 shadow-sm">
            Connect With Our Compliance Engineers
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#023E8A] tracking-tight mt-4">
            Schedule a Live Demo or Request a Free Audit
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Speak directly with our certified fire safety advisors. We will review your equipment roster and demonstrate how VigilAMC automates your exact Form-B compliance flow.
          </p>
        </div>
      </section>

      {/* Main Form & Calendar Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Info & Quick Schedule */}
          <div className="lg:col-span-5 space-y-8">
            <div className="corp-card p-6 bg-slate-50 border-ocean-200">
              <h3 className="text-base font-bold text-[#023E8A] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0077B6]" />
                Direct Fire Safety Advisory Lines
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Need urgent assistance ahead of an upcoming Fire Directorate inspection or Form-B renewal deadline? Reach our compliance desk directly:
              </p>

              <div className="mt-5 space-y-3.5 text-xs text-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#0077B6] shadow-sm">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Direct Phone / Helpline</span>
                    <a href="tel:+918383890483" className="font-extrabold text-[#023E8A] text-sm hover:underline">
                      +91 83838 90483
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#0077B6] shadow-sm">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Inquiries</span>
                    <a href="mailto:vigilamc@gmail.com" className="font-bold text-slate-800 hover:text-[#0077B6]">
                      vigilamc@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#0077B6] shadow-sm">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Response Commitment</span>
                    <span className="font-semibold text-emerald-600">Within 15 minutes during business hours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Pilot Promise */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#023E8A] to-[#0077B6] text-white space-y-3 shadow-lg">
              <span className="text-xs font-bold text-cyan-200 uppercase tracking-wider">
                The VigilAMC 14-Day Pilot Promise
              </span>
              <h4 className="text-lg font-bold text-white">
                Test VigilAMC in One Building With Zero Obligation
              </h4>
              <ul className="space-y-1.5 text-xs text-cyan-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
                  50 free pre-printed metallic QR tags mailed to your office
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
                  Full access to the offline technician mobile app
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
                  Instant Form-B sample generation for your building
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Contact & Demo Booking Form with Validation */}
          <div className="lg:col-span-7">
            <div className="corp-card p-8 bg-white border-slate-200 shadow-xl">
              {isSubmitted ? (
                <div className="py-12 text-center space-y-4 animate-in fade-in duration-300">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-[#023E8A]">
                    Demo Booking Confirmed!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong>{formData.fullName}</strong>. Your 15-minute live platform walkthrough has been scheduled for{' '}
                    <strong>{formData.preferredTime}</strong>. A calendar invite and Google Meet link have been sent to{' '}
                    <strong>{formData.email}</strong>.
                  </p>
                  <div className="p-4 bg-ocean-50 rounded-xl border border-ocean-200 text-xs text-[#023E8A] max-w-md mx-auto text-left">
                    <p className="font-bold">Next Steps:</p>
                    <p className="text-slate-600 mt-1">
                      Our Lead Fire Compliance Specialist (K. V. Rao) will share their screen to demonstrate asset QR tagging, offline mobile auditing, and legal Form-B PDF generation tailored to <strong>{formData.company}</strong>.
                    </p>
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({
                          fullName: '',
                          email: '',
                          phone: '',
                          company: '',
                          facilityType: 'commercial',
                          assetCount: '300-1000',
                          preferredDate: '',
                          preferredTime: '11:00 AM IST',
                          message: '',
                        });
                      }}
                      className="px-6 py-2.5 bg-[#0077B6] hover:bg-[#023E8A] text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div>
                    <h3 className="text-xl font-extrabold text-[#023E8A]">
                      Request Live Walkthrough &amp; Free AMC Health Check
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Fill out the details below and our team will prepare a customized demonstration.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Full Name *
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
                        Work Email *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          placeholder="ramesh@company.com"
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
                        Phone / Mobile *
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
                        Company / Facility Name *
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="e.g. Apex Fire Engineering"
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
                        Facility Occupancy Type
                      </label>
                      <select
                        value={formData.facilityType}
                        onChange={(e) => setFormData({ ...formData, facilityType: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
                      >
                        <option value="commercial">Commercial Tower / IT Park</option>
                        <option value="hospital">Healthcare / Hospital</option>
                        <option value="industrial">Manufacturing &amp; Logistics</option>
                        <option value="residential">High-Rise Residential Society</option>
                        <option value="contractor">Fire Safety AMC Agency (Multi-Site)</option>
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

                  {/* Preferred Time Slot Simulator */}
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
                      Specific Requirements or Current Challenges
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Currently tracking 850 extinguishers on Excel across 6 buildings. Need Form-B automated for our November audit."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 bg-[#0077B6] hover:bg-[#023E8A] disabled:bg-slate-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>Reserving Your Live Session...</span>
                      ) : (
                        <>
                          <span>Confirm 15-Minute Live Walkthrough</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-slate-400 mt-2">
                      Zero spam guarantee &bull; 100% confidential &bull; No credit card needed
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Office Location */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-white px-3 py-1 rounded-full border border-slate-200">
              Corporate Office
            </span>
            <h2 className="text-3xl font-extrabold text-[#023E8A] mt-3">
              New Delhi Location
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Our core safety compliance advisory and support team is headquartered in New Delhi.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            {offices.map((office, idx) => (
              <div key={idx} className="corp-card p-8 bg-white border border-slate-200 shadow-lg rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-ocean-50 text-[#0077B6] flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">{office.city}</h4>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {office.address}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 text-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Phone / WhatsApp</span>
                    <a href={`tel:${office.phone.replace(/[^0-9+]/g, '')}`} className="text-[#0077B6] font-bold hover:underline">
                      {office.phone}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Email</span>
                    <a href={`mailto:${office.email}`} className="text-slate-700 hover:text-[#0077B6] font-medium">
                      {office.email}
                    </a>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-xs text-slate-500">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider">Working Hours</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {office.hours}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
