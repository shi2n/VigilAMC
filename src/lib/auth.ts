import { createServerSupabaseClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { getOrCreateAgencySubscription } from '@/lib/plans';
import { isFounderOwner } from '@/lib/founderAuth';
import { extractCookie, TECH_SESSION_COOKIE, verifyTechSessionToken, getAuthenticatedActor } from '@/lib/techSession';

export { getAuthenticatedActor };

export interface AuthContext {
  user: {
    id: string;
    email: string;
  };
  profile: any;
  organization: any;
  subscription: any;
}

export async function getCurrentUser(
  req?: Request,
  options?: { skipSubscription?: boolean }
): Promise<AuthContext | null> {
  const actor = await getAuthenticatedActor(req);
  if (actor) return actor as AuthContext;
  return null;
}



export function isPlatformOwner(auth: AuthContext | null): boolean {
  if (!auth || !auth.user) return false;
  return isFounderOwner(auth.user.email);
}

export async function requirePlatformOwner(req?: Request): Promise<AuthContext> {
  const auth = await getCurrentUser(req);
  if (!auth || !auth.user) {
    throw new Error('FORBIDDEN: Founder authentication required');
  }
  if (!isFounderOwner(auth.user.email)) {
    throw new Error('FORBIDDEN: Founder privileges required');
  }
  return auth;
}

/**
 * Ensures request is made by an authenticated Agency Admin
 */
export async function requireAdmin(req?: Request): Promise<AuthContext> {
  const auth = await getCurrentUser(req);
  if (!auth || !auth.user) {
    throw new Error('UNAUTHORIZED: Authentication required');
  }

  if (auth.profile?.status === 'INACTIVE') {
    throw new Error('FORBIDDEN: Your account has been deactivated. Please contact your agency administrator.');
  }

  const role = auth.profile?.role;
  if (role !== 'ORG_ADMIN' && role !== 'SUPER_ADMIN') {
    throw new Error('FORBIDDEN: Agency Administrator privileges required');
  }

  if (!auth.organization) {
    throw new Error('FORBIDDEN: No organization associated with this account');
  }

  return auth;
}

/**
 * Ensures request is made by an authenticated Technician or Admin
 */
export async function requireAuth(req?: Request): Promise<AuthContext> {
  const auth = await getCurrentUser(req);
  if (!auth || !auth.user) {
    throw new Error('UNAUTHORIZED: Authentication required');
  }

  if (auth.profile?.status === 'INACTIVE') {
    throw new Error('FORBIDDEN: Your account has been deactivated. Please contact your agency administrator.');
  }

  return auth;
}

/**
 * Helper to log structured audit activities for compliance and activity tracking
 */
export async function logAuditActivity(data: {
  organizationId: string;
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
}) {
  try {
    await (db as any).activityLog.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId || null,
        userEmail: data.userEmail || null,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId || null,
        details: data.details || null,
      },
    });
  } catch (err) {
    console.error('Failed to log audit activity:', err);
  }
}

export async function ensureDefaultOrganizationForUser(userId: string, orgDetails?: {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  gstin?: string;
  licenseNumber?: string;
}) {
  let profile = await (db as any).userProfile.findUnique({
    where: { id: userId },
    include: { organization: true },
  });

  if (profile?.organization) {
    return profile.organization;
  }

  // Create new organization
  const org = await (db as any).organization.create({
    data: {
      name: orgDetails?.name || 'My Fire Safety AMC Agency',
      phone: orgDetails?.phone || '',
      email: orgDetails?.email || profile?.email || '',
      address: orgDetails?.address || '',
      city: orgDetails?.city || '',
      state: orgDetails?.state || '',
      gstin: orgDetails?.gstin || '',
      licenseNumber: orgDetails?.licenseNumber || '',
    },
  });

  // Link to user profile
  profile = await (db as any).userProfile.update({
    where: { id: userId },
    data: { organizationId: org.id },
    include: { organization: true },
  });

  return org;
}
