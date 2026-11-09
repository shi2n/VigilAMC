'use client';

import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  Check,
  Copy,
  ArrowUpRight,
  User,
  Users,
  Headphones,
  Sparkles,
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/siteConfig';

interface EmailChannel {
  id: string;
  role: string;
  email: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  subject: string;
}

const emailChannels: EmailChannel[] = [
  {
    id: 'support',
    role: 'Customer & Technical Support',
    email: SITE_CONFIG.EMAILS.support,
    description: 'Help with equipment roster imports, technician app sync, reports, and onboarding.',
    icon: <Headphones className="w-5 h-5 text-[#EA580C]" />,
    badge: 'Fast response',
    subject: 'VigilAMC Support Request',
  },
  {
    id: 'founder',
    role: 'Founder Desk (Shaizan)',
    email: SITE_CONFIG.EMAILS.founder,
    description: 'Direct line for commercial discussions, pilot rollouts, enterprise terms, and product feedback.',
    icon: <User className="w-5 h-5 text-[#C2410C]" />,
    badge: 'Founder Direct',
    subject: 'Direct Inquiry to Founder',
  },
  {
    id: 'cofounder',
    role: 'Co-Founder & Partnerships',
    email: SITE_CONFIG.EMAILS.cofounder,
    description: 'For fire safety agency partnerships, vendor collaborations, and strategic integrations.',
    icon: <Users className="w-5 h-5 text-[#EA580C]" />,
    badge: 'Partnerships',
    subject: 'Partnership Inquiry',
  },
  {
    id: 'general',
    role: 'General Inquiries & Demo',
    email: SITE_CONFIG.EMAILS.general,
    description: 'Our established official inbox for general inquiries, quotes, and quick agency walkthroughs.',
    icon: <Mail className="w-5 h-5 text-[#C2410C]" />,
    badge: 'Primary Inbox',
    subject: 'General Inquiry / Demo Request',
  },
];

export function ContactSection() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <section
      id="contact"
      data-testid="home-contact-section"
      className="py-16 sm:py-24 bg-white border-t border-[#FED7AA]/40 relative overflow-hidden"
    >
      {/* Subtle fire ambient glow in background */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#EA580C]/5 via-[#FF8C42]/5 to-transparent blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8F2] border border-[#FED7AA] shadow-[0_1px_3px_rgba(28,25,23,0.06)] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
              Direct Team &amp; Founder Desk
            </span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-4xl text-[#1C1917] tracking-tight leading-tight">
            Connect directly with the team building Vigil<span className="text-[#EA580C]">AMC</span>
          </h2>
          <p className="mt-3.5 text-base sm:text-lg text-[#44403C] max-w-2xl mx-auto leading-relaxed">
            Need onboarding assistance, technical support, or want to speak with the founders?
            Reach our dedicated mailboxes below or connect on WhatsApp.
          </p>
        </div>

        {/* 4 Dedicated Email Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-10">
          {emailChannels.map((ch) => {
            const isCopied = copiedId === ch.id;
            const mailtoUrl = `mailto:${ch.email}?subject=${encodeURIComponent(ch.subject)}`;

            return (
              <div
                key={ch.id}
                className="corp-card p-6 sm:p-7 bg-[#FFF8F2]/60 hover:bg-white border border-[#FED7AA]/70 hover:border-[#EA580C]/40 transition-all rounded-2xl shadow-sm hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#FED7AA] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                        {ch.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1C1917] text-base leading-snug">
                          {ch.role}
                        </h3>
                        <span className="text-[11px] font-semibold text-[#C2410C] uppercase tracking-wider">
                          {ch.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[#44403C] leading-relaxed mb-4">
                    {ch.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#FED7AA]/40 flex flex-wrap items-center justify-between gap-2.5">
                  <a
                    href={mailtoUrl}
                    className="inline-flex items-center gap-1.5 font-bold text-sm text-[#EA580C] hover:text-[#C2410C] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] rounded"
                  >
                    <Mail className="w-4 h-4 shrink-0" />
                    <span>{ch.email}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopy(ch.email, ch.id)}
                    aria-label={`Copy ${ch.email} to clipboard`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#FED7AA] hover:border-[#EA580C]/50 text-xs font-semibold text-[#44403C] hover:text-[#1C1917] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C]"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#A8A29E]" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Direct Helpline & WhatsApp Strip */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#1C1917] text-white border border-[#FED7AA]/20 shadow-lg">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF8C42]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Instant Call &amp; WhatsApp Support</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-[#FAFAF9]">
                Need immediate help with your building compliance roster?
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#A8A29E] pt-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FF8C42]" />
                  Mon &ndash; Sat: 9:00 AM &ndash; 7:00 PM IST
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Average response under 15 mins on WhatsApp
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <a
                href={SITE_CONFIG.PHONE_TEL}
                className="flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-[#FFF8F2] text-[#1C1917] font-bold text-sm transition-colors shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF8C42]"
              >
                <Phone className="w-4 h-4 text-[#EA580C]" />
                <span>{SITE_CONFIG.PHONE_DISPLAY}</span>
              </a>

              <a
                href={SITE_CONFIG.WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5C] text-white font-bold text-sm transition-colors shadow-[0_6px_20px_-4px_rgba(37,211,102,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
