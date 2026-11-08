import type { Metadata } from 'next';
import { verifyOwnerSession } from '@/lib/ownerAuth';
import OwnerConsoleClient from '@/components/owner/OwnerConsoleClient';
import OwnerLoginGate from '@/components/owner/OwnerLoginGate';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'VigilAMC Owner Console',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OwnerPage() {
  const authState = await verifyOwnerSession();

  if (authState.status !== 'OWNER' || !authState.email) {
    return <OwnerLoginGate />;
  }

  return <OwnerConsoleClient ownerEmail={authState.email} />;
}
