package com.vigilamc;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import com.capacitorjs.plugins.pushnotifications.PushNotificationsPlugin;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import java.util.Map;

/**
 * Handles background/closed DATA-only FCM pushes for Agency <-> Technician messaging.
 *
 * Owner-approved audio spec:
 * - Uses the phone's OWN DEFAULT notification sound (channel has NO custom sound URI) + vibration.
 * - Groups 2+ incoming messages within 60 seconds into a single summary ("N naye messages").
 * - Tapping deep-links straight to /technician/messages with thread open.
 * - Sets launcher icon badge count via NotificationCompat.Builder.setNumber(pendingCount).
 * - Non-message pushes continue through Capacitor's PushNotificationsPlugin unchanged.
 */
public class VigilMessagingService extends FirebaseMessagingService {

    private static final String TAG = "VigilMessagingService";

    public static final String MESSAGES_CHANNEL_ID = "vigilamc-messages";
    public static final String MESSAGES_CHANNEL_NAME = "Messages";
    public static final String TASKS_CHANNEL_ID = "vigilamc-tasks-v2";
    public static final String LEGACY_TASKS_CHANNEL_ID = "vigilamc-tasks";
    public static final String TASKS_CHANNEL_NAME = "Task Alerts";
    public static final String MESSAGES_GROUP_KEY = "com.vigilamc.MESSAGES_GROUP";
    public static final String EXTRA_DEEP_LINK = "vigil_deep_link";
    public static final String EXTRA_TECHNICIAN_ID = "vigil_technician_id";
    public static final String DEEP_LINK_MESSAGES_PATH = "/technician/messages";

    private static final int SUMMARY_NOTIFICATION_ID = 9200;
    private static final String PREFS_NAME = "vigil_msg_notifs";
    private static final String KEY_PENDING_COUNT = "pending_count";
    private static final String KEY_WINDOW_START_MS = "window_start_ms";
    private static final String KEY_WINDOW_COUNT = "window_count";
    private static final String KEY_LAST_LINES = "last_lines";
    private static final long GROUP_WINDOW_MS = 60_000L;

    /**
     * Create the high-importance "Messages" channel at app start (and before posting).
     * Intentionally does NOT call setSound(...) with any custom URI so Android uses
     * the phone's default system notification sound.
     */
    public static void ensureMessagesChannel(Context context) {
        if (context == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }
        try {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            NotificationChannel existing = nm.getNotificationChannel(MESSAGES_CHANNEL_ID);
            if (existing != null) return;

            NotificationChannel channel = new NotificationChannel(
                MESSAGES_CHANNEL_ID,
                MESSAGES_CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Agency office and technician chat messages");
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[] { 0L, 180L, 100L, 180L });
            channel.setShowBadge(true);
            // Do NOT setSound() with a custom URI — preserves the phone's default notification sound
            nm.createNotificationChannel(channel);
        } catch (Throwable t) {
            Log.w(TAG, "Failed to create Messages notification channel: " + t.getMessage());
        }
    }

    /**
     * Create the high-importance "Task Alerts" channel (vigilamc-tasks-v2) at app start.
     * Deletes the legacy "vigilamc-tasks" channel (which previously had a broken raw/default URI)
     * and intentionally does NOT call setSound() with a custom URI so Android plays the phone's
     * default system notification sound + short vibration.
     */
    public static void ensureTasksChannel(Context context) {
        if (context == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }
        try {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            // Clean up broken v1 channel from earlier installs
            try {
                if (nm.getNotificationChannel(LEGACY_TASKS_CHANNEL_ID) != null) {
                    nm.deleteNotificationChannel(LEGACY_TASKS_CHANNEL_ID);
                }
            } catch (Throwable ignored) {}

            NotificationChannel existing = nm.getNotificationChannel(TASKS_CHANNEL_ID);
            if (existing != null) return;

            NotificationChannel channel = new NotificationChannel(
                TASKS_CHANNEL_ID,
                TASKS_CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Task assignments, work orders, and inspection alerts");
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[] { 0L, 200L, 120L, 200L });
            channel.enableLights(true);
            channel.setLightColor(0xFFEA580C);
            channel.setShowBadge(true);
            // Do NOT setSound() with a custom URI — preserves the phone's default notification sound
            nm.createNotificationChannel(channel);
        } catch (Throwable t) {
            Log.w(TAG, "Failed to create Task Alerts notification channel: " + t.getMessage());
        }
    }

