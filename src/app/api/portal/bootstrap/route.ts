import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPortalActor } from '@/lib/portalSession';
import { calendarDayDiff } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const actor = await getPortalActor(request);
    if (!actor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { portalUser, client, organization } = actor;
    const clientOrgId = portalUser.clientOrgId;
    const now = new Date();

    // STRICT CROSS-CLIENT ISOLATION: Scoped strictly to clientOrgId
    const buildings = await (db as any).building.findMany({
      where: {
        clientId: clientOrgId,
        organizationId: organization.id,
      },
      include: {
        equipments: {
          select: {
            id: true,
            qrCode: true,
            type: true,
            capacity: true,
            location: true,
            status: true,
            lastServiceDate: true,
            nextDueDate: true,
            hydroDueDate: true,
          },
        },
        inspections: {
          where: {
            approvalStatus: 'APPROVED', // Only approved inspections are accessible
          },
          select: {
            id: true,
            date: true,
            technicianName: true,
            status: true,
            pressureGauge: true,
            overallCondition: true,
            remarks: true,
            checklist: true,
            equipmentId: true,
          },
          orderBy: {
            date: 'desc',
          },
        },
        reportAcks: {
          include: {
            portalUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Compute rollups & compliance metrics
    let totalAssets = 0;
    let overdueAssets = 0;
    let dueSoonAssets = 0;
    let okAssets = 0;

    const enrichedBuildings = buildings.map((b: any) => {
      let bOverdue = 0;
      let bDueSoon = 0;
      let bOk = 0;

      const eqs = (b.equipments || []).map((eq: any) => {
        totalAssets += 1;
        const diffDays = eq.nextDueDate ? calendarDayDiff(eq.nextDueDate, now) : null;

        let liveStatus = 'OK';
        if ((diffDays !== null && diffDays < 0) || eq.status === 'OVERDUE') {
          liveStatus = 'OVERDUE';
          overdueAssets += 1;
          bOverdue += 1;
        } else if ((diffDays !== null && diffDays <= 30) || eq.status === 'DUE_SOON') {
          liveStatus = 'DUE_SOON';
          dueSoonAssets += 1;
          bDueSoon += 1;
        } else {
          okAssets += 1;
          bOk += 1;
        }

        return {
          ...eq,
          computedStatus: liveStatus,
        };
      });

      const buildingStatus = bOverdue > 0 ? 'OVERDUE' : bDueSoon > 0 ? 'DUE_SOON' : 'OK';

      // Find last approved inspection date
      const lastInspection = b.inspections?.[0]?.date || null;

      return {
        id: b.id,
        name: b.name,
        address: b.address,
        city: b.city || 'N/A',
        complianceCycle: b.complianceCycle || 'Half-Yearly',
        reportingCycle: b.reportingCycle || 'Half-Yearly',
        status: buildingStatus,
        assetCount: eqs.length,
        okCount: bOk,
        dueSoonCount: bDueSoon,
        overdueCount: bOverdue,
        lastApprovedInspectionDate: lastInspection,
        inspections: b.inspections,
        reportAcks: b.reportAcks,
      };
    });

    const compliancePercent =
      totalAssets > 0 ? Math.round(((totalAssets - overdueAssets) / totalAssets) * 100) : 100;

    return NextResponse.json({
      portalUser: {
        id: portalUser.id,
        name: portalUser.name,
        email: portalUser.email,
        lastLoginAt: portalUser.lastLoginAt,
      },
      client: {
        id: client.id,
        name: client.name,
        contactPerson: client.contactPerson,
        phone: client.phone,
        email: client.email,
      },
      agency: {
        id: organization.id,
        name: organization.name,
        brandLogoUrl: organization.brandLogoUrl || null,
        phone: organization.phone || null,
        email: organization.email || null,
        address: organization.address || null,
        signatoryName: organization.signatoryName || null,
        signatoryDesignation: organization.signatoryDesignation || null,
        reportFooterText: organization.reportFooterText || null,
      },
      portfolio: {
        buildingCount: enrichedBuildings.length,
        totalAssets,
        okAssets,
        dueSoonAssets,
        overdueAssets,
        expiring30dCount: dueSoonAssets + overdueAssets,
        compliancePercent,
      },
      buildings: enrichedBuildings,
    });
  } catch (error: any) {
    console.error('[Portal Bootstrap Error]:', error);
    return NextResponse.json({ error: 'Failed to load client portal' }, { status: 500 });
  }
}
