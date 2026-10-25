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
    <div className="glass-panel-dense rounded-2xl shadow-sm p-5 sm:p-6 space-y-6 text-slate-800">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FED7AA] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFF0E6] border border-[#C2410C]/30 flex items-center justify-center text-[#C2410C]">
              <UserCheck className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#1C1917] tracking-tight">
              Client Societies &amp; Corporate Accounts
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#C2410C] border border-[#C2410C]/30 text-xs font-semibold">
              {clientsList.length} Active Accounts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registered customer societies, management contacts, linked buildings, and asset compliance metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
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
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-300 text-xs font-bold transition-all shadow-sm"
            title="Export Clients to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={onAddClient}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C2410C] to-[#1C1917] hover:from-[#C2410C] hover:to-[#9A3412] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Client</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {clientsList.length === 0 ? (
        <div className="py-16 text-center text-slate-500 space-y-3">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No client accounts registered</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click &quot;Add New Client&quot; above to register your first housing society or corporate commercial client.
          </p>
          <button
            onClick={onAddClient}
            className="px-4 py-2 rounded-xl bg-[#C2410C] hover:bg-[#1C1917] text-white font-bold text-xs shadow"
          >
            + Register First Client
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#FED7AA] overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-[#FED7AA]">
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
            <tbody className="divide-y divide-slate-100">
              {clientsList.map((c) => (
                <tr key={c.id} className="hover:bg-[#FFF0E6]/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3 px-4 text-slate-600">{c.contactPerson || '—'}</td>
                  <td className="py-3 px-4 text-[#C2410C] font-mono font-medium">{c.phone || '—'}</td>
                  <td className="py-3 px-4 text-slate-500">{c.email || '—'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                      {c.buildingCount ?? c.buildings?.length ?? 0}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-[#FFF0E6] text-[#C2410C] font-semibold text-[11px]">
                      {c.totalEquipments ?? 0} units
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => onEditClient(c)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                      title="Edit Client"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteClient(c.id, c.name)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
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
