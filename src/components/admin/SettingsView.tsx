'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  FileSpreadsheet,
  Upload,
  Users,
  ShieldCheck,
  Bell,
  Download,
  Sparkles,
  CalendarClock,
  FileSignature,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { AlertsSettingsView } from './AlertsSettingsView';
import { TechnicianManagement } from './TechnicianManagement';
import { AdminUsersView } from './AdminUsersView';
import { ALL_INDIAN_LANGUAGES } from '@/lib/i18n/admin';
import { compressImageToDataUrl, uploadCompressedPhoto } from '@/lib/compressImage';

export type SettingsSubTab =
  | 'AGENCY'
  | 'CYCLES'
  | 'BRANDING'
  | 'TEAM'
  | 'ADMINS'
  | 'ALERTS'
  | 'IMPORT_EXPORT';

interface SettingsViewProps {
  subTab?: SettingsSubTab;
  setSubTab?: (tab: SettingsSubTab) => void;
  companyForm: any;
  setCompanyForm: any;
  handleSaveCompany: (e: React.FormEvent) => void;
  onOpenImport?: (type?: any) => void;
  onOpenExport?: (type?: any) => void;
  currentUser?: any;
  userProfile?: any;
  company?: any;
  showToast: (msg: string) => void;
  initialTechnicians?: any[];
  initialBuildings?: any[];
  initialSeatUsage?: any;
  initialPlan?: any;
  onRefreshDashboard?: () => Promise<void> | void;
  onNavigateTab?: (tab: any) => void;
}

