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

  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-6 text-slate-800 dark:bg-[#172033] dark:border-[#293548] dark:shadow-xl dark:text-slate-100">
      {/* Sub Navigation Bar */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 flex-wrap gap-3 dark:border-[#293548]">
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
                    ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/30 font-bold shadow-xs dark:bg-blue-600 dark:text-white dark:border-blue-500'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-[#E2E8F0] dark:bg-[#111827] dark:text-[#94A3B8] dark:hover:text-white dark:border-[#293548]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-[#2563EB] dark:text-inherit" />
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
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white">Agency Organization Profile</h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Official statutory credentials printed on state fire compliance certificates and equipment schedules.
            </p>
          </div>

          <form
            onSubmit={handleSaveCompany}
            className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4 text-xs dark:bg-[#0B1220] dark:border-[#293548]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">
                  Company / Agency Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  placeholder="e.g. National Fire Safety & AMC Services"
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#2563EB] font-medium shadow-xs dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:focus:border-[#60A5FA]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">
                  Admin Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyForm.fullName || ''}
                  onChange={(e) => setCompanyForm({ ...companyForm, fullName: e.target.value })}
                  placeholder="e.g. Shaizan"
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#2563EB] font-medium shadow-xs dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:focus:border-[#60A5FA]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">
                  Govt. Fire License Number *
                </label>
                <input
                  type="text"
                  required
                  value={companyForm.licenseNumber}
                  onChange={(e) => setCompanyForm({ ...companyForm, licenseNumber: e.target.value })}
                  placeholder="e.g. DL/FIRE/LIC/2026/042"
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#2563EB] font-medium shadow-xs dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:focus:border-[#60A5FA]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">
                  Emergency Dispatch Phone *
                </label>
                <input
                  type="text"
                  required
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  placeholder="e.g. +91 98200 11223"
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#2563EB] font-medium shadow-xs dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:focus:border-[#60A5FA]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">
                Official Service Email *
              </label>
              <input
                type="email"
                required
                value={companyForm.email}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                placeholder="e.g. service@nationalfireamc.in"
                className="w-full bg-white border border-[#E2E8F0] rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#2563EB] font-medium shadow-xs dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:focus:border-[#60A5FA]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">
                Registered Service Office Address *
              </label>
              <textarea
                rows={2}
                required
                value={companyForm.address}
                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                placeholder="e.g. Plot 24, Industrial Area Phase III, New Delhi - 110020"
                className="w-full bg-white border border-[#E2E8F0] rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#2563EB] font-medium shadow-xs dark:bg-[#111827] dark:border-[#293548] dark:text-white dark:focus:border-[#60A5FA]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02]"
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
            <h3 className="text-base font-bold text-[#073F8F] dark:text-white">Excel Import &amp; Export Center</h3>
            <p className="text-xs text-[#475569] dark:text-slate-400">
              Bulk upload existing spreadsheets or download operational records in Excel (.xlsx) format.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Import Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-[#E2E8F0] dark:bg-[#0B1220] dark:border-[#293548] space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <Upload className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                <span>Import Spreadsheets (.xlsx)</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                Upload existing client lists, building rosters, equipment schedules, or technician records.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenImport?.('CLIENTS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-[#E2E8F0] shadow-xs flex items-center justify-center gap-1.5 dark:bg-[#111827] dark:hover:bg-slate-800 dark:text-slate-200 dark:border-[#293548]"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-500" />
                  <span>Clients</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenImport?.('BUILDINGS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-[#E2E8F0] shadow-xs flex items-center justify-center gap-1.5 dark:bg-[#111827] dark:hover:bg-slate-800 dark:text-slate-200 dark:border-[#293548]"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Buildings</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenImport?.('FIRE_ASSETS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-[#E2E8F0] shadow-xs flex items-center justify-center gap-1.5 dark:bg-[#111827] dark:hover:bg-slate-800 dark:text-slate-200 dark:border-[#293548]"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span>Equipment</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenImport?.('TECHNICIANS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-[#E2E8F0] shadow-xs flex items-center justify-center gap-1.5 dark:bg-[#111827] dark:hover:bg-slate-800 dark:text-slate-200 dark:border-[#293548]"
                >
                  <Upload className="w-3.5 h-3.5 text-[#0077B6]" />
                  <span>Technicians</span>
                </button>
              </div>
            </div>

            {/* Export Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-[#E2E8F0] dark:bg-[#0B1220] dark:border-[#293548] space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Export Operations Data (.xlsx)</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                Download verified records for statutory audits, client handover reports, or external accounting.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenExport?.('CLIENTS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-[#E2E8F0] shadow-xs flex items-center justify-center gap-1.5 dark:bg-[#111827] dark:hover:bg-slate-800 dark:text-slate-200 dark:border-[#293548]"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Clients</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenExport?.('BUILDINGS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-[#E2E8F0] shadow-xs flex items-center justify-center gap-1.5 dark:bg-[#111827] dark:hover:bg-slate-800 dark:text-slate-200 dark:border-[#293548]"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Buildings</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenExport?.('FIRE_ASSETS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-[#E2E8F0] shadow-xs flex items-center justify-center gap-1.5 dark:bg-[#111827] dark:hover:bg-slate-800 dark:text-slate-200 dark:border-[#293548]"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Equipment</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenExport?.('INSPECTIONS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-[#E2E8F0] shadow-xs flex items-center justify-center gap-1.5 dark:bg-[#111827] dark:hover:bg-slate-800 dark:text-slate-200 dark:border-[#293548]"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
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
