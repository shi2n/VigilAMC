import crypto from 'crypto';
import { db } from '@/lib/db';
import { getAuthenticatedActor, type AuthenticatedActor } from '@/lib/techSession';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const CHAT_MEDIA_BUCKET = 'chat-media';
export const MAX_MESSAGE_BODY_LEN = 2000;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB hard cap
export const SIGNED_READ_URL_TTL_SEC = 900; // 15 min short-lived read URL
export const RATE_LIMIT_MAX_PER_MIN = 30;
export const RATE_LIMIT_WINDOW_MS = 60_000;

export const ALLOWED_IMAGE_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const NO_STORE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value.trim());
}

/**
 * Canonical normalized dm_key helpers.
 * - Office <-> Technician: office__<technicianId>
 * - Technician <-> Technician DM: dm__<min(idA,idB)>__<max(idA,idB)>
 */
export function buildOfficeDmKey(technicianId: string): string {
  return `office__${technicianId.trim()}`;
}

export function buildTechDmKey(techIdA: string, techIdB: string): string {
  const [first, second] = [techIdA.trim(), techIdB.trim()].sort();
  return `dm__${first}__${second}`;
}

export type ParsedDmKey =
  | { kind: 'OFFICE'; technicianId: string }
  | { kind: 'DM'; techIds: [string, string] };

export function parseDmKey(dmKey: string | null | undefined): ParsedDmKey | null {
  if (!dmKey || typeof dmKey !== 'string') return null;
  const trimmed = dmKey.trim();
  if (trimmed.startsWith('office__')) {
    const techId = trimmed.slice('office__'.length).trim();
    if (!techId) return null;
    return { kind: 'OFFICE', technicianId: techId };
  }
  if (trimmed.startsWith('dm__')) {
    const rest = trimmed.slice('dm__'.length);
    const parts = rest.split('__').map((p) => p.trim()).filter(Boolean);
    if (parts.length !== 2 || parts[0] === parts[1]) return null;
    const [a, b] = parts.sort();
    return { kind: 'DM', techIds: [a, b] };
  }
  return null;
}

/**
 * Deterministic UUID from (baseUuid, technicianId) so broadcast retries with the
 * same clientMsgId are idempotent per technician thread.
 */
export function deriveBroadcastClientMsgId(baseUuid: string, technicianId: string): string {
  const hash = crypto
    .createHash('sha256')
    .update(`${baseUuid.toLowerCase()}:${technicianId}`)
    .digest();
  // Set RFC 4122 version (4) and variant (10xx) bits
  hash[6] = (hash[6] & 0x0f) | 0x40;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export interface MessagingActor {
  kind: 'AGENCY' | 'TECHNICIAN';
  userId: string;
  organizationId: string;
  displayName: string;
  role: string;
  raw: AuthenticatedActor;
}

/**
 * Reuses existing multi-path auth (Bearer JWT, chunked Supabase cookies, SSR cookies, vigil_tech_session).
 * ALL dashboard users (ORG_ADMIN, SUPER_ADMIN, STAFF, MANAGER, etc.) map to AGENCY.
 * TECHNICIAN maps to TECHNICIAN.
 * CLIENT or inactive/unscoped users are rejected.
 */
export async function resolveMessagingActor(
  req: Request
): Promise<{ actor: MessagingActor | null; forbiddenReason?: string }> {
  const auth = await getAuthenticatedActor(req);
  if (!auth || !auth.user || !auth.profile) {
    return { actor: null };
  }

  if (auth.profile.status === 'INACTIVE' || auth.profile.status === 'SUSPENDED') {
    return { actor: null, forbiddenReason: 'Account is inactive' };
  }

  const role = String(auth.profile.role || '').toUpperCase();
  if (role === 'CLIENT') {
    return { actor: null, forbiddenReason: 'Client accounts cannot access internal messaging' };
  }

  const organizationId = auth.profile.organizationId || auth.organization?.id || '';
  if (!organizationId) {
    return { actor: null, forbiddenReason: 'No organization associated with this account' };
  }

  const kind: 'AGENCY' | 'TECHNICIAN' = role === 'TECHNICIAN' ? 'TECHNICIAN' : 'AGENCY';
  const displayName =
    auth.profile.fullName?.trim() ||
    (kind === 'AGENCY' ? auth.organization?.name?.trim() : null) ||
    auth.user.email?.split('@')[0] ||
    (kind === 'AGENCY' ? 'Agency Office' : 'Technician');

  return {
    actor: {
      kind,
      userId: auth.user.id,
      organizationId,
      displayName,
      role,
      raw: auth,
    },
  };
}

/**
 * Verify a technicianId belongs to the agency's organization.
 */
export async function verifyTechnicianInOrg(
  technicianId: string,
  organizationId: string
): Promise<{ id: string; fullName: string | null; status: string } | null> {
  if (!technicianId || typeof technicianId !== 'string') return null;
  const tech = await (db as any).userProfile.findFirst({
    where: {
      id: technicianId,
      organizationId,
      role: 'TECHNICIAN',
    },
    select: {
      id: true,
      fullName: true,
      status: true,
    },
  });
  return tech || null;
}

// --- Sliding-window rate limiter (30/min per technician, 30/min per agency user) ---
const globalForRateLimit = globalThis as unknown as {
  __vigilMsgRateLimit?: Map<string, number[]>;
};
const rateLimitStore: Map<string, number[]> =
  globalForRateLimit.__vigilMsgRateLimit ?? new Map<string, number[]>();
globalForRateLimit.__vigilMsgRateLimit = rateLimitStore;

export async function checkMessageRateLimit(
  senderRole: 'AGENCY' | 'TECHNICIAN',
  senderId: string
): Promise<{ allowed: boolean; remaining: number; retryAfterSec: number }> {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const key = `${senderRole}:${senderId}`;

  const existing = (rateLimitStore.get(key) || []).filter((ts) => ts > windowStart);

  // For technicians (who cannot broadcast), also cross-check DB count so cold starts can't bypass limit
  let dbCount = 0;
  if (senderRole === 'TECHNICIAN' && existing.length < RATE_LIMIT_MAX_PER_MIN) {
    try {
      dbCount = await (db as any).message.count({
        where: {
          senderId,
          senderRole: 'TECHNICIAN',
          createdAt: { gte: new Date(windowStart) },
        },
      });
    } catch {
      dbCount = 0;
    }
  }

  const effectiveCount = Math.max(existing.length, dbCount);
  if (effectiveCount >= RATE_LIMIT_MAX_PER_MIN) {
    const oldest = existing[0] ?? windowStart + 1000;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000));
    rateLimitStore.set(key, existing);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  existing.push(now);
  rateLimitStore.set(key, existing);
  return {
    allowed: true,
    remaining: Math.max(0, RATE_LIMIT_MAX_PER_MIN - (effectiveCount + 1)),
    retryAfterSec: 0,
  };
}

