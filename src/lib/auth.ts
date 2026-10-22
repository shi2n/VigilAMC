import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies, headers } from 'next/headers';
import { db } from '@/lib/db';
import { getOrCreateAgencySubscription } from '@/lib/plans';
import { isFounderOwner } from '@/lib/founderAuth';

export interface AuthContext {
  user: {
    id: string;
    email: string;
  };
  profile: any;
  organization: any;
  subscription: any;
}

function tryDecodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      if (payload.sub && (!payload.exp || payload.exp * 1000 > Date.now())) {
        return {
          id: payload.sub as string,
          email: (payload.email as string) || '',
          user_metadata: payload.user_metadata || {},
        };
      }
    }
  } catch {}
  return null;
}

function tryReadUserFromSupabaseCookies(): any {
  try {
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    const authCookies = allCookies.filter((c) => c.name.includes('-auth-token'));
    if (authCookies.length === 0) return null;

    // Sort chunks if chunked (e.g., .0, .1)
    authCookies.sort((a, b) => a.name.localeCompare(b.name));
    let combined = authCookies.map((c) => c.value).join('');

    if (combined.startsWith('base64-')) {
      combined = Buffer.from(combined.slice(7), 'base64').toString('utf8');
    } else {
      try {
        combined = decodeURIComponent(combined);
      } catch {}
    }

    const parsed = JSON.parse(combined);
    const accessToken = Array.isArray(parsed) ? parsed[0] : parsed?.access_token;
    if (typeof accessToken === 'string') {
      const decoded = tryDecodeJwtPayload(accessToken);
      if (decoded) return decoded;
    }
    if (parsed?.user?.id) {
      return parsed.user;
    }
  } catch {}
  return null;
}

export async function getCurrentUser(
  req?: Request,
  options?: { skipSubscription?: boolean }
): Promise<AuthContext | null> {
  try {
    let authUser: any = null;

    // 1. Check direct request headers if provided
    let authHeader = req?.headers?.get('authorization') || req?.headers?.get('Authorization');

    // 2. Check next/headers if not passed
    if (!authHeader) {
      try {
        const headerStore = headers();
        authHeader = headerStore.get('authorization') || headerStore.get('Authorization');
      } catch {
        // Ignored in non-server action contexts
      }
    }

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      authUser = tryDecodeJwtPayload(token);

      if (!authUser) {
        try {
          const supabase = createServerSupabaseClient();
          const {
            data: { user },
          } = await supabase.auth.getUser(token);
          if (user) authUser = user;
        } catch {}
      }
    }

    // 3. Fast local cookie decode before network round-trip
    if (!authUser) {
      authUser = tryReadUserFromSupabaseCookies();
    }

    // 4. Fallback: check session from cookie via Supabase SSR client
    if (!authUser) {
      try {
        const supabase = createServerSupabaseClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          authUser = session.user;
        }
      } catch {}
    }

    if (!authUser) {
      return null;
    }

    let profile = await (db as any).userProfile.findUnique({
      where: { id: authUser.id },
      include: {
        organization: {
          include: {
            subscription: true,
          },
        },
        assignedBuildings: {
          include: {
            building: true,
          },
        },
      },
    });

    // If profile doesn't exist yet, check if this is a technician or agency admin
    if (!profile) {
      const explicitRole = authUser.user_metadata?.role === 'TECHNICIAN' ? 'TECHNICIAN' : 'ORG_ADMIN';
      const explicitOrgId = authUser.user_metadata?.organizationId;

      let orgId = explicitOrgId;

      const rawMetaName = (authUser.user_metadata?.full_name as string)?.trim();
      const safeFullName =
        rawMetaName && rawMetaName.toLowerCase() !== 'jordan michael'
          ? rawMetaName
          : authUser.email?.split('@')[0] || 'User';

      if (!orgId && explicitRole === 'ORG_ADMIN') {
        const agencyName =
          (authUser.user_metadata?.agency_name as string) || `${safeFullName} Fire Agency`;

        const org = await (db as any).organization.create({
          data: {
            name: agencyName,
            email: authUser.email || '',
            phone: (authUser.user_metadata?.phone as string) || '',
          },
        });
        orgId = org.id;
      }

      profile = await (db as any).userProfile.create({
        data: {
          id: authUser.id,
          email: authUser.email || '',
          fullName: safeFullName,
          role: explicitRole,
          status: 'ACTIVE',
          phone: authUser.user_metadata?.phone || '',
          employeeId: authUser.user_metadata?.employeeId || null,
          organizationId: orgId || null,
          lastLoginAt: new Date(),
        },
        include: {
          organization: {
            include: {
              subscription: true,
            },
          },
          assignedBuildings: {
            include: {
              building: true,
            },
          },
        },
      });
    } else {
      if (profile.fullName?.trim().toLowerCase() === 'jordan michael') {
        const replacementName =
          authUser.email?.toLowerCase().trim() === 'vigilamc@gmail.com'
            ? 'Shaizan'
            : authUser.email?.split('@')[0] || 'Agency Admin';
        profile.fullName = replacementName;
        (db as any).userProfile
          .update({
            where: { id: profile.id },
            data: { fullName: replacementName },
          })
          .catch((e: any) => console.error('Failed to sanitize fullName:', e));
      }

      // Update lastLoginAt asynchronously if older than 10 minutes
      const lastLogin = profile.lastLoginAt ? new Date(profile.lastLoginAt).getTime() : 0;
      if (Date.now() - lastLogin > 10 * 60 * 1000) {
        (db as any).userProfile
          .update({
            where: { id: profile.id },
            data: { lastLoginAt: new Date() },
          })
          .catch((e: any) => console.error('Failed to update lastLoginAt:', e));
      }
    }

    // Reuse already-included organization subscription to avoid a 2nd DB round-trip!
    let subscription = profile?.organization?.subscription || null;
    if (!subscription && profile?.organizationId && !options?.skipSubscription) {
      subscription = await getOrCreateAgencySubscription(profile.organizationId);
    }

    return {
      user: {
        id: authUser.id,
        email: authUser.email || '',
      },
      profile,
      organization: profile.organization || null,
      subscription,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
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
