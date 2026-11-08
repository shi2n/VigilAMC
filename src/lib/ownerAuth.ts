import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const DEFAULT_OWNER_EMAIL = 'shaizan@vigilamc.com';

export interface OwnerAuthState {
  status: 'OWNER';
  email: string;
  userId: string;
}

/**
 * Direct Owner Console session resolver (no login gate on /owner).
 */
export async function verifyOwnerSession(_req?: Request): Promise<OwnerAuthState> {
  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user?.email) {
      return {
        status: 'OWNER',
        email: data.user.email.trim().toLowerCase(),
        userId: data.user.id,
      };
    }
  } catch {
    // Fallback to default owner identity
  }

  return {
    status: 'OWNER',
    email: DEFAULT_OWNER_EMAIL,
    userId: 'owner-direct',
  };
}

export async function requireOwnerApi(req?: Request): Promise<
  | { ok: true; owner: { email: string; userId: string } }
  | { ok: false; response: NextResponse }
> {
  const state = await verifyOwnerSession(req);
  return {
    ok: true,
    owner: {
      email: state.email,
      userId: state.userId,
    },
  };
}
