package com.vigilamc;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.content.Intent;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.provider.Settings;
import android.util.Log;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.view.animation.DecelerateInterpolator;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.firebase.FirebaseApp;
import java.util.List;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "VigilAMC";
    private static final String SPLASH_TAG = "VigilSplash";
    private static final int SPLASH_BG_COLOR = 0xFFFFF8F2; // Warm cream #FFF8F2
    private static final int FLAME_COLOR = 0xFFEA580C;     // FIRE orange #EA580C
    private static final long SPLASH_FAILSAFE_MS = 8500L;
    private static final long SPLASH_FADE_MS = 300L;
    private static volatile boolean exceptionGuardInstalled = false;

    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private FrameLayout launchSplashOverlay;
    private boolean splashDismissed = false;
    private long launchStartUptimeMs = 0L;
    private final Runnable failsafeHideRunnable = () -> hideLaunchSplash("failsafe-8500ms");

    @CapacitorPlugin(name = "SplashScreen")
    public static class SafeSplashScreenPlugin extends Plugin {
        @PluginMethod
        public void hide(PluginCall call) {
            if (getActivity() instanceof MainActivity) {
                ((MainActivity) getActivity()).hideLaunchSplash("capacitor-plugin");
            }
            call.resolve();
        }

        @PluginMethod
        public void show(PluginCall call) {
            call.resolve();
        }
    }

    public class NativeSplashBridge {
        @JavascriptInterface
        public void hide() {
            hideLaunchSplash("js-interface");
        }
    }

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
        launchStartUptimeMs = SystemClock.uptimeMillis();

        // Install AndroidX SplashScreen before super.onCreate so frame 0 matches #FFF8F2 + brand mark
        try {
            SplashScreen.installSplashScreen(this);
        } catch (Throwable t) {
            Log.w(SPLASH_TAG, "SplashScreen install fallback: " + t.getMessage());
        }

        // Register fail-safe PushNotifications + SplashScreen plugin instances before Bridge init
        try {
            bridgeBuilder.addPluginInstance(new SafePushNotificationsPlugin());
        } catch (Throwable t) {
            Log.w(TAG, "[push] disabled: failed to register SafePushNotificationsPlugin: " + t.getMessage());
        }
        try {
            bridgeBuilder.addPluginInstance(new SafeSplashScreenPlugin());
        } catch (Throwable t) {
            Log.w(SPLASH_TAG, "Failed to register SafeSplashScreenPlugin: " + t.getMessage());
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

        // Match window & WebView surface to #FFF8F2 so there is zero white flash before/after splash fade
        try {
            getWindow().getDecorView().setBackgroundColor(SPLASH_BG_COLOR);
            if (this.bridge != null && this.bridge.getWebView() != null) {
                WebView webView = this.bridge.getWebView();
                webView.setBackgroundColor(SPLASH_BG_COLOR);
                webView.addJavascriptInterface(new NativeSplashBridge(), "VigilNativeSplash");
            }
        } catch (Throwable t) {
            Log.w(SPLASH_TAG, "WebView splash setup warning: " + t.getMessage());
        }

        attachLaunchSplashOverlay();
        mainHandler.postDelayed(failsafeHideRunnable, SPLASH_FAILSAFE_MS);

        // Create high-importance notification channels at app start (default system sound + vibration)
        VigilMessagingService.ensureMessagesChannel(this);
        VigilMessagingService.ensureTasksChannel(this);

        // Handle deep-link if launched from a message notification tap
        handleDeepLinkIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleDeepLinkIntent(intent);
    }

    private void handleDeepLinkIntent(Intent intent) {
        if (intent == null) return;
        String deepLink = intent.getStringExtra(VigilMessagingService.EXTRA_DEEP_LINK);
        if (deepLink == null || deepLink.trim().isEmpty()) return;

        // Clear pending message badge/notifications once user opens chat
        if (deepLink.startsWith(VigilMessagingService.DEEP_LINK_MESSAGES_PATH)) {
            VigilMessagingService.clearPendingMessageNotifications(this);
        }

        final String safePath = (deepLink.startsWith("/") ? deepLink : ("/" + deepLink)).replace("'", "");
        mainHandler.postDelayed(() -> {
            try {
                if (this.bridge != null && this.bridge.getWebView() != null) {
                    String js = "if ((window.location.pathname + window.location.search) !== '" + safePath + "') { window.location.href = '" + safePath + "'; }";
                    this.bridge.getWebView().evaluateJavascript(js, null);
                }
            } catch (Throwable t) {
                Log.w(TAG, "Deep-link navigation warning: " + t.getMessage());
            }
        }, 400L);
    }

    private int dp(int value) {
        return Math.round(TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            value,
            getResources().getDisplayMetrics()
        ));
    }

    private void attachLaunchSplashOverlay() {
        try {
            FrameLayout overlay = new FrameLayout(this);
            overlay.setBackgroundColor(SPLASH_BG_COLOR);
            overlay.setClickable(false);
            overlay.setFocusable(false);

            // Subtle ambient radial FIRE glow matching VigilAMC glass palette
            View glowView = new View(this);
            GradientDrawable glow = new GradientDrawable(
                GradientDrawable.Orientation.TOP_BOTTOM,
                new int[] { 0x18EA580C, 0x00FFF8F2 }
            );
            glow.setGradientType(GradientDrawable.RADIAL_GRADIENT);
            glow.setGradientRadius(dp(260));
            glow.setGradientCenter(0.5f, 0.42f);
            glowView.setBackground(glow);
            overlay.addView(glowView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            ));

            LinearLayout centerCol = new LinearLayout(this);
            centerCol.setOrientation(LinearLayout.VERTICAL);
            centerCol.setGravity(Gravity.CENTER_HORIZONTAL);
            FrameLayout.LayoutParams colParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.CENTER
            );

            ImageView iconView = new ImageView(this);
            iconView.setImageResource(R.drawable.ic_splash_brand);
            iconView.setScaleType(ImageView.ScaleType.FIT_CENTER);
            LinearLayout.LayoutParams iconParams = new LinearLayout.LayoutParams(dp(112), dp(112));
            iconParams.bottomMargin = dp(18);
            centerCol.addView(iconView, iconParams);

            TextView titleView = new TextView(this);
            titleView.setText("VigilAMC Field");
            titleView.setTextColor(0xFF1C1917);
            titleView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 22);
            titleView.setTypeface(Typeface.DEFAULT_BOLD);
            titleView.setGravity(Gravity.CENTER);
            LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            );
            titleParams.bottomMargin = dp(4);
            centerCol.addView(titleView, titleParams);

            TextView subView = new TextView(this);
            subView.setText("Fire Safety AMC & Compliance");
            subView.setTextColor(0xFF78716C);
            subView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
            subView.setGravity(Gravity.CENTER);
            LinearLayout.LayoutParams subParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            );
            subParams.bottomMargin = dp(24);
            centerCol.addView(subView, subParams);

            ProgressBar spinner = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
            spinner.setIndeterminate(true);
            spinner.setIndeterminateTintList(ColorStateList.valueOf(FLAME_COLOR));
            LinearLayout.LayoutParams barParams = new LinearLayout.LayoutParams(dp(136), dp(4));
            centerCol.addView(spinner, barParams);

            overlay.addView(centerCol, colParams);
            addContentView(overlay, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            ));
            overlay.bringToFront();
            this.launchSplashOverlay = overlay;
            Log.i(SPLASH_TAG, "Branded FIRE splash overlay attached");
        } catch (Throwable t) {
            Log.w(SPLASH_TAG, "Overlay attach fallback: " + t.getMessage());
        }
    }

    public void hideLaunchSplash(final String reason) {
        mainHandler.post(() -> {
            if (splashDismissed) return;
            splashDismissed = true;
            mainHandler.removeCallbacks(failsafeHideRunnable);

            final long elapsedMs = SystemClock.uptimeMillis() - launchStartUptimeMs;
            Log.i(SPLASH_TAG, "hideLaunchSplash reason=" + reason + " elapsedMs=" + elapsedMs);

            final FrameLayout overlay = launchSplashOverlay;
            if (overlay == null) return;

            float animScale = 1.0f;
            try {
                animScale = Settings.Global.getFloat(
                    getContentResolver(),
                    Settings.Global.ANIMATOR_DURATION_SCALE,
                    1.0f
                );
            } catch (Throwable ignored) {}

            if (animScale <= 0f) {
                removeSplashView(overlay);
                return;
            }

            overlay.animate()
                .alpha(0f)
                .setDuration(SPLASH_FADE_MS)
                .setInterpolator(new DecelerateInterpolator())
                .setListener(new AnimatorListenerAdapter() {
                    @Override
                    public void onAnimationEnd(Animator animation) {
                        removeSplashView(overlay);
                    }
                })
                .start();
        });
    }

    private void removeSplashView(FrameLayout overlay) {
        try {
            ViewParent parent = overlay.getParent();
            if (parent instanceof ViewGroup) {
                ((ViewGroup) parent).removeView(overlay);
            }
            if (launchSplashOverlay == overlay) {
                launchSplashOverlay = null;
            }
        } catch (Throwable ignored) {}
    }

    @Override
    public void onDestroy() {
        mainHandler.removeCallbacks(failsafeHideRunnable);
        super.onDestroy();
    }
}
