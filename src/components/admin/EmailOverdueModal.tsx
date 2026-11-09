'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Mail, CheckCircle2, AlertTriangle, Clock, Layers, Loader2, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface EmailOverdueModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string | null;
  buildingId?: string | null;
  clientName?: string | null;
  clientEmail?: string | null;
  onSuccess?: (sentAt: string) => void;
}

export function EmailOverdueModal({
  isOpen,
  onClose,
  clientId,
  buildingId,
  clientName,
  clientEmail,
  onSuccess,
}: EmailOverdueModalProps) {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('support@vigilamc.com');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [includeOverdue, setIncludeOverdue] = useState(true);
  const [includeNext7Days, setIncludeNext7Days] = useState(true);
  const [includeNext30Days, setIncludeNext30Days] = useState(false);

  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [scopeCounts, setScopeCounts] = useState<{
    overdue: number;
    next7Days: number;
    next30Days: number;
    totalItems: number;
  }>({ overdue: 0, next7Days: 0, next30Days: 0, totalItems: 0 });

  const [summaryCounts, setSummaryCounts] = useState<{
    overdue: number;
    dueSoon: number;
    totalAssets: number;
  }>({ overdue: 0, dueSoon: 0, totalAssets: 0 });

  const [sending, setSending] = useState(false);
  const [sentTime, setSentTime] = useState<string | null>(null);
  const [configMissing, setConfigMissing] = useState(false);

  // Load preview data and client prefill from server
  useEffect(() => {
    if (!isOpen) return;

    setTo(clientEmail || '');
    setCc('support@vigilamc.com');
    setIncludeOverdue(true);
    setIncludeNext7Days(true);
    setIncludeNext30Days(false);
    setMessage('Please review the active fire safety equipment service schedule and overdue rectifications below.');
    setSentTime(null);
    setDataError(null);

    const qs = new URLSearchParams();
    if (clientId) qs.set('clientId', clientId);
    else if (buildingId) qs.set('buildingId', buildingId);

    if (!qs.toString()) return;

    setLoadingData(true);
    fetch(`/api/clients/overdue-email?${qs.toString()}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to load client items');
        }
        return res.json();
      })
      .then((data) => {
        if (data.client?.email && !clientEmail) {
          setTo(data.client.email);
        }
        if (data.defaultSubject) {
          setSubject(data.defaultSubject);
        } else {
          setSubject(`VigilAMC: Overdue & Upcoming Items — ${data.client?.name || clientName || 'Client'}`);
        }
        if (data.scopeCounts) {
          setScopeCounts(data.scopeCounts);
        }
        if (data.summaryCounts) {
          setSummaryCounts(data.summaryCounts);
        }
      })
      .catch((err) => {
        console.error('[EmailOverdueModal Fetch Error]:', err);
        setDataError(err.message || 'Failed to fetch items');
      })
      .finally(() => {
        setLoadingData(false);
      });
  }, [isOpen, clientId, buildingId, clientEmail, clientName]);

  // Live calculated count of items included based on checked boxes
  const itemsIncludedCount = useMemo(() => {
    let count = 0;
    if (includeOverdue) count += scopeCounts.overdue;
    if (includeNext7Days) count += scopeCounts.next7Days;
    if (includeNext30Days) count += scopeCounts.next30Days;
    return count;
  }, [includeOverdue, includeNext7Days, includeNext30Days, scopeCounts]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !to.includes('@')) {
      toast.error('Please enter a valid recipient email address.');
      return;
    }

    if (!includeOverdue && !includeNext7Days && !includeNext30Days) {
      toast.error('Please select at least one scope checkbox to include items in the email.');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/clients/overdue-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientId || null,
          buildingId: buildingId || null,
          to: to.trim(),
          cc: cc.trim() || null,
          subject: subject.trim().slice(0, 60),
          message: message.trim() || null,
          includeOverdue,
          includeNext7Days,
          includeNext30Days,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.errorCode === 'CONFIG_MISSING' || data.error?.includes('RESEND_API_KEY')) {
          setConfigMissing(true);
        }
        throw new Error(data.error || 'Failed to dispatch overdue update email');
      }

      const timeFormatted = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setSentTime(timeFormatted);
      if (data.isDevSimulation) {
        toast.info(`Dev Mode: Overdue update email simulated & logged to terminal.`);
      } else {
        toast.success(`Overdue update email successfully dispatched to ${to}`);
      }
      if (onSuccess) {
        onSuccess(timeFormatted);
      }
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err: any) {
      console.error('[Email Overdue Error]:', err);
      toast.error(err.message || 'Error dispatching overdue email. Please retry.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-overdue-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#FED7AA] overflow-hidden text-[#1C1917]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-[#FFF8F2] via-white to-[#FFF8F2] border-b border-[#FED7AA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-[#DC2626]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="email-overdue-title" className="text-base font-extrabold text-[#1C1917] tracking-tight">
                Email Overdue &amp; Due-Date Update
              </h2>
              <p className="text-xs text-[#44403C] line-clamp-1">
                {clientName || 'Client Records'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary Mini-Strip */}
        <div className="px-6 py-3 bg-[#FFF8F2] border-b border-[#FED7AA]/60 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-[#DC2626]">
            <div className="text-[10px] font-bold uppercase">Overdue</div>
            <div className="text-base font-black tabular-nums">{summaryCounts.overdue}</div>
          </div>
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-300 text-[#D97706]">
            <div className="text-[10px] font-bold uppercase">Due Soon</div>
            <div className="text-base font-black tabular-nums">{summaryCounts.dueSoon}</div>
          </div>
          <div className="p-2 rounded-xl bg-white border border-[#FED7AA] text-[#1C1917]">
            <div className="text-[10px] font-bold uppercase">Tracked Assets</div>
            <div className="text-base font-black tabular-nums">{summaryCounts.totalAssets}</div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} className="p-6 space-y-4 text-xs">
          {configMissing && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1 animate-in fade-in">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>RESEND_API_KEY Not Configured</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Add <strong>RESEND_API_KEY</strong> in your <strong>Vercel Project Settings &rarr; Environment Variables</strong> (or in <code>.env.local</code> for local testing), then redeploy to dispatch live emails.
              </p>
            </div>
          )}

          {dataError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#DC2626] text-xs">
              {dataError}
            </div>
          )}

          {/* Scope Checkboxes & Live Preview Count */}
          <div className="p-3.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#1C1917] text-[11px] uppercase tracking-wider">
                Include in Digest:
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-[#EA580C] text-[11px] bg-white px-2 py-0.5 rounded-md border border-[#FED7AA]">
                <Layers className="w-3.5 h-3.5" />
                <span>{itemsIncludedCount} {itemsIncludedCount === 1 ? 'item' : 'items'} will be included</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#FED7AA]/80 cursor-pointer hover:bg-orange-50/50 transition-colors">
                <input
                  type="checkbox"
                  checked={includeOverdue}
                  onChange={(e) => setIncludeOverdue(e.target.checked)}
                  className="rounded text-[#EA580C] focus:ring-[#EA580C] w-4 h-4 cursor-pointer"
                />
                <span className="font-bold text-[#DC2626]">Overdue items ({scopeCounts.overdue})</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#FED7AA]/80 cursor-pointer hover:bg-orange-50/50 transition-colors">
                <input
                  type="checkbox"
                  checked={includeNext7Days}
                  onChange={(e) => setIncludeNext7Days(e.target.checked)}
                  className="rounded text-[#EA580C] focus:ring-[#EA580C] w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-[#D97706]">Due &le; 7 days ({scopeCounts.next7Days})</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#FED7AA]/80 cursor-pointer hover:bg-orange-50/50 transition-colors">
                <input
                  type="checkbox"
                  checked={includeNext30Days}
                  onChange={(e) => setIncludeNext30Days(e.target.checked)}
                  className="rounded text-[#EA580C] focus:ring-[#EA580C] w-4 h-4 cursor-pointer"
                />
                <span className="font-medium text-[#44403C]">Due &le; 30 days ({scopeCounts.next30Days})</span>
              </label>
            </div>
          </div>

          {/* To */}
          <div>
            <label className="block text-[11px] font-bold text-[#1C1917] mb-1">
              Client Recipient Email (To) <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="email"
              required
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="e.g. client@society.org"
              className="w-full px-3 py-2 rounded-xl border border-[#FED7AA] bg-white text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/40"
            />
          </div>

          {/* CC */}
          <div>
            <label className="block text-[11px] font-bold text-[#1C1917] mb-1">
              CC <span className="text-[#78716C] font-normal">(Default Agency Records)</span>
            </label>
            <input
              type="text"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="support@vigilamc.com"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/40"
            />
          </div>

          {/* Subject */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-[#1C1917]">
                Subject Line
              </label>
              <span className={`text-[10px] ${subject.length > 60 ? 'text-[#DC2626] font-bold' : 'text-[#78716C]'}`}>
                {subject.length}/60 chars
              </span>
            </div>
            <input
              type="text"
              required
              maxLength={60}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#FED7AA] bg-white text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/40"
            />
          </div>

          {/* 2-line editable message */}
          <div>
            <label className="block text-[11px] font-bold text-[#1C1917] mb-1">
              Custom Message to Client <span className="text-[#78716C] font-normal">(Optional 2-line note)</span>
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Please approve technician visit for extinguisher hydro-testing this Thursday."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/40 resize-none"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-[#FED7AA]/60 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={sending}
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-[#44403C] hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={sending || Boolean(sentTime) || itemsIncludedCount === 0}
              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-extrabold text-white shadow-md transition-all ${
                sentTime
                  ? 'bg-[#059669] cursor-default'
                  : 'bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:from-[#C2410C] hover:to-[#9A3412] active:scale-[0.98]'
              } disabled:opacity-60`}
            >
              {sending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending Overdue Digest...</span>
                </>
              ) : sentTime ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sent ✓ {sentTime}</span>
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Overdue Update</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
