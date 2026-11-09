import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { sendOverdueDigestEmail, EmailSenderInfo } from '@/lib/email';
import { getCalendarDayDiff, formatCalendarDate, formatCalendarDueNotice } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';

interface DigestItem {
  buildingName: string;
  locationZone: string;
  assetTag: string;
  assetType: string;
  dueDate: string;
  status: 'EXPIRED' | 'DUE_SOON' | 'OK';
  dueNotice: string;
  diffDays: number;
}

function processClientData(client: any) {
  const allItems: DigestItem[] = [];
  let totalAssets = 0;
  let overdueCount = 0;
  let dueSoonCount = 0;

  for (const b of client.buildings || []) {
    // 1. Check building nextFilingDueDate (statutory Form-B cycle)
    if (b.nextFilingDueDate) {
      const diff = getCalendarDayDiff(b.nextFilingDueDate);
      if (diff !== null) {
        let st: 'EXPIRED' | 'DUE_SOON' | 'OK' = 'OK';
        if (diff < 0) {
          st = 'EXPIRED';
          overdueCount++;
        } else if (diff <= 30) {
          st = 'DUE_SOON';
          dueSoonCount++;
        }

        allItems.push({
          buildingName: b.name,
          locationZone: 'Entire Building',
          assetTag: 'FORM-B FILING',
          assetType: `Statutory Compliance Cycle (${b.reportingCycle || 'Half-Yearly'})`,
          dueDate: formatCalendarDate(b.nextFilingDueDate),
          status: st,
          dueNotice: formatCalendarDueNotice(diff),
          diffDays: diff,
        });
      }
    }

    // 2. Check equipment nextDueDate
    for (const eq of b.equipments || []) {
      totalAssets++;
      if (eq.nextDueDate) {
        const diff = getCalendarDayDiff(eq.nextDueDate);
        if (diff !== null) {
          let st: 'EXPIRED' | 'DUE_SOON' | 'OK' = 'OK';
          if (diff < 0) {
            st = 'EXPIRED';
            overdueCount++;
          } else if (diff <= 30) {
            st = 'DUE_SOON';
            dueSoonCount++;
          }

          const loc = [
            eq.floorNumber ? `Floor ${eq.floorNumber}` : null,
            eq.location || null,
          ].filter(Boolean).join(' • ') || 'General Facility';

          allItems.push({
            buildingName: b.name,
            locationZone: loc,
            assetTag: eq.name || `EQ-${eq.id.slice(0, 6)}`,
            assetType: `${eq.type || 'Equipment'}${eq.capacity ? ` (${eq.capacity})` : ''}`,
            dueDate: formatCalendarDate(eq.nextDueDate),
            status: st,
            dueNotice: formatCalendarDueNotice(diff),
            diffDays: diff,
          });
        }
      }
    }

    // 3. Open corrective action due dates
    for (const ca of b.correctiveActions || []) {
      if (ca.status === 'OPEN' || ca.status === 'PENDING') {
        const diff = getCalendarDayDiff(ca.dueDate);
        if (diff !== null) {
          let st: 'EXPIRED' | 'DUE_SOON' | 'OK' = 'OK';
          if (diff < 0) {
            st = 'EXPIRED';
          } else if (diff <= 30) {
            st = 'DUE_SOON';
          }

          allItems.push({
            buildingName: b.name,
            locationZone: ca.location || 'Defect Area',
            assetTag: 'CORRECTIVE ACTION',
            assetType: ca.title || 'Required Maintenance Action',
            dueDate: formatCalendarDate(ca.dueDate),
            status: st,
            dueNotice: formatCalendarDueNotice(diff),
            diffDays: diff,
          });
        }
      }
    }
  }

  // Sort items: most overdue first, then soonest due
  allItems.sort((a, b) => a.diffDays - b.diffDays);

  return {
    allItems,
    summaryCounts: {
      overdue: overdueCount,
      dueSoon: dueSoonCount,
      totalAssets,
    },
  };
}

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser(request, { skipSubscription: true });
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const buildingId = searchParams.get('buildingId');

    if (!clientId && !buildingId) {
      return NextResponse.json({ error: 'clientId or buildingId is required' }, { status: 400 });
    }

    const orgId = auth.organization?.id || null;

    let client: any = null;
    let targetBuilding: any = null;

    if (clientId) {
      client = await (db as any).client.findUnique({
        where: { id: clientId },
        include: {
          buildings: {
            include: {
              equipments: true,
              correctiveActions: true,
            },
          },
        },
      });
    } else if (buildingId) {
      targetBuilding = await (db as any).building.findUnique({
        where: { id: buildingId },
        include: {
          client: true,
          equipments: true,
          correctiveActions: true,
        },
      });
      if (targetBuilding) {
        client = targetBuilding.client || {
          id: 'b-client',
          name: targetBuilding.name,
          contactPerson: 'Building Management',
          email: null,
          phone: null,
        };
        client.buildings = [targetBuilding];
      }
    }

    if (!client) {
      return NextResponse.json({ error: 'Client or building not found' }, { status: 404 });
    }

    if (orgId && client.organizationId && client.organizationId !== orgId) {
      return NextResponse.json({ error: 'Access is denied' }, { status: 403 });
    }

    const { allItems, summaryCounts } = processClientData(client);

    const overdueCount = allItems.filter((i) => i.diffDays < 0).length;
    const next7DaysCount = allItems.filter((i) => i.diffDays >= 0 && i.diffDays <= 7).length;
    const next30DaysCount = allItems.filter((i) => i.diffDays > 7 && i.diffDays <= 30).length;

    const defaultSubject = `VigilAMC: Overdue & Due Soon Items — ${client.name}`.slice(0, 60);

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        contactPerson: client.contactPerson || '',
        email: client.email || '',
        phone: client.phone || '',
      },
      summaryCounts,
      scopeCounts: {
        overdue: overdueCount,
        next7Days: next7DaysCount,
        next30Days: next30DaysCount,
        totalItems: allItems.length,
      },
      defaultSubject,
      defaultCc: 'support@vigilamc.com',
      previewItems: allItems.slice(0, 50),
    });
  } catch (error: any) {
    console.error('[API /api/clients/overdue-email GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser(request, { skipSubscription: true });
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const {
      clientId,
      buildingId,
      to,
      cc,
      subject,
      message,
      includeOverdue = true,
      includeNext7Days = true,
      includeNext30Days = false,
    } = body;

    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return NextResponse.json({ error: 'A valid recipient email (to) is required' }, { status: 400 });
    }

    const orgId = auth.organization?.id || null;
    const profile = auth.profile || {};
    const org = auth.organization || {};

    let client: any = null;
    let targetBuilding: any = null;

    if (clientId) {
      client = await (db as any).client.findUnique({
        where: { id: clientId },
        include: {
          buildings: {
            include: {
              equipments: true,
              correctiveActions: true,
            },
          },
        },
      });
    } else if (buildingId) {
      targetBuilding = await (db as any).building.findUnique({
        where: { id: buildingId },
        include: {
          client: true,
          equipments: true,
          correctiveActions: true,
        },
      });
      if (targetBuilding) {
        client = targetBuilding.client || {
          id: 'b-client',
          name: targetBuilding.name,
          contactPerson: 'Building Management',
          email: null,
          phone: null,
        };
        client.buildings = [targetBuilding];
      }
    }

    if (!client) {
      return NextResponse.json({ error: 'Client or building record not found' }, { status: 404 });
    }

    if (orgId && client.organizationId && client.organizationId !== orgId) {
      return NextResponse.json({ error: 'Access is denied' }, { status: 403 });
    }

    const { allItems, summaryCounts } = processClientData(client);

    // Filter items based on selected scope checkboxes
    const filteredItems = allItems.filter((item) => {
      if (item.diffDays < 0 && includeOverdue) return true;
      if (item.diffDays >= 0 && item.diffDays <= 7 && includeNext7Days) return true;
      if (item.diffDays > 7 && item.diffDays <= 30 && includeNext30Days) return true;
      return false;
    });

    const sender: EmailSenderInfo = {
      name: profile.fullName || auth.user.email.split('@')[0],
      role: profile.role === 'ORG_ADMIN' ? 'Authorized Service Representative' : (profile.role || 'Service Manager'),
      agencyName: org.name || 'Vigil Fire & Safety Solutions',
      phone: profile.phone || org.phone || '+91 98201 54321',
      email: auth.user.email,
    };

    const defaultSubject = `VigilAMC: Overdue & Due Soon Items — ${client.name}`.slice(0, 60);
    const finalSubject = (subject && typeof subject === 'string' && subject.trim()) ? subject.trim().slice(0, 60) : defaultSubject;

    const emailResult = await sendOverdueDigestEmail({
      to: to.trim(),
      cc: (cc && typeof cc === 'string' && cc.trim()) ? cc.trim() : 'support@vigilamc.com',
      subject: finalSubject,
      message: (message && typeof message === 'string') ? message.trim() : null,
      clientName: client.name,
      summaryCounts,
      items: filteredItems,
      sender,
      organizationId: orgId,
      clientId: client.id,
      createdById: profile.id || null,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        {
          error: emailResult.message || 'Failed to dispatch email via Resend',
          errorCode: emailResult.errorCode,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: emailResult.messageId,
      isDevSimulation: Boolean(emailResult.isDevSimulation),
      sentAt: new Date().toISOString(),
      counts: summaryCounts,
      itemsCount: filteredItems.length,
      clientName: client.name,
    });
  } catch (error: any) {
    console.error('[API /api/clients/overdue-email POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
