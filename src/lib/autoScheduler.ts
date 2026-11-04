import { db } from '@/lib/db';
import { logAuditActivity } from '@/lib/auth';
import { notifyOnAssignment } from '@/lib/notify';

export interface AutoScheduleResult {
  createdCount: number;
  skippedCount: number;
  createdTasks: any[];
}

function getServiceLabelForAsset(type?: string | null): string {
  const t = String(type || 'Extinguisher').toLowerCase();
  if (t.includes('hydrant')) return 'Hydrant Inspection';
  if (t.includes('sprinkler')) return 'Sprinkler Audit';
  if (t.includes('panel') || t.includes('alarm')) return 'Alarm Panel Check';
  if (t.includes('riser') || t.includes('hose')) return 'Riser & Hose Check';
  return 'Extinguisher Service';
}

export async function runAutoSchedulerForOrg(params: {
  organizationId: string;
  actorUserId?: string;
  actorEmail?: string;
  forceRun?: boolean;
  targetEquipmentId?: string;
  horizonDaysOverride?: number;
}): Promise<AutoScheduleResult> {
  const {
    organizationId,
    actorUserId,
    actorEmail,
    forceRun = false,
    targetEquipmentId,
    horizonDaysOverride,
  } = params;

  const org = await (db as any).organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true, autoSchedulingEnabled: true },
  });

  if (!org) {
    return { createdCount: 0, skippedCount: 0, createdTasks: [] };
  }

  // Respect settings toggle unless explicitly triggered for a single asset or forced
  if (!forceRun && !targetEquipmentId && org.autoSchedulingEnabled === false) {
    return { createdCount: 0, skippedCount: 0, createdTasks: [] };
  }

  const buildings = await (db as any).building.findMany({
    where: { organizationId },
    include: {
      technicianAssignments: {
        orderBy: { assignedAt: 'asc' },
        take: 1,
      },
      equipments: targetEquipmentId
        ? { where: { id: targetEquipmentId } }
        : true,
    },
  });

  const existingOpenWorkOrders = await (db as any).workOrder.findMany({
    where: {
      organizationId,
      status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] },
    },
    select: {
      id: true,
      equipmentId: true,
      buildingId: true,
      dueDate: true,
      status: true,
      title: true,
    },
  });

  const openByEquipmentId = new Map<string, any>();
  for (const wo of existingOpenWorkOrders) {
    if (wo.equipmentId) {
      openByEquipmentId.set(wo.equipmentId, wo);
    }
  }

  const now = new Date();
  let createdCount = 0;
  let skippedCount = 0;
  const createdTasks: any[] = [];

  for (const bldg of buildings) {
    const leadDays =
      horizonDaysOverride !== undefined
        ? horizonDaysOverride
        : typeof bldg.leadTimeDays === 'number'
        ? bldg.leadTimeDays
        : 7;

    const defaultTechId = bldg.technicianAssignments?.[0]?.technicianId || null;
    const equipments = Array.isArray(bldg.equipments) ? bldg.equipments : [];

    for (const eq of equipments) {
      const dueRaw = eq.nextDueDate || eq.refillDueDate || eq.hydroDueDate;
      if (!dueRaw && !targetEquipmentId) continue;

      const dueDate = dueRaw ? new Date(dueRaw) : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      if (isNaN(dueDate.getTime())) continue;

      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Eligible if within lead window (or overdue) OR explicitly targeted via "Schedule visit"
      const isWithinWindow = targetEquipmentId ? true : diffDays <= leadDays;
      if (!isWithinWindow) continue;

      // Idempotence guard: check if an open task already exists for this asset
      if (openByEquipmentId.has(eq.id)) {
        skippedCount++;
        continue;
      }

      const serviceLabel = getServiceLabelForAsset(eq.type);
      const title = `Scheduled ${serviceLabel} — ${eq.qrCode}`;

      // Standing Constraint 2: status MUST be OPEN (NEVER ASSIGNED automatically)
      const createdWo = await (db as any).workOrder.create({
        data: {
          organizationId,
          buildingId: bldg.id,
          equipmentId: eq.id,
          assignedToId: defaultTechId,
          title,
          description: `Auto-scheduled compliance service for ${eq.qrCode} (${eq.type} - ${eq.capacity}) at ${bldg.name} (${eq.location}).`,
          priority: diffDays < 0 ? 'HIGH' : 'MEDIUM',
          status: 'OPEN',
          dueDate,
          isAutoScheduled: true,
        },
        include: {
          building: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, fullName: true, email: true } },
        },
      });

      openByEquipmentId.set(eq.id, createdWo);
      createdCount++;
      createdTasks.push(createdWo);

      if (defaultTechId) {
        await notifyOnAssignment({
          type: 'WORK_ORDER',
          technicianId: defaultTechId,
          organizationId,
          title: `New Scheduled Visit: ${bldg.name}`,
          message: `${title} due on ${dueDate.toLocaleDateString('en-IN')}`,
          link: '/technician',
          taskId: createdWo.id,
          dueDate,
        });
      }
    }
  }

  if (createdCount > 0) {
    await logAuditActivity({
      organizationId,
      userId: actorUserId || undefined,
      userEmail: actorEmail || undefined,
      action: targetEquipmentId ? 'VISIT_SCHEDULED_FROM_RADAR' : 'AUTO_SCHEDULER_RUN',
      entityType: 'WorkOrder',
      entityId: createdTasks[0]?.id || undefined,
      details: `${createdCount} scheduled OPEN task(s) created, ${skippedCount} already open`,
    });
  }

  return {
    createdCount,
    skippedCount,
    createdTasks,
  };
}
