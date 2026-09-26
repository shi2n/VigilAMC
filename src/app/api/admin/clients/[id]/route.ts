import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await (db as any).client.findFirst({
      where: {
        id: params.id,
        organizationId: auth.organization.id,
      },
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
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, contactPerson, phone, email } = body;

    const existing = await (db as any).client.findFirst({
      where: {
        id: params.id,
        organizationId: auth.organization.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Client not found or access denied' }, { status: 404 });
    }

    const updated = await (db as any).client.update({
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
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await (db as any).client.findFirst({
      where: {
        id: params.id,
        organizationId: auth.organization.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Client not found or access denied' }, { status: 404 });
    }

    await (db as any).client.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: 'Client and associated buildings deleted' });
  } catch (error: any) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