/**
 * Validate storage path format: chat/<scope>/<uuid>.<ext>
 */
export function validateImageRefPath(
  imageRef: string,
  allowedScopes: string[]
): { valid: boolean; error?: string } {
  if (typeof imageRef !== 'string' || !imageRef.trim()) {
    return { valid: false, error: 'Invalid imageRef' };
  }
  const trimmed = imageRef.trim();
  if (trimmed.includes('..') || trimmed.startsWith('/')) {
    return { valid: false, error: 'Invalid imageRef path' };
  }
  const match = trimmed.match(/^chat\/([a-zA-Z0-9_-]+)\/([0-9a-f-]{36})\.(jpg|jpeg|png|webp)$/i);
  if (!match) {
    return {
      valid: false,
      error: 'imageRef must match chat/<technician_id>/<uuid>.(jpg|jpeg|png|webp)',
    };
  }
  const scope = match[1];
  if (!allowedScopes.includes(scope)) {
    return { valid: false, error: 'imageRef does not belong to this thread' };
  }
  return { valid: true };
}

/**
 * Verify that the uploaded object in private `chat-media` bucket exists,
 * is an allowed IMAGE mimetype, and is <= 2MB.
 */
export async function verifyUploadedChatImage(
  storagePath: string
): Promise<{ ok: boolean; error?: string; sizeBytes?: number; mimeType?: string }> {
  try {
    const supabase = getSupabaseAdmin();
    const lastSlash = storagePath.lastIndexOf('/');
    const folder = storagePath.slice(0, lastSlash);
    const filename = storagePath.slice(lastSlash + 1);

    const { data: files, error } = await supabase.storage
      .from(CHAT_MEDIA_BUCKET)
      .list(folder, { search: filename, limit: 10 });

    if (error) {
      return { ok: false, error: `Storage verification failed: ${error.message}` };
    }

    const file = (files || []).find((f: any) => f.name === filename);
    if (!file) {
      return { ok: false, error: 'Uploaded image not found in storage. Upload file first.' };
    }

    const meta = (file.metadata || {}) as { size?: number; mimetype?: string };
    const sizeBytes = typeof meta.size === 'number' ? meta.size : 0;
    const mimeType = String(meta.mimetype || '').toLowerCase();

    if (sizeBytes > MAX_IMAGE_BYTES) {
      await supabase.storage.from(CHAT_MEDIA_BUCKET).remove([storagePath]).catch(() => null);
      return {
        ok: false,
        error: `Image exceeds 2MB limit (${(sizeBytes / (1024 * 1024)).toFixed(2)} MB)`,
      };
    }

    if (mimeType && !ALLOWED_IMAGE_MIME_TO_EXT[mimeType]) {
      await supabase.storage.from(CHAT_MEDIA_BUCKET).remove([storagePath]).catch(() => null);
      return {
        ok: false,
        error: `Unsupported image type "${mimeType}". Only JPEG, PNG, and WebP images are allowed.`,
      };
    }

    return { ok: true, sizeBytes, mimeType: mimeType || 'image/jpeg' };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Storage verification failed' };
  }
}

