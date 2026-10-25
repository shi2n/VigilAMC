'use client';

import React from 'react';
import { Users, Sparkles, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export interface SeatUsage {
  active: number;
  inactive: number;
  total: number;
  max: number | string;
  maxNumeric: number;
  available: number | string;
  availableNumeric: number;
  percentUsed: number;
  isAtLimit: boolean;
}

interface SeatCounterProps {
  usage?: SeatUsage;
  planName?: string;
  onUpgradeClick?: () => void;
  className?: string;
}

export function SeatCounter({
  usage,
  className = '',
}: SeatCounterProps) {
  if (!usage) return null;

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-sm bg-white border-[#FED7AA] text-slate-800 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFF0E6] text-[#C2410C] flex items-center justify-center border border-[#C2410C]/30">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Technician Workforce
            </span>
            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Free testing access
            </span>
          </div>

          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-2xl sm:text-3xl font-black text-[#1C1917] tabular-nums">
              {usage.active}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              Active technician{usage.active === 1 ? '' : 's'} registered
            </span>
          </div>
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">
            Full agency evaluation mode &bull; Unlimited technicians
          </span>
        </div>
      </div>
    </div>
  );
}
