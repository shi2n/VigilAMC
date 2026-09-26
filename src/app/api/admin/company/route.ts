import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({ company: null });
    }

    return NextResponse.json({ company: auth.organization });
  } catch (error: any) {
    console.error('Error fetching company:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, licenseNumber, phone, email, address, city, state, gstin } = body;

    const company = await (db as any).organization.update({
      where: { id: auth.organization.id },
      data: {
        name: name !== undefined ? name.trim() : auth.organization.name,
        licenseNumber: licenseNumber !== undefined ? licenseNumber.trim() : auth.organization.licenseNumber,
        phone: phone !== undefined ? phone.trim() : auth.organization.phone,
        email: email !== undefined ? email.trim() : auth.organization.email,
        address: address !== undefined ? address.trim() : auth.organization.address,
        city: city !== undefined ? city.trim() : auth.organization.city,
        state: state !== undefined ? state.trim() : auth.organization.state,
        gstin: gstin !== undefined ? gstin.trim() : auth.organization.gstin,
      },
    });

    return NextResponse.json({ success: true, company });
  } catch (error: any) {
    console.error('Error updating company:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