    public static void clearPendingMessageNotifications(Context context) {
        if (context == null) return;
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit()
                .putInt(KEY_PENDING_COUNT, 0)
                .putInt(KEY_WINDOW_COUNT, 0)
                .putLong(KEY_WINDOW_START_MS, 0L)
                .remove(KEY_LAST_LINES)
                .apply();

            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.cancel(SUMMARY_NOTIFICATION_ID);
            }
        } catch (Throwable t) {
            Log.w(TAG, "Failed to clear pending message notifications: " + t.getMessage());
        }
    }

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        try {
            PushNotificationsPlugin.onNewToken(token);
        } catch (Throwable t) {
            Log.w(TAG, "Forwarding FCM token to Capacitor failed: " + t.getMessage());
        }
    }

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        Map<String, String> data = remoteMessage.getData();
        if (data != null && "message".equals(data.get("type"))) {
            handleIncomingChatMessage(data);
            return;
        }

        // Delegate non-message notifications to Capacitor's PushNotificationsPlugin unchanged
        super.onMessageReceived(remoteMessage);
        try {
            PushNotificationsPlugin.sendRemoteMessage(remoteMessage);
        } catch (Throwable t) {
            Log.w(TAG, "Forwarding non-message push to Capacitor failed: " + t.getMessage());
        }
    }

    private void handleIncomingChatMessage(Map<String, String> data) {
        try {
            ensureMessagesChannel(this);

            String senderName = data.get("senderName");
            if (senderName == null || senderName.trim().isEmpty()) {
                senderName = "Agency Office";
            }
            String preview = data.get("preview");
            if (preview == null || preview.trim().isEmpty()) {
                preview = "Naya message";
            }
            String technicianId = data.get("technicianId");
            String dmKey = data.get("dmKey");
            String deepLinkPath = DEEP_LINK_MESSAGES_PATH;
            if (dmKey != null && !dmKey.trim().isEmpty()) {
                deepLinkPath = DEEP_LINK_MESSAGES_PATH + "?dmKey=" + Uri.encode(dmKey.trim());
            }

            long now = System.currentTimeMillis();
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            int pendingCount = prefs.getInt(KEY_PENDING_COUNT, 0) + 1;
            long windowStart = prefs.getLong(KEY_WINDOW_START_MS, 0L);
            int windowCount = prefs.getInt(KEY_WINDOW_COUNT, 0);

            if (windowStart == 0L || (now - windowStart) > GROUP_WINDOW_MS) {
                windowStart = now;
                windowCount = 1;
            } else {
                windowCount += 1;
            }

            String line = senderName + ": " + preview;
            String prevLines = prefs.getString(KEY_LAST_LINES, "");
            String updatedLines = prevLines.isEmpty() ? line : (prevLines + "\n" + line);
            String[] splitLines = updatedLines.split("\n");
            if (splitLines.length > 5) {
                StringBuilder sb = new StringBuilder();
                for (int i = splitLines.length - 5; i < splitLines.length; i++) {
                    if (sb.length() > 0) sb.append("\n");
                    sb.append(splitLines[i]);
                }
                updatedLines = sb.toString();
            }

            prefs.edit()
                .putInt(KEY_PENDING_COUNT, pendingCount)
                .putLong(KEY_WINDOW_START_MS, windowStart)
                .putInt(KEY_WINDOW_COUNT, windowCount)
                .putString(KEY_LAST_LINES, updatedLines)
                .apply();

            Intent tapIntent = new Intent(this, MainActivity.class);
            tapIntent.setAction(Intent.ACTION_VIEW);
            tapIntent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            tapIntent.putExtra(EXTRA_DEEP_LINK, deepLinkPath);
            if (technicianId != null) {
                tapIntent.putExtra(EXTRA_TECHNICIAN_ID, technicianId);
            }

            int piFlags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                piFlags |= PendingIntent.FLAG_IMMUTABLE;
            }
            int reqCode = dmKey != null ? (9201 + Math.abs(dmKey.hashCode() % 5000)) : 9201;
            PendingIntent pendingIntent = PendingIntent.getActivity(this, reqCode, tapIntent, piFlags);

            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            int notifId = 9210 + (int) (now % 10000);
            NotificationCompat.Builder builder = new NotificationCompat.Builder(this, MESSAGES_CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_stat_fire)
                .setColor(0xFFEA580C)
                .setContentTitle("Naya message — " + senderName)
                .setContentText(preview)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(preview))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_MESSAGE)
                .setDefaults(NotificationCompat.DEFAULT_SOUND | NotificationCompat.DEFAULT_VIBRATE)
                .setAutoCancel(true)
                .setNumber(pendingCount)
                .setGroup(MESSAGES_GROUP_KEY)
                .setContentIntent(pendingIntent);

            nm.notify(notifId, builder.build());

            // Group 2+ messages within a minute into a single summary notification ("N naye messages")
            if (windowCount >= 2 || pendingCount >= 2) {
                NotificationCompat.InboxStyle inboxStyle = new NotificationCompat.InboxStyle()
                    .setBigContentTitle(pendingCount + " naye messages");
                for (String l : updatedLines.split("\n")) {
                    if (!l.trim().isEmpty()) inboxStyle.addLine(l);
                }

                NotificationCompat.Builder summaryBuilder = new NotificationCompat.Builder(this, MESSAGES_CHANNEL_ID)
                    .setSmallIcon(R.drawable.ic_stat_fire)
                    .setColor(0xFFEA580C)
                    .setContentTitle(pendingCount + " naye messages")
                    .setContentText(preview)
                    .setStyle(inboxStyle)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setCategory(NotificationCompat.CATEGORY_MESSAGE)
                    .setGroup(MESSAGES_GROUP_KEY)
                    .setGroupSummary(true)
                    .setGroupAlertBehavior(NotificationCompat.GROUP_ALERT_CHILDREN)
                    .setAutoCancel(true)
                    .setNumber(pendingCount)
                    .setContentIntent(pendingIntent);

                nm.notify(SUMMARY_NOTIFICATION_ID, summaryBuilder.build());
            }
        } catch (Throwable t) {
            Log.e(TAG, "Error handling incoming chat FCM message: " + t.getMessage(), t);
        }
    }
}
