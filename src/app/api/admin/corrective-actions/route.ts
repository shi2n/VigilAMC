import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor } from '@/lib/techSession';
import { logAuditActivity } from '@/lib/auth';
import {
  toDbDate,
  addCalendarDays,
  todayCalendarDateString,
  calendarDayDiff,
} from '@/lib/dates';

export const dynamic = 'force-dynamic';

const VALID_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH'];
const VALID_STATUSES = ['OPEN', 'DISPATCHED', 'REPAIRED', 'VERIFIED', 'CLOSED'];

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = auth.organization.id;
    const actions = await (db as any).correctiveAction.findMany({
      where: { organizationId: orgId },
      include: {
        building: { select: { id: true, name: true, address: true } },
        equipment: { select: { id: true, qrCode: true, type: true, location: true } },
      },
      orderBy: { openedAt: 'desc' },
    });

    // Weekly admin notification for still-open >15d items (Module B3)
    const todayStr = todayCalendarDateString();
    const fifteenDaysAgoStr = addCalendarDays(todayStr, -15);
    const agedOpen = actions.filter(
      (a: any) => a.status !== 'CLOSED' && a.openedAt && calendarDayDiff(a.openedAt, todayStr) <= -15
    );

    if (agedOpen.length > 0) {
      const sevenDaysAgo = toDbDate(addCalendarDays(todayStr, -7));
      const recentNotif = await (db as any).notification
        .findFirst({
          where: {
            organizationId: orgId,
            title: { contains: 'Corrective Actions Open >15 Days' },
            createdAt: { gte: sevenDaysAgo },
          },
        })
        .catch(() => null);

      if (!recentNotif) {
        const oldestDays = Math.max(
          ...agedOpen.map((a: any) =>
            Math.max(0, -calendarDayDiff(a.openedAt, todayStr))
          )
        );
        await (db as any).notification
          .create({
            data: {
              organizationId: orgId,
              userId: auth.user.id,
              title: 'Escalation: Corrective Actions Open >15 Days',
              message: `${agedOpen.length} corrective action(s) remain open past 15 days (oldest: ${oldestDays}d). Review in Corrective Actions board.`,
              type: 'ALERT',
              link: '/dashboard',
            },
          })
          .catch(() => null);
      }
    }

    return NextResponse.json({ correctiveActions: actions });
  } catch (error: any) {
    console.error('Error fetching corrective actions:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      buildingId,
      equipmentId,
      inspectionId,
      assetRef,
      title,
      description,
      severity,
      assignedToUserId,
      openedAt,
    } = body;

    if (!buildingId || !title || !String(title).trim()) {
      return NextResponse.json(
        { error: 'Building and Finding Title are required' },
        { status: 400 }
      );
    }

    const cleanSeverity = VALID_SEVERITIES.includes(String(severity).toUpperCase())
      ? String(severity).toUpperCase()
      : 'MEDIUM';

    const created = await (db as any).correctiveAction.create({
      data: {
        organizationId: auth.organization.id,
        buildingId: String(buildingId).trim(),
        equipmentId: equipmentId && String(equipmentId).trim() ? String(equipmentId).trim() : null,
        inspectionId: inspectionId && String(inspectionId).trim() ? String(inspectionId).trim() : null,
        assetRef: assetRef && String(assetRef).trim() ? String(assetRef).trim() : null,
        title: String(title).trim(),
        description: description && String(description).trim() ? String(description).trim() : '',
        severity: cleanSeverity,
        status: 'OPEN',
        reportedByUserId: auth.user.id,
        assignedToUserId:
          assignedToUserId && String(assignedToUserId).trim()
            ? String(assignedToUserId).trim()
            : null,
        ...(openedAt && !isNaN(new Date(openedAt).getTime())
          ? { openedAt: new Date(openedAt) }
          : {}),
      },
      include: {
        building: { select: { id: true, name: true, address: true } },
        equipment: { select: { id: true, qrCode: true, type: true, location: true } },
      },
    });

    await logAuditActivity({
      organizationId: auth.organization.id,
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: 'CORRECTIVE_ACTION_CREATED',
      entityType: 'CorrectiveAction',
      entityId: created.id,
      details: `Created [${created.severity}] finding "${created.title}" at ${
        created.building?.name || 'Building'
      }${created.assetRef ? ` (Asset: ${created.assetRef})` : ''}`,
    });

    return NextResponse.json({ success: true, correctiveAction: created });
  } catch (error: any) {
    console.error('Error creating corrective action:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, workshopNote, closeNote, assignedToUserId, openedAt } = body;

    if (!id) {
      return NextResponse.json({ error: 'Corrective action ID is required' }, { status: 400 });
    }

    const existing = await (db as any).correctiveAction.findFirst({
      where: { id, organizationId: auth.organization.id },
      include: { building: { select: { id: true, name: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Corrective action not found' }, { status: 404 });
    }

    const now = new Date();
    const dataToUpdate: any = {};

    if (status) {
      const targetStatus = String(status).toUpperCase();
      if (!VALID_STATUSES.includes(targetStatus)) {
        return NextResponse.json({ error: `Invalid status: ${targetStatus}` }, { status: 400 });
      }

      if (targetStatus === 'CLOSED') {
        const cleanCloseNote = typeof closeNote === 'string' ? closeNote.trim() : '';
        if (!cleanCloseNote) {
          return NextResponse.json(
            { error: 'Closure verification note is required to close a corrective action.' },
            { status: 400 }
          );
        }
        dataToUpdate.closeNote = cleanCloseNote;
        dataToUpdate.closedAt = now;
        dataToUpdate.closedByUserId = auth.user.id;
      }

      if (targetStatus === 'DISPATCHED') {
        dataToUpdate.dispatchedAt = existing.dispatchedAt || now;
        if (workshopNote !== undefined) {
          dataToUpdate.workshopNote = String(workshopNote).trim() || null;
        }
      }

      if (targetStatus === 'REPAIRED') {
        dataToUpdate.repairedAt = existing.repairedAt || now;
      }

      if (targetStatus === 'VERIFIED') {
        dataToUpdate.verifiedAt = existing.verifiedAt || now;
      }

      dataToUpdate.status = targetStatus;
    }

    if (workshopNote !== undefined && dataToUpdate.workshopNote === undefined) {
      dataToUpdate.workshopNote = String(workshopNote).trim() || null;
    }

    if (assignedToUserId !== undefined) {
      dataToUpdate.assignedToUserId =
        assignedToUserId && String(assignedToUserId).trim()
          ? String(assignedToUserId).trim()
          : null;
    }

    if (openedAt && !isNaN(new Date(openedAt).getTime())) {
      dataToUpdate.openedAt = new Date(openedAt);
    }

    const updated = await (db as any).correctiveAction.update({
      where: { id: existing.id },
      data: dataToUpdate,
      include: {
        building: { select: { id: true, name: true, address: true } },
        equipment: { select: { id: true, qrCode: true, type: true, location: true } },
      },
    });

    await logAuditActivity({
      organizationId: auth.organization.id,
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: `CORRECTIVE_ACTION_${updated.status}`,
      entityType: 'CorrectiveAction',
      entityId: updated.id,
      details: `Transitioned finding "${updated.title}" (${
        existing.building?.name || 'Site'
      }) from ${existing.status} → ${updated.status}${
        updated.workshopNote ? ` [Workshop: ${updated.workshopNote}]` : ''
      }${updated.closeNote ? ` [Closure Note: ${updated.closeNote}]` : ''}`,
    });

    return NextResponse.json({ success: true, correctiveAction: updated });
  } catch (error: any) {
    console.error('Error updating corrective action:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
