'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Mail,
  Copy,
  Check,
  ShieldCheck,
  UserCheck,
  Ban,
  RotateCcw,
  ExternalLink,
  Building2,
  FileCheck2,
  AlertCircle,
  Loader2,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface ClientPortalAdminPanelProps {
  clients?: any[];
  buildings?: any[];
}

export function ClientPortalAdminPanel({ clients = [], buildings = [] }: ClientPortalAdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'USERS' | 'RECEIPTS'>('USERS');
  const [portalUsers, setPortalUsers] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);

  // Form states
  const [selectedClientId, setSelectedClientId] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/portal-users');
      if (res.ok) {
        const data = await res.json();
        setPortalUsers(data.portalUsers || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReceipts = async () => {
    try {
      const res = await fetch('/api/admin/portal-receipts');
      if (res.ok) {
        const data = await res.json();
        setReceipts(data.receipts || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchUsers(), fetchReceipts()]).finally(() => setLoading(false));
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !contactName.trim() || !contactEmail.trim()) {
      toast.error('Please fill all invite fields');
      return;
    }

    setInviting(true);
    setGeneratedInviteLink(null);

    try {
      const res = await fetch('/api/admin/portal-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientOrgId: selectedClientId,
          name: contactName.trim(),
          email: contactEmail.trim().toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to invite client user');
      }

      if (data.mode === 'EMAIL') {
        toast.success(data.message || 'Invitation email dispatched successfully');
      } else {
        setGeneratedInviteLink(data.inviteLink);
        toast.info('Magic invite link created — click Copy below to share with your client.');
      }

      setContactName('');
      setContactEmail('');
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedInviteLink) return;
    navigator.clipboard.writeText(generatedInviteLink);
    setCopiedLink(true);
    toast.success('Magic invite link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleToggleRevoke = async (portalUserId: string, isCurrentlyRevoked: boolean) => {
    const action = isCurrentlyRevoked ? 'RESTORE' : 'REVOKE';
    try {
      const res = await fetch('/api/admin/portal-users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portalUserId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user access');

      toast.success(action === 'REVOKE' ? 'Client portal access revoked' : 'Client portal access restored');
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleRegenerateLink = async (user: any) => {
    try {
      setSelectedClientId(user.clientOrgId);
      setContactName(user.name);
      setContactEmail(user.email);
      setInviting(true);
      const res = await fetch('/api/admin/portal-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientOrgId: user.clientOrgId,
          name: user.name,
          email: user.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create link');
      if (data.inviteLink) {
        setGeneratedInviteLink(data.inviteLink);
        navigator.clipboard.writeText(data.inviteLink);
        toast.success(`Fresh access link for ${user.name} copied to clipboard!`);
      } else {
        toast.success(`Invite email sent to ${user.email}`);
      }
      await fetchUsers();
    } catch (e: any) {
      toast.error(e.message || 'Failed to create link');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div data-testid="client-portal-admin-panel" className="space-y-6">
      {/* Subtab Bar */}
      <div className="flex items-center justify-between border-b border-[#F0E4D8] pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="portal-tab-users"
            onClick={() => setActiveTab('USERS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'USERS'
                ? 'bg-[#EA580C] text-white shadow-sm shadow-orange-500/20'
                : 'bg-white text-[#44403C] hover:bg-orange-50/50 border border-[#F0E4D8]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Client Users &amp; Invites ({portalUsers.length})</span>
          </button>

          <button
            type="button"
            data-testid="portal-tab-receipts"
            onClick={() => setActiveTab('RECEIPTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'RECEIPTS'
                ? 'bg-[#EA580C] text-white shadow-sm shadow-orange-500/20'
                : 'bg-white text-[#44403C] hover:bg-orange-50/50 border border-[#F0E4D8]'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Delivery &amp; Acknowledgement Receipts ({receipts.length})</span>
          </button>
        </div>

        <span className="text-xs text-[#78716C]">
          Client Portal URL:{' '}
          <a
            href="/portal"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#EA580C] font-semibold hover:underline inline-flex items-center gap-1"
          >
            /portal <ExternalLink className="w-3 h-3" />
          </a>
        </span>
      </div>

      {/* TAB 1: USERS & INVITES */}
      {activeTab === 'USERS' && (
        <div className="space-y-6">
          {/* Invite Client Form */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#F0E4D8] shadow-sm space-y-4">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#EA580C]" />
                Invite Client Contact to Portal
              </h3>
              <p className="text-xs text-[#44403C]">
                Grant building owners, society secretariats, and facility managers access to view certified inspection history and sign report receipts.
              </p>
            </div>

            <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#1C1917] uppercase tracking-wider mb-1">
                  Client / Society *
                </label>
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full p-2.5 bg-[#FFF8F2] border border-[#E7D6C7] rounded-xl text-xs text-[#1C1917] font-medium focus:ring-2 focus:ring-[#EA580C] outline-none"
                >
                  <option value="">Select Client Society...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.contactPerson ? `(${c.contactPerson})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1C1917] uppercase tracking-wider mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full p-2.5 bg-[#FFF8F2] border border-[#E7D6C7] rounded-xl text-xs text-[#1C1917] font-medium focus:ring-2 focus:ring-[#EA580C] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1C1917] uppercase tracking-wider mb-1">
                  Client Email Address *
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="manager@society.in"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full p-2.5 bg-[#FFF8F2] border border-[#E7D6C7] rounded-xl text-xs text-[#1C1917] font-medium focus:ring-2 focus:ring-[#EA580C] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={inviting}
                    data-testid="portal-invite-submit-btn"
                    className="px-4 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs rounded-xl shadow-sm whitespace-nowrap transition-colors flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {inviting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Mail className="w-3.5 h-3.5" />
                    )}
                    <span>Invite</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Generated Magic Link Card (Fallback B2) */}
            {generatedInviteLink && (
              <div
                data-testid="portal-copy-link-banner"
                className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-2 animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#9A3412] flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-[#EA580C]" /> Magic Invite Link Ready (Valid for 30 minutes)
                  </span>
                  <span className="text-[10px] text-[#78716C]">Copy &amp; send via WhatsApp or email</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedInviteLink}
                    className="flex-1 p-2 bg-white border border-[#FED7AA] rounded-lg text-xs font-mono text-[#1C1917] select-all"
                  />
                  <button
                    type="button"
                    data-testid="copy-portal-invite-link-btn"
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy invite link'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Portal Users Table */}
          <div className="bg-white rounded-2xl border border-[#F0E4D8] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#F0E4D8] bg-[#FFF8F2]/60 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                Active Client Portal Users ({portalUsers.length})
              </h4>
            </div>

            {portalUsers.length === 0 ? (
              <div className="p-8 text-center space-y-2 text-[#78716C]">
                <Users className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs">No client users invited yet. Use the invite form above to add your first client contact.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FFF8F2] border-b border-[#F0E4D8] text-[#44403C] font-bold text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-4">Client Society</th>
                      <th className="py-2.5 px-4">Contact Name</th>
                      <th className="py-2.5 px-4">Email</th>
                      <th className="py-2.5 px-4">Invited On</th>
                      <th className="py-2.5 px-4">Last Login</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E4D8]">
                    {portalUsers.map((u) => {
                      const isRevoked = Boolean(u.revokedAt);
                      return (
                        <tr key={u.id} className="hover:bg-orange-50/20 transition-colors">
                          <td className="py-2.5 px-4 font-semibold text-[#1C1917]">
                            {u.client?.name || '—'}
                          </td>
                          <td className="py-2.5 px-4 text-[#1C1917]">{u.name}</td>
                          <td className="py-2.5 px-4 font-mono text-[#44403C]">{u.email}</td>
                          <td className="py-2.5 px-4 text-[#78716C]">
                            {new Date(u.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-2.5 px-4 text-[#78716C]">
                            {u.lastLoginAt
                              ? new Date(u.lastLoginAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Never logged in'}
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isRevoked
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isRevoked ? 'REVOKED' : 'ACTIVE'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleRegenerateLink(u)}
                                disabled={isRevoked}
                                className="px-2 py-1 rounded-lg text-xs font-semibold text-[#EA580C] hover:bg-orange-50 border border-orange-200 transition-colors disabled:opacity-40 flex items-center gap-1 shadow-2xs"
                                title="Generate and copy fresh magic link"
                              >
                                <Copy className="w-3 h-3" />
                                <span className="hidden sm:inline">Copy Link</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleRevoke(u.id, isRevoked)}
                                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                                  isRevoked
                                    ? 'text-[#059669] hover:bg-emerald-50'
                                    : 'text-[#DC2626] hover:bg-red-50'
                                }`}
                              >
                                {isRevoked ? (
                                  <>
                                    <RotateCcw className="w-3 h-3" /> Restore Access
                                  </>
                                ) : (
                                  <>
                                    <Ban className="w-3 h-3" /> Revoke
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RECEIPTS */}
      {activeTab === 'RECEIPTS' && (
        <div className="bg-white rounded-2xl border border-[#F0E4D8] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#F0E4D8] bg-[#FFF8F2]/60 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                Statutory Form-B Digital Delivery &amp; Acknowledgement Receipts
              </h4>
              <p className="text-[11px] text-[#78716C]">
                Proof that client representatives received and reviewed on-site compliance certificates.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-[#065F46] border border-emerald-200 text-xs font-bold rounded-lg">
              {receipts.length} Signed Receipts
            </span>
          </div>

          {receipts.length === 0 ? (
            <div className="p-8 text-center space-y-2 text-[#78716C]">
              <FileCheck2 className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs">
                No delivery receipts acknowledged yet. When clients click &quot;Acknowledge Receipt&quot; in their portal, timestamped confirmation records will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FFF8F2] border-b border-[#F0E4D8] text-[#44403C] font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-4">Report Reference</th>
                    <th className="py-2.5 px-4">Building / Society</th>
                    <th className="py-2.5 px-4">Acknowledged By</th>
                    <th className="py-2.5 px-4">Contact Email</th>
                    <th className="py-2.5 px-4">Date &amp; Time</th>
                    <th className="py-2.5 px-4 text-right">Certificate Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E4D8]">
                  {receipts.map((r) => (
                    <tr key={r.id} className="hover:bg-orange-50/20 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-semibold text-[#1C1917]">
                        {r.reportRef}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-[#1C1917]">{r.building?.name}</span>
                        {r.building?.city && (
                          <span className="text-[#78716C] block text-[10px]">{r.building.city}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-[#1C1917]">
                        {r.portalUser?.name || 'Client Representative'}
                        <span className="text-[#78716C] block text-[10px]">
                          {r.portalUser?.client?.name}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[#44403C]">
                        {r.portalUser?.email || '—'}
                      </td>
                      <td className="py-2.5 px-4 text-[#78716C] whitespace-nowrap">
                        {new Date(r.acknowledgedAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <a
                          href={`/report/${r.buildingId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-white hover:bg-orange-50 border border-[#FED7AA] text-[#EA580C] text-[11px] font-bold rounded-lg inline-flex items-center gap-1 transition-colors shadow-2xs"
                        >
                          <span>View Form-B</span>
                          <ExternalLink className="w-3 h-3 text-[#78716C]" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
