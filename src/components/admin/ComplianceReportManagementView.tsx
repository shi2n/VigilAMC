'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Scale,
  FileCheck2,
  ShieldCheck,
  UserCheck,
  BookOpen,
  History,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ExternalLink,
  RefreshCw,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

type SubTab =
  | 'JURISDICTIONS_TEMPLATES'
  | 'LEGAL_REFERENCES'
  | 'STANDARDS_CATALOG'
  | 'AGENCY_CREDENTIALS'
  | 'TECHNICIAN_CREDENTIALS'
  | 'REPORT_HISTORY';

export function ComplianceReportManagementView() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('JURISDICTIONS_TEMPLATES');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Legal Reference Form
  const [showNewLegalRef, setShowNewLegalRef] = useState(false);
  const [legalForm, setLegalForm] = useState({
    jurisdictionCode: 'DELHI',
    state: 'National Capital Territory of Delhi',
    city: 'Delhi',
    department: 'Delhi Fire Service (DFS)',
    actName: '',
    ruleNumber: '',
    notificationNumber: '',
    applicableStandard: '',
    equipmentCategory: 'GENERAL',
    officialSourceUrl: '',
    publicationDate: '',
    effectiveDate: '',
    version: '2024',
    verificationNotes: '',
    approveNow: false,
  });

  // Agency Credential Form (Step 7)
  const [agencyForm, setAgencyForm] = useState({
    legalName: '',
    businessAddress: '',
    contactInfo: '',
    gstin: '',
    licenseNumber: '',
    issuingAuthority: '',
    issueDate: '',
    expiryDate: '',
    supportingDocUrl: '',
    verificationStatus: 'NOT_PROVIDED',
    reviewNotes: '',
  });

  // Technician Credential Form (Step 8)
  const [showNewTechCred, setShowNewTechCred] = useState(false);
  const [techForm, setTechForm] = useState({
    fullName: '',
    employeeId: '',
    designation: 'Field Service Technician',
    qualification: '',
    trainingDetails: '',
    certificationDetails: '',
    issuingOrganization: '',
    certificateNumber: '',
    validityDate: '',
    supportingDocUrl: '',
    verificationStatus: 'PENDING_VERIFICATION',
  });

  const loadComplianceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/compliance-management');
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.error) {
        setError(json.error || `Failed to load compliance management data (HTTP ${res.status})`);
        return;
      }
      setData(json);
      if (json.agencyCredential) {
        const ac = json.agencyCredential;
        setAgencyForm({
          legalName: ac.legalName || '',
          businessAddress: ac.businessAddress === 'Address Not Provided' ? '' : ac.businessAddress || '',
          contactInfo: ac.phone !== 'Not Provided' ? `${ac.phone} / ${ac.email}` : '',
          gstin: ac.gstin || '',
          licenseNumber: ac.licenseNumber || '',
          issuingAuthority: ac.issuingAuthority || '',
          issueDate: ac.issueDate ? new Date(ac.issueDate).toISOString().slice(0, 10) : '',
          expiryDate: ac.expiryDate ? new Date(ac.expiryDate).toISOString().slice(0, 10) : '',
          supportingDocUrl: '',
          verificationStatus: ac.verificationStatus || 'NOT_PROVIDED',
          reviewNotes: '',
        });
      }
    } catch (e: any) {
      setError(e?.message || 'Network error while loading compliance management data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplianceData();
  }, [loadComplianceData]);

  const handleSaveLegalReference = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/admin/compliance-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPSERT_LEGAL_REFERENCE',
          ...legalForm,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.error) {
        toast.error(json.error || 'Failed to save legal reference');
        return;
      }
      toast.success(
        legalForm.approveNow
          ? 'Legal reference verified and activated'
          : 'Legal reference saved with status: LEGAL REFERENCE PENDING VERIFICATION'
      );
      setShowNewLegalRef(false);
      setLegalForm((prev) => ({
        ...prev,
        actName: '',
        ruleNumber: '',
        notificationNumber: '',
        applicableStandard: '',
        officialSourceUrl: '',
        verificationNotes: '',
        approveNow: false,
      }));
      await loadComplianceData();
    } catch (err: any) {
      toast.error(err?.message || 'Network error while saving legal reference');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAgencyCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/admin/compliance-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPSERT_AGENCY_CREDENTIAL',
          ...agencyForm,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.error) {
        toast.error(json.error || 'Failed to save agency credentials');
        return;
      }
      toast.success(`Agency credentials updated (Status: ${json.agencyCredential?.verificationStatusLabel || agencyForm.verificationStatus})`);
      await loadComplianceData();
    } catch (err: any) {
      toast.error(err?.message || 'Network error while saving agency credentials');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTechnicianCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/admin/compliance-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPSERT_TECHNICIAN_CREDENTIAL',
          ...techForm,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.error) {
        toast.error(json.error || 'Failed to save technician credential');
        return;
      }
      toast.success('Technician credential record saved');
      setShowNewTechCred(false);
      setTechForm({
        fullName: '',
        employeeId: '',
        designation: 'Field Service Technician',
        qualification: '',
        trainingDetails: '',
        certificationDetails: '',
        issuingOrganization: '',
        certificateNumber: '',
        validityDate: '',
        supportingDocUrl: '',
        verificationStatus: 'PENDING_VERIFICATION',
      });
      await loadComplianceData();
    } catch (err: any) {
      toast.error(err?.message || 'Network error while saving technician credential');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTemplateStatus = async (tpl: any, nextStatus: string) => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/compliance-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPSERT_JURISDICTION_TEMPLATE',
          ...tpl,
          status: nextStatus,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.error) {
        toast.error(json.error || 'Failed to update template status');
        return;
      }
      toast.success(`Template "${tpl.templateName}" status updated to ${ json.template?.status || nextStatus }`);
      await loadComplianceData();
    } catch (err: any) {
      toast.error(err?.message || 'Network error while updating template');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel-dense p-8 rounded-2xl flex items-center justify-center gap-3 text-xs text-[#44403C]">
        <RefreshCw className="w-4 h-4 animate-spin text-[#EA580C]" />
        <span>Loading Compliance &amp; Report Management System...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel-dense p-6 rounded-2xl border border-rose-200 bg-rose-50/70 text-rose-900 space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Compliance Management Load Error</span>
        </div>
        <p className="text-xs">{error}</p>
        <button
          type="button"
          onClick={loadComplianceData}
          className="px-3.5 py-1.5 rounded-lg bg-[#EA580C] text-white text-xs font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  const jurisdictions = data?.jurisdictions || [];
  const templates = data?.templates || [];
  const legalReferences = data?.legalReferences || [];
  const standardsCatalog = data?.applicableStandardsCatalog || [];
  const techCredentials = data?.technicianCredentials || [];
  const reportHistory = data?.reportHistory || [];

  return (
    <div data-testid="compliance-report-management-section" className="space-y-5">
      {/* Section Header */}
      <div className="glass-panel-dense p-5 rounded-2xl border border-[#FED7AA] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-[#C2410C] text-[11px] font-bold">
            <Scale className="w-3.5 h-3.5" />
            <span>COMPLIANCE &amp; REPORT MANAGEMENT</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-[#1C1917]">
            Jurisdictions, Legal References, BIS Standards &amp; Credential Verification
          </h3>
          <p className="text-xs text-[#44403C] max-w-3xl">
            Manage Delhi, Uttar Pradesh (Noida), and Haryana (Gurugram) jurisdiction templates, verify agency licenses and
            technician qualifications, review BIS standards (IS 2190:2024), and audit versioned report history.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'JURISDICTIONS_TEMPLATES', label: '1. Jurisdictions & Templates', icon: Building2 },
            { id: 'LEGAL_REFERENCES', label: '2. Legal Reference Manager', icon: Scale },
            { id: 'STANDARDS_CATALOG', label: '3. BIS Standards (IS 2190:2024)', icon: BookOpen },
            { id: 'AGENCY_CREDENTIALS', label: '4. Agency Credentials', icon: ShieldCheck },
            { id: 'TECHNICIAN_CREDENTIALS', label: '5. Technician Credentials', icon: UserCheck },
            { id: 'REPORT_HISTORY', label: '6. Report & Version History', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as SubTab)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#EA580C] text-white shadow-xs'
                    : 'bg-white text-[#44403C] hover:bg-orange-50 border border-[#F0E4D8]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUBTAB 1: JURISDICTIONS & REPORT TEMPLATES (Step 3, 12, 14) */}
      {activeSubTab === 'JURISDICTIONS_TEMPLATES' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {jurisdictions
              .filter((j: any) => j.code !== 'GENERAL')
              .map((jur: any) => (
                <div
                  key={jur.code}
                  className="glass-panel-dense p-4 rounded-2xl border border-[#F0E4D8] space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1C1917] text-white font-bold text-[10px]">
                      {jur.code}
                    </span>
                    <span className="text-[11px] font-bold text-[#C2410C]">{jur.reportTemplateName}</span>
                  </div>
                  <div className="font-black text-sm text-[#1C1917]">{jur.label}</div>
                  <div className="text-[11px] text-[#44403C] font-medium">{jur.department}</div>
                  <ul className="list-disc list-inside text-[11px] text-[#44403C] space-y-0.5">
                    {(jur.legalFramework || []).map((lf: string, i: number) => (
                      <li key={i}>{lf}</li>
                    ))}
                  </ul>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[10.5px] text-amber-950 leading-relaxed">
                    {jur.statutoryFormDistinction}
                  </div>
                  <div className="pt-1 space-y-1">
                    <div className="text-[10px] font-bold uppercase text-[#78716C]">Official Government Sources:</div>
                    {(jur.primaryOfficialSources || []).map((src: any, idx: number) => (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] text-[#EA580C] hover:underline font-mono truncate"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{src.url}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Templates Table */}
          <div className="glass-panel-dense p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-[#1C1917]">
                  Jurisdiction Report Templates &amp; Statutory Form Controls
                </h4>
                <p className="text-xs text-[#44403C]">
                  Statutory government forms (such as Delhi Form-B Stand-by Duty Application &amp; Delhi Form-H Fire Safety
                  Certificate) remain locked in <strong>DRAFT / PENDING LEGAL REVIEW</strong> and are never generated as
                  private agency certificates.
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Jurisdiction</th>
                    <th className="py-2.5 px-3">Template Name</th>
                    <th className="py-2.5 px-3">Type / Legal Purpose</th>
                    <th className="py-2.5 px-3">Issuing Authority</th>
                    <th className="py-2.5 px-3">Version</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {templates.map((tpl: any) => {
                    const isDraft = tpl.status === 'DRAFT_PENDING_LEGAL_REVIEW';
                    const isActive = tpl.status === 'ACTIVE';
                    return (
                      <tr key={tpl.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                          <div>{tpl.state}</div>
                          <div className="text-[10px] text-slate-500">{tpl.city}</div>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{tpl.templateName}</td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs">{tpl.statutoryPurpose}</td>
                        <td className="py-2.5 px-3 text-slate-700 text-[11px]">{tpl.issuingAuthority}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">v{tpl.version}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : isDraft
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}
                          >
                            {isDraft ? 'DRAFT / PENDING LEGAL REVIEW' : tpl.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          {tpl.isStatutoryForm ? (
                            <span className="text-[10px] text-amber-800 font-semibold">
                              Gov Form (Restricted)
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() =>
                                handleToggleTemplateStatus(tpl, isActive ? 'INACTIVE' : 'ACTIVE')
                              }
                              className="px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-100 text-[11px] font-bold text-slate-800 cursor-pointer"
                            >
                              {isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: LEGAL REFERENCE MANAGER (Step 4) */}
      {activeSubTab === 'LEGAL_REFERENCES' && (
        <div className="glass-panel-dense p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-[#1C1917]">
                Database-Driven Legal Reference Manager
              </h4>
              <p className="text-xs text-[#44403C]">
                Unverified rules are marked <strong>&ldquo;LEGAL REFERENCE PENDING VERIFICATION&rdquo;</strong> and do not
                become active until reviewed by an authorized administrator.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNewLegalRef((prev) => !prev)}
              className="btn-flame inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Legal Reference</span>
            </button>
          </div>

          {showNewLegalRef && (
            <form
              onSubmit={handleSaveLegalReference}
              className="p-4 rounded-xl bg-white border border-[#FED7AA] space-y-3 text-xs"
            >
              <div className="font-bold text-slate-900">Add / Update Jurisdiction Legal Reference</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Jurisdiction</label>
                  <select
                    value={legalForm.jurisdictionCode}
                    onChange={(e) => setLegalForm({ ...legalForm, jurisdictionCode: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  >
                    <option value="DELHI">Delhi (NCT of Delhi)</option>
                    <option value="UP_NOIDA">Uttar Pradesh – Noida</option>
                    <option value="HR_GURUGRAM">Haryana – Gurugram</option>
                    <option value="GENERAL">All India / BIS Standard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={legalForm.state}
                    onChange={(e) => setLegalForm({ ...legalForm, state: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">City / Jurisdiction</label>
                  <input
                    type="text"
                    required
                    value={legalForm.city}
                    onChange={(e) => setLegalForm({ ...legalForm, city: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={legalForm.department}
                    onChange={(e) => setLegalForm({ ...legalForm, department: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Act Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delhi Fire Service Act, 2007"
                    value={legalForm.actName}
                    onChange={(e) => setLegalForm({ ...legalForm, actName: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Rule / Notification Number</label>
                  <input
                    type="text"
                    placeholder="e.g. Rule 33 / 35"
                    value={legalForm.ruleNumber}
                    onChange={(e) => setLegalForm({ ...legalForm, ruleNumber: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Applicable Standard</label>
                  <input
                    type="text"
                    placeholder="e.g. IS 2190:2024"
                    value={legalForm.applicableStandard}
                    onChange={(e) => setLegalForm({ ...legalForm, applicableStandard: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Official Government / BIS URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://dfs.delhi.gov.in/..."
                    value={legalForm.officialSourceUrl}
                    onChange={(e) => setLegalForm({ ...legalForm, officialSourceUrl: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Version</label>
                  <input
                    type="text"
                    value={legalForm.version}
                    onChange={(e) => setLegalForm({ ...legalForm, version: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Verification Notes</label>
                <input
                  type="text"
                  value={legalForm.verificationNotes}
                  onChange={(e) => setLegalForm({ ...legalForm, verificationNotes: e.target.value })}
                  placeholder="Cite government gazette or portal verification details"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                />
              </div>
              <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={legalForm.approveNow}
                  onChange={(e) => setLegalForm({ ...legalForm, approveNow: e.target.checked })}
                  className="accent-[#EA580C]"
                />
                <span>
                  I have verified this legal reference against the official government source and approve it as active
                  (otherwise it will be saved as &ldquo;LEGAL REFERENCE PENDING VERIFICATION&rdquo;).
                </span>
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewLegalRef(false)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded bg-[#EA580C] text-white font-bold cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Legal Reference'}
                </button>
              </div>
            </form>
          )}

          <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">State &amp; City</th>
                  <th className="py-2.5 px-3">Department &amp; Act</th>
                  <th className="py-2.5 px-3">Rule / Standard</th>
                  <th className="py-2.5 px-3">Official Source</th>
                  <th className="py-2.5 px-3">Version</th>
                  <th className="py-2.5 px-3">Current Status &amp; Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {legalReferences.map((ref: any, idx: number) => {
                  const isVerified = ref.currentStatus === 'VERIFIED_ACTIVE' && ref.approvalStatus === 'APPROVED';
                  return (
                    <tr key={ref.id || idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                        <div>{ref.state}</div>
                        <div className="text-[10px] text-slate-500">{ref.city}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{ref.actName}</div>
                        <div className="text-[10.5px] text-slate-500">{ref.department}</div>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-700">
                        <div>{ref.ruleNumber || '—'}</div>
                        <div className="font-mono text-[#C2410C] font-semibold">{ref.applicableStandard || ''}</div>
                      </td>
                      <td className="py-2.5 px-3 text-[11px]">
                        <a
                          href={ref.officialSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#EA580C] underline font-mono break-all"
                        >
                          <span>Official Portal</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{ref.version}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${
                            isVerified
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {ref.currentStatus}
                        </span>
                        {ref.verificationNotes && (
                          <div className="text-[10px] text-slate-500 mt-0.5 max-w-xs">{ref.verificationNotes}</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: BIS STANDARDS CATALOG (Step 5: IS 2190:2024 & Equipment Mapping) */}
      {activeSubTab === 'STANDARDS_CATALOG' && (
        <div className="glass-panel-dense p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black text-[#1C1917]">
                Equipment-Specific Indian Standards (BIS) Mapping
              </h4>
              <p className="text-xs text-[#44403C]">
                <strong>IS 2190:2024 (Fifth Revision)</strong> is applied strictly to Portable and Wheeled First-Aid Fire
                Extinguishers and is never applied to hydrants, sprinklers, alarms, pumps, or buildings with 0 extinguishers.
              </p>
            </div>
            <a
              href="https://standards.bis.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#EA580C] underline flex items-center gap-1"
            >
              <span>Official BIS Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Equipment Category</th>
                  <th className="py-2.5 px-3">Applicable BIS Standard</th>
                  <th className="py-2.5 px-3">Revision &amp; Effective Year</th>
                  <th className="py-2.5 px-3">Verified Technical Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {standardsCatalog.map((std: any) => (
                  <tr key={std.categoryCode} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">{std.categoryLabel}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#C2410C] whitespace-nowrap">
                      {std.standardCode}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">{std.revisionOrVersion}</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      <div className="font-semibold text-slate-900">{std.title}</div>
                      <div>{std.scopeDescription}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 4: AGENCY CREDENTIAL VERIFICATION (Step 7) */}
      {activeSubTab === 'AGENCY_CREDENTIALS' && (
        <div className="glass-panel-dense p-5 rounded-2xl space-y-4">
          <div>
            <h4 className="text-sm font-black text-[#1C1917]">
              Agency Credential &amp; Fire Service License Verification
            </h4>
            <p className="text-xs text-[#44403C]">
              VigilAMC never auto-generates fake license numbers. An agency is displayed as Verified only after supporting
              credentials are reviewed and marked <strong>VERIFIED</strong>.
            </p>
          </div>

          <form onSubmit={handleSaveAgencyCredential} className="p-4 rounded-xl bg-white border border-slate-200 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Agency Legal Name *</label>
                <input
                  type="text"
                  required
                  value={agencyForm.legalName}
                  onChange={(e) => setAgencyForm({ ...agencyForm, legalName: e.target.value })}
                  className="w-full px-3 py-1.5 rounded border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Business Address</label>
                <input
                  type="text"
                  value={agencyForm.businessAddress}
                  onChange={(e) => setAgencyForm({ ...agencyForm, businessAddress: e.target.value })}
                  className="w-full px-3 py-1.5 rounded border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={agencyForm.gstin}
                  onChange={(e) => setAgencyForm({ ...agencyForm, gstin: e.target.value })}
                  placeholder="Optional GSTIN"
                  className="w-full px-3 py-1.5 rounded border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Fire Service License Number (If Applicable)
                </label>
                <input
                  type="text"
                  value={agencyForm.licenseNumber}
                  onChange={(e) => setAgencyForm({ ...agencyForm, licenseNumber: e.target.value })}
                  placeholder="Leave blank if not applicable"
                  className="w-full px-3 py-1.5 rounded border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">License Issuing Authority</label>
                <input
                  type="text"
                  value={agencyForm.issuingAuthority}
                  onChange={(e) => setAgencyForm({ ...agencyForm, issuingAuthority: e.target.value })}
                  placeholder="e.g. State Fire Service Directorate"
                  className="w-full px-3 py-1.5 rounded border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Admin Verification Status</label>
                <select
                  value={agencyForm.verificationStatus}
                  onChange={(e) => setAgencyForm({ ...agencyForm, verificationStatus: e.target.value })}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 font-bold"
                >
                  <option value="NOT_PROVIDED">NOT PROVIDED</option>
                  <option value="PENDING_VERIFICATION">PENDING VERIFICATION</option>
                  <option value="VERIFIED">VERIFIED (Admin Reviewed)</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">License Issue Date</label>
                <input
                  type="date"
                  value={agencyForm.issueDate}
                  onChange={(e) => setAgencyForm({ ...agencyForm, issueDate: e.target.value })}
                  className="w-full px-3 py-1.5 rounded border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">License Expiry Date</label>
                <input
                  type="date"
                  value={agencyForm.expiryDate}
                  onChange={(e) => setAgencyForm({ ...agencyForm, expiryDate: e.target.value })}
                  className="w-full px-3 py-1.5 rounded border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Supporting Document URL</label>
                <input
                  type="text"
                  value={agencyForm.supportingDocUrl}
                  onChange={(e) => setAgencyForm({ ...agencyForm, supportingDocUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 rounded border border-slate-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div className="text-[11px] text-slate-600">
                Current Report Display Status:{' '}
                <strong className="text-slate-900">{data?.agencyCredential?.verificationStatusLabel}</strong>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="btn-flame px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save & Update Agency Credential Status'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBTAB 5: TECHNICIAN CREDENTIAL MANAGEMENT (Step 8) */}
      {activeSubTab === 'TECHNICIAN_CREDENTIALS' && (
        <div className="glass-panel-dense p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-[#1C1917]">Technician Credential Management</h4>
              <p className="text-xs text-[#44403C]">
                Record actual technician designations, qualifications, and training certificates. Never auto-assigns
                &ldquo;Chief Fire Safety Auditor&rdquo; or &ldquo;ISI/NBC Certified Auditor&rdquo;.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNewTechCred((prev) => !prev)}
              className="btn-flame inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Technician Credential</span>
            </button>
          </div>

          {showNewTechCred && (
            <form
              onSubmit={handleSaveTechnicianCredential}
              className="p-4 rounded-xl bg-white border border-[#FED7AA] space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={techForm.fullName}
                    onChange={(e) => setTechForm({ ...techForm, fullName: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={techForm.employeeId}
                    onChange={(e) => setTechForm({ ...techForm, employeeId: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Designation</label>
                  <input
                    type="text"
                    value={techForm.designation}
                    onChange={(e) => setTechForm({ ...techForm, designation: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. ITI / Diploma in Fire & Safety"
                    value={techForm.qualification}
                    onChange={(e) => setTechForm({ ...techForm, qualification: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Certificate Issuing Org</label>
                  <input
                    type="text"
                    value={techForm.issuingOrganization}
                    onChange={(e) => setTechForm({ ...techForm, issuingOrganization: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Certificate No. &amp; Status</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Cert No."
                      value={techForm.certificateNumber}
                      onChange={(e) => setTechForm({ ...techForm, certificateNumber: e.target.value })}
                      className="w-1/2 px-2 py-1.5 rounded border border-slate-300"
                    />
                    <select
                      value={techForm.verificationStatus}
                      onChange={(e) => setTechForm({ ...techForm, verificationStatus: e.target.value })}
                      className="w-1/2 px-2 py-1.5 rounded border border-slate-300 font-bold"
                    >
                      <option value="PENDING_VERIFICATION">PENDING</option>
                      <option value="VERIFIED">VERIFIED</option>
                      <option value="NOT_PROVIDED">NOT PROVIDED</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTechCred(false)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded bg-[#EA580C] text-white font-bold cursor-pointer"
                >
                  Save Technician Credential
                </button>
              </div>
            </form>
          )}

          <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Technician Name &amp; ID</th>
                  <th className="py-2.5 px-3">Designation</th>
                  <th className="py-2.5 px-3">Qualification &amp; Training</th>
                  <th className="py-2.5 px-3">Certificate Details</th>
                  <th className="py-2.5 px-3">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {techCredentials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 px-4 text-center text-slate-500">
                      No custom technician credential records submitted yet. Reports default to &ldquo;Field Service
                      Technician&rdquo; without invented auditor claims.
                    </td>
                  </tr>
                ) : (
                  techCredentials.map((tc: any) => (
                    <tr key={tc.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        <div>{tc.fullName}</div>
                        <div className="text-[10px] font-mono text-slate-500">{tc.employeeId || '—'}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">{tc.designation}</td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">{tc.qualification || 'Not Provided'}</td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                        {tc.certificateNumber ? `${tc.certificateNumber} (${tc.issuingOrganization || ''})` : 'Not Provided'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            tc.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {tc.verificationStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 6: REPORT GENERATION HISTORY & VERSION AUDIT TRAIL (Step 14) */}
      {activeSubTab === 'REPORT_HISTORY' && (
        <div className="glass-panel-dense p-5 rounded-2xl space-y-3">
          <div>
            <h4 className="text-sm font-black text-[#1C1917]">
              Report Generation History &amp; Version Audit Trail
            </h4>
            <p className="text-xs text-[#44403C]">
              Every generated inspection report is logged with its jurisdiction code, template version, 7-state inspection
              status, and SHA-256 record integrity hash.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Report Ref ID</th>
                  <th className="py-2.5 px-3">Premises / Building</th>
                  <th className="py-2.5 px-3">Jurisdiction &amp; Type</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Assets (Op / Total)</th>
                  <th className="py-2.5 px-3">Template Version &amp; Hash</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 px-4 text-center text-slate-500">
                      No inspection reports generated yet. Open any building report to create a versioned audit record.
                    </td>
                  </tr>
                ) : (
                  reportHistory.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{r.reportReferenceId}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {r.building?.name || 'Registered Building'}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-700">
                        <div className="font-bold">{r.jurisdictionCode}</div>
                        <div className="text-[10px] text-slate-500">{r.reportType}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                          {r.inspectionStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        {r.operationalCount} / {r.totalRegistered}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                        v{r.templateVersion} &bull; {r.integrityHash?.slice(0, 10)}
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-2 whitespace-nowrap">
                        <Link
                          href={`/report/${r.buildingId}`}
                          target="_blank"
                          className="text-[#EA580C] font-bold hover:underline"
                        >
                          Open Report
                        </Link>
                        <Link
                          href={`/verify/${encodeURIComponent(r.reportReferenceId)}`}
                          target="_blank"
                          className="text-slate-600 font-semibold hover:underline"
                        >
                          Verify
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
