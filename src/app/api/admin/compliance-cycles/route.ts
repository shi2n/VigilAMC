import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor } from '@/lib/techSession';
import { logAuditActivity } from '@/lib/auth';
import { runAutoSchedulerForOrg } from '@/lib/autoScheduler';

export const dynamic = 'force-dynamic';

const CYCLE_MONTHS: Record<string, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  HALF_YEARLY: 6,
   'HALF-YEARLY': 6,
  YEARLY: 12,
};

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = auth.organization.id;
    const [org, buildings, cycleRules] = await Promise.all([
      (db as any).organization.findUnique({
        where: { id: orgId },
        select: { id: true, autoSchedulingEnabled: true },
      }),
      (db as any).building.findMany({
        where: { organizationId: orgId },
        select: {
          id: true,
          name: true,
          complianceCycle: true,
          reportingCycle: true,
          cycleIntervalMos: true,
          leadTimeDays: true,
          cycleOverrides: true,
        },
        orderBy: { name: 'asc' },
      }),
      (db as any).cycleRule.findMany({
        where: { organizationId: orgId },
      }),
    ]);

    return NextResponse.json({
      autoSchedulingEnabled: org?.autoSchedulingEnabled ?? true,
      buildings,
      cycleRules,
    });
  } catch (error: any) {
    console.error('Error fetching compliance cycles:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = auth.organization.id;
    const body = await request.json();
    const {
      autoSchedulingEnabled,
      buildingId,
      complianceCycle,
      leadTimeDays,
      cycleOverrides,
    } = body;

    if (typeof autoSchedulingEnabled === 'boolean') {
      await (db as any).organization.update({
        where: { id: orgId },
        data: { autoSchedulingEnabled },
      });

      await logAuditActivity({
        organizationId: orgId,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: 'AUTO_SCHEDULING_TOGGLED',
        entityType: 'Organization',
        entityId: orgId,
        details: `Automated work order scheduling turned ${autoSchedulingEnabled ? 'ON' : 'OFF'}`,
      });
    }

    let updatedBuilding = null;
    if (buildingId) {
      const targetBldg = await (db as any).building.findFirst({
        where: { id: buildingId, organizationId: orgId },
      });
      if (!targetBldg) {
        return NextResponse.json({ error: 'Building not found' }, { status: 404 });
      }

      const normCycle = String(complianceCycle || targetBldg.complianceCycle || 'HALF_YEARLY').toUpperCase();
      const mos = CYCLE_MONTHS[normCycle] || 6;
      const cleanLeadDays =
        leadTimeDays !== undefined && !isNaN(Number(leadTimeDays))
          ? Math.max(1, Math.min(90, Number(leadTimeDays)))
          : targetBldg.leadTimeDays ?? 7;

      const overridesStr =
        cycleOverrides !== undefined
          ? typeof cycleOverrides === 'string'
            ? cycleOverrides
            : JSON.stringify(cycleOverrides || {})
          : targetBldg.cycleOverrides;

      updatedBuilding = await (db as any).building.update({
        where: { id: targetBldg.id },
        data: {
          complianceCycle: normCycle,
          reportingCycle: normCycle,
          cycleIntervalMos: mos,
          leadTimeDays: cleanLeadDays,
          cycleOverrides: overridesStr,
        },
      });

      await (db as any).cycleRule.upsert({
        where: {
          buildingId_assetType: {
            buildingId: targetBldg.id,
            assetType: 'ALL',
          },
        },
        create: {
          organizationId: orgId,
          buildingId: targetBldg.id,
          assetType: 'ALL',
          cycle: normCycle,
          leadTimeDays: cleanLeadDays,
          autoSchedule: true,
        },
        update: {
          cycle: normCycle,
          leadTimeDays: cleanLeadDays,
        },
      });

      if (cycleOverrides && typeof cycleOverrides === 'object') {
        for (const [assetTypeKey, overrideCycleVal] of Object.entries(cycleOverrides)) {
          if (!overrideCycleVal) continue;
          await (db as any).cycleRule.upsert({
            where: {
              buildingId_assetType: {
                buildingId: targetBldg.id,
                assetType: assetTypeKey.toUpperCase(),
              },
            },
            create: {
              organizationId: orgId,
              buildingId: targetBldg.id,
              assetType: assetTypeKey.toUpperCase(),
              cycle: String(overrideCycleVal).toUpperCase(),
              leadTimeDays: cleanLeadDays,
              autoSchedule: true,
            },
            update: {
              cycle: String(overrideCycleVal).toUpperCase(),
              leadTimeDays: cleanLeadDays,
            },
          });
        }
      }

      await logAuditActivity({
        organizationId: orgId,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: 'COMPLIANCE_CYCLE_UPDATED',
        entityType: 'Building',
        entityId: targetBldg.id,
        details: `Updated compliance cycle for ${targetBldg.name}: ${normCycle} (Lead time: ${cleanLeadDays}d)`,
      });
    }

    return NextResponse.json({
      success: true,
      autoSchedulingEnabled,
      building: updatedBuilding,
    });
  } catch (error: any) {
    console.error('Error updating compliance cycle:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { equipmentId, horizonDays } = body;

    const result = await runAutoSchedulerForOrg({
      organizationId: auth.organization.id,
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      forceRun: true,
      targetEquipmentId: equipmentId && String(equipmentId).trim() ? String(equipmentId).trim() : undefined,
      horizonDaysOverride:
        horizonDays !== undefined && !isNaN(Number(horizonDays)) ? Number(horizonDays) : undefined,
    });

    return NextResponse.json({
      success: true,
      ...result,
      task: result.createdTasks[0] || null,
    });
  } catch (error: any) {
    console.error('Error running auto scheduler:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
