'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Scan,
  Camera,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  QrCode
} from 'lucide-react';

function ScanLandingContent() {
  const router = useRouter();
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef<any>(null);

  const startCamera = async () => {
    setCameraActive(true);
    setCameraError('');

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-camera-viewport');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          let code = decodedText;
          if (decodedText.includes('/scan/')) {
            code = decodedText.split('/scan/')[1].split('?')[0];
          }
          stopCamera();
          router.push(`/scan/${encodeURIComponent(code)}`);
        },
        () => {}
      );
    } catch (err: any) {
      console.error(err);
      setCameraError('Camera access unavailable. Please use the direct tag selector below.');
      setCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (e) {
        console.error(e);
      }
    }
    setCameraActive(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      router.push(`/scan/${encodeURIComponent(manualCode.trim())}`);
    }
  };

  const sampleQRs = [
    { code: 'GWH-EXT-01', label: 'Overdue Unit (Red Alert)', color: 'text-red-400 bg-red-950/30 border-red-500/30' },
    { code: 'PCT-EXT-01', label: 'Due in 15d (Amber Warning)', color: 'text-amber-400 bg-amber-950/30 border-amber-500/30' },
    { code: 'APH-EXT-01', label: 'Current Unit (Green Compliant)', color: 'text-emerald-400 bg-emerald-950/30 border-emerald-500/30' },
  ];

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 space-y-6 text-slate-100">
      {/* Mobile Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-amber-500/20">
          <Scan className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Mobile Field Technician OS</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">On-Site QR Service Scan</h1>
        <p className="text-xs text-slate-400">Scan equipment QR tag on-site to log service with 1 tap</p>
      </div>

      {/* Camera Box */}
      <div className="tactile-card rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-2xl space-y-4">
        {cameraActive ? (
          <div className="space-y-3">
            <div
              id="qr-camera-viewport"
              className="w-full aspect-square rounded-xl overflow-hidden bg-slate-950 border-2 border-amber-500 relative"
            />
            <button
              onClick={stopCamera}
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Close Camera
            </button>
          </div>
        ) : (
          <button
            onClick={startCamera}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Camera className="w-5 h-5 stroke-[2.5]" />
            <span>Open Camera Scanner</span>
          </button>
        )}

        {cameraError && (
          <p className="text-xs text-amber-300 bg-amber-950/50 p-2.5 rounded-lg border border-amber-500/40 text-center">
            {cameraError}
          </p>
        )}

        <div className="relative flex items-center justify-center py-2">
          <span className="bg-slate-900 px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider relative z-10">
            Or Enter QR Tag ID
          </span>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
        </div>

        {/* Manual lookup input */}
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. GWH-EXT-01"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-white placeholder-slate-500 uppercase focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all hover:scale-[1.02]"
          >
            Open
          </button>
        </form>

        {/* Sample Tags for Instant Testing */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
            Quick Demo QR Tags:
          </span>
          <div className="grid grid-cols-1 gap-2">
            {sampleQRs.map((item) => (
              <button
                key={item.code}
                onClick={() => router.push(`/scan/${item.code}`)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all hover:scale-[1.01] ${item.color}`}
              >
                <div>
                  <span className="font-mono font-black text-xs block">{item.code}</span>
                  <span className="text-[11px] opacity-80">{item.label}</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-80" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link href="/dashboard" className="text-xs text-slate-400 hover:text-amber-400 font-semibold transition-colors">
          ← Back to Admin Compliance Radar
        </Link>
      </div>
    </div>
  );
}

export default function TechnicianScanLandingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading scanner...</div>}>
      <ScanLandingContent />
    </Suspense>
  );
}
