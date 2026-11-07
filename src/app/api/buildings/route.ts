import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { detectJurisdictionFromBuilding } from '@/lib/compliance-engine';

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
        equipments: {
          include: {
            inspections: {
              where: { approvalStatus: 'APPROVED' },
              orderBy: { date: 'desc' },
              take: 1,
            },
          },
        },
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
      let notInspectedCount = 0;

      b.equipments.forEach((eq: any) => {
        const hasInspection = Boolean(eq.inspections && eq.inspections.length > 0);
        const diffDays = eq.nextDueDate
          ? Math.ceil((new Date(eq.nextDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : 999999;
        if (diffDays < 0 || eq.status === 'OVERDUE' || eq.status === 'DEFECTIVE') overdueCount++;
        else if (diffDays <= 30 || eq.status === 'DUE_SOON') dueCount++;
        else if (!hasInspection) notInspectedCount++;
        else compliantCount++;
      });

      const overallStatus =
        b.equipments.length === 0
          ? 'INSUFFICIENT_DATA'
          : overdueCount > 0
          ? 'OVERDUE'
          : dueCount > 0
          ? 'DUE_SOON'
          : notInspectedCount > 0
          ? 'NOT_INSPECTED'
          : 'VERIFIED';

      return {
        ...b,
        city: b.city || b.address || '',
        jurisdictionCode: detectJurisdictionFromBuilding(b),
        occupancyType: b.occupancyType || 'Commercial / Residential',
        fireNocNumber: b.fireNocNumber || b.fscNumber || null,
        nocExpiryDate: b.fireNocExpiryDate || b.fscValidityDate || b.nextFilingDueDate,
        totalAssets: b.equipments.length,
        assets: b.equipments,
        compliantCount,
        dueCount,
        overdueCount,
        notInspectedCount,
        status: overallStatus,
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
      state,
      occupancyType,
      buildingHeight,
      localAuthority,
      jurisdictionCode,
      fscNumber,
      fscValidityDate,
      fireNocNumber,
      fireNocIssueDate,
      fireNocExpiryDate,
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

    const detectedJurisdiction =
      jurisdictionCode ||
      detectJurisdictionFromBuilding({
        city,
        state,
        address,
      });

    const building = await (db as any).building.create({
      data: {
        organizationId: auth.organization.id,
        clientId: client.id,
        name: name.trim(),
        address: (address || city || 'Facility Address').trim(),
        city: city ? String(city).trim() : null,
        state: state ? String(state).trim() : null,
        occupancyType: occupancyType ? String(occupancyType).trim() : null,
        buildingHeight: buildingHeight ? String(buildingHeight).trim() : null,
        localAuthority: localAuthority ? String(localAuthority).trim() : null,
        jurisdictionCode: detectedJurisdiction,
        fscNumber: fscNumber ? String(fscNumber).trim() : null,
        fscValidityDate: fscValidityDate ? new Date(fscValidityDate) : null,
        fireNocNumber: fireNocNumber ? String(fireNocNumber).trim() : null,
        fireNocIssueDate: fireNocIssueDate ? new Date(fireNocIssueDate) : null,
        fireNocExpiryDate: fireNocExpiryDate ? new Date(fireNocExpiryDate) : null,
        complianceCycle: 'Half-Yearly',
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
