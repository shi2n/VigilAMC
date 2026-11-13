'use client';

import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { Geolocation, Position } from '@capacitor/geolocation';
import { PushNotifications, ActionPerformed, PushNotificationSchema, Token } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';

export interface NativeGpsCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  isBasementCached?: boolean;
}

/**
 * Returns true only when running inside the Capacitor Android/iOS native shell.
 * Returns false in desktop browsers, mobile Safari/Chrome, and PWA mode.
 */
export function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false;
  return Capacitor.isNativePlatform();
}

/**
 * Listen to native app state (resumed / brought to foreground)
 */
export function registerNativeLifecycle(onResume: () => void): () => void {
  if (!isNativePlatform()) return () => {};

  let cleanup: (() => void) | null = null;
  App.addListener('appStateChange', (state) => {
    if (state.isActive) {
      onResume();
    }
  }).then((handle) => {
    cleanup = () => handle.remove();
  }).catch((err) => {
    console.warn('[NativeBridge] Failed to register appStateChange listener:', err);
  });

  return () => {
    if (cleanup) cleanup();
  };
}

/**
 * Send the cached or new FCM push token to the server with technician auth headers
 */
export async function syncNativePushToken(): Promise<string | null> {
  if (!isNativePlatform()) return null;
  try {
    const stored = await Preferences.get({ key: 'vigil_fcm_token' });
    const fcmToken = stored?.value;
    if (!fcmToken) return null;

    const techToken = typeof window !== 'undefined' ? localStorage.getItem('vigil_tech_token') : null;
    const authHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (techToken) {
      authHeaders['Authorization'] = `Bearer ${techToken}`;
    }

    const payload = JSON.stringify({
      fcmToken,
      pushToken: fcmToken,
      platform: Capacitor.getPlatform(),
      techToken: techToken || undefined,
    });

    await Promise.allSettled([
      fetch('/api/technician/push-token', {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders,
        body: payload,
      }),
      fetch('/api/technician/device-token', {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders,
        body: payload,
      }),
    ]);
    return fcmToken;
  } catch (syncErr) {
    console.warn('[NativeBridge] Failed to sync push token to server:', syncErr);
    return null;
  }
}

/**
 * Initialize Push Notifications (FCM) on native Android
 * - Requests POST_NOTIFICATIONS runtime permission (Android 13+)
 * - Registers device token with /api/technician/device-token
 * - Configures tap-through deep links
 */
export async function registerNativePush(options?: {
  onNotificationReceived?: (notification: PushNotificationSchema) => void;
  onNotificationTapped?: (action: ActionPerformed) => void;
}): Promise<string | null> {
  if (!isNativePlatform()) return null;

  try {
    // 1. Create High-Priority Notification Channel for Home-Screen / System-Tray Notifications
    try {
      await PushNotifications.createChannel({
        id: 'vigilamc-tasks',
        name: 'VigilAMC Tasks',
        description: 'Instant fire safety task assignment and inspection alerts',
        importance: 5,
        visibility: 1,
        sound: 'default',
        vibration: true,
        lights: true,
        lightColor: '#EA580C',
      });
    } catch (chErr) {
      console.warn('[NativeBridge] Channel creation warning:', chErr);
    }

    // 2. Request Android 13+ POST_NOTIFICATIONS runtime permission
    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') {
      perm = await PushNotifications.requestPermissions();
    }

    if (perm.receive !== 'granted') {
      console.warn('[NativeBridge] Notification permission not granted:', perm.receive);
      return null;
    }

    // 3. Register FCM listener for received token
    PushNotifications.addListener('registration', async (token: Token) => {
      const fcmToken = token.value;
      try {
        await Preferences.set({ key: 'vigil_fcm_token', value: fcmToken });
        await syncNativePushToken();
        console.info('[NativeBridge] Registered push token with server');
      } catch (postErr) {
        console.warn('[NativeBridge] Could not post FCM token to backend:', postErr);
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.warn('[NativeBridge] Push registration error:', error);
    });

    if (options?.onNotificationReceived) {
      PushNotifications.addListener('pushNotificationReceived', options.onNotificationReceived);
    }

    if (options?.onNotificationTapped) {
      PushNotifications.addListener('pushNotificationActionPerformed', options.onNotificationTapped);
    }

    // Request native registration
    await PushNotifications.register();

    // Ensure currently cached token is also synced to backend
    const syncedToken = await syncNativePushToken();
    return syncedToken;
  } catch (err) {
    console.warn('[NativeBridge] Push notifications setup error:', err);
    return null;
  }
}

/**
 * Remove device token on logout
 */
export async function unregisterNativePush(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    const stored = await Preferences.get({ key: 'vigil_fcm_token' });
    const fcmToken = stored.value;
    if (fcmToken) {
      await Promise.allSettled([
        fetch('/api/technician/push-token', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fcmToken, pushToken: fcmToken }),
        }),
        fetch('/api/technician/device-token', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fcmToken, pushToken: fcmToken }),
        }),
      ]);
      await Preferences.remove({ key: 'vigil_fcm_token' });
    }
  } catch (err) {
    console.warn('[NativeBridge] Unregister push error:', err);
  }
}

/**
 * Fallback: post local notification for newly detected task assignment
 */