export function SettingsView({
  subTab: externalSubTab,
  setSubTab: externalSetSubTab,
  companyForm,
  setCompanyForm,
  handleSaveCompany,
  onOpenImport,
  onOpenExport,
  currentUser,
  userProfile,
  company,
  showToast,
  initialTechnicians,
  initialBuildings,
  initialSeatUsage,
  initialPlan,
  onRefreshDashboard,
  onNavigateTab,
}: SettingsViewProps) {
  const [internalSubTab, setInternalSubTab] = useState<SettingsSubTab>('AGENCY');
  const [whiteLabelEnabled, setWhiteLabelEnabled] = useState<boolean>(true);
  const [quarterlyAmcFee, setQuarterlyAmcFee] = useState<string>('12500');
  const [refillServiceFee, setRefillServiceFee] = useState<string>('650');
  const [selectedLang, setSelectedLang] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vigilamc_admin_language') || userProfile?.preferredLanguage || 'en';
    }
    return userProfile?.preferredLanguage || 'en';
  });

  const handleSelectLanguage = async (code: string) => {
    setSelectedLang(code);
    try {
      localStorage.setItem('vigilamc_admin_language', code);
      await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredLanguage: code }),
      });
      const langName = ALL_INDIAN_LANGUAGES.find((l) => l.code === code)?.name || code;
      showToast(`Dashboard language updated to ${langName}`);
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err: any) {
      showToast(err.message || 'Failed to update language');
    }
  };

  const activeSubTab = externalSubTab || internalSubTab;
  const setActiveSubTab = (tab: SettingsSubTab) => {
    if (externalSetSubTab) externalSetSubTab(tab);
    setInternalSubTab(tab);
  };

  // Standard B2B Agency settings tabs ONLY
  const agencyTabs = [
    { id: 'AGENCY', label: 'Agency Profile & License', icon: Building2 },
    { id: 'CYCLES', label: 'Compliance Cycles', icon: CalendarClock },
    { id: 'BRANDING', label: 'Report Branding', icon: FileSignature },
    { id: 'TEAM', label: 'Technician Workforce', icon: Users },
    { id: 'ADMINS', label: 'Admin Users & Roles', icon: ShieldCheck },
    { id: 'ALERTS', label: 'Alerts & Notifications', icon: Bell },
    { id: 'IMPORT_EXPORT', label: 'Import & Export Data', icon: FileSpreadsheet },
  ];

  // Module C: Compliance Cycles state
  const [autoSchedulingEnabled, setAutoSchedulingEnabled] = useState<boolean>(
    company?.autoSchedulingEnabled !== false
  );
  const [cycleBuildings, setCycleBuildings] = useState<any[]>(initialBuildings || []);
  const [savingCycles, setSavingCycles] = useState<boolean>(false);
  const [runningNow, setRunningNow] = useState<boolean>(false);
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);
  const [uploadingSig, setUploadingSig] = useState<boolean>(false);

  useEffect(() => {
    if (Array.isArray(initialBuildings)) {
      setCycleBuildings(
        initialBuildings.map((b) => ({
          id: b.id,
          name: b.name,
          address: b.address,
          complianceCycle: b.complianceCycle || 'QUARTERLY',
          leadTimeDays: typeof b.leadTimeDays === 'number' ? b.leadTimeDays : 7,
          cycleOverrides:
            b.cycleOverrides && typeof b.cycleOverrides === 'object' ? b.cycleOverrides : {},
        }))
      );
    }
  }, [initialBuildings]);

  useEffect(() => {
    if (company && typeof company.autoSchedulingEnabled === 'boolean') {
      setAutoSchedulingEnabled(company.autoSchedulingEnabled);
    }
  }, [company]);

  const handleSaveCycles = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCycles(true);
    try {
      const res = await fetch('/api/admin/compliance-cycles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoSchedulingEnabled,
          buildings: cycleBuildings.map((b) => ({
            id: b.id,
            complianceCycle: b.complianceCycle,
            leadTimeDays: Number(b.leadTimeDays) || 7,
            cycleOverrides: b.cycleOverrides || {},
          })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Failed to save compliance cycles');
      toast.success('Compliance cycles & lead-time rules saved');
      showToast('Compliance cycles & lead-time rules saved');
      if (onRefreshDashboard) await onRefreshDashboard();
    } catch (err: any) {
      const msg = err?.message || 'Failed to save compliance cycles';
      toast.error(msg);
      showToast(msg);
    } finally {
      setSavingCycles(false);
    }
  };

  const handleRunSchedulerNow = async () => {
    setRunningNow(true);
    try {
      const res = await fetch('/api/admin/compliance-cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Failed to run scheduler');
      const msg = `${json.createdCount ?? 0} tasks created, ${json.skippedCount ?? 0} already open`;
      toast.success(msg);
      showToast(msg);
      if (onRefreshDashboard) await onRefreshDashboard();
    } catch (err: any) {
      const msg = err?.message || 'Error running scheduler';
      toast.error(msg);
      showToast(msg);
    } finally {
      setRunningNow(false);
    }
  };

  const handleUploadBrandAsset = async (
    file: File,
    targetField: 'brandLogoUrl' | 'signatorySignatureUrl'
  ) => {
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a PNG or JPEG image');
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error('Image must be 1 MB or smaller');
      return;
    }
    const setBusy = targetField === 'brandLogoUrl' ? setUploadingLogo : setUploadingSig;
    setBusy(true);
    try {
      const uploaded = await uploadCompressedPhoto(
        file,
        'equipment',
        { maxDimension: 600, quality: 0.85 }
      ).catch(async () => ({
        url: await compressImageToDataUrl(file, { maxDimension: 600, quality: 0.85 }),
      }));
      setCompanyForm((prev: any) => ({ ...prev, [targetField]: uploaded.url }));
      toast.success(
        targetField === 'brandLogoUrl'
          ? 'Agency logo uploaded — click Save Report Branding to apply'
          : 'Signatory signature uploaded — click Save Report Branding to apply'
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to process image');
    } finally {
      setBusy(false);
    }
  };

  const isOwnerUser = Boolean(
    currentUser?.email &&
      /shaizan/i.test(String(currentUser.email))
  );

  return (
    <div className="glass-panel-dense rounded-2xl p-5 sm:p-6 space-y-6 text-[#1C1917]">
      {/* Sub Navigation Bar */}
      <div className="flex items-center justify-between border-b border-[#1C1917]/10 pb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {agencyTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as SettingsSubTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#FFF0E6] text-[#C2410C] border border-[#EA580C]/40 font-bold shadow-xs'
                    : 'bg-white/75 text-[#44403C] hover:text-[#1C1917] border border-[#FED7AA]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-[#C2410C]" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          TAB: AGENCY PROFILE & LICENSE
      ========================================================================= */}
      {activeSubTab === 'AGENCY' && (
        <div className="space-y-4 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-[#1C1917]">Agency Organization Profile</h3>
            <p className="text-xs text-[#44403C]">
              Official statutory credentials printed on state fire compliance certificates and equipment schedules.
            </p>
          </div>

          <form
            onSubmit={handleSaveCompany}
            className="p-5 rounded-2xl bg-white/70 border border-[#FED7AA] space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#1C1917] font-bold mb-1">
                  Company / Agency Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  placeholder="e.g. National Fire Safety & AMC Services"
                  className="glass-input w-full rounded-xl p-3 text-[#1C1917] font-medium shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[#1C1917] font-bold mb-1">
                  Admin Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyForm.fullName || ''}
                  onChange={(e) => setCompanyForm({ ...companyForm, fullName: e.target.value })}
                  placeholder="e.g. Agency Director"
                  className="glass-input w-full rounded-xl p-3 text-[#1C1917] font-medium shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#1C1917] font-bold mb-1">
                  Govt. Fire License Number *
                </label>
                <input
                  type="text"
                  required
                  value={companyForm.licenseNumber}
                  onChange={(e) => setCompanyForm({ ...companyForm, licenseNumber: e.target.value })}
                  placeholder="e.g. DL/FIRE/LIC/2026/042"
                  className="glass-input w-full rounded-xl p-3 text-[#1C1917] font-medium shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[#1C1917] font-bold mb-1">
                  Emergency Dispatch Phone *
                </label>
                <input
                  type="text"
                  required
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  placeholder="e.g. +91 98200 11223"
                  className="glass-input w-full rounded-xl p-3 text-[#1C1917] font-medium shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#1C1917] font-bold mb-1">
                Official Service Email *
              </label>
              <input
                type="email"
                required
                value={companyForm.email}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                placeholder="e.g. service@nationalfireamc.in"
                className="glass-input w-full rounded-xl p-3 text-[#1C1917] font-medium shadow-xs"
              />
            </div>

            <div>
              <label className="block text-[#1C1917] font-bold mb-1">
                Registered Service Office Address *
              </label>
              <textarea
                rows={2}
                required
                value={companyForm.address}
                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                placeholder="e.g. Plot 24, Industrial Area Phase III, New Delhi - 110020"
                className="glass-input w-full rounded-xl p-3 text-[#1C1917] font-medium shadow-xs"
              />
            </div>

            {/* C6: White-label toggle + fee fields using ember accents */}
            <div className="pt-3 border-t border-[#1C1917]/10 space-y-3">
              {/* Org-level Client Portal and Public Verification Controls (Part 1 D2) */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FFF0E6]/70 border border-[#FED7AA]">
                <div className="space-y-0.5">
                  <div className="font-bold text-[#1C1917] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#C2410C]" />
                    <span>Client Portal Access (Master Switch)</span>
                  </div>
                  <p className="text-[11px] text-[#44403C]">
                    Allow client contacts to access their dedicated read-only /portal view and acknowledge Form-B report receipts.
                  </p>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('CLIENT_PORTAL')}
                      className="mt-1 text-xs font-bold text-[#C2410C] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Manage Portal Users &amp; Magic Links &rarr;</span>
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  role="switch"
                  data-testid="toggle-client-portal-master"
                  aria-checked={companyForm.clientPortalEnabled !== false}
                  onClick={() =>
                    setCompanyForm({
                      ...companyForm,
                      clientPortalEnabled: companyForm.clientPortalEnabled === false ? true : false,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    companyForm.clientPortalEnabled !== false ? 'bg-[#C2410C]' : 'bg-[#44403C]/30'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ${
                      companyForm.clientPortalEnabled !== false ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FFF0E6]/70 border border-[#FED7AA]">
                <div className="space-y-0.5">
                  <div className="font-bold text-[#1C1917] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C2410C]" />
                    <span>Public Verification Pages (/verify/[assetTag])</span>
                  </div>
                  <p className="text-[11px] text-[#44403C]">
                    Permit public asset compliance status lookups without login. When disabled, public tag checks show &quot;Record not available&quot;.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  data-testid="toggle-public-verification"
                  aria-checked={companyForm.publicVerificationEnabled !== false}
                  onClick={() =>
                    setCompanyForm({
                      ...companyForm,
                      publicVerificationEnabled: companyForm.publicVerificationEnabled === false ? true : false,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    companyForm.publicVerificationEnabled !== false ? 'bg-[#C2410C]' : 'bg-[#44403C]/30'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ${
                      companyForm.publicVerificationEnabled !== false ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FFF0E6]/70 border border-[#FED7AA]">
                <div className="space-y-0.5">
                  <div className="font-bold text-[#1C1917] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C2410C]" />
                    <span>White-Label Client Certificates</span>
                  </div>
                  <p className="text-[11px] text-[#44403C]">
                    Display your agency logo and license header on printed Annex B / Form-B PDF reports
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={whiteLabelEnabled}
                  onClick={() => setWhiteLabelEnabled((v) => !v)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    whiteLabelEnabled ? 'bg-[#C2410C]' : 'bg-[#44403C]/30'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ${
                      whiteLabelEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1C1917] font-bold mb-1">
                    Standard Quarterly AMC Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={quarterlyAmcFee}
                    onChange={(e) => setQuarterlyAmcFee(e.target.value)}
                    className="glass-input w-full rounded-xl p-2.5 text-[#1C1917] font-semibold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[#1C1917] font-bold mb-1">
                    Per-Cylinder Refill Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={refillServiceFee}
                    onChange={(e) => setRefillServiceFee(e.target.value)}
                    className="glass-input w-full rounded-xl p-2.5 text-[#1C1917] font-semibold tabular-nums"
                  />
                </div>
              </div>
            </div>

            {isOwnerUser && (
              <div className="p-3 rounded-xl bg-white/80 border border-[#FED7AA] text-[11px] text-[#44403C]">
                Platform Support Contact:vigilamc.support@gmail.com
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="btn-flame px-6 py-3 rounded-xl text-white font-bold text-xs shadow-xs"
              >
                Save Agency Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB: COMPLIANCE CYCLES & AUTO WORK ORDERS (MODULE C)
      ========================================================================= */}
      {activeSubTab === 'CYCLES' && (
        <form
          onSubmit={handleSaveCycles}
          data-testid="settings-cycles-panel"
          className="space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#FED7AA]">
            <div>
              <h3 className="text-base font-bold text-[#1C1917]">
                Compliance Cycles &amp; Lead-Time Auto-Scheduler
              </h3>
              <p className="text-xs text-[#44403C]">
                Configure inspection frequency per building, optional asset-type overrides, and lead-time window for automatic OPEN work orders.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                data-testid="settings-run-scheduling-now-btn"
                onClick={handleRunSchedulerNow}
                disabled={runningNow}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFF0E6] text-[#1C1917] border border-[#FED7AA] text-xs font-bold shadow-xs transition-all disabled:opacity-50"
              >
                <CalendarClock className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>{runningNow ? 'Running...' : 'Run scheduling now'}</span>
              </button>
              <button
                type="submit"
                data-testid="save-compliance-cycles-btn"
                disabled={savingCycles}
                className="btn-flame inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{savingCycles ? 'Saving...' : 'Save Cycles'}</span>
              </button>
            </div>
          </div>

          {/* Org-level Auto-scheduling toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FFF0E6]/70 border border-[#FED7AA]">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-[#1C1917]">
                Automatic Lead-Time Work Order Generation
              </div>
              <p className="text-[11px] text-[#44403C]">
                Automatically create OPEN work orders when an asset&apos;s next service or hydro-test due date enters its building&apos;s lead-time window (never sets status to ASSIGNED automatically).
              </p>
            </div>
            <button
              type="button"
              role="switch"
              data-testid="toggle-auto-scheduling"
              aria-checked={autoSchedulingEnabled}
              onClick={() => setAutoSchedulingEnabled((v) => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                autoSchedulingEnabled ? 'bg-[#EA580C]' : 'bg-[#44403C]/30'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ${
                  autoSchedulingEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Per-building cycle table */}
          <div className="bg-white rounded-2xl border border-[#FED7AA] overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF8F2] text-[#1C1917] uppercase text-[10px] font-bold tracking-wider border-b border-[#FED7AA]">
                <tr>
                  <th className="py-3 px-4">Building / Facility</th>
                  <th className="py-3 px-4">Default Inspection Cycle</th>
                  <th className="py-3 px-4">Lead-Time Window (Days)</th>
                  <th className="py-3 px-4">Extinguisher Override</th>
                  <th className="py-3 px-4">Hydrant / Riser Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FED7AA]/60">
                {cycleBuildings.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-[#FFF0E6]/35">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#1C1917]">{b.name}</div>
                      <div className="text-[11px] text-[#44403C]">{b.address}</div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        data-testid={`building-cycle-select-${b.id}`}
                        value={b.complianceCycle || 'QUARTERLY'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCycleBuildings((prev) =>
                            prev.map((row, i) =>
                              i === idx ? { ...row, complianceCycle: val } : row
                            )
                          );
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#FED7AA] text-xs font-bold text-[#1C1917]"
                      >
                        <option value="MONTHLY">MONTHLY (30d)</option>
                        <option value="QUARTERLY">QUARTERLY (90d)</option>
                        <option value="HALF_YEARLY">HALF_YEARLY (180d)</option>
                        <option value="YEARLY">YEARLY (365d)</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min={1}
                        max={90}
                        data-testid={`building-leadtime-input-${b.id}`}
                        value={b.leadTimeDays ?? 7}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(90, Number(e.target.value) || 7));
                          setCycleBuildings((prev) =>
                            prev.map((row, i) =>
                              i === idx ? { ...row, leadTimeDays: val } : row
                            )
                          );
                        }}
                        className="w-20 px-2.5 py-1.5 rounded-xl bg-white border border-[#FED7AA] text-xs font-bold text-[#1C1917] tabular-nums"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={b.cycleOverrides?.EXTINGUISHER || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCycleBuildings((prev) =>
                            prev.map((row, i) =>
                              i === idx
                                ? {
                                    ...row,
                                    cycleOverrides: {
                                      ...(row.cycleOverrides || {}),
                                      EXTINGUISHER: val || undefined,
                                    },
                                  }
                                : row
                            )
                          );
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white border border-[#FED7AA] text-xs text-[#1C1917]"
                      >
                        <option value="">Use Building Default</option>
                        <option value="MONTHLY">MONTHLY</option>
                        <option value="QUARTERLY">QUARTERLY</option>
                        <option value="HALF_YEARLY">HALF_YEARLY</option>
                        <option value="YEARLY">YEARLY</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={b.cycleOverrides?.HYDRANT || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCycleBuildings((prev) =>
                            prev.map((row, i) =>
                              i === idx
                                ? {
                                    ...row,
                                    cycleOverrides: {
                                      ...(row.cycleOverrides || {}),
                                      HYDRANT: val || undefined,
                                    },
                                  }
                                : row
                            )
                          );
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white border border-[#FED7AA] text-xs text-[#1C1917]"
                      >
                        <option value="">Use Building Default</option>
                        <option value="MONTHLY">MONTHLY</option>
                        <option value="QUARTERLY">QUARTERLY</option>
                        <option value="HALF_YEARLY">HALF_YEARLY</option>
                        <option value="YEARLY">YEARLY</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </form>
      )}

      {/* =========================================================================
          TAB: WHITE-LABEL REPORT BRANDING (MODULE G)
      ========================================================================= */}
      {activeSubTab === 'BRANDING' && (
        <div data-testid="settings-branding-panel" className="space-y-4 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-[#1C1917]">
              White-Label Report Branding
            </h3>
            <p className="text-xs text-[#44403C]">
              Customize your agency logo (top-left of page 1), authorized signatory block (bottom-right), and statutory footer line on printed `/report/[buildingId]` certificates. Statutory Form-B / IS 2190 clauses remain 100% intact.
            </p>
          </div>

          <form
            onSubmit={handleSaveCompany}
            className="p-5 rounded-2xl bg-white/80 border border-[#FED7AA] space-y-4 text-xs"
          >
            {/* Agency Logo upload */}
            <div className="space-y-2">
              <label className="block text-[#1C1917] font-bold">
                Agency Logo (PNG/JPEG ≤ 1 MB — Printed Top-Left of Page 1)
              </label>
              <div className="flex items-center gap-4 flex-wrap">
                {companyForm.brandLogoUrl ? (
                  <div className="relative flex items-center gap-3 p-2.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA]">
                    <img
                      src={companyForm.brandLogoUrl}
                      alt="Agency Brand Logo"
                      className="h-12 w-auto max-w-[160px] object-contain rounded"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setCompanyForm((prev: any) => ({ ...prev, brandLogoUrl: '' }))
                      }
                      className="p-1.5 rounded-lg bg-rose-50 text-[#DC2626] hover:bg-rose-100 border border-rose-200"
                      title="Remove Logo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-3 rounded-xl bg-[#FFF8F2] border border-dashed border-[#FED7AA] text-[#44403C]">
                    No custom logo uploaded (using default statutory header)
                  </div>
                )}

                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF0E6] hover:bg-[#FED7AA] text-[#C2410C] border border-[#FED7AA] font-bold cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo (PNG/JPEG)'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUploadBrandAsset(f, 'brandLogoUrl');
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#1C1917] font-bold mb-1">
                  Authorized Signatory Name
                </label>
                <input
                  type="text"
                  data-testid="branding-signatory-name"
                  value={companyForm.signatoryName || ''}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, signatoryName: e.target.value })
                  }
                  placeholder="e.g. Rajesh Kulkarni"
                  className="glass-input w-full rounded-xl p-3 text-[#1C1917] font-medium shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[#1C1917] font-bold mb-1">
                  Signatory Designation
                </label>
                <input
                  type="text"
                  data-testid="branding-signatory-designation"
                  value={companyForm.signatoryDesignation || ''}
                  onChange={(e) =>
                    setCompanyForm({
                      ...companyForm,
                      signatoryDesignation: e.target.value,
                    })
                  }
                  placeholder="e.g. Chief Fire Safety Auditor"
                  className="glass-input w-full rounded-xl p-3 text-[#1C1917] font-medium shadow-xs"
                />
              </div>
            </div>

            {/* Optional Signature Image Upload */}
            <div className="space-y-2">
              <label className="block text-[#1C1917] font-bold">
                Authorized Signatory Signature Image (Optional, PNG/JPEG ≤ 1 MB)
              </label>
              <div className="flex items-center gap-4 flex-wrap">
                {companyForm.signatorySignatureUrl ? (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA]">
                    <img
                      src={companyForm.signatorySignatureUrl}
                      alt="Signatory Signature"
                      className="h-10 w-auto max-w-[150px] object-contain"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setCompanyForm((prev: any) => ({
                          ...prev,
                          signatorySignatureUrl: '',
                        }))
                      }
                      className="p-1.5 rounded-lg bg-rose-50 text-[#DC2626] hover:bg-rose-100 border border-rose-200"
                      title="Remove Signature"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-2.5 rounded-xl bg-[#FFF8F2] border border-dashed border-[#FED7AA] text-[#44403C]">
                    No signature image uploaded
                  </div>
                )}

                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF0E6] hover:bg-[#FED7AA] text-[#C2410C] border border-[#FED7AA] font-bold cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {uploadingSig ? 'Uploading...' : 'Upload Signature (PNG/JPEG)'}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUploadBrandAsset(f, 'signatorySignatureUrl');
                    }}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[#1C1917] font-bold mb-1">
                Custom Certificate Footer Line (Printed on Every Page)
              </label>
              <input
                type="text"
                data-testid="branding-footer-text"
                value={companyForm.reportFooterText || ''}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, reportFooterText: e.target.value })
                }
                placeholder="e.g. Certified by National Fire Safety & AMC Services · 24×7 Emergency Helpline +91 98200 11223"
                className="glass-input w-full rounded-xl p-3 text-[#1C1917] font-medium shadow-xs"
              />
            </div>

            {/* Live Preview Strip */}
            <div className="p-4 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C]">
                Signatory Block Preview (Bottom-Right of Certificate)
              </div>
              <div className="text-xs font-bold text-[#1C1917]">
                For {companyForm.name || 'Agency'} &middot;{' '}
                {companyForm.signatoryName || 'Authorized Signatory'} &middot;{' '}
                {companyForm.signatoryDesignation || 'Licensed Fire Officer'}
              </div>
              {companyForm.reportFooterText && (
                <div className="text-[11px] text-[#44403C] border-t border-[#FED7AA] pt-1.5">
                  Footer: {companyForm.reportFooterText}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                data-testid="save-report-branding-btn"
                className="btn-flame px-6 py-3 rounded-xl text-white font-bold text-xs shadow-xs"
              >
                Save Report Branding
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB: TEAM & TECHNICIANS
      ========================================================================= */}
      {activeSubTab === 'TEAM' && (
        <TechnicianManagement
          showToast={showToast}
          onOpenImport={() => onOpenImport?.('TECHNICIANS')}
          initialTechnicians={initialTechnicians}
          initialBuildings={initialBuildings}
          initialSeatUsage={initialSeatUsage}
          initialPlan={initialPlan}
          agencyName={company?.name}
          onRefreshDashboard={onRefreshDashboard}
        />
      )}

      {/* =========================================================================
          TAB: ADMIN USERS & ROLES
      ========================================================================= */}
      {activeSubTab === 'ADMINS' && (
        <AdminUsersView currentUser={currentUser} userProfile={userProfile} company={company} />
      )}

      {/* =========================================================================
          TAB: ALERTS & NOTIFICATIONS
      ========================================================================= */}
      {activeSubTab === 'ALERTS' && <AlertsSettingsView company={company} showToast={showToast} />}

      {/* =========================================================================
          TAB: IMPORT & EXPORT
      ========================================================================= */}
      {activeSubTab === 'IMPORT_EXPORT' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#1C1917]">Excel Import &amp; Export Center</h3>
            <p className="text-xs text-[#44403C]">
              Bulk upload existing spreadsheets or download operational records in Excel (.xlsx) format.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Import Card */}
            <div className="p-5 rounded-2xl bg-white/75 border border-[#FED7AA] space-y-4">
              <div className="flex items-center gap-2 font-bold text-[#1C1917] text-sm">
                <Upload className="w-5 h-5 text-[#C2410C]" />
                <span>Import Spreadsheets (.xlsx)</span>
              </div>
              <p className="text-xs text-[#44403C]">
                Upload existing client lists, building rosters, equipment schedules, or technician records.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenImport?.('CLIENTS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-[#FFF0E6] text-[#1C1917] text-xs font-bold transition-all border border-[#FED7AA] shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span>Clients</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenImport?.('BUILDINGS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-[#FFF0E6] text-[#1C1917] text-xs font-bold transition-all border border-[#FED7AA] shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span>Buildings</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenImport?.('FIRE_ASSETS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-[#FFF0E6] text-[#1C1917] text-xs font-bold transition-all border border-[#FED7AA] shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span>Equipment</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenImport?.('TECHNICIANS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-[#FFF0E6] text-[#1C1917] text-xs font-bold transition-all border border-[#FED7AA] shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span>Technicians</span>
                </button>
              </div>
            </div>

            {/* Export Card */}
            <div className="p-5 rounded-2xl bg-white/75 border border-[#FED7AA] space-y-4">
              <div className="flex items-center gap-2 font-bold text-[#1C1917] text-sm">
                <Download className="w-5 h-5 text-[#059669]" />
                <span>Export Operations Data (.xlsx)</span>
              </div>
              <p className="text-xs text-[#44403C]">
                Download verified records for statutory audits, client handover reports, or external accounting.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenExport?.('CLIENTS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-[#FFF0E6] text-[#1C1917] text-xs font-bold transition-all border border-[#FED7AA] shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Clients</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenExport?.('BUILDINGS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-[#FFF0E6] text-[#1C1917] text-xs font-bold transition-all border border-[#FED7AA] shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Buildings</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenExport?.('FIRE_ASSETS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-[#FFF0E6] text-[#1C1917] text-xs font-bold transition-all border border-[#FED7AA] shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Equipment</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenExport?.('INSPECTIONS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-[#FFF0E6] text-[#1C1917] text-xs font-bold transition-all border border-[#FED7AA] shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Inspections</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
