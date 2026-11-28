'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BellRing,
  Building2,
  CalendarSync,
  CheckCircle2,
  Database,
  Download,
  FileCheck2,
  FileSpreadsheet,
  Flame,
  History,
  Languages,
  Layers,
  Lock,
  MailCheck,
  MapPin,
  Radar,
  ShieldCheck,
  TableProperties,
  Users,
  WifiOff,
} from 'lucide-react';
import { AppleReveal } from '@/components/home/AppleReveal';
import { GooglePlayBadge } from '@/components/GooglePlayBadge';
import { FinalCtaSection } from '@/components/home/FinalCtaSection';
import { HowItWorksContent } from '@/components/features/HowItWorksContent';

interface FeatureTile {
  icon: typeof Award;
  label: string;
  detail: string;
  isRadar?: boolean;
}

interface FeatureCluster {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  surface: 'white' | 'tint';
  tiles: FeatureTile[];
}

const FEATURE_CLUSTERS: FeatureCluster[] = [
  {
    id: 'field-tools',
    badge: 'Cluster 01 · On Site',
    title: 'Field Tools',
    subtitle: 'Built for basements, pump rooms, and technicians working on Android phones across India.',
    surface: 'white',
    tiles: [
      {
        icon: WifiOff,
        label: 'Offline mode',
        detail: 'Complete floor checklists and capture photos without signal; auto-syncs via local outbox when online.',
      },
      {
        icon: MapPin,
        label: 'GPS-stamped photos',
        detail: 'Every camera capture burns in live GPS coordinates, date, time, and Asset Tag ID.',
      },
      {
        icon: Languages,
        label: '10 languages + voice',
        detail: 'Switch between 10 Indian languages and dictate inspection remarks hands-free with browser voice input.',
      },
      {
        icon: BellRing,
        label: 'Task notifications',
        detail: 'Push alerts wake your technician’s home screen the moment a new inspection or repair is assigned.',
      },
    ],
  },
  {
    id: 'office-tools',
    badge: 'Cluster 02 · Agency Desk',
    title: 'Office Tools',
    subtitle: 'Replace fragile spreadsheets and scattered WhatsApp updates with one clean operations workspace.',
    surface: 'tint',
    tiles: [
      {
        icon: FileSpreadsheet,
        label: 'Excel import/export',
        detail: 'Upload entire building and asset registers via .xlsx/.csv in minutes without re-typing equipment.',
      },
      {
        icon: TableProperties,
        label: 'Monthly register .xlsx',
        detail: 'Download clean monthly audit registers ready for society committees and compliance reviewers.',
      },
      {
        icon: Layers,
        label: 'Bulk operations',
        detail: 'Run AMC scheduling cycles, bulk-assign technicians, and update multiple assets in one step.',
      },
      {
        icon: Users,
        label: 'Teams & roles',
        detail: 'Separate role permissions for agency owners, office coordinators, and field technicians.',
      },
    ],
  },
  {
    id: 'reports-compliance',
    badge: 'Cluster 03 · Audit & Client Proof',
    title: 'Reports & Compliance',
    subtitle: 'Turn verified field work into Form B PDFs, proactive due-date digests, and trackable repair closures.',
    surface: 'white',
    tiles: [
      {
        icon: Award,
        label: 'White-label Form B',
        detail: '5-page biannual compliance reports carrying your agency name, logo, license number, and signature.',
      },
      {
        icon: MailCheck,
        label: 'Email reports & due alerts',
        detail: 'Send Form B links and automated 30 / 15 / 7-day expiry reminders straight to clients.',
      },
      {
        icon: History,
        label: 'Asset history timeline',
        detail: 'Every inspection, refill, pressure test, and repair stays tied to its unit for audit verification.',
      },
      {
        icon: Radar,
        label: 'Status chips',
        detail: 'Spot urgent expiries and overdue inspections immediately across every building.',
        isRadar: true,
      },
      {
        icon: CalendarSync,
        label: 'Re-schedule workflow',
        detail: 'Reschedule missed visits and assign follow-up repair jobs without losing earlier defect proof.',
      },
    ],
  },
  {
    id: 'platform',
    badge: 'Cluster 04 · Infrastructure',
    title: 'Platform',
    subtitle: 'Built for agencies running client sites across multiple Indian states.',
    surface: 'tint',
    tiles: [
      {
        icon: Languages,
        label: '22 admin languages',
        detail: 'Operate the office dashboard in English or 22 8th-Schedule Indian languages.',
      },
      {
        icon: Building2,
        label: 'Buildings & units',
        detail: 'Structure multi-tower societies, factories, floors, basements, and pump rooms cleanly.',
      },
      {
        icon: Download,
        label: 'Data export',
        detail: 'Export your client records, asset logs, and inspection history in one click whenever you need them.',
      },
      {
        icon: Database,
        label: 'Secure cloud (Supabase) + app security',
        detail: 'Tenant-isolated PostgreSQL storage, encrypted sessions, and role-scoped access for every company.',
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="w-full bg-[#FFFFFF] text-[#1C1917] overflow-x-clip">
      {/* Apple-Craft Hero */}
      <section
        aria-label="VigilAMC Features Overview"
        className="pt-10 pb-14 sm:pt-14 sm:pb-18 border-b border-[#FED7AA]/50"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8F2 100%)',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8F2] border border-[#FED7AA] mb-5">
            <Flame className="w-4 h-4 text-[#EA580C]" aria-hidden="true" />
            <span className="text-xs sm:text-[13px] font-semibold text-[#C2410C]">
              17 capabilities across 4 pillars
            </span>
          </div>

          <h1 className="font-display text-[38px] sm:text-[54px] lg:text-[66px] font-extrabold leading-[1.06] tracking-[-0.035em] text-[#1C1917] max-w-[900px] mx-auto text-balance">
            Everything else your{' '}
            <span className="text-[#C2410C]">agency runs on.</span>
          </h1>

          <p className="mt-4 sm:mt-5 text-[17px] sm:text-[19px] leading-[1.55] text-[#44403C] max-w-[640px] mx-auto">
            Generic CRMs don&apos;t know IS 2190, NBC 2016 Part 4, or biannual Form B
            declarations. Every tool below is built specifically for Indian fire-safety agencies.
          </p>

          {/* Cluster Quick Links */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {FEATURE_CLUSTERS.map((cluster) => (
              <a
                key={cluster.id}
                href={`#${cluster.id}`}
                className="px-4 py-2 rounded-full bg-white border border-[#FED7AA] text-xs font-bold text-[#1C1917] hover:border-[#C2410C] hover:text-[#C2410C] transition-colors"
              >
                {cluster.title}
              </a>
            ))}
            <a
              href="#how-it-works"
              className="px-4 py-2 rounded-full bg-[#FFF0E6] border border-[#EA580C]/40 text-xs font-bold text-[#C2410C] hover:bg-[#EA580C] hover:text-white transition-colors"
            >
              How It Works
            </a>
          </div>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/contact"
              className="btn-flame w-full sm:w-auto min-h-[48px] px-7 py-3 rounded-2xl text-white font-bold text-[15px] inline-flex items-center justify-center gap-2 shadow-[0_12px_28px_-8px_rgba(194,65,12,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
            >
              <span>Book a Free Demo</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/start-trial"
              className="btn-ghost-flame w-full sm:w-auto min-h-[48px] px-7 py-3 rounded-2xl font-bold text-[15px] inline-flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Clusters 1 & 2 */}
      {FEATURE_CLUSTERS.slice(0, 2).map((cluster) => (
        <ClusterSection key={cluster.id} cluster={cluster} />
      ))}

      {/* Mid-Page FIRE CTA Band */}
      <section
        aria-label="Book a demo mid-page call to action"
        className="py-14 sm:py-16 bg-[#C2410C] text-white border-y border-[#9A3412]/30"
      >
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2 max-w-[600px]">
            <h2 className="font-sans font-bold text-[26px] sm:text-[32px] leading-[1.15] tracking-[-0.02em] text-white">
              Ready to run every building without Excel chaos?
            </h2>
            <p className="text-[15px] sm:text-[16px] text-orange-50 leading-relaxed">
              Bring one building register to a 15-minute live walkthrough to see offline inspections and Form B export on your own data.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="min-h-[48px] px-6 py-3 rounded-2xl bg-white text-[#9A3412] hover:bg-[#FFF8F2] font-bold text-sm inline-flex items-center gap-2 shadow-lg transition-colors"
            >
              <span>Book a Free Demo</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/sample-report"
              className="min-h-[48px] px-6 py-3 rounded-2xl bg-[#9A3412] hover:bg-[#7C2D12] text-white border border-white/40 font-bold text-sm inline-flex items-center gap-2 transition-colors"
            >
              <FileCheck2 className="w-4 h-4" aria-hidden="true" />
              <span>Inspect Sample Form B</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Clusters 3 & 4 */}
      {FEATURE_CLUSTERS.slice(2, 4).map((cluster) => (
        <ClusterSection key={cluster.id} cluster={cluster} />
      ))}

      {/* Combined How It Works Section (Step 01–03 + First Week Timeline) */}
      <HowItWorksContent embedded />

      {/* Field App Availability & Statutory Scope Clarification */}
      <section className="py-14 sm:py-16 bg-white border-t border-[#E7E5E4]">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-[#FFF8F2] border border-[#FED7AA] p-6 sm:p-7 flex flex-col justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C2410C] mb-2">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>Standards Aligned</span>
              </div>
              <h3 className="font-sans font-bold text-xl text-[#1C1917]">
                Built for IS 2190 &amp; NBC 2016 Part 4 workflows
              </h3>
              <p className="mt-2 text-sm text-[#44403C] leading-relaxed">
                Every checklist and 5-page Form B report compiles your verified inspection records, unit serials, and rectification notes. Final statutory submission must always be signed and sealed by your licensed fire-safety agency.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#047857]">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Your agency branding &amp; signatory block stays front and centre.</span>
            </div>
          </div>

          <div className="rounded-3xl bg-[#FFF8F2] border border-[#FED7AA] p-6 sm:p-7 flex flex-col justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C2410C] mb-2">
                <Lock className="w-4 h-4" aria-hidden="true" />
                <span>Android Field App · com.vigilamc</span>
              </div>
              <h3 className="font-sans font-bold text-xl text-[#1C1917]">
                Download VigilAMC Field on Google Play
              </h3>
              <p className="mt-2 text-sm text-[#44403C] leading-relaxed">
                Also works cleanly on Android via the web app with the same Staff ID &amp; PIN account.
              </p>
            </div>
            <div className="pt-1">
              <GooglePlayBadge size="md" theme="dark" />
            </div>
          </div>
        </div>
      </section>

      {/* Final Conversion Band */}
      <FinalCtaSection />
    </div>
  );
}

function ClusterSection({ cluster }: { cluster: FeatureCluster }) {
  const isTint = cluster.surface === 'tint';
  return (
    <section
      id={cluster.id}
      aria-labelledby={`${cluster.id}-heading`}
      className={`py-16 sm:py-22 border-t border-[#FED7AA]/50 ${
        isTint ? 'bg-[#FFF8F2]' : 'bg-white'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <AppleReveal className="max-w-[680px] mb-10 sm:mb-12">
          <p className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.12em] text-[#C2410C] mb-2.5">
            {cluster.badge}
          </p>
          <h2
            id={`${cluster.id}-heading`}
            className="font-sans font-bold text-[30px] sm:text-[40px] leading-[1.1] tracking-[-0.03em] text-[#1C1917]"
          >
            {cluster.title}
          </h2>
          <p className="mt-3 text-[16px] sm:text-[18px] text-[#44403C] leading-relaxed">
            {cluster.subtitle}
          </p>
        </AppleReveal>

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${
            cluster.tiles.length >= 5 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
          } gap-5`}
        >
          {cluster.tiles.map((tile, idx) => {
            const Icon = tile.icon;
            return (
              <AppleReveal key={tile.label} delayMs={(idx % 4) * 50}>
                <div
                  className={`h-full rounded-2xl border p-6 flex flex-col justify-between transition-all duration-150 hover:-translate-y-0.5 ${
                    isTint
                      ? 'bg-white border-[#FED7AA]/80 shadow-[0_12px_30px_-20px_rgba(28,25,23,0.12)]'
                      : 'bg-[#FFF8F2]/75 border-[#FED7AA]/80 hover:bg-[#FFF8F2]'
                  }`}
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#FED7AA] flex items-center justify-center mb-4 shadow-xs">
                      <Icon className="w-5 h-5 text-[#C2410C]" aria-hidden="true" />
                    </div>
                    <h3 className="font-sans font-bold text-[16px] text-[#1C1917]">
                      {tile.label}
                    </h3>
                    <p className="mt-2 text-[14px] text-[#44403C] leading-relaxed">
                      {tile.detail}
                    </p>
                  </div>

                  {tile.isRadar && (
                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FEE2E2] text-[#991B1B] border border-[#DC2626]/40 text-[11px] font-bold">
                        EXPIRED
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#D97706]/40 text-[11px] font-bold">
                        DUE SOON
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#D1FAE5] text-[#065F46] border border-[#059669]/40 text-[11px] font-bold">
                        OK
                      </span>
                    </div>
                  )}
                </div>
              </AppleReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
