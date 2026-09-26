import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const company = await db.company.findFirst();
    const buildings = await db.building.findMany({
      include: {
        client: true,
        equipments: {
          orderBy: { location: 'asc' },
        },
      },
      orderBy: { nextFilingDueDate: 'asc' },
    });

    const now = new Date();

    // Compute building-level compliance status
    const evaluatedBuildings = buildings.map((b: any) => {
      let compliantCount = 0;
      let dueCount = 0;
      let overdueCount = 0;

      b.equipments.forEach((eq: any) => {
        const diffDays = Math.ceil((new Date(eq.nextDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          overdueCount++;
        } else if (diffDays <= 30) {
          dueCount++;
        } else {
          compliantCount++;
        }
      });

      // Overall status
      let overallStatus: 'COMPLIANT' | 'DUE_SOON' | 'OVERDUE' = 'COMPLIANT';
      if (overdueCount > 0) {
        overallStatus = 'OVERDUE'; // RED
      } else if (dueCount > 0) {
        overallStatus = 'DUE_SOON'; // AMBER
      }

      const filingDaysRemaining = Math.ceil((new Date(b.nextFilingDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: b.id,
        name: b.name,
        address: b.address,
        complianceCycle: b.complianceCycle,
        nextFilingDueDate: b.nextFilingDueDate,
        filingDaysRemaining,
        client: b.client,
        totalEquipments: b.equipments.length,
        compliantCount,
        dueCount,
        overdueCount,
        overallStatus,
        equipments: b.equipments,
      };
    });

    // Summary counts for glanceable dashboard header
    const summary = {
      totalBuildings: evaluatedBuildings.length,
      compliantBuildings: evaluatedBuildings.filter((b: any) => b.overallStatus === 'COMPLIANT').length,
      dueSoonBuildings: evaluatedBuildings.filter((b: any) => b.overallStatus === 'DUE_SOON').length,
      overdueBuildings: evaluatedBuildings.filter((b: any) => b.overallStatus === 'OVERDUE').length,
      totalEquipments: evaluatedBuildings.reduce((sum: number, b: any) => sum + b.totalEquipments, 0),
    };

    return NextResponse.json({
      company,
      summary,
      buildings: evaluatedBuildings,
    });
  } catch (error: any) {
    console.error('Error fetching admin buildings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientName, contactPerson, phone, email, buildingName, address, complianceCycle, cycleIntervalMos } = body;

    let company = await db.company.findFirst();
    if (!company) {
      company = await db.company.create({
        data: {
          name: 'Vigil Fire & Safety Solutions',
          licenseNumber: 'MH/FIRE/LIC/2022/A-412',
        },
      });
    }

    // 1. Create or link Client
    const client = await db.client.create({
      data: {
        companyId: company.id,
        name: clientName || 'New Client Enterprise',
        contactPerson: contactPerson || 'Facility Manager',
        phone: phone || '+91 98000 00000',
        email: email || 'contact@client.com',
      },
    });

    const interval = Number(cycleIntervalMos) || 6;
    const nextFiling = new Date(Date.now() + interval * 30 * 24 * 60 * 60 * 1000);

    // 2. Create Building
    const building = await db.building.create({
      data: {
        clientId: client.id,
        name: buildingName || 'Building Main Block',
        address: address || 'Mumbai, Maharashtra',
        complianceCycle: complianceCycle || 'Maharashtra Form-B (Half-Yearly)',
        cycleIntervalMos: interval,
        nextFilingDueDate: nextFiling,
      },
      include: {
        client: true,
        equipments: true,
      },
    });

    return NextResponse.json({ success: true, building });
  } catch (error: any) {
    console.error('Error creating client & building:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
