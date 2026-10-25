'use client';
import { toast } from 'sonner';

import React, { useState } from 'react';
import {
  Bell,
  Mail,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Info,
} from 'lucide-react';
import { formatStandardDate } from '@/lib/constants/india';

interface AlertsSettingsViewProps {
  company?: any;
  showToast?: (msg: string) => void;
}

export function AlertsSettingsView({ company, showToast }: AlertsSettingsViewProps) {
  const [recipientEmails, setRecipientEmails] = useState(
    company?.email || 'compliance@youragency.com'
  );
  const [alert60Days, setAlert60Days] = useState(true);
  const [alert30Days, setAlert30Days] = useState(true);
  const [alert7Days, setAlert7Days] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);
  const [testSentSuccess, setTestSentSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Simulated email dispatch log
  const [emailLogs, setEmailLogs] = useState([
    {
      id: '1',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      recipient: company?.email || 'service@agency.in',
      subject: 'Upcoming Inspection Reminder (30 Days) - Horizon Tower',
      status: 'DELIVERED',
    },
    {
      id: '2',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      recipient: company?.email || 'service@agency.in',
      subject: 'Critical Expiry Notice (7 Days) - Emerald Heights Block A',
      status: 'DELIVERED',
    },
  ]);

  const handleSendTestEmail = async () => {
    setSendingTest(true);
    setTestSentSuccess(false);
    try {
      // Simulate or call test email API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTestSentSuccess(true);
      const newEntry = {
        id: String(Date.now()),
        date: new Date().toISOString(),
        recipient: recipientEmails.split(',')[0].trim(),
        subject: 'Test Notification: Upcoming Fire Equipment Expiry Alert',
        status: 'DELIVERED',
      };
      setEmailLogs([newEntry, ...emailLogs]);
      if (showToast) showToast('Test notification sent successfully.');
    } catch {
      toast.error('Failed to send test email.', { duration: 5500 });
    } finally {
      setSendingTest(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      if (showToast) showToast('Alert settings saved.');
      else toast.error('Alert preferences saved.', { duration: 5500 });
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#C2410C]" />
            <span>Email Alert Settings</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Configure automated service and inspection cycle reminders for your operations team.
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-5">
          {/* Recipient Emails */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Recipient Email Addresses (comma separated)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={recipientEmails}
                onChange={(e) => setRecipientEmails(e.target.value)}
                placeholder="service@agency.in, manager@agency.in"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white  text-slate-900 outline-none focus:border-[#C2410C]"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Inspection and due date reminder digests will be delivered to these email addresses.
            </p>
          </div>

          {/* Trigger Windows */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Send Automated Alerts Before Due Date:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-[#FFF0E6] cursor-pointer">
                <input
                  type="checkbox"
                  checked={alert60Days}
                  onChange={(e) => setAlert60Days(e.target.checked)}
                  className="rounded text-[#C2410C] focus:ring-0"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">60 Days Prior</div>
                  <div className="text-[10px] text-slate-400">Quarterly advance planning</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-[#FFF0E6] cursor-pointer">
                <input
                  type="checkbox"
                  checked={alert30Days}
                  onChange={(e) => setAlert30Days(e.target.checked)}
                  className="rounded text-[#C2410C] focus:ring-0"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">30 Days Prior</div>
                  <div className="text-[10px] text-slate-400">Technician dispatch scheduling</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-[#FFF0E6] cursor-pointer">
                <input
                  type="checkbox"
                  checked={alert7Days}
                  onChange={(e) => setAlert7Days(e.target.checked)}
                  className="rounded text-[#C2410C] focus:ring-0"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">7 Days Prior</div>
                  <div className="text-[10px] text-slate-400">Final urgent reminder</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={sendingTest}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all disabled:opacity-50"
            >
              {sendingTest ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 text-[#C2410C]" />
              )}
              <span>Send test email</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#C2410C] hover:bg-[#1C1917] text-white text-xs font-bold shadow-sm transition-all"
            >
              {saving ? 'Saving...' : 'Save alert settings'}
            </button>
          </div>
        </form>

        {testSentSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Test alert email queued for dispatch to {recipientEmails.split(',')[0]}.</span>
          </div>
        )}
      </div>

      {/* DNS Configuration Guidance Box */}
      <div className="p-5 rounded-2xl bg-[#FFF0E6]/70 border border-[#FED7AA] space-y-3 text-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-[#1C1917]">
          <Info className="w-4 h-4 text-[#C2410C]" />
          <span>Domain Verification &amp; Transactional Email (DNS Records)</span>
        </div>
        <p className="text-slate-600 leading-relaxed">
          Alerts should be sent from your official domain (e.g. <span className="font-mono">alerts@youragency.com</span>) rather than personal Gmail to guarantee inbox delivery and avoid spam filters. Add the following standard DNS records in your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-white border border-blue-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">1. SPF Record</span>
            <span className="font-mono text-[11px] font-bold text-slate-800 block mt-1">TXT @</span>
            <code className="text-[10px] text-slate-500 break-all block mt-0.5">
              v=spf1 include:mailgun.org include:sendgrid.net ~all
            </code>
          </div>

          <div className="p-3 rounded-xl bg-white border border-blue-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">2. DKIM Record</span>
            <span className="font-mono text-[11px] font-bold text-slate-800 block mt-1">CNAME k1._domainkey</span>
            <code className="text-[10px] text-slate-500 break-all block mt-0.5">
              dkim.mcsv.net or provider key
            </code>
          </div>

          <div className="p-3 rounded-xl bg-white border border-blue-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">3. DMARC Policy</span>
            <span className="font-mono text-[11px] font-bold text-slate-800 block mt-1">TXT _dmarc</span>
            <code className="text-[10px] text-slate-500 break-all block mt-0.5">
              v=DMARC1; p=none; sp=none;
            </code>
          </div>
        </div>
      </div>

      {/* Log of Emails Sent */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Recent Alert Dispatches</span>
          </h4>
          <span className="text-xs text-slate-400 font-mono">{emailLogs.length} logged</span>
        </div>

        <div className="divide-y divide-slate-100">
          {emailLogs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <div className="font-semibold text-slate-800 truncate">
                  {log.subject}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Sent to {log.recipient} &bull; {formatStandardDate(log.date)}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 shrink-0">
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
