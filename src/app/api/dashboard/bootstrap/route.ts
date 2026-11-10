import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, isPlatformOwner } from '@/lib/auth';
import { evaluateEquipmentStatus } from '@/lib/compliance';
import { getPlanConfig, PLAN_CONFIGS } from '@/lib/plans';
import { computeAttentionDigest, computeTrendAnalytics } from '@/lib/dashboardAnalytics';
import { runAutoSchedulerForOrg } from '@/lib/autoScheduler';
import { calendarDayDiff, fromDbDate, todayCalendarDateString } from '@/lib/dates';

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
    // (Eliminates duplicate equipment/inspection joins and pre-bootstrap sequential waterfalls)
    const [
      clientsRaw,
      buildingsRaw,
      equipmentsRaw,
      inspectionsRaw,
      workOrdersRaw,
      techniciansRaw,
      pendingSyncCount,
      newFeedbackCount,
      pendingDeletionCount,
      correctiveActionsRaw,
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
          photos: true,
          isImported: true,
          approvalStatus: true,
          approvalNote: true,
          approvedAt: true,
          approvedByUserId: true,
          createdAt: true,
          inspectionPhotos: {
            select: { id: true, photoUrl: true, category: true, caption: true },
          },
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
          deletionRequests: {
            where: { status: 'PENDING' },
            select: { id: true, requestedAt: true, status: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      (db as any).syncQueue.count({
        where: {
          technician: { organizationId },
          status: { in: ['PENDING', 'FAILED'] },
        },
      }).catch(() => 0),
      (db as any).feedback.count({
        where: { organizationId },
      }).catch(() => 0),
      (db as any).accountDeletionRequest.count({
        where: {
          organizationId,
          status: 'PENDING',
        },
      }).catch(() => 0),
      (db as any).correctiveAction.findMany({
        where: { organizationId },
        include: {
          building: { select: { id: true, name: true, address: true } },
          equipment: { select: { id: true, qrCode: true, type: true, location: true } },
        },
        orderBy: { openedAt: 'desc' },
      }).catch(() => []),
    ]);

    const now = new Date();
    const todayStr = todayCalendarDateString();

    // Group already-fetched equipments by buildingId in-memory (eliminates duplicate 4-table SQL join)
    const equipmentsByBuildingId = new Map<string, any[]>();
    for (const eq of equipmentsRaw) {
      if (eq.buildingId) {
        if (!equipmentsByBuildingId.has(eq.buildingId)) {
          equipmentsByBuildingId.set(eq.buildingId, []);
        }
        equipmentsByBuildingId.get(eq.buildingId)!.push(eq);
      }
    }
    for (const b of buildingsRaw) {
      const list = equipmentsByBuildingId.get(b.id) || [];
      list.sort((a: any, bEq: any) =>
        String(a.location || '').localeCompare(String(bEq.location || ''))
      );
      b.equipments = list;
    }

    // Module C2: Fast in-memory check before invoking DB auto-scheduler
    if (organization?.autoSchedulingEnabled !== false) {
      const openEquipmentIds = new Set<string>();
      for (const wo of workOrdersRaw) {
        if (wo.equipmentId && ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(wo.status)) {
          openEquipmentIds.add(wo.equipmentId);
        }
      }
      let needsAutoSchedule = false;
      for (const b of buildingsRaw) {
        const leadDays = typeof b.leadTimeDays === 'number' ? b.leadTimeDays : 7;
        for (const eq of b.equipments || []) {
          const dueRaw = eq.nextDueDate || eq.refillDueDate || eq.hydroDueDate;
          if (!dueRaw) continue;
          const diffDays = calendarDayDiff(fromDbDate(dueRaw), todayStr);
          if (diffDays <= leadDays && !openEquipmentIds.has(eq.id)) {
            needsAutoSchedule = true;
            break;
          }
        }
        if (needsAutoSchedule) break;
      }

      if (needsAutoSchedule) {
        const schedRes = await runAutoSchedulerForOrg({
          organizationId,
          actorUserId: auth.user?.id,
          actorEmail: auth.user?.email,
        }).catch((err) => {
          console.warn('[bootstrap] Auto-scheduler skipped:', err);
          return null;
        });
        if (schedRes?.createdTasks?.length) {
          workOrdersRaw.unshift(...schedRes.createdTasks);
        }
      }
    }

    // Count pending approvals per building in-memory
    const pendingApprovalsByBuilding = new Map<string, number>();
    const latestInspectionByBuilding = new Map<string, Date>();
    for (const ins of inspectionsRaw) {
      if (ins.buildingId) {
        if (ins.approvalStatus === 'PENDING') {
          pendingApprovalsByBuilding.set(
            ins.buildingId,
            (pendingApprovalsByBuilding.get(ins.buildingId) || 0) + 1
          );
        }
        const dt = new Date(ins.date || ins.createdAt);
        if (!isNaN(dt.getTime())) {
          const prev = latestInspectionByBuilding.get(ins.buildingId);
          if (!prev || dt > prev) {
            latestInspectionByBuilding.set(ins.buildingId, dt);
          }
        }
      }
    }

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
        ? calendarDayDiff(fromDbDate(b.nextFilingDueDate), todayStr)
        : null;

      return {
        id: b.id,
        name: b.name,
        address: b.address,
        state: b.state,
        reportingCycle: b.reportingCycle || b.complianceCycle || 'Half-Yearly',
        complianceRuleName: b.complianceRuleName,
        complianceCycle: b.complianceCycle,
        leadTimeDays: b.leadTimeDays ?? 7,
        cycleOverrides: b.cycleOverrides || null,
        nextFilingDueDate: b.nextFilingDueDate,
        filingDaysRemaining,
        pendingApprovalsCount: pendingApprovalsByBuilding.get(b.id) || 0,
        lastInspectionDate: latestInspectionByBuilding.get(b.id) || null,
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

    // 1. Enrich Clients with Module E Portfolio Rollup metrics (0 extra DB queries)
    const buildingsByClientId = new Map<string, any[]>();
    for (const eb of evaluatedBuildings) {
      const cId = eb.client?.id;
      if (cId) {
        if (!buildingsByClientId.has(cId)) buildingsByClientId.set(cId, []);
        buildingsByClientId.get(cId)!.push(eb);
      }
    }

    const clients = clientsRaw.map((c: any) => {
      const clientBldgs = buildingsByClientId.get(c.id) || [];
      const totalEquipments = clientBldgs.reduce((sum, b) => sum + (b.totalEquipments || 0), 0);
      const overdueCount = clientBldgs.reduce((sum, b) => sum + (b.overdueCount || 0), 0);
      const dueSoonCount = clientBldgs.reduce((sum, b) => sum + (b.dueCount || 0), 0);
      const okCount = clientBldgs.reduce((sum, b) => sum + (b.verifiedCount || 0), 0);
      const compliancePercent =
        totalEquipments > 0
          ? Math.round((okCount / totalEquipments) * 100)
          : 0;

      let lastInspectionDate: Date | null = null;
      for (const b of clientBldgs) {
        if (b.lastInspectionDate) {
          const dt = new Date(b.lastInspectionDate);
          if (!lastInspectionDate || dt > lastInspectionDate) {
            lastInspectionDate = dt;
          }
        }
      }

      return {
        id: c.id,
        name: c.name,
        contactPerson: c.contactPerson,
        phone: c.phone,
        email: c.email,
        buildingCount: c.buildings.length,
        totalEquipments,
        okCount,
        dueSoonCount,
        overdueCount,
        expiring30dCount: dueSoonCount,
        compliancePercent,
        lastInspectionDate,
        buildings: c.buildings.map((b: any) => ({
          id: b.id,
          name: b.name,
          address: b.address,
          equipmentCount: b._count?.equipments || 0,
        })),
        createdAt: c.createdAt,
      };
    });

    // 3. Evaluate All Equipments List
    let kpiCompliantCount = 0;
    let kpiDueCount = 0;
    let kpiOverdueCount = 0;

    const evaluatedEquipments = equipmentsRaw.map((eq: any) => {
      const evalResult = evaluateEquipmentStatus(eq, now);
      if (evalResult.status === 'OVERDUE') kpiOverdueCount++;
      else if (evalResult.status === 'DUE_SOON') kpiDueCount++;
      else if (evalResult.status === 'VERIFIED') kpiCompliantCount++;

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
        hasPendingDeletion: tech.deletionRequests && tech.deletionRequests.length > 0,
        pendingDeletionRequest: tech.deletionRequests?.[0] || null,
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
        : 0;

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const inspectionsThisWeek = inspectionsRaw.filter(
      (ins: any) => new Date(ins.date || ins.createdAt) >= sevenDaysAgo
    ).length;

    const kpis = {
      totalClients: clients.length,
      totalBuildings: evaluatedBuildings.length,
      totalEquipments: evaluatedEquipments.length,
      activeTechnicians: activeTechniciansCount,
      openWorkOrders,
      dueInspections: kpiDueCount,
      overdueInspections: kpiOverdueCount,
      inspectionsThisWeek,
      totalInspections: inspectionsRaw.length,
      complianceRate,
    };

    const attentionDigest = computeAttentionDigest({
      overdueCount: kpiOverdueCount,
      dueSoonCount: kpiDueCount,
      equipments: evaluatedEquipments,
      workOrders: workOrdersRaw,
      pendingSyncCount: pendingSyncCount || 0,
      newFeedbackCount: newFeedbackCount || 0,
      pendingDeletionCount: pendingDeletionCount || 0,
      correctiveActions: correctiveActionsRaw || [],
    });

    const analytics = computeTrendAnalytics({
      inspections: inspectionsRaw,
      workOrders: workOrdersRaw,
      totalAssets: evaluatedEquipments.length,
    });

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
      correctiveActions: correctiveActionsRaw || [],
      technicians: formattedTechnicians,
      attentionDigest,
      analytics,
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
