'use client';

import React, { useState } from 'react';
import {
  Mail,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Settings as SettingsIcon,
  Building2,
  FileSpreadsheet,
  Upload,
  TrendingUp,
  Users,
  ShieldCheck,
  Bell,
  Download,
} from 'lucide-react';
import { InvestorLeadsView } from './InvestorLeadsView';
import { AlertsSettingsView } from './AlertsSettingsView';
import { TechnicianManagement } from './TechnicianManagement';
import { AdminUsersView } from './AdminUsersView';

export type SettingsSubTab =
  | 'AGENCY'
  | 'TEAM'
  | 'ADMINS'
  | 'ALERTS'
  | 'IMPORT_EXPORT'
  | 'LEADS'
  | 'INVESTORS'
  | 'TOOLS';

interface SettingsViewProps {
  subTab?: SettingsSubTab;
  setSubTab?: (tab: SettingsSubTab) => void;
  enquiriesList?: any[];
  enquiryStatusFilter?: string;
  setEnquiryStatusFilter?: (st: string) => void;
  loadingEnquiries?: boolean;
  onRefreshEnquiries?: () => void;
  onUpdateEnquiryStatus?: (id: string, newStatus: string) => void;
  onWipeAllDemo?: () => void;
  onSeedCleanData?: () => void;
  companyForm: any;
  setCompanyForm: any;
  handleSaveCompany: (e: React.FormEvent) => void;
  onOpenImport?: (type?: any) => void;
  onOpenExport?: (type?: any) => void;
  isPlatformOwner?: boolean;
  currentUser?: any;
  company?: any;
  showToast: (msg: string) => void;
}