export async function showLocalTaskNotification(task: {
  id: string;
  title: string;
  buildingName?: string;
  dueDate?: string | null;
}): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      const req = await LocalNotifications.requestPermissions();
      if (req.display !== 'granted') return;
    }
    const dueStr = task.dueDate
      ? ` · Due ${new Date(task.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`
      : '';
    const bldgStr = task.buildingName ? ` · ${task.buildingName}` : '';
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Math.abs(task.id.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)) % 100000,
          title: 'New Task Assigned',
          body: `${task.title}${bldgStr}${dueStr}`,
          channelId: 'vigilamc-tasks',
          smallIcon: 'ic_stat_fire',
          iconColor: '#EA580C',
          extra: { taskId: task.id, type: 'task_assigned' },
        },
      ],
    });
  } catch (err) {
    console.warn('[NativeBridge] Fallback local notification error:', err);
  }
}

/**
 * Schedule offline local reminders for tasks due within 48h
 */
export async function scheduleOfflineDueReminders(
  tasks: Array<{ id: string; title: string; dueDate?: string | null }>
): Promise<void> {
  if (!isNativePlatform() || !Array.isArray(tasks)) return;

  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      const req = await LocalNotifications.requestPermissions();
      if (req.display !== 'granted') return;
    }

    const now = Date.now();
    const notificationsToSchedule = [];

    for (let i = 0; i < Math.min(tasks.length, 5); i++) {
      const task = tasks[i];
      if (!task.dueDate) continue;

      const dueTime = new Date(task.dueDate).getTime();
      // Fire reminder 4 hours before due time or tomorrow 8 AM
      const reminderTime = dueTime - 4 * 60 * 60 * 1000;
      if (reminderTime > now) {
        notificationsToSchedule.push({
          id: Math.abs(task.id.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)) % 100000,
          title: `Task Due Soon: ${task.title}`,
          body: `Due in 4 hours. Tap to review checklists and equipment.`,
          schedule: { at: new Date(reminderTime) },
          smallIcon: 'ic_stat_fire',
          iconColor: '#EA580C',
          extra: { taskId: task.id },
        });
      }
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: notificationsToSchedule });
    }
  } catch (err) {
    console.warn('[NativeBridge] Local notification scheduling error:', err);
  }
}

/**
 * Capture photo using native Android camera (rear camera, good quality)
 * Returns a standard DOM File object ready for canvas stamping and compression ladder
 */
export async function capturePhotoNative(): Promise<File | null> {
  if (!isNativePlatform()) return null;

  try {
    const image = await Camera.getPhoto({
      quality: 92,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      direction: CameraDirection.Rear,
      saveToGallery: false,
    });

    if (!image.webPath) return null;

    const res = await fetch(image.webPath);
    const blob = await res.blob();
    const filename = `vigil_native_${Date.now()}.jpg`;

    return new File([blob], filename, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (err: any) {
    // If user cancelled camera, err.message is "User cancelled photos app"
    if (err?.message?.includes('cancelled')) {
      return null;
    }
    console.warn('[NativeBridge] Native camera error:', err);
    return null;
  }
}

/**
 * Get high accuracy location using native Android Geolocation provider
 */
export async function getNativeLocation(): Promise<NativeGpsCoords | null> {
  if (!isNativePlatform()) return null;

  try {
    const perm = await Geolocation.checkPermissions();
    if (perm.location !== 'granted') {
      const requested = await Geolocation.requestPermissions();
      if (requested.location !== 'granted') return null;
    }

    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000,
    });

    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: Math.round(pos.coords.accuracy || 8),
      timestamp: pos.timestamp,
      isBasementCached: false,
    };
  } catch (err) {
    console.warn('[NativeBridge] Native location error:', err);
    return null;
  }
}

/**
 * Watch native location changes
 */
export async function watchNativeLocation(
  onCoords: (coords: NativeGpsCoords) => void,
  onError?: (err: any) => void
): Promise<string | null> {
  if (!isNativePlatform()) return null;

  try {
    const perm = await Geolocation.checkPermissions();
    if (perm.location !== 'granted') {
      const requested = await Geolocation.requestPermissions();
      if (requested.location !== 'granted') return null;
    }

    const watchId = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      },
      (position: Position | null, err?: any) => {
        if (err) {
          if (onError) onError(err);
          return;
        }
        if (position) {
          onCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy || 10),
            timestamp: position.timestamp,
            isBasementCached: false,
          });
        }
      }
    );

    return watchId;
  } catch (err) {
    if (onError) onError(err);
    return null;
  }
}

export async function clearNativeWatch(watchId: string): Promise<void> {
  if (!isNativePlatform() || !watchId) return;
  try {
    await Geolocation.clearWatch({ id: watchId });
  } catch {}
}

/**
 * Native preferences helper for durable settings (e.g. language, offline state)
 */
export async function getStoredPreference(key: string): Promise<string | null> {
  if (!isNativePlatform()) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  try {
    const item = await Preferences.get({ key });
    return item.value;
  } catch {
    return null;
  }
}

export async function setStoredPreference(key: string, value: string): Promise<void> {
  if (!isNativePlatform()) {
    try {
      localStorage.setItem(key, value);
    } catch {}
    return;
  }
  try {
    await Preferences.set({ key, value });
  } catch {}
}
