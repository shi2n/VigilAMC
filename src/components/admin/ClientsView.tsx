'use client';

import React from 'react';
import { UserCheck, Plus, Edit, Trash2, FileSpreadsheet } from 'lucide-react';

interface ClientsViewProps {
  clientsList: any[];
  onAddClient: () => void;
  onEditClient: (client: any) => void;
  onDeleteClient: (id: string, name: string) => void;
  onOpenExport: () => void;
}

export function ClientsView({
  clientsList,
  onAddClient,
  onEditClient,
  onDeleteClient,
  onOpenExport,
}: ClientsViewProps) {
  return (
    <div className="tactile-card rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl p-5 sm:p-6 space-y-6 text-slate-100">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Client Societies &amp; Corporate Accounts
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
              {clientsList.length} Active Accounts
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registered customer societies, management contacts, linked buildings, and asset compliance metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all shadow-sm"
            title="Export Clients to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={onAddClient}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Client</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {clientsList.length === 0 ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <UserCheck className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No client accounts registered</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click &quot;Add New Client&quot; above to register your first housing society or corporate commercial client.
          </p>
          <button
            onClick={onAddClient}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs"
          >
            + Register First Client
          </button>
        </div>
      ) : (
        <div className="bg-slate-950/80 rounded-xl border border-slate-800 overflow-x-auto shadow">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
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
            <tbody className="divide-y divide-slate-800/60">
              {clientsList.map((c) => (
                <tr key={c.id} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                  <td className="py-3 px-4 text-slate-300">{c.contactPerson || '—'}</td>
                  <td className="py-3 px-4 text-amber-400 font-mono">{c.phone || '—'}</td>
                  <td className="py-3 px-4 text-slate-400">{c.email || '—'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-white font-bold text-[11px]">
                      {c.buildingCount ?? c.buildings?.length ?? 0}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-amber-300 font-semibold text-[11px]">
                      {c.totalEquipments ?? 0} units
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => onEditClient(c)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Edit Client"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteClient(c.id, c.name)}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 transition-colors"
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