export function SettingsView({
  subTab: externalSubTab,
  setSubTab: externalSetSubTab,
  enquiriesList = [],
  enquiryStatusFilter = 'ALL',
  setEnquiryStatusFilter,
  loadingEnquiries = false,
  onRefreshEnquiries,
  onUpdateEnquiryStatus,
  onWipeAllDemo,
  onSeedCleanData,
  companyForm,
  setCompanyForm,
  handleSaveCompany,
  onOpenImport,
  onOpenExport,
  isPlatformOwner = false,
  currentUser,
  company,
  showToast,
}: SettingsViewProps) {
  const [internalSubTab, setInternalSubTab] = useState<SettingsSubTab>('AGENCY');
  const activeSubTab = externalSubTab || internalSubTab;
  const setActiveSubTab = (tab: SettingsSubTab) => {
    if (externalSetSubTab) externalSetSubTab(tab);
    setInternalSubTab(tab);
  };

  // Standard Agency settings tabs
  const agencyTabs = [
    { id: 'AGENCY', label: 'Agency Profile & License', icon: Building2 },
    { id: 'TEAM', label: 'Technician Workforce', icon: Users },
    { id: 'ADMINS', label: 'Admin Users & Roles', icon: ShieldCheck },
    { id: 'ALERTS', label: 'Alerts & Notifications', icon: Bell },
    { id: 'IMPORT_EXPORT', label: 'Import & Export Data', icon: FileSpreadsheet },
  ];

  // Platform Owner ONLY tabs
  const platformTabs = isPlatformOwner
    ? [
        {
          id: 'LEADS',
          label: `Website Leads (${enquiriesList.length})`,
          icon: Mail,
          badge: enquiriesList.filter((e) => e.status === 'NEW').length || undefined,
        },
        {
          id: 'INVESTORS',
          label: 'Investor Leads',
          icon: TrendingUp,
        },
        { id: 'TOOLS', label: 'Platform Data Maintenance', icon: AlertTriangle },
      ]
    : [];

  const allTabs: Array<{ id: string; label: string; icon: any; badge?: number | string }> = [...agencyTabs, ...platformTabs];

  return (
    <div className="rounded-2xl bg-white border border-[#DCE7F2] shadow-sm p-5 sm:p-6 space-y-6 text-slate-800 dark:bg-slate-900/90 dark:border-slate-800 dark:shadow-2xl dark:text-slate-100">
      {/* Sub Navigation Bar */}
      <div className="flex items-center justify-between border-b border-[#DCE7F2] pb-4 flex-wrap gap-3 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {allTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as SettingsSubTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#EAF6FF] text-[#073F8F] border border-[#007DB8]/30 font-bold shadow-sm dark:bg-amber-500 dark:text-slate-950 dark:font-black'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-[#DCE7F2] dark:bg-slate-950 dark:text-slate-400 dark:hover:text-white dark:border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-[#007DB8] dark:text-inherit" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeSubTab === 'LEADS' && onRefreshEnquiries && (
          <button
            onClick={onRefreshEnquiries}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-[#DCE7F2] dark:bg-slate-950 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white dark:border-slate-800"
            title="Refresh Leads"
          >
            <RefreshCw
              className={`w-4 h-4 ${loadingEnquiries ? 'animate-spin text-[#007DB8] dark:text-amber-400' : ''}`}
            />
          </button>
        )}
      </div>

      {/* =========================================================================
          TAB: AGENCY PROFILE & LICENSE
      ========================================================================= */}
      {activeSubTab === 'AGENCY' && (
        <div className="space-y-4 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-[#073F8F] dark:text-white">Agency Organization Profile</h3>
            <p className="text-xs text-[#475569] dark:text-slate-400">
              Official statutory credentials printed on state fire compliance certificates and equipment schedules.
            </p>
          </div>

          <form
            onSubmit={handleSaveCompany}
            className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#DCE7F2] space-y-4 text-xs dark:bg-slate-950/80 dark:border-slate-800"
          >
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
                className="w-full bg-white border border-[#DCE7F2] rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#007DB8] font-medium shadow-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-amber-500"
              />
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
                  className="w-full bg-white border border-[#DCE7F2] rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#007DB8] font-medium shadow-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-amber-500"
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
                  className="w-full bg-white border border-[#DCE7F2] rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#007DB8] font-medium shadow-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-amber-500"
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
                className="w-full bg-white border border-[#DCE7F2] rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#007DB8] font-medium shadow-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-amber-500"
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
                className="w-full bg-white border border-[#DCE7F2] rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#007DB8] font-medium shadow-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-amber-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#007DB8] hover:bg-[#073F8F] text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] dark:bg-gradient-to-r dark:from-amber-500 dark:to-orange-500 dark:text-slate-950 dark:font-black"
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
        <TechnicianManagement showToast={showToast} onOpenImport={() => onOpenImport?.('TECHNICIANS')} />
      )}

      {/* =========================================================================
          TAB: ADMIN USERS & ROLES
      ========================================================================= */}
      {activeSubTab === 'ADMINS' && <AdminUsersView currentUser={currentUser} company={company} />}

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
            <div className="p-5 rounded-2xl bg-slate-50 border border-[#DCE7F2] dark:bg-slate-950/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <Upload className="w-5 h-5 text-[#007DB8] dark:text-amber-400" />
                <span>Import Spreadsheets (.xlsx)</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload existing client lists, building rosters, equipment schedules, or technician records.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenImport?.('CLIENTS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-[#DCE7F2] shadow-xs flex items-center justify-center gap-1.5 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-800"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-500" />
                  <span>Clients</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenImport?.('BUILDINGS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-[#DCE7F2] shadow-xs flex items-center justify-center gap-1.5 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-800"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Buildings</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenImport?.('FIRE_ASSETS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-[#DCE7F2] shadow-xs flex items-center justify-center gap-1.5 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-800"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-500" />
                  <span>Equipment</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenImport?.('TECHNICIANS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-[#DCE7F2] shadow-xs flex items-center justify-center gap-1.5 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-800"
                >
                  <Upload className="w-3.5 h-3.5 text-purple-500" />
                  <span>Technicians</span>
                </button>
              </div>
            </div>

            {/* Export Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-[#DCE7F2] dark:bg-slate-950/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Export Operations Data (.xlsx)</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Download verified records for statutory audits, client handover reports, or external accounting.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenExport?.('CLIENTS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-[#DCE7F2] shadow-xs flex items-center justify-center gap-1.5 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-800"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Clients</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenExport?.('BUILDINGS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-[#DCE7F2] shadow-xs flex items-center justify-center gap-1.5 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-800"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Buildings</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenExport?.('FIRE_ASSETS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-[#DCE7F2] shadow-xs flex items-center justify-center gap-1.5 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-800"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Equipment</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenExport?.('INSPECTIONS')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-[#DCE7F2] shadow-xs flex items-center justify-center gap-1.5 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-800"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Inspections</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PLATFORM OWNER ONLY TABS
      ========================================================================= */}
      {isPlatformOwner && activeSubTab === 'LEADS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#073F8F] dark:text-white">Inbound Website Inquiries</h3>
              <p className="text-xs text-[#475569] dark:text-slate-400">
                Direct submissions from public contact and demo forms stored in Supabase PostgreSQL.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {['ALL', 'NEW', 'CONTACTED', 'CONVERTED', 'ARCHIVED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setEnquiryStatusFilter && setEnquiryStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    enquiryStatusFilter === st
                      ? 'bg-[#007DB8] text-white shadow-sm dark:bg-amber-500 dark:text-slate-950'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-[#DCE7F2] dark:bg-slate-950 dark:text-slate-400 dark:hover:text-white dark:border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Enquiries Table */}
          {enquiriesList.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
              No website leads received yet.
            </div>
          ) : (
            <div className="border border-[#DCE7F2] rounded-xl overflow-x-auto dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-[#DCE7F2] dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Name / Contact</th>
                    <th className="py-2.5 px-3">Type / Subject</th>
                    <th className="py-2.5 px-3">Message / Payload</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {enquiriesList
                    .filter((e) => (enquiryStatusFilter === 'ALL' ? true : e.status === enquiryStatusFilter))
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-800 dark:text-white">{item.name || 'Anonymous'}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.email} {item.phone ? `• ${item.phone}` : ''}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 dark:text-slate-300">
                            {item.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 max-w-xs truncate text-slate-600 dark:text-slate-300">
                          {item.message || (item.payload ? JSON.stringify(item.payload) : '—')}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <select
                            value={item.status}
                            onChange={(e) => onUpdateEnquiryStatus && onUpdateEnquiryStatus(item.id, e.target.value)}
                            className="bg-white border border-[#DCE7F2] rounded-lg px-2 py-1 text-[11px] text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                          >
                            <option value="NEW">NEW</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="CONVERTED">CONVERTED</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isPlatformOwner && activeSubTab === 'INVESTORS' && <InvestorLeadsView />}

      {isPlatformOwner && activeSubTab === 'TOOLS' && (
        <div className="space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-[#073F8F] dark:text-white">Platform Data Maintenance Tools</h3>
            <p className="text-xs text-[#475569] dark:text-slate-400">
              Founder operations for resetting test databases or loading clean non-trademarked evaluation records.
            </p>
          </div>

          {/* Danger Zone: Wipe All Demo Data */}
          <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-200 space-y-3 dark:bg-red-950/20 dark:border-red-500/40">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span>Wipe All Demo Companies &amp; Data</span>
            </div>
            <p className="text-xs text-red-900/80 dark:text-slate-300">
              This permanently removes all test companies, test client societies, buildings, and equipment records.
              Requires typing <strong className="font-mono font-bold">DELETE</strong> to confirm.
            </p>
            <div className="pt-1">
              <button
                onClick={onWipeAllDemo}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
              >
                Wipe All Demo Records
              </button>
            </div>
          </div>

          {/* Template Starter: Seed Clean Unbranded Data */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-[#DCE7F2] space-y-3 dark:bg-slate-950/80 dark:border-slate-800">
            <div className="flex items-center gap-2 text-[#073F8F] dark:text-amber-400 font-bold text-sm">
              <Sparkles className="w-5 h-5 text-[#007DB8] dark:text-amber-400" />
              <span>Load Clean Starter Template</span>
            </div>
            <p className="text-xs text-[#475569] dark:text-slate-400">
              Seeds a clean, unbranded reference structure with generic facilities (Horizon Tech Tower &amp; Emerald
              Heights) to test field inspections, GPS logs, and Form-B reports.
            </p>
            <div className="pt-1">
              <button
                onClick={onSeedCleanData}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#073F8F] border border-[#DCE7F2] font-bold text-xs transition-colors shadow-sm dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-400 dark:border-amber-500/40"
              >
                Load Clean Template Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
