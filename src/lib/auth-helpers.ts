import { SITE_CONFIG } from './siteConfig';

/**
 * Resolves the appropriate redirect URL for Supabase Auth flows
 * (specifically password recovery and email confirmation).
 * 
 * Rules:
 * 1. When executed in the browser on localhost / 127.0.0.1, always redirects
 *    to the local development server: e.g. http://localhost:3000/reset-password
 * 2. When executed on production (or any non-localhost host):
 *    - Prioritizes NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_APP_URL if configured.
 *    - Falls back to the current browser origin.
 *    - In SSR/build environments, falls back to SITE_CONFIG.SITE_URL.
 */
export function getResetPasswordRedirectUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocal =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.local');

    if (isLocal) {
      return `${window.location.origin}/reset-password`;
    }

    if (envUrl) {
      return `${envUrl.replace(/\/$/, '')}/reset-password`;
    }

    return `${window.location.origin}/reset-password`;
  }

  if (envUrl) {
    return `${envUrl.replace(/\/$/, '')}/reset-password`;
  }

  return `${SITE_CONFIG.SITE_URL}/reset-password`;
}
