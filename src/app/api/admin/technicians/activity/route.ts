import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    const organizationId = auth.organization.id;

    const { searchParams } = new URL(request.url);
    const technicianId = searchParams.get('technicianId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = Math.min(100, Math.max(10, Number(searchParams.get('limit')) || 50));

    const where: any = {
      organizationId,
    };

    if (technicianId && technicianId !== 'ALL') {
      where.userId = technicianId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) where.createdAt.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          where.createdAt.lte = end;
        }
      }
    }

    const [activities, technicians] = await Promise.all([
      (db as any).activityLog.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      (db as any).userProfile.findMany({
        where: {
          organizationId,
          role: 'TECHNICIAN',
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          employeeId: true,
          status: true,
          lastLoginAt: true,
          phone: true,
        },
        orderBy: { fullName: 'asc' },
      }),
    ]);

    // Map user profiles to activities
    const techMap = new Map();
    technicians.forEach((t: any) => {
      techMap.set(t.id, t);
    });

    const enrichedActivities = activities.map((act: any) => {
      const tech = act.userId ? techMap.get(act.userId) : null;
      return {
        id: act.id,
        action: act.action,
        entityType: act.entityType,
        entityId: act.entityId,
        details: act.details,
        createdAt: act.createdAt,
        userEmail: act.userEmail,
        technician: tech
          ? {
              id: tech.id,
              name: tech.fullName || tech.email,
              email: tech.email,
              status: tech.status,
              lastLoginAt: tech.lastLoginAt,
            }
          : {
              name: act.userEmail?.split('@')[0] || 'System',
              email: act.userEmail || '',
              status: 'UNKNOWN',
              lastLoginAt: null,
            },
      };
    });

    // Detailed metrics if single technician selected
    let techMetrics: any = null;
    if (technicianId && technicianId !== 'ALL') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        todayChecks,
        weekChecks,
        monthChecks,
        pendingSyncs,
        lastTask,
        latestInspections,
      ] = await Promise.all([
        (db as any).inspection.count({
          where: {
            technicianId,
            organizationId,
            date: { gte: startOfToday },
          },
        }).catch(() => 0),
        (db as any).inspection.count({
          where: {
            technicianId,
            organizationId,
            date: { gte: sevenDaysAgo },
          },
        }).catch(() => 0),
        (db as any).inspection.count({
          where: {
            technicianId,
            organizationId,
            date: { gte: thirtyDaysAgo },
          },
        }).catch(() => 0),
        (db as any).syncQueue.count({
          where: {
            technicianId,
            status: 'PENDING',
          },
        }).catch(() => 0),
        (db as any).workOrder.findFirst({
          where: {
            assignedToId: technicianId,
            organizationId,
          },
          include: {
            building: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        }).catch(() => null),
        (db as any).inspection.findMany({
          where: {
            technicianId,
            organizationId,
          },
          include: {
            building: { select: { name: true } },
            equipment: { select: { qrCode: true, type: true } },
          },
          orderBy: { date: 'desc' },
          take: 10,
        }).catch(() => []),
      ]);

      const techObj = techMap.get(technicianId);
      const lastInspection = latestInspections[0];
      const lastSeen = techObj?.lastLoginAt || lastInspection?.date || null;

      techMetrics = {
        lastSeen,
        inspectionsToday: todayChecks,
        inspections7d: weekChecks,
        inspections30d: monthChecks,
        pendingSyncCount: pendingSyncs,
        lastAssignedTask: lastTask
          ? {
              id: lastTask.id,
              title: lastTask.title,
              status: lastTask.status,
              dueDate: lastTask.dueDate,
              buildingName: lastTask.building?.name || '—',
            }
          : null,
        latestActions: latestInspections.map((ins: any) => ({
          id: ins.id,
          date: ins.date,
          status: ins.status,
          buildingName: ins.building?.name || 'Unknown Facility',
          equipment: `${ins.equipment?.type || 'Equipment'} (${ins.equipment?.qrCode || '—'})`,
          remarks: ins.remarks,
        })),
      };
    }

    return NextResponse.json({
      success: true,
      activities: enrichedActivities,
      technicians,
      techMetrics,
    });
  } catch (error: any) {
    console.error('Error fetching technician activity:', error);
    const status = error.message?.startsWith('UNAUTHORIZED') ? 401 : error.message?.startsWith('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
