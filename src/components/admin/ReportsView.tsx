'use client';

import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Building2,
  Users,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Flame,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

interface ReportsViewProps {
  buildings: any[];
  summary: any;
  company: any;
}

export function ReportsView({ buildings = [], summary, company }: ReportsViewProps) {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(
    buildings.length > 0 ? buildings[0].id : ''
  );

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#DCE7F2] rounded-2xl p-5 space-y-2 shadow-sm dark:bg-slate-900/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
            <span>Form-B Certifications</span>
            <FileText className="w-4 h-4 text-[#007DB8] dark:text-amber-400" />
          </div>
          <div className="text-2xl font-black text-[#023E8A] dark:text-white">{buildings.length} Facilities</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Compliant half-yearly Form-B certificates structured under NBC 2016 and applicable state fire safety rules.
          </p>
        </div>

        <div className="bg-white border border-[#DCE7F2] rounded-2xl p-5 space-y-2 shadow-sm dark:bg-slate-900/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
            <span>Asset Inventories</span>
            <Printer className="w-4 h-4 text-[#007DB8] dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{summary?.totalEquipments || 0} Assets</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Equipment schedule with serial numbers, location notes, and photos.
          </p>
        </div>

        <div className="bg-white border border-[#DCE7F2] rounded-2xl p-5 space-y-2 shadow-sm dark:bg-slate-900/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
            <span>Overall Portfolio Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
            {summary?.totalBuildings > 0
              ? Math.round((summary.compliantBuildings / summary.totalBuildings) * 100)
              : 100}
            %
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {summary?.compliantBuildings || 0} of {summary?.totalBuildings || 0} sites currently verified.
          </p>
        </div>
      </div>

      {/* Form-B Generator by Facility */}
      <div className="bg-white border border-[#DCE7F2] rounded-2xl p-6 shadow-sm space-y-5 dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE7F2] dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-[#023E8A] dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#007DB8] dark:text-amber-400" />
              <span>Compliance report (Form-B format)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Formats and intervals vary by state. Confirm with a qualified fire compliance professional.
            </p>
          </div>
        </div>

        {buildings.length === 0 ? (
          <p className="text-center py-8 text-slate-400 text-xs">
            No facilities registered yet. Add buildings in the Sites tab to generate reports.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="max-w-md space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Facility / Tower:</label>
              <select
                value={selectedBuildingId}
                onChange={(e) => setSelectedBuildingId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCE7F2] text-xs text-slate-900 focus:outline-none focus:border-[#007DB8] shadow-sm dark:bg-slate-950 dark:border-slate-800 dark:text-white"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.totalEquipments || b.equipments?.length || 0} equipment units) &bull; {b.client?.name || 'Client'}
                  </option>
                ))}
              </select>
            </div>

            {selectedBuilding && (() => {
              const equipCount = selectedBuilding.totalEquipments || selectedBuilding.equipments?.length || 0;
              const hasZeroEquip = equipCount === 0;

              return (
                <div className="p-4 rounded-xl bg-slate-50 border border-[#DCE7F2] flex flex-col sm:flex-row sm:items-center justify-between gap-4 dark:bg-slate-950 dark:border-slate-800">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedBuilding.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedBuilding.address}</p>
                    <p className="text-[11px] text-slate-500">
                      Cycle: <strong className="text-slate-700 dark:text-slate-300">{selectedBuilding.complianceCycle || 'Quarterly'}</strong> &bull; Total Assets:{' '}
                      <strong className="text-slate-700 dark:text-slate-300">{equipCount}</strong>
                    </p>
                    {hasZeroEquip && (
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400 pt-1">
                        ⚠ Add equipment to this building before generating a report.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {hasZeroEquip ? (
                      <button
                        disabled
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-slate-200 text-slate-400 text-xs cursor-not-allowed dark:bg-slate-800 dark:text-slate-500"
                        title="Add equipment to this building first"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Form-B Disabled (0 Equipment)</span>
                      </button>
                    ) : (
                      <Link
                        href={`/report/${selectedBuilding.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#007DB8] to-[#073F8F] hover:from-[#006494] hover:to-[#011F48] text-white text-xs transition-colors shadow-md active:scale-95"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Download Form-B Report</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
