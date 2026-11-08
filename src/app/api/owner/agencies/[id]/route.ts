import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireOwnerApi } from '@/lib/ownerAuth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const gate = await requireOwnerApi(request);
  if (!gate.ok) return gate.response;

  try {
    const resolvedParams = await Promise.resolve(params);
    const agencyId = resolvedParams.id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      org,
      users,
      buildings,
      recentInspections,
      inspectionReports,
      complianceReports,
      workOrders,
      inspections30dCount,
    ] = await Promise.all([
      (db as any).organization.findUnique({
        where: { id: agencyId },
        include: {
          _count: {
            select: {
              buildings: true,
              clients: true,
              equipments: true,
              inspections: true,
              workOrders: true,
              correctiveActions: true,
              portalUsers: true,
            },
          },
        },
      }),
      (db as any).userProfile.findMany({
        where: { organizationId: agencyId },
        include: {
          _count: {
            select: {
              inspections: true,
              syncQueueItems: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      (db as any).building.findMany({
        where: { organizationId: agencyId },
        include: {
          client: { select: { id: true, name: true } },
          _count: {
            select: {
              equipments: true,
              inspections: true,
              workOrders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      (db as any).inspection.findMany({
        where: { organizationId: agencyId },
        include: {
          building: { select: { id: true, name: true } },
          equipment: { select: { id: true, qrCode: true, type: true, floor: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      (db as any).inspectionReport.findMany({
        where: { organizationId: agencyId },
        include: {
          building: {
            select: {
              id: true,
              name: true,
              reportAcks: {
                select: { id: true, acknowledgedAt: true },
              },
            },
          },
        },
        orderBy: { generatedAt: 'desc' },
        take: 30,
      }),
      (db as any).complianceReport.findMany({
        where: { organizationId: agencyId },
        include: {
          building: {
            select: {
              id: true,
              name: true,
              reportAcks: {
                select: { id: true, acknowledgedAt: true },
              },
            },
          },
        },
        orderBy: { generatedAt: 'desc' },
        take: 30,
      }),
      (db as any).workOrder.findMany({
        where: { organizationId: agencyId },
        include: {
          building: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      (db as any).inspection.count({
        where: {
          organizationId: agencyId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    if (!org) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    const usersList = users.map((u: any) => ({
      id: u.id,
      fullName: u.fullName || 'User',
      email: u.email,
      phone: u.phone || '',
      employeeId: u.employeeId || null,
      role: u.role,
      status: u.status,
      lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null,
      createdAt: new Date(u.createdAt).toISOString(),
      inspectionsCount: u._count?.inspections || 0,
      syncQueueCount: u._count?.syncQueueItems || 0,
    }));

    const techniciansList = usersList.filter((u: any) => u.role === 'TECHNICIAN');

    const combinedReports = [
      ...inspectionReports.map((r: any) => ({
        id: r.id,
        reportRef: r.reportReferenceId,
        title: r.reportTitle,
        jurisdiction: r.jurisdictionCode,
        buildingId: r.buildingId,
        buildingName: r.building?.name || 'Building',
        assetsCount: r.totalRegistered,
        status: r.inspectionStatus,
        acknowledged: (r.building?.reportAcks?.length || 0) > 0,
        generatedAt: new Date(r.generatedAt).toISOString(),
        linkUrl: `/report/${r.buildingId}`,
      })),
      ...complianceReports.map((r: any) => ({
        id: r.id,
        reportRef: r.reportNumber,
        title: 'Fire Safety Inspection Report',
        jurisdiction: 'GENERAL',
        buildingId: r.buildingId,
        buildingName: r.building?.name || 'Building',
        assetsCount: r.totalEquipment,
        status: r.status,
        acknowledged: (r.building?.reportAcks?.length || 0) > 0,
        generatedAt: new Date(r.generatedAt).toISOString(),
        linkUrl: `/report/${r.buildingId}`,
      })),
    ].sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    return NextResponse.json(
      {
        agency: {
          id: org.id,
          name: org.name,
          contactPerson: org.contactPerson || null,
          email: org.email || '',
          phone: org.phone || '',
          address: org.address || '',
          city: org.city || '',
          state: org.state || '',
          gstin: org.gstin || null,
          licenseNumber: org.licenseNumber || null,
          plan: org.plan || 'FOUNDING_MONTHLY',
          monthlyPrice: typeof org.monthlyPrice === 'number' ? org.monthlyPrice : 3999,
          subscriptionStatus: org.subscriptionStatus || 'ACTIVE',
          subscriptionExpiresAt: org.subscriptionExpiresAt
            ? new Date(org.subscriptionExpiresAt).toISOString()
            : null,
          subscriptionNotes: org.subscriptionNotes || null,
          createdAt: new Date(org.createdAt).toISOString(),
          counts: {
            buildings: org._count?.buildings || 0,
            clients: org._count?.clients || 0,
            assets: org._count?.equipments || 0,
            users: usersList.length,
            technicians: techniciansList.length,
            inspectionsTotal: org._count?.inspections || 0,
            inspections30d: inspections30dCount,
            reportsTotal: combinedReports.length,
            workOrdersTotal: org._count?.workOrders || 0,
            correctiveActionsTotal: org._count?.correctiveActions || 0,
            portalUsersTotal: org._count?.portalUsers || 0,
          },
        },
        users: usersList,
        technicians: techniciansList,
        buildings: buildings.map((b: any) => ({
          id: b.id,
          name: b.name,
          address: b.address,
          city: b.city || '',
          state: b.state || '',
          clientName: b.client?.name || 'Direct Facility',
          assetsCount: b._count?.equipments || 0,
          inspectionsCount: b._count?.inspections || 0,
          workOrdersCount: b._count?.workOrders || 0,
          reportUrl: `/report/${b.id}`,
          buildingUrl: `/buildings/${b.id}`,
        })),
        recentInspections: recentInspections.map((i: any) => ({
          id: i.id,
          buildingId: i.buildingId,
          buildingName: i.building?.name || 'Building',
          assetTag: i.equipment?.qrCode || 'Facility Check',
          assetType: i.equipment?.type || 'Equipment',
          technicianName: i.technicianName || 'Field Technician',
          status: i.status,
          approvalStatus: i.approvalStatus,
          createdAt: new Date(i.createdAt || i.date).toISOString(),
          linkUrl: `/report/${i.buildingId}`,
        })),
        recentReports: combinedReports,
        workOrders: workOrders.map((wo: any) => ({
          id: wo.id,
          title: wo.title,
          description: wo.description,
          status: wo.status,
          priority: wo.priority,
          buildingId: wo.buildingId,
          buildingName: wo.building?.name || 'Building',
          assignedToName: wo.assignedTo?.fullName || 'Unassigned',
          dueDate: wo.dueDate ? new Date(wo.dueDate).toISOString() : null,
          completedAt: wo.completedAt ? new Date(wo.completedAt).toISOString() : null,
          createdAt: new Date(wo.createdAt).toISOString(),
          linkUrl: `/buildings/${wo.buildingId}`,
        })),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in GET /api/owner/agencies/[id]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load agency drill-down' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
