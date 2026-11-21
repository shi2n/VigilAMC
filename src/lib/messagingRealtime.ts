import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeMessageRow {
  id: string;
  client_msg_id: string;
  organization_id: string;
  technician_id: string;
  sender_role: 'AGENCY' | 'TECHNICIAN';
  sender_id: string;
  recipient_role?: 'AGENCY' | 'TECHNICIAN';
  recipient_id?: string | null;
  dm_key?: string | null;
  sender_name?: string | null;
  body: string | null;
  attachment_url: string | null;
  attachment_kind: 'IMAGE' | null;
  read_at: string | null;
  created_at: string;
}

export type RealtimeChannelStatus =
  | 'SUBSCRIBED'
  | 'TIMED_OUT'
  | 'CLOSED'
  | 'CHANNEL_ERROR';

export interface MessagingSubscriptionHandle {
  channel: RealtimeChannel;
  unsubscribe: () => Promise<void>;
  isPollingFallbackActive: () => boolean;
}

export const REALTIME_POLL_FALLBACK_MS = 15_000;

interface BaseSubscribeOptions {
  supabase: SupabaseClient;
  onInsert?: (row: RealtimeMessageRow) => void;
  onUpdate?: (row: RealtimeMessageRow, oldRow?: Partial<RealtimeMessageRow>) => void;
  onPollFallback?: () => void | Promise<void>;
  onStatusChange?: (status: RealtimeChannelStatus, pollingActive: boolean) => void;
  pollIntervalMs?: number;
}

function attachManagedChannel(params: {
  supabase: SupabaseClient;
  channelName: string;
  filter: string;
  onInsert?: (row: RealtimeMessageRow) => void;
  onUpdate?: (row: RealtimeMessageRow, oldRow?: Partial<RealtimeMessageRow>) => void;
  onPollFallback: () => void | Promise<void>;
  onStatusChange?: (status: RealtimeChannelStatus, pollingActive: boolean) => void;
  pollIntervalMs: number;
}): MessagingSubscriptionHandle {
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let disposed = false;

  const startPolling = () => {
    if (disposed || pollTimer) return;
    // Trigger an immediate catch-up poll when degraded, then every pollIntervalMs (15s)
    Promise.resolve(params.onPollFallback()).catch(() => null);
    pollTimer = setInterval(() => {
      if (!disposed) {
        Promise.resolve(params.onPollFallback()).catch(() => null);
      }
    }, params.pollIntervalMs);
  };

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };

  const channel = params.supabase
    .channel(params.channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: params.filter,
      },
      (payload: any) => {
        if (payload?.new && params.onInsert) {
          params.onInsert(payload.new as RealtimeMessageRow);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: params.filter,
      },
      (payload: any) => {
        if (payload?.new && params.onUpdate) {
          params.onUpdate(
            payload.new as RealtimeMessageRow,
            payload.old as Partial<RealtimeMessageRow> | undefined
          );
        }
      }
    )
    .on('broadcast', { event: 'message_insert' }, (msg: any) => {
      const row = msg?.payload as RealtimeMessageRow | undefined;
      if (row && params.onInsert) {
        params.onInsert(row);
      }
    })
    .on('broadcast', { event: 'message_read' }, (msg: any) => {
      const info = msg?.payload as
        | { technician_id?: string; organization_id?: string; read_at?: string; sender_role?: 'AGENCY' | 'TECHNICIAN'; ids?: string[] }
        | undefined;
      if (!info || !params.onUpdate) return;
      const ids = Array.isArray(info.ids) ? info.ids : [];
      for (const id of ids) {
        params.onUpdate({
          id,
          client_msg_id: '',
          organization_id: info.organization_id || '',
          technician_id: info.technician_id || '',
          sender_role: info.sender_role || 'AGENCY',
          sender_id: '',
          body: null,
          attachment_url: null,
          attachment_kind: null,
          read_at: info.read_at || new Date().toISOString(),
          created_at: info.read_at || new Date().toISOString(),
        });
      }
    })
    .subscribe((status) => {
      if (disposed) return;
      const typedStatus = status as RealtimeChannelStatus;
      if (typedStatus === 'SUBSCRIBED') {
        stopPolling();
      } else if (
        typedStatus === 'CHANNEL_ERROR' ||
        typedStatus === 'TIMED_OUT' ||
        typedStatus === 'CLOSED'
      ) {
        startPolling();
      }
      params.onStatusChange?.(typedStatus, pollTimer !== null);
    });

  return {
    channel,
    isPollingFallbackActive: () => pollTimer !== null,
    unsubscribe: async () => {
      disposed = true;
      stopPolling();
      await params.supabase.removeChannel(channel);
    },
  };
}

/**
 * Per-technician thread channel (postgres_changes on messages WHERE technician_id=...).
 * Automatically falls back to polling GET /api/messages?technicianId=... every 15s if socket drops.
 */
export function subscribeToTechnicianThread(
  options: BaseSubscribeOptions & { technicianId: string }
): MessagingSubscriptionHandle {
  const pollIntervalMs = options.pollIntervalMs ?? REALTIME_POLL_FALLBACK_MS;
  const fallback =
    options.onPollFallback ??
    (async () => {
      await fetch(`/api/messages?technicianId=${encodeURIComponent(options.technicianId)}`, {
        cache: 'no-store',
      });
    });

  return attachManagedChannel({
    supabase: options.supabase,
    channelName: `messages:tech:${options.technicianId}`,
    filter: `technician_id=eq.${options.technicianId}`,
    onInsert: options.onInsert,
    onUpdate: options.onUpdate,
    onPollFallback: fallback,
    onStatusChange: options.onStatusChange,
    pollIntervalMs,
  });
}

/**
 * Agency-wide channel (postgres_changes on all messages in organization).
 * Automatically falls back to polling GET /api/messages/unread every 15s if socket drops.
 */
export function subscribeToAgencyMessages(
  options: BaseSubscribeOptions & { organizationId: string }
): MessagingSubscriptionHandle {
  const pollIntervalMs = options.pollIntervalMs ?? REALTIME_POLL_FALLBACK_MS;
  const fallback =
    options.onPollFallback ??
    (async () => {
      await fetch('/api/messages/unread', { cache: 'no-store' });
    });

  return attachManagedChannel({
    supabase: options.supabase,
    channelName: `messages:agency:${options.organizationId}`,
    filter: `organization_id=eq.${options.organizationId}`,
    onInsert: options.onInsert,
    onUpdate: options.onUpdate,
    onPollFallback: fallback,
    onStatusChange: options.onStatusChange,
    pollIntervalMs,
  });
}
