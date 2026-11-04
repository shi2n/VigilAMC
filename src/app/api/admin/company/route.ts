import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor } from '@/lib/techSession';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ company: auth.organization, profile: auth.profile });
  } catch (error: any) {
    console.error('Error fetching company:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      licenseNumber,
      phone,
      email,
      address,
      city,
      state,
      gstin,
      fullName,
      autoSchedulingEnabled,
      brandLogoUrl,
      signatoryName,
      signatoryDesignation,
      signatorySignatureUrl,
      reportFooterText,
      clientPortalEnabled,
      publicVerificationEnabled,
    } = body;

    const cleanNullable = (val: any, fallback: any) => {
      if (val === undefined) return fallback;
      if (val === null) return null;
      const trimmed = String(val).trim();
      return trimmed ? trimmed : null;
    };

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
        ...(typeof autoSchedulingEnabled === 'boolean' ? { autoSchedulingEnabled } : {}),
        ...(typeof clientPortalEnabled === 'boolean' ? { clientPortalEnabled } : {}),
        ...(typeof publicVerificationEnabled === 'boolean' ? { publicVerificationEnabled } : {}),
        brandLogoUrl: cleanNullable(brandLogoUrl, auth.organization.brandLogoUrl),
        signatoryName: cleanNullable(signatoryName, auth.organization.signatoryName),
        signatoryDesignation: cleanNullable(signatoryDesignation, auth.organization.signatoryDesignation),
        signatorySignatureUrl: cleanNullable(signatorySignatureUrl, auth.organization.signatorySignatureUrl),
        reportFooterText: cleanNullable(reportFooterText, auth.organization.reportFooterText),
        ...(fullName !== undefined && fullName.trim() ? { contactPerson: fullName.trim() } : {}),
      },
    });

    let updatedProfile = auth.profile;
    if (fullName !== undefined && fullName.trim() && auth.user?.id) {
      updatedProfile = await (db as any).userProfile.update({
        where: { id: auth.user.id },
        data: { fullName: fullName.trim() },
      });
    }

    return NextResponse.json({ success: true, company, profile: updatedProfile });
  } catch (error: any) {
    console.error('Error updating company:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
