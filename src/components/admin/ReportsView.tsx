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
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Form-B Certifications</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{buildings.length} Facilities</div>
          <p className="text-[11px] text-slate-400">
            Compliant half-yearly Form-B certificates under Delhi Fire Safety Rules &amp; NBC 2016.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Asset QR Inventories</span>
            <Printer className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{summary?.totalEquipments || 0} Assets</div>
          <p className="text-[11px] text-slate-400">
            Printable weatherproof serialized tags with QR verification codes.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Overall Fleet Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {summary?.totalBuildings > 0
              ? Math.round((summary.compliantBuildings / summary.totalBuildings) * 100)
              : 100}
            %
          </div>
          <p className="text-[11px] text-slate-400">
            {summary?.compliantBuildings || 0} of {summary?.totalBuildings || 0} sites currently verified.
          </p>
        </div>
      </div>

      {/* Form-B Generator by Facility */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>Generate Form-B Statutory Compliance Report</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any registered facility to generate and print official client-ready Form-B verification reports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/assets/print-qr"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print All QR Tags</span>
            </Link>
          </div>
        </div>

        {buildings.length === 0 ? (
          <p className="text-center py-8 text-slate-500 text-xs">
            No facilities registered yet. Add buildings in the Facilities tab to generate reports.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="max-w-md space-y-1">
              <label className="text-xs font-bold text-slate-300">Select Facility / Tower:</label>
              <select
                value={selectedBuildingId}
                onChange={(e) => setSelectedBuildingId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.totalEquipments || b.equipments?.length || 0} assets) &bull; {b.client?.name || 'Client'}
                  </option>
                ))}
              </select>
            </div>

            {selectedBuilding && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">{selectedBuilding.name}</h4>
                  <p className="text-xs text-slate-400">{selectedBuilding.address}</p>
                  <p className="text-[11px] text-slate-500">
                    Cycle: <strong>{selectedBuilding.complianceCycle}</strong> &bull; Total Assets:{' '}
                    <strong>{selectedBuilding.totalEquipments || selectedBuilding.equipments?.length || 0}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/report/${selectedBuilding.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs transition-colors shadow-md"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View &amp; Print Form-B</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
