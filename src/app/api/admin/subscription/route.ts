import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, logAuditActivity } from '@/lib/auth';
import { getAgencySubscriptionAndUsage, PLAN_CONFIGS, getPlanConfig } from '@/lib/plans';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    const organizationId = auth.organization.id;

    const { subscription, plan, usage } = await getAgencySubscriptionAndUsage(organizationId);

    return NextResponse.json({
      success: true,
      subscription,
      plan,
      usage,
      availablePlans: Object.values(PLAN_CONFIGS),
    });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    const status = error.message?.startsWith('UNAUTHORIZED') ? 401 : error.message?.startsWith('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    const organizationId = auth.organization.id;

    const body = await request.json();
    const { plan: targetPlanId, billingCycle = 'MONTHLY' } = body;

    const normalizedPlan = (targetPlanId || '').toUpperCase();
    if (!PLAN_CONFIGS[normalizedPlan]) {
      return NextResponse.json(
        { error: `Invalid plan specified. Valid plans are: ${Object.keys(PLAN_CONFIGS).join(', ')}` },
        { status: 400 }
      );
    }

    const targetConfig = PLAN_CONFIGS[normalizedPlan];
    const { subscription: currentSub, usage } = await getAgencySubscriptionAndUsage(organizationId);

    const isDowngrade =
      (currentSub.plan === 'ENTERPRISE' && (normalizedPlan === 'PRO' || normalizedPlan === 'BASIC')) ||
      (currentSub.plan === 'PRO' && normalizedPlan === 'BASIC');

    let warningMessage: string | null = null;

    if (isDowngrade) {
      const activeTechs = usage.technicians.active;
      const towersCount = usage.towers.used;
      const assetsCount = usage.assets.used;

      const techExcess = activeTechs > targetConfig.maxTechnicians;
      const towerExcess = towersCount > targetConfig.maxTowers;
      const assetExcess = assetsCount > targetConfig.maxAssets;

      if (techExcess || towerExcess || assetExcess) {
        const warnings: string[] = [];
        if (techExcess) {
          warnings.push(`Active technicians (${activeTechs}) exceed the ${targetConfig.name} limit (${targetConfig.maxTechnicians})`);
        }
        if (towerExcess) {
          warnings.push(`Buildings/Towers (${towersCount}) exceed the ${targetConfig.name} limit (${targetConfig.maxTowers})`);
        }
        if (assetExcess) {
          warnings.push(`Fire assets (${assetsCount}) exceed the ${targetConfig.name} limit (${targetConfig.maxAssets})`);
        }

        warningMessage =
          `Your subscription was changed to ${targetConfig.name}. Note: ${warnings.join('; ')}. All existing records and accounts have been preserved, but you will not be able to create new items until usage is brought within the new plan limits.`;
      }
    }

    const calculatedAmount =
      billingCycle === 'ANNUAL' ? targetConfig.priceAnnualMonthly : targetConfig.priceMonthly;

    const now = new Date();
    const renewalDays = billingCycle === 'ANNUAL' ? 365 : 30;
    const renewalDate = new Date(now.getTime() + renewalDays * 24 * 60 * 60 * 1000);

    const updatedSubscription = await (db as any).subscription.upsert({
      where: { organizationId },
      update: {
        plan: normalizedPlan,
        billingCycle,
        amount: calculatedAmount,
        status: 'ACTIVE',
        renewalDate,
      },
      create: {
        organizationId,
        plan: normalizedPlan,
        billingCycle,
        amount: calculatedAmount,
        status: 'ACTIVE',
        startedAt: now,
        renewalDate,
      },
    });

    await logAuditActivity({
      organizationId,
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: isDowngrade ? 'SUBSCRIPTION_DOWNGRADED' : 'SUBSCRIPTION_UPGRADED',
      entityType: 'Subscription',
      entityId: updatedSubscription.id,
      details: `Agency plan changed from ${currentSub.plan} to ${normalizedPlan} (${billingCycle}). New amount: ₹${calculatedAmount}/mo`,
    });

    const refreshedUsage = await getAgencySubscriptionAndUsage(organizationId);

    return NextResponse.json({
      success: true,
      message: `Successfully updated subscription to ${targetConfig.name}`,
      subscription: updatedSubscription,
      plan: targetConfig,
      usage: refreshedUsage.usage,
      warning: warningMessage,
    });
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    const status = error.message?.startsWith('UNAUTHORIZED') ? 401 : error.message?.startsWith('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
