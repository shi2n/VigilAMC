/**
 * Authoritative VigilAMC subscription catalog & pricing helpers.
 * Zero Node-only dependencies — safe for Browser, Next.js Edge/Node, and Cloudflare Workers.
 */

export type SubscriptionPlanId = 'basic' | 'pro' | 'advanced';
export type BillingCycle = 'monthly' | 'yearly';
export type CouponDiscountType = 'percentage' | 'fixed';

export interface SubscriptionPlanSpec {
  id: SubscriptionPlanId;
  name: string;
  tagline: string;
  ctaLabel: string;
  mostPopular?: boolean;
  monthlyPrice: number;
  yearlyMonthlyRate: number;
  yearlyTotalPrice: number;
  monthlySavingsOnYearly: number;
  annualSavingsOnYearly: number;
  limits: {
    buildings: string;
    assets: string;
    technicians: string;
    emailReportsPerMonth: number;
    whatsappReportsPerMonth: number | null;
    messagingIncluded: boolean;
    clientPortalIncluded: boolean;
  };
  highlights: string[];
}

export const SUBSCRIPTION_PLANS: readonly SubscriptionPlanSpec[] = [
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Ideal for small teams getting started',
    ctaLabel: 'Choose Basic',
    monthlyPrice: 1400,
    yearlyMonthlyRate: 1200,
    yearlyTotalPrice: 14400, // 1200 * 12
    monthlySavingsOnYearly: 200, // 1400 - 1200
    annualSavingsOnYearly: 2400, // 200 * 12
    limits: {
      buildings: 'Up to 10',
      assets: 'Up to 100',
      technicians: '2',
      emailReportsPerMonth: 20,
      whatsappReportsPerMonth: null,
      messagingIncluded: false,
      clientPortalIncluded: false,
    },
    highlights: [
      'Up to 10 Buildings',
      'Up to 100 Fire Safety Assets',
      '2 Technician Accounts',
      '20 Email Reports / month',
      'GPS + Asset Tag ID & Photo Proof',
      'Form-B Compliance Report Generator',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For growing operations',
    ctaLabel: 'Choose Pro',
    mostPopular: true,
    monthlyPrice: 2500,
    yearlyMonthlyRate: 2200,
    yearlyTotalPrice: 26400, // 2200 * 12
    monthlySavingsOnYearly: 300, // 2500 - 2200
    annualSavingsOnYearly: 3600, // 300 * 12
    limits: {
      buildings: 'Up to 50',
      assets: 'Up to 500',
      technicians: '10',
      emailReportsPerMonth: 50,
      whatsappReportsPerMonth: 10,
      messagingIncluded: true,
      clientPortalIncluded: true,
    },
    highlights: [
      'Up to 50 Buildings',
      'Up to 500 Fire Safety Assets',
      '10 Technician Accounts',
      '50 Email Reports / month',
      '10 WhatsApp Reports / month',
      'In-App Messaging & Client Portal Included',
    ],
  },
  {
    id: 'advanced',
    name: 'Advanced',
    tagline: 'For large portfolios',
    ctaLabel: 'Choose Advanced',
    monthlyPrice: 4000,
    yearlyMonthlyRate: 3799,
    yearlyTotalPrice: 45588, // 3799 * 12
    monthlySavingsOnYearly: 201, // 4000 - 3799
    annualSavingsOnYearly: 2412, // 201 * 12
    limits: {
      buildings: 'Unlimited',
      assets: 'Unlimited',
      technicians: 'Unlimited',
      emailReportsPerMonth: 300,
      whatsappReportsPerMonth: 100,
      messagingIncluded: true,
      clientPortalIncluded: true,
    },
    highlights: [
      'Unlimited Buildings',
      'Unlimited Fire Safety Assets',
      'Unlimited Technician Accounts',
      '300 Email Reports / month',
      '100 WhatsApp Reports / month',
      'In-App Messaging & Client Portal Included',
    ],
  },
] as const;

export const PLAN_PRICE_MATRIX: Record<
  SubscriptionPlanId,
  Record<BillingCycle, number>
> = {
  basic: {
    monthly: 1400,
    yearly: 14400,
  },
  pro: {
    monthly: 2500,
    yearly: 26400,
  },
  advanced: {
    monthly: 4000,
    yearly: 45588,
  },
};

export interface AppliedCouponInfo {
  id?: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
}

export interface PrepareCheckoutSuccessResponse {
  valid: true;
  planId: SubscriptionPlanId;
  billingCycle: BillingCycle;
  userId: string;
  baseAmount: number;
  discountAmount: number;
  finalAmount: number;
  appliedCoupon: AppliedCouponInfo | null;
}

export interface PrepareCheckoutErrorResponse {
  valid: false;
  message: string;
  error?: string;
}

export type PrepareCheckoutResponse =
  | PrepareCheckoutSuccessResponse
  | PrepareCheckoutErrorResponse;

export function isValidPlanId(value: unknown): value is SubscriptionPlanId {
  return value === 'basic' || value === 'pro' || value === 'advanced';
}

export function isValidBillingCycle(value: unknown): value is BillingCycle {
  return value === 'monthly' || value === 'yearly';
}

export function getSubscriptionPlan(planId: SubscriptionPlanId): SubscriptionPlanSpec {
  const found = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  return found ?? SUBSCRIPTION_PLANS[1];
}

/**
 * Authoritative base payable amount (in INR) for a plan and billing cycle.
 */
export function getAuthoritativeBaseAmount(
  planId: SubscriptionPlanId,
  billingCycle: BillingCycle
): number {
  return PLAN_PRICE_MATRIX[planId][billingCycle];
}

/**
 * Deterministic discount calculation shared by client preview and server validation.
 * Always clamps discount to [0, baseAmount] and finalAmount to >= 0.
 */
export function calculateCouponDiscount(
  baseAmount: number,
  discountType: CouponDiscountType,
  discountValue: number
): { discountAmount: number; finalAmount: number } {
  const safeBase = Math.max(0, Math.round(baseAmount));
  const safeVal = Number.isFinite(discountValue) ? Math.max(0, discountValue) : 0;

  let rawDiscount = 0;
  if (discountType === 'percentage') {
    const clampedPct = Math.min(100, safeVal);
    rawDiscount = Math.round((safeBase * clampedPct) / 100);
  } else {
    rawDiscount = Math.round(safeVal);
  }

  const discountAmount = Math.min(safeBase, Math.max(0, rawDiscount));
  const finalAmount = Math.max(0, safeBase - discountAmount);
  return { discountAmount, finalAmount };
}

export function formatInr(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  return `₹${safe.toLocaleString('en-IN')}`;
}
