'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Search,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Building,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface InvestorLead {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  investorType: string;
  organization?: string | null;
  websiteLinkedin?: string | null;
  investmentExperience?: string | null;
  investmentRange?: string | null;
  investmentTimeline?: string | null;
  interestMessage?: string | null;
  contributionMessage?: string | null;
  consent: boolean;
  status: string;
  createdAt: string;
}

const STATUS_CONFIGS: { [key: string]: { label: string; color: string; bg: string; border: string } } = {
  NEW: { label: 'New Lead', color: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  CONTACTED: { label: 'Contacted', color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  IN_DISCUSSION: { label: 'In Discussion', color: 'text-purple-300', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  QUALIFIED: { label: 'Qualified', color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  CLOSED: { label: 'Closed / Committed', color: 'text-green-300', bg: 'bg-green-500/20', border: 'border-green-500/40' },
  NOT_SUITABLE: { label: 'Not Suitable', color: 'text-slate-400', bg: 'bg-slate-800/40', border: 'border-slate-700/50' },
};

export function InvestorLeadsView() {
  const [investors, setInvestors] = useState<InvestorLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchInvestors = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/investors?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load investor leads.');
      }
      const data = await res.json();
      setInvestors(data.investors || []);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error fetching records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvestors();
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/investors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        throw new Error('Status update failed');
      }
      const data = await res.json();
      setInvestors((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } catch (err: any) {
      console.error(err);
      alert('Could not update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">Investor Expressions of Interest</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
              {investors.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Expressions of interest submitted via the public /invest fundraising page.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchInvestors}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, firm, email..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-[#0077B6]"
          />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {['ALL', 'NEW', 'CONTACTED', 'IN_DISCUSSION', 'QUALIFIED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Listings */}
      {loading && investors.length === 0 ? (
        <div className="py-16 text-center text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0077B6]" />
          <p className="text-xs">Loading investor submissions...</p>
        </div>
      ) : investors.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
          <TrendingUp className="w-8 h-8 mx-auto text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-300">No investor expressions of interest found</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Submissions made through <span className="text-cyan-400 font-mono">/invest</span> will appear here automatically with their investment thesis and ticket range.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {investors.map((lead) => {
            const statusConfig = STATUS_CONFIGS[lead.status] || STATUS_CONFIGS.NEW;
            const submittedDate = new Date(lead.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={lead.id}
                className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
              >
                {/* Top row: Name, Type, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0077B6] to-[#023E8A] text-white flex items-center justify-center font-bold text-sm">
                      {lead.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{lead.fullName}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                          {lead.investorType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {lead.organization ? `${lead.organization} • ` : ''}
                        {lead.city ? `${lead.city}, ` : ''}{lead.country || 'India'}
                      </p>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                      {statusConfig.label}
                    </div>

                    <select
                      value={lead.status}
                      disabled={updatingId === lead.id}
                      onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                      className="px-2 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none focus:border-[#0077B6]"
                    >
                      <option value="NEW">Set NEW</option>
                      <option value="CONTACTED">Set CONTACTED</option>
                      <option value="IN_DISCUSSION">Set IN DISCUSSION</option>
                      <option value="QUALIFIED">Set QUALIFIED</option>
                      <option value="CLOSED">Set CLOSED</option>
                      <option value="NOT_SUITABLE">Set NOT SUITABLE</option>
                    </select>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Contact Info</span>
                    <div className="mt-1 space-y-1">
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 truncate"
                      >
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </a>
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-slate-300 hover:text-white flex items-center gap-1.5"
                        >
                          <Phone className="w-3 h-3 shrink-0 text-slate-500" />
                          <span>{lead.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Investment Range</span>
                    <p className="mt-1 font-bold text-amber-300 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 shrink-0" />
                      <span>{lead.investmentRange || 'Flexible'}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Timeline: <strong className="text-white">{lead.investmentTimeline || 'Flexible'}</strong>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Experience Level</span>
                    <p className="mt-1 font-medium text-slate-200">
                      {lead.investmentExperience || 'Not specified'}
                    </p>
                    {lead.websiteLinkedin && (
                      <a
                        href={lead.websiteLinkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-cyan-300 hover:text-white flex items-center gap-1 text-[11px]"
                      >
                        <span>Profile Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Submission Date</span>
                    <p className="mt-1 text-slate-300 font-mono text-[11px] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{submittedDate}</span>
                    </p>
                  </div>
                </div>

                {/* Messages / Value-Add */}
                {(lead.interestMessage || lead.contributionMessage) && (
                  <div className="pt-2 border-t border-slate-900 space-y-2 text-xs">
                    {lead.interestMessage && (
                      <div>
                        <span className="font-bold text-slate-400 block text-[11px]">Investment Thesis / Interest:</span>
                        <p className="text-slate-300 mt-0.5 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/50">
                          {lead.interestMessage}
                        </p>
                      </div>
                    )}
                    {lead.contributionMessage && (
                      <div>
                        <span className="font-bold text-slate-400 block text-[11px]">Value Add Beyond Capital:</span>
                        <p className="text-slate-300 mt-0.5 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/50">
                          {lead.contributionMessage}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
