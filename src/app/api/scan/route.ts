import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'QR Code is required' }, { status: 400 });
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
      return NextResponse.json({ error: 'Equipment not found for this QR Code' }, { status: 404 });
    }

    const org = equipment.building?.organization;
    let signatoryName = 'Shaizan';
    if (equipment.organizationId) {
      const adminProfile = await (db as any).userProfile
        .findFirst({
          where: { organizationId: equipment.organizationId, role: 'ORG_ADMIN' },
          orderBy: { createdAt: 'asc' },
        })
        .catch(() => null);
      if (adminProfile?.fullName && adminProfile.fullName.trim().toLowerCase() !== 'jordan michael') {
        signatoryName = adminProfile.fullName.trim();
      }
    }

    const companyInfo = {
      name: org?.name || 'Vigil Fire & Safety Solutions',
      licenseNumber: org?.licenseNumber || 'DL/FIRE/LIC/2026/042',
      phone: org?.phone || '+91 83838 90483',
      email: org?.email || 'vigilamc@gmail.com',
      signatoryName,
    };

    const asset = {
      ...equipment,
      building: equipment.building
        ? {
            ...equipment.building,
            company: companyInfo,
          }
        : null,
      serialNumber: equipment.qrCode,
      locationFloor: equipment.location,
      locationWing: '',
      locationSpecific: equipment.location,
      brand: 'Standard ISI',
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
    console.error('Error in scan lookup:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      qrCode,
      technicianName,
      actionType,
      remarks,
      newStatus,
    } = body;

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code required' }, { status: 400 });
    }

    const equipment = await (db as any).equipment.findUnique({
      where: { qrCode },
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    const nextDueDate = new Date(Date.now() + (equipment.serviceIntervalMonths || 12) * 30 * 24 * 60 * 60 * 1000);

    const updatedEquipment = await (db as any).equipment.update({
      where: { id: equipment.id },
      data: {
        lastServiceDate: new Date(),
        nextDueDate,
        status: newStatus || 'COMPLIANT',
      },
    });

    const log = await (db as any).serviceLog.create({
      data: {
        equipmentId: equipment.id,
        technicianName: technicianName || 'Technician',
        actionType: actionType || 'Routine Maintenance',
        nextDueDate,
        notes: remarks || '',
      },
    });

    return NextResponse.json({ success: true, equipment: updatedEquipment, log });
  } catch (error: any) {
    console.error('Error logging scan service:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
