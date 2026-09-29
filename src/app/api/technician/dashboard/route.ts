import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    const userId = auth.user.id;
    const organizationId = auth.organization?.id;

    if (!organizationId) {
      return NextResponse.json({ error: 'No associated agency organization found' }, { status: 403 });
    }

    // 1. Get technician's assigned buildings
    const assignments = await (db as any).technicianBuildingAssignment.findMany({
      where: { technicianId: userId },
      include: {
        building: {
          include: {
            client: true,
            equipments: {
              select: { id: true, status: true, nextDueDate: true },
            },
          },
        },
      },
    });

    let assignedBuildings = assignments.map((a: any) => a.building);

    // If no explicit assignments, fallback to all agency buildings
    if (assignedBuildings.length === 0) {
      assignedBuildings = await (db as any).building.findMany({
        where: { organizationId },
        include: {
          client: true,
          equipments: {
            select: { id: true, status: true, nextDueDate: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    }

    const now = new Date();

    // Map buildings with live asset counts and due status
    const evaluatedBuildings = assignedBuildings.map((b: any) => {
      let overdue = 0;
      let dueSoon = 0;
      let compliant = 0;

      (b.equipments || []).forEach((eq: any) => {
        const diffDays = Math.ceil((new Date(eq.nextDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) overdue++;
        else if (diffDays <= 30) dueSoon++;
        else compliant++;
      });

      return {
        id: b.id,
        name: b.name,
        address: b.address,
        clientName: b.client?.name || 'General Facility',
        totalAssets: b.equipments?.length || 0,
        overdueCount: overdue,
        dueSoonCount: dueSoon,
        compliantCount: compliant,
      };
    });

    // 2. Get assigned work orders / jobs
    const [jobs, workOrders, recentLogs] = await Promise.all([
      (db as any).job.findMany({
        where: {
          organizationId,
          technicianId: userId,
        },
        include: {
          building: { select: { id: true, name: true, address: true } },
          client: { select: { name: true } },
        },
        orderBy: { scheduledDate: 'asc' },
        take: 20,
      }),
      (db as any).workOrder.findMany({
        where: {
          organizationId,
          assignedToId: userId,
        },
        include: {
          building: { select: { id: true, name: true, address: true } },
          equipment: { select: { id: true, qrCode: true, type: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 20,
      }),
      (db as any).serviceLog.findMany({
        where: {
          technicianName: auth.profile?.fullName || auth.user.email,
        },
        include: {
          equipment: {
            include: {
              building: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { servicedAt: 'desc' },
        take: 15,
      }),
    ]);

    const stats = {
      assignedBuildingsCount: evaluatedBuildings.length,
      activeJobsCount: jobs.filter((j: any) => j.status === 'ASSIGNED' || j.status === 'IN_PROGRESS').length,
      completedJobsCount: jobs.filter((j: any) => j.status === 'COMPLETED').length,
      openWorkOrdersCount: workOrders.filter((w: any) => w.status === 'OPEN' || w.status === 'IN_PROGRESS').length,
      totalServicesLogged: recentLogs.length,
    };

    return NextResponse.json({
      success: true,
      profile: {
        id: auth.profile.id,
        fullName: auth.profile.fullName || 'Field Technician',
        email: auth.profile.email,
        phone: auth.profile.phone,
        employeeId: auth.profile.employeeId,
        role: auth.profile.role,
        agencyName: auth.organization.name,
      },
      stats,
      assignedBuildings: evaluatedBuildings,
      jobs,
      workOrders,
      recentServices: recentLogs,
    });
  } catch (error: any) {
    console.error('Error fetching technician dashboard data:', error);
    const status = error.message?.startsWith('UNAUTHORIZED') ? 401 : error.message?.startsWith('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
