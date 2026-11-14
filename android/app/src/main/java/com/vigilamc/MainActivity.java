package com.vigilamc;

import android.os.Bundle;
import android.os.Looper;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.google.firebase.FirebaseApp;
import java.util.List;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "VigilAMC";
    private static volatile boolean exceptionGuardInstalled = false;

    static {
        installPushCrashGuard();
    }

    private static void installPushCrashGuard() {
        if (exceptionGuardInstalled) {
            return;
        }
        try {
            final Thread.UncaughtExceptionHandler previousHandler = Thread.getDefaultUncaughtExceptionHandler();
            Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
                try {
                    boolean isMainThread = Looper.getMainLooper() != null &&
                        Looper.getMainLooper().getThread() == thread;
                    if (!isMainThread && isPushOrFirebaseThrowable(thread, throwable)) {
                        Log.e(
                            TAG,
                            "[push] disabled: intercepted background crash on thread " +
                            (thread != null ? thread.getName() : "unknown") +
                            ": " +
                            (throwable != null ? throwable.toString() : "unknown"),
                            throwable
                        );
                        // Swallow non-UI push/Firebase background thread crash so the app stays open
                        return;
                    }
                } catch (Throwable ignored) {
                    // Never throw from inside the uncaught exception guard
                }
                if (previousHandler != null) {
                    previousHandler.uncaughtException(thread, throwable);
                }
            });
            exceptionGuardInstalled = true;
        } catch (Throwable t) {
            Log.w(TAG, "[push] disabled: could not install crash guard: " + t.getMessage());
        }
    }

    private static boolean isPushOrFirebaseThrowable(Thread thread, Throwable throwable) {
        if (thread != null && thread.getName() != null) {
            String tName = thread.getName();
            if (
                tName.contains("Firebase") ||
                tName.contains("Scion") ||
                tName.contains("FCM") ||
                tName.contains("Gms")
            ) {
                return true;
            }
        }
        Throwable cursor = throwable;
        int depth = 0;
        while (cursor != null && depth < 10) {
            for (StackTraceElement el : cursor.getStackTrace()) {
                String cls = el.getClassName();
                if (
                    cls != null && (
                        cls.startsWith("com.google.firebase") ||
                        cls.startsWith("com.capacitorjs.plugins.pushnotifications") ||
                        cls.startsWith("androidx.datastore")
                    )
                ) {
                    return true;
                }
            }
            cursor = cursor.getCause();
            depth++;
        }
        return false;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        installPushCrashGuard();

        // Register fail-safe PushNotifications plugin instance before Bridge initialization
        try {
            bridgeBuilder.addPluginInstance(new SafePushNotificationsPlugin());
        } catch (Throwable t) {
            Log.w(TAG, "[push] disabled: failed to register SafePushNotificationsPlugin: " + t.getMessage());
        }

        // Verify Firebase initialization state without ever throwing
        try {
            List<FirebaseApp> apps = FirebaseApp.getApps(this);
            if (apps == null || apps.isEmpty()) {
                Log.w(TAG, "[push] disabled: FirebaseApp not initialized on startup (degrading gracefully)");
            }
        } catch (Throwable t) {
            Log.w(TAG, "[push] disabled: Firebase startup check failed: " + t.getMessage());
        }

        super.onCreate(savedInstanceState);
    }
}
