import type { Metadata } from 'next';
import { verifyOwnerSession } from '@/lib/ownerAuth';
import OwnerConsoleClient from '@/components/owner/OwnerConsoleClient';

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
  return <OwnerConsoleClient ownerEmail={authState.email} />;
}
