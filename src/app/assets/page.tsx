'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Search,
  Filter,
  Scan,
  Printer,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  RefreshCw
} from 'lucide-react';
import { EQUIPMENT_TYPES, getAssetRefillStatus } from '@/lib/compliance';

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const url = statusFilter !== 'ALL' ? `/api/assets?status=${statusFilter}` : '/api/assets';
      const res = await fetch(url);
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [statusFilter]);

  const filteredAssets = assets.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.qrCode.toLowerCase().includes(q) ||
      a.serialNumber.toLowerCase().includes(q) ||
      a.building?.name.toLowerCase().includes(q) ||
      a.locationFloor.toLowerCase().includes(q) ||
      a.locationSpecific.toLowerCase().includes(q) ||
      a.brand.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Master Equipment & Extinguisher Inventory
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
              {assets.length} Units
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time compliance monitoring per IS 2190 standards with direct QR audit workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/scan"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm shadow-md transition-colors"
          >
            <Scan className="w-4 h-4" />
            <span>Scan Extinguisher</span>
          </Link>
          <Link
            href="/assets/print-qr"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print All QR Stickers</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by QR code, serial number, building, floor, brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0f172a] border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Statuses ({assets.length})</option>
            <option value="OPERATIONAL">Operational (Safe)</option>
            <option value="REFILL_DUE">Refill Due / Overdue</option>
            <option value="HYDRO_TEST_DUE">Hydro Pressure Test Due</option>
            <option value="PRESSURE_LOW">Low Pressure / Defect</option>
          </select>
        </div>
      </div>

      {/* Master Inventory Table */}
      <div className="bg-[#0d1322] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Flame className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No extinguishers match criteria</h3>
            <p className="text-xs text-slate-500 mt-1">Clear your filter or scan a new extinguisher.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Asset QR Tag</th>
                  <th className="py-3 px-4">Building & Location</th>
                  <th className="py-3 px-4">Equipment Type</th>
                  <th className="py-3 px-4">Capacity & Brand</th>
                  <th className="py-3 px-4">Last Service</th>
                  <th className="py-3 px-4">Next Refill Due</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAssets.map((asset) => {
                  const eqInfo = EQUIPMENT_TYPES[asset.type];
                  const refill = getAssetRefillStatus(asset.nextRefillDueDate);

                  return (
                    <tr key={asset.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        <Link
                          href={`/verify/${asset.qrCode}`}
                          className="hover:text-red-400 flex items-center gap-1.5"
                          title="Open Public Passport"
                        >
                          <span>{asset.qrCode}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{asset.building?.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {asset.locationFloor}, {asset.locationWing} • {asset.locationSpecific}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200 truncate max-w-[170px]">
                          {eqInfo?.name || asset.type}
                        </div>
                        <div className="text-[10px] text-slate-500">{asset.isStandard}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{asset.capacity}</div>
                        <div className="text-[11px] text-slate-400">{asset.brand} (S/N: {asset.serialNumber})</div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        <div>{new Date(asset.lastRefillDate).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-500">Hydro: {new Date(asset.lastHydroTestDate).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-300">{new Date(asset.nextRefillDueDate).toLocaleDateString()}</div>
                        <span className={`text-[10px] font-semibold ${
                          refill.status === 'OVERDUE' ? 'text-red-400' :
                          refill.status === 'DUE_SOON' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {refill.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          asset.status === 'OPERATIONAL' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          asset.status === 'REFILL_DUE' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          asset.status === 'HYDRO_TEST_DUE' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {asset.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/scan?code=${asset.qrCode}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-[11px] shadow-sm transition-colors"
                          >
                            <Scan className="w-3 h-3" />
                            <span>Audit / Refill</span>
                          </Link>
                          <Link
                            href={`/verify/${asset.qrCode}`}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Passport"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
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
  );
}
