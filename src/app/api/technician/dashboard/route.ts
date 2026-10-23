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
    const role = auth.profile?.role;

    if (!organizationId) {
      return NextResponse.json({ error: 'No associated agency organization found' }, { status: 403 });
    }

    const equipInclude = {
      id: true,
      qrCode: true,
      type: true,
      category: true,
      capacity: true,
      location: true,
      floor: true,
      wing: true,
      status: true,
      lastServiceDate: true,
      nextDueDate: true,
      serviceIntervalMonths: true,
      photoUrl: true,
      inspections: {
        orderBy: { date: 'desc' as const },
        take: 1,
        select: {
          id: true,
          date: true,
          status: true,
          latitude: true,
          longitude: true,
          gpsAccuracy: true,
          remarks: true,
          photos: true,
          technicianName: true,
        },
      },
    };

    const isAdmin = role === 'ORG_ADMIN' || role === 'SUPER_ADMIN';

    // Fetch assignments, jobs, workOrders, and recentInspections in parallel
    const [assignments, jobs, workOrders, recentInspections] = await Promise.all([
      isAdmin
        ? Promise.resolve([])
        : (db as any).technicianBuildingAssignment.findMany({
            where: { technicianId: userId },
            include: {
              building: {
                include: {
                  client: true,
                  equipments: {
                    select: equipInclude,
                    orderBy: { location: 'asc' },
                  },
                },
              },
            },
          }),
      (db as any).job.findMany({
        where: isAdmin
          ? { organizationId }
          : {
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
        where: isAdmin
          ? { organizationId }
          : {
              organizationId,
              OR: [{ assignedToId: userId }, { assignedToId: null }],
            },
        include: {
          building: { select: { id: true, name: true, address: true } },
          equipment: { select: { id: true, qrCode: true, type: true, location: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      (db as any).inspection.findMany({
        where: isAdmin
          ? { organizationId }
          : {
              organizationId,
              OR: [
                { technicianId: userId },
                { technicianName: auth.profile?.fullName || auth.user.email },
              ],
            },
        include: {
          building: { select: { id: true, name: true, address: true } },
          equipment: { select: { id: true, qrCode: true, type: true, capacity: true, location: true } },
        },
        orderBy: { date: 'desc' },
        take: 25,
      }),
    ]);

    let assignedBuildings = assignments.map((a: any) => a.building);

    // If ORG_ADMIN or no explicit building assignments, show all agency buildings
    if (assignedBuildings.length === 0) {
      assignedBuildings = await (db as any).building.findMany({
        where: { organizationId },
        include: {
          client: true,
          equipments: {
            select: equipInclude,
            orderBy: { location: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

    // Map buildings with live asset counts, floors, and due status
    const evaluatedBuildings = assignedBuildings.map((b: any) => {
      let overdue = 0;
      let dueSoon = 0;
      let compliant = 0;
      let checkedRecently = 0;

      const enrichedEquipments = (b.equipments || []).map((eq: any) => {
        const diffDays = Math.ceil(
          (new Date(eq.nextDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        const latestInsp = eq.inspections?.[0] || null;
        const lastCheckTs = latestInsp?.date
          ? new Date(latestInsp.date).getTime()
          : eq.lastServiceDate
          ? new Date(eq.lastServiceDate).getTime()
          : 0;

        const isCheckedToday = lastCheckTs >= todayStart;
        const isCheckedCycle = lastCheckTs >= thirtyDaysAgo && eq.status !== 'DEFECTIVE' && diffDays > 0;

        if (isCheckedToday || isCheckedCycle) {
          checkedRecently++;
        }

        if (diffDays < 0 || eq.status === 'OVERDUE' || eq.status === 'DEFECTIVE') overdue++;
        else if (diffDays <= 30 || eq.status === 'DUE_SOON') dueSoon++;
        else compliant++;

        // Infer floor / zone pill label cleanly from floor or location
        let floorZone = (eq.floor || '').trim();
        if (!floorZone && eq.location) {
          const loc = String(eq.location).trim();
          const m = loc.match(/^(B\d|Basement\s*\d?|Ground(?:\s*Floor)?|GF|Floor\s*\d+|Level\s*\d+|Terrace|Pump\s*Room|Lobby|Gate)/i);
          if (m) {
            floorZone = m[1];
          } else {
            const firstPart = loc.split(/[-–•,]/)[0]?.trim();
            floorZone = firstPart && firstPart.length <= 18 ? firstPart : 'Main Zone';
          }
        }
        if (!floorZone) floorZone = 'General';

        return {
          ...eq,
          floorZone,
          diffDays,
          isCheckedToday,
          isCheckedCycle,
          latestInspection: latestInsp,
        };
      });

      return {
        id: b.id,
        name: b.name,
        address: b.address,
        city: b.city,
        state: b.state,
        clientName: b.client?.name || 'Client Facility',
        clientPhone: b.client?.phone || '',
        totalAssets: enrichedEquipments.length,
        checkedCount: checkedRecently,
        overdueCount: overdue,
        dueSoonCount: dueSoon,
        compliantCount: compliant,
        equipments: enrichedEquipments,
      };
    });

    const stats = {
      assignedBuildingsCount: evaluatedBuildings.length,
      activeJobsCount: jobs.filter((j: any) => j.status === 'ASSIGNED' || j.status === 'IN_PROGRESS').length,
      completedJobsCount: jobs.filter((j: any) => j.status === 'COMPLETED').length,
      openWorkOrdersCount: workOrders.filter((w: any) => w.status === 'OPEN' || w.status === 'IN_PROGRESS').length,
      totalServicesLogged: recentInspections.length,
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
      recentServices: recentInspections,
    });
  } catch (error: any) {
    console.error('Error fetching technician dashboard data:', error);
    const status = error.message?.startsWith('UNAUTHORIZED')
      ? 401
      : error.message?.startsWith('FORBIDDEN')
      ? 403
      : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
