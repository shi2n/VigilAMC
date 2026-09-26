import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const building = await (db as any).building.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        equipments: {
          include: {
            serviceLogs: {
              orderBy: { servicedAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { location: 'asc' },
        },
        reports: {
          orderBy: { generatedAt: 'desc' },
        },
      },
    });

    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    const mapped = {
      ...building,
      city: 'New Delhi',
      occupancyType: 'Commercial Complex',
      fireNocNumber: 'NOC-2026-DEL-892',
      nocExpiryDate: building.nextFilingDueDate,
      totalAssets: building.equipments?.length || 0,
      assets: building.equipments || [],
    };

    return NextResponse.json({ building: mapped });
  } catch (error: any) {
    console.error('Error fetching building details:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
