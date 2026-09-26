import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await db.client.findUnique({
      where: { id: params.id },
      include: {
        buildings: {
          include: {
            equipments: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error: any) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, contactPerson, phone, email } = body;

    const existing = await db.client.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const updated = await db.client.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        contactPerson: contactPerson !== undefined ? contactPerson.trim() : existing.contactPerson,
        phone: phone !== undefined ? phone.trim() : existing.phone,
        email: email !== undefined ? (email ? email.trim() : null) : existing.email,
      },
    });

    return NextResponse.json({ success: true, client: updated });
  } catch (error: any) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await db.client.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Cascade delete is handled by Prisma schema relation
    await db.client.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: 'Client and associated buildings deleted' });
  } catch (error: any) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
