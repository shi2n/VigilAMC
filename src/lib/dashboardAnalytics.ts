/**
 * dashboardAnalytics.ts
 * Computes 100% REAL database analytics for the Compliance & Field Velocity Trend chart
 * and prioritized "Needs Your Attention" live operational digest.
 */

import { calendarDayDiff } from './dates';

export interface TrendBucket {
  labels: string[];
  values: number[];
  unit: string;
  delta: string;
  up: boolean;
}

export interface DashboardAnalytics {
  hasData: boolean;
  INSPECTIONS: Record<'7D' | '30D' | '90D' | '12M', TrendBucket>;
  COMPLIANCE: Record<'7D' | '30D' | '90D' | '12M', TrendBucket>;
  REPAIRS: Record<'7D' | '30D' | '90D' | '12M', TrendBucket>;
  ASSETS_COVERED: Record<'7D' | '30D' | '90D' | '12M', TrendBucket>;
}

export interface AttentionDigestItem {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  count: number;
  deepLinkTab: string;
  deepLinkFilter?: string;
  badgeCls: string;
}

export function computeAttentionDigest(params: {
  overdueCount: number;
  dueSoonCount: number;
  equipments: any[];
  workOrders: any[];
  pendingSyncCount: number;
  newFeedbackCount: number;
  pendingDeletionCount?: number;
  correctiveActions?: any[];
}): AttentionDigestItem[] {
  const {
    overdueCount,
    dueSoonCount,
    equipments,
    workOrders,
    pendingSyncCount,
    newFeedbackCount,
    pendingDeletionCount,
    correctiveActions = [],
  } = params;
  const digest: AttentionDigestItem[] = [];
  const now = new Date();

  // Module B3: Corrective Actions open > 15 days (count + oldest age)
  const agedCorrectiveActions = correctiveActions.filter((ca: any) => {
    if (!ca || ca.status === 'CLOSED' || !ca.openedAt) return false;
    const ageDays = Math.max(0, -calendarDayDiff(ca.openedAt, now));
    return ageDays > 15;
  });
  if (agedCorrectiveActions.length > 0) {
    const oldestAge = Math.max(
      ...agedCorrectiveActions.map((ca: any) =>
        Math.max(0, -calendarDayDiff(ca.openedAt, now))
      )
    );
    digest.push({
      id: 'digest-aged-corrective-actions',
      type: 'CRITICAL',
      title: 'Escalated Corrective Actions (>15d)',
      message: `${agedCorrectiveActions.length} corrective action(s) open >15 days (oldest: ${oldestAge}d open)`,
      count: agedCorrectiveActions.length,
      deepLinkTab: 'INSPECTIONS_WORK',
      deepLinkFilter: 'FINDINGS',
      badgeCls: 'bg-rose-50 text-[#DC2626] border-rose-200',
    });
  }

  // 1. Overdue inspections / AMC dues
  if (overdueCount > 0) {
    const overdueBuildings = new Set<string>();
    equipments.forEach((eq: any) => {
      const diff = eq.nextDueDate
        ? calendarDayDiff(eq.nextDueDate, now)
        : null;
      if ((diff !== null && diff < 0) || eq.status === 'OVERDUE' || eq.liveStatus === 'OVERDUE') {
        if (eq.building?.name) overdueBuildings.add(eq.building.name);
      }
    });
    const top3 = Array.from(overdueBuildings).slice(0, 3).join(', ');
    digest.push({
      id: 'digest-overdue-inspections',
      type: 'CRITICAL',
      title: 'Overdue Inspections',
      message: `${overdueCount} fire asset(s) overdue for compliance check${top3 ? ' across ' + top3 : ''}`,
      count: overdueCount,
      deepLinkTab: 'FIRE_EQUIPMENT',
      deepLinkFilter: 'OVERDUE',
      badgeCls: 'bg-rose-50 text-[#DC2626] border-rose-200',
    });
  }

  // 2. Expiring / due soon fire assets (<= 30 days)
  if (dueSoonCount > 0) {
    digest.push({
      id: 'digest-due-soon-assets',
      type: 'WARNING',
      title: 'Assets Due Soon',
      message: `${dueSoonCount} fire asset(s) due for scheduled inspection within 30 days`,
      count: dueSoonCount,
      deepLinkTab: 'FIRE_EQUIPMENT',
      deepLinkFilter: 'DUE_SOON',
      badgeCls: 'bg-amber-50 text-[#D97706] border-amber-200',
    });
  }

  // 3. Unassigned or overdue Work Orders
  const unassignedOrOverdueWOs = workOrders.filter((w: any) => {
    if (w.status === 'COMPLETED' || w.status === 'CANCELLED') return false;
    const isUnassigned = !w.assignedToId && !w.assignedTo;
    const isOverdue = w.dueDate && new Date(w.dueDate).getTime() < now.getTime();
    return isUnassigned || isOverdue;
  });
  if (unassignedOrOverdueWOs.length > 0) {
    digest.push({
      id: 'digest-work-orders',
      type: 'WARNING',
      title: 'Action Needed on Work Orders',
      message: `${unassignedOrOverdueWOs.length} repair job(s) unassigned or past deadline`,
      count: unassignedOrOverdueWOs.length,
      deepLinkTab: 'REPAIRS',
      badgeCls: 'bg-amber-50 text-[#D97706] border-amber-200',
    });
  }

  // 4. Technicians with failed/pending syncs
  if (pendingSyncCount > 0) {
    digest.push({
      id: 'digest-sync-queue',
      type: 'INFO',
      title: 'Field Sync In Queue',
      message: `${pendingSyncCount} offline technician submission(s) awaiting cloud verification`,
      count: pendingSyncCount,
      deepLinkTab: 'FIELD_TEAM',
      badgeCls: 'bg-blue-50 text-blue-700 border-blue-200',
    });
  }

  // 5. New customer feedback / enquiries
  if (newFeedbackCount > 0) {
    digest.push({
      id: 'digest-feedback',
      type: 'INFO',
      title: 'Customer Inquiries & Feedback',
      message: `${newFeedbackCount} recent client feedback / support inquiry submission(s)`,
      count: newFeedbackCount,
      deepLinkTab: 'SETTINGS',
      badgeCls: 'bg-[#FFF0E6] text-[#C2410C] border-[#FED7AA]',
    });
  }

  // 6. Pending DPDP account deletion requests from field staff (7-day compliance window)
  if (pendingDeletionCount && pendingDeletionCount > 0) {
    digest.push({
      id: 'digest-deletion-requests',
      type: 'CRITICAL',
      title: 'Account Deletion Requested',
      message: `${pendingDeletionCount} field staff member${pendingDeletionCount > 1 ? 's have' : ' has'} requested account deletion (DPDP Act compliance action required within 7 days)`,
      count: pendingDeletionCount,
      deepLinkTab: 'FIELD_TEAM',
      badgeCls: 'bg-rose-50 text-[#DC2626] border-rose-200',
    });
  }

  return digest;
}

