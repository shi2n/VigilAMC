import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor } from '@/lib/techSession';
import { addCalendarDays, calendarDayDiff, dueChip, toDbDate } from '@/lib/dates';
import { validateTaskCompletionAction } from '@/lib/i18n/taskAction';
import { logAuditActivity } from '@/lib/auth';
import {
  EVIDENCE_NO_STORE_HEADERS,
  sanitizeIdSegment,
  signWorkOrderRecords,
  validateStoredPhotoUrl,
} from '@/lib/evidencePhotos';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required' }, { status: 401 });
    }
    const userId = auth.user.id;
    const organizationId = auth.organization?.id;
    if (!organizationId) {
      return NextResponse.json({ error: 'No associated organization found' }, { status: 403 });
    }

    // Get assigned building IDs for this technician
    const assignments = await (db as any).technicianBuildingAssignment.findMany({
      where: { technicianId: userId },
      select: { buildingId: true },
    });
    const assignedBuildingIds = assignments.map((a: any) => a.buildingId);

    // If none assigned explicitly, get all buildings in organization (standard agency behavior)
    let effectiveBuildingIds = assignedBuildingIds;
    if (effectiveBuildingIds.length === 0) {
      const allB = await (db as any).building.findMany({
        where: { organizationId },
        select: { id: true },
      });
      effectiveBuildingIds = allB.map((b: any) => b.id);
    }

    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const inFortyEightHours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // 1. Fetch relevant Work Orders
    const workOrders = await (db as any).workOrder.findMany({
      where: {
        organizationId,
        AND: [
          {
            OR: [
              { assignedToId: userId },
              { assignedToId: null, buildingId: { in: effectiveBuildingIds } },
            ],
          },
          {
            OR: [
              { status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] } },
              { status: 'COMPLETED', completedAt: { gte: fortyEightHoursAgo } },
            ],
          },
        ],
      },
      include: {
        building: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            latitude: true,
            longitude: true,
            client: { select: { phone: true, name: true } },
          },
        },
        equipment: {
          select: {
            id: true,
            qrCode: true,
            type: true,
            category: true,
            capacity: true,
            location: true,
            floor: true,
            wing: true,
            status: true,
            nextDueDate: true,
            lastServiceDate: true,
          },
        },
        photos: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            clientPhotoId: true,
            photoUrl: true,
            caption: true,
            capturedAt: true,
            dayOfWeek: true,
            latitude: true,
            longitude: true,
            gpsAccuracy: true,
            gpsSource: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });

    const signedWorkOrders = await signWorkOrderRecords(workOrders, organizationId);

    // 2. Derive Routine AMC Inspection Tasks from due/overdue equipment in assigned buildings
    const buildingsWithDueEquip = await (db as any).building.findMany({
      where: { id: { in: effectiveBuildingIds } },
      include: {
        client: { select: { phone: true, name: true } },
        equipments: {
          where: {
            OR: [
              { nextDueDate: { lte: inFortyEightHours } },
              { status: { in: ['OVERDUE', 'DUE_SOON', 'DEFECTIVE'] } },
            ],
          },
          select: {
            id: true,
            qrCode: true,
            type: true,
            location: true,
            floor: true,
            status: true,
            nextDueDate: true,
            inspections: {
              where: { technicianId: userId, date: { gte: fortyEightHoursAgo } },
              take: 1,
              orderBy: { date: 'desc' },
            },
          },
        },
      },
    });

    // Unify tasks
    const tasks: any[] = [];
    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const todayIstStr = `${istNow.getUTCFullYear()}-${String(istNow.getUTCMonth() + 1).padStart(2, '0')}-${String(istNow.getUTCDate()).padStart(2, '0')}`;

    // Server-side overdue equipment query for work-order buildings:
    // ONLY fetch overdue fire equipment (due_date < today) + explicitly linked work-order equipment IDs.
    const woBuildingIds = Array.from(
      new Set(workOrders.map((wo: any) => wo.buildingId).filter(Boolean))
    ) as string[];
    const linkedWoEquipmentIds = Array.from(
      new Set(workOrders.map((wo: any) => wo.equipmentId).filter(Boolean))
    ) as string[];

    // Use tomorrow Noon UTC as SQL upper bound, then enforce exact calendar-day due_date < today via dueChip()
    const overdueSqlUpperBound = toDbDate(addCalendarDays(todayIstStr, 1)) || now;

    const [candidateOverdueEquipments, buildingTotalCounts] =
      woBuildingIds.length > 0
        ? await Promise.all([
            (db as any).equipment.findMany({
              where: {
                organizationId,
                buildingId: { in: woBuildingIds },
                OR: [
                  { nextDueDate: { lt: overdueSqlUpperBound } },
                  ...(linkedWoEquipmentIds.length > 0
                    ? [{ id: { in: linkedWoEquipmentIds } }]
                    : []),
                ],
              },
              select: {
                id: true,
                buildingId: true,
                qrCode: true,
                type: true,
                category: true,
                capacity: true,
                location: true,
                floor: true,
                wing: true,
                status: true,
                nextDueDate: true,
                lastServiceDate: true,
              },
            }),
            (db as any).equipment.groupBy({
              by: ['buildingId'],
              where: {
                organizationId,
                buildingId: { in: woBuildingIds },
              },
              _count: { _all: true },
            }),
          ])
        : [[], []];

    const buildingTotalMap = new Map<string, number>();
    for (const row of buildingTotalCounts as any[]) {
      buildingTotalMap.set(row.buildingId, row._count?._all ?? 0);
    }

    const candidatesByBuilding = new Map<string, any[]>();
    for (const eq of candidateOverdueEquipments as any[]) {
      const list = candidatesByBuilding.get(eq.buildingId) || [];
      list.push(eq);
      candidatesByBuilding.set(eq.buildingId, list);
    }

    // Map Work Orders
    for (const wo of signedWorkOrders) {
      let floorZone = wo.equipment?.floor || '';
      if (!floorZone && wo.equipment?.location) {
        const m = wo.equipment.location.match(/^(B\d|Basement\s*\d?|Ground(?:\s*Floor)?|GF|Floor\s*\d+|Level\s*\d+|Terrace|Pump\s*Room|Lobby|Gate)/i);
        floorZone = m ? m[1] : wo.equipment.location.split(/[-–•,]/)[0]?.trim() || 'Main Zone';
      }
      if (!floorZone) floorZone = 'General';

      let dueState: 'EXPIRED' | 'DUE_SOON' | 'OK' = 'OK';
      let diffDays = 0;
      if (wo.dueDate) {
        diffDays = calendarDayDiff(wo.dueDate, todayIstStr);
        if (diffDays < 0) dueState = 'EXPIRED';
        else if (diffDays <= 30) dueState = 'DUE_SOON';
        else dueState = 'OK';
      }

      // Build server-filtered task equipment list:
      // 1) ONLY fire equipment whose due date is strictly OVERDUE (dueChip state === 'EXPIRED', i.e. due_date < today)
      // 2) Guard: if work-order is linked to a specific equipmentId, always include it with its real status
      // 3) Sort: most overdue first (most negative diff first)
      const buildingCandidates = candidatesByBuilding.get(wo.buildingId) || [];
      const taskEquipments: any[] = [];
      const seenEqIds = new Set<string>();

      for (const eq of buildingCandidates) {
        const chip = dueChip(eq.nextDueDate, todayIstStr);
        const isLinked = Boolean(wo.equipmentId && eq.id === wo.equipmentId);
        if (chip.state !== 'EXPIRED' && !isLinked) continue;
        if (seenEqIds.has(eq.id)) continue;
        seenEqIds.add(eq.id);

        taskEquipments.push({
          id: eq.id,
          qrCode: eq.qrCode,
          type: eq.type,
          category: eq.category || null,
          capacity: eq.capacity || null,
          location: eq.location,
          floor: eq.floor || null,
          wing: eq.wing || null,
          status: eq.status,
          nextDueDate: eq.nextDueDate,
          lastServiceDate: eq.lastServiceDate,
          dueState: chip.state,
          diffDays: chip.diff,
          daysOverdue: chip.state === 'EXPIRED' ? (chip.days ?? 0) : 0,
          isLinkedToTask: isLinked,
        });
      }

      // Fallback guard: if wo.equipment exists from include and wasn't in buildingCandidates
      if (wo.equipment && !seenEqIds.has(wo.equipment.id)) {
        const chip = dueChip(wo.equipment.nextDueDate, todayIstStr);
        taskEquipments.push({
          id: wo.equipment.id,
          qrCode: wo.equipment.qrCode,
          type: wo.equipment.type,
          category: wo.equipment.category || null,
          capacity: wo.equipment.capacity || null,
          location: wo.equipment.location,
          floor: wo.equipment.floor || null,
          wing: wo.equipment.wing || null,
          status: wo.equipment.status,
          nextDueDate: wo.equipment.nextDueDate || null,
          lastServiceDate: wo.equipment.lastServiceDate || null,
          dueState: chip.state,
          diffDays: chip.diff,
          daysOverdue: chip.state === 'EXPIRED' ? (chip.days ?? 0) : 0,
          isLinkedToTask: true,
        });
      }

      // Sort most overdue first (lowest/most-negative diffDays first, null dates last)
      taskEquipments.sort((a, b) => {
        const dA = typeof a.diffDays === 'number' ? a.diffDays : Number.MAX_SAFE_INTEGER;
        const dB = typeof b.diffDays === 'number' ? b.diffDays : Number.MAX_SAFE_INTEGER;
        if (dA !== dB) return dA - dB;
        return String(a.qrCode || a.id).localeCompare(String(b.qrCode || b.id));
      });

      tasks.push({
        id: wo.id,
        source: 'WORK_ORDER',
        title: wo.title,
        description: wo.description,
        priority: wo.priority || 'MEDIUM',
        status: wo.status, // OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
        dueDate: wo.dueDate,
        completedAt: wo.completedAt,
        actionTaken: wo.actionTaken || null,
        notes: wo.notes || null,
        photoUrl: wo.photoUrl || null,
        photos: Array.isArray(wo.photos) ? wo.photos : [],
        dueState,
        diffDays,
        buildingId: wo.buildingId,
        buildingName: wo.building?.name || 'Assigned Building',
        building: {
          id: wo.building?.id,
          name: wo.building?.name || 'Assigned Building',
          address: wo.building?.address || '',
          city: wo.building?.city || '',
          state: wo.building?.state || '',
          latitude: wo.building?.latitude || null,
          longitude: wo.building?.longitude || null,
        },
        floorZone,
        contactPhone: wo.building?.client?.phone || '',
        contactName: wo.building?.client?.name || '',
        equipmentId: wo.equipmentId,
        equipment: wo.equipment,
        buildingTotalEquipments: buildingTotalMap.get(wo.buildingId) ?? 0,
        overdueEquipmentsCount: taskEquipments.filter((e) => e.dueState === 'EXPIRED').length,
        taskEquipments,
      });
    }

    // Map Routine AMC Inspections (deduplicated against existing work orders for same equipment)
    const coveredEquipmentIds = new Set(workOrders.map((w: any) => w.equipmentId).filter(Boolean));
    for (const b of buildingsWithDueEquip) {
      for (const eq of b.equipments || []) {
        if (coveredEquipmentIds.has(eq.id)) continue;

        const isRecentlyCompleted = (eq.inspections || []).length > 0;
        let diffDays = 0;
        let dueState: 'EXPIRED' | 'DUE_SOON' | 'OK' = 'OK';

        if (eq.nextDueDate) {
          diffDays = calendarDayDiff(eq.nextDueDate, todayIstStr);
          if (diffDays < 0) {
            dueState = 'EXPIRED';
          } else if (diffDays <= 30) {
            dueState = 'DUE_SOON';
          } else {
            dueState = 'OK';
          }
        } else if (eq.status === 'OVERDUE' || eq.status === 'DEFECTIVE') {
          dueState = 'EXPIRED';
        } else if (eq.status === 'DUE_SOON') {
          dueState = 'DUE_SOON';
        }

        let floorZone = eq.floor || '';
        if (!floorZone && eq.location) {
          const m = eq.location.match(/^(B\d|Basement\s*\d?|Ground(?:\s*Floor)?|GF|Floor\s*\d+|Level\s*\d+|Terrace|Pump\s*Room|Lobby|Gate)/i);
          floorZone = m ? m[1] : eq.location.split(/[-–•,]/)[0]?.trim() || 'Main Zone';
        }
        if (!floorZone) floorZone = 'General';

        tasks.push({
          id: `AMC-${eq.id}`,
          source: 'INSPECTION',
          title: `Routine AMC Check • ${eq.type || 'Fire Extinguisher'}`,
          description: `Mandatory IS 2190 check for asset ${eq.qrCode || eq.id} at ${b.name}`,
          priority: dueState === 'EXPIRED' ? 'HIGH' : dueState === 'DUE_SOON' ? 'MEDIUM' : 'LOW',
          status: isRecentlyCompleted ? 'COMPLETED' : 'OPEN',
          dueDate: eq.nextDueDate,
          completedAt: isRecentlyCompleted ? eq.inspections[0].date : null,
          dueState,
          diffDays,
          buildingId: b.id,
          buildingName: b.name || 'Assigned Building',
          building: {
            id: b.id,
            name: b.name,
            address: b.address || '',
            city: b.city || '',
            state: b.state || '',
            latitude: b.latitude || null,
            longitude: b.longitude || null,
          },
          floorZone,
          contactPhone: b.client?.phone || '',
          contactName: b.client?.name || '',
          equipmentId: eq.id,
          equipment: {
            id: eq.id,
            qrCode: eq.qrCode,
            type: eq.type,
            location: eq.location,
            floor: eq.floor,
            status: eq.status,
          },
        });
      }
    }

    // Sort: Overdue first, then by dueDate ascending. Completed at bottom.
    tasks.sort((a, b) => {
      if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return 1;
      if (b.status === 'COMPLETED' && a.status !== 'COMPLETED') return -1;
      if (a.dueState === 'EXPIRED' && b.dueState !== 'EXPIRED') return -1;
      if (b.dueState === 'EXPIRED' && a.dueState !== 'EXPIRED') return 1;
      const tA = a.dueDate ? new Date(a.dueDate).getTime() : 9999999999999;
      const tB = b.dueDate ? new Date(b.dueDate).getTime() : 9999999999999;
      return tA - tB;
    });

    // Calculate Today summary counts (excluding CANCELLED and COMPLETED)
    const activeTasks = tasks.filter((t) => t.status !== 'CANCELLED' && t.status !== 'COMPLETED');
    const overdueCount = activeTasks.filter((t) => t.dueState === 'EXPIRED').length;
    const dueSoonCount = activeTasks.filter((t) => t.dueState === 'DUE_SOON').length;
    const okCount = activeTasks.filter((t) => t.dueState === 'OK').length;

    return NextResponse.json(
      {
        success: true,
        tasks,
        todayCounters: {
          overdueCount,
          dueSoonCount,
          okCount,
          totalActive: activeTasks.length,
        },
      },
      { headers: EVIDENCE_NO_STORE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error fetching technician tasks:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required' }, { status: 401 });
    }

    const organizationId = auth.organization?.id;
    if (!organizationId) {
      return NextResponse.json({ error: 'No associated organization found' }, { status: 403 });
    }

    const body = await request.json();
    const taskId = body.taskId || body.workOrderId;
    const { status, notes, photoUrl, photoRecords } = body;
    const rawActionTaken = body.actionTaken ?? body.action_taken;

    if (!taskId || !status) {
      return NextResponse.json({ error: 'taskId and status are required' }, { status: 400 });
    }

    // Strict server-side photo URL validation (rejects blob:/data:/non-https/cross-org)
    let validatedPhotoUrl: string | undefined;
    if (photoUrl !== undefined && photoUrl !== null && String(photoUrl).trim() !== '') {
      const check = validateStoredPhotoUrl(photoUrl, organizationId);
      if (!check.valid) {
        return NextResponse.json({ error: check.error }, { status: check.status });
      }
      validatedPhotoUrl = check.url;
    }
    const validatedPhotos: Array<{
      clientPhotoId: string;
      photoUrl: string;
      caption: string | null;
      capturedAt: Date;
      dayOfWeek: string | null;
      latitude: number | null;
      longitude: number | null;
      gpsAccuracy: number | null;
      gpsSource: string | null;
    }> = [];
    if (Array.isArray(photoRecords)) {
      for (let i = 0; i < photoRecords.length; i++) {
        const pr = photoRecords[i];
        const rawU = pr?.photoUrl || pr?.storageUrl;
        if (!rawU) continue;
        const check = validateStoredPhotoUrl(rawU, organizationId);
        if (!check.valid) {
          return NextResponse.json({ error: check.error }, { status: check.status });
        }
        const dt = pr?.capturedAt ? new Date(pr.capturedAt) : new Date();
        validatedPhotos.push({
          clientPhotoId: sanitizeIdSegment(pr?.clientPhotoId || `task-${taskId}-${i}`, `task-${taskId}-${i}`),
          photoUrl: check.url,
          caption: pr?.caption || null,
          capturedAt: isNaN(dt.getTime()) ? new Date() : dt,
          dayOfWeek: pr?.dayOfWeek || null,
          latitude: pr?.latitude != null ? Number(pr.latitude) : null,
          longitude: pr?.longitude != null ? Number(pr.longitude) : null,
          gpsAccuracy: pr?.gpsAccuracy != null ? Number(pr.gpsAccuracy) : null,
          gpsSource: pr?.gpsSource || null,
        });
      }
      if (!validatedPhotoUrl && validatedPhotos[0]) {
        validatedPhotoUrl = validatedPhotos[0].photoUrl;
      }
    }

    // Valid statuses: OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
    const validStatuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
    }

    if (taskId.startsWith('AMC-')) {
      // For routine AMC items, a status change is informational or handled via inspection submit
      return NextResponse.json({
        success: true,
        message: 'Inspection status updated',
        task: { id: taskId, status },
      });
    }

    const existing = await (db as any).workOrder.findFirst({
      where: { id: taskId, organizationId },
      select: { id: true, title: true, buildingId: true, equipmentId: true, notes: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }

    const updateData: any = { status };
    if (status === 'COMPLETED' || rawActionTaken !== undefined) {
      const validation = validateTaskCompletionAction(
        rawActionTaken,
        notes !== undefined ? notes : existing.notes
      );
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      updateData.actionTaken = validation.actionTaken;
      if (notes !== undefined) {
        updateData.notes = validation.notes;
      }
    } else if (notes !== undefined) {
      const trimmed = typeof notes === 'string' ? notes.trim() : '';
      updateData.notes = trimmed.length > 0 ? trimmed : null;
    }

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }
    if (validatedPhotoUrl) {
      updateData.photoUrl = validatedPhotoUrl;
    }

    for (const pr of validatedPhotos) {
      await (db as any).workOrderPhoto.upsert({
        where: { clientPhotoId: pr.clientPhotoId },
        update: { workOrderId: existing.id, photoUrl: pr.photoUrl, caption: pr.caption },
        create: {
          workOrderId: existing.id,
          organizationId,
          clientPhotoId: pr.clientPhotoId,
          photoUrl: pr.photoUrl,
          caption: pr.caption,
          capturedAt: pr.capturedAt,
          dayOfWeek: pr.dayOfWeek,
          latitude: pr.latitude,
          longitude: pr.longitude,
          gpsAccuracy: pr.gpsAccuracy,
          gpsSource: pr.gpsSource,
        },
      });
    }

    const updatedRaw = await (db as any).workOrder.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        building: true,
        equipment: true,
        photos: { orderBy: { createdAt: 'desc' } },
      },
    });
    const [updated] = await signWorkOrderRecords([updatedRaw], organizationId);

    if (status === 'COMPLETED') {
      await logAuditActivity({
        organizationId,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: 'WORK_ORDER_COMPLETED',
        entityType: 'WorkOrder',
        entityId: updated.id,
        details: JSON.stringify({
          workOrderId: updated.id,
          title: updated.title,
          buildingId: updated.buildingId,
          buildingName: updated.building?.name || null,
          equipmentId: updated.equipmentId || null,
          status: 'COMPLETED',
          actionTaken: updated.actionTaken || 'NO_ACTION',
          notes: updated.notes || null,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      task: updated,
    });
  } catch (error: any) {
    console.error('Error updating task status:', error);
    return NextResponse.json({ error: error.message || 'Failed to update task' }, { status: 500 });
  }
}
