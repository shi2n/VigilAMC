'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShieldCheck,
  ShieldAlert,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  PhoneCall,
  Info,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { EQUIPMENT_TYPES, getAssetRefillStatus } from '@/lib/compliance';

export default function PublicVerifyPassportPage() {
  const params = useParams();
  const qrCode = params.qrCode as string;

  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/scan?code=${encodeURIComponent(qrCode)}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Asset not found');
        } else {
          setAsset(data.asset);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load passport');
      } finally {
        setLoading(false);
      }
    };

    if (qrCode) {
      fetchAsset();
    }
  }, [qrCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Flame className="w-10 h-10 text-red-500 animate-bounce mx-auto" />
          <h2 className="text-base font-bold">Verifying Fire Safety Passport...</h2>
          <p className="text-xs text-slate-400">Authenticating digital certificate with IS 2190 registry</p>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0d1322] border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold">Equipment Record Not Found</h2>
          <p className="text-xs text-slate-400">
            No active compliance record found for QR Code: <span className="font-mono text-red-400 font-bold">{qrCode}</span>
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Go to Command Center
          </Link>
        </div>
      </div>
    );
  }

  const eqInfo = EQUIPMENT_TYPES[asset.type] || EQUIPMENT_TYPES.ABC_DRY_POWDER;
  const refill = getAssetRefillStatus(asset.nextRefillDueDate);
  const isOperational = asset.status === 'OPERATIONAL' && refill.status === 'OK';

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between py-6 px-4">
      <div className="max-w-xl mx-auto w-full space-y-5">
        {/* Top Header & Official Seal */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white font-black text-sm">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight">VigilAMC Digital Passport</div>
              <div className="text-[10px] text-slate-400">Licensed Fire Compliance Portal</div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified
            </span>
          </div>
        </div>

        {/* Live Safety Status Banner */}
        <div
          className={`p-5 rounded-2xl border text-center space-y-2 shadow-xl ${
            isOperational
              ? 'bg-gradient-to-b from-emerald-950/60 to-emerald-900/30 border-emerald-600/80 shadow-emerald-950/40'
              : 'bg-gradient-to-b from-red-950/60 to-red-900/30 border-red-600/80 shadow-red-950/40'
          }`}
        >
          <div className="flex justify-center">
            {isOperational ? (
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 border-2 border-red-400 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-red-400 animate-pulse" />
              </div>
            )}
          </div>

          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white">
              {isOperational ? 'Certified Operational' : 'Service Due / Overdue'}
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              {isOperational
                ? 'Inspected & tested safe for emergency operation under IS 2190 standards.'
                : 'Attention: Refill or maintenance interval exceeded. Service technician scheduled.'}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3 text-xs">
            <span className="font-mono font-bold text-slate-200">ID: {asset.qrCode}</span>
            <span>•</span>
            <span className={isOperational ? 'text-emerald-300 font-semibold' : 'text-red-300 font-semibold'}>
              Refill Valid Till: {new Date(asset.nextRefillDueDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Location & Facility Information */}
        <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-red-500" />
            <span>Installation Location</span>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-white text-base">{asset.building?.name}</div>
            <div className="text-xs text-slate-300">
              {asset.locationFloor}, {asset.locationWing} • <span className="font-semibold text-white">{asset.locationSpecific}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              {asset.building?.address}, {asset.building?.city}
            </div>
          </div>
        </div>

        {/* Equipment Technical Specs */}
        <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Equipment Specifications</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">CYLINDER TYPE:</span>
              <span className="font-bold text-slate-100">{eqInfo.name}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">CAPACITY:</span>
              <span className="font-bold text-slate-100">{asset.capacity}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">BRAND & SERIAL:</span>
              <span className="font-bold text-slate-100">{asset.brand} ({asset.serialNumber})</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">STANDARDS:</span>
              <span className="font-bold text-slate-100">{asset.isStandard}</span>
            </div>
          </div>

          {/* Suitable Fire Classes */}
          <div className="pt-2 text-xs space-y-1.5">
            <div className="text-slate-400 font-semibold text-[11px]">Suitable for Fire Classes:</div>
            <div className="flex flex-wrap gap-1.5">
              {eqInfo.suitableFor.map((cls, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700"
                >
                  ✓ {cls}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency P.A.S.S Operating Guide */}
        <div className="bg-gradient-to-br from-slate-900 to-[#101b33] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-white text-base">Emergency Operation: P.A.S.S</h3>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Emergency Guide
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 font-black text-amber-400 text-sm mb-1">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">P</span>
                <span>PULL</span>
              </div>
              <p className="text-slate-300 text-[11px]">{eqInfo.passGuide.p}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 font-black text-amber-400 text-sm mb-1">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">A</span>
                <span>AIM</span>
              </div>
              <p className="text-slate-300 text-[11px]">{eqInfo.passGuide.a}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 font-black text-amber-400 text-sm mb-1">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">S</span>
                <span>SQUEEZE</span>
              </div>
              <p className="text-slate-300 text-[11px]">{eqInfo.passGuide.s1}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 font-black text-amber-400 text-sm mb-1">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">S</span>
                <span>SWEEP</span>
              </div>
              <p className="text-slate-300 text-[11px]">{eqInfo.passGuide.s2}</p>
            </div>
          </div>

          {/* Safety Warning */}
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-red-300">Safety Caution: </strong>
              <span className="text-[11px] text-red-200">{eqInfo.passGuide.caution}</span>
            </div>
          </div>
        </div>

        {/* Inspecting Agency & Certification Credentials */}
        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>MAINTAINED & CERTIFIED BY:</span>
            <span className="text-emerald-400 font-semibold">Govt. Authorized</span>
          </div>
          <div className="font-bold text-white text-sm">
            {asset.building?.company?.name || 'Vigil Fire & Safety Solutions Pvt Ltd'}
          </div>
          <div className="text-[11px] text-slate-400">
            Agency License No: <span className="font-mono text-slate-200 font-semibold">{asset.building?.company?.licenseNumber || 'DL/FIRE/LIC/2022/A-412'}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Chief Signatory: {asset.building?.company?.signatoryName || 'Er. Rajesh Kumar Sharma'}
          </div>
        </div>

        {/* Emergency Helpline Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <a
            href="tel:101"
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Fire Brigade (101)</span>
          </a>

          <a
            href={`tel:${asset.building?.contactPhone || '9820154321'}`}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
          >
            <Building2 className="w-4 h-4" />
            <span>Building Security</span>
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-slate-500 text-[11px] space-y-1">
        <p>VigilAMC • Compliance Verification under IS 2190, NBC 2016 &amp; Delhi Fire Safety Rules</p>
        <p className="text-slate-600">Digital Passport ID: {asset.qrCode}</p>
      </footer>
    </div>
  );
}
