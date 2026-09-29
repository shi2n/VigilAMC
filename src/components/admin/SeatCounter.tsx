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
  planName = 'Basic AMC',
  onUpgradeClick,
  className = '',
}: SeatCounterProps) {
  if (!usage) return null;

  const isUnlimited = usage.maxNumeric >= 999999;
  const isNearLimit = !isUnlimited && usage.percentUsed >= 80;
  const isFull = !isUnlimited && usage.isAtLimit;

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all ${
        isFull
          ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
          : isNearLimit
          ? 'bg-blue-950/20 border-cyan-500/30 text-slate-100'
          : 'bg-slate-900/90 border-slate-800 text-slate-100'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0077B6]/20 text-cyan-300 flex items-center justify-center border border-cyan-400/20">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Technician Seats
            </span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/30">
              {planName}
            </span>
          </div>

          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
              {usage.active}
            </span>
            <span className="text-sm font-semibold text-slate-400">
              / {isUnlimited ? '∞ Unlimited' : `${usage.max} used`}
            </span>
            {!isUnlimited && (
              <span className="text-xs text-slate-400 ml-2">
                ({usage.available} available seat{usage.available === 1 ? '' : 's'})
              </span>
            )}
          </div>
        </div>

        {/* Right CTA */}
        {onUpgradeClick && (
          <div className="flex items-center gap-2 shrink-0">
            {isFull && (
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Limit Reached
              </span>
            )}
            <button
              type="button"
              onClick={onUpgradeClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0077B6] to-[#023E8A] hover:from-[#006494] hover:to-[#011F48] shadow-sm hover:shadow transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>{isFull ? 'Upgrade Plan to Add Seats' : 'Manage Subscription'}</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {!isUnlimited && (
        <div className="mt-4 space-y-1.5">
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull
                  ? 'bg-amber-500'
                  : isNearLimit
                  ? 'bg-gradient-to-r from-[#0077B6] to-amber-500'
                  : 'bg-gradient-to-r from-cyan-400 to-[#0077B6]'
              }`}
              style={{ width: `${Math.min(100, usage.percentUsed)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              <strong>{usage.active} Active</strong> technician account{usage.active === 1 ? '' : 's'}
              {usage.inactive > 0 && ` (${usage.inactive} archived/inactive)`}
            </span>
            <span className="font-semibold text-slate-300">
              {usage.percentUsed}% Capacity
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
