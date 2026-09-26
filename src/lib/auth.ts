import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies, headers } from 'next/headers';
import { db } from '@/lib/db';

export interface AuthContext {
  user: {
    id: string;
    email: string;
  };
  profile: any;
  organization: any;
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
        // Ignored
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
      },
    });

    // If profile doesn't exist yet, create one along with default organization
    if (!profile) {
      const agencyName = (authUser.user_metadata?.agency_name as string) || 
        `${authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'My'} Fire Agency`;
      
      const org = await (db as any).organization.create({
        data: {
          name: agencyName,
          email: authUser.email || '',
          phone: (authUser.user_metadata?.phone as string) || '',
        },
      });

      profile = await (db as any).userProfile.create({
        data: {
          id: authUser.id,
          email: authUser.email || '',
          fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          role: 'ORG_ADMIN',
          organizationId: org.id,
        },
        include: {
          organization: true,
        },
      });
    } else if (!profile.organizationId) {
      const org = await (db as any).organization.create({
        data: {
          name: `${profile.fullName || 'My'} Fire Agency`,
          email: profile.email || '',
        },
      });

      profile = await (db as any).userProfile.update({
        where: { id: profile.id },
        data: { organizationId: org.id },
        include: { organization: true },
      });
    }

    return {
      user: {
        id: authUser.id,
        email: authUser.email || '',
      },
      profile,
      organization: profile.organization || null,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
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
