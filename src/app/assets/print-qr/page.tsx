'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import QRCode from 'qrcode';
import {
  Printer,
  ArrowLeft,
  Building2,
  RefreshCw,
  QrCode as QrIcon,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

function PrintQrContent() {
  const searchParams = useSearchParams();
  const initialBuildingId = searchParams.get('buildingId') || 'ALL';

  const [company, setCompany] = useState<any>(null);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>(initialBuildingId);
  const [loading, setLoading] = useState(true);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [sheetLayout, setSheetLayout] = useState<'A4_GRID' | 'THERMAL_ROLL'>('A4_GRID');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/buildings');
        const data = await res.json();
        const blds = data.buildings || [];
        setBuildings(blds);
        if (data.company) {
          setCompany(data.company);
        }

        let allEquipments: any[] = [];
        if (selectedBuilding === 'ALL') {
          blds.forEach((b: any) => {
            b.equipments.forEach((eq: any) => {
              allEquipments.push({ ...eq, buildingName: b.name });
            });
          });
        } else {
          const selected = blds.find((b: any) => b.id === selectedBuilding);
          if (selected) {
            selected.equipments.forEach((eq: any) => {
              allEquipments.push({ ...eq, buildingName: selected.name });
            });
          }
        }

        setEquipments(allEquipments);

        // Generate QR code data URLs
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vigilfire.in';
        const imageMap: Record<string, string> = {};

        for (const eq of allEquipments) {
          try {
            const scanUrl = `${origin}/scan/${encodeURIComponent(eq.qrCode)}`;
            const url = await QRCode.toDataURL(scanUrl, {
              width: 180,
              margin: 1,
              color: { dark: '#000000', light: '#ffffff' },
            });
            imageMap[eq.qrCode] = url;
          } catch (err) {
            console.error('QR generation error for', eq.qrCode, err);
          }
        }
        setQrImages(imageMap);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedBuilding]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-slate-100">
      {/* Screen Controls Header (Hidden in Print) */}
      <div className="no-print space-y-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Compliance Radar</span>
        </Link>

        <div className="tactile-card rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-md">
                <QrIcon className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Printable Equipment QR Labels
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
                {equipments.length} Labels Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Industrial sticker sheets encoding 1-tap technician service links: <code className="font-mono text-amber-300 bg-amber-950/40 border border-amber-500/30 px-1.5 py-0.5 rounded text-[11px]">/scan/[qrCode]</code>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Print Sticker Sheet</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="tactile-card rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-300">Filter by Building:</span>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-medium focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Buildings ({buildings.length})</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.equipments?.length || 0} units)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Layout Format:</span>
            <button
              onClick={() => setSheetLayout('A4_GRID')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                sheetLayout === 'A4_GRID'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              A4 Sheet (3-Column Grid)
            </button>
            <button
              onClick={() => setSheetLayout('THERMAL_ROLL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                sheetLayout === 'THERMAL_ROLL'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Single Thermal Badge
            </button>
          </div>
        </div>
      </div>

      {/* Printable Sticker Sheet */}
      {loading ? (
        <div className="py-20 flex justify-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : equipments.length === 0 ? (
        <div className="p-12 text-center text-slate-400 tactile-card rounded-2xl bg-slate-900 border border-slate-800">
          <QrIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No equipment found to print</h3>
          <p className="text-xs text-slate-400 mt-1">Please add equipment or choose another building from the filter.</p>
        </div>
      ) : (
        <div className="print-container">
          <div
            className={`grid gap-3.5 ${
              sheetLayout === 'A4_GRID'
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 print:grid-cols-3'
                : 'grid-cols-1 max-w-xs mx-auto'
            }`}
          >
            {equipments.map((eq) => {
              const qrSrc = qrImages[eq.qrCode];
              const dueFormatted = new Date(eq.nextDueDate).toLocaleDateString('en-IN', {
                month: 'short',
                year: 'numeric',
              });
              const serviceFormatted = new Date(eq.lastServiceDate).toLocaleDateString('en-IN', {
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={eq.id}
                  className="bg-white text-slate-900 p-3 rounded-xl border-2 border-slate-400 shadow-xs flex flex-col justify-between print:border-black print:shadow-none print:break-inside-avoid print:p-2"
                >
                  {/* Sticker Header */}
                  <div className="border-b-2 border-slate-900 pb-1 mb-2 flex items-center justify-between">
                    <div>
                      <div className="font-black text-[11px] text-slate-950 uppercase tracking-tight">
                        {company?.name || 'FIRE SAFETY AMC SERVICES'}
                      </div>
                      <div className="text-[8px] font-semibold text-slate-600">
                        LIC: {company?.licenseNumber || 'MH/FIRE/LIC/2024'} • IS 2190
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-bold text-red-600 uppercase block">Emergency</span>
                      <span className="text-[9px] font-black text-slate-950">{company?.phone || '101 / 112'}</span>
                    </div>
                  </div>

                  {/* Body: QR + Info */}
                  <div className="flex items-center gap-2.5">
                    <div className="shrink-0 p-1 border border-slate-900 rounded bg-white">
                      {qrSrc ? (
                        <img src={qrSrc} alt={eq.qrCode} className="w-18 h-18 object-contain" />
                      ) : (
                        <div className="w-18 h-18 bg-slate-200 animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="font-mono font-black text-sm text-slate-900 tracking-tight">
                        {eq.qrCode}
                      </div>
                      <div className="text-[10px] font-bold text-slate-800 truncate">
                        {eq.capacity}
                      </div>
                      <div className="text-[9px] text-slate-600 truncate font-medium">
                        {eq.buildingName}
                      </div>
                      <div className="text-[8px] text-slate-500 truncate">
                        {eq.location}
                      </div>

                      <div className="pt-1 border-t border-slate-200 grid grid-cols-2 gap-1 text-[8px]">
                        <div>
                          <span className="text-slate-500 block">SERVICED:</span>
                          <span className="font-bold text-slate-800">{serviceFormatted}</span>
                        </div>
                        <div>
                          <span className="text-red-700 font-bold block">NEXT DUE:</span>
                          <span className="font-black text-red-700">{dueFormatted}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-2 pt-1 border-t border-dashed border-slate-400 flex items-center justify-between text-[7px] text-slate-600 font-medium">
                    <span>Scan with mobile to log service</span>
                    <span className="font-bold text-slate-950">+91 98201 54321</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PrintQrPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading sticker sheet...</div>}>
      <PrintQrContent />
    </Suspense>
  );
}
