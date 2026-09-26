'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  MapPin,
  Calendar,
  RotateCcw,
  Check,
  Scan,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function TechnicianEquipmentServicePage() {
  const params = useParams();
  const router = useRouter();
  const qrCode = params.qrCode as string;

  const [equipment, setEquipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState<any>(null);
  const [technicianName, setTechnicianName] = useState('Santosh Shinde');

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/technician/scan?qrCode=${encodeURIComponent(qrCode)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Equipment not found');
      } else {
        setEquipment(data.equipment);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (qrCode) {
      fetchEquipment();
    }
  }, [qrCode]);

  // Audio feedback helper
  const playSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // AudioContext fallback
    }
  };

  // ONE-TAP SERVICE ACTION
  const handleOneTapService = async (intervalMonths: number) => {
    try {
      setSubmitting(true);
      const res = await fetch('/api/technician/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode,
          intervalMonths,
          technicianName,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        playSuccessSound();
        setSuccessResult(data);
        setEquipment(data.equipment);
      } else {
        setError(data.error || 'Failed to log service');
      }
    } catch (e: any) {
      setError(e.message || 'Service request failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6 text-center py-20 text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
        <p className="text-xs font-semibold">Looking up QR code {qrCode}...</p>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-4">
        <div className="tactile-card rounded-2xl bg-slate-900 border border-red-500/40 p-6 text-center space-y-3 shadow-2xl">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-base font-black text-white">Equipment Tag Not Found</h2>
          <p className="text-xs text-amber-400 font-mono bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-500/30 inline-block">{qrCode}</p>
          <p className="text-xs text-slate-400">{error || 'No matching equipment record in database.'}</p>
          <div className="pt-2">
            <Link
              href="/scan"
              className="inline-block px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all"
            >
              Scan Another Code
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = equipment.liveStatus || equipment.status;
  const isOverdue = status === 'OVERDUE';
  const isDueSoon = status === 'DUE_SOON';

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 space-y-5 text-slate-100">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link href="/scan" className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Scan Next</span>
        </Link>
        <span className="font-mono text-xs font-black text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-lg">
          {equipment.qrCode}
        </span>
      </div>

      {/* SUCCESS CONFIRMATION MODAL OVERLAY */}
      {successResult ? (
        <div className="tactile-card rounded-2xl bg-slate-900 border-2 border-emerald-500/80 p-6 text-center space-y-4 shadow-2xl shadow-emerald-950/50 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-emerald-500/30">
            <Check className="w-10 h-10 stroke-[3.5]" />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">Service Logged Successfully!</h2>
            <p className="text-xs text-emerald-400 font-medium mt-1">
              Status updated to <strong className="text-emerald-300">Current &amp; Compliant</strong>
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Serviced Date:</span>
              <span className="font-bold text-white">{new Date().toLocaleDateString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Next Due Date:</span>
              <span className="font-black text-emerald-400">
                {new Date(successResult.equipment.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Technician:</span>
              <span className="font-semibold text-slate-200">{technicianName}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => router.push('/scan')}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              Scan Next Equipment →
            </button>
            <Link
              href={`/report/${equipment.buildingId}`}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold py-1 transition-colors"
            >
              View Building Compliance Report
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Equipment Status Card */}
          <div className="tactile-card rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-2xl space-y-4">
            {/* Status Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {equipment.type}
                </span>
                <h1 className="text-lg font-black text-white leading-tight">
                  {equipment.capacity}
                </h1>
              </div>

              {/* Status Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  isOverdue
                    ? 'bg-red-950/60 text-red-400 border border-red-500/40 animate-pulse'
                    : isDueSoon
                    ? 'bg-amber-950/60 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {isOverdue ? '✕ Overdue' : isDueSoon ? '⚠ Due Soon' : '✓ Current'}
              </span>
            </div>

            {/* Location Details */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{equipment.building?.name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{equipment.location}</span>
              </div>
              <p className="text-[11px] text-slate-400 pl-5">Client: <span className="text-slate-300 font-semibold">{equipment.building?.client?.name}</span></p>
            </div>

            {/* Date Details */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Last Service:</span>
                <span className="font-semibold text-slate-200">
                  {new Date(equipment.lastServiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Next Service Due:</span>
                <span className={`font-black ${isOverdue ? 'text-red-400' : isDueSoon ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {new Date(equipment.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Technician Info */}
            <div className="text-xs pt-1">
              <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Technician Sign-off:</label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
              />
            </div>
          </div>

          {/* ONE-TAP ACTION BUTTONS */}
          <div className="space-y-2.5 pt-1">
            <button
              onClick={() => handleOneTapService(12)}
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              <Check className="w-5 h-5 stroke-[3.5]" />
              <span>{submitting ? 'Logging Service...' : 'Tap to Log Service (+12 Months)'}</span>
            </button>

            <button
              onClick={() => handleOneTapService(6)}
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 hover:border-amber-500/30 transition-colors"
            >
              Log Half-Yearly Service (+6 Months)
            </button>
          </div>

          {/* Past Service History */}
          {equipment.serviceLogs?.length > 0 && (
            <div className="tactile-card rounded-xl bg-slate-900/90 border border-slate-800 p-4 text-xs space-y-2">
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">Service History</span>
              <div className="divide-y divide-slate-800">
                {equipment.serviceLogs.map((log: any) => (
                  <div key={log.id} className="py-2 flex items-center justify-between text-[11px]">
                    <div>
                      <div className="font-bold text-slate-200">{log.actionType}</div>
                      <div className="text-slate-400">By {log.technicianName}</div>
                    </div>
                    <div className="text-amber-400/80 font-mono font-semibold">
                      {new Date(log.servicedAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
