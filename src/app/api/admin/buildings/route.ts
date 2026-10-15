import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, logAuditActivity, isPlatformOwner } from '@/lib/auth';
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
          include: {
            inspections: {
              orderBy: { date: 'desc' },
              take: 1,
              select: {
                id: true,
                date: true,
                latitude: true,
                longitude: true,
                photos: true,
                isImported: true,
              },
            },
          },
          orderBy: { location: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const { evaluateEquipmentStatus } = await import('@/lib/compliance');
    const now = new Date();

    // Compute building-level compliance status from real assets
    const evaluatedBuildings = buildings.map((b: any) => {
      let verifiedCount = 0;
      let notInspectedCount = 0;
      let dueCount = 0;
      let overdueCount = 0;

      const enrichedEquipments = b.equipments.map((eq: any) => {
        const evalResult = evaluateEquipmentStatus(eq, now);
        if (evalResult.status === 'OVERDUE') overdueCount++;
        else if (evalResult.status === 'DUE_SOON') dueCount++;
        else if (evalResult.status === 'VERIFIED') verifiedCount++;
        else notInspectedCount++;

        return {
          ...eq,
          complianceStatus: evalResult.status,
          statusLabel: evalResult.label,
          lastVerifiedDate: evalResult.lastVerifiedDate,
          hasGPS: evalResult.hasGPS,
          hasPhoto: evalResult.hasPhoto,
          isImported: evalResult.isImported,
        };
      });

      let overallStatus: 'VERIFIED' | 'DUE_SOON' | 'OVERDUE' | 'NOT_INSPECTED' = 'NOT_INSPECTED';
      if (overdueCount > 0) {
        overallStatus = 'OVERDUE';
      } else if (dueCount > 0) {
        overallStatus = 'DUE_SOON';
      } else if (verifiedCount > 0 && verifiedCount === b.equipments.length) {
        overallStatus = 'VERIFIED';
      }

      const filingDaysRemaining = b.nextFilingDueDate
        ? Math.ceil((new Date(b.nextFilingDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        id: b.id,
        name: b.name,
        address: b.address,
        state: b.state,
        reportingCycle: b.reportingCycle || b.complianceCycle || 'Half-Yearly',
        complianceRuleName: b.complianceRuleName,
        complianceCycle: b.complianceCycle,
        nextFilingDueDate: b.nextFilingDueDate,
        filingDaysRemaining,
        client: b.client,
        totalEquipments: b.equipments.length,
        verifiedCount,
        notInspectedCount,
        dueCount,
        overdueCount,
        overallStatus,
        equipments: enrichedEquipments,
      };
    });

    const totalEquipments = evaluatedBuildings.reduce((sum: number, b: any) => sum + b.totalEquipments, 0);
    const verifiedEquipments = evaluatedBuildings.reduce((sum: number, b: any) => sum + b.verifiedCount, 0);

    const summary = {
      totalBuildings: evaluatedBuildings.length,
      verifiedBuildings: evaluatedBuildings.filter((b: any) => b.overallStatus === 'VERIFIED').length,
      dueSoonBuildings: evaluatedBuildings.filter((b: any) => b.overallStatus === 'DUE_SOON').length,
      overdueBuildings: evaluatedBuildings.filter((b: any) => b.overallStatus === 'OVERDUE').length,
      notInspectedBuildings: evaluatedBuildings.filter((b: any) => b.overallStatus === 'NOT_INSPECTED').length,
      totalEquipments,
      verifiedEquipments,
      overdueEquipments: evaluatedBuildings.reduce((sum: number, b: any) => sum + b.overdueCount, 0),
      dueSoonEquipments: evaluatedBuildings.reduce((sum: number, b: any) => sum + b.dueCount, 0),
      notInspectedEquipments: evaluatedBuildings.reduce((sum: number, b: any) => sum + b.notInspectedCount, 0),
    };

    return NextResponse.json({
      authenticated: true,
      user: auth.user,
      profile: auth.profile,
      company: organization,
      isPlatformOwner: isPlatformOwner(auth),
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
    const {
      clientName,
      contactPerson,
      phone,
      email,
      buildingName,
      address,
      state,
      reportingCycle,
      complianceRuleName,
      complianceCycle,
      cycleIntervalMos
    } = body;

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

    const repCycle = reportingCycle || 'Half-Yearly';
    const intervalMap: Record<string, number> = {
      Monthly: 1,
      Quarterly: 3,
      'Half-Yearly': 6,
      Yearly: 12,
    };
    const interval = Number(cycleIntervalMos) || intervalMap[repCycle] || 6;
    const nextFiling = new Date(Date.now() + interval * 30 * 24 * 60 * 60 * 1000);

    // 2. Create Building associated with user's organization
    const building = await (db as any).building.create({
      data: {
        organizationId,
        clientId: client.id,
        name: (buildingName || 'Main Tower').trim(),
        address: (address || 'Facility Address').trim(),
        state: state?.trim() || null,
        reportingCycle: repCycle,
        complianceRuleName: complianceRuleName?.trim() || null,
        complianceCycle: complianceCycle || repCycle,
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
