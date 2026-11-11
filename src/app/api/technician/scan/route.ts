import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, logAuditActivity } from '@/lib/auth';
import { calendarDayDiff, addCalendarMonths, fromDbDate, toDbDate, todayCalendarDateString, formatDisplay } from '@/lib/dates';
import { logEquipmentHistory } from '@/lib/equipmentHistory';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('qrCode') || searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'QR Code is required' }, { status: 400 });
    }

    const auth = await getCurrentUser(request);

    const equipment = await (db as any).equipment.findUnique({
      where: { qrCode: code.trim().toUpperCase() },
      include: {
        building: {
          include: {
            client: true,
          },
        },
        serviceLogs: {
          orderBy: { servicedAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!equipment) {
      return NextResponse.json({ error: `No equipment found with QR code "${code}"` }, { status: 404 });
    }

    // Tenant Isolation Check:
    // If technician or admin is authenticated, ensure equipment belongs to their agency
    if (auth?.organization && equipment.organizationId && equipment.organizationId !== auth.organization.id) {
      return NextResponse.json(
        { error: 'Unauthorized: This asset belongs to another agency and cannot be accessed.' },
        { status: 403 }
      );
    }

    // Log asset scanned activity if user is authenticated
    if (auth && equipment.organizationId) {
      await logAuditActivity({
        organizationId: equipment.organizationId,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: 'ASSET_SCANNED',
        entityType: 'Equipment',
        entityId: equipment.id,
        details: `Asset "${equipment.qrCode}" scanned by ${auth.profile?.fullName || auth.user.email}`,
      });
    }

    // Evaluate live status
    const todayStr = todayCalendarDateString();
    const diffDays = equipment.nextDueDate
      ? calendarDayDiff(fromDbDate(equipment.nextDueDate), todayStr)
      : 999999;
    let currentStatus = 'COMPLIANT';
    if (diffDays < 0) currentStatus = 'OVERDUE';
    else if (diffDays <= 30) currentStatus = 'DUE_SOON';

    return NextResponse.json({
      equipment: {
        ...equipment,
        liveStatus: currentStatus,
        daysRemaining: diffDays,
      },
    });
  } catch (error: any) {
    console.error('Error in technician scan lookup:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    const body = await request.json();
    const { qrCode, equipmentId, intervalMonths = 12, notes } = body;

    let eq = null;
    if (qrCode) {
      eq = await (db as any).equipment.findUnique({ where: { qrCode: qrCode.trim().toUpperCase() } });
    } else if (equipmentId) {
      eq = await (db as any).equipment.findUnique({ where: { id: equipmentId } });
    }

    if (!eq) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    // Tenant Isolation Check:
    if (auth?.organization && eq.organizationId && eq.organizationId !== auth.organization.id) {
      return NextResponse.json(
        { error: 'Unauthorized: This equipment belongs to another agency.' },
        { status: 403 }
      );
    }

    // Resolve technician name from authenticated profile or body fallback
    const resolvedTechnicianName = auth?.profile?.fullName || body.technicianName || 'Field Technician';

    const todayStrPost = todayCalendarDateString();
    const months = Number(intervalMonths) || 12;
    const nextDueStr = addCalendarMonths(todayStrPost, months);
    const nextDueDate = toDbDate(nextDueStr);

    // 1. Create Service Log
    const log = await (db as any).serviceLog.create({
      data: {
        equipmentId: eq.id,
        technicianName: resolvedTechnicianName,
        servicedAt: toDbDate(todayStrPost),
        nextDueDate,
        actionType: months === 12 ? 'Annual Refill & IS 2190 Pressure Overhaul' : 'Half-Yearly Maintenance Check',
        notes: notes || `Service verified by ${resolvedTechnicianName}. Next due set to ${formatDisplay(nextDueStr)}`,
      },
    });

    // 2. Update Equipment status to COMPLIANT and set new dates
    const updatedEquipment = await (db as any).equipment.update({
      where: { id: eq.id },
      data: {
        lastServiceDate: toDbDate(todayStrPost),
        nextDueDate,
        status: 'COMPLIANT',
        serviceIntervalMonths: months,
      },
      include: {
        building: {
          include: { client: true },
        },
        serviceLogs: {
          orderBy: { servicedAt: 'desc' },
          take: 5,
        },
      },
    });

    // Log EquipmentHistory
    await logEquipmentHistory({
      equipmentId: eq.id,
      actorName: resolvedTechnicianName,
      actorRole: 'TECHNICIAN',
      action: 'SERVICE_UPDATE',
      changes: [
        { field: 'Live Status', old: eq.status, new: 'COMPLIANT' },
        { field: 'Last Serviced', old: eq.lastServiceDate ? fromDbDate(eq.lastServiceDate) : 'None', new: todayStrPost },
        { field: 'Next Service Due', old: eq.nextDueDate ? fromDbDate(eq.nextDueDate) : 'None', new: nextDueStr },
      ],
    }).catch(() => null);

    // 3. Log audit activity
    if (eq.organizationId) {
      await logAuditActivity({
        organizationId: eq.organizationId,
        userId: auth?.user?.id || undefined,
        userEmail: auth?.user?.email || undefined,
        action: 'INSPECTION_COMPLETED',
        entityType: 'Equipment',
        entityId: eq.id,
        details: `Service logged on asset "${eq.qrCode}" by technician "${resolvedTechnicianName}" (${months} mo cycle)`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Service logged successfully! Next service due on ${formatDisplay(nextDueStr)}.`,
      equipment: updatedEquipment,
      log,
    });
  } catch (error: any) {
    console.error('Error logging technician service:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
