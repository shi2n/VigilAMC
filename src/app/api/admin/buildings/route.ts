import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, logAuditActivity } from '@/lib/auth';
import { checkPlanLimit } from '@/lib/plans';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth) {
      return NextResponse.json({
        authenticated: false,
        company: null,
        summary: {
          totalBuildings: 0,
          compliantBuildings: 0,
          dueSoonBuildings: 0,
          overdueBuildings: 0,
          totalEquipments: 0,
        },
        buildings: [],
      }, { status: 401 });
    }

    const organization = auth.organization;
    const buildings = await (db as any).building.findMany({
      where: {
        organizationId: organization?.id,
      },
      include: {
        client: true,
        equipments: {
          orderBy: { location: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    // Compute building-level compliance status from real assets
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

      let overallStatus: 'COMPLIANT' | 'DUE_SOON' | 'OVERDUE' = 'COMPLIANT';
      if (overdueCount > 0) {
        overallStatus = 'OVERDUE';
      } else if (dueCount > 0) {
        overallStatus = 'DUE_SOON';
      }

      const filingDaysRemaining = b.nextFilingDueDate
        ? Math.ceil((new Date(b.nextFilingDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

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

    const summary = {
      totalBuildings: evaluatedBuildings.length,
      compliantBuildings: evaluatedBuildings.filter((b: any) => b.overallStatus === 'COMPLIANT').length,
      dueSoonBuildings: evaluatedBuildings.filter((b: any) => b.overallStatus === 'DUE_SOON').length,
      overdueBuildings: evaluatedBuildings.filter((b: any) => b.overallStatus === 'OVERDUE').length,
      totalEquipments: evaluatedBuildings.reduce((sum: number, b: any) => sum + b.totalEquipments, 0),
    };

    return NextResponse.json({
      authenticated: true,
      user: auth.user,
      profile: auth.profile,
      company: organization,
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
    const auth = await getCurrentUser(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized: Please log in to add facilities.' }, { status: 401 });
    }

    const body = await request.json();
    const { clientName, contactPerson, phone, email, buildingName, address, complianceCycle, cycleIntervalMos } = body;

    const organizationId = auth.organization.id;

    // Enforce Plan Limits for Buildings / Towers
    const limitCheck = await checkPlanLimit(organizationId, 'towers', 1);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: limitCheck.message,
          code: 'PLAN_LIMIT_EXCEEDED',
          current: limitCheck.current,
          max: limitCheck.max,
          planName: limitCheck.planName,
        },
        { status: 403 }
      );
    }

    // 1. Create client associated with user's organization
    const client = await (db as any).client.create({
      data: {
        organizationId,
        name: (clientName || 'Default Facility Group').trim(),
        contactPerson: (contactPerson || 'Facility Manager').trim(),
        phone: (phone || '').trim(),
        email: email ? email.trim() : null,
      },
    });

    const interval = Number(cycleIntervalMos) || 6;
    const nextFiling = new Date(Date.now() + interval * 30 * 24 * 60 * 60 * 1000);

    // 2. Create Building associated with user's organization
    const building = await (db as any).building.create({
      data: {
        organizationId,
        clientId: client.id,
        name: (buildingName || 'Main Tower').trim(),
        address: (address || 'Facility Address').trim(),
        complianceCycle: complianceCycle || 'Delhi NCR Statutory Form-B (Half-Yearly)',
        cycleIntervalMos: interval,
        nextFilingDueDate: nextFiling,
      },
      include: {
        client: true,
        equipments: true,
      },
    });

    await logAuditActivity({
      organizationId,
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: 'BUILDING_CREATED',
      entityType: 'Building',
      entityId: building.id,
      details: `Created building/tower "${building.name}" for client "${client.name}"`,
    });

    return NextResponse.json({ success: true, building });
  } catch (error: any) {
    console.error('Error creating building:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
