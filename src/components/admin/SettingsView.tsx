'use client';

import React, { useState } from 'react';
import {
  Building2,
  FileSpreadsheet,
  Upload,
  Users,
  ShieldCheck,
  Bell,
  Download,
  Sparkles,
} from 'lucide-react';
import { AlertsSettingsView } from './AlertsSettingsView';
import { TechnicianManagement } from './TechnicianManagement';
import { AdminUsersView } from './AdminUsersView';

export type SettingsSubTab =
  | 'AGENCY'
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
}: SettingsViewProps) {
  const [internalSubTab, setInternalSubTab] = useState<SettingsSubTab>('AGENCY');
  const [whiteLabelEnabled, setWhiteLabelEnabled] = useState<boolean>(true);
  const [quarterlyAmcFee, setQuarterlyAmcFee] = useState<string>('12500');
  const [refillServiceFee, setRefillServiceFee] = useState<string>('650');

  const activeSubTab = externalSubTab || internalSubTab;
  const setActiveSubTab = (tab: SettingsSubTab) => {
    if (externalSetSubTab) externalSetSubTab(tab);
    setInternalSubTab(tab);
  };

  // Standard B2B Agency settings tabs ONLY
  const agencyTabs = [
    { id: 'AGENCY', label: 'Agency Profile & License', icon: Building2 },
    { id: 'TEAM', label: 'Technician Workforce', icon: Users },
    { id: 'ADMINS', label: 'Admin Users & Roles', icon: ShieldCheck },
    { id: 'ALERTS', label: 'Alerts & Notifications', icon: Bell },
    { id: 'IMPORT_EXPORT', label: 'Import & Export Data', icon: FileSpreadsheet },
  ];

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
