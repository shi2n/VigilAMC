'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Session, User } from '@supabase/supabase-js';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Flame,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Tag,
  TicketPercent,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase as otpSupabase } from '@/lib/supabase';
import { createClient as createSsrBrowserClient } from '@/lib/supabase/client';
import { EmailOtpAuth } from '@/components/EmailOtpAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  SUBSCRIPTION_PLANS,
  calculateCouponDiscount,
  formatInr,
  getAuthoritativeBaseAmount,
  getSubscriptionPlan,
  type AppliedCouponInfo,
  type BillingCycle,
  type PrepareCheckoutResponse,
  type PrepareCheckoutSuccessResponse,
  type SubscriptionPlanId,
} from '@/lib/pricing';
import { SITE_CONFIG } from '@/lib/siteConfig';

const PENDING_CHECKOUT_STORAGE_KEY = 'vigilamc_pending_checkout';

interface PendingCheckoutPayload {
  planId: SubscriptionPlanId;
  billingCycle: BillingCycle;
  couponCode: string;
  intent: 'checkout' | 'apply-coupon';
}

interface ComparisonRow {
  label: string;
  sublabel?: string;
  basic: string | boolean;
  pro: string | boolean;
  advanced: string | boolean;
}

const COMPARISON_ROWS: readonly ComparisonRow[] = [
  {
    label: 'Monthly price',
    basic: '₹1,400 / month',
    pro: '₹2,500 / month',
    advanced: '₹4,000 / month',
  },
  {
    label: 'Yearly billing (per month)',
    basic: '₹1,200 / month',
    pro: '₹2,200 / month',
    advanced: '₹3,799 / month',
  },
  {
    label: 'Yearly total billed upfront',
    basic: '₹14,400 / year',
    pro: '₹26,400 / year',
    advanced: '₹45,588 / year',
  },
  {
    label: 'Buildings',
    basic: 'Up to 10',
    pro: 'Up to 50',
    advanced: 'Unlimited',
  },
  {
    label: 'Assets',
    basic: 'Up to 100',
    pro: 'Up to 500',
    advanced: 'Unlimited',
  },
  {
    label: 'Technicians',
    basic: '2',
    pro: '10',
    advanced: 'Unlimited',
  },
  {
    label: 'Email reports (per month)',
    sublabel: 'Resets each month',
    basic: '20',
    pro: '50',
    advanced: '300',
  },
  {
    label: 'WhatsApp reports (per month)',
    sublabel: 'Resets each month',
    basic: false,
    pro: '10',
    advanced: '100',
  },
  {
    label: 'Messaging option',
    basic: false,
    pro: true,
    advanced: true,
  },
  {
    label: 'Client portal',
    basic: false,
    pro: true,
    advanced: true,
  },
];

function savePendingCheckout(payload: PendingCheckoutPayload | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!payload) {
      window.sessionStorage.removeItem(PENDING_CHECKOUT_STORAGE_KEY);
    } else {
      window.sessionStorage.setItem(
        PENDING_CHECKOUT_STORAGE_KEY,
        JSON.stringify(payload)
      );
    }
  } catch {
    // Ignore storage quota / private-mode restrictions; React state retains payload
  }
}

function readPendingCheckout(): PendingCheckoutPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_CHECKOUT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingCheckoutPayload>;
    if (
      (parsed.planId === 'basic' ||
        parsed.planId === 'pro' ||
        parsed.planId === 'advanced') &&
      (parsed.billingCycle === 'monthly' || parsed.billingCycle === 'yearly')
    ) {
      return {
        planId: parsed.planId,
        billingCycle: parsed.billingCycle,
        couponCode: typeof parsed.couponCode === 'string' ? parsed.couponCode : '',
        intent: parsed.intent === 'apply-coupon' ? 'apply-coupon' : 'checkout',
      };
    }
  } catch {
    // Ignore malformed storage values
  }
  return null;
}

