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
      className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-sm bg-white border-[#DCE7F2] text-slate-800 dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-100 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EAF6FF] text-[#007DB8] flex items-center justify-center border border-[#007DB8]/30 dark:bg-[#0077B6]/20 dark:text-cyan-300 dark:border-cyan-400/20">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
              Technician Workforce
            </span>
            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
              Free testing access
            </span>
          </div>

          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-2xl sm:text-3xl font-black text-[#023E8A] dark:text-white tabular-nums">
              {usage.active}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Active technician{usage.active === 1 ? '' : 's'} registered
            </span>
          </div>
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Full agency evaluation mode &bull; Unlimited technicians
          </span>
        </div>
      </div>
    </div>
  );
}
