'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Users,
  Wrench,
  ClipboardCheck,
  FileText,
  ExternalLink,
  RefreshCw,
  Edit3,
  X,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface OwnerAgencyDrilldownProps {
  agencyId: string;
  ownerEmail: string;
}

function formatShortDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatInr(amount?: number | null): string {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `₹${num.toLocaleString('en-IN')}`;
}

export default function OwnerAgencyDrilldownClient({
  agencyId,
  ownerEmail,
}: OwnerAgencyDrilldownProps) {
  const supabase = useMemo(() => createClient(), []);
  const [data, setData] = useState<any | null>(null);
  const [feedEvents, setFeedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Edit modal
  const [editing, setEditing] = useState<boolean>(false);
  const [editPlan, setEditPlan] = useState<string>('FOUNDING_MONTHLY');
  const [editMonthlyPrice, setEditMonthlyPrice] = useState<string>('3999');
  const [editStatus, setEditStatus] = useState<string>('ACTIVE');
  const [editExpiresAt, setEditExpiresAt] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {};
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    } catch {
      // Rely on server cookies
    }
    return headers;
  }, [supabase]);

  const loadDrilldown = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = await getAuthHeaders();
      const [detailRes, feedRes] = await Promise.all([
        fetch(`/api/owner/agencies/${agencyId}`, { headers, cache: 'no-store' }),
        fetch(`/api/owner/activity?agencyId=${encodeURIComponent(agencyId)}&limit=50`, {
          headers,
          cache: 'no-store',
        }),
      ]);
      if (!detailRes.ok) {
        throw new Error(`Failed to load agency drill-down (HTTP ${detailRes.status})`);
      }
      const detailJson = await detailRes.json();
      const feedJson = feedRes.ok ? await feedRes.json() : { events: [] };

      setData(detailJson);
      setFeedEvents(Array.isArray(feedJson.events) ? feedJson.events : []);

      const ag = detailJson.agency;
      if (ag) {
        setEditPlan(ag.plan || 'FOUNDING_MONTHLY');
        setEditMonthlyPrice(String(ag.monthlyPrice ?? 3999));
        setEditStatus(ag.subscriptionStatus || 'ACTIVE');
        setEditExpiresAt(
          ag.subscriptionExpiresAt ? ag.subscriptionExpiresAt.slice(0, 10) : ''
        );
        setEditNotes(ag.subscriptionNotes || '');
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to load agency drill-down';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [agencyId, getAuthHeaders]);

  useEffect(() => {
    loadDrilldown();
  }, [loadDrilldown]);

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const headers = await getAuthHeaders();
      const parsedPrice = Math.max(0, Math.round(Number(editMonthlyPrice) || 0));
      const res = await fetch('/api/owner/agencies', {
        method: 'PATCH',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agencyId,
          plan: editPlan,
          monthlyPrice: parsedPrice,
          status: editStatus,
          expiresAt: editExpiresAt ? new Date(editExpiresAt).toISOString() : null,
          notes: editNotes.trim() || null,
        }),
      });
      const resJson = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resJson?.error || `Failed to save subscription (HTTP ${res.status})`);
      }
      toast.success(`Updated subscription plan to ${editPlan} (${formatInr(parsedPrice)}/mo)`);
      setEditing(false);
      await loadDrilldown();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update subscription');
    } finally {
      setSaving(false);
    }
  };

  const ag = data?.agency;

  return (
    <div className="min-h-screen bg-[#FFF8F2] text-[#1C1917] flex flex-col">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#F0E4D8] shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/owner"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF8F2] hover:bg-[#FFF0E6] border border-[#E5D5C5] text-xs font-bold text-[#1C1917]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Back to Owner Console</span>
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black text-[#1C1917]">
                {ag ? ag.name : 'Agency Drill-Down'}
              </h1>
              <div className="text-[11px] font-semibold text-[#44403C]">
                Owner: {ownerEmail}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {ag && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF0E6] border border-[#FED7AA] text-[#9A3412] text-xs font-bold cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Subscription</span>
              </button>
            )}
            <button
              type="button"
              onClick={loadDrilldown}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EA580C] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-5 space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs font-bold">
            {error}
          </div>
        )}

        {ag && (
          <>
            {/* Agency Profile + Subscription + Counts */}
            <section className="bg-white rounded-2xl border border-[#E5D5C5] p-5 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F0E4D8] pb-4">
                <div>
                  <h2 className="text-xl font-black text-[#1C1917]">{ag.name}</h2>
                  <p className="text-xs font-semibold text-[#44403C] mt-0.5">
                    Email: {ag.email || 'Not provided'} • Phone: {ag.phone || 'Not provided'} •{' '}
                    {ag.city || 'City N/A'}, {ag.state || 'State N/A'} • Created{' '}
                    {formatShortDate(ag.createdAt)}
                  </p>
                  {ag.subscriptionNotes && (
                    <p className="text-xs font-semibold text-[#9A3412] mt-1.5 bg-[#FFF0E6] px-3 py-1 rounded-lg border border-[#FED7AA] inline-block">
                      Owner Notes: {ag.subscriptionNotes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap text-xs">
                  <div className="px-3.5 py-2 rounded-xl bg-[#FFF8F2] border border-[#F0E4D8]">
                    <span className="text-[10px] font-extrabold uppercase text-[#44403C] block">
                      Plan &amp; Status
                    </span>
                    <span className="font-mono font-black text-[#1C1917]">
                      {ag.plan} ({ag.subscriptionStatus})
                    </span>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-[#FFF8F2] border border-[#F0E4D8]">
                    <span className="text-[10px] font-extrabold uppercase text-[#44403C] block">
                      Monthly Price
                    </span>
                    <span className="font-mono font-black text-[#047857]">
                      {formatInr(ag.monthlyPrice)}/mo
                    </span>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-[#FFF8F2] border border-[#F0E4D8]">
                    <span className="text-[10px] font-extrabold uppercase text-[#44403C] block">
                      Expires On
                    </span>
                    <span className="font-bold text-[#1C1917]">
                      {formatShortDate(ag.subscriptionExpiresAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#FFF8F2] border border-[#F0E4D8]">
                  <span className="text-[10px] font-extrabold uppercase text-[#44403C] block">
                    Buildings
                  </span>
                  <span className="text-xl font-black text-[#1C1917]">
                    {ag.counts.buildings}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FFF8F2] border border-[#F0E4D8]">
                  <span className="text-[10px] font-extrabold uppercase text-[#44403C] block">
                    Assets
                  </span>
                  <span className="text-xl font-black text-[#1C1917]">{ag.counts.assets}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FFF8F2] border border-[#F0E4D8]">
                  <span className="text-[10px] font-extrabold uppercase text-[#44403C] block">
                    Users
                  </span>
                  <span className="text-xl font-black text-[#1C1917]">{ag.counts.users}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FFF8F2] border border-[#F0E4D8]">
                  <span className="text-[10px] font-extrabold uppercase text-[#44403C] block">
                    Technicians
                  </span>
                  <span className="text-xl font-black text-[#1C1917]">
                    {ag.counts.technicians}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FFF8F2] border border-[#F0E4D8]">
                  <span className="text-[10px] font-extrabold uppercase text-[#44403C] block">
                    Inspections (30d)
                  </span>
                  <span className="text-xl font-black text-[#047857]">
                    {ag.counts.inspections30d}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FFF8F2] border border-[#F0E4D8]">
                  <span className="text-[10px] font-extrabold uppercase text-[#44403C] block">
                    Reports
                  </span>
                  <span className="text-xl font-black text-[#1C1917]">
                    {ag.counts.reportsTotal}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FFF8F2] border border-[#F0E4D8]">
                  <span className="text-[10px] font-extrabold uppercase text-[#44403C] block">
                    Work Orders
                  </span>
                  <span className="text-xl font-black text-[#1C1917]">
                    {ag.counts.workOrdersTotal}
                  </span>
                </div>
              </div>
            </section>

            {/* Users & Technicians */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <section className="bg-white rounded-2xl border border-[#E5D5C5] overflow-hidden shadow-xs">
                <div className="px-4 py-3 bg-[#FFF8F2] border-b border-[#F0E4D8] flex items-center gap-2 text-xs font-black text-[#1C1917]">
                  <Users className="w-4 h-4 text-[#EA580C]" />
                  <span>Agency Users ({data.users?.length || 0})</span>
                </div>
                <div className="divide-y divide-[#F0E4D8] max-h-72 overflow-y-auto text-xs">
                  {(data.users || []).map((u: any) => (
                    <div key={u.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-[#1C1917]">{u.fullName}</div>
                        <div className="text-[11px] font-mono text-[#44403C]">{u.email}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#9A3412]">{u.role}</span>
                        <div className="text-[11px] text-[#44403C]">
                          Last login: {formatShortDate(u.lastLoginAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-[#E5D5C5] overflow-hidden shadow-xs">
                <div className="px-4 py-3 bg-[#FFF8F2] border-b border-[#F0E4D8] flex items-center gap-2 text-xs font-black text-[#1C1917]">
                  <Wrench className="w-4 h-4 text-[#EA580C]" />
                  <span>Agency Technicians ({data.technicians?.length || 0})</span>
                </div>
                <div className="divide-y divide-[#F0E4D8] max-h-72 overflow-y-auto text-xs">
                  {(data.technicians || []).length === 0 ? (
                    <div className="p-4 text-[#44403C] font-semibold">
                      No technicians registered under this agency.
                    </div>
                  ) : (
                    (data.technicians || []).map((t: any) => (
                      <div
                        key={t.id}
                        className="px-4 py-2.5 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-[#1C1917]">{t.fullName}</div>
                          <div className="text-[11px] font-mono text-[#44403C]">
                            {t.employeeId || t.email}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#047857]">
                            {t.inspectionsCount} inspections
                          </div>
                          <div className="text-[11px] text-[#44403C]">
                            Active: {formatShortDate(t.lastLoginAt)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* Recent Inspections & Recent Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <section className="bg-white rounded-2xl border border-[#E5D5C5] overflow-hidden shadow-xs">
                <div className="px-4 py-3 bg-[#FFF8F2] border-b border-[#F0E4D8] flex items-center gap-2 text-xs font-black text-[#1C1917]">
                  <ClipboardCheck className="w-4 h-4 text-[#EA580C]" />
                  <span>Recent Inspections ({data.recentInspections?.length || 0})</span>
                </div>
                <div className="divide-y divide-[#F0E4D8] max-h-72 overflow-y-auto text-xs">
                  {(data.recentInspections || []).length === 0 ? (
                    <div className="p-4 text-[#44403C] font-semibold">
                      No inspections recorded yet.
                    </div>
                  ) : (
                    (data.recentInspections || []).map((i: any) => (
                      <div
                        key={i.id}
                        className="px-4 py-2.5 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-[#1C1917]">
                            {i.buildingName} — {i.assetTag}
                          </div>
                          <div className="text-[11px] text-[#44403C]">
                            By {i.technicianName} • {formatShortDate(i.createdAt)} • {i.status}
                          </div>
                        </div>
                        <Link
                          href={i.linkUrl}
                          className="inline-flex items-center gap-1 text-[#C2410C] font-bold hover:underline"
                        >
                          <span>Report</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-[#E5D5C5] overflow-hidden shadow-xs">
                <div className="px-4 py-3 bg-[#FFF8F2] border-b border-[#F0E4D8] flex items-center gap-2 text-xs font-black text-[#1C1917]">
                  <FileText className="w-4 h-4 text-[#EA580C]" />
                  <span>Recent Reports ({data.recentReports?.length || 0})</span>
                </div>
                <div className="divide-y divide-[#F0E4D8] max-h-72 overflow-y-auto text-xs">
                  {(data.recentReports || []).length === 0 ? (
                    <div className="p-4 text-[#44403C] font-semibold">
                      No reports generated for this agency yet.
                    </div>
                  ) : (
                    (data.recentReports || []).map((r: any) => (
                      <div
                        key={r.id}
                        className="px-4 py-2.5 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-mono font-bold text-[#1C1917]">{r.reportRef}</div>
                          <div className="text-[11px] text-[#44403C]">
                            {r.buildingName} ({r.assetsCount} assets) •{' '}
                            {formatShortDate(r.generatedAt)}
                          </div>
                        </div>
                        <Link
                          href={r.linkUrl}
                          className="inline-flex items-center gap-1 text-[#C2410C] font-bold hover:underline"
                        >
                          <span>Open Report</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* Agency Activity Feed */}
            <section className="bg-white rounded-2xl border border-[#E5D5C5] overflow-hidden shadow-xs">
              <div className="px-4 py-3 bg-[#FFF8F2] border-b border-[#F0E4D8] flex items-center gap-2 text-xs font-black text-[#1C1917]">
                <Activity className="w-4 h-4 text-[#EA580C]" />
                <span>Recent Agency Activity ({feedEvents.length})</span>
              </div>
              <div className="divide-y divide-[#F0E4D8] max-h-96 overflow-y-auto text-xs">
                {feedEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="px-4 py-2.5 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold text-[#1C1917]">{ev.sentence}</div>
                      <div className="text-[11px] text-[#44403C]">
                        {ev.category} • {formatShortDate(ev.timestamp)}
                      </div>
                    </div>
                    <Link
                      href={ev.linkUrl}
                      className="inline-flex items-center gap-1 text-[#C2410C] font-bold hover:underline shrink-0"
                    >
                      <span>{ev.linkLabel || 'Open'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {editing && ag && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl border border-[#E5D5C5] shadow-xl max-w-md w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#F0E4D8] pb-3">
              <h3 className="text-base font-black text-[#1C1917]">
                Edit Subscription — {ag.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="p-1 text-[#44403C] hover:text-[#1C1917]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveSubscription} className="space-y-3.5">
              <div>
                <label className="block font-extrabold text-[#1C1917] mb-1">Plan</label>
                <select
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFF8F2] border border-[#E5D5C5] font-bold text-[#1C1917]"
                >
                  <option value="TRIAL">TRIAL</option>
                  <option value="FOUNDING_MONTHLY">FOUNDING_MONTHLY</option>
                  <option value="FOUNDING_ANNUAL">FOUNDING_ANNUAL</option>
                  <option value="BIG_AGENCY">BIG_AGENCY</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-[#1C1917] mb-1">
                    Monthly Price (Rs.)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editMonthlyPrice}
                    onChange={(e) => setEditMonthlyPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF8F2] border border-[#E5D5C5] font-mono font-bold text-[#1C1917]"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-[#1C1917] mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF8F2] border border-[#E5D5C5] font-bold text-[#1C1917]"
                  >
                    <option value="TRIAL">TRIAL</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="EXPIRED">EXPIRED</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-extrabold text-[#1C1917] mb-1">Expires At</label>
                <input
                  type="date"
                  value={editExpiresAt}
                  onChange={(e) => setEditExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFF8F2] border border-[#E5D5C5] font-semibold text-[#1C1917]"
                />
              </div>
              <div>
                <label className="block font-extrabold text-[#1C1917] mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFF8F2] border border-[#E5D5C5] font-medium text-[#1C1917]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl bg-[#FFF8F2] border border-[#E5D5C5] font-bold text-[#44403C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-[#EA580C] text-white font-bold"
                >
                  {saving ? 'Saving...' : 'Save Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
