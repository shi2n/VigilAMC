package com.vigilamc;

import android.Manifest;
import android.content.Context;
import android.util.Log;
import com.capacitorjs.plugins.pushnotifications.PushNotificationsPlugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import java.util.List;

/**
 * Fail-safe wrapper around Capacitor's PushNotificationsPlugin.
 * Ensures that missing, corrupted, or uninitialized Firebase configuration
 * degrades gracefully ([push] disabled: <reason>) and never crashes the
 * CapacitorPlugins background handler thread or MainActivity on startup.
 */
@CapacitorPlugin(
    name = "PushNotifications",
    permissions = @Permission(strings = { Manifest.permission.POST_NOTIFICATIONS }, alias = "receive")
)
public class SafePushNotificationsPlugin extends PushNotificationsPlugin {

    private static final String TAG = "VigilAMC";

    private boolean isFirebaseAvailable(Context context) {
        try {
            if (context == null) {
                Log.w(TAG, "[push] disabled: context is null");
                return false;
            }
            List<FirebaseApp> apps = FirebaseApp.getApps(context);
            if (apps == null || apps.isEmpty()) {
                Log.w(TAG, "[push] disabled: Default FirebaseApp is not initialized");
                return false;
            }
            FirebaseApp app = FirebaseApp.getInstance();
            FirebaseOptions opts = app.getOptions();
            if (opts == null) {
                Log.w(TAG, "[push] disabled: FirebaseOptions is null");
                return false;
            }
            String appId = opts.getApplicationId();
            String projectId = opts.getProjectId();
            String apiKey = opts.getApiKey();
            if (
                appId == null || appId.trim().isEmpty() ||
                projectId == null || projectId.trim().isEmpty() ||
                apiKey == null || apiKey.trim().isEmpty()
            ) {
                Log.w(TAG, "[push] disabled: incomplete FirebaseOptions (appId/projectId/apiKey missing)");
                return false;
            }
            return true;
        } catch (Throwable t) {
            Log.w(TAG, "[push] disabled: Firebase availability check failed: " + t.getMessage());
            return false;
        }
    }

    @Override
    public void load() {
        try {
            super.load();
        } catch (Throwable t) {
            Log.w(TAG, "[push] disabled: PushNotificationsPlugin.load() failed: " + t.getMessage());
        }
    }

    @Override
    @PluginMethod
    public void register(PluginCall call) {
        try {
            if (!isFirebaseAvailable(getContext())) {
                String reason = "Push notifications unavailable on this device (Firebase not configured)";
                Log.w(TAG, "[push] disabled: " + reason);
                try {
                    sendError(reason);
                } catch (Throwable ignored) {}
                call.reject(reason);
                return;
            }
            super.register(call);
        } catch (Throwable t) {
            String reason = "Push registration failed: " + t.getMessage();
            Log.w(TAG, "[push] disabled: " + reason);
            try {
                sendError(reason);
            } catch (Throwable ignored) {}
            call.reject(reason);
        }
    }

    @Override
    @PluginMethod
    public void unregister(PluginCall call) {
        try {
            if (!isFirebaseAvailable(getContext())) {
                call.resolve();
                return;
            }
            super.unregister(call);
        } catch (Throwable t) {
            Log.w(TAG, "[push] disabled: unregister failed: " + t.getMessage());
            call.resolve();
        }
    }
}
