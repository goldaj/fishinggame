package com.openai.pechemerveilles;

import android.app.Activity;
import android.content.Context;
import android.graphics.Insets;
import android.media.AudioAttributes;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.view.HapticFeedbackConstants;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(0xFF071A2B);

        webView = new WebView(this);
        root.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        setContentView(root);

        root.setOnApplyWindowInsetsListener((view, windowInsets) -> {
            int left;
            int top;
            int right;
            int bottom;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                Insets safe = windowInsets.getInsets(
                        WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout()
                );
                left = safe.left;
                top = safe.top;
                right = safe.right;
                bottom = safe.bottom;
            } else {
                left = windowInsets.getSystemWindowInsetLeft();
                top = windowInsets.getSystemWindowInsetTop();
                right = windowInsets.getSystemWindowInsetRight();
                bottom = windowInsets.getSystemWindowInsetBottom();
            }

            view.setPadding(left, top, right, bottom);
            return windowInsets;
        });
        root.requestApplyInsets();

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        settings.setTextZoom(100);

        // This bridge is exposed only to the bundled local UI. External navigation is
        // blocked below so untrusted web content cannot obtain access to the interface.
        webView.addJavascriptInterface(new HapticsBridge(), "NativeHaptics");
        webView.setWebViewClient(new WebViewClient() {
            private boolean isLocal(String url) {
                return url != null && url.startsWith("file:///android_asset/");
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return request == null || request.getUrl() == null || !isLocal(request.getUrl().toString());
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return !isLocal(url);
            }
        });
        webView.setBackgroundColor(0xFF071A2B);
        webView.loadUrl("file:///android_asset/index.html");
    }

    private final class HapticsBridge {
        private Vibrator vibrator() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                VibratorManager manager = (VibratorManager) getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
                return manager == null ? null : manager.getDefaultVibrator();
            }
            return (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        }

        private AudioAttributes vibrationAttributes() {
            return new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build();
        }

        @JavascriptInterface
        public void tap() {
            if (webView == null) return;
            webView.post(() -> {
                boolean handled = webView.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP);
                if (!handled) pulse(88, 22);
            });
        }

        @JavascriptInterface
        public void pulse(int requestedAmplitude, int requestedDurationMs) {
            Vibrator vibrator = vibrator();
            if (vibrator == null || !vibrator.hasVibrator()) return;

            // Keep line-tension pulses subtle, but above the barely perceptible range that
            // some devices effectively swallow.
            int durationMs = Math.max(22, Math.min(60, requestedDurationMs));
            int amplitude = Math.max(72, Math.min(180, requestedAmplitude));

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                int effectiveAmplitude = vibrator.hasAmplitudeControl()
                        ? amplitude
                        : VibrationEffect.DEFAULT_AMPLITUDE;
                vibrator.vibrate(
                        VibrationEffect.createOneShot(durationMs, effectiveAmplitude),
                        vibrationAttributes()
                );
            } else {
                vibrator.vibrate(durationMs);
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
