import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const clients = await db.client.findMany({
      include: {
        buildings: {
          include: {
            equipments: {
              select: { id: true, status: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = clients.map((c: any) => {
      const totalEquipments = c.buildings.reduce((sum: number, b: any) => sum + b.equipments.length, 0);
      return {
        id: c.id,
        name: c.name,
        contactPerson: c.contactPerson,
        phone: c.phone,
        email: c.email,
        buildingCount: c.buildings.length,
        totalEquipments,
        buildings: c.buildings.map((b: any) => ({
          id: b.id,
          name: b.name,
          address: b.address,
          equipmentCount: b.equipments.length,
        })),
        createdAt: c.createdAt,
      };
    });

    return NextResponse.json({ clients: enriched });
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contactPerson, phone, email } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Client name and phone are required' }, { status: 400 });
    }

    let company = await db.company.findFirst();
    if (!company) {
      company = await db.company.create({
        data: {
          name: 'Fire Safety AMC Solutions',
          licenseNumber: 'MH/FIRE/LIC/2024/001',
        },
      });
    }

    const client = await db.client.create({
      data: {
        companyId: company.id,
        name: name.trim(),
        contactPerson: (contactPerson || 'Facility Manager').trim(),
        phone: phone.trim(),
        email: email ? email.trim() : null,
      },
    });

    return NextResponse.json({ success: true, client });
  } catch (error: any) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
