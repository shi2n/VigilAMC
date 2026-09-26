import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    let company = await db.company.findFirst();
    if (!company) {
      company = await db.company.create({
        data: {
          name: 'Fire Safety AMC Solutions',
          licenseNumber: 'MH/FIRE/LIC/2024/001',
          phone: '+91 98000 00000',
          email: 'service@fireamc.in',
          address: 'Office No. 101, Commercial Complex, Mumbai, Maharashtra',
        },
      });
    }
    return NextResponse.json({ company });
  } catch (error: any) {
    console.error('Error fetching company:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { name, licenseNumber, phone, email, address } = body;

    let company = await db.company.findFirst();
    if (!company) {
      company = await db.company.create({
        data: {
          name: name || 'Fire Safety AMC Solutions',
          licenseNumber: licenseNumber || 'MH/FIRE/LIC/2024/001',
          phone: phone || '+91 98000 00000',
          email: email || 'service@fireamc.in',
          address: address || 'Office No. 101, Commercial Complex, Mumbai, Maharashtra',
        },
      });
    } else {
      company = await db.company.update({
        where: { id: company.id },
        data: {
          name: name ?? company.name,
          licenseNumber: licenseNumber ?? company.licenseNumber,
          phone: phone ?? company.phone,
          email: email ?? company.email,
          address: address ?? company.address,
        },
      });
    }

    return NextResponse.json({ success: true, company });
  } catch (error: any) {
    console.error('Error updating company:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
