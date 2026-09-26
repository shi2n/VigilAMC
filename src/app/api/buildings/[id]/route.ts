import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const building = await db.building.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        assets: {
          include: {
            inspections: {
              orderBy: { inspectedAt: 'desc' },
              take: 1,
            },
          },
          orderBy: [
            { locationFloor: 'asc' },
            { qrCode: 'asc' },
          ],
        },
        amcs: {
          orderBy: { startDate: 'desc' },
        },
        certificates: {
          orderBy: { issueDate: 'desc' },
        },
      },
    });

    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    return NextResponse.json({ building });
  } catch (error: any) {
    console.error('Error fetching building details:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
