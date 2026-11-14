'use client';

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, Loader2, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/clientAuth';
import { formatCalendarDate, toCalendarDateInput } from '@/lib/dateUtils';

interface EmailReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildingId: string;
  buildingName: string;
  clientEmail?: string | null;
  clientName?: string | null;
  onSuccess?: (sentAt: string) => void;
}

export function EmailReportModal({
  isOpen,
  onClose,
  buildingId,
  buildingName,
  clientEmail,
  clientName,
  onSuccess,
}: EmailReportModalProps) {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('support@vigilamc.com');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentTime, setSentTime] = useState<string | null>(null);
  const [configMissing, setConfigMissing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTo(clientEmail || '');
      setCc('support@vigilamc.com');
      const todayStr = formatCalendarDate(new Date());
      const rawSubject = `VigilAMC — Form B Report: ${buildingName} · ${todayStr}`;
      setSubject(rawSubject.slice(0, 60));
      setMessage('Please find attached the official 5-page Form B Fire Safety Inspection & Maintenance Report for your premises.');
      setSentTime(null);
      setConfigMissing(false);
    }
  }, [isOpen, clientEmail, buildingName]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !to.includes('@')) {
      toast.error('Please enter a valid recipient email address.');
      return;
    }

    setSending(true);
    try {
      const res = await fetchWithAuth('/api/reports/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingId,
          to: to.trim(),
          cc: cc.trim() || null,
          subject: subject.trim().slice(0, 60),
          message: message.trim() || null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.errorCode === 'CONFIG_MISSING' || data.error?.includes('RESEND_API_KEY')) {
          setConfigMissing(true);
        }
        throw new Error(data.error || 'Failed to dispatch Form B email');
      }

      const timeFormatted = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setSentTime(timeFormatted);
      if (data.isDevSimulation) {
        toast.info(`Dev Mode: Form B report simulated & logged to terminal.`);
      } else {
        toast.success(`Form B report email sent successfully to ${to}`);
      }
      if (onSuccess) {
        onSuccess(timeFormatted);
      }
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err: any) {
      console.error('[Email Form B Error]:', err);
      toast.error(err.message || 'Error dispatching Form B report. Please retry.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-report-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#FED7AA] overflow-hidden text-[#1C1917]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-[#FFF8F2] via-white to-[#FFF8F2] border-b border-[#FED7AA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 border border-[#FED7AA] flex items-center justify-center text-[#EA580C]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 id="email-report-title" className="text-base font-extrabold text-[#1C1917] tracking-tight">
                Email Form B Report to Client
              </h2>
              <p className="text-xs text-[#44403C] line-clamp-1">
                {buildingName} {clientName ? `• ${clientName}` : ''}
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

        {/* Form Body */}
        <form onSubmit={handleSend} className="p-6 space-y-4 text-xs">
          {configMissing && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1 animate-in fade-in">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>RESEND_API_KEY Not Configured</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Add <strong>RESEND_API_KEY</strong> in your <strong>Vercel Project Settings &rarr; Environment Variables</strong> (or in <code>.env.local</code> for local development), then redeploy to dispatch live emails.
              </p>
            </div>
          )}

          {/* Attachment Pill */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] text-[11px] text-[#44403C]">
            <FileText className="w-4 h-4 text-[#EA580C] shrink-0" />
            <span className="font-semibold text-[#1C1917]">Attachment:</span>
            <span className="font-mono text-[#C2410C] truncate">
              Form-B-Report-{buildingName.replace(/[^a-zA-Z0-9_-]/g, '_')}-{toCalendarDateInput(new Date())}.pdf
            </span>
            <span className="ml-auto text-[10px] text-[#78716C] shrink-0">5-Page PDF</span>
          </div>

          {/* To */}
          <div>
            <label className="block text-[11px] font-bold text-[#1C1917] mb-1">
              Recipient Email (To) <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="email"
              required
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="e.g. facility.director@client.com"
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

          {/* 3-line editable message */}
          <div>
            <label className="block text-[11px] font-bold text-[#1C1917] mb-1">
              Custom Message to Client <span className="text-[#78716C] font-normal">(Optional note)</span>
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add any specific instruction or note for the facility committee..."
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
              disabled={sending || Boolean(sentTime)}
              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-extrabold text-white shadow-md transition-all ${
                sentTime
                  ? 'bg-[#059669] cursor-default'
                  : 'bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:from-[#C2410C] hover:to-[#9A3412] active:scale-[0.98]'
              } disabled:opacity-70`}
            >
              {sending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF &amp; Sending...</span>
                </>
              ) : sentTime ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sent ✓ {sentTime}</span>
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Form B PDF</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
