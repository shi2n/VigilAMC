import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, isPlatformOwner } from '@/lib/auth';
import { evaluateEquipmentStatus } from '@/lib/compliance';
import { getPlanConfig, PLAN_CONFIGS } from '@/lib/plans';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth) {
      return NextResponse.json(
        {
          authenticated: false,
          company: null,
          summary: {
            totalBuildings: 0,
            verifiedBuildings: 0,
            dueSoonBuildings: 0,
            overdueBuildings: 0,
            notInspectedBuildings: 0,
            totalEquipments: 0,
            verifiedEquipments: 0,
            overdueEquipments: 0,
            dueSoonEquipments: 0,
            notInspectedEquipments: 0,
          },
          kpis: {
            totalClients: 0,
            totalBuildings: 0,
            totalEquipments: 0,
            activeTechnicians: 0,
            openWorkOrders: 0,
            dueInspections: 0,
            overdueInspections: 0,
            complianceRate: 100,
          },
          buildings: [],
          clients: [],
          equipments: [],
          inspections: [],
          workOrders: [],
          technicians: [],
          subscription: null,
        },
        { status: 401 }
      );
    }

    const organization = auth.organization;
    const organizationId = organization?.id;

    if (!organizationId) {
      return NextResponse.json({
        authenticated: true,
        user: auth.user,
        profile: auth.profile,
        company: null,
        isPlatformOwner: isPlatformOwner(auth),
        summary: {
          totalBuildings: 0,
          verifiedBuildings: 0,
          dueSoonBuildings: 0,
          overdueBuildings: 0,
          notInspectedBuildings: 0,
          totalEquipments: 0,
          verifiedEquipments: 0,
          overdueEquipments: 0,
          dueSoonEquipments: 0,
          notInspectedEquipments: 0,
        },
        kpis: {
          totalClients: 0,
          totalBuildings: 0,
          totalEquipments: 0,
          activeTechnicians: 0,
          openWorkOrders: 0,
          dueInspections: 0,
          overdueInspections: 0,
          complianceRate: 100,
        },
        buildings: [],
        clients: [],
        equipments: [],
        inspections: [],
        workOrders: [],
        technicians: [],
        subscription: null,
      });
    }

    // Execute all tenant operational queries in ONE single Promise.all batch
    const [
      clientsRaw,
      buildingsRaw,
      equipmentsRaw,
      inspectionsRaw,
      workOrdersRaw,
      techniciansRaw,
    ] = await Promise.all([
      (db as any).client.findMany({
        where: { organizationId },
        select: {
          id: true,
          name: true,
          contactPerson: true,
          phone: true,
          email: true,
          createdAt: true,
          buildings: {
            select: {
              id: true,
              name: true,
              address: true,
              _count: {
                select: { equipments: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      (db as any).building.findMany({
        where: { organizationId },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              contactPerson: true,
              phone: true,
              email: true,
            },
          },
          equipments: {
            include: {
              inspections: {
                orderBy: { date: 'desc' },
                take: 1,
                select: {
                  id: true,
                  date: true,
                  latitude: true,
                  longitude: true,
                  photos: true,
                  isImported: true,
                },
              },
            },
            orderBy: { location: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      (db as any).equipment.findMany({
        where: { organizationId },
        include: {
          building: {
            select: { id: true, name: true, client: { select: { name: true } } },
          },
          inspections: {
            orderBy: { date: 'desc' },
            take: 1,
            select: {
              id: true,
              date: true,
              latitude: true,
              longitude: true,
              photos: true,
              isImported: true,
            },
          },
          serviceLogs: {
            orderBy: { servicedAt: 'desc' },
            take: 3,
          },
        },
        orderBy: { nextDueDate: 'asc' },
      }),
      (db as any).inspection.findMany({
        where: { organizationId },
        select: {
          id: true,
          organizationId: true,
          buildingId: true,
          equipmentId: true,
          technicianId: true,
          technicianName: true,
          jobId: true,
          date: true,
          status: true,
          pressureGauge: true,
          overallCondition: true,
          remarks: true,
          latitude: true,
          longitude: true,
          isImported: true,
          createdAt: true,
          building: { select: { id: true, name: true, address: true } },
          equipment: {
            select: {
              id: true,
              qrCode: true,
              type: true,
              capacity: true,
              location: true,
              status: true,
            },
          },
          job: { select: { id: true, jobNumber: true, title: true } },
        },
        orderBy: { date: 'desc' },
        take: 50,
      }),
      (db as any).workOrder.findMany({
        where: { organizationId },
        include: {
          building: { select: { id: true, name: true } },
          equipment: { select: { id: true, qrCode: true, type: true, location: true } },
          defect: { select: { id: true, description: true, severity: true } },
          assignedTo: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      (db as any).userProfile.findMany({
        where: {
          organizationId,
          role: 'TECHNICIAN',
        },
        include: {
          assignedBuildings: {
            include: {
              building: {
                select: { id: true, name: true, address: true, city: true },
              },
            },
          },
          _count: {
            select: { inspections: true },
          },
          assignedJobs: {
            select: { id: true, status: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const now = new Date();

    // 1. Enrich Clients
    const clients = clientsRaw.map((c: any) => {
      const totalEquipments = c.buildings.reduce(
        (sum: number, b: any) => sum + (b._count?.equipments || 0),
        0
      );
      return {
        id: c.id,
        name: c.name,
        contactPerson: c.contactPerson,
        phone: c.phone,
        email: c.email,
        buildingCount: c.buildings.length,
        totalEquipments,
        buildings: c.buildings.map((b: any) => ({
          id: b.id,
          name: b.name,
          address: b.address,
          equipmentCount: b._count?.equipments || 0,
        })),
        createdAt: c.createdAt,
      };
    });

    // 2. Evaluate Buildings & Assets
    const evaluatedBuildings = buildingsRaw.map((b: any) => {
      let verifiedCount = 0;
      let notInspectedCount = 0;
      let dueCount = 0;
      let overdueCount = 0;

      const enrichedEquipments = b.equipments.map((eq: any) => {
        const evalResult = evaluateEquipmentStatus(eq, now);
        if (evalResult.status === 'OVERDUE') overdueCount++;
        else if (evalResult.status === 'DUE_SOON') dueCount++;
        else if (evalResult.status === 'VERIFIED') verifiedCount++;
        else notInspectedCount++;

        return {
          ...eq,
          complianceStatus: evalResult.status,
          statusLabel: evalResult.label,
          lastVerifiedDate: evalResult.lastVerifiedDate,
          hasGPS: evalResult.hasGPS,
          hasPhoto: evalResult.hasPhoto,
          isImported: evalResult.isImported,
        };
      });

      let overallStatus: 'VERIFIED' | 'DUE_SOON' | 'OVERDUE' | 'NOT_INSPECTED' = 'NOT_INSPECTED';
      if (overdueCount > 0) {
        overallStatus = 'OVERDUE';
      } else if (dueCount > 0) {
        overallStatus = 'DUE_SOON';
      } else if (verifiedCount > 0 && verifiedCount === b.equipments.length) {
        overallStatus = 'VERIFIED';
      }

      const filingDaysRemaining = b.nextFilingDueDate
        ? Math.ceil(
            (new Date(b.nextFilingDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          )
        : null;

      return {
        id: b.id,
        name: b.name,
        address: b.address,
        state: b.state,
        reportingCycle: b.reportingCycle || b.complianceCycle || 'Half-Yearly',
        complianceRuleName: b.complianceRuleName,
        complianceCycle: b.complianceCycle,
        nextFilingDueDate: b.nextFilingDueDate,
        filingDaysRemaining,
        client: b.client,
        totalEquipments: b.equipments.length,
        verifiedCount,
        notInspectedCount,
        dueCount,
        overdueCount,
        overallStatus,
        equipments: enrichedEquipments,
      };
    });

    // 3. Evaluate All Equipments List
    let kpiCompliantCount = 0;
    let kpiDueCount = 0;
    let kpiOverdueCount = 0;

    const evaluatedEquipments = equipmentsRaw.map((eq: any) => {
      const evalResult = evaluateEquipmentStatus(eq, now);
      if (evalResult.diffDays < 0) kpiOverdueCount++;
      else if (evalResult.diffDays <= 30) kpiDueCount++;
      else kpiCompliantCount++;

      return {
        ...eq,
        diffDays: evalResult.diffDays,
        liveStatus: evalResult.status,
        complianceStatus: evalResult.status,
        statusLabel: evalResult.label,
        lastVerifiedDate: evalResult.lastVerifiedDate,
        hasGPS: evalResult.hasGPS,
        hasPhoto: evalResult.hasPhoto,
        isImported: evalResult.isImported,
      };
    });

    const totalEquipments = evaluatedBuildings.reduce(
      (sum: number, b: any) => sum + b.totalEquipments,
      0
    );
    const verifiedEquipments = evaluatedBuildings.reduce(
      (sum: number, b: any) => sum + b.verifiedCount,
      0
    );

    const summary = {
      totalBuildings: evaluatedBuildings.length,
      verifiedBuildings: evaluatedBuildings.filter((b: any) => b.overallStatus === 'VERIFIED')
        .length,
      dueSoonBuildings: evaluatedBuildings.filter((b: any) => b.overallStatus === 'DUE_SOON')
        .length,
      overdueBuildings: evaluatedBuildings.filter((b: any) => b.overallStatus === 'OVERDUE')
        .length,
      notInspectedBuildings: evaluatedBuildings.filter(
        (b: any) => b.overallStatus === 'NOT_INSPECTED'
      ).length,
      totalEquipments,
      verifiedEquipments,
      overdueEquipments: evaluatedBuildings.reduce(
        (sum: number, b: any) => sum + b.overdueCount,
        0
      ),
      dueSoonEquipments: evaluatedBuildings.reduce((sum: number, b: any) => sum + b.dueCount, 0),
      notInspectedEquipments: evaluatedBuildings.reduce(
        (sum: number, b: any) => sum + b.notInspectedCount,
        0
      ),
    };

    // 4. Format Technicians & Compute Subscription Usage in-memory (0 extra DB queries!)
    let activeTechniciansCount = 0;
    let inactiveTechniciansCount = 0;

    const formattedTechnicians = techniciansRaw.map((tech: any) => {
      if (tech.status === 'INACTIVE') inactiveTechniciansCount++;
      else activeTechniciansCount++;

      const completedJobsCount = (tech.assignedJobs || []).filter(
        (j: any) => j.status === 'COMPLETED'
      ).length;
      const totalInspectionsCount = tech._count?.inspections || 0;

      return {
        id: tech.id,
        fullName: tech.fullName || 'Unnamed Technician',
        email: tech.email,
        phone: tech.phone || '—',
        employeeId: tech.employeeId || '—',
        status: tech.status || 'ACTIVE',
        lastLoginAt: tech.lastLoginAt,
        createdAt: tech.createdAt,
        assignedBuildings: (tech.assignedBuildings || []).map((ab: any) => ab.building),
        completedJobs: completedJobsCount + totalInspectionsCount,
        activeJobsCount: (tech.assignedJobs || []).filter(
          (j: any) => j.status === 'ASSIGNED' || j.status === 'IN_PROGRESS'
        ).length,
      };
    });

    const subscription = auth.subscription;
    const planConfig = getPlanConfig(subscription?.plan);
    const maxTechnicians = subscription?.customTechnicians || planConfig.maxTechnicians;
    const maxTowers = subscription?.customTowers || planConfig.maxTowers;
    const maxAssets = subscription?.customAssets || planConfig.maxAssets;

    const isUnlimitedTechs = maxTechnicians >= 999999;
    const isUnlimitedTowers = maxTowers >= 999999;
    const isUnlimitedAssets = maxAssets >= 999999;

    const usage = {
      technicians: {
        active: activeTechniciansCount,
        inactive: inactiveTechniciansCount,
        total: activeTechniciansCount + inactiveTechniciansCount,
        max: isUnlimitedTechs ? 'Unlimited' : maxTechnicians,
        maxNumeric: maxTechnicians,
        available: isUnlimitedTechs
          ? 'Unlimited'
          : Math.max(0, maxTechnicians - activeTechniciansCount),
        availableNumeric: isUnlimitedTechs
          ? 999999
          : Math.max(0, maxTechnicians - activeTechniciansCount),
        percentUsed: isUnlimitedTechs
          ? 0
          : Math.min(100, Math.round((activeTechniciansCount / maxTechnicians) * 100)),
        isAtLimit: isUnlimitedTechs ? false : activeTechniciansCount >= maxTechnicians,
      },
      towers: {
        used: evaluatedBuildings.length,
        max: isUnlimitedTowers ? 'Unlimited' : maxTowers,
        maxNumeric: maxTowers,
        available: isUnlimitedTowers
          ? 'Unlimited'
          : Math.max(0, maxTowers - evaluatedBuildings.length),
        percentUsed: isUnlimitedTowers
          ? 0
          : Math.min(100, Math.round((evaluatedBuildings.length / maxTowers) * 100)),
        isAtLimit: isUnlimitedTowers ? false : evaluatedBuildings.length >= maxTowers,
      },
      assets: {
        used: evaluatedEquipments.length,
        max: isUnlimitedAssets ? 'Unlimited' : maxAssets,
        maxNumeric: maxAssets,
        available: isUnlimitedAssets
          ? 'Unlimited'
          : Math.max(0, maxAssets - evaluatedEquipments.length),
        percentUsed: isUnlimitedAssets
          ? 0
          : Math.min(100, Math.round((evaluatedEquipments.length / maxAssets) * 100)),
        isAtLimit: isUnlimitedAssets ? false : evaluatedEquipments.length >= maxAssets,
      },
    };

    const openWorkOrders = workOrdersRaw.filter((w: any) =>
      ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(w.status)
    ).length;

    const complianceRate =
      evaluatedEquipments.length > 0
        ? Math.round((kpiCompliantCount / evaluatedEquipments.length) * 100)
        : 100;

    const kpis = {
      totalClients: clients.length,
      totalBuildings: evaluatedBuildings.length,
      totalEquipments: evaluatedEquipments.length,
      activeTechnicians: activeTechniciansCount,
      openWorkOrders,
      dueInspections: kpiDueCount,
      overdueInspections: kpiOverdueCount,
      complianceRate,
    };

    return NextResponse.json({
      authenticated: true,
      user: auth.user,
      profile: auth.profile,
      company: organization,
      isPlatformOwner: isPlatformOwner(auth),
      summary,
      kpis,
      buildings: evaluatedBuildings,
      clients,
      equipments: evaluatedEquipments,
      inspections: inspectionsRaw,
      workOrders: workOrdersRaw,
      technicians: formattedTechnicians,
      subscription: {
        subscription,
        plan: planConfig,
        usage,
        availablePlans: Object.values(PLAN_CONFIGS),
      },
    });
  } catch (error: any) {
    console.error('Error in /api/dashboard/bootstrap:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