export default function PricingPage() {
  const ssrSupabase = useMemo(() => createSsrBrowserClient(), []);

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>('pro');

  // Auth session state
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);
  const [signingOut, setSigningOut] = useState<boolean>(false);

  // Coupon UI state
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponInfo | null>(null);
  const [couponLoading, setCouponLoading] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Checkout preparation state
  const [checkoutLoadingPlan, setCheckoutLoadingPlan] =
    useState<SubscriptionPlanId | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [preparedCheckout, setPreparedCheckout] =
    useState<PrepareCheckoutSuccessResponse | null>(null);
  const [checkoutSummaryOpen, setCheckoutSummaryOpen] = useState<boolean>(false);

  // OTP Modal state
  const [otpModalOpen, setOtpModalOpen] = useState<boolean>(false);
  const [pendingCheckout, setPendingCheckout] =
    useState<PendingCheckoutPayload | null>(null);

  /**
   * Checks active Supabase session across both the Email OTP client (`@/lib/supabase`)
   * and the SSR browser client (`@/lib/supabase/client`).
   */
  const getActiveSession = useCallback(async (): Promise<Session | null> => {
    try {
      const { data: otpData } = await otpSupabase.auth.getSession();
      if (otpData.session?.access_token) {
        return otpData.session;
      }
    } catch {
      // Fallback to SSR client below
    }

    try {
      const { data: ssrData } = await ssrSupabase.auth.getSession();
      if (ssrData.session?.access_token) {
        return ssrData.session;
      }
    } catch {
      // No active session
    }

    return null;
  }, [ssrSupabase]);

  // Hydrate auth session and any pending selection on mount
  useEffect(() => {
    let active = true;

    const restored = readPendingCheckout();
    if (restored) {
      setSelectedPlanId(restored.planId);
      setBillingCycle(restored.billingCycle);
      if (restored.couponCode) {
        setCouponInput(restored.couponCode);
      }
    }

    async function hydrateSession() {
      try {
        const session = await getActiveSession();
        if (active) {
          setSessionUser(session?.user ?? null);
        }
      } catch {
        if (active) setSessionUser(null);
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    hydrateSession();

    const { data: authListener } = otpSupabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (active) {
          setSessionUser(nextSession?.user ?? null);
        }
      }
    );

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [getActiveSession]);

  /**
   * Authoritative server call to POST /api/prepare-checkout with Bearer JWT.
   */
  const executePrepareCheckout = useCallback(
    async (
      params: {
        planId: SubscriptionPlanId;
        billingCycle: BillingCycle;
        couponCode: string;
        intent: 'checkout' | 'apply-coupon';
      },
      accessToken: string
    ) => {
      const normalizedCode = params.couponCode.trim().toUpperCase();
      setCheckoutError(null);

      if (params.intent === 'apply-coupon') {
        setCouponLoading(true);
        setCouponError(null);
        setCouponSuccess(null);
      } else {
        setCheckoutLoadingPlan(params.planId);
        setCouponError(null);
      }

      try {
        const res = await fetch('/api/prepare-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            planId: params.planId,
            billingCycle: params.billingCycle,
            couponCode: normalizedCode || null,
          }),
        });

        const data = (await res
          .json()
          .catch(() => null)) as PrepareCheckoutResponse | null;

        if (res.status === 401) {
          // Session expired or invalid -> prompt Email OTP cleanly without silent loops
          setSessionUser(null);
          const pending: PendingCheckoutPayload = {
            planId: params.planId,
            billingCycle: params.billingCycle,
            couponCode: normalizedCode,
            intent: params.intent,
          };
          setPendingCheckout(pending);
          savePendingCheckout(pending);
          setOtpModalOpen(true);
          const authMsg =
            data && !data.valid && data.message
              ? data.message
              : 'Your session expired. Please verify your email with a 6-digit OTP.';
          toast.error(authMsg);
          return;
        }

        if (!res.ok || !data) {
          const errMsg =
            data && !data.valid && data.message
              ? data.message
              : 'Could not prepare checkout right now. Please try again.';
          if (params.intent === 'apply-coupon') {
            setAppliedCoupon(null);
            setCouponError(errMsg);
          } else {
            setCheckoutError(errMsg);
          }
          toast.error(errMsg);
          return;
        }

        if (!data.valid) {
          const invalidMsg = data.message || 'Invalid coupon code.';
          if (normalizedCode) {
            setAppliedCoupon(null);
            setCouponError(invalidMsg);
            setCouponSuccess(null);
          }
          if (params.intent === 'checkout') {
            setCheckoutError(invalidMsg);
          }
          toast.error(invalidMsg);
          return;
        }

        // Server validated successfully
        setSelectedPlanId(data.planId);
        setBillingCycle(data.billingCycle);

        if (data.appliedCoupon) {
          setAppliedCoupon(data.appliedCoupon);
          setCouponInput(data.appliedCoupon.code);
          const discountLabel =
            data.appliedCoupon.discountType === 'percentage'
              ? `${data.appliedCoupon.discountValue}% off`
              : `${formatInr(data.appliedCoupon.discountValue)} off`;
          const successMsg = `Coupon ${data.appliedCoupon.code} applied (${discountLabel}, saving ${formatInr(data.discountAmount)}).`;
          setCouponSuccess(successMsg);
          setCouponError(null);
          if (params.intent === 'apply-coupon') {
            toast.success(successMsg);
          }
        } else if (!normalizedCode) {
          setAppliedCoupon(null);
        }

        savePendingCheckout(null);
        setPendingCheckout(null);

        if (params.intent === 'checkout') {
          setPreparedCheckout(data);
          setCheckoutSummaryOpen(true);
          toast.success(
            `${getSubscriptionPlan(data.planId).name} plan checkout prepared (${formatInr(data.finalAmount)}).`
          );
        }
      } catch {
        const netMsg =
          'Network error while contacting checkout validation service. Please check your connection and try again.';
        if (params.intent === 'apply-coupon') {
          setCouponError(netMsg);
        } else {
          setCheckoutError(netMsg);
        }
        toast.error(netMsg);
      } finally {
        setCouponLoading(false);
        setCheckoutLoadingPlan(null);
      }
    },
    []
  );

  /**
   * Triggered when user clicks "Choose Basic / Pro / Advanced" or the Order Summary CTA.
   */
  const handleSelectPlanForCheckout = useCallback(
    async (planId: SubscriptionPlanId) => {
      setSelectedPlanId(planId);
      setCheckoutError(null);

      const effectiveCouponCode = (
        appliedCoupon?.code ||
        couponInput.trim()
      ).toUpperCase();

      const session = await getActiveSession();
      if (!session?.access_token) {
        const pending: PendingCheckoutPayload = {
          planId,
          billingCycle,
          couponCode: effectiveCouponCode,
          intent: 'checkout',
        };
        setPendingCheckout(pending);
        savePendingCheckout(pending);
        setOtpModalOpen(true);
        return;
      }

      setSessionUser(session.user ?? null);
      await executePrepareCheckout(
        {
          planId,
          billingCycle,
          couponCode: effectiveCouponCode,
          intent: 'checkout',
        },
        session.access_token
      );
    },
    [
      appliedCoupon,
      billingCycle,
      couponInput,
      executePrepareCheckout,
      getActiveSession,
    ]
  );

  /**
   * Triggered when user submits the "Have a coupon code?" Apply button.
   */
  const handleApplyCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    const normalizedCode = couponInput.trim().toUpperCase();
    if (!normalizedCode) {
      const msg = 'Please enter a coupon code before applying.';
      setCouponError(msg);
      toast.error(msg);
      return;
    }

    setCouponInput(normalizedCode);

    const session = await getActiveSession();
    if (!session?.access_token) {
      const pending: PendingCheckoutPayload = {
        planId: selectedPlanId,
        billingCycle,
        couponCode: normalizedCode,
        intent: 'apply-coupon',
      };
      setPendingCheckout(pending);
      savePendingCheckout(pending);
      setOtpModalOpen(true);
      toast.info(
        `Verify your email with a 6-digit OTP to validate coupon ${normalizedCode}.`
      );
      return;
    }

    setSessionUser(session.user ?? null);
    await executePrepareCheckout(
      {
        planId: selectedPlanId,
        billingCycle,
        couponCode: normalizedCode,
        intent: 'apply-coupon',
      },
      session.access_token
    );
  };

  const handleRemoveCoupon = () => {
    const removedCode = appliedCoupon?.code;
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
    setCouponSuccess(null);
    setCheckoutError(null);
    savePendingCheckout(null);
    toast.success(
      removedCode ? `Coupon ${removedCode} removed.` : 'Coupon removed.'
    );
  };

  /**
   * Called automatically when EmailOtpAuth verifies the 6-digit OTP inside the modal.
   */
  const handleOtpVerified = async (session: Session, user: User | null) => {
    const activeUser = user ?? session.user ?? null;
    setSessionUser(activeUser);

    // Non-blocking sync to SSR cookie client so /dashboard stays signed in too
    try {
      await ssrSupabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
    } catch {
      // Non-blocking: Bearer JWT continues directly below
    }

    const toResume = pendingCheckout ?? readPendingCheckout();
    setOtpModalOpen(false);

    if (toResume) {
      await executePrepareCheckout(toResume, session.access_token);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await Promise.allSettled([
        otpSupabase.auth.signOut(),
        ssrSupabase.auth.signOut(),
      ]);
      setSessionUser(null);
      setPreparedCheckout(null);
      setCheckoutSummaryOpen(false);
      toast.success('Signed out successfully.');
    } catch {
      toast.error('Could not sign out right now. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  // Dynamic calculation for selected plan & billing cycle
  const selectedPlan = getSubscriptionPlan(selectedPlanId);
  const selectedBaseAmount = getAuthoritativeBaseAmount(
    selectedPlanId,
    billingCycle
  );
  const { discountAmount: selectedDiscountAmount, finalAmount: selectedFinalAmount } =
    appliedCoupon
      ? calculateCouponDiscount(
          selectedBaseAmount,
          appliedCoupon.discountType,
          appliedCoupon.discountValue
        )
      : { discountAmount: 0, finalAmount: selectedBaseAmount };

  const activeCouponLabel = appliedCoupon
    ? appliedCoupon.discountType === 'percentage'
      ? `${appliedCoupon.discountValue}% off`
      : `${formatInr(appliedCoupon.discountValue)} off`
    : null;

  return (
    <div className="w-full bg-white text-[#1C1917] relative overflow-x-hidden">
      {/* ============================================================
          HERO + BILLING TOGGLE
      ============================================================ */}
      <section className="relative bg-gradient-to-b from-[#FFF8F2] via-[#FFFBF7] to-white pt-14 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-8 border-b border-[#FED7AA]/60 overflow-hidden">
        {/* Subtle ember radial glow behind header */}
        <div
          aria-hidden="true"
          className="ember-glow-plane absolute -top-24 left-1/2 -translate-x-1/2 w-[540px] h-[280px] rounded-full"
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#FED7AA] text-[#C2410C] text-xs font-extrabold uppercase tracking-widest shadow-sm">
            <Flame className="w-3.5 h-3.5 text-[#EA580C]" aria-hidden="true" />
            <span>Transparent INR Pricing</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-black text-[#1C1917] tracking-[-0.03em] mt-4 text-balance">
            Simple Plans for Modern Fire Safety AMC Teams
          </h1>

          <p className="mt-4 text-sm sm:text-lg text-[#44403C] leading-relaxed max-w-2xl mx-auto text-pretty">
            Track buildings, fire safety assets, field technicians, GPS photo-proof inspections, and monthly compliance reports with predictable pricing in Indian Rupees.
          </p>

          {/* Signed-in indicator pill */}
          {!checkingSession && sessionUser?.email && (
            <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2.5 px-4 py-2 rounded-full bg-white/90 border border-[#FED7AA] shadow-xs text-xs text-[#44403C]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#1C1917]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                Signed in as {sessionUser.email}
              </span>
              <span className="text-[#FED7AA]" aria-hidden="true">
                |
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="inline-flex items-center gap-1 font-bold text-[#C2410C] hover:text-[#9A3412] hover:underline disabled:opacity-50 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{signingOut ? 'Signing out...' : 'Sign out'}</span>
              </button>
            </div>
          )}

          {/* Monthly vs Yearly Billing Toggle */}
          <div className="mt-8 flex flex-col items-center gap-2.5">
            <div
              role="radiogroup"
              aria-label="Billing cycle"
              data-testid="billing-cycle-toggle"
              className="inline-flex items-center p-1.5 rounded-2xl bg-[#FFF0E6] border border-[#FED7AA] shadow-sm"
            >
              <button
                type="button"
                role="radio"
                aria-checked={billingCycle === 'monthly'}
                data-testid="billing-monthly-btn"
                onClick={() => setBillingCycle('monthly')}
                className={`min-h-[44px] px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-[#1C1917] shadow-sm'
                    : 'text-[#44403C] hover:text-[#1C1917]'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={billingCycle === 'yearly'}
                data-testid="billing-yearly-btn"
                onClick={() => setBillingCycle('yearly')}
                className={`min-h-[44px] px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] ${
                  billingCycle === 'yearly'
                    ? 'bg-[#EA580C] text-white shadow-md'
                    : 'text-[#44403C] hover:text-[#1C1917]'
                }`}
              >
                <span>Yearly</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                    billingCycle === 'yearly'
                      ? 'bg-white/20 text-white'
                      : 'bg-[#FFF8F2] text-[#C2410C] border border-[#FED7AA]'
                  }`}
                >
                  Save up to ₹300/mo
                </span>
              </button>
            </div>

            <p className="text-xs text-[#44403C]">
              {billingCycle === 'yearly'
                ? 'Yearly plans are billed upfront for 12 months at the discounted monthly rate.'
                : 'Switch to Yearly billing to save ₹200–₹300 every month.'}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          PLAN CARDS GRID
      ============================================================ */}
      <section className="relative py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {checkoutError && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-8 max-w-3xl mx-auto p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs sm:text-sm flex items-start gap-3 shadow-xs"
          >
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{checkoutError}</p>
            </div>
            <button
              type="button"
              onClick={() => setCheckoutError(null)}
              aria-label="Dismiss error"
              className="text-[#B91C1C] hover:text-[#991B1B] p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 lg:gap-8 items-stretch">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isPopular = Boolean(plan.mostPopular);
            const isSelected = selectedPlanId === plan.id;
            const isLoadingThisPlan = checkoutLoadingPlan === plan.id;

            const displayMonthlyRate =
              billingCycle === 'yearly'
                ? plan.yearlyMonthlyRate
                : plan.monthlyPrice;
            const planBaseAmount = getAuthoritativeBaseAmount(
              plan.id,
              billingCycle
            );
            const planDiscount = appliedCoupon
              ? calculateCouponDiscount(
                  planBaseAmount,
                  appliedCoupon.discountType,
                  appliedCoupon.discountValue
                )
              : { discountAmount: 0, finalAmount: planBaseAmount };

            return (
              <div
                key={plan.id}
                data-testid={`plan-card-${plan.id}`}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all cursor-pointer ${
                  isPopular
                    ? 'bg-white border-2 border-[#EA580C] shadow-[0_24px_60px_-20px_rgba(234,88,12,0.22)] ring-4 ring-[#EA580C]/10'
                    : isSelected
                    ? 'glass-panel-dense bg-white border-2 border-[#FF8C42] shadow-card-hover'
                    : 'glass-panel-dense bg-white border border-[#FED7AA]/80 shadow-card hover:border-[#EA580C]/50 hover:shadow-card-hover'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1.5 whitespace-nowrap">
                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  {/* Plan Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-2xl font-extrabold text-[#1C1917] tracking-tight">
                        {plan.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#44403C] mt-1">
                        {plan.tagline}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-[#C2410C] text-[10px] font-bold uppercase tracking-wider">
                        Selected
                      </span>
                    )}
                  </div>

                  {/* Price Block */}
                  <div className="mt-6 pb-6 border-b border-[#FED7AA]/50">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-display text-4xl font-black text-[#1C1917] tabular-nums tracking-tight">
                        {formatInr(displayMonthlyRate)}
                      </span>
                      <span className="text-xs sm:text-sm text-[#44403C] font-medium">
                        / month
                      </span>
                      {billingCycle === 'yearly' && (
                        <span className="text-sm text-[#64748B] line-through tabular-nums ml-1">
                          {formatInr(plan.monthlyPrice)}
                        </span>
                      )}
                    </div>

                    {billingCycle === 'yearly' ? (
                      <div className="mt-2.5 space-y-1.5">
                        <p className="text-xs font-semibold text-[#1C1917] tabular-nums">
                          {formatInr(plan.yearlyTotalPrice)} billed yearly
                        </p>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-bold tabular-nums">
                          <Check className="w-3.5 h-3.5 text-[#059669]" />
                          <span>
                            Save {formatInr(plan.monthlySavingsOnYearly)}/mo (
                            {formatInr(plan.annualSavingsOnYearly)}/yr)
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-[#64748B] font-medium">
                        Billed monthly · Save{' '}
                        <span className="font-bold text-[#C2410C]">
                          {formatInr(plan.monthlySavingsOnYearly)}/mo
                        </span>{' '}
                        with yearly billing
                      </p>
                    )}

                    {/* Live coupon preview pill on each card when a coupon is active */}
                    {appliedCoupon && planDiscount.discountAmount > 0 && (
                      <div className="mt-3 p-2.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs">
                        <div className="flex items-center justify-between gap-2 text-[#047857]">
                          <span className="font-bold inline-flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-[#059669]" />
                            {appliedCoupon.code} applied
                          </span>
                          <span className="font-extrabold tabular-nums">
                            -{formatInr(planDiscount.discountAmount)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[#1C1917]">
                          <span className="text-[11px] text-[#44403C]">
                            Final payable ({billingCycle}):
                          </span>
                          <span className="font-extrabold tabular-nums">
                            {formatInr(planDiscount.finalAmount)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Exact Quotas & Feature Checklist */}
                  <ul className="mt-6 space-y-3 text-xs sm:text-sm text-[#44403C]">
                    <li className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2">
                        <Building2
                          className="w-4 h-4 text-[#EA580C] shrink-0"
                          aria-hidden="true"
                        />
                        <span>Buildings</span>
                      </span>
                      <span className="font-bold text-[#1C1917]">
                        {plan.limits.buildings}
                      </span>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2">
                        <ShieldCheck
                          className="w-4 h-4 text-[#EA580C] shrink-0"
                          aria-hidden="true"
                        />
                        <span>Assets</span>
                      </span>
                      <span className="font-bold text-[#1C1917]">
                        {plan.limits.assets}
                      </span>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2">
                        <Users
                          className="w-4 h-4 text-[#EA580C] shrink-0"
                          aria-hidden="true"
                        />
                        <span>Technicians</span>
                      </span>
                      <span className="font-bold text-[#1C1917]">
                        {plan.limits.technicians}
                      </span>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2">
                        <Mail
                          className="w-4 h-4 text-[#EA580C] shrink-0"
                          aria-hidden="true"
                        />
                        <span>Email reports / mo</span>
                      </span>
                      <span className="font-bold text-[#1C1917] tabular-nums">
                        {plan.limits.emailReportsPerMonth}
                      </span>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2">
                        <MessageSquare
                          className={`w-4 h-4 shrink-0 ${
                            plan.limits.whatsappReportsPerMonth !== null
                              ? 'text-[#059669]'
                              : 'text-[#64748B]'
                          }`}
                          aria-hidden="true"
                        />
                        <span>WhatsApp reports / mo</span>
                      </span>
                      <span
                        className={`font-bold tabular-nums ${
                          plan.limits.whatsappReportsPerMonth !== null
                            ? 'text-[#1C1917]'
                            : 'text-[#64748B] font-medium'
                        }`}
                      >
                        {plan.limits.whatsappReportsPerMonth !== null
                          ? plan.limits.whatsappReportsPerMonth
                          : 'Not included'}
                      </span>
                    </li>
                    <li className="flex items-center justify-between gap-2 pt-2 border-t border-[#FED7AA]/40">
                      <span>Messaging option</span>
                      {plan.limits.messagingIncluded ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[#059669]">
                          <Check className="w-4 h-4" aria-hidden="true" />
                          <span>Included</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#64748B] font-medium">
                          <X className="w-4 h-4" aria-hidden="true" />
                          <span>Not included</span>
                        </span>
                      )}
                    </li>
                    <li className="flex items-center justify-between gap-2">
                      <span>Client portal</span>
                      {plan.limits.clientPortalIncluded ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[#059669]">
                          <Check className="w-4 h-4" aria-hidden="true" />
                          <span>Included</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#64748B] font-medium">
                          <X className="w-4 h-4" aria-hidden="true" />
                          <span>Not included</span>
                        </span>
                      )}
                    </li>
                  </ul>
                </div>

                {/* Plan CTA Button */}
                <div className="mt-8 pt-5 border-t border-[#FED7AA]/50">
                  <button
                    type="button"
                    data-testid={`choose-plan-${plan.id}`}
                    disabled={checkoutLoadingPlan !== null}
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleSelectPlanForCheckout(plan.id);
                    }}
                    className={`w-full min-h-[48px] py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C] ${
                      isPopular
                        ? 'bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white shadow-[0_8px_24px_-6px_rgba(234,88,12,0.45)]'
                        : 'bg-[#FFF4EC] hover:bg-[#EA580C] text-[#C2410C] hover:text-white border border-[#FED7AA] hover:border-[#EA580C]'
                    }`}
                  >
                    {isLoadingThisPlan ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Preparing checkout...</span>
                      </>
                    ) : (
                      <>
                        <span>{plan.ctaLabel}</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                  <p className="mt-2 text-center text-[11px] text-[#64748B] flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3 text-[#EA580C]" aria-hidden="true" />
                    <span>
                      {sessionUser
                        ? 'Instant server-verified checkout'
                        : 'Secured by 6-digit Email OTP login'}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ============================================================
            COUPON CODE & LIVE PAYABLE SUMMARY PANEL
        ============================================================ */}
        <div
          data-testid="coupon-summary-panel"
          className="mt-12 relative rounded-3xl glass-panel-dense bg-[#FFF8F2]/90 border border-[#FED7AA] p-6 sm:p-8 shadow-elevated overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Coupon Input & Controls */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center text-[#EA580C]">
                  <TicketPercent className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#1C1917]">
                    Have a coupon code?
                  </h2>
                  <p className="text-xs text-[#44403C]">
                    Apply a promo or partner code to recalculate your payable total server-side.
                  </p>
                </div>
              </div>

              {/* Quick Plan Selector for Live Calculation */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#44403C] uppercase tracking-wider mr-1">
                  Previewing plan:
                </span>
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedPlanId === plan.id
                        ? 'bg-[#EA580C] text-white shadow-xs'
                        : 'bg-white text-[#44403C] border border-[#FED7AA] hover:border-[#EA580C] hover:text-[#C2410C]'
                    }`}
                  >
                    {plan.name}
                  </button>
                ))}
              </div>

              <form
                onSubmit={handleApplyCoupon}
                className="flex flex-col sm:flex-row gap-3"
                noValidate
              >
                <div className="relative flex-1">
                  <Tag
                    className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="pricing-coupon-input"
                    data-testid="coupon-code-input"
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      if (couponError) setCouponError(null);
                    }}
                    disabled={couponLoading}
                    placeholder="Enter coupon code (e.g. LAUNCH20)"
                    autoComplete="off"
                    aria-label="Coupon code"
                    className="w-full min-h-[46px] pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#FED7AA] text-sm font-mono font-bold tracking-wider uppercase text-[#1C1917] placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:normal-case placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent disabled:opacity-60"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="submit"
                    data-testid="apply-coupon-btn"
                    disabled={couponLoading || !couponInput.trim()}
                    className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:opacity-55 text-white text-sm font-bold shadow-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {couponLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Applying...</span>
                      </>
                    ) : (
                      <span>Apply</span>
                    )}
                  </button>

                  {appliedCoupon && (
                    <button
                      type="button"
                      data-testid="remove-coupon-btn"
                      onClick={handleRemoveCoupon}
                      disabled={couponLoading}
                      className="min-h-[46px] px-4 py-2.5 rounded-xl bg-white hover:bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm font-bold transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </form>

              {/* Inline Coupon Validation Feedback */}
              {couponError && (
                <div
                  role="alert"
                  aria-live="polite"
                  data-testid="coupon-error-msg"
                  className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                  <span>{couponError}</span>
                </div>
              )}

              {couponSuccess && appliedCoupon && (
                <div
                  role="status"
                  aria-live="polite"
                  data-testid="coupon-success-msg"
                  className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-xs flex items-center justify-between gap-2 flex-wrap"
                >
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                    <span>{couponSuccess}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#A7F3D0] text-[#047857] font-mono text-[11px] font-bold">
                    {appliedCoupon.code}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Live Payable Breakdown Card */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#FED7AA] p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#FED7AA]/50">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#C2410C]">
                    Payable Breakdown
                  </p>
                  <h3 className="font-display text-base font-extrabold text-[#1C1917]">
                    {selectedPlan.name} Plan ·{' '}
                    {billingCycle === 'yearly' ? 'Yearly Billing' : 'Monthly Billing'}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[#FFF4EC] border border-[#FED7AA] text-[#C2410C] text-[11px] font-bold uppercase">
                  INR (₹)
                </span>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between text-[#44403C]">
                  <span>
                    Original payable amount{' '}
                    <span className="text-xs text-[#64748B]">
                      ({billingCycle === 'yearly' ? '12 months' : '1 month'})
                    </span>
                  </span>
                  <span
                    data-testid="summary-base-amount"
                    className="font-bold text-[#1C1917] tabular-nums"
                  >
                    {formatInr(selectedBaseAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#44403C]">
                  <span className="inline-flex items-center gap-1.5">
                    <span>Coupon discount</span>
                    {appliedCoupon && activeCouponLabel && (
                      <span className="px-1.5 py-0.5 rounded bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[10px] font-bold">
                        {appliedCoupon.code} · {activeCouponLabel}
                      </span>
                    )}
                  </span>
                  <span
                    data-testid="summary-discount-amount"
                    className={`font-bold tabular-nums ${
                      selectedDiscountAmount > 0
                        ? 'text-[#059669]'
                        : 'text-[#64748B]'
                    }`}
                  >
                    {selectedDiscountAmount > 0
                      ? `-${formatInr(selectedDiscountAmount)}`
                      : '₹0'}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#FED7AA]/60 flex items-baseline justify-between">
                  <span className="font-display font-extrabold text-[#1C1917]">
                    Final payable amount
                  </span>
                  <span
                    data-testid="summary-final-amount"
                    className="font-display text-2xl font-black text-[#EA580C] tabular-nums"
                  >
                    {formatInr(selectedFinalAmount)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                data-testid="summary-checkout-btn"
                disabled={checkoutLoadingPlan !== null}
                onClick={() => void handleSelectPlanForCheckout(selectedPlanId)}
                className="w-full min-h-[46px] py-2.5 px-4 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:opacity-60 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {checkoutLoadingPlan === selectedPlanId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing checkout...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {selectedPlan.ctaLabel}: {formatInr(selectedFinalAmount)}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FULL FEATURE COMPARISON TABLE
      ============================================================ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FFF8F2] border-y border-[#FED7AA]/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#FED7AA] text-[#C2410C] text-[11px] font-bold uppercase tracking-wider">
              Side-by-Side Breakdown
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight mt-3">
              Full Feature &amp; Limit Comparison
            </h2>
            <p className="text-sm text-[#44403C] mt-2">
              Compare every quota across Basic, Pro, and Advanced. Monthly email and WhatsApp report limits reset each month.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl bg-white border border-[#FED7AA] shadow-card">
            <table
              data-testid="pricing-comparison-table"
              className="w-full min-w-[640px] text-left text-xs sm:text-sm border-collapse"
            >
              <thead>
                <tr className="bg-[#FFF4EC] border-b border-[#FED7AA]">
                  <th className="py-4 px-5 sm:px-6 font-display font-bold text-[#1C1917]">
                    Feature / Limit
                  </th>
                  <th className="py-4 px-5 sm:px-6 font-display font-bold text-[#1C1917]">
                    Basic
                  </th>
                  <th className="py-4 px-5 sm:px-6 font-display font-extrabold text-[#C2410C] bg-[#FFF0E6]/80">
                    <span className="inline-flex items-center gap-1.5">
                      <span>Pro</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#EA580C] text-white text-[10px] font-bold uppercase">
                        Most Popular
                      </span>
                    </span>
                  </th>
                  <th className="py-4 px-5 sm:px-6 font-display font-bold text-[#1C1917]">
                    Advanced
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FED7AA]/40 text-[#44403C]">
                {COMPARISON_ROWS.map((row) => (
                  <tr
                    key={row.label}
                    className="hover:bg-[#FFF8F2]/70 transition-colors"
                  >
                    <td className="py-3.5 px-5 sm:px-6 font-semibold text-[#1C1917]">
                      <div>{row.label}</div>
                      {row.sublabel && (
                        <div className="text-[11px] font-normal text-[#64748B]">
                          {row.sublabel}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 sm:px-6 tabular-nums">
                      <ComparisonCell value={row.basic} />
                    </td>
                    <td className="py-3.5 px-5 sm:px-6 bg-[#FFF8F2]/60 font-semibold text-[#1C1917] tabular-nums">
                      <ComparisonCell value={row.pro} highlight />
                    </td>
                    <td className="py-3.5 px-5 sm:px-6 font-semibold text-[#1C1917] tabular-nums">
                      <ComparisonCell value={row.advanced} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Monthly Report Reset Notice */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs sm:text-sm text-[#44403C] bg-white border border-[#FED7AA]/80 rounded-2xl px-4 py-3 shadow-xs">
            <RefreshCw
              className="w-4 h-4 text-[#EA580C] shrink-0"
              aria-hidden="true"
            />
            <p>
              <strong className="text-[#1C1917]">Monthly Quota Reset:</strong>{' '}
              Email report and WhatsApp report limits reset each month on your billing cycle date. Unused monthly report credits do not roll over.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          STATUTORY COMPLIANCE NOTE
      ============================================================ */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8F2] border border-[#FED7AA] text-xs text-[#44403C] flex items-start gap-3">
          <AlertTriangle
            className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="leading-relaxed">
            <strong className="text-[#1C1917]">Statutory Compliance Note:</strong>{' '}
            VigilAMC subscriptions provide fire safety AMC tracking, GPS &amp; Asset Tag ID inspections, photo-proof storage, and compliance report generation. They do not replace licensed fire safety inspection services or municipal statutory sign-off.
          </p>
        </div>
      </section>

      {/* ============================================================
          6-DIGIT EMAIL OTP LOGIN MODAL (GATED CHECKOUT)
      ============================================================ */}
      <Dialog
        open={otpModalOpen}
        onOpenChange={(open) => {
          setOtpModalOpen(open);
        }}
      >
        <DialogContent
          data-testid="pricing-otp-modal"
          className="max-w-md bg-white border border-[#FED7AA] rounded-3xl p-6"
        >
          <DialogHeader>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-[#C2410C] text-[10px] font-bold uppercase tracking-wider w-fit">
              <Lock className="w-3 h-3" aria-hidden="true" />
              <span>6-Digit Email OTP</span>
            </div>
            <DialogTitle className="font-display text-xl font-extrabold text-[#1C1917] pt-1">
              Verify your email to continue
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-[#44403C]">
              {pendingCheckout?.intent === 'apply-coupon'
                ? `Sign in with a 6-digit Email OTP to validate coupon ${pendingCheckout.couponCode} and see your live discounted price.`
                : `Sign in with a 6-digit Email OTP to lock in your ${getSubscriptionPlan(
                    pendingCheckout?.planId ?? selectedPlanId
                  ).name} (${
                    (pendingCheckout?.billingCycle ?? billingCycle) === 'yearly'
                      ? 'Yearly'
                      : 'Monthly'
                  }) checkout quote.`}
            </DialogDescription>
          </DialogHeader>

          {/* Selected Plan Recap Banner */}
          {pendingCheckout && (
            <div className="p-3 rounded-2xl bg-[#FFF8F2] border border-[#FED7AA] flex items-center justify-between gap-2 text-xs">
              <div>
                <p className="font-bold text-[#1C1917]">
                  {getSubscriptionPlan(pendingCheckout.planId).name} Plan ·{' '}
                  {pendingCheckout.billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
                </p>
                {pendingCheckout.couponCode && (
                  <p className="text-[11px] text-[#C2410C] font-mono font-bold mt-0.5">
                    Coupon: {pendingCheckout.couponCode}
                  </p>
                )}
              </div>
              <span className="font-display font-extrabold text-sm text-[#1C1917] tabular-nums">
                {formatInr(
                  getAuthoritativeBaseAmount(
                    pendingCheckout.planId,
                    pendingCheckout.billingCycle
                  )
                )}
              </span>
            </div>
          )}

          <EmailOtpAuth
            embedded
            successMessage="Email verified! Preparing your checkout..."
            onSuccess={handleOtpVerified}
          />
        </DialogContent>
      </Dialog>

      {/* ============================================================
          SERVER-VERIFIED CHECKOUT READY MODAL
      ============================================================ */}
      <Dialog
        open={checkoutSummaryOpen}
        onOpenChange={(open) => setCheckoutSummaryOpen(open)}
      >
        <DialogContent
          data-testid="checkout-verified-modal"
          className="max-w-lg bg-white border border-[#FED7AA] rounded-3xl p-6"
        >
          {preparedCheckout && (
            <>
              <DialogHeader>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-bold uppercase tracking-wider w-fit">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Server-Verified Checkout</span>
                </div>
                <DialogTitle className="font-display text-xl font-extrabold text-[#1C1917] pt-1">
                  {getSubscriptionPlan(preparedCheckout.planId).name} Plan Ready
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-[#44403C]">
                  Your pricing and coupon discount have been verified server-side for{' '}
                  <strong className="text-[#1C1917]">
                    {sessionUser?.email || preparedCheckout.userId}
                  </strong>
                  .
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-2xl bg-[#FFF8F2] border border-[#FED7AA] p-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between text-[#44403C]">
                  <span>Subscription plan</span>
                  <span className="font-bold text-[#1C1917]">
                    {getSubscriptionPlan(preparedCheckout.planId).name} (
                    {preparedCheckout.billingCycle === 'yearly'
                      ? 'Yearly'
                      : 'Monthly'}
                    )
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#44403C]">
                  <span>Original payable amount</span>
                  <span className="font-bold text-[#1C1917] tabular-nums">
                    {formatInr(preparedCheckout.baseAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#44403C]">
                  <span>
                    Coupon discount
                    {preparedCheckout.appliedCoupon
                      ? ` (${preparedCheckout.appliedCoupon.code})`
                      : ''}
                  </span>
                  <span
                    className={`font-bold tabular-nums ${
                      preparedCheckout.discountAmount > 0
                        ? 'text-[#059669]'
                        : 'text-[#64748B]'
                    }`}
                  >
                    {preparedCheckout.discountAmount > 0
                      ? `-${formatInr(preparedCheckout.discountAmount)}`
                      : '₹0'}
                  </span>
                </div>
                <div className="pt-2.5 border-t border-[#FED7AA] flex items-baseline justify-between">
                  <span className="font-display font-extrabold text-[#1C1917]">
                    Final Payable Amount
                  </span>
                  <span className="font-display text-2xl font-black text-[#EA580C] tabular-nums">
                    {formatInr(preparedCheckout.finalAmount)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link
                  href="/dashboard"
                  className="flex-1 min-h-[46px] py-2.5 px-4 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <span>Open Agency Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={`mailto:${SITE_CONFIG.SALES_EMAIL}?subject=${encodeURIComponent(
                    `VigilAMC ${getSubscriptionPlan(preparedCheckout.planId).name} (${preparedCheckout.billingCycle}) Activation`
                  )}&body=${encodeURIComponent(
                    `Account: ${sessionUser?.email || preparedCheckout.userId}\nPlan: ${getSubscriptionPlan(preparedCheckout.planId).name}\nBilling Cycle: ${preparedCheckout.billingCycle}\nOriginal Amount: ${formatInr(preparedCheckout.baseAmount)}\nCoupon: ${preparedCheckout.appliedCoupon?.code || 'None'}\nFinal Payable: ${formatInr(preparedCheckout.finalAmount)}`
                  )}`}
                  className="min-h-[46px] py-2.5 px-4 rounded-xl bg-white hover:bg-[#FFF4EC] border border-[#FED7AA] text-[#1C1917] text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#EA580C]" />
                  <span>Request GST Invoice</span>
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ComparisonCell({
  value,
  highlight = false,
}: {
  value: string | boolean;
  highlight?: boolean;
}) {
  if (typeof value === 'boolean') {
    return value ? (
      <span className="inline-flex items-center gap-1.5 text-[#059669] font-bold">
        <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Included</span>
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-[#64748B] font-medium">
        <X className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Not included</span>
      </span>
    );
  }

  return (
    <span className={highlight ? 'font-bold text-[#C2410C]' : ''}>{value}</span>
  );
}