export interface SerializedMessage {
  id: string;
  clientMsgId: string;
  organizationId: string;
  technicianId: string;
  senderRole: 'AGENCY' | 'TECHNICIAN';
  senderId: string;
  recipientRole: 'AGENCY' | 'TECHNICIAN';
  recipientId: string | null;
  dmKey: string;
  body: string | null;
  attachmentUrl: string | null;
  attachmentSignedUrl: string | null;
  attachmentKind: 'IMAGE' | null;
  readAt: string | null;
  createdAt: string;
}

/**
 * Batch-mint short-lived signed READ URLs for messages that have an attachment_url.
 */
export async function serializeMessagesWithSignedUrls(
  rows: any[]
): Promise<SerializedMessage[]> {
  const paths = Array.from(
    new Set(
      rows
        .map((r) => r.attachmentUrl)
        .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
    )
  );

  const signedMap = new Map<string, string>();
  if (paths.length > 0) {
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.storage
        .from(CHAT_MEDIA_BUCKET)
        .createSignedUrls(paths, SIGNED_READ_URL_TTL_SEC);
      if (!error && Array.isArray(data)) {
        for (const item of data) {
          if (item.path && item.signedUrl) {
            signedMap.set(item.path, item.signedUrl);
          }
        }
      }
    } catch (err) {
      console.warn('[messaging] Failed to mint signed read URLs:', err);
    }
  }

  return rows.map((r) => {
    const resolvedRecipientRole: 'AGENCY' | 'TECHNICIAN' =
      r.recipientRole === 'TECHNICIAN' || r.recipientRole === 'AGENCY'
        ? r.recipientRole
        : r.senderRole === 'AGENCY'
          ? 'TECHNICIAN'
          : 'AGENCY';
    const resolvedDmKey =
      typeof r.dmKey === 'string' && r.dmKey.trim()
        ? r.dmKey.trim()
        : buildOfficeDmKey(r.technicianId);

    return {
      id: r.id,
      clientMsgId: r.clientMsgId,
      organizationId: r.organizationId,
      technicianId: r.technicianId,
      senderRole: r.senderRole,
      senderId: r.senderId,
      recipientRole: resolvedRecipientRole,
      recipientId: r.recipientId ?? (resolvedRecipientRole === 'TECHNICIAN' ? r.technicianId : null),
      dmKey: resolvedDmKey,
      body: r.body ?? null,
      attachmentUrl: r.attachmentUrl ?? null,
      attachmentSignedUrl: r.attachmentUrl ? signedMap.get(r.attachmentUrl) ?? null : null,
      attachmentKind: (r.attachmentKind as 'IMAGE' | null) ?? null,
      readAt: r.readAt ? new Date(r.readAt).toISOString() : null,
      createdAt: new Date(r.createdAt).toISOString(),
    };
  });
}

/**
 * Push a live Supabase Realtime Broadcast event via HTTP API (serverless-safe, ~50ms).
 * Delivers instant INSERT / READ events to both Supabase-Auth dashboard users AND
 * vigil_tech_session technicians without relaxing PostgreSQL RLS on public.messages.
 *
 * PRIVACY: For tech<->tech DMs, pass includeAgency: false and recipientTechnicianIds: [senderId, recipientId]
 * so the agency channel NEVER receives private tech<->tech messages.
 */
export async function emitRealtimeMessageBroadcast(params: {
  event: 'message_insert' | 'message_read';
  organizationId: string;
  technicianId: string;
  recipientTechnicianIds?: string[];
  includeAgency?: boolean;
  payload: Record<string, any>;
}): Promise<void> {
  try {
    const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
    const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!supabaseUrl || !secretKey) return;

    const techTopics = Array.from(
      new Set(
        (params.recipientTechnicianIds && params.recipientTechnicianIds.length > 0
          ? params.recipientTechnicianIds
          : [params.technicianId]
        ).filter(Boolean)
      )
    );

    const messages: Array<{ topic: string; event: string; payload: Record<string, any> }> = techTopics.map(
      (tid) => ({
        topic: `messages:tech:${tid}`,
        event: params.event,
        payload: params.payload,
      })
    );

    if (params.includeAgency !== false) {
      messages.push({
        topic: `messages:agency:${params.organizationId}`,
        event: params.event,
        payload: params.payload,
      });
    }

    await fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
      method: 'POST',
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    }).catch(() => null);
  } catch {
    // Non-fatal: postgres_changes + 15s polling fallback remain active
  }
}
