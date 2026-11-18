import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { sanitizeAgencyCredentials } from '@/lib/compliance-engine';
import { addCalendarMonths, todayCalendarDateString, toDbDate } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Asset Tag ID is required' }, { status: 400 });
    }

    const equipment = await (db as any).equipment.findUnique({
      where: { qrCode: code },
      include: {
        building: {
          include: {
            client: true,
            organization: true,
          },
        },
        serviceLogs: {
          orderBy: { servicedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found for this Asset Tag' }, { status: 404 });
    }

    if (equipment.organizationId && equipment.organizationId !== auth.organization.id) {
      return NextResponse.json({ error: 'Forbidden: Asset belongs to another agency' }, { status: 403 });
    }

    const org = equipment.building?.organization;
    const sanitizedAgency = sanitizeAgencyCredentials(org, null);

    const companyInfo = {
      name: sanitizedAgency.legalName,
      licenseNumber: sanitizedAgency.licenseNumber || 'Not Provided',
      phone: sanitizedAgency.phone,
      email: sanitizedAgency.email,
      signatoryName: sanitizedAgency.signatoryName || 'Authorized Agency Representative',
    };

    const asset = {
      ...equipment,
      building: equipment.building
        ? {
            ...equipment.building,
            company: companyInfo,
          }
        : null,
      serialNumber: equipment.serialNumber || equipment.qrCode,
      locationFloor: equipment.floor || equipment.location,
      locationWing: equipment.wing || '',
      locationSpecific: equipment.location,
      brand: equipment.manufacturer || 'Not Specified',
      lastRefillDate: equipment.lastServiceDate,
      nextRefillDueDate: equipment.nextDueDate,
      lastHydroTestDate: equipment.lastServiceDate,
      nextHydroTestDueDate: equipment.nextDueDate,
      inspections: (equipment.serviceLogs || []).map((log: any) => ({
        id: log.id,
        inspectedAt: log.servicedAt,
        technicianName: log.technicianName,
        remarks: log.notes || log.actionType,
      })),
    };

    return NextResponse.json({ asset });
  } catch (error: any) {
    console.error('Error in asset lookup:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      qrCode,
      technicianName,
      actionType,
      remarks,
      newStatus,
    } = body;

    if (!qrCode) {
      return NextResponse.json({ error: 'Asset Tag ID required' }, { status: 400 });
    }

    const equipment = await (db as any).equipment.findUnique({
      where: { qrCode },
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    if (equipment.organizationId && equipment.organizationId !== auth.organization.id) {
      return NextResponse.json({ error: 'Forbidden: Asset belongs to another agency' }, { status: 403 });
    }

    const ALLOWED_STATUSES = ['COMPLIANT', 'DUE_SOON', 'OVERDUE', 'DEFECTIVE', 'VERIFIED', 'SERVICE_REQUIRED', 'REPLACEMENT_REQUIRED'];
    const safeStatus = newStatus && ALLOWED_STATUSES.includes(String(newStatus).toUpperCase())
      ? String(newStatus).toUpperCase()
      : 'COMPLIANT';

    const todayStr = todayCalendarDateString();
    const intervalMonths = equipment.serviceIntervalMonths || 12;
    const nextDueStr = addCalendarMonths(todayStr, intervalMonths);

    const updatedEquipment = await (db as any).equipment.update({
      where: { id: equipment.id },
      data: {
        lastServiceDate: toDbDate(todayStr),
        nextDueDate: toDbDate(nextDueStr),
        status: safeStatus,
      },
    });

    const log = await (db as any).serviceLog.create({
      data: {
        equipmentId: equipment.id,
        technicianName: auth.profile?.fullName || technicianName || 'Field Service Technician',
        actionType: actionType || 'Routine Maintenance',
        nextDueDate: toDbDate(nextDueStr),
        notes: remarks || '',
      },
    });

    return NextResponse.json({ success: true, equipment: updatedEquipment, log });
  } catch (error: any) {
    console.error('Error logging asset service:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
