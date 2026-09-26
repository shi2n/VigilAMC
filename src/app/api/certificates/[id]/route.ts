import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const certificate = await db.complianceCertificate.findUnique({
      where: { id: params.id },
      include: {
        building: {
          include: {
            company: true,
            assets: {
              orderBy: [
                { locationFloor: 'asc' },
                { qrCode: 'asc' },
              ],
            },
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    return NextResponse.json({ certificate });
  } catch (error: any) {
    console.error('Error fetching certificate details:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
