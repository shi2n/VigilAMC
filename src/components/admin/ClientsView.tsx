'use client';

import React from 'react';
import { UserCheck, Plus, Edit, Trash2, FileSpreadsheet } from 'lucide-react';

interface ClientsViewProps {
  clientsList: any[];
  onAddClient: () => void;
  onEditClient: (client: any) => void;
  onDeleteClient: (id: string, name: string) => void;
  onOpenExport: () => void;
  onOpenImport?: () => void;
}

export function ClientsView({
  clientsList,
  onAddClient,
  onEditClient,
  onDeleteClient,
  onOpenExport,
  onOpenImport,
}: ClientsViewProps) {
  return (
    <div className="rounded-2xl bg-white border border-[#DCE7F2] shadow-sm p-5 sm:p-6 space-y-6 text-slate-800 dark:bg-slate-900/90 dark:border-slate-800 dark:shadow-xl dark:text-slate-100">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE7F2] pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF6FF] border border-[#007DB8]/30 flex items-center justify-center text-[#007DB8] dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#023E8A] dark:text-white tracking-tight">
              Client Societies &amp; Corporate Accounts
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF6FF] text-[#007DB8] border border-[#007DB8]/30 text-xs font-semibold dark:bg-slate-800 dark:text-slate-300">
              {clientsList.length} Active Accounts
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registered customer societies, management contacts, linked buildings, and asset compliance metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EAF6FF] hover:bg-[#D5EEFF] text-[#007DB8] border border-[#007DB8]/30 text-xs font-bold transition-all shadow-sm dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30"
              title="Import Clients from Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Clients</span>
            </button>
          )}

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-300 text-xs font-bold transition-all shadow-sm dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 dark:text-emerald-300 dark:border-emerald-500/30"
            title="Export Clients to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={onAddClient}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#007DB8] to-[#073F8F] hover:from-[#006494] hover:to-[#011F48] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Client</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {clientsList.length === 0 ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <UserCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No client accounts registered</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Click &quot;Add New Client&quot; above to register your first housing society or corporate commercial client.
          </p>
          <button
            onClick={onAddClient}
            className="px-4 py-2 rounded-xl bg-[#007DB8] hover:bg-[#073F8F] text-white font-bold text-xs shadow"
          >
            + Register First Client
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#DCE7F2] overflow-x-auto shadow-sm  dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-[#DCE7F2] dark:bg-slate-900/90 dark:text-slate-400 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Client / Society Name</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-center">Buildings</th>
                <th className="py-3 px-4 text-center">Total Assets</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {clientsList.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{c.name}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{c.contactPerson || '—'}</td>
                  <td className="py-3 px-4 text-[#007DB8] dark:text-amber-400 font-mono font-medium">{c.phone || '—'}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{c.email || '—'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px] dark:bg-slate-800 dark:text-white">
                      {c.buildingCount ?? c.buildings?.length ?? 0}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-[#EAF6FF] text-[#007DB8] font-semibold text-[11px] dark:bg-slate-800/80 dark:text-amber-300">
                      {c.totalEquipments ?? 0} units
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => onEditClient(c)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white"
                      title="Edit Client"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteClient(c.id, c.name)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400 dark:border-red-500/30"
                      title="Delete Client"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
