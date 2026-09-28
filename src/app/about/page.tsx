'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Target,
  Award,
  Users,
  Building,
  CheckCircle2,
  ArrowRight,
  Flame,
  FileCheck2,
  Calendar,
  Globe2,
  HeartHandshake,
  Linkedin,
  Instagram,
  Youtube
} from 'lucide-react';

export default function AboutUsPage() {
  const leadershipTeam = [
    {
      name: 'Capt. Vikramaditya Rathore',
      role: 'Co-Founder & Chief Executive Officer',
      background: '20+ years leading industrial life-safety operations across petrochemical complexes and airport infrastructures. Former NFPA technical committee advisor.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Priyanka Nambiar',
      role: 'Co-Founder & Chief Technology Officer',
      background: 'Ex-Google Cloud Principal Architect. Pioneered distributed offline-first mobile synchronization and cryptographic compliance audit trails.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'K. V. Rao, FIFireE',
      role: 'Chief Compliance & Regulatory Officer',
      background: 'Former Deputy Chief Fire Officer with 28 years of municipal fire service. Author of regulatory implementation handbooks on Form-B certification and NBC 2016.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Aditi Deshmukh',
      role: 'Head of Customer Success & Operations',
      background: 'Managed facility safety compliance portfolios for over 12 million square feet of Grade-A commercial real estate across Mumbai and Bengaluru.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const milestones = [
    {
      year: '2022',
      title: 'The Paper Chaos Spark',
      desc: 'Founded in New Delhi after our founders witnessed a premier commercial tower fail a surprise Fire Directorate inspection over two misplaced handwritten inspection cards.',
    },
    {
      year: '2023',
      title: 'First 50 Towers & Metallic QR Innovation',
      desc: 'Introduced ruggedized anodized metallic QR stickers and offline mobile synchronization for underground basements with zero cell coverage.',
    },
    {
      year: '2024',
      title: 'Form-B Statutory Autopilot Engine',
      desc: 'Engineered 1-click legal Form-B PDF generation compliant with the Maharashtra Fire Act, expanding to commercial IT parks across Bengaluru and Pune.',
    },
    {
      year: '2025',
      title: 'IoT Telemetry & 10,000 Assets Milestone',
      desc: 'Added live pressure transducer telemetry for wet risers and reservoir level sensors, surpassing 10,000 actively monitored fire assets.',
    },
    {
      year: '2026',
      title: 'Enterprise Multi-Tenant Cloud Launch',
      desc: 'Architected for Indian and global fire safety AMC agencies with automated Form-B certification and tamper-evident QR verification.',
    },
  ];

  return (
    <div className="w-full bg-white">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-ocean-50 to-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-white px-3.5 py-1.5 rounded-full border border-ocean-200 shadow-sm">
            About VigilAMC
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#023E8A] tracking-tight mt-4">
            Protecting Lives and Livelihoods Through Ironclad Compliance
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            We are certified fire safety engineers, former fire brigade officers, and enterprise software architects united by a singular purpose: making missed compliance deadlines impossible.
          </p>
        </div>
      </section>

      {/* Origin Story Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0077B6] bg-ocean-50 px-3 py-1 rounded-full border border-ocean-200">
              Why We Exist
            </span>
            <h2 className="text-3xl font-extrabold text-[#023E8A] tracking-tight">
              The True Cost of a Missed Fire Compliance Deadline
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Every day across the country, dedicated AMC teams track hundreds of fire extinguishers, hydrant landing valves, and alarm panels across dozens of buildings — on paper cards, clipboards, and Excel spreadsheets.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              When dates are tracked manually, renewals inevitably slip. An extinguisher in a remote electrical room loses pressure unnoticed. A 3-year hydrostatic test deadline expires quietly. Then comes the municipal Fire Officer audit.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              The client fails their fire NOC audit, faces shut-down notices, and the AMC contractor who worked hard for years gets fired on the spot. We built VigilAMC so that no compliant AMC contractor ever loses a customer to broken paper again.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="corp-card p-8 bg-gradient-to-br from-[#023E8A] to-[#0077B6] text-white shadow-xl rounded-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-cyan-200">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Our Core Mission</h3>
                <p className="text-cyan-100 text-sm sm:text-base leading-relaxed">
                  &ldquo;To eliminate 100% of fire safety compliance lapses across global built infrastructure by putting asset tracking, scheduled maintenance, and statutory certification on infallible digital autopilot.&rdquo;
                </p>
                <div className="pt-4 border-t border-white/20 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-white">NBC 2016</span>
                    <p className="text-cyan-200 mt-0.5">Part 4 Life Safety Code</p>
                  </div>
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-white">IS 2190</span>
                    <p className="text-cyan-200 mt-0.5">Maintenance Protocol</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory Standards & Compliance Certifications */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-white px-3 py-1 rounded-full border border-slate-200">
              Regulatory Standards
            </span>
            <h2 className="text-3xl font-extrabold text-[#023E8A] mt-3">
              Built Strictly According to Statutory Fire Codes
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every inspection workflow and Form-B field in VigilAMC is grounded in recognized life safety standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="corp-card p-6 bg-white">
              <div className="w-10 h-10 rounded-lg bg-ocean-50 text-[#0077B6] flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">National Building Code (NBC 2016)</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Part 4 Fire &amp; Life Safety requirements for commercial, residential, healthcare, and industrial occupancies including riser flow standards and extinguisher spatial density.
              </p>
            </div>

            <div className="corp-card p-6 bg-white">
              <div className="w-10 h-10 rounded-lg bg-navy-50 text-[#023E8A] flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">NFPA 10, 25 &amp; 72 Standards</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Standard for Portable Fire Extinguishers (NFPA 10), Inspection and Testing of Water-Based Fire Protection Systems (NFPA 25), and National Fire Alarm &amp; Signaling Code (NFPA 72).
              </p>
            </div>

            <div className="corp-card p-6 bg-white">
              <div className="w-10 h-10 rounded-lg bg-ocean-50 text-[#0077B6] flex items-center justify-center mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">State Fire Prevention Acts &amp; Form-B</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Section 3(1) of the Maharashtra Fire Prevention and Life Safety Measures Act and equivalent municipal fire directorate biannual certification protocols.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#0077B6] bg-ocean-50 px-3 py-1 rounded-full border border-ocean-200">
            Leadership Team
          </span>
          <h2 className="text-3xl font-extrabold text-[#023E8A] mt-3">
            Guided by Proven Fire Safety &amp; Tech Veterans
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Combining decades of frontline municipal firefighting expertise with modern enterprise cloud engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {leadershipTeam.map((leader, i) => (
            <div key={i} className="corp-card overflow-hidden bg-white text-center">
              <div className="h-48 overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="p-5">
                <h4 className="text-sm font-bold text-slate-900">{leader.name}</h4>
                <p className="text-[11px] font-semibold text-[#0077B6] mt-0.5">{leader.role}</p>
                <p className="text-xs text-slate-500 mt-3 leading-relaxed text-left">
                  {leader.background}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Company Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-[#023E8A]">
              Our Journey of Innovation
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              From our first 50 extinguisher QR tags to safeguarding hundreds of premier high-rise facilities.
            </p>
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 md:before:left-1/2 before:w-0.5 before:bg-ocean-200">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="relative flex flex-col md:flex-row items-start md:items-center gap-6"
              >
                <div className={`md:w-1/2 ${idx % 2 === 0 ? 'md:text-right md:pr-10' : 'md:order-2 md:pl-10'}`}>
                  <span className="text-xs font-black text-[#0077B6] bg-ocean-50 px-2.5 py-0.5 rounded border border-ocean-200">
                    {m.year}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{m.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{m.desc}</p>
                </div>

                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#0077B6] border-4 border-white shadow flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>

                <div className={`hidden md:block md:w-1/2 ${idx % 2 === 0 ? 'md:order-2' : ''}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 bg-[#023E8A] text-white text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl font-extrabold">Ready to Partner With VigilAMC?</h2>
          <p className="text-cyan-100 text-sm">
            Contact our leadership team or request an on-site compliance pilot today.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0077B6] hover:bg-white hover:text-[#023E8A] font-bold text-sm rounded-xl transition-all shadow-lg"
            >
              <span>Schedule a Meeting With Our Team</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Social Channels Strip */}
          <div className="pt-8 border-t border-navy-700/60 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-cyan-200">
            <span className="font-semibold text-slate-200">Follow Our Journey (@vigilamc):</span>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/company/vigilamc/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#0A66C2] flex items-center justify-center text-white transition-colors"
                aria-label="LinkedIn"
                title="LinkedIn: vigilamc"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/vigilamc"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] flex items-center justify-center text-white transition-colors"
                aria-label="Instagram"
                title="Instagram: @vigilamc"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/vigilamc"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-black flex items-center justify-center text-white transition-colors"
                aria-label="X (Twitter)"
                title="X (Twitter): @vigilamc"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@vigilamc"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#FF0000] flex items-center justify-center text-white transition-colors"
                aria-label="YouTube"
                title="YouTube: @vigilamc"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
