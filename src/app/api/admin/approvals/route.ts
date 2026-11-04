import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor } from '@/lib/techSession';
import { logAuditActivity } from '@/lib/auth';
import { notifyOnAssignment } from '@/lib/notify';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    const where: any = {
      organizationId: auth.organization.id,
    };
    if (statusFilter && statusFilter !== 'ALL') {
      where.approvalStatus = statusFilter;
    }

    const inspections = await (db as any).inspection.findMany({
      where,
      include: {
        building: { select: { id: true, name: true, address: true } },
        equipment: {
          select: { id: true, qrCode: true, type: true, capacity: true, location: true },
        },
        inspectionPhotos: true,
        technician: { select: { id: true, fullName: true, email: true, employeeId: true } },
      },
      orderBy: { date: 'desc' },
      take: 100,
    });

    return NextResponse.json({ inspections });
  } catch (error: any) {
    console.error('Error fetching approval queue:', error);
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
    const { action, inspectionId, inspectionIds, note } = body;

    const orgId = auth.organization.id;
    const now = new Date();

    if (action === 'APPROVE') {
      const ids: string[] = Array.isArray(inspectionIds)
        ? inspectionIds.filter(Boolean)
        : inspectionId
        ? [inspectionId]
        : [];

      if (ids.length === 0) {
        return NextResponse.json({ error: 'No inspection IDs provided' }, { status: 400 });
      }

      const targetRows = await (db as any).inspection.findMany({
        where: {
          id: { in: ids },
          organizationId: orgId,
        },
        include: {
          building: { select: { id: true, name: true } },
          equipment: { select: { id: true, qrCode: true } },
        },
      });

      if (targetRows.length === 0) {
        return NextResponse.json({ error: 'No matching inspections found' }, { status: 404 });
      }

      await (db as any).inspection.updateMany({
        where: {
          id: { in: targetRows.map((r: any) => r.id) },
          organizationId: orgId,
        },
        data: {
          approvalStatus: 'APPROVED',
          approvalNote: note && String(note).trim() ? String(note).trim() : null,
          approvedAt: now,
          approvedByUserId: auth.user.id,
        },
      });

      for (const row of targetRows) {
        await logAuditActivity({
          organizationId: orgId,
          userId: auth.user.id,
          userEmail: auth.user.email,
          action: 'INSPECTION_APPROVED',
          entityType: 'Inspection',
          entityId: row.id,
          details: `Approved inspection for ${row.equipment?.qrCode || 'Facility'} at ${
            row.building?.name || 'Site'
          } (submitted by ${row.technicianName || 'Technician'})`,
        });
      }

      return NextResponse.json({
        success: true,
        approvedCount: targetRows.length,
        approvedIds: targetRows.map((r: any) => r.id),
      });
    }

    if (action === 'RETURN') {
      if (!inspectionId) {
        return NextResponse.json({ error: 'Inspection ID is required' }, { status: 400 });
      }
      const cleanNote = typeof note === 'string' ? note.trim() : '';
      if (!cleanNote) {
        return NextResponse.json(
          { error: 'A return reason note is required when returning an inspection.' },
          { status: 400 }
        );
      }

      const row = await (db as any).inspection.findFirst({
        where: { id: inspectionId, organizationId: orgId },
        include: {
          building: { select: { id: true, name: true } },
          equipment: { select: { id: true, qrCode: true } },
        },
      });

      if (!row) {
        return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
      }

      const updated = await (db as any).inspection.update({
        where: { id: row.id },
        data: {
          approvalStatus: 'RETURNED',
          approvalNote: cleanNote,
          approvedAt: now,
          approvedByUserId: auth.user.id,
        },
      });

      // Notify technician via existing notification mechanism (Module A4)
      const recipientTechId = row.technicianId || auth.user.id;
      await notifyOnAssignment({
        type: 'WORK_ORDER',
        technicianId: recipientTechId,
        organizationId: orgId,
        title: `Inspection Returned — ${row.building?.name || 'Site'}`,
        message: `Inspection returned for ${row.equipment?.qrCode || row.building?.name || 'Asset'}: ${cleanNote}`,
        link: '/technician',
        taskId: row.id,
      });

      await logAuditActivity({
        organizationId: orgId,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: 'INSPECTION_RETURNED',
        entityType: 'Inspection',
        entityId: row.id,
        details: `Returned inspection for ${row.equipment?.qrCode || 'Facility'} at ${
          row.building?.name || 'Site'
        } with note: "${cleanNote}"`,
      });

      return NextResponse.json({
        success: true,
        inspection: updated,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating inspection approval:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
