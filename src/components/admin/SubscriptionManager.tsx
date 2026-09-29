'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Building2,
  Users,
  Flame,
  ArrowRight,
  Clock,
  CheckCircle2,
  Zap,
  CreditCard
} from 'lucide-react';
import { PlanConfig } from '@/lib/plans';

interface SubscriptionManagerProps {
  showToast: (msg: string) => void;
  onPlanChanged?: () => void;
}

export function SubscriptionManager({ showToast, onPlanChanged }: SubscriptionManagerProps) {
  const [loading, setLoading] = useState(true);
  const [subData, setSubData] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);
  const [confirmDowngradePlan, setConfirmDowngradePlan] = useState<any | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/subscription');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load subscription');

      setSubData(json);
      if (json.subscription?.billingCycle) {
        setBillingCycle(json.subscription.billingCycle);
      }
    } catch (err: any) {
      console.error('Subscription load error:', err);
      showToast(err.message || 'Error loading subscription details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleSelectPlan = async (targetPlan: PlanConfig) => {
    const currentPlanId = subData?.subscription?.plan || 'BASIC';
    if (targetPlan.id === currentPlanId) return;

    // Check if downgrade
    const isDowngrade =
      (currentPlanId === 'ENTERPRISE' && (targetPlan.id === 'PRO' || targetPlan.id === 'BASIC')) ||
      (currentPlanId === 'PRO' && targetPlan.id === 'BASIC');

    if (isDowngrade) {
      setConfirmDowngradePlan(targetPlan);
      return;
    }

    executePlanChange(targetPlan.id);
  };

  const executePlanChange = async (planId: string) => {
    try {
      setUpdatingPlan(planId);
      const res = await fetch('/api/admin/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planId,
          billingCycle,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update plan');

      setConfirmDowngradePlan(null);
      if (json.warning) {
        showToast(json.warning);
      } else {
        showToast(`Your agency plan was updated to ${json.plan?.name || planId}`);
      }

      await fetchSubscription();
      if (onPlanChanged) onPlanChanged();
    } catch (err: any) {
      showToast(err.message || 'Error updating plan');
    } finally {
      setUpdatingPlan(null);
    }
  };

  if (loading && !subData) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
        <p className="text-sm font-semibold">Loading subscription details...</p>
      </div>
    );
  }

  const subscription = subData?.subscription;
  const currentPlan = subData?.plan;
  const usage = subData?.usage;
  const availablePlans: PlanConfig[] = subData?.availablePlans || [];

  return (
    <div className="space-y-8">
      {/* 1. CURRENT SUBSCRIPTION OVERVIEW CARD */}
      <div className="tactile-card rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-navy-950 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                Current Agency Subscription
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {subscription?.status || 'ACTIVE'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {currentPlan?.name || 'Basic AMC Plan'}
            </h2>
            <p className="text-xs text-slate-400">
              {currentPlan?.tagline || 'Standard compliance and maintenance operating system'}
            </p>
          </div>

          <div className="text-left md:text-right space-y-1">
            <div className="flex items-baseline md:justify-end gap-1 text-white">
              <span className="text-3xl sm:text-4xl font-black text-amber-400 tabular-nums">
                ₹{subscription?.amount ? subscription.amount.toLocaleString('en-IN') : '3,999'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/ month</span>
            </div>
            <p className="text-xs text-slate-400 flex items-center md:justify-end gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Renews on{' '}
                <strong className="text-slate-200">
                  {subscription?.renewalDate
                    ? new Date(subscription.renewalDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Next billing cycle'}
                </strong>
              </span>
            </p>
          </div>
        </div>

        {/* 3 Capacity Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Technicians */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Technician Accounts</span>
              </span>
              <span className="font-bold text-white tabular-nums">
                {usage?.technicians?.active} / {usage?.technicians?.max}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  usage?.technicians?.isAtLimit ? 'bg-amber-500' : 'bg-[#0077B6]'
                }`}
                style={{ width: `${Math.min(100, usage?.technicians?.percentUsed || 0)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {usage?.technicians?.availableNumeric >= 999999
                ? 'Unlimited field seats'
                : `${usage?.technicians?.available} available seats`}
            </p>
          </div>

          {/* Towers / Buildings */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Buildings / Towers</span>
              </span>
              <span className="font-bold text-white tabular-nums">
                {usage?.towers?.used} / {usage?.towers?.max}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  usage?.towers?.isAtLimit ? 'bg-amber-500' : 'bg-amber-400'
                }`}
                style={{ width: `${Math.min(100, usage?.towers?.percentUsed || 0)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {usage?.towers?.available === 'Unlimited'
                ? 'Unlimited facility sites'
                : `${usage?.towers?.available} available sites`}
            </p>
          </div>

          {/* Fire Assets */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Fire Safety Assets</span>
              </span>
              <span className="font-bold text-white tabular-nums">
                {usage?.assets?.used} / {usage?.assets?.max}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  usage?.assets?.isAtLimit ? 'bg-red-500' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, usage?.assets?.percentUsed || 0)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {usage?.assets?.available === 'Unlimited'
                ? 'Unlimited serialized assets'
                : `${usage?.assets?.available} remaining asset tags`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. PLAN COMPARISON & UPGRADE GRID */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-white">Upgrade or Change Agency Plan</h3>
            <p className="text-xs text-slate-400">
              Increase technician seats, facility allocations, and automated alerts for your maintenance team.
            </p>
          </div>

          {/* Billing Cycle Switch */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                billingCycle === 'MONTHLY'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                billingCycle === 'ANNUAL'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-400 text-slate-950 font-black">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {availablePlans.map((p) => {
            const isCurrent = (subscription?.plan || 'BASIC') === p.id;
            const price = billingCycle === 'ANNUAL' ? p.priceAnnualMonthly : p.priceMonthly;
            const isPro = p.id === 'PRO';

            return (
              <div
                key={p.id}
                className={`tactile-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between h-full relative transition-all border ${
                  isCurrent
                    ? 'bg-slate-900/90 border-amber-500/70 ring-2 ring-amber-500/30 shadow-2xl'
                    : isPro
                    ? 'bg-slate-900/90 border-cyan-500/50 shadow-xl'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                {isPro && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-[#0077B6] text-navy-950 text-[10px] font-black uppercase tracking-wider shadow">
                    Most Popular for AMC Fleets
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                    Active Plan
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-black text-white">{p.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{p.tagline}</p>
                  </div>

                  <div className="pt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white tabular-nums tracking-tight">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">/ month</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {billingCycle === 'ANNUAL' ? 'Billed annually (Save 20%)' : 'Billed month-to-month'}
                  </p>

                  <div className="pt-4 border-t border-slate-800 space-y-2.5 text-xs text-slate-300">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Capacity & Limits:
                    </p>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        <strong>{p.maxTechnicians >= 999999 ? 'Unlimited' : p.maxTechnicians}</strong> Technician Accounts
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        <strong>{p.maxTowers >= 999999 ? 'Unlimited' : p.maxTowers}</strong> Buildings / Towers
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        <strong>{p.maxAssets >= 999999 ? 'Unlimited' : p.maxAssets.toLocaleString('en-IN')}</strong> Fire Safety Assets
                      </span>
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-2">
                      Features Included:
                    </p>
                    {p.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="text-slate-400">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 text-slate-400 cursor-default flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>Current Active Plan</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectPlan(p)}
                      disabled={updatingPlan === p.id}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                        isPro
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                          : 'bg-[#0077B6] hover:bg-[#023E8A] text-white'
                      }`}
                    >
                      {updatingPlan === p.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Switch to {p.name}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          CONFIRM DOWNGRADE MODAL
      ========================================================================= */}
      {confirmDowngradePlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Confirm Plan Downgrade</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to switch from <strong className="text-white">{currentPlan?.name}</strong> to{' '}
              <strong className="text-white">{confirmDowngradePlan.name}</strong>?
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Data Preservation Guarantee
              </p>
              <p>
                No technicians, buildings, or fire assets will ever be automatically deleted. If your current usage exceeds the {confirmDowngradePlan.name} limit, existing records remain active, but you will not be able to create new items until you reduce active seats or upgrade.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setConfirmDowngradePlan(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => executePlanChange(confirmDowngradePlan.id)}
                disabled={updatingPlan !== null}
                className="px-4 py-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
              >
                {updatingPlan ? 'Updating...' : `Confirm Switch to ${confirmDowngradePlan.name}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
