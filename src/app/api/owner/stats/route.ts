import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireOwnerApi } from '@/lib/ownerAuth';
import { getCachedOwnerStats, setCachedOwnerStats } from '@/lib/ownerCache';

export const dynamic = 'force-dynamic';

function buildSevenDayBuckets(now: Date): { key: string; start: Date; end: Date }[] {
  const buckets: { key: string; start: Date; end: Date }[] = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date(now);
    start.setUTCDate(now.getUTCDate() - i);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCHours(23, 59, 59, 999);
    const key = start.toISOString().slice(0, 10);
    buckets.push({ key, start, end });
  }
  return buckets;
}

function countByDayBucket(dates: (Date | string | null | undefined)[], buckets: { key: string; start: Date; end: Date }[]): number[] {
  const counts = new Array(buckets.length).fill(0);
  for (const raw of dates) {
    if (!raw) continue;
    const d = raw instanceof Date ? raw : new Date(raw);
    const ts = d.getTime();
    if (isNaN(ts)) continue;
    for (let i = 0; i < buckets.length; i++) {
      if (ts >= buckets[i].start.getTime() && ts <= buckets[i].end.getTime()) {
        counts[i]++;
        break;
      }
    }
  }
  return counts;
}

function cumulativeByDayBucket(
  allDates: (Date | string | null | undefined)[],
  buckets: { key: string; start: Date; end: Date }[]
): number[] {
  const parsed = allDates
    .map((r) => (r ? (r instanceof Date ? r.getTime() : new Date(r).getTime()) : NaN))
    .filter((t) => !isNaN(t));

  return buckets.map((b) => {
    const endTs = b.end.getTime();
    let c = 0;
    for (const t of parsed) {
      if (t <= endTs) c++;
    }
    return c;
  });
}

