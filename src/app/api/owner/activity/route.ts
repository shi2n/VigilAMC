import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireOwnerApi } from '@/lib/ownerAuth';

export const dynamic = 'force-dynamic';

export type FeedEventCategory =
  | 'ALL'
  | 'AGENCY'
  | 'USER'
  | 'TECHNICIAN'
  | 'INSPECTION'
  | 'REPORT'
  | 'WORK_ORDER'
  | 'CORRECTIVE_ACTION'
  | 'PORTAL'
  | 'SUBSCRIPTION';

export interface UnifiedActivityEvent {
  id: string;
  category: Exclude<FeedEventCategory, 'ALL'>;
  subtype: string;
  timestamp: string;
  sentence: string;
  agencyId: string | null;
  agencyName: string;
  statusBadge?: {
    label: string;
    tone: 'OK' | 'DUE_SOON' | 'EXPIRED';
  };
  linkUrl: string;
  linkLabel: string;
}

export async function GET(request: Request) {
  const gate = await requireOwnerApi(request);
  if (!gate.ok) return gate.response;

  try {
    const url = new URL(request.url);
    const categoryFilter = (url.searchParams.get('type') || 'ALL').toUpperCase() as FeedEventCategory;
    const agencyIdFilter = url.searchParams.get('agencyId') || '';
    const rangeFilter = (url.searchParams.get('range') || 'all').toLowerCase(); // today | 7d | 30d | all
    const searchQuery = (url.searchParams.get('q') || '').trim().toLowerCase();
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10) || 0);
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10) || 50));

    const now = new Date();
    let minDate: Date | null = null;
    if (rangeFilter === 'today') {
      minDate = new Date(now);
      minDate.setUTCHours(0, 0, 0, 0);
    } else if (rangeFilter === '7d') {
      minDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (rangeFilter === '30d') {
      minDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const perSourceTake = Math.min(150, offset + limit + 25);

    const orgWhere: any = {};
    if (agencyIdFilter) orgWhere.id = agencyIdFilter;

    const scopedWhere: any = {};
    if (agencyIdFilter) scopedWhere.organizationId = agencyIdFilter;

    const [
      agencies,
      users,
      inspections,
      inspectionReports,
      complianceReports,
      workOrders,
      correctiveActions,
      portalUsers,
      reportAcks,
      syncItems,
      subscriptionLogs,
    ] = await Promise.all([
      (db as any).organization.findMany({
        where: orgWhere,
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
          plan: true,
          monthlyPrice: true,
          subscriptionStatus: true,
          subscriptionExpiresAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: perSourceTake,
      }),
      (db as any).userProfile.findMany({
        where: scopedWhere,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          employeeId: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          organizationId: true,
          organization: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: perSourceTake,
      }),
      (db as any).inspection.findMany({
        where: scopedWhere,
        select: {
          id: true,
          organizationId: true,
          buildingId: true,
          technicianName: true,
          status: true,
          approvalStatus: true,
          createdAt: true,
          date: true,
          organization: { select: { id: true, name: true } },
          building: { select: { id: true, name: true } },
          equipment: { select: { id: true, qrCode: true, type: true, floor: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: perSourceTake,
      }),
      (db as any).inspectionReport.findMany({
        where: scopedWhere,
        select: {
          id: true,
          organizationId: true,
          buildingId: true,
          reportReferenceId: true,
          reportTitle: true,
          jurisdictionCode: true,
          inspectionStatus: true,
          totalRegistered: true,
          generatedAt: true,
          organization: { select: { id: true, name: true } },
          building: { select: { id: true, name: true } },
        },
        orderBy: { generatedAt: 'desc' },
        take: perSourceTake,
      }),
      (db as any).complianceReport.findMany({
        where: scopedWhere,
        select: {
          id: true,
          organizationId: true,
          buildingId: true,
          reportNumber: true,
          totalEquipment: true,
          status: true,
          generatedAt: true,
          organization: { select: { id: true, name: true } },
          building: { select: { id: true, name: true } },
        },
        orderBy: { generatedAt: 'desc' },
        take: perSourceTake,
      }),
      (db as any).workOrder.findMany({
        where: scopedWhere,
        select: {
          id: true,
          organizationId: true,
          buildingId: true,
          title: true,
          status: true,
          priority: true,
          isAutoScheduled: true,
          completedAt: true,
          createdAt: true,
          organization: { select: { id: true, name: true } },
          building: { select: { id: true, name: true } },
          assignedTo: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: perSourceTake,
      }),
      (db as any).correctiveAction.findMany({
        where: scopedWhere,
        select: {
          id: true,
          organizationId: true,
          buildingId: true,
          assetRef: true,
          title: true,
          severity: true,
          status: true,
          openedAt: true,
          organization: { select: { id: true, name: true } },
          building: { select: { id: true, name: true } },
        },
        orderBy: { openedAt: 'desc' },
        take: perSourceTake,
      }),
      (db as any).portalUser.findMany({
        where: scopedWhere,
        select: {
          id: true,
          organizationId: true,
          email: true,
          name: true,
          createdAt: true,
          organization: { select: { id: true, name: true } },
          client: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: perSourceTake,
      }),
      (db as any).reportAck.findMany({
        where: agencyIdFilter
          ? { building: { organizationId: agencyIdFilter } }
          : {},
        select: {
          id: true,
          reportRef: true,
          buildingId: true,
          acknowledgedAt: true,
          building: {
            select: {
              id: true,
              name: true,
              organizationId: true,
              organization: { select: { id: true, name: true } },
            },
          },
          portalUser: { select: { name: true, email: true } },
        },
        orderBy: { acknowledgedAt: 'desc' },
        take: perSourceTake,
      }),
      (db as any).syncQueue.findMany({
        where: agencyIdFilter
          ? { technician: { organizationId: agencyIdFilter } }
          : {},
        select: {
          id: true,
          actionType: true,
          status: true,
          createdAt: true,
          syncedAt: true,
          technician: {
            select: {
              id: true,
              fullName: true,
              employeeId: true,
              organizationId: true,
              organization: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: perSourceTake,
      }),
      (db as any).activityLog.findMany({
        where: {
          ...scopedWhere,
          OR: [
            { entityType: 'SUBSCRIPTION' },
            { action: 'OWNER_SUBSCRIPTION_UPDATE' },
          ],
        },
        select: {
          id: true,
          organizationId: true,
          userEmail: true,
          action: true,
          entityType: true,
          details: true,
          createdAt: true,
          organization: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: perSourceTake,
      }),
    ]);

    const events: UnifiedActivityEvent[] = [];

    // 1. Agencies created + Subscription expiry approaching
    for (const org of agencies) {
      events.push({
        id: `agency-created-${org.id}`,
        category: 'AGENCY',
        subtype: 'AGENCY_CREATED',
        timestamp: new Date(org.createdAt).toISOString(),
        sentence: `New agency registered: ${org.name}${org.city ? ` (${org.city})` : ''}`,
        agencyId: org.id,
        agencyName: org.name,
        statusBadge: {
          label: org.subscriptionStatus || 'ACTIVE',
          tone:
            org.subscriptionStatus === 'EXPIRED'
              ? 'EXPIRED'
              : org.subscriptionStatus === 'TRIAL'
              ? 'DUE_SOON'
              : 'OK',
        },
        linkUrl: `/owner/agencies/${org.id}`,
        linkLabel: 'View Agency',
      });

      if (org.subscriptionExpiresAt) {
        const expDate = new Date(org.subscriptionExpiresAt);
        const expTs = expDate.getTime();
        if (expTs >= now.getTime() && expTs <= thirtyDaysAhead.getTime()) {
          const daysLeft = Math.max(0, Math.ceil((expTs - now.getTime()) / (1000 * 60 * 60 * 24)));
          events.push({
            id: `sub-expiring-${org.id}`,
            category: 'SUBSCRIPTION',
            subtype: 'SUBSCRIPTION_RENEWAL_DUE',
            timestamp: new Date(org.createdAt).toISOString(),
            sentence: `${org.name} subscription (${org.plan || 'FOUNDING_MONTHLY'} · ₹${(org.monthlyPrice ?? 3999).toLocaleString('en-IN')}/mo) expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'} (${expDate.toISOString().slice(0, 10)})`,
            agencyId: org.id,
            agencyName: org.name,
            statusBadge: {
              label: 'DUE SOON',
              tone: 'DUE_SOON',
            },
            linkUrl: `/owner/agencies/${org.id}`,
            linkLabel: 'Manage Plan',
          });
        }
      }
    }

    // 2. Users registered + User sign-ins + Technicians added/active
    for (const u of users) {
      const agName = u.organization?.name || 'Platform Account';
      const agId = u.organizationId || null;

      if (u.role === 'TECHNICIAN') {
        events.push({
          id: `tech-added-${u.id}`,
          category: 'TECHNICIAN',
          subtype: 'TECHNICIAN_ADDED',
          timestamp: new Date(u.createdAt).toISOString(),
          sentence: `Technician added: ${u.fullName || u.email}${u.employeeId ? ` (${u.employeeId})` : ''} under ${agName}`,
          agencyId: agId,
          agencyName: agName,
          statusBadge: {
            label: u.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
            tone: u.status === 'ACTIVE' ? 'OK' : 'EXPIRED',
          },
          linkUrl: agId ? `/owner/agencies/${agId}` : `/owner?section=people`,
          linkLabel: 'View Technician',
        });

        if (u.lastLoginAt) {
          events.push({
            id: `tech-active-${u.id}-${new Date(u.lastLoginAt).getTime()}`,
            category: 'TECHNICIAN',
            subtype: 'TECHNICIAN_ACTIVE',
            timestamp: new Date(u.lastLoginAt).toISOString(),
            sentence: `Technician ${u.fullName || u.email}${u.employeeId ? ` (${u.employeeId})` : ''} signed in to field app`,
            agencyId: agId,
            agencyName: agName,
            statusBadge: {
              label: 'FIELD ACTIVE',
              tone: 'OK',
            },
            linkUrl: agId ? `/owner/agencies/${agId}` : `/owner?section=people`,
            linkLabel: 'View Technician',
          });
        }
      } else {
        events.push({
          id: `user-reg-${u.id}`,
          category: 'USER',
          subtype: 'USER_REGISTERED',
          timestamp: new Date(u.createdAt).toISOString(),
          sentence: `New ${u.role} registered: ${u.fullName || 'User'} (${u.email}) at ${agName}`,
          agencyId: agId,
          agencyName: agName,
          statusBadge: {
            label: u.role,
            tone: 'OK',
          },
          linkUrl: agId ? `/owner/agencies/${agId}` : `/owner?section=people`,
          linkLabel: 'View User',
        });

        if (u.lastLoginAt) {
          events.push({
            id: `user-login-${u.id}-${new Date(u.lastLoginAt).getTime()}`,
            category: 'USER',
            subtype: 'USER_SIGNIN',
            timestamp: new Date(u.lastLoginAt).toISOString(),
            sentence: `${u.fullName || u.email} (${u.role}) signed in to ${agName}`,
            agencyId: agId,
            agencyName: agName,
            statusBadge: {
              label: 'SIGN-IN',
              tone: 'OK',
            },
            linkUrl: agId ? `/owner/agencies/${agId}` : `/owner?section=people`,
            linkLabel: 'View User',
          });
        }
      }
    }

    // 3. Technician SyncQueue events
    for (const sq of syncItems) {
      const agName = sq.technician?.organization?.name || 'Field PWA';
      const agId = sq.technician?.organizationId || null;
      const ts = sq.syncedAt || sq.createdAt;
      events.push({
        id: `sync-${sq.id}`,
        category: 'TECHNICIAN',
        subtype: 'TECHNICIAN_SYNC',
        timestamp: new Date(ts).toISOString(),
        sentence: `${sq.technician?.fullName || 'Technician'} synced field action (${sq.actionType}) — ${sq.status}`,
        agencyId: agId,
        agencyName: agName,
        statusBadge: {
          label: sq.status,
          tone: sq.status === 'FAILED' ? 'EXPIRED' : sq.status === 'PENDING' ? 'DUE_SOON' : 'OK',
        },
        linkUrl: agId ? `/owner/agencies/${agId}` : `/owner?section=people`,
        linkLabel: 'View Sync',
      });
    }

    // 4. Inspections completed / started
    for (const insp of inspections) {
      const agName = insp.organization?.name || 'Agency';
      const bldName = insp.building?.name || 'Building';
      const assetDesc = insp.equipment?.qrCode
        ? `${insp.equipment.qrCode} (${insp.equipment.type || 'Asset'}${insp.equipment.floor ? `, ${insp.equipment.floor}` : ''})`
        : 'facility equipment';
      const isDefect =
        insp.status === 'FAILED' ||
        insp.status === 'SERVICE_REQUIRED' ||
        insp.status === 'REPLACEMENT_REQUIRED';

      events.push({
        id: `insp-${insp.id}`,
        category: 'INSPECTION',
        subtype: 'INSPECTION_COMPLETED',
        timestamp: new Date(insp.createdAt || insp.date).toISOString(),
        sentence: `${insp.technicianName || 'Field Technician'} completed inspection at ${bldName} — ${assetDesc} (${insp.status})`,
        agencyId: insp.organizationId,
        agencyName: agName,
        statusBadge: {
          label: insp.status,
          tone: isDefect ? 'EXPIRED' : insp.approvalStatus === 'PENDING' ? 'DUE_SOON' : 'OK',
        },
        linkUrl: `/report/${insp.buildingId}`,
        linkLabel: 'Open Report',
      });
    }

    // 5. Reports generated (InspectionReport + ComplianceReport)
    for (const rpt of inspectionReports) {
      const agName = rpt.organization?.name || 'Agency';
      const bldName = rpt.building?.name || 'Building';
      events.push({
        id: `insprpt-${rpt.id}`,
        category: 'REPORT',
        subtype: 'REPORT_GENERATED',
        timestamp: new Date(rpt.generatedAt).toISOString(),
        sentence: `${agName} generated ${rpt.jurisdictionCode} report ${rpt.reportReferenceId} for ${bldName} — ${rpt.totalRegistered} assets (${rpt.inspectionStatus})`,
        agencyId: rpt.organizationId || null,
        agencyName: agName,
        statusBadge: {
          label: rpt.inspectionStatus,
          tone:
            rpt.inspectionStatus.includes('ACTION REQUIRED') ||
            rpt.inspectionStatus.includes('PENDING')
              ? 'EXPIRED'
              : rpt.inspectionStatus === 'INSPECTION COMPLETED' ||
                rpt.inspectionStatus === 'CORRECTIVE ACTION COMPLETED'
              ? 'OK'
              : 'DUE_SOON',
        },
        linkUrl: `/report/${rpt.buildingId}`,
        linkLabel: 'View Report',
      });
    }

    for (const cr of complianceReports) {
      const agName = cr.organization?.name || 'Agency';
      const bldName = cr.building?.name || 'Building';
      events.push({
        id: `comprpt-${cr.id}`,
        category: 'REPORT',
        subtype: 'REPORT_GENERATED',
        timestamp: new Date(cr.generatedAt).toISOString(),
        sentence: `${agName} compiled inspection report ${cr.reportNumber} for ${bldName} — ${cr.totalEquipment} assets`,
        agencyId: cr.organizationId || null,
        agencyName: agName,
        statusBadge: {
          label: cr.status,
          tone: cr.status === 'COMPLIANT' ? 'OK' : 'DUE_SOON',
        },
        linkUrl: `/report/${cr.buildingId}`,
        linkLabel: 'View Report',
      });
    }

    // 6. Work orders created / assigned / completed
    for (const wo of workOrders) {
      const agName = wo.organization?.name || 'Agency';
      const bldName = wo.building?.name || 'Building';
      const ts = wo.status === 'COMPLETED' && wo.completedAt ? wo.completedAt : wo.createdAt;
      const actionVerb =
        wo.status === 'COMPLETED'
          ? 'completed work order'
          : wo.status === 'IN_PROGRESS'
          ? 'started work order'
          : wo.status === 'ASSIGNED'
          ? `assigned work order to ${wo.assignedTo?.fullName || 'technician'}`
          : 'created work order';

      events.push({
        id: `wo-${wo.id}`,
        category: 'WORK_ORDER',
        subtype: `WORK_ORDER_${wo.status}`,
        timestamp: new Date(ts).toISOString(),
        sentence: `${agName} ${actionVerb} "${wo.title}" at ${bldName}`,
        agencyId: wo.organizationId,
        agencyName: agName,
        statusBadge: {
          label: wo.status,
          tone:
            wo.status === 'COMPLETED'
              ? 'OK'
              : wo.status === 'OPEN' && wo.priority === 'URGENT'
              ? 'EXPIRED'
              : 'DUE_SOON',
        },
        linkUrl: `/buildings/${wo.buildingId}`,
        linkLabel: 'View Building',
      });
    }

    // 7. Corrective actions raised / overdue
    for (const ca of correctiveActions) {
      const agName = ca.organization?.name || 'Agency';
      const bldName = ca.building?.name || 'Building';
      const isResolved = ca.status === 'VERIFIED' || ca.status === 'CLOSED';
      const isOverdue =
        !isResolved &&
        new Date(ca.openedAt).getTime() < now.getTime() - 7 * 24 * 60 * 60 * 1000;

      events.push({
        id: `ca-${ca.id}`,
        category: 'CORRECTIVE_ACTION',
        subtype: isOverdue ? 'CORRECTIVE_ACTION_OVERDUE' : `CORRECTIVE_ACTION_${ca.status}`,
        timestamp: new Date(ca.openedAt).toISOString(),
        sentence: `Corrective action "${ca.title}"${ca.assetRef ? ` (${ca.assetRef})` : ''} at ${bldName} — ${ca.status}${isOverdue ? ' [OVERDUE > 7d]' : ''}`,
        agencyId: ca.organizationId,
        agencyName: agName,
        statusBadge: {
          label: isOverdue ? 'OVERDUE' : ca.status,
          tone: isResolved ? 'OK' : isOverdue || ca.severity === 'HIGH' ? 'EXPIRED' : 'DUE_SOON',
        },
        linkUrl: `/report/${ca.buildingId}`,
        linkLabel: 'View Report',
      });
    }

    // 8. Portal invites sent + Report acknowledged
    for (const pu of portalUsers) {
      const agName = pu.organization?.name || 'Agency';
      events.push({
        id: `portal-invite-${pu.id}`,
        category: 'PORTAL',
        subtype: 'PORTAL_INVITE_SENT',
        timestamp: new Date(pu.createdAt).toISOString(),
        sentence: `${agName} invited client portal user ${pu.name} (${pu.email}) for ${pu.client?.name || 'Client'}`,
        agencyId: pu.organizationId,
        agencyName: agName,
        statusBadge: {
          label: 'PORTAL INVITE',
          tone: 'OK',
        },
        linkUrl: `/owner/agencies/${pu.organizationId}`,
        linkLabel: 'View Agency',
      });
    }

    for (const ack of reportAcks) {
      const agName = ack.building?.organization?.name || 'Agency';
      const agId = ack.building?.organizationId || null;
      const bldName = ack.building?.name || 'Building';
      events.push({
        id: `portal-ack-${ack.id}`,
        category: 'PORTAL',
        subtype: 'REPORT_ACKNOWLEDGED',
        timestamp: new Date(ack.acknowledgedAt).toISOString(),
        sentence: `Client ${ack.portalUser?.name || ack.portalUser?.email || 'Representative'} acknowledged report ${ack.reportRef} for ${bldName}`,
        agencyId: agId,
        agencyName: agName,
        statusBadge: {
          label: 'ACKNOWLEDGED',
          tone: 'OK',
        },
        linkUrl: `/report/${ack.buildingId}`,
        linkLabel: 'Open Report',
      });
    }

    // 9. Subscription / plan changes logged in ActivityLog
    for (const log of subscriptionLogs) {
      const agName = log.organization?.name || 'Agency';
      events.push({
        id: `sub-log-${log.id}`,
        category: 'SUBSCRIPTION',
        subtype: 'PLAN_CHANGED',
        timestamp: new Date(log.createdAt).toISOString(),
        sentence: log.details || `Owner updated subscription plan for ${agName}`,
        agencyId: log.organizationId,
        agencyName: agName,
        statusBadge: {
          label: 'PLAN UPDATED',
          tone: 'OK',
        },
        linkUrl: `/owner/agencies/${log.organizationId}`,
        linkLabel: 'View Agency',
      });
    }

    // Apply filters
    const filtered = events.filter((ev) => {
      if (categoryFilter !== 'ALL' && ev.category !== categoryFilter) {
        return false;
      }
      if (agencyIdFilter && ev.agencyId !== agencyIdFilter) {
        return false;
      }
      if (minDate) {
        const ts = new Date(ev.timestamp).getTime();
        if (ts < minDate.getTime()) return false;
      }
      if (searchQuery) {
        const hay = `${ev.sentence} ${ev.agencyName} ${ev.category} ${ev.subtype}`.toLowerCase();
        if (!hay.includes(searchQuery)) return false;
      }
      return true;
    });

    // Sort newest first
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const totalMatching = filtered.length;
    const pageItems = filtered.slice(offset, offset + limit);

    return NextResponse.json(
      {
        events: pageItems,
        totalMatching,
        offset,
        limit,
        hasMore: offset + limit < totalMatching,
        sourcesWired: [
          'Organization',
          'UserProfile',
          'SyncQueue',
          'Inspection',
          'InspectionReport',
          'ComplianceReport',
          'WorkOrder',
          'CorrectiveAction',
          'PortalUser',
          'ReportAck',
          'ActivityLog',
        ],
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in GET /api/owner/activity:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load activity feed' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
