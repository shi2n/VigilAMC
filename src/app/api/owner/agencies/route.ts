import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireOwnerApi } from '@/lib/ownerAuth';
import { invalidateOwnerStatsCache } from '@/lib/ownerCache';

export const dynamic = 'force-dynamic';

const ALLOWED_PLANS = new Set([
  'TRIAL',
  'FOUNDING_MONTHLY',
  'FOUNDING_ANNUAL',
  'BIG_AGENCY',
  'CUSTOM',
]);

const ALLOWED_STATUSES = new Set(['TRIAL', 'ACTIVE', 'EXPIRED']);

export async function GET(request: Request) {
  const gate = await requireOwnerApi(request);
  if (!gate.ok) return gate.response;

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [orgs, users, inspections30d] = await Promise.all([
      (db as any).organization.findMany({
        include: {
          _count: {
            select: {
              buildings: true,
              equipments: true,
              workOrders: true,
              inspectionReports: true,
              reports: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      (db as any).userProfile.findMany({
        select: {
          id: true,
          role: true,
          status: true,
          organizationId: true,
        },
      }),
      (db as any).inspection.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: {
          id: true,
          organizationId: true,
        },
      }),
    ]);

    const usersByOrg = new Map<string, { users: number; technicians: number }>();
    for (const u of users) {
      if (!u.organizationId) continue;
      const entry = usersByOrg.get(u.organizationId) || { users: 0, technicians: 0 };
      entry.users++;
      if (u.role === 'TECHNICIAN') entry.technicians++;
      usersByOrg.set(u.organizationId, entry);
    }

    const insp30dByOrg = new Map<string, number>();
    for (const i of inspections30d) {
      if (!i.organizationId) continue;
      insp30dByOrg.set(i.organizationId, (insp30dByOrg.get(i.organizationId) || 0) + 1);
    }

    const agencies = orgs.map((o: any) => {
      const uCounts = usersByOrg.get(o.id) || { users: 0, technicians: 0 };
      const status = o.subscriptionStatus || 'ACTIVE';
      const price = typeof o.monthlyPrice === 'number' ? o.monthlyPrice : 3999;

      return {
        id: o.id,
        name: o.name,
        email: o.email || '',
        phone: o.phone || '',
        city: o.city || '',
        state: o.state || '',
        plan: o.plan || 'FOUNDING_MONTHLY',
        monthlyPrice: price,
        mrrInr: status === 'ACTIVE' ? price : 0,
        subscriptionStatus: status,
        subscriptionExpiresAt: o.subscriptionExpiresAt
          ? new Date(o.subscriptionExpiresAt).toISOString()
          : null,
        subscriptionNotes: o.subscriptionNotes || null,
        buildingsCount: o._count?.buildings || 0,
        assetsCount: o._count?.equipments || 0,
        usersCount: uCounts.users,
        techniciansCount: uCounts.technicians,
        inspections30dCount: insp30dByOrg.get(o.id) || 0,
        reportsCount: (o._count?.inspectionReports || 0) + (o._count?.reports || 0),
        workOrdersCount: o._count?.workOrders || 0,
        createdAt: new Date(o.createdAt).toISOString(),
      };
    });

    return NextResponse.json(
      { agencies },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in GET /api/owner/agencies:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load agencies' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}

export async function PATCH(request: Request) {
  const gate = await requireOwnerApi(request);
  if (!gate.ok) return gate.response;

  try {
    const body = await request.json().catch(() => ({}));
    const agencyId = String(body?.agencyId || body?.id || '').trim();
    if (!agencyId) {
      return NextResponse.json({ error: 'agencyId is required' }, { status: 400 });
    }

    const existing = await (db as any).organization.findUnique({
      where: { id: agencyId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    const nextPlan = String(body?.plan || existing.plan || 'FOUNDING_MONTHLY')
      .trim()
      .toUpperCase();
    if (!ALLOWED_PLANS.has(nextPlan)) {
      return NextResponse.json(
        { error: `Invalid plan. Must be one of: ${Array.from(ALLOWED_PLANS).join(', ')}` },
        { status: 400 }
      );
    }

    const nextStatus = String(
      body?.subscriptionStatus || body?.status || existing.subscriptionStatus || 'ACTIVE'
    )
      .trim()
      .toUpperCase();
    if (!ALLOWED_STATUSES.has(nextStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${Array.from(ALLOWED_STATUSES).join(', ')}` },
        { status: 400 }
      );
    }

    const parsedPrice =
      body?.monthlyPrice !== undefined && body?.monthlyPrice !== ''
        ? Math.max(0, Math.round(Number(body.monthlyPrice)))
        : existing.monthlyPrice ?? 3999;

    const rawExpiresAt = body?.subscriptionExpiresAt ?? body?.expiresAt;
    let parsedExpiresAt: Date | null = existing.subscriptionExpiresAt || null;
    if (rawExpiresAt === null || rawExpiresAt === '') {
      parsedExpiresAt = null;
    } else if (typeof rawExpiresAt === 'string') {
      const d = new Date(rawExpiresAt);
      if (!isNaN(d.getTime())) {
        parsedExpiresAt = d;
      }
    }

    const rawNotes = body?.subscriptionNotes ?? body?.notes;
    const cleanNotes =
      rawNotes === undefined
        ? existing.subscriptionNotes
        : typeof rawNotes === 'string' && rawNotes.trim().length > 0
        ? rawNotes.trim()
        : null;

    const updatedOrg = await (db as any).organization.update({
      where: { id: agencyId },
      data: {
        plan: nextPlan,
        monthlyPrice: parsedPrice,
        subscriptionStatus: nextStatus,
        subscriptionExpiresAt: parsedExpiresAt,
        subscriptionNotes: cleanNotes,
      },
    });

    // Also keep the legacy Subscription row in sync if one exists
    await (db as any).subscription
      .upsert({
        where: { organizationId: agencyId },
        update: {
          plan: nextPlan,
          status: nextStatus,
          amount: parsedPrice,
          expiresAt: parsedExpiresAt,
          renewalDate: parsedExpiresAt,
        },
        create: {
          organizationId: agencyId,
          plan: nextPlan,
          status: nextStatus,
          amount: parsedPrice,
          expiresAt: parsedExpiresAt,
          renewalDate: parsedExpiresAt,
        },
      })
      .catch(() => {});

    // Write activity feed log entry ("Owner changed X plan to Y")
    const activitySentence = `Owner changed ${existing.name} plan to ${nextPlan} (₹${parsedPrice.toLocaleString('en-IN')}/mo · ${nextStatus}${
      parsedExpiresAt ? ` · expires ${parsedExpiresAt.toISOString().slice(0, 10)}` : ''
    })`;

    const logRow = await (db as any).activityLog.create({
      data: {
        organizationId: agencyId,
        userId: gate.owner.userId,
        userEmail: gate.owner.email,
        action: 'OWNER_SUBSCRIPTION_UPDATE',
        entityType: 'SUBSCRIPTION',
        entityId: agencyId,
        details: activitySentence,
      },
    });

    invalidateOwnerStatsCache();

    return NextResponse.json(
      {
        success: true,
        agency: {
          id: updatedOrg.id,
          name: updatedOrg.name,
          plan: updatedOrg.plan,
          monthlyPrice: updatedOrg.monthlyPrice,
          subscriptionStatus: updatedOrg.subscriptionStatus,
          subscriptionExpiresAt: updatedOrg.subscriptionExpiresAt
            ? new Date(updatedOrg.subscriptionExpiresAt).toISOString()
            : null,
          subscriptionNotes: updatedOrg.subscriptionNotes || null,
        },
        activityEvent: {
          id: `sub-log-${logRow.id}`,
          category: 'SUBSCRIPTION',
          subtype: 'PLAN_CHANGED',
          timestamp: new Date(logRow.createdAt).toISOString(),
          sentence: activitySentence,
          agencyId: updatedOrg.id,
          agencyName: updatedOrg.name,
          statusBadge: {
            label: 'PLAN UPDATED',
            tone: 'OK',
          },
          linkUrl: `/owner/agencies/${updatedOrg.id}`,
          linkLabel: 'View Agency',
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in PATCH /api/owner/agencies:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update agency subscription' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
