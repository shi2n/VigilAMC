import { db } from '@/lib/db';

export interface PlanConfig {
  id: 'BASIC' | 'PRO' | 'ENTERPRISE';
  name: string;
  tagline: string;
  maxTechnicians: number;
  maxTowers: number;
  maxAssets: number;
  priceMonthly: number;
  priceAnnualMonthly: number;
  currency: string;
  features: string[];
}

export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  BASIC: {
    id: 'BASIC',
    name: 'Free Testing Access',
    tagline: 'Full platform access enabled for testing',
    maxTechnicians: 999999,
    maxTowers: 999999,
    maxAssets: 999999,
    priceMonthly: 0,
    priceAnnualMonthly: 0,
    currency: 'INR',
    features: [
      'Testing Access - All Features Enabled',
      'Unlimited Technician Accounts',
      'Unlimited Buildings / Towers',
      'Unlimited Fire Equipment',
      'Inspection & Verification Workflows',
      'Form-B Compliance Reports',
      'Bulk Excel Data Import'
    ]
  },
  PRO: {
    id: 'PRO',
    name: 'Free Testing Access',
    tagline: 'Full platform access enabled for testing',
    maxTechnicians: 999999,
    maxTowers: 999999,
    maxAssets: 999999,
    priceMonthly: 0,
    priceAnnualMonthly: 0,
    currency: 'INR',
    features: [
      'Testing Access - All Features Enabled',
      'Unlimited Technician Accounts',
      'Unlimited Buildings / Towers',
      'Unlimited Fire Equipment',
    ]
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise Fleet',
    tagline: 'For commercial safety enterprises, campuses, and high-volume operations',
    maxTechnicians: 999999,
    maxTowers: 999999,
    maxAssets: 999999,
    priceMonthly: 19999,
    priceAnnualMonthly: 15999,
    currency: 'INR',
    features: [
      'Unlimited / Custom Technician Accounts',
      'Unlimited Buildings / Towers / Facilities',
      'Unlimited Fire Safety Equipment Assets',
      'Everything in Pro Fleet AMC',
      'Dedicated Account Lead & Compliance Lead',
      'Custom Form-B & Municipal Formats',
      'Custom ERP, SCADA & Webhook Integrations',
      'Enterprise SLA & 99.9% Uptime Commitment'
    ]
  }
};

export function getPlanConfig(planId?: string): PlanConfig {
  const normalized = (planId || 'BASIC').toUpperCase();
  return PLAN_CONFIGS[normalized] || PLAN_CONFIGS.BASIC;
}

export async function getOrCreateAgencySubscription(organizationId: string) {
  let subscription = await (db as any).subscription.findUnique({
    where: { organizationId },
  });

  if (!subscription) {
    const startedAt = new Date();
    const renewalDate = new Date(startedAt.getTime() + 30 * 24 * 60 * 60 * 1000);

    subscription = await (db as any).subscription.create({
      data: {
        organizationId,
        plan: 'BASIC',
        status: 'ACTIVE',
        billingCycle: 'MONTHLY',
        startedAt,
        renewalDate,
        amount: 3999,
        currency: 'INR',
      },
    });
  }

  return subscription;
}

