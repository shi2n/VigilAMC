import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { addCalendarMonths, toDbDate, fromDbDate, todayCalendarDateString } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contracts = (db as any).amcContract ? await (db as any).amcContract.findMany({
      where: {
        building: {
          organizationId: auth.organization.id,
        },
      },
      include: {
        building: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            occupancyType: true,
            contactPerson: true,
            contactPhone: true,
            _count: {
              select: { assets: true },
            },
          },
        },
      },
      orderBy: { endDate: 'asc' },
    }) : [];

    const safeContracts = contracts || [];
    const totalActiveValue = safeContracts
      .filter((c: any) => c.status === 'ACTIVE')
      .reduce((sum: number, c: any) => sum + (c.annualValue || 0), 0);

    return NextResponse.json({
      contracts: safeContracts,
      analytics: {
        totalActiveContracts: safeContracts.filter((c: any) => c.status === 'ACTIVE').length,
        totalActiveValue,
        projectedMRR: Math.round(totalActiveValue / 12),
        pendingRenewals: safeContracts.filter((c: any) => c.status === 'EXPIRING_SOON' || c.status === 'EXPIRED').length,
      },
    });
  } catch (error: any) {
    console.error('Error in AMC API:', error);
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
      buildingId,
      contractNumber,
      annualValue,
      startDate,
      endDate,
      totalVisitsPerYear,
      paymentStatus,
      status,
      scopeSummary,
    } = body;

    if (!buildingId) {
      return NextResponse.json({ error: 'buildingId is required' }, { status: 400 });
    }

    const building = await (db as any).building.findFirst({
      where: { id: buildingId, organizationId: auth.organization.id },
      select: { id: true },
    });
    if (!building) {
      return NextResponse.json({ error: 'Building not found in your organization' }, { status: 404 });
    }

    if (!(db as any).amcContract) {
      return NextResponse.json({ error: 'AMC contract storage is not enabled on this deployment' }, { status: 501 });
    }

    const amc = await (db as any).amcContract.create({
      data: {
        buildingId,
        contractNumber: contractNumber || `AMC/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
        annualValue: parseFloat(annualValue) || 60000,
        startDate: startDate ? toDbDate(fromDbDate(startDate)) : toDbDate(todayCalendarDateString()),
        endDate: endDate ? toDbDate(fromDbDate(endDate)) : toDbDate(addCalendarMonths(todayCalendarDateString(), 12)),
        totalVisitsPerYear: Number(totalVisitsPerYear) || 4,
        paymentStatus: paymentStatus || 'PAID',
        status: status || 'ACTIVE',
        scopeSummary: scopeSummary || 'Comprehensive Fire Extinguisher, Hydrant, and Form-B Compliance AMC',
      },
      include: {
        building: true,
      },
    });

    return NextResponse.json({ success: true, amc });
  } catch (error: any) {
    console.error('Error creating AMC contract:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
