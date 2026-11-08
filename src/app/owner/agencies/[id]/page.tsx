import type { Metadata } from 'next';
import { verifyOwnerSession } from '@/lib/ownerAuth';
import OwnerAgencyDrilldownClient from '@/components/owner/OwnerAgencyDrilldownClient';
import OwnerLoginGate from '@/components/owner/OwnerLoginGate';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Agency Drill-Down — VigilAMC Owner Console',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OwnerAgencyDrilldownPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authState = await verifyOwnerSession();

  if (authState.status !== 'OWNER' || !authState.email) {
    return <OwnerLoginGate />;
  }

  const { id } = await params;

  return <OwnerAgencyDrilldownClient agencyId={id} ownerEmail={authState.email} />;
}
