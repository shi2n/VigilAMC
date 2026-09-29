import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({ buildings: [] });
    }

    const buildings = await (db as any).building.findMany({
      where: {
        organizationId: auth.organization.id,
      },
      include: {
        client: true,
        equipments: true,
        reports: {
          orderBy: { generatedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const mapped = buildings.map((b: any) => {
      let compliantCount = 0;
      let dueCount = 0;
      let overdueCount = 0;

      b.equipments.forEach((eq: any) => {
        const diffDays = Math.ceil((new Date(eq.nextDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) overdueCount++;
        else if (diffDays <= 30) dueCount++;
        else compliantCount++;
      });

      return {
        ...b,
        city: b.city || b.address || '',
        occupancyType: b.complianceCycle || 'General Commercial / Residential',
        fireNocNumber: b.licenseNumber || 'Under Review',
        nocExpiryDate: b.nextFilingDueDate,
        totalAssets: b.equipments.length,
        assets: b.equipments,
        compliantCount,
        dueCount,
        overdueCount,
        status: overdueCount > 0 ? 'OVERDUE' : (dueCount > 0 ? 'DUE_SOON' : 'COMPLIANT'),
      };
    });

    return NextResponse.json({ buildings: mapped });
  } catch (error: any) {
    console.error('Error fetching buildings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      address,
      city,
      occupancyType,
      contactPerson,
      contactPhone,
      contactEmail,
      nocExpiryDate,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Building name is required' }, { status: 400 });
    }

    const client = await (db as any).client.create({
      data: {
        organizationId: auth.organization.id,
        name: `${name} Management`,
        contactPerson: contactPerson || 'Facility Manager',
        phone: contactPhone || '',
        email: contactEmail || null,
      },
    });

    const building = await (db as any).building.create({
      data: {
        organizationId: auth.organization.id,
        clientId: client.id,
        name: name.trim(),
        address: (address || city || 'Facility Address').trim(),
        city: (city || '').trim(),
        complianceCycle: occupancyType || 'Delhi NCR Statutory Form-B (Half-Yearly)',
        nextFilingDueDate: nocExpiryDate ? new Date(nocExpiryDate) : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      },
      include: {
        client: true,
        equipments: true,
      },
    });

    return NextResponse.json({ success: true, building });
  } catch (error: any) {
    console.error('Error creating building:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
