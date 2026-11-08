import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireOwnerApi } from '@/lib/ownerAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const gate = await requireOwnerApi(request);
  if (!gate.ok) return gate.response;

  try {
    const url = new URL(request.url);
    const searchQuery = (url.searchParams.get('q') || '').trim();
    const now = new Date();

    const [
      users,
      syncQueueItems,
      deviceTokens,
      recentInspections,
      inspectionReports,
      complianceReports,
      workOrders,
      correctiveActions,
      matchedAssets,
    ] = await Promise.all([
      (db as any).userProfile.findMany({
        include: {
          organization: {
            select: { id: true, name: true },
          },
          _count: {
            select: {
              inspections: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      (db as any).syncQueue.findMany({
        select: {
          id: true,
          technicianId: true,
          status: true,
          createdAt: true,
          syncedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
      (db as any).deviceToken.findMany({
        select: {
          id: true,
          technicianId: true,
          platform: true,
          lastSeenAt: true,
        },
      }),
      (db as any).inspection.findMany({
        include: {
          organization: { select: { id: true, name: true } },
          building: {
            select: {
              id: true,
              name: true,
              _count: { select: { equipments: true } },
            },
          },
          equipment: { select: { id: true, qrCode: true, type: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 60,
      }),
      (db as any).inspectionReport.findMany({
        include: {
          organization: { select: { id: true, name: true } },
          building: {
            select: {
              id: true,
              name: true,
              reportAcks: {
                select: { id: true, reportRef: true, acknowledgedAt: true },
              },
            },
          },
        },
        orderBy: { generatedAt: 'desc' },
        take: 50,
      }),
      (db as any).complianceReport.findMany({
        include: {
          organization: { select: { id: true, name: true } },
          building: {
            select: {
              id: true,
              name: true,
              reportAcks: {
                select: { id: true, reportRef: true, acknowledgedAt: true },
              },
            },
          },
        },
        orderBy: { generatedAt: 'desc' },
        take: 50,
      }),
      (db as any).workOrder.findMany({
        include: {
          organization: { select: { id: true, name: true } },
          building: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      (db as any).correctiveAction.findMany({
        include: {
          organization: { select: { id: true, name: true } },
          building: { select: { id: true, name: true } },
        },
        orderBy: { openedAt: 'desc' },
        take: 100,
      }),
      searchQuery.length >= 2
        ? (db as any).equipment.findMany({
            where: {
              OR: [
                { qrCode: { contains: searchQuery, mode: 'insensitive' } },
                { serialNumber: { contains: searchQuery, mode: 'insensitive' } },
                { type: { contains: searchQuery, mode: 'insensitive' } },
              ],
            },
            include: {
              organization: { select: { id: true, name: true } },
              building: { select: { id: true, name: true } },
            },
            take: 25,
          })
        : Promise.resolve([]),
    ]);

    // Aggregate sync queue & device metrics per technician
    const syncByTech = new Map<
      string,
      { pendingCount: number; failedCount: number; syncedCount: number; lastSyncedAt: string | null }
    >();
    for (const s of syncQueueItems) {
      if (!s.technicianId) continue;
      const cur = syncByTech.get(s.technicianId) || {
        pendingCount: 0,
        failedCount: 0,
        syncedCount: 0,
        lastSyncedAt: null,
      };
      if (s.status === 'PENDING') cur.pendingCount++;
      else if (s.status === 'FAILED') cur.failedCount++;
      else if (s.status === 'SYNCED') {
        cur.syncedCount++;
        const ts = new Date(s.syncedAt || s.createdAt).toISOString();
        if (!cur.lastSyncedAt || ts > cur.lastSyncedAt) cur.lastSyncedAt = ts;
      }
      syncByTech.set(s.technicianId, cur);
    }

    const devicesByTech = new Map<string, { count: number; lastSeenAt: string | null }>();
    for (const dt of deviceTokens) {
      if (!dt.technicianId) continue;
      const cur = devicesByTech.get(dt.technicianId) || { count: 0, lastSeenAt: null };
      cur.count++;
      const ts = new Date(dt.lastSeenAt).toISOString();
      if (!cur.lastSeenAt || ts > cur.lastSeenAt) cur.lastSeenAt = ts;
      devicesByTech.set(dt.technicianId, cur);
    }

    const latestInspByTech = new Map<string, string>();
    for (const i of recentInspections) {
      if (!i.technicianId) continue;
      const ts = new Date(i.createdAt || i.date).toISOString();
      const prev = latestInspByTech.get(i.technicianId);
      if (!prev || ts > prev) latestInspByTech.set(i.technicianId, ts);
    }

    const allUsers = users.map((u: any) => ({
      id: u.id,
      name: u.fullName || 'User',
      email: u.email,
      phone: u.phone || '',
      employeeId: u.employeeId || null,
      role: u.role,
      status: u.status,
      agencyId: u.organizationId || null,
      agencyName: u.organization?.name || 'Unassigned',
      lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null,
      createdAt: new Date(u.createdAt).toISOString(),
    }));

    const allTechnicians = users
      .filter((u: any) => u.role === 'TECHNICIAN')
      .map((t: any) => {
        const sync = syncByTech.get(t.id) || {
          pendingCount: 0,
          failedCount: 0,
          syncedCount: 0,
          lastSyncedAt: null,
        };
        const dev = devicesByTech.get(t.id) || { count: 0, lastSeenAt: null };
        const latestInsp = latestInspByTech.get(t.id) || null;
        const loginIso = t.lastLoginAt ? new Date(t.lastLoginAt).toISOString() : null;

        const candidateDates = [loginIso, sync.lastSyncedAt, dev.lastSeenAt, latestInsp].filter(
          Boolean
        ) as string[];
        candidateDates.sort();
        const lastActiveAt =
          candidateDates.length > 0 ? candidateDates[candidateDates.length - 1] : null;

        return {
          id: t.id,
          name: t.fullName || t.email,
          email: t.email,
          phone: t.phone || '',
          employeeId: t.employeeId || null,
          status: t.status,
          agencyId: t.organizationId || null,
          agencyName: t.organization?.name || 'Unassigned',
          lastActiveAt,
          devicesCount: dev.count,
          pendingOutboxCount: sync.pendingCount,
          failedSyncCount: sync.failedCount,
          lastSyncedAt: sync.lastSyncedAt,
          totalInspections: t._count?.inspections || 0,
          createdAt: new Date(t.createdAt).toISOString(),
        };
      });

    // F) WORK: Inspections
    const inspectionsList = recentInspections.map((i: any) => ({
      id: i.id,
      buildingId: i.buildingId,
      buildingName: i.building?.name || 'Building',
      agencyId: i.organizationId,
      agencyName: i.organization?.name || 'Agency',
      status: i.status,
      approvalStatus: i.approvalStatus,
      assetTag: i.equipment?.qrCode || 'Asset',
      assetType: i.equipment?.type || 'Equipment',
      assetsCount: i.building?._count?.equipments || 1,
      technicianName: i.technicianName || 'Field Technician',
      createdAt: new Date(i.createdAt || i.date).toISOString(),
      linkUrl: `/report/${i.buildingId}`,
    }));

    // F) WORK: Reports
    const reportsList = [
      ...inspectionReports.map((r: any) => {
        const acks = r.building?.reportAcks || [];
        return {
          id: r.id,
          reportRef: r.reportReferenceId,
          jurisdictionCode: r.jurisdictionCode,
          agencyId: r.organizationId || null,
          agencyName: r.organization?.name || 'Agency',
          buildingId: r.buildingId,
          buildingName: r.building?.name || 'Building',
          assetsCount: r.totalRegistered,
          status: r.inspectionStatus,
          acknowledged: acks.length > 0,
          acknowledgedAt: acks[0]?.acknowledgedAt
            ? new Date(acks[0].acknowledgedAt).toISOString()
            : null,
          generatedAt: new Date(r.generatedAt).toISOString(),
          linkUrl: `/report/${r.buildingId}`,
        };
      }),
      ...complianceReports.map((r: any) => {
        const acks = r.building?.reportAcks || [];
        return {
          id: r.id,
          reportRef: r.reportNumber,
          jurisdictionCode: 'GENERAL',
          agencyId: r.organizationId || null,
          agencyName: r.organization?.name || 'Agency',
          buildingId: r.buildingId,
          buildingName: r.building?.name || 'Building',
          assetsCount: r.totalEquipment,
          status: r.status,
          acknowledged: acks.length > 0,
          acknowledgedAt: acks[0]?.acknowledgedAt
            ? new Date(acks[0].acknowledgedAt).toISOString()
            : null,
          generatedAt: new Date(r.generatedAt).toISOString(),
          linkUrl: `/report/${r.buildingId}`,
        };
      }),
    ].sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    // F) WORK: Work Orders (strictly OPEN | ASSIGNED | IN_PROGRESS | COMPLETED | CANCELLED)
    const workOrdersList = workOrders.map((wo: any) => {
      const createdTs = new Date(wo.createdAt).getTime();
      const ageDays = Math.max(0, Math.floor((now.getTime() - createdTs) / (1000 * 60 * 60 * 24)));
      const isOverdue =
        wo.status !== 'COMPLETED' &&
        wo.status !== 'CANCELLED' &&
        ((wo.dueDate && new Date(wo.dueDate).getTime() < now.getTime()) || ageDays > 7);

      return {
        id: wo.id,
        title: wo.title,
        description: wo.description,
        status: wo.status, // OPEN | ASSIGNED | IN_PROGRESS | COMPLETED | CANCELLED
        priority: wo.priority,
        ageDays,
        isOverdue,
        isAutoScheduled: Boolean(wo.isAutoScheduled),
        agencyId: wo.organizationId,
        agencyName: wo.organization?.name || 'Agency',
        buildingId: wo.buildingId,
        buildingName: wo.building?.name || 'Building',
        assignedToName: wo.assignedTo?.fullName || 'Unassigned',
        dueDate: wo.dueDate ? new Date(wo.dueDate).toISOString() : null,
        completedAt: wo.completedAt ? new Date(wo.completedAt).toISOString() : null,
        createdAt: new Date(wo.createdAt).toISOString(),
        linkUrl: `/buildings/${wo.buildingId}`,
      };
    });

    // F) WORK: Corrective Actions (highlighting overdue items)
    const correctiveActionsList = correctiveActions.map((ca: any) => {
      const openedTs = new Date(ca.openedAt).getTime();
      const ageDays = Math.max(0, Math.floor((now.getTime() - openedTs) / (1000 * 60 * 60 * 24)));
      const isResolved = ca.status === 'VERIFIED' || ca.status === 'CLOSED';
      const isOverdue = !isResolved && ageDays > 7;
      const isDueSoon = !isResolved && !isOverdue && ageDays >= 3;

      return {
        id: ca.id,
        title: ca.title,
        assetRef: ca.assetRef || null,
        severity: ca.severity,
        status: ca.status,
        ageDays,
        isOverdue,
        isDueSoon,
        agencyId: ca.organizationId,
        agencyName: ca.organization?.name || 'Agency',
        buildingId: ca.buildingId,
        buildingName: ca.building?.name || 'Building',
        openedAt: new Date(ca.openedAt).toISOString(),
        linkUrl: `/report/${ca.buildingId}`,
      };
    });

    return NextResponse.json(
      {
        people: {
          users: allUsers,
          technicians: allTechnicians,
        },
        work: {
          inspections: inspectionsList,
          reports: reportsList,
          workOrders: workOrdersList,
          correctiveActions: correctiveActionsList,
        },
        matchedAssets: matchedAssets.map((eq: any) => ({
          id: eq.id,
          assetTag: eq.qrCode,
          type: eq.type,
          capacity: eq.capacity,
          status: eq.status,
          agencyId: eq.organizationId || null,
          agencyName: eq.organization?.name || 'Agency',
          buildingId: eq.buildingId,
          buildingName: eq.building?.name || 'Building',
          linkUrl: `/verify/${encodeURIComponent(eq.qrCode)}`,
        })),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in GET /api/owner/workspace:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load owner workspace data' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
