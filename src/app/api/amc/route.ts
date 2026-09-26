import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const contracts = (db as any).amcContract ? await (db as any).amcContract.findMany({
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

    const amc = (db as any).amcContract ? await (db as any).amcContract.create({
      data: {
        buildingId,
        contractNumber: contractNumber || `AMC/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
        annualValue: parseFloat(annualValue) || 60000,
        startDate: new Date(startDate || new Date()),
        endDate: new Date(endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
        totalVisitsPerYear: Number(totalVisitsPerYear) || 4,
        paymentStatus: paymentStatus || 'PAID',
        status: status || 'ACTIVE',
        scopeSummary: scopeSummary || 'Comprehensive Fire Extinguisher, Hydrant, and Form-B Compliance AMC',
      },
      include: {
        building: true,
      },
    }) : null;

    return NextResponse.json({ success: true, amc });
  } catch (error: any) {
    console.error('Error creating AMC contract:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