export async function getAgencySubscriptionAndUsage(organizationId: string) {
  const subscription = await getOrCreateAgencySubscription(organizationId);
  const planConfig = getPlanConfig(subscription.plan);

  // Active technicians count towards seat limit. Inactive technicians do NOT count.
  const [activeTechniciansCount, inactiveTechniciansCount, towersCount, assetsCount] = await Promise.all([
    (db as any).userProfile.count({
      where: {
        organizationId,
        role: 'TECHNICIAN',
        status: 'ACTIVE',
      },
    }),
    (db as any).userProfile.count({
      where: {
        organizationId,
        role: 'TECHNICIAN',
        status: 'INACTIVE',
      },
    }),
    (db as any).building.count({
      where: { organizationId },
    }),
    (db as any).equipment.count({
      where: { organizationId },
    }),
  ]);

  const maxTechnicians = subscription.customTechnicians || planConfig.maxTechnicians;
  const maxTowers = subscription.customTowers || planConfig.maxTowers;
  const maxAssets = subscription.customAssets || planConfig.maxAssets;

  const isUnlimitedTechs = maxTechnicians >= 999999;
  const isUnlimitedTowers = maxTowers >= 999999;
  const isUnlimitedAssets = maxAssets >= 999999;

  const technicianUsage = {
    active: activeTechniciansCount,
    inactive: inactiveTechniciansCount,
    total: activeTechniciansCount + inactiveTechniciansCount,
    max: isUnlimitedTechs ? 'Unlimited' : maxTechnicians,
    maxNumeric: maxTechnicians,
    available: isUnlimitedTechs ? 'Unlimited' : Math.max(0, maxTechnicians - activeTechniciansCount),
    availableNumeric: isUnlimitedTechs ? 999999 : Math.max(0, maxTechnicians - activeTechniciansCount),
    percentUsed: isUnlimitedTechs ? 0 : Math.min(100, Math.round((activeTechniciansCount / maxTechnicians) * 100)),
    isAtLimit: isUnlimitedTechs ? false : activeTechniciansCount >= maxTechnicians,
  };

  const towerUsage = {
    used: towersCount,
    max: isUnlimitedTowers ? 'Unlimited' : maxTowers,
    maxNumeric: maxTowers,
    available: isUnlimitedTowers ? 'Unlimited' : Math.max(0, maxTowers - towersCount),
    percentUsed: isUnlimitedTowers ? 0 : Math.min(100, Math.round((towersCount / maxTowers) * 100)),
    isAtLimit: isUnlimitedTowers ? false : towersCount >= maxTowers,
  };

  const assetUsage = {
    used: assetsCount,
    max: isUnlimitedAssets ? 'Unlimited' : maxAssets,
    maxNumeric: maxAssets,
    available: isUnlimitedAssets ? 'Unlimited' : Math.max(0, maxAssets - assetsCount),
    percentUsed: isUnlimitedAssets ? 0 : Math.min(100, Math.round((assetsCount / maxAssets) * 100)),
    isAtLimit: isUnlimitedAssets ? false : assetsCount >= maxAssets,
  };

  return {
    subscription,
    plan: planConfig,
    usage: {
      technicians: technicianUsage,
      towers: towerUsage,
      assets: assetUsage,
    },
  };
}

export async function checkPlanLimit(
  organizationId: string,
  resource: 'technicians' | 'towers' | 'assets',
  additionalCount = 1
): Promise<{ allowed: boolean; message?: string; current: number; max: number | string; planName: string }> {
  const { plan, usage } = await getAgencySubscriptionAndUsage(organizationId);

  if (resource === 'technicians') {
    const current = usage.technicians.active;
    const max = usage.technicians.maxNumeric;
    if (max < 999999 && current + additionalCount > max) {
      return {
        allowed: false,
        message: `Technician limit reached. Your ${plan.name} includes ${max} active technician account${max === 1 ? '' : 's'}. Upgrade your plan to add more technicians.`,
        current,
        max,
        planName: plan.name,
      };
    }
    return { allowed: true, current, max, planName: plan.name };
  }

  if (resource === 'towers') {
    const current = usage.towers.used;
    const max = usage.towers.maxNumeric;
    if (max < 999999 && current + additionalCount > max) {
      return {
        allowed: false,
        message: `Building limit reached. Your ${plan.name} allows up to ${max} building${max === 1 ? '' : 's'} / tower${max === 1 ? '' : 's'}. Upgrade your plan to add more buildings.`,
        current,
        max,
        planName: plan.name,
      };
    }
    return { allowed: true, current, max, planName: plan.name };
  }

  if (resource === 'assets') {
    const current = usage.assets.used;
    const max = usage.assets.maxNumeric;
    if (max < 999999 && current + additionalCount > max) {
      return {
        allowed: false,
        message: `Asset limit reached. Your ${plan.name} allows up to ${max} fire safety assets. Upgrade your plan to add more assets.`,
        current,
        max,
        planName: plan.name,
      };
    }
    return { allowed: true, current, max, planName: plan.name };
  }

  return { allowed: true, current: 0, max: 0, planName: plan.name };
}
