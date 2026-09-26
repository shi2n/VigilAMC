'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Building2,
  Flame,
  ShieldAlert,
  Printer,
  Plus,
  FileCheck2,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { getNocStatus, getAssetRefillStatus, EQUIPMENT_TYPES } from '@/lib/compliance';

export default function BuildingDetailPage() {
  const params = useParams();
  const [building, setBuilding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [batchModalOpen, setBatchModalOpen] = useState(false);

  // Batch generator state
  const [batchCount, setBatchCount] = useState(10);
  const [batchType, setBatchType] = useState('ABC_DRY_POWDER');
  const [batchCapacity, setBatchCapacity] = useState('6 KG');
  const [batchBrand, setBatchBrand] = useState('Ceasefire');

  const fetchBuilding = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/buildings/${params.id}`);
      const data = await res.json();
      setBuilding(data.building);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchBuilding();
    }
  }, [params.id]);

  const handleBatchGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!building) return;

    const assetsToCreate = [];
    const prefix = building.name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'EXT';
    const startNum = (building.assets?.length || 0) + 1;

    for (let i = 0; i < batchCount; i++) {
      const num = startNum + i;
      const targetFloor = ((num - 1) % building.totalFloors) + 1;
      assetsToCreate.push({
        buildingId: building.id,
        qrCode: `VGL-${prefix}-${String(num).padStart(3, '0')}`,
        type: batchType,
        capacity: batchCapacity,
        brand: batchBrand,
        serialNumber: `SN-${prefix}-${num}`,
        locationFloor: `Floor ${targetFloor}`,
        locationWing: num % 2 === 0 ? 'Wing A' : 'Wing B',
        locationSpecific: `Near Lift Corridor Floor ${targetFloor}`,
        mfgYear: new Date().getFullYear(),
        lastRefillDate: new Date(),
        nextRefillDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        lastHydroTestDate: new Date(),
        nextHydroTestDueDate: new Date(Date.now() + 1095 * 24 * 60 * 60 * 1000),
        status: 'OPERATIONAL',
        weightKg: batchCapacity.includes('6') ? 9.8 : batchCapacity.includes('4.5') ? 12.8 : 7.0,
      });
    }

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assets: assetsToCreate }),
      });
      const data = await res.json();
      if (data.success) {
        setBatchModalOpen(false);
        fetchBuilding();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !building) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading facility assets & floor matrix...
      </div>
    );
  }

  const noc = getNocStatus(building.nocExpiryDate);
  const assets = building.assets || [];

  // Unique floors for filtering
  const floors = Array.from(new Set(assets.map((a: any) => a.locationFloor))).sort();

  const filteredAssets = selectedFloor === 'ALL'
    ? assets
    : assets.filter((a: any) => a.locationFloor === selectedFloor);

  const operationalCount = assets.filter((a: any) => a.status === 'OPERATIONAL').length;
  const overdueCount = assets.filter((a: any) => a.status === 'REFILL_DUE' || a.status === 'PRESSURE_LOW').length;

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Back button & Title */}
      <div className="space-y-3">
        <Link
          href="/buildings"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Buildings</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {building.name}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                {building.occupancyType}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{building.address}, {building.city} - {building.pincode}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setBatchModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Batch Add Extinguishers</span>
            </button>

            <Link
              href={`/assets/print-qr?buildingId=${building.id}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print Stickers</span>
            </Link>

            <Link
              href={`/certificates`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Form-B Certificate</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Building Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fire NOC Card */}
        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Fire NOC Certificate</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="font-mono text-sm font-bold text-white">{building.fireNocNumber}</div>
          <div className="flex items-center justify-between pt-1">
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${noc.badgeClass}`}>
              {noc.label}
            </span>
            <span className="text-[11px] text-slate-400">
              Exp: {new Date(building.nocExpiryDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Extinguisher Compliance Rate */}
        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Asset Health Matrix</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{assets.length}</span>
            <span className="text-xs text-slate-400">Total Units</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">{operationalCount} Operational</span>
            <span>•</span>
            <span className="text-red-400 font-semibold">{overdueCount} Need Service</span>
          </div>
        </div>

        {/* Facility Contact */}
        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Facility Manager / Secretary</span>
            <Phone className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-white truncate">{building.contactPerson}</div>
          <div className="text-xs text-slate-400 space-y-0.5">
            <div>Phone: <a href={`tel:${building.contactPhone}`} className="text-red-400">{building.contactPhone}</a></div>
            <div>Email: <span className="text-slate-300">{building.contactEmail}</span></div>
          </div>
        </div>
      </div>

      {/* Extinguisher Floor Matrix & Search */}
      <div className="p-5 rounded-2xl bg-[#0d1322] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-bold text-white">Extinguisher Registry ({assets.length} Assets)</h2>
          </div>

          {/* Floor filter buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedFloor('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedFloor === 'ALL'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Floors ({assets.length})
            </button>
            {floors.map((floor: any) => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedFloor === floor
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {floor}
              </button>
            ))}
          </div>
        </div>

        {/* Table of Assets */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">QR Code</th>
                <th className="py-2.5 px-3">Location Spot</th>
                <th className="py-2.5 px-3">Type & Capacity</th>
                <th className="py-2.5 px-3">Brand & S/N</th>
                <th className="py-2.5 px-3">Next Refill Due</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAssets.map((asset: any) => {
                const eqInfo = EQUIPMENT_TYPES[asset.type];
                const refillStatus = getAssetRefillStatus(asset.nextRefillDueDate);
                return (
                  <tr key={asset.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-white">
                      <Link href={`/verify/${asset.qrCode}`} className="hover:text-red-400 flex items-center gap-1.5">
                        <span>{asset.qrCode}</span>
                      </Link>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-200">{asset.locationFloor}</div>
                      <div className="text-[11px] text-slate-400">{asset.locationSpecific} ({asset.locationWing})</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-200">{asset.capacity}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{eqInfo?.name || asset.type}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      <div>{asset.brand}</div>
                      <div className="font-mono text-[10px] text-slate-500">{asset.serialNumber}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-300">{new Date(asset.nextRefillDueDate).toLocaleDateString()}</div>
                      <span className={`text-[10px] font-semibold ${
                        refillStatus.status === 'OVERDUE' ? 'text-red-400' :
                        refillStatus.status === 'DUE_SOON' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {refillStatus.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        asset.status === 'OPERATIONAL' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        asset.status === 'REFILL_DUE' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {asset.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/scan?code=${asset.qrCode}`}
                          className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-semibold text-[11px] shadow-sm transition-colors inline-flex items-center gap-1"
                        >
                          <Scan className="w-3 h-3" />
                          <span>Audit</span>
                        </Link>
                        <Link
                          href={`/verify/${asset.qrCode}`}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                          title="Public Passport View"
                        >
                          Passport
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Generator Modal */}
      {batchModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-white text-base">Batch Add Extinguishers</h3>
              </div>
              <button onClick={() => setBatchModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Quickly generate 10 to 50 equipment items with auto-incrementing serials and QR codes distributed across building floors.
            </p>

            <form onSubmit={handleBatchGenerate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantity to Generate</label>
                  <select
                    value={batchCount}
                    onChange={(e) => setBatchCount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value={5}>5 Extinguishers</option>
                    <option value={10}>10 Extinguishers</option>
                    <option value={20}>20 Extinguishers</option>
                    <option value={35}>35 Extinguishers</option>
                    <option value={50}>50 Extinguishers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Equipment Type</label>
                  <select
                    value={batchType}
                    onChange={(e) => {
                      setBatchType(e.target.value);
                      if (e.target.value === 'CO2') setBatchCapacity('4.5 KG');
                      else if (e.target.value === 'FOAM_AFFF' || e.target.value === 'WATER_CO2') setBatchCapacity('9 LTR');
                      else setBatchCapacity('6 KG');
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="ABC_DRY_POWDER">ABC Dry Powder (Stored Pressure)</option>
                    <option value="CO2">CO2 (Carbon Dioxide)</option>
                    <option value="FOAM_AFFF">Mechanical Foam (AFFF)</option>
                    <option value="WATER_CO2">Water-CO2</option>
                    <option value="CLEAN_AGENT_FM200">Clean Agent (FM-200)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cylinder Capacity</label>
                  <input
                    type="text"
                    value={batchCapacity}
                    onChange={(e) => setBatchCapacity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={batchBrand}
                    onChange={(e) => setBatchBrand(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-white">Auto-Distribution Strategy:</div>
                <div>• QRs will be tagged: <span className="font-mono text-red-400">VGL-{(building.name.replace(/[^A-Za-z]/g, '').slice(0, 3) || 'EXT').toUpperCase()}-XXX</span></div>
                <div>• Distributed sequentially across Floors 1 to {building.totalFloors}</div>
                <div>• Next refill automatically scheduled for +1 year per IS 2190</div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBatchModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold shadow-md"
                >
                  Generate {batchCount} Assets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
