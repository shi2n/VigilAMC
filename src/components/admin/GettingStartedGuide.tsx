'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  ChevronRight,
  X,
  HelpCircle,
  Building2,
  Users,
  ShieldCheck,
  Flame,
  ClipboardList,
  Wrench,
  FileText,
  Settings as SettingsIcon,
  LayoutDashboard,
  ExternalLink,
} from 'lucide-react';
import { AdminNavTab } from './AdminSidebar';
import { AdminDictionary } from '@/lib/i18n/admin';
import { SITE_CONFIG } from '@/lib/siteConfig';

interface GettingStartedGuideProps {
  t: AdminDictionary;
  stats: {
    clientsCount: number;
    buildingsCount: number;
    equipmentsCount: number;
    techniciansCount: number;
    inspectionsCount: number;
    workOrdersCount: number;
  };
  onNavigateTab: (tab: AdminNavTab) => void;
  onOpenRegisterModal?: () => void;
}

const STORAGE_KEY_DISMISSED = 'vigilamc_guide_checklist_dismissed';

export function GettingStartedChecklist({
  t,
  stats,
  onNavigateTab,
  onOpenRegisterModal,
}: GettingStartedGuideProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem(STORAGE_KEY_DISMISSED) === 'true';
      setDismissed(isDismissed);
    } catch {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY_DISMISSED, 'true');
    } catch {
      // ignore
    }
  };

  const steps = [
    {
      id: 'step-client',
      title: 'Register your first Client & Building',
      desc: 'Set up your client society and their building premises.',
      done: stats.clientsCount > 0 || stats.buildingsCount > 0,
      actionLabel: 'Register Site',
      onClick: () => {
        if (onOpenRegisterModal) onOpenRegisterModal();
        else onNavigateTab('CLIENTS_SITES');
      },
    },
    {
      id: 'step-equipment',
      title: 'Import or add Fire Assets',
      desc: 'Add fire extinguishers, hydrants, and alarms to premises.',
      done: stats.equipmentsCount > 0,
      actionLabel: 'Add Assets',
      onClick: () => onNavigateTab('FIRE_EQUIPMENT'),
    },
    {
      id: 'step-tech',
      title: 'Invite Field Technicians',
      desc: t.guideInviteTechDesc,
      playLink: true,
      done: stats.techniciansCount > 0,
      actionLabel: 'Add Technicians',
      onClick: () => onNavigateTab('FIELD_TEAM'),
    },
    {
      id: 'step-assign',
      title: 'Assign Buildings to Technicians',
      desc: 'Allocate buildings so technicians see their assigned sites in VigilAMC Field.',
      done: stats.techniciansCount > 0 && stats.buildingsCount > 0,
      actionLabel: 'Manage Team',
      onClick: () => onNavigateTab('FIELD_TEAM'),
    },
    {
      id: 'step-inspection',
      title: 'Log your first Field Inspection',
      desc: 'Perform or record an inspection visit with geo-stamped proof.',
      done: stats.inspectionsCount > 0,
      actionLabel: 'View Inspections',
      onClick: () => onNavigateTab('INSPECTIONS_WORK'),
    },
    {
      id: 'step-report',
      title: 'Review Compliance Reports',
      desc: 'Generate audit-ready Form-B and NBC compliance reports.',
      done: stats.inspectionsCount > 0 && stats.equipmentsCount > 0,
      actionLabel: 'Open Reports',
      onClick: () => onNavigateTab('REPORTS'),
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const isAllComplete = completedCount === steps.length;

  if (dismissed && !isAllComplete) {
    return (
      <button
        onClick={() => setDismissed(false)}
        className="text-xs text-[#C2410C] hover:text-[#9A3412] font-bold flex items-center gap-1.5 transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Resume Setup Checklist ({completedCount}/{steps.length} done)</span>
      </button>
    );
  }

  if (dismissed || isAllComplete) {
    return null;
  }

  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div id="getting-started-guide" className="glass-panel-dense rounded-2xl p-4 sm:p-5 border border-[#FED7AA] bg-gradient-to-br from-white/95 via-[#FFF8F2]/90 to-white/95 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-[#1C1917] text-sm sm:text-base">
              {t.guideChecklistTitle}
            </h3>
          </div>
          <p className="text-xs text-[#44403C]">
            {t.guideChecklistDesc} • <span className="font-bold text-[#C2410C]">{completedCount} of {steps.length} completed</span>
          </p>
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors text-xs font-semibold flex items-center gap-1"
          title={t.guideDismiss}
        >
          <span>{t.guideDismiss}</span>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
        <div
          className="bg-gradient-to-r from-[#EA580C] to-[#FF8C42] h-full transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className={`p-3 rounded-xl border transition-all text-xs flex flex-col justify-between gap-2.5 ${
              step.done
                ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-900'
                : 'bg-white border-[#FED7AA] text-slate-800 hover:border-[#EA580C]/40 shadow-xs'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <span className="shrink-0 mt-0.5">
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300" />
                )}
              </span>
              <div className="space-y-0.5">
                <div className="font-bold text-[#1C1917] flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono">0{idx + 1}</span>
                  <span className={step.done ? 'line-through text-slate-500' : ''}>{step.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{step.desc}</p>
                {step.playLink && (
                  <a
                    href={SITE_CONFIG.GOOGLE_PLAY_URL}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C2410C] hover:text-[#9A3412] hover:underline pt-0.5"
                  >
                    <span>{t.guidePlayStoreLink}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={step.onClick}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                  step.done
                    ? 'text-emerald-700 hover:text-emerald-900 bg-emerald-100/60'
                    : 'text-white bg-[#C2410C] hover:bg-[#9A3412] shadow-xs'
                }`}
              >
                <span>{step.done ? 'View' : step.actionLabel}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: AdminNavTab) => void;
  t: AdminDictionary;
}

export function GuideModal({ isOpen, onClose, onNavigateTab, t }: GuideModalProps) {
  if (!isOpen) return null;

  const sections = [
    {
      tab: 'OVERVIEW' as AdminNavTab,
      icon: LayoutDashboard,
      title: t.navOverview,
      whatFor: 'Your executive cockpit showing live compliance scores, active field velocity, and today’s prioritized alerts.',
      howTo: [
        'Review the "Needs Your Attention" digest every morning for overdue checks.',
        'Track SLA velocity and inspection trends using the interactive 7D/30D/90D/12M switcher.',
      ],
    },
    {
      tab: 'CLIENTS_SITES' as AdminNavTab,
      icon: Building2,
      title: t.navClients,
      whatFor: 'Manage customer societies, commercial complexes, and individual residential towers.',
      howTo: [
        'Click "Register Client & Building" for quick two-column horizontal onboarding.',
        'Import premises spreadsheets directly via Excel (.xlsx).',
      ],
    },
    {
      tab: 'FIRE_EQUIPMENT' as AdminNavTab,
      icon: Flame,
      title: t.navEquipment,
      whatFor: 'The master register of all fire extinguishers, hydrants, smoke detectors, and suppression systems.',
      howTo: [
        'Track equipment live status: Verified, Due Soon (≤30d), or Overdue.',
        'Click any equipment row to edit specifications, pressure dates, or inspection history.',
      ],
    },
    {
      tab: 'INSPECTIONS_WORK' as AdminNavTab,
      icon: ClipboardList,
      title: t.navInspections,
      whatFor: 'Every on-site verification logged by technicians with GPS coordinates and photo proof of visit.',
      howTo: [
        'Filter by Passed vs Action Needed to spot equipment requiring maintenance.',
        'View inspection photographs stored on Cloudflare R2 CDN with tamper-evident stamps.',
      ],
    },
    {
      tab: 'REPAIRS' as AdminNavTab,
      icon: Wrench,
      title: 'Repairs & Work Orders',
      whatFor: 'Operational tickets raised from failed inspections or urgent client maintenance requests.',
      howTo: [
        'Assign jobs directly to field technicians with automated in-app task notifications.',
        'Track statuses from Open → Assigned → In Progress → Completed.',
      ],
    },
    {
      tab: 'FIELD_TEAM' as AdminNavTab,
      icon: Users,
      title: t.navFieldTeam,
      whatFor: 'Manage field technicians, app credentials, building allocations, and live sync status.',
      howTo: [
        t.guideInviteTechDesc,
        'Select Active or Blocked from the dropdown or use bulk selection for multiple staff.',
        'Share credentials via 1-click WhatsApp message including systematic ID and 6-digit PIN.',
      ],
      playLink: true,
    },
    {
      tab: 'REPORTS' as AdminNavTab,
      icon: FileText,
      title: t.navReports,
      whatFor: 'Generate jurisdiction-aware Fire Safety Inspection & Maintenance Reports.',
      howTo: [
        'Select any client building to preview the comprehensive inspection report.',
        'Export high-resolution PDFs with society details, equipment lists, and photos.',
      ],
    },
    {
      tab: 'SETTINGS' as AdminNavTab,
      icon: SettingsIcon,
      title: t.navSettings,
      whatFor: 'Agency branding, contact licenses, alert thresholds, and language preferences.',
      howTo: [
        'Select from all 22 Indian languages under the "Language & Region" section.',
        'Set up automated WhatsApp/SMS alerts for society managers.',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="glass-dialog rounded-3xl max-w-3xl w-full p-5 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto text-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]">
              <HelpCircle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-[#1C1917] text-base sm:text-lg">
                {t.guideTitle}
              </h3>
              <p className="text-xs text-[#44403C]">
                {t.guideSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.tab}
                className="p-4 rounded-2xl bg-white border border-[#FED7AA] space-y-2.5 hover:border-[#EA580C]/40 transition-all shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                    <Icon className="w-4 h-4 text-[#C2410C]" />
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{sec.title}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px] font-medium">
                    {sec.whatFor}
                  </p>
                  <ul className="space-y-1 text-[11px] text-slate-500">
                    {sec.howTo.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#C2410C] font-bold">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  {(sec as any).playLink ? (
                    <a
                      href={SITE_CONFIG.GOOGLE_PLAY_URL}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C2410C] hover:text-[#9A3412] hover:underline"
                    >
                      <span>{t.guidePlayStoreLink}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab(sec.tab);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C2410C] hover:text-[#9A3412] transition-colors"
                  >
                    <span>{t.guideGoTo}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-[#FED7AA] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs shadow-xs transition-all"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