export async function GET(request: Request) {
  const gate = await requireOwnerApi(request);
  if (!gate.ok) return gate.response;

  try {
    const url = new URL(request.url);
    const forceFresh = url.searchParams.get('fresh') === '1';

    if (!forceFresh) {
      const cached = getCachedOwnerStats();
      if (cached) {
        return NextResponse.json(
          { ...cached, fromCache: true },
          {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
          }
        );
      }
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const startOfToday = new Date(now);
    startOfToday.setUTCHours(0, 0, 0, 0);

    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));

    // Measure live DB round-trip latency with SELECT 1
    const pingStart = performance.now();
    await (db as any).$queryRaw`SELECT 1`;
    const dbPingMs = Math.max(1, Math.round(performance.now() - pingStart));

    // Execute batched queries in parallel
    const [
      allOrgs,
      allUsers,
      totalEquipmentCount,
      recentEquipmentDates,
      inspectionsLast60d,
      inspectionReportsLast30d,
      complianceReportsLast30d,
      totalInspectionReportsCount,
      totalComplianceReportsCount,
      allWorkOrders,
      allSyncQueue,
      allReportAcks,
      openCorrectiveActionsCount,
      recentSubscriptionLogs,
    ] = await Promise.all([
      (db as any).organization.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          state: true,
          plan: true,
          monthlyPrice: true,
          subscriptionStatus: true,
          subscriptionExpiresAt: true,
          subscriptionNotes: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      (db as any).userProfile.findMany({
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          organizationId: true,
        },
      }),
      (db as any).equipment.count(),
      (db as any).equipment.findMany({
        select: { createdAt: true },
      }),
      (db as any).inspection.findMany({
        where: { createdAt: { gte: sixtyDaysAgo } },
        select: {
          id: true,
          technicianId: true,
          status: true,
          createdAt: true,
        },
      }),
      (db as any).inspectionReport.findMany({
        where: { generatedAt: { gte: thirtyDaysAgo } },
        select: {
          id: true,
          reportReferenceId: true,
          generatedAt: true,
          buildingId: true,
        },
      }),
      (db as any).complianceReport.findMany({
        where: { generatedAt: { gte: thirtyDaysAgo } },
        select: {
          id: true,
          reportNumber: true,
          generatedAt: true,
          buildingId: true,
        },
      }),
      (db as any).inspectionReport.count(),
      (db as any).complianceReport.count(),
      (db as any).workOrder.findMany({
        select: {
          id: true,
          status: true,
          isAutoScheduled: true,
          dueDate: true,
          completedAt: true,
          createdAt: true,
          updatedAt: true,
        },
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
      (db as any).reportAck.findMany({
        select: {
          id: true,
          reportRef: true,
          buildingId: true,
          acknowledgedAt: true,
        },
      }),
      (db as any).correctiveAction.count({
        where: { status: { in: ['OPEN', 'DISPATCHED'] } },
      }),
      (db as any).activityLog.findMany({
        where: {
          OR: [
            { entityType: 'SUBSCRIPTION' },
            { action: 'OWNER_SUBSCRIPTION_UPDATE' },
          ],
        },
        include: {
          organization: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),
    ]);

    const buckets7d = buildSevenDayBuckets(now);

    // 1. Agencies total (+N this week)
    const agenciesTotal = allOrgs.length;
    const agenciesThisWeek = allOrgs.filter(
      (o: any) => new Date(o.createdAt).getTime() >= sevenDaysAgo.getTime()
    ).length;
    const agenciesSparkline = cumulativeByDayBucket(
      allOrgs.map((o: any) => o.createdAt),
      buckets7d
    );

    // 2. Active users (+N this week)
    const activeUsersList = allUsers.filter((u: any) => u.status === 'ACTIVE');
    const activeUsersTotal = activeUsersList.length;
    const activeUsersThisWeek = activeUsersList.filter(
      (u: any) => new Date(u.createdAt).getTime() >= sevenDaysAgo.getTime()
    ).length;
    const activeUsersSparkline = cumulativeByDayBucket(
      activeUsersList.map((u: any) => u.createdAt),
      buckets7d
    );

    // 3. Technicians (total / active in last 7 days)
    const techniciansList = allUsers.filter((u: any) => u.role === 'TECHNICIAN');
    const techniciansTotal = techniciansList.length;
    const recentInspTechIds = new Set(
      inspectionsLast60d
        .filter((i: any) => new Date(i.createdAt).getTime() >= sevenDaysAgo.getTime() && i.technicianId)
        .map((i: any) => i.technicianId)
    );
    const recentSyncTechIds = new Set(
      allSyncQueue
        .filter((s: any) => new Date(s.createdAt).getTime() >= sevenDaysAgo.getTime() && s.technicianId)
        .map((s: any) => s.technicianId)
    );
    const techniciansActive7d = techniciansList.filter((t: any) => {
      const loginRecent = t.lastLoginAt && new Date(t.lastLoginAt).getTime() >= sevenDaysAgo.getTime();
      return Boolean(loginRecent || recentInspTechIds.has(t.id) || recentSyncTechIds.has(t.id));
    }).length;
    const techSparkline = buckets7d.map((b) => {
      let count = 0;
      for (const t of techniciansList) {
        const loginInBucket =
          t.lastLoginAt &&
          new Date(t.lastLoginAt).getTime() >= b.start.getTime() &&
          new Date(t.lastLoginAt).getTime() <= b.end.getTime();
        const inspInBucket = inspectionsLast60d.some(
          (i: any) =>
            i.technicianId === t.id &&
            new Date(i.createdAt).getTime() >= b.start.getTime() &&
            new Date(i.createdAt).getTime() <= b.end.getTime()
        );
        if (loginInBucket || inspInBucket) count++;
      }
      return count;
    });

    // 4. Assets under management (total)
    const assetsAddedThisWeek = recentEquipmentDates.filter(
      (e: any) => new Date(e.createdAt).getTime() >= sevenDaysAgo.getTime()
    ).length;
    const assetsSparkline = cumulativeByDayBucket(
      recentEquipmentDates.map((e: any) => e.createdAt),
      buckets7d
    );

    // 5. Inspections completed (last 30 days, and delta vs previous 30)
    const inspectionsLast30dList = inspectionsLast60d.filter(
      (i: any) => new Date(i.createdAt).getTime() >= thirtyDaysAgo.getTime()
    );
    const inspectionsPrev30dList = inspectionsLast60d.filter((i: any) => {
      const ts = new Date(i.createdAt).getTime();
      return ts >= sixtyDaysAgo.getTime() && ts < thirtyDaysAgo.getTime();
    });
    const inspections30dCount = inspectionsLast30dList.length;
    const inspectionsPrev30dCount = inspectionsPrev30dList.length;
    const inspectionsDelta = inspections30dCount - inspectionsPrev30dCount;
    const inspectionsSparkline = countByDayBucket(
      inspectionsLast30dList.map((i: any) => i.createdAt),
      buckets7d
    );

    // 6. Reports generated (last 30 days)
    const allRecentReportDates = [
      ...inspectionReportsLast30d.map((r: any) => r.generatedAt),
      ...complianceReportsLast30d.map((r: any) => r.generatedAt),
    ];
    const reportsLast30dCount = allRecentReportDates.length;
    const totalAllTimeReportsCount = totalInspectionReportsCount + totalComplianceReportsCount;
    const reportsSparkline = countByDayBucket(allRecentReportDates, buckets7d);

    // 7. Work orders (open / in_progress / completed this month)
    let woOpen = 0;
    let woAssigned = 0;
    let woInProgress = 0;
    let woCompletedThisMonth = 0;
    let woCompletedTotal = 0;
    let woCancelled = 0;

    for (const wo of allWorkOrders) {
      if (wo.status === 'OPEN') woOpen++;
      else if (wo.status === 'ASSIGNED') woAssigned++;
      else if (wo.status === 'IN_PROGRESS') woInProgress++;
      else if (wo.status === 'CANCELLED') woCancelled++;
      else if (wo.status === 'COMPLETED') {
        woCompletedTotal++;
        const compTs = wo.completedAt
          ? new Date(wo.completedAt).getTime()
          : new Date(wo.updatedAt).getTime();
        if (compTs >= startOfMonth.getTime()) {
          woCompletedThisMonth++;
        }
      }
    }
    const workOrdersSparkline = countByDayBucket(
      allWorkOrders.map((w: any) => w.createdAt),
      buckets7d
    );

    // 8. MRR estimate (sum of active agencies' plan prices)
    const activeAgencies = allOrgs.filter((o: any) => (o.subscriptionStatus || 'ACTIVE') === 'ACTIVE');
    const trialAgencies = allOrgs.filter((o: any) => o.subscriptionStatus === 'TRIAL');
    const expiredAgencies = allOrgs.filter((o: any) => o.subscriptionStatus === 'EXPIRED');

    const mrrEstimate = activeAgencies.reduce(
      (sum: number, o: any) => sum + (typeof o.monthlyPrice === 'number' ? o.monthlyPrice : 3999),
      0
    );
    const annualRunRate = mrrEstimate * 12;
    const mrrSparkline = buckets7d.map((b) => {
      const endTs = b.end.getTime();
      return activeAgencies
        .filter((o: any) => new Date(o.createdAt).getTime() <= endTs)
        .reduce((s: number, o: any) => s + (typeof o.monthlyPrice === 'number' ? o.monthlyPrice : 3999), 0);
    });

    // 9. Renewals due (subscriptions expiring in next 30 days)
    const renewalsDueList = allOrgs
      .filter((o: any) => {
        if (!o.subscriptionExpiresAt) return false;
        const expTs = new Date(o.subscriptionExpiresAt).getTime();
        return expTs >= now.getTime() && expTs <= thirtyDaysAhead.getTime();
      })
      .sort(
        (a: any, b: any) =>
          new Date(a.subscriptionExpiresAt).getTime() - new Date(b.subscriptionExpiresAt).getTime()
      );
    const renewalsDueCount = renewalsDueList.length;
    const renewalsSparkline = buckets7d.map((b) => {
      const windowEnd = b.end.getTime() + 30 * 24 * 60 * 60 * 1000;
      return allOrgs.filter((o: any) => {
        if (!o.subscriptionExpiresAt) return false;
        const expTs = new Date(o.subscriptionExpiresAt).getTime();
        return expTs >= b.start.getTime() && expTs <= windowEnd;
      }).length;
    });

    // 10. Sync health (pending offline outbox items across technicians + last successful sync timestamp)
    const pendingSyncCount = allSyncQueue.filter((s: any) => s.status === 'PENDING').length;
    const failedSyncCount = allSyncQueue.filter((s: any) => s.status === 'FAILED').length;
    const syncedItems = allSyncQueue.filter((s: any) => s.status === 'SYNCED' && (s.syncedAt || s.createdAt));
    let lastSuccessfulSyncAt: string | null = null;
    if (syncedItems.length > 0) {
      const latestTs = Math.max(
        ...syncedItems.map((s: any) => new Date(s.syncedAt || s.createdAt).getTime())
      );
      lastSuccessfulSyncAt = new Date(latestTs).toISOString();
    } else if (inspectionsLast60d.length > 0) {
      const latestInspTs = Math.max(
        ...inspectionsLast60d.map((i: any) => new Date(i.createdAt).getTime())
      );
      lastSuccessfulSyncAt = new Date(latestInspTs).toISOString();
    }
    const syncSparkline = countByDayBucket(
      [
        ...allSyncQueue.map((s: any) => s.syncedAt || s.createdAt),
        ...inspectionsLast30dList.map((i: any) => i.createdAt),
      ],
      buckets7d
    );

    // G) HEALTH STRIP & ANOMALIES
    const autoScheduledWOs = allWorkOrders.filter((w: any) => w.isAutoScheduled);
    const autoScheduledTodayCount = autoScheduledWOs.filter(
      (w: any) => new Date(w.createdAt).getTime() >= startOfToday.getTime()
    ).length;
    const lastAutoSchedulerRunAt =
      autoScheduledWOs.length > 0
        ? new Date(
            Math.max(...autoScheduledWOs.map((w: any) => new Date(w.createdAt).getTime()))
          ).toISOString()
        : null;

    const inactiveTechs7dCount = Math.max(0, techniciansTotal - techniciansActive7d);
    const ackedBuildingIds = new Set(allReportAcks.map((a: any) => a.buildingId));
    const oldUnackedReportsCount = [
      ...inspectionReportsLast30d,
      ...complianceReportsLast30d,
    ].filter((r: any) => {
      const genTs = new Date(r.generatedAt).getTime();
      return genTs < fourteenDaysAgo.getTime() && !ackedBuildingIds.has(r.buildingId);
    }).length;

    const anomalies: { severity: 'EXPIRED' | 'DUE_SOON' | 'OK'; message: string }[] = [];
    if (inactiveTechs7dCount > 0) {
      anomalies.push({
        severity: 'DUE_SOON',
        message: `${inactiveTechs7dCount} technician${inactiveTechs7dCount === 1 ? ' has' : 's have'} not synced or signed in within the last 7 days`,
      });
    }
    if (oldUnackedReportsCount > 0) {
      anomalies.push({
        severity: 'DUE_SOON',
        message: `${oldUnackedReportsCount} report${oldUnackedReportsCount === 1 ? '' : 's'} unacknowledged by client portal > 14 days`,
      });
    }
    if (failedSyncCount > 0) {
      anomalies.push({
        severity: 'EXPIRED',
        message: `${failedSyncCount} field sync queue item${failedSyncCount === 1 ? '' : 's'} in FAILED state`,
      });
    }
    if (openCorrectiveActionsCount > 0) {
      anomalies.push({
        severity: 'DUE_SOON',
        message: `${openCorrectiveActionsCount} open corrective action${openCorrectiveActionsCount === 1 ? '' : 's'} awaiting resolution`,
      });
    }
    if (expiredAgencies.length > 0) {
      anomalies.push({
        severity: 'EXPIRED',
        message: `${expiredAgencies.length} agency subscription${expiredAgencies.length === 1 ? ' is' : 's are'} currently EXPIRED`,
      });
    }

    const payload = {
      generatedAt: now.toISOString(),
      sparklineLabels: buckets7d.map((b) => b.key),
      kpis: {
        agencies: {
          total: agenciesTotal,
          addedThisWeek: agenciesThisWeek,
          sparkline7d: agenciesSparkline,
        },
        activeUsers: {
          total: activeUsersTotal,
          addedThisWeek: activeUsersThisWeek,
          sparkline7d: activeUsersSparkline,
        },
        technicians: {
          total: techniciansTotal,
          activeLast7d: techniciansActive7d,
          sparkline7d: techSparkline,
        },
        assets: {
          total: totalEquipmentCount,
          addedThisWeek: assetsAddedThisWeek,
          sparkline7d: assetsSparkline,
        },
        inspections: {
          completedLast30d: inspections30dCount,
          previous30d: inspectionsPrev30dCount,
          delta: inspectionsDelta,
          sparkline7d: inspectionsSparkline,
        },
        reports: {
          generatedLast30d: reportsLast30dCount,
          totalAllTime: totalAllTimeReportsCount,
          sparkline7d: reportsSparkline,
        },
        workOrders: {
          open: woOpen,
          assigned: woAssigned,
          inProgress: woInProgress,
          completedThisMonth: woCompletedThisMonth,
          completedTotal: woCompletedTotal,
          cancelled: woCancelled,
          sparkline7d: workOrdersSparkline,
        },
        mrr: {
          estimateInr: mrrEstimate,
          annualRunRateInr: annualRunRate,
          activePlansCount: activeAgencies.length,
          sparkline7d: mrrSparkline,
        },
        renewalsDue: {
          dueNext30d: renewalsDueCount,
          sparkline7d: renewalsSparkline,
        },
        syncHealth: {
          pendingOutboxCount: pendingSyncCount,
          failedCount: failedSyncCount,
          lastSuccessfulSyncAt,
          sparkline7d: syncSparkline,
        },
      },
      health: {
        dbPingMs,
        pendingSyncCount,
        failedSyncCount,
        lastSuccessfulSyncAt,
        autoSchedulerLastRunAt: lastAutoSchedulerRunAt,
        autoSchedulerCreatedToday: autoScheduledTodayCount,
        anomalies,
      },
      revenue: {
        currentMrrInr: mrrEstimate,
        annualRunRateInr: annualRunRate,
        activeAgenciesCount: activeAgencies.length,
        trialAgenciesCount: trialAgencies.length,
        expiredAgenciesCount: expiredAgencies.length,
        renewalsDue30d: renewalsDueList.map((o: any) => ({
          id: o.id,
          name: o.name,
          plan: o.plan || 'FOUNDING_MONTHLY',
          monthlyPrice: typeof o.monthlyPrice === 'number' ? o.monthlyPrice : 3999,
          subscriptionStatus: o.subscriptionStatus || 'ACTIVE',
          subscriptionExpiresAt: o.subscriptionExpiresAt,
        })),
        recentPlanChanges: recentSubscriptionLogs.map((log: any) => ({
          id: log.id,
          organizationId: log.organizationId,
          agencyName: log.organization?.name || 'Agency',
          action: log.action,
          details: log.details,
          userEmail: log.userEmail,
          createdAt: log.createdAt,
        })),
      },
    };

    setCachedOwnerStats(payload);

    return NextResponse.json(
      { ...payload, fromCache: false },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in GET /api/owner/stats:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load owner stats' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
