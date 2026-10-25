'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { InvestorLeadsView } from '@/components/admin/InvestorLeadsView';
import { isFounderOwner } from '@/lib/founderAuth';

type FounderTab = 'LEADS' | 'INVESTORS' | 'TOOLS';

export default function FounderConsolePage() {
  const [authChecking, setAuthChecking] = useState(true);
  const [authorizedEmail, setAuthorizedEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FounderTab>('LEADS');

  const [enquiriesList, setEnquiriesList] = useState<any[]>([]);
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState('ALL');
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchEnquiries = async (statusOverride?: string) => {
    try {
      setLoadingEnquiries(true);
      const filterToUse = statusOverride ?? enquiryStatusFilter;
      const query = new URLSearchParams();
      if (filterToUse !== 'ALL') query.set('status', filterToUse);
      const res = await fetch(`/api/enquiries?${query.toString()}`);
      if (res.status === 401 || res.status === 403) {
        window.location.href = '/dashboard';
        return;
      }
      const json = await res.json();
      if (json.enquiries) {
        setEnquiriesList(json.enquiries);
      }
    } catch (e) {
      console.error('Error fetching founder enquiries:', e);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  useEffect(() => {
    async function verifyFounderSession() {
      try {
        const res = await fetch('/api/auth/me');
        const json = await res.json();

        if (!res.ok || !json.authenticated || !json.user?.email) {
          window.location.href = '/login?redirect=/founder';
          return;
        }

        if (!isFounderOwner(json.user.email)) {
          window.location.href = '/dashboard';
          return;
        }

        setAuthorizedEmail(json.user.email);
        setAuthChecking(false);
        fetchEnquiries('ALL');
      } catch (e) {
        window.location.href = '/login?redirect=/founder';
      }
    }
    verifyFounderSession();
  }, []);

  const handleUpdateEnquiryStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Lead status updated to ${newStatus}`);
        setEnquiriesList((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteEnquiry = async (id: string, email: string) => {
    if (!confirm(`Permanently delete lead from "${email}"?`)) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/enquiries?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setEnquiriesList((prev) => prev.filter((item) => item.id !== id));
        showToast('Lead permanently deleted');
      } else {
        alert(json.error || 'Failed to delete lead');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleWipeAllDemo = async () => {
    const confirmation = prompt(
      'DANGER: This will permanently delete all demo clients, buildings, and equipment in your organization. Type DELETE to confirm:'
    );
    if (confirmation !== 'DELETE') {
      alert('Wipe cancelled. Confirmation word did not match "DELETE".');
      return;
    }
    try {
      setMaintenanceLoading(true);
      const res = await fetch('/api/admin/data-manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'WIPE_ALL_DEMO', confirmation: 'DELETE' }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || 'Demo data wiped successfully');
      } else {
        alert(json.error || 'Failed to wipe data');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleSeedCleanData = async () => {
    if (
      !confirm(
        'This will load clean, non-trademarked operational sample data (Horizon Tech IT Tower) for testing. Continue?'
      )
    )
      return;
    try {
      setMaintenanceLoading(true);
      const res = await fetch('/api/admin/data-manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEED_CLEAN' }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || 'Clean starter data seeded');
      } else {
        alert(json.error || 'Failed to seed data');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  if (authChecking || !authorizedEmail) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex items-center justify-center p-6 text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-7 h-7 animate-spin text-amber-400" />
          <p className="text-xs font-bold tracking-wider uppercase text-slate-400">
            Verifying Founder Security Clearance...
          </p>
        </div>
      </div>
    );
  }

  const unreadLeadsCount = enquiriesList.filter((e) => e.status === 'NEW').length;

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 p-4 sm:p-6 lg:p-10">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border-2 border-amber-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Bar with Back Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-[#293548] rounded-2xl p-5 shadow-xl">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>&larr; Back to Agency Dashboard</span>
            </Link>
            <div className="flex items-center gap-2.5 pt-1">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Private Founder Operations Console
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Founder Restricted
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Authenticated as <span className="font-mono text-slate-200">{authorizedEmail}</span>
            </p>
          </div>

          {/* Sub-Navigation */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('LEADS')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'LEADS'
                  ? 'bg-amber-500 text-slate-900 shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Website Leads ({enquiriesList.length})</span>
              {unreadLeadsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white">
                  {unreadLeadsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('INVESTORS')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'INVESTORS'
                  ? 'bg-amber-500 text-slate-900 shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Investor Leads</span>
            </button>

            <button
              onClick={() => setActiveTab('TOOLS')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'TOOLS'
                  ? 'bg-amber-500 text-slate-900 shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Platform Data Maintenance</span>
            </button>
          </div>
        </div>

        {/* Main Content Panel */}
        <div className="rounded-2xl bg-[#111827] border border-[#293548] p-5 sm:p-6 shadow-xl">
          {activeTab === 'LEADS' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white">Inbound Website Inquiries</h2>
                  <p className="text-xs text-slate-400">
                    Direct submissions from public contact, pilot, and demo forms stored in Supabase PostgreSQL.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {['ALL', 'NEW', 'CONTACTED', 'CONVERTED', 'ARCHIVED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setEnquiryStatusFilter(st);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        enquiryStatusFilter === st
                          ? 'bg-amber-500 text-slate-900 shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}

                  <button
                    onClick={() => fetchEnquiries()}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    title="Refresh Leads"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingEnquiries ? 'animate-spin text-amber-400' : ''}`} />
                  </button>
                </div>
              </div>

              {enquiriesList.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
                  No website leads found.
                </div>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Name / Contact</th>
                        <th className="py-2.5 px-3">Type / Company</th>
                        <th className="py-2.5 px-3">Message / Details</th>
                        <th className="py-2.5 px-3 text-right">Status &amp; Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {enquiriesList
                        .filter((e) => (enquiryStatusFilter === 'ALL' ? true : e.status === enquiryStatusFilter))
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                              {new Date(item.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-white">{item.name || 'Anonymous'}</div>
                              <div className="text-[11px] text-slate-400">
                                {item.email} {item.phone ? `• ${item.phone}` : ''}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200">
                                {item.type}
                              </span>
                              {item.company && (
                                <div className="text-[11px] text-slate-400 mt-0.5">{item.company}</div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 max-w-xs truncate text-slate-300" title={item.message || ''}>
                              {item.message || '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="inline-flex items-center gap-2 justify-end">
                                <select
                                  value={item.status}
                                  onChange={(e) => handleUpdateEnquiryStatus(item.id, e.target.value)}
                                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white"
                                >
                                  <option value="NEW">NEW</option>
                                  <option value="CONTACTED">CONTACTED</option>
                                  <option value="CONVERTED">CONVERTED</option>
                                  <option value="ARCHIVED">ARCHIVED</option>
                                </select>

                                <button
                                  type="button"
                                  disabled={deletingId === item.id}
                                  onClick={() => handleDeleteEnquiry(item.id, item.email)}
                                  className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 transition-colors disabled:opacity-50"
                                  title="Delete Lead"
                                  aria-label="Delete Lead"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'INVESTORS' && <InvestorLeadsView />}

          {activeTab === 'TOOLS' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-base font-bold text-white">Platform Data Maintenance Tools</h2>
                <p className="text-xs text-slate-400">
                  Founder operations for resetting test databases or loading clean non-trademarked evaluation records.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-red-950/20 border-2 border-red-500/40 space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span>Wipe All Demo Companies &amp; Data</span>
                </div>
                <p className="text-xs text-slate-300">
                  This permanently removes all test client societies, buildings, and equipment records in your founder workspace.
                  Requires typing <strong className="font-mono font-bold">DELETE</strong> to confirm.
                </p>
                <div className="pt-1">
                  <button
                    onClick={handleWipeAllDemo}
                    disabled={maintenanceLoading}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    Wipe All Demo Records
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Load Clean Starter Template</span>
                </div>
                <p className="text-xs text-slate-400">
                  Seeds a clean, unbranded reference structure with generic facilities (Horizon Tech IT Tower) to test field inspections, GPS logs, and Form-B reports.
                </p>
                <div className="pt-1">
                  <button
                    onClick={handleSeedCleanData}
                    disabled={maintenanceLoading}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    Load Clean Template Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
