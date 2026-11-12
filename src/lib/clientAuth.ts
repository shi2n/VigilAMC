import { createClient } from './supabase/client';

/**
 * Returns a guaranteed-fresh Supabase access token (refreshing if expired or forced).
 */
export async function getFreshAccessToken(forceRefresh: boolean = false): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const supabase = createClient();
    if (forceRefresh) {
      const { data, error } = await supabase.auth.refreshSession();
      if (!error && data?.session?.access_token) {
        return data.session.access_token;
      }
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      // If token is expiring within 60 seconds, refresh it proactively
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      if (expiresAt && expiresAt - Date.now() < 60 * 1000) {
        const { data: refreshed, error } = await supabase.auth.refreshSession();
        if (!error && refreshed?.session?.access_token) {
          return refreshed.session.access_token;
        }
      }
      return session.access_token;
    }

    // Try refreshSession as fallback if getSession had no active token
    const { data: refreshed, error } = await supabase.auth.refreshSession();
    if (!error && refreshed?.session?.access_token) {
      return refreshed.session.access_token;
    }
  } catch (err) {
    console.warn('getFreshAccessToken failed:', err);
  }

  return null;
}

/**
 * Client fetch helper that:
 * 1. Attaches fresh Bearer token in Authorization header
 * 2. Sends cookies (credentials: 'same-origin' or 'include')
 * 3. On 401 response, automatically refreshes session once and retries the request
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const token = await getFreshAccessToken(false);

  const headers = new Headers(init?.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const reqInit: RequestInit = {
    ...init,
    headers,
    credentials: init?.credentials || 'include',
  };

  let res = await fetch(input, reqInit);

  // Refresh on 401 once and retry
  if (res.status === 401 && typeof window !== 'undefined') {
    const freshToken = await getFreshAccessToken(true);
    if (freshToken) {
      const retryHeaders = new Headers(init?.headers || {});
      retryHeaders.set('Authorization', `Bearer ${freshToken}`);
      res = await fetch(input, {
        ...init,
        headers: retryHeaders,
        credentials: init?.credentials || 'include',
      });
    }
  }

  return res;
}