export function computeTrendAnalytics(params: {
  inspections: any[];
  workOrders: any[];
  totalAssets: number;
}): DashboardAnalytics {
  const { inspections = [], workOrders = [], totalAssets = 0 } = params;
  const now = new Date();

  const getBuckets = (range: '7D' | '30D' | '90D' | '12M') => {
    if (range === '7D') {
      const buckets: { label: string; start: Date; end: Date }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
        const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
        buckets.push({ label: dayName, start, end });
      }
      const windowStart = buckets[0].start;
      const priorStart = new Date(windowStart.getTime() - 7 * 24 * 60 * 60 * 1000);
      const priorEnd = new Date(windowStart.getTime() - 1);
      return { buckets, priorStart, priorEnd, rangeLabel: 'prior 7d' };
    } else if (range === '30D') {
      const buckets: { label: string; start: Date; end: Date }[] = [];
      for (let i = 3; i >= 0; i--) {
        const end = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        buckets.push({ label: `Wk ${4 - i}`, start, end });
      }
      const windowStart = buckets[0].start;
      const priorStart = new Date(windowStart.getTime() - 28 * 24 * 60 * 60 * 1000);
      const priorEnd = new Date(windowStart.getTime() - 1);
      return { buckets, priorStart, priorEnd, rangeLabel: 'prior 30d' };
    } else if (range === '90D') {
      const buckets: { label: string; start: Date; end: Date }[] = [];
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
        const monthName = d.toLocaleDateString('en-IN', { month: 'short' });
        buckets.push({ label: monthName, start: d, end });
      }
      const windowStart = buckets[0].start;
      const priorStart = new Date(windowStart.getFullYear(), windowStart.getMonth() - 3, 1);
      const priorEnd = new Date(windowStart.getTime() - 1);
      return { buckets, priorStart, priorEnd, rangeLabel: 'prior 90d' };
    } else {
      const buckets: { label: string; start: Date; end: Date }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
        const monthName = d.toLocaleDateString('en-IN', { month: 'short' });
        buckets.push({ label: monthName, start: d, end });
      }
      const windowStart = buckets[0].start;
      const priorStart = new Date(windowStart.getFullYear() - 1, windowStart.getMonth(), 1);
      const priorEnd = new Date(windowStart.getTime() - 1);
      return { buckets, priorStart, priorEnd, rangeLabel: 'prior 12m' };
    }
  };

  const ranges: ('7D' | '30D' | '90D' | '12M')[] = ['7D', '30D', '90D', '12M'];
  const analytics: any = {
    hasData: inspections.length > 0 || workOrders.length > 0,
    INSPECTIONS: {},
    COMPLIANCE: {},
    REPAIRS: {},
    ASSETS_COVERED: {},
  };

  ranges.forEach((range) => {
    const { buckets, priorStart, priorEnd, rangeLabel } = getBuckets(range);

    // 1. INSPECTIONS
    const inspValues = buckets.map((b) => {
      return inspections.filter((ins) => {
        const dt = new Date(ins.date || ins.createdAt);
        return dt >= b.start && dt <= b.end;
      }).length;
    });
    const currInspTotal = inspValues.reduce((a, b) => a + b, 0);
    const priorInspTotal = inspections.filter((ins) => {
      const dt = new Date(ins.date || ins.createdAt);
      return dt >= priorStart && dt <= priorEnd;
    }).length;
    let inspDeltaStr = '—';
    let inspUp = true;
    if (priorInspTotal > 0) {
      const pct = ((currInspTotal - priorInspTotal) / priorInspTotal) * 100;
      inspDeltaStr = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% vs ${rangeLabel}`;
      inspUp = pct >= 0;
    } else if (currInspTotal > 0) {
      inspDeltaStr = `+100% vs ${rangeLabel}`;
      inspUp = true;
    }
    analytics.INSPECTIONS[range] = {
      labels: buckets.map((b) => b.label),
      values: inspValues,
      unit: 'checks',
      delta: inspDeltaStr,
      up: inspUp,
    };

    // 2. COMPLIANCE RATE
    const compValues = buckets.map((b) => {
      const inBucket = inspections.filter((ins) => {
        const dt = new Date(ins.date || ins.createdAt);
        return dt >= b.start && dt <= b.end;
      });
      if (inBucket.length === 0) return 100;
      const passed = inBucket.filter((i) => i.status === 'PASSED' || i.status === 'COMPLIANT').length;
      return Math.round((passed / inBucket.length) * 1000) / 10;
    });
    const avgComp = compValues.length > 0 ? compValues.reduce((a, b) => a + b, 0) / compValues.length : 100;
    analytics.COMPLIANCE[range] = {
      labels: buckets.map((b) => b.label),
      values: compValues,
      unit: '% verified',
      delta: `${avgComp.toFixed(1)}% compliance`,
      up: avgComp >= 90,
    };

    // 3. REPAIRS CLOSED
    const repValues = buckets.map((b) => {
      return workOrders.filter((wo) => {
        if (!wo.completedAt && wo.status !== 'COMPLETED') return false;
        const dt = new Date(wo.completedAt || wo.updatedAt || wo.createdAt);
        return dt >= b.start && dt <= b.end;
      }).length;
    });
    const currRepTotal = repValues.reduce((a, b) => a + b, 0);
    const priorRepTotal = workOrders.filter((wo) => {
      if (!wo.completedAt && wo.status !== 'COMPLETED') return false;
      const dt = new Date(wo.completedAt || wo.updatedAt || wo.createdAt);
      return dt >= priorStart && dt <= priorEnd;
    }).length;
    let repDeltaStr = '—';
    let repUp = true;
    if (priorRepTotal > 0) {
      const pct = ((currRepTotal - priorRepTotal) / priorRepTotal) * 100;
      repDeltaStr = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% vs ${rangeLabel}`;
      repUp = pct >= 0;
    } else if (currRepTotal > 0) {
      repDeltaStr = `+${currRepTotal} closed vs ${rangeLabel}`;
      repUp = true;
    }
    analytics.REPAIRS[range] = {
      labels: buckets.map((b) => b.label),
      values: repValues,
      unit: 'jobs closed',
      delta: repDeltaStr,
      up: repUp,
    };

    // 4. ASSETS COVERED
    const assetValues = buckets.map((b) => {
      if (totalAssets === 0) return 0;
      const checkedIds = new Set(
        inspections
          .filter((ins) => {
            const dt = new Date(ins.date || ins.createdAt);
            return dt >= b.start && dt <= b.end;
          })
          .map((ins) => ins.equipmentId)
      );
      return Math.round((checkedIds.size / totalAssets) * 1000) / 10;
    });
    const avgAssetCovered = assetValues.length > 0 ? assetValues.reduce((a, b) => a + b, 0) / assetValues.length : 0;
    analytics.ASSETS_COVERED[range] = {
      labels: buckets.map((b) => b.label),
      values: assetValues,
      unit: '% assets inspected',
      delta: `${avgAssetCovered.toFixed(1)}% covered`,
      up: avgAssetCovered > 0,
    };
  });

  return analytics as DashboardAnalytics;
}
