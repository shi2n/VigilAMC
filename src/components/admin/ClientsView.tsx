'use client';

import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Plus,
  Edit,
  Trash2,
  FileSpreadsheet,
  Building2,
  Layers,
  Search,
  Calendar,
  ArrowUpDown,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import type { AdminDictionary } from '@/lib/i18n/admin';

interface ClientsViewProps {
  clientsList: any[];
  onAddClient: () => void;
  onEditClient: (client: any) => void;
  onDeleteClient: (id: string, name: string) => void;
  onOpenExport: () => void;
  onOpenImport?: () => void;
  onSelectClientSites?: (clientId: string, clientName: string) => void;
  onOpenClientPortal?: (clientId?: string) => void;
  t?: AdminDictionary;
}

export function ClientsView({
  clientsList,
  onAddClient,
  onEditClient,
  onDeleteClient,
  onOpenExport,
  onOpenImport,
  onSelectClientSites,
  onOpenClientPortal,
  t,
}: ClientsViewProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'COMPLIANCE_ASC' | 'COMPLIANCE_DESC' | 'EXPIRING_DESC' | 'NAME_ASC'>('COMPLIANCE_ASC');

  const filteredAndSortedClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (clientsList || []).filter((c) => {
      if (!q) return true;
      return (
        c.name?.toLowerCase().includes(q) ||
        c.contactPerson?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      const compA = a.compliancePercent ?? 100;
      const compB = b.compliancePercent ?? 100;
      const expA = a.expiring30dCount ?? 0;
      const expB = b.expiring30dCount ?? 0;

      if (sortBy === 'COMPLIANCE_ASC') return compA - compB;
      if (sortBy === 'COMPLIANCE_DESC') return compB - compA;
      if (sortBy === 'EXPIRING_DESC') return expB - expA;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });
  }, [clientsList, search, sortBy]);

  return (
    <div
      data-testid="module-e-client-portfolio"
      className="glass-panel-dense rounded-2xl shadow-sm p-5 sm:p-6 space-y-6 text-[#1C1917]"
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FED7AA] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFF0E6] border border-[#C2410C]/30 flex items-center justify-center text-[#C2410C]">
              <UserCheck className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#1C1917] tracking-tight">
              {t?.portfolioTitle || 'Client Portfolio Compliance Rollup'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#C2410C] border border-[#C2410C]/30 text-xs font-semibold">
              {clientsList.length} Active Accounts
            </span>
          </div>
          <p className="text-xs text-[#44403C] mt-1">
            {t?.portfolioSubtitle ||
              'Executive multi-site rollup of compliance rate, 30-day expiry exposure, and inspection coverage per client.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenClientPortal && (
            <button
              type="button"
              onClick={() => onOpenClientPortal()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#C2410C] border border-[#FED7AA] text-xs font-bold transition-all shadow-xs"
              title="Manage Client Portal Users & Magic Links"
            >
              <ShieldCheck className="w-4 h-4 text-[#C2410C]" />
              <span>Client Portal Access</span>
            </button>
          )}

          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF0E6] hover:bg-[#FED7AA] text-[#C2410C] border border-[#C2410C]/30 text-xs font-bold transition-all shadow-sm"
              title="Import Clients from Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Clients</span>
            </button>
          )}

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-[#059669] border border-emerald-300 text-xs font-bold transition-all shadow-sm"
            title="Export Clients to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={onAddClient}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add client</span>
          </button>
        </div>
      </div>

      {/* Portfolio Search & Sort Controls (Module E2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#FED7AA]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#44403C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            data-testid="portfolio-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client organization, contact person, or phone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] text-xs text-[#1C1917] placeholder-[#44403C]/60 focus:outline-none focus:border-[#C2410C]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#C2410C]" />
          <span className="font-bold text-[#44403C]">Sort by:</span>
          <select
            data-testid="portfolio-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-white border border-[#FED7AA] text-xs font-bold text-[#1C1917] focus:outline-none focus:border-[#C2410C]"
          >
            <option value="COMPLIANCE_ASC">Compliance % (Lowest First)</option>
            <option value="COMPLIANCE_DESC">Compliance % (Highest First)</option>
            <option value="EXPIRING_DESC">Expiring ≤30d Count (Highest First)</option>
            <option value="NAME_ASC">Client Name (A → Z)</option>
          </select>
        </div>
      </div>

      {/* Portfolio Rollup Card Grid (Module E1) */}
      {filteredAndSortedClients.length === 0 ? (
        <div className="py-16 text-center text-[#44403C] space-y-3">
          <UserCheck className="w-12 h-12 text-[#C2410C]/40 mx-auto" />
          <h3 className="text-sm font-bold text-[#1C1917]">No client accounts match your filter</h3>
          <p className="text-xs text-[#44403C] max-w-sm mx-auto">
            Click &quot;Add New Client&quot; above to register a housing society or commercial corporate account.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="portfolio-card-grid">
          {filteredAndSortedClients.map((c) => {
            const siteCount = c.buildingCount ?? c.siteCount ?? c.buildings?.length ?? 0;
            const assetCount = c.totalEquipments ?? c.assetCount ?? 0;
            const compPct = c.compliancePercent ?? 100;
            const expiringCount = c.expiring30dCount ?? 0;
            const okCount = c.okCount ?? assetCount;
            const dueSoonCount = c.dueSoonCount ?? 0;
            const overdueCount = c.overdueCount ?? 0;

            return (
              <div
                key={c.id}
                data-testid={`portfolio-card-${c.id}`}
                onClick={() => onSelectClientSites && onSelectClientSites(c.id, c.name)}
                className="bg-white border border-[#FED7AA] hover:border-[#C2410C] rounded-2xl p-5 space-y-4 shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top row: Client Name + Compliance % Pill */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#1C1917] group-hover:text-[#C2410C] transition-colors">
                        {c.name}
                      </h3>
                      <p className="text-[11px] text-[#44403C]">
                        {c.contactPerson || 'Primary Contact'} &bull;{' '}
                        <span className="font-mono text-[#C2410C] font-semibold">
                          {c.phone || '—'}
                        </span>
                      </p>
                    </div>

                    <div
                      className={`px-2.5 py-1 rounded-xl border text-right shrink-0 ${
                        compPct >= 90
                          ? 'bg-emerald-50 text-[#059669] border-emerald-200'
                          : compPct >= 70
                          ? 'bg-amber-50 text-[#D97706] border-amber-300'
                          : 'bg-rose-50 text-[#DC2626] border-rose-200'
                      }`}
                    >
                      <div className="text-[9px] font-bold uppercase tracking-wider">Compliance</div>
                      <div className="text-base font-black tabular-nums">{compPct}%</div>
                    </div>
                  </div>

                  {/* Site count, Asset count & Expiring <=30d chip */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF8F2] border border-[#FED7AA] font-bold text-[#1C1917]">
                      <Building2 className="w-3.5 h-3.5 text-[#C2410C]" />
                      {siteCount} {siteCount === 1 ? 'Site' : 'Sites'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF8F2] border border-[#FED7AA] font-bold text-[#1C1917]">
                      <Layers className="w-3.5 h-3.5 text-[#C2410C]" />
                      {assetCount} {assetCount === 1 ? 'Asset' : 'Assets'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold text-[11px] ${
                        expiringCount > 0
                          ? 'bg-amber-50 text-[#D97706] border-amber-300'
                          : 'bg-emerald-50 text-[#059669] border-emerald-200'
                      }`}
                    >
                      {expiringCount} expiring &le;30d
                    </span>
                  </div>

                  {/* Mini Status Strip: OK / DUE SOON / EXPIRED */}
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#FED7AA]/60 text-center text-[11px]">
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[#059669]">
                      <div className="text-[9px] font-bold uppercase">OK</div>
                      <div className="text-sm font-black tabular-nums">{okCount}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-300 text-[#D97706]">
                      <div className="text-[9px] font-bold uppercase">DUE SOON</div>
                      <div className="text-sm font-black tabular-nums">{dueSoonCount}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-[#DC2626]">
                      <div className="text-[9px] font-bold uppercase">EXPIRED</div>
                      <div className="text-sm font-black tabular-nums">{overdueCount}</div>
                    </div>
                  </div>
                </div>

                {/* Bottom row: Last Inspection Date + Quick Actions */}
                <div className="pt-3 border-t border-[#FED7AA]/60 flex items-center justify-between text-[11px] text-[#44403C]">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#C2410C]" />
                    <span>
                      Last inspection:{' '}
                      <strong className="text-[#1C1917]">
                        {c.lastInspectionDate && !isNaN(new Date(c.lastInspectionDate).getTime())
                          ? new Date(c.lastInspectionDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Not inspected'}
                      </strong>
                    </span>
                  </span>

                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {onOpenClientPortal && (
                      <button
                        type="button"
                        onClick={() => onOpenClientPortal(c.id)}
                        className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#C2410C] border border-[#FED7AA]"
                        title={`Client Portal Access & Invite for ${c.name}`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onEditClient(c)}
                      className="p-1.5 rounded-lg bg-[#FFF8F2] hover:bg-[#FFF0E6] text-[#44403C] hover:text-[#1C1917] border border-[#FED7AA]"
                      title="Edit Client"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteClient(c.id, c.name)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#DC2626] border border-rose-200"
                      title="Delete Client"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="inline-flex items-center gap-0.5 text-[#C2410C] font-bold pl-1">
                      <span>Sites</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
