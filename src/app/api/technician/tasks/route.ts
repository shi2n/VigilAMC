import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor } from '@/lib/techSession';

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
            location: true,
            floor: true,
            wing: true,
            status: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });

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

    // Map Work Orders
    for (const wo of workOrders) {
      let floorZone = wo.equipment?.floor || '';
      if (!floorZone && wo.equipment?.location) {
        const m = wo.equipment.location.match(/^(B\d|Basement\s*\d?|Ground(?:\s*Floor)?|GF|Floor\s*\d+|Level\s*\d+|Terrace|Pump\s*Room|Lobby|Gate)/i);
        floorZone = m ? m[1] : wo.equipment.location.split(/[-–•,]/)[0]?.trim() || 'Main Zone';
      }
      if (!floorZone) floorZone = 'General';

      const dueTs = wo.dueDate ? new Date(wo.dueDate).getTime() : 0;
      let dueState: 'EXPIRED' | 'DUE_SOON' | 'OK' = 'OK';
      let diffDays = 0;
      if (dueTs > 0) {
        diffDays = Math.ceil((dueTs - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) dueState = 'EXPIRED';
        else if (diffDays <= 2) dueState = 'DUE_SOON';
        else dueState = 'OK';
      }

      tasks.push({
        id: wo.id,
        source: 'WORK_ORDER',
        title: wo.title,
        description: wo.description,
        priority: wo.priority || 'MEDIUM',
        status: wo.status, // OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
        dueDate: wo.dueDate,
        completedAt: wo.completedAt,
        dueState,
        diffDays,
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
      });
    }

    // Map Routine AMC Inspections (deduplicated against existing work orders for same equipment)
    const coveredEquipmentIds = new Set(workOrders.map((w: any) => w.equipmentId).filter(Boolean));
    for (const b of buildingsWithDueEquip) {
      for (const eq of b.equipments || []) {
        if (coveredEquipmentIds.has(eq.id)) continue;

        const isRecentlyCompleted = (eq.inspections || []).length > 0;
        const dueTs = eq.nextDueDate ? new Date(eq.nextDueDate).getTime() : 0;
        let diffDays = 0;
        let dueState: 'EXPIRED' | 'DUE_SOON' | 'OK' = 'OK';

        if (dueTs > 0) {
          diffDays = Math.ceil((dueTs - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays < 0 || eq.status === 'OVERDUE' || eq.status === 'DEFECTIVE') {
            dueState = 'EXPIRED';
          } else if (diffDays <= 2 || eq.status === 'DUE_SOON') {
            dueState = 'DUE_SOON';
          } else {
            dueState = 'OK';
          }
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

    return NextResponse.json({
      success: true,
      tasks,
      todayCounters: {
        overdueCount,
        dueSoonCount,
        okCount,
        totalActive: activeTasks.length,
      },
    });
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

    const body = await request.json();
    const { taskId, status, notes } = body;

    if (!taskId || !status) {
      return NextResponse.json({ error: 'taskId and status are required' }, { status: 400 });
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

    const updateData: any = { status };
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }
    if (notes) {
      updateData.notes = String(notes).trim();
    }

    const updated = await (db as any).workOrder.update({
      where: { id: taskId },
      data: updateData,
      include: {
        building: true,
        equipment: true,
      },
    });

    return NextResponse.json({
      success: true,
      task: updated,
    });
  } catch (error: any) {
    console.error('Error updating task status:', error);
    return NextResponse.json({ error: error.message || 'Failed to update task' }, { status: 500 });
  }
}
