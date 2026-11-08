import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
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

  if (authState.status === 'SIGNED_OUT') {
    redirect('/login');
  }

  if (authState.status !== 'OWNER' || !authState.email) {
    notFound();
  }

  return <OwnerConsoleClient ownerEmail={authState.email} />;
}
