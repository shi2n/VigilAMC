import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { isFounderOwner } from '@/lib/founderAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth?.user?.email || !isFounderOwner(auth.user.email)) {
      return NextResponse.json({ error: 'Forbidden: Founder privileges required' }, { status: 403 });
    }

    if (!auth.organization) {
      return NextResponse.json({
        company: null,
        counts: {
          clients: 0,
          buildings: 0,
          equipments: 0,
          serviceLogs: 0,
        },
      });
    }

    const organizationId = auth.organization.id;
    const clientCount = await (db as any).client.count({ where: { organizationId } });
    const buildingCount = await (db as any).building.count({ where: { organizationId } });
    const equipmentCount = await (db as any).equipment.count({ where: { organizationId } });

    return NextResponse.json({
      company: auth.organization,
      counts: {
        clients: clientCount,
        buildings: buildingCount,
        equipments: equipmentCount,
        serviceLogs: 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching data stats:', error);
    return NextResponse.json({ error: error.message || 'Forbidden' }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth?.user?.email || !isFounderOwner(auth.user.email)) {
      return NextResponse.json({ error: 'Forbidden: Founder privileges required' }, { status: 403 });
    }

    if (!auth.organization) {
      return NextResponse.json({ error: 'No organization linked to founder account' }, { status: 400 });
    }

    const body = await request.json();
    const { action, confirmation } = body;
    const organizationId = auth.organization.id;

    // Reset current user's organization data only
    if (action === 'WIPE_ALL_DEMO') {
      if (confirmation !== 'DELETE') {
        return NextResponse.json({ error: 'Confirmation requires typing DELETE' }, { status: 400 });
      }

      await (db as any).inspection.deleteMany({ where: { organizationId } });
      await (db as any).defect.deleteMany({ where: { organizationId } });
      await (db as any).workOrder.deleteMany({ where: { organizationId } });
      await (db as any).complianceReport.deleteMany({ where: { organizationId } });
      await (db as any).equipment.deleteMany({ where: { organizationId } });
      await (db as any).building.deleteMany({ where: { organizationId } });
      await (db as any).client.deleteMany({ where: { organizationId } });

      return NextResponse.json({
        success: true,
        message: 'Organization demo records have been wiped cleanly.',
      });
    }

    if (action === 'SEED_CLEAN') {
      const now = new Date();
      const addDays = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
      const subDays = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

      const client1 = await (db as any).client.create({
        data: {
          organizationId,
          name: 'Cyber Park Facility Management',
          contactPerson: 'Suresh Iyer',
          phone: '+91 98210 55443',
          email: 'facilities@cyberpark.in',
        },
      });

      const building1 = await (db as any).building.create({
        data: {
          organizationId,
          clientId: client1.id,
          name: 'Horizon Tech IT Tower',
          address: 'Plot 14, Sector 24, Gurugram, Delhi NCR',
          state: 'Haryana',
          reportingCycle: 'Half-Yearly',
          complianceCycle: 'Half-Yearly',
          cycleIntervalMos: 6,
          nextFilingDueDate: addDays(24),
        },
      });

      await (db as any).equipment.createMany({
        data: [
          {
            buildingId: building1.id,
            organizationId,
            qrCode: `HTP-EXT-01-${Date.now().toString().slice(-4)}`,
            type: 'Fire Extinguisher',
            capacity: 'ABC Dry Powder 6kg',
            location: 'Ground Floor - Main Reception',
            lastServiceDate: subDays(350),
            nextDueDate: addDays(15),
            status: 'DUE_SOON',
          },
          {
            buildingId: building1.id,
            organizationId,
            qrCode: `HTP-HYD-01-${Date.now().toString().slice(-4)}`,
            type: 'Hydrant Valve',
            capacity: 'Single Head 63mm Gunmetal',
            location: 'Floor 1 - Landing Staircase A',
            lastServiceDate: subDays(80),
            nextDueDate: addDays(100),
            status: 'COMPLIANT',
          },
        ],
      });

      return NextResponse.json({
        success: true,
        message: 'Clean starter template seeded successfully.',
      });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error managing data:', error);
    return NextResponse.json({ error: error.message || 'Forbidden' }, { status: 403 });
  }
}

export async function PUT(request: Request) {
  return POST(request);
}

export async function PATCH(request: Request) {
  return POST(request);
}

export async function DELETE(request: Request) {
  const auth = await getCurrentUser(request);
  if (!auth?.user?.email || !isFounderOwner(auth.user.email)) {
    return NextResponse.json({ error: 'Forbidden: Founder privileges required' }, { status: 403 });
  }
  return NextResponse.json({ error: 'Use POST with action WIPE_ALL_DEMO' }, { status: 400 });
}
