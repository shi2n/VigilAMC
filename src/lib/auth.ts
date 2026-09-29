import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies, headers } from 'next/headers';
import { db } from '@/lib/db';
import { getOrCreateAgencySubscription } from '@/lib/plans';

export interface AuthContext {
  user: {
    id: string;
    email: string;
  };
  profile: any;
  organization: any;
  subscription: any;
}

export async function getCurrentUser(req?: Request): Promise<AuthContext | null> {
  try {
    let authUser: any = null;

    // 1. Check direct request headers if provided
    let authHeader = req?.headers?.get('authorization') || req?.headers?.get('Authorization');

    // 2. Check next/headers if not passed
    if (!authHeader) {
      try {
        const headerStore = headers();
        authHeader = headerStore.get('authorization') || headerStore.get('Authorization');
      } catch (e) {
        // Ignored in non-server action contexts
      }
    }

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          if (payload.sub && (!payload.exp || payload.exp * 1000 > Date.now())) {
            authUser = {
              id: payload.sub,
              email: payload.email || '',
              user_metadata: payload.user_metadata || {},
            };
          }
        }
      } catch (err) {
        // Fallback to Supabase client
      }

      if (!authUser) {
        try {
          const supabase = createServerSupabaseClient();
          const { data: { user } } = await supabase.auth.getUser(token);
          if (user) authUser = user;
        } catch (e) {}
      }
    }

    // 3. Fallback: check session from cookie
    if (!authUser) {
      try {
        const supabase = createServerSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          authUser = session.user;
        }
      } catch (e) {}
    }

    if (!authUser) {
      return null;
    }

    let profile = await (db as any).userProfile.findUnique({
      where: { id: authUser.id },
      include: {
        organization: true,
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

      if (!orgId && explicitRole === 'ORG_ADMIN') {
        const agencyName = (authUser.user_metadata?.agency_name as string) || 
          `${authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'My'} Fire Agency`;
        
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
          fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          role: explicitRole,
          status: 'ACTIVE',
          phone: authUser.user_metadata?.phone || '',
          employeeId: authUser.user_metadata?.employeeId || null,
          organizationId: orgId || null,
          lastLoginAt: new Date(),
        },
        include: {
          organization: true,
          assignedBuildings: {
            include: {
              building: true,
            },
          },
        },
      });
    } else {
      // Update lastLoginAt if older than 10 minutes
      const lastLogin = profile.lastLoginAt ? new Date(profile.lastLoginAt).getTime() : 0;
      if (Date.now() - lastLogin > 10 * 60 * 1000) {
        (db as any).userProfile.update({
          where: { id: profile.id },
          data: { lastLoginAt: new Date() },
        }).catch((e: any) => console.error('Failed to update lastLoginAt:', e));
      }
    }

    // Attach active subscription if organization exists
    let subscription = null;
    if (profile?.organizationId) {
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
