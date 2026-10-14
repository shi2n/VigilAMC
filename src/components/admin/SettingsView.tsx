'use client';

import React from 'react';
import { Mail, RefreshCw, AlertTriangle, Sparkles, Settings as SettingsIcon, Building2, FileSpreadsheet, Upload, TrendingUp } from 'lucide-react';
import { InvestorLeadsView } from './InvestorLeadsView';

interface SettingsViewProps {
  subTab: 'LEADS' | 'TOOLS' | 'AGENCY' | 'INVESTORS';
  setSubTab: (tab: 'LEADS' | 'TOOLS' | 'AGENCY' | 'INVESTORS') => void;
  enquiriesList: any[];
  enquiryStatusFilter: string;
  setEnquiryStatusFilter: (st: string) => void;
  loadingEnquiries: boolean;
  onRefreshEnquiries: () => void;
  onUpdateEnquiryStatus: (id: string, newStatus: string) => void;
  onWipeAllDemo: () => void;
  onSeedCleanData: () => void;
  companyForm: any;
  setCompanyForm: any;
  handleSaveCompany: (e: React.FormEvent) => void;
  onOpenImport?: (type?: any) => void;
}

export function SettingsView({
  subTab,
  setSubTab,
  enquiriesList,
  enquiryStatusFilter,
  setEnquiryStatusFilter,
  loadingEnquiries,
  onRefreshEnquiries,
  onUpdateEnquiryStatus,
  onWipeAllDemo,
  onSeedCleanData,
  companyForm,
  setCompanyForm,
  handleSaveCompany,
  onOpenImport,
}: SettingsViewProps) {
  return (
    <div className="rounded-2xl bg-white border border-[#DCE7F2] shadow-sm p-5 sm:p-6 space-y-6 text-slate-800 dark:bg-slate-900/90 dark:border-slate-800 dark:shadow-2xl dark:text-slate-100">
      {/* Sub Navigation Bar */}
      <div className="flex items-center justify-between border-b border-[#DCE7F2] pb-4 flex-wrap gap-3 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
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
            { id: 'TOOLS', label: 'Data Management & Maintenance', icon: AlertTriangle },
            { id: 'AGENCY', label: 'Agency Profile & License', icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
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

        {subTab === 'LEADS' && (
          <button
            onClick={onRefreshEnquiries}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-[#DCE7F2] dark:bg-slate-950 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white dark:border-slate-800"
            title="Refresh Leads"
          >
            <RefreshCw className={`w-4 h-4 ${loadingEnquiries ? 'animate-spin text-[#007DB8] dark:text-amber-400' : ''}`} />
          </button>
        )}
      </div>

      {/* SUB-VIEW 1: LEADS & ENQUIRIES */}
      {subTab === 'LEADS' && (
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
                  onClick={() => setEnquiryStatusFilter(st)}
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

          {loadingEnquiries ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#007DB8] dark:text-amber-500" />
              <p className="text-xs">Loading inbound leads...</p>
            </div>
          ) : enquiriesList.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Mail className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">No inquiries received yet</h3>
              <p className="text-xs text-[#475569] dark:text-slate-400 max-w-md mx-auto">
                When prospective clients submit forms on your public website, their contact details, facility type, and requested demo slot will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#DCE7F2] dark:border-slate-800">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-[#F8FAFC] text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-[#DCE7F2] dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date / Source</th>
                    <th className="py-3 px-4">Name &amp; Company</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Requirement / Facility</th>
                    <th className="py-3 px-4">Notes / Message</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE7F2] bg-white dark:divide-slate-800/60 dark:bg-slate-900/60">
                  {enquiriesList.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <span className="text-[10px] text-[#007DB8] dark:text-amber-400/90 font-medium">{lead.source || 'Website'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{lead.name || 'Unnamed Prospect'}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{lead.company || lead.city || 'Direct Inquiry'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 dark:text-slate-200">{lead.email}</div>
                        {lead.phone && <div className="text-[11px] text-slate-500 dark:text-slate-400">{lead.phone}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{lead.facilityType || lead.type || 'Demo'}</div>
                        {(lead.assetCount || lead.preferredDate) && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {lead.assetCount && `${lead.assetCount} assets • `}
                            {lead.preferredDate && `Slot: ${lead.preferredDate} ${lead.preferredTime || ''}`}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="line-clamp-2 text-[#475569] dark:text-slate-400 text-[11px]">
                          {lead.message || 'No additional message provided.'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            lead.status === 'NEW'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40'
                              : lead.status === 'CONTACTED'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                              : lead.status === 'CONVERTED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-700/40 dark:text-slate-400 dark:border-slate-700'
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <select
                          value={lead.status}
                          onChange={(e) => onUpdateEnquiryStatus(lead.id, e.target.value)}
                          className="bg-slate-50 border border-[#DCE7F2] rounded-lg px-2 py-1 text-[11px] text-slate-700 font-semibold focus:outline-none focus:border-[#007DB8] dark:bg-slate-950 dark:border-slate-700 dark:text-slate-300 dark:focus:border-amber-500"
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

      {/* SUB-VIEW 2: DATA MANAGEMENT & DATABASE WIPE */}
      {subTab === 'TOOLS' && (
        <div className="space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-[#073F8F] dark:text-white">Data Management &amp; System Maintenance</h3>
            <p className="text-xs text-[#475569] dark:text-slate-400">
              Bulk import legacy Excel spreadsheets, wipe demo records, or load clean starter templates.
            </p>
          </div>

          {/* Central Excel Import System */}
          <div className="p-5 rounded-2xl bg-[#F0F9FF] border border-[#007DB8]/30 space-y-3 dark:bg-slate-950/90 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#073F8F] dark:text-amber-400 font-bold text-sm">
                <FileSpreadsheet className="w-5 h-5 text-[#007DB8] dark:text-amber-400" />
                <span>Import Existing Data (Excel &amp; CSV Migration)</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EAF6FF] text-[#073F8F] border border-[#007DB8]/30 uppercase dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30">
                Smart Engine
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Already managing your fire safety equipment, clients, or inspection cycles in Excel? Use our multi-module import engine to bring your existing data directly into VigilAMC with automatic column matching and duplicate protection.
            </p>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onOpenImport?.('CLIENTS')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all border border-[#DCE7F2] shadow-sm flex items-center gap-1.5 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700"
              >
                <Upload className="w-3.5 h-3.5 text-blue-500" />
                <span>Import Clients</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenImport?.('BUILDINGS')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all border border-[#DCE7F2] shadow-sm flex items-center gap-1.5 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700"
              >
                <Upload className="w-3.5 h-3.5 text-amber-500" />
                <span>Import Buildings</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenImport?.('FIRE_ASSETS')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all border border-[#DCE7F2] shadow-sm flex items-center gap-1.5 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700"
              >
                <Upload className="w-3.5 h-3.5 text-red-500" />
                <span>Import Fire Assets</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenImport?.('TECHNICIANS')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all border border-[#DCE7F2] shadow-sm flex items-center gap-1.5 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700"
              >
                <Upload className="w-3.5 h-3.5 text-purple-500" />
                <span>Import Technicians</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenImport?.('INSPECTIONS')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all border border-[#DCE7F2] shadow-sm flex items-center gap-1.5 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-500" />
                <span>Import Inspections</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenImport?.('WORK_ORDERS')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all border border-[#DCE7F2] shadow-sm flex items-center gap-1.5 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-500" />
                <span>Import Work Orders</span>
              </button>
            </div>
          </div>

          {/* Danger Zone: Wipe All Demo Data */}
          <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-200 space-y-3 dark:bg-red-950/20 dark:border-red-500/40">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span>Wipe All Demo Companies &amp; Data</span>
            </div>
            <p className="text-xs text-red-900/80 dark:text-slate-300">
              This permanently removes all existing demo client societies, demo buildings, demo equipment records, and test service logs. Your database will be completely empty and 100% clean so you can register your actual real-world AMC contracts.
            </p>
            <div className="pt-1">
              <button
                onClick={onWipeAllDemo}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
              >
                Confirm: Wipe All Demo Records
              </button>
            </div>
          </div>

          {/* Template Starter: Seed Clean Unbranded Data */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-[#DCE7F2] space-y-3 dark:bg-slate-950/80 dark:border-slate-800">
            <div className="flex items-center gap-2 text-[#073F8F] dark:text-amber-400 font-bold text-sm">
              <Sparkles className="w-5 h-5 text-[#007DB8] dark:text-amber-400" />
              <span>Load Clean Starter Template (No Brand Names)</span>
            </div>
            <p className="text-xs text-[#475569] dark:text-slate-400">
              Seeds a clean, unbranded reference structure with generic facilities (Horizon Tech IT Tower &amp; Emerald Heights Society) to test QR code scanning, inspection logs, and Delhi NCR Statutory Form-B PDF generation.
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

      {/* SUB-VIEW 3: AGENCY PROFILE & LICENSE */}
      {subTab === 'AGENCY' && (
        <div className="space-y-4 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-[#073F8F] dark:text-white">Agency Organization Profile</h3>
            <p className="text-xs text-[#475569] dark:text-slate-400">
              Official statutory credentials printed on Delhi Fire Service &amp; NBC 2016 certificates, inspection logs, and technician tags.
            </p>
          </div>

          <form onSubmit={handleSaveCompany} className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#DCE7F2] space-y-4 text-xs dark:bg-slate-950/80 dark:border-slate-800">
            <div>
              <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Company / Business Name *</label>
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
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Govt. Fire License Number *</label>
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
                <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Emergency Dispatch Phone *</label>
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
              <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Official Service Email *</label>
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
              <label className="block text-slate-700 font-bold mb-1 dark:text-slate-300">Registered Service Office Address *</label>
              <textarea
                rows={2}
                required
                value={companyForm.address}
                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                placeholder="e.g. Plot 24, Okhla Industrial Area Phase III, New Delhi - 110020"
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

      {/* Subtab: Investor Leads */}
      {subTab === 'INVESTORS' && <InvestorLeadsView />}
    </div>
  );
}
