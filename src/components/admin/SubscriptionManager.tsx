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
      if (!res.ok) throw new Error(json.error || 'Failed to update subscription');

      showToast(`Subscription changed to ${json.plan.name} (${json.subscription.billingCycle})`);
      setConfirmDowngradePlan(null);
      fetchSubscription();
      if (onPlanChanged) onPlanChanged();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to update plan');
    } finally {
      setUpdatingPlan(null);
    }
  };

  if (loading && !subData) {
    return (
      <div className="p-8 text-center text-slate-500 space-y-3 dark:text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-[#007DB8] mx-auto" />
        <p className="text-sm font-semibold">Loading subscription status &amp; usage...</p>
      </div>
    );
  }

  const { subscription, usage, availablePlans } = subData || {
    subscription: { plan: 'BASIC', billingCycle: 'ANNUAL', status: 'ACTIVE' },
    usage: {},
    availablePlans: [],
  };

  const currentPlan = availablePlans?.find((p: any) => p.id === subscription?.plan);

  return (
    <div className="space-y-8">
      {/* 1. CURRENT SUBSCRIPTION OVERVIEW CARD */}
      <div className="rounded-2xl bg-white border border-[#DCE7F2] p-6 sm:p-8 shadow-sm space-y-6 dark:bg-slate-900/90 dark:border-slate-800 dark:shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#DCE7F2] dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#007DB8] bg-[#EAF6FF] px-3 py-1 rounded-full border border-[#007DB8]/30 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30">
                Current Agency Subscription
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">
                {subscription?.status || 'ACTIVE'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#023E8A] dark:text-white tracking-tight">
              {currentPlan?.name || 'Basic AMC Plan'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentPlan?.tagline || 'Standard compliance and maintenance operating system'}
            </p>
          </div>

          <div className="text-left md:text-right space-y-1">
            <div className="flex items-baseline md:justify-end gap-1 text-slate-900 dark:text-white">
              <span className="text-3xl sm:text-4xl font-black text-[#023E8A] dark:text-amber-400 tabular-nums">
                ₹{subscription?.amount ? subscription.amount.toLocaleString('en-IN') : '3,999'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">/ month</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center md:justify-end gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Renews on{' '}
                <strong className="text-slate-800 dark:text-slate-200">
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
          <div className="bg-slate-50 p-4 rounded-xl border border-[#DCE7F2] space-y-2  dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#007DB8]" />
                <span>Technician Accounts</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                {usage?.technicians?.active} / {usage?.technicians?.max}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
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
          <div className="bg-slate-50 p-4 rounded-xl border border-[#DCE7F2] space-y-2  dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#007DB8]" />
                <span>Buildings / Towers</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                {usage?.towers?.used} / {usage?.towers?.max}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  usage?.towers?.isAtLimit ? 'bg-amber-500' : 'bg-emerald-500'
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
          <div className="bg-slate-50 p-4 rounded-xl border border-[#DCE7F2] space-y-2  dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span>Fire Safety Assets</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                {usage?.assets?.used} / {usage?.assets?.max}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  usage?.assets?.isAtLimit ? 'bg-red-500' : 'bg-purple-500'
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
            <h3 className="text-xl font-black text-[#023E8A] dark:text-white">Upgrade or Change Agency Plan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Increase technician seats, facility allocations, and automated alerts for your maintenance team.
            </p>
          </div>

          {/* Billing Cycle Switch */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                billingCycle === 'MONTHLY'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-amber-500 '
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                billingCycle === 'ANNUAL'
                  ? 'bg-[#007DB8] text-white shadow-sm dark:bg-amber-500 '
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
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
          {availablePlans.map((p: any) => {
            const isCurrent = (subscription?.plan || 'BASIC') === p.id;
            const price = billingCycle === 'ANNUAL' ? p.priceAnnualMonthly : p.priceMonthly;
            const isPro = p.id === 'PRO';

            return (
              <div
                key={p.id}
                className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between h-full relative transition-all border ${
                  isCurrent
                    ? 'bg-white border-[#007DB8] ring-2 ring-[#007DB8]/20 shadow-md dark:bg-slate-900/90 dark:border-amber-500/70 dark:ring-amber-500/30'
                    : isPro
                    ? 'bg-white border-[#007DB8]/60 shadow-md dark:bg-slate-900/90 dark:border-cyan-500/50'
                    : 'bg-white border-[#DCE7F2] shadow-sm dark:bg-slate-900/60 dark:border-slate-800'
                }`}
              >
                {isPro && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#007DB8] to-[#073F8F] text-white text-[10px] font-black uppercase tracking-wider shadow">
                    Most Popular for AMC Fleets
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#007DB8] text-white text-[10px] font-black uppercase tracking-wider shadow dark:bg-amber-500 ">
                    Active Plan
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">{p.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">{p.tagline}</p>
                  </div>

                  <div className="pt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#023E8A] dark:text-white tabular-nums tracking-tight">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">/ month</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {billingCycle === 'ANNUAL' ? 'Billed annually (Save 20%)' : 'Billed month-to-month'}
                  </p>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Capacity &amp; Limits:
                    </p>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        <strong>{p.maxTechnicians >= 999999 ? 'Unlimited' : p.maxTechnicians}</strong> Technician Accounts
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        <strong>{p.maxTowers >= 999999 ? 'Unlimited' : p.maxTowers}</strong> Buildings / Towers
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        <strong>{p.maxAssets >= 999999 ? 'Unlimited' : p.maxAssets.toLocaleString('en-IN')}</strong> Fire Safety Assets
                      </span>
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-2">
                      Features Included:
                    </p>
                    {p.features.map((feat: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#007DB8] shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-400">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 text-slate-500 cursor-default flex items-center justify-center gap-1.5 dark:bg-slate-800 dark:text-slate-400"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#007DB8] dark:text-amber-400" />
                      <span>Current Active Plan</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectPlan(p)}
                      disabled={updatingPlan === p.id}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#007DB8] to-[#073F8F] hover:from-[#006494] hover:to-[#011F48] text-white"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCE7F2] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirm Plan Downgrade</h3>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Are you sure you want to switch from <strong className="text-slate-900 dark:text-white">{currentPlan?.name}</strong> to{' '}
              <strong className="text-slate-900 dark:text-white">{confirmDowngradePlan.name}</strong>?
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-[#DCE7F2] text-xs text-slate-600  dark:border-slate-800 dark:text-slate-400 space-y-2">
              <p className="font-semibold text-slate-900 dark:text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Data Preservation Guarantee
              </p>
              <p>
                No technicians, buildings, or fire assets will ever be automatically deleted. If your current usage exceeds the {confirmDowngradePlan.name} limit, existing records remain active, but you will not be able to create new items until you reduce active seats or upgrade.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setConfirmDowngradePlan(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold dark:text-slate-400 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => executePlanChange(confirmDowngradePlan.id)}
                disabled={updatingPlan !== null}
                className="px-4 py-2 rounded-xl font-bold bg-[#007DB8] hover:bg-[#073F8F] text-white transition-colors"
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
