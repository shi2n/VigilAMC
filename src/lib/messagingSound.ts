'use client';

/**
 * Runtime Web Audio API notification ding + per-user mute toggle + polite desktop browser notifications.
 * ZERO bundled audio files, ZERO third-party audio, ZERO copyright risk.
 *
 * Ding spec (owner-approved):
 * - Two-note sine wave: 880 Hz (A5) -> 1320 Hz (E6)
 * - ~120 ms per note, gentle attack/release envelope
 * - Peak volume <= 0.4 (0.32)
 */

import { registerMessageReceivedListener, type IncomingMessageHookEvent } from '@/lib/messagingHooks';

export type MessagingSurface = 'DASHBOARD' | 'TECHNICIAN';

export const DING_SPEC = {
  frequenciesHz: [880, 1320] as const,
  noteDurationMs: 120,
  peakVolume: 0.32, // strictly <= 0.4
  waveform: 'sine' as const,
};

const SOUND_KEY_DASHBOARD = 'vigilamc_msg_sound_dashboard';
const SOUND_KEY_TECHNICIAN = 'vigilamc_msg_sound_technician';
const DASH_NOTIF_ASKED_KEY = 'vigilamc_dash_notif_permission_asked';

let sharedAudioCtx: AudioContext | null = null;
let audioUnlocked = false;
let unlockListenersAttached = false;
let hookRegistered = false;

function getStorageKey(surface: MessagingSurface): string {
  return surface === 'DASHBOARD' ? SOUND_KEY_DASHBOARD : SOUND_KEY_TECHNICIAN;
}

export function isMessageSoundEnabled(surface: MessagingSurface): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(getStorageKey(surface));
    if (raw === 'false' || raw === '0') return false;
    return true; // Default ON
  } catch {
    return true;
  }
}

export function setMessageSoundEnabled(surface: MessagingSurface, enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(surface), enabled ? 'true' : 'false');
    window.dispatchEvent(
      new CustomEvent('vigil:message-sound-pref-changed', {
        detail: { surface, enabled },
      })
    );
  } catch {
    // Ignore storage quota / private mode failures
  }
}

function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  return sharedAudioCtx;
}

/**
 * Unlock Web Audio on first user interaction (satisfies Chrome/Safari/WebView autoplay policies).
 */
export function initMessagingAudioUnlock(): void {
  if (typeof window === 'undefined' || unlockListenersAttached) return;
  unlockListenersAttached = true;

  const unlock = () => {
    try {
      const ctx = getOrCreateAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => null);
      }
      audioUnlocked = true;
    } catch {
      // Non-fatal
    }
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('keydown', unlock);
  };

  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('touchstart', unlock, { passive: true });
  window.addEventListener('keydown', unlock, { passive: true });
}

export interface DingPlayResult {
  played: boolean;
  reason?: string;
  frequenciesHz?: readonly [number, number];
  noteDurationMs?: number;
  peakVolume?: number;
}

/**
 * Synthesize the two-note sine ding (880Hz -> 1320Hz, 120ms/note, volume 0.32 <= 0.4) at runtime.
 */
export function playMessageDing(surface: MessagingSurface): DingPlayResult {
  if (!isMessageSoundEnabled(surface)) {
    return { played: false, reason: 'muted' };
  }

  try {
    const ctx = getOrCreateAudioContext();
    if (!ctx) {
      return { played: false, reason: 'no_audio_context' };
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => null);
    }

    const now = ctx.currentTime;
    const noteSec = DING_SPEC.noteDurationMs / 1000; // 0.12s
    const peak = DING_SPEC.peakVolume; // 0.32 <= 0.4

    DING_SPEC.frequenciesHz.forEach((freq, idx) => {
      const start = now + idx * noteSec;
      const end = start + noteSec;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = DING_SPEC.waveform;
      osc.frequency.setValueAtTime(freq, start);

      // Gentle attack (12ms) and smooth release envelope (no clicks/pops)
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(peak, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(end + 0.01);
    });

    if (typeof window !== 'undefined') {
      (window as any).__vigilLastDingPlayed = {
        surface,
        at: Date.now(),
        frequenciesHz: [...DING_SPEC.frequenciesHz],
        noteDurationMs: DING_SPEC.noteDurationMs,
        peakVolume: DING_SPEC.peakVolume,
        audioUnlocked,
      };
    }

    return {
      played: true,
      frequenciesHz: DING_SPEC.frequenciesHz,
      noteDurationMs: DING_SPEC.noteDurationMs,
      peakVolume: DING_SPEC.peakVolume,
    };
  } catch (err: any) {
    return { played: false, reason: err?.message || 'audio_error' };
  }
}

/**
 * Dashboard web optional browser Notification:
 * Ask permission politely ONCE; if denied, never nag again (badge-only).
 */
export async function requestDashboardNotificationPermissionOnce(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return 'unsupported';
  }
  if (Notification.permission !== 'default') {
    return Notification.permission;
  }
  try {
    if (localStorage.getItem(DASH_NOTIF_ASKED_KEY) === '1') {
      return Notification.permission;
    }
    localStorage.setItem(DASH_NOTIF_ASKED_KEY, '1');
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

function maybeShowDashboardBrowserNotification(event: IncomingMessageHookEvent): void {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  if (!document.hidden) return; // Only show OS notification when dashboard tab is in background

  try {
    const n = new Notification(event.senderName ? `New message — ${event.senderName}` : 'New message — VigilAMC', {
      body: event.preview,
      icon: '/brand/logo-tile-192.png',
      tag: `vigil-msg-${event.technicianId}`,
    });
    n.onclick = () => {
      window.focus();
      if (!window.location.pathname.startsWith('/dashboard/messages')) {
        window.location.href = '/dashboard/messages';
      }
      n.close();
    };
  } catch {
    // Non-fatal
  }
}

/**
 * Wire runtime ding + optional background dashboard browser notification
 * into the single Part-2 `onMessageReceived()` hook.
 * NEVER fires for messages sent by yourself, and NEVER fires for non-message notifications.
 */
export function ensureMessageSoundHookRegistered(): void {
  initMessagingAudioUnlock();
  if (hookRegistered) return;
  hookRegistered = true;

  registerMessageReceivedListener((event: IncomingMessageHookEvent) => {
    // Never play sound for messages sent by yourself
    if (event.surface === 'DASHBOARD' && event.senderRole === 'AGENCY') return;
    if (event.surface === 'TECHNICIAN' && event.senderRole === 'TECHNICIAN') return;

    playMessageDing(event.surface);

    if (event.surface === 'DASHBOARD') {
      maybeShowDashboardBrowserNotification(event);
    }
  });
}
