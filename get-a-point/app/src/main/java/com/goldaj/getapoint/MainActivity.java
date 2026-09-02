package com.goldaj.getapoint;

import android.app.Activity;
import android.os.Bundle;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.Typeface;
import android.view.HapticFeedbackConstants;
import android.view.MotionEvent;
import android.view.View;
import android.view.Window;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.Set;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window window = getWindow();
        window.setStatusBarColor(Color.rgb(12, 14, 24));
        window.setNavigationBarColor(Color.rgb(12, 14, 24));
        setContentView(new PointView(this));
    }

    private static final class PointView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint strokePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final SharedPreferences prefs;
        private final RectF buttonRect = new RectF();
        private final Random random = new Random();
        private final List<Particle> particles = new ArrayList<>();
        private final SimpleDateFormat keyFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
        private final SimpleDateFormat dayFormat = new SimpleDateFormat("EEE", Locale.FRENCH);

        private int points;
        private int streak;
        private int bestStreak;
        private String lastClaim;
        private Set<String> history;
        private boolean claimedToday;
        private boolean pressed;
        private long lastFrameTime;

        private final int bgTop = Color.rgb(13, 15, 26);
        private final int bgBottom = Color.rgb(24, 20, 46);
        private final int card = Color.rgb(30, 31, 49);
        private final int cardBorder = Color.rgb(53, 55, 79);
        private final int text = Color.rgb(245, 245, 250);
        private final int muted = Color.rgb(160, 163, 185);
        private final int accent = Color.rgb(148, 112, 255);
        private final int accent2 = Color.rgb(92, 216, 197);
        private final int inactive = Color.rgb(67, 68, 89);

        PointView(Context context) {
            super(context);
            setLayerType(View.LAYER_TYPE_SOFTWARE, null);
            prefs = context.getSharedPreferences("get_a_point", Context.MODE_PRIVATE);
            loadState();
            normalizeStreak();
        }

        private float dp(float value) {
            return value * getResources().getDisplayMetrics().density;
        }

        private String key(Calendar calendar) {
            return keyFormat.format(calendar.getTime());
        }

        private String todayKey() {
            return key(Calendar.getInstance());
        }

        private String yesterdayKey() {
            Calendar c = Calendar.getInstance();
            c.add(Calendar.DAY_OF_YEAR, -1);
            return key(c);
        }

        private void loadState() {
            points = prefs.getInt("points", 0);
            streak = prefs.getInt("streak", 0);
            bestStreak = prefs.getInt("best_streak", 0);
            lastClaim = prefs.getString("last_claim", "");
            history = new HashSet<>();
            String raw = prefs.getString("history", "");
            if (!raw.isEmpty()) {
                String[] parts = raw.split(",");
                for (String part : parts) {
                    if (!part.trim().isEmpty()) history.add(part.trim());
                }
            }
            claimedToday = todayKey().equals(lastClaim);
        }

        private void normalizeStreak() {
            if (!lastClaim.isEmpty() && !lastClaim.equals(todayKey()) && !lastClaim.equals(yesterdayKey())) {
                streak = 0;
                prefs.edit().putInt("streak", 0).apply();
            }
        }

        private void saveState() {
            StringBuilder historyCsv = new StringBuilder();
            int count = 0;
            for (String entry : history) {
                if (count++ > 0) historyCsv.append(',');
                historyCsv.append(entry);
            }
            prefs.edit()
                    .putInt("points", points)
                    .putInt("streak", streak)
                    .putInt("best_streak", bestStreak)
                    .putString("last_claim", lastClaim)
                    .putString("history", historyCsv.toString())
                    .apply();
        }

        private void claimPoint() {
            if (claimedToday) return;
            String today = todayKey();
            if (lastClaim.equals(yesterdayKey())) streak += 1;
            else streak = 1;

            points += 1;
            bestStreak = Math.max(bestStreak, streak);
            lastClaim = today;
            claimedToday = true;
            history.add(today);
            pruneHistory();
            saveState();
            performHapticFeedback(HapticFeedbackConstants.LONG_PRESS);
            burst();
            invalidate();
        }

        private void pruneHistory() {
            Set<String> keep = new HashSet<>();
            Calendar c = Calendar.getInstance();
            for (int i = 0; i < 45; i++) {
                keep.add(key(c));
                c.add(Calendar.DAY_OF_YEAR, -1);
            }
            history.retainAll(keep);
        }

        private void burst() {
            float cx = buttonRect.centerX();
            float cy = buttonRect.centerY();
            int[] colors = {accent, accent2, Color.rgb(255, 205, 92), Color.rgb(255, 121, 166), Color.WHITE};
            for (int i = 0; i < 46; i++) {
                double angle = random.nextDouble() * Math.PI * 2.0;
                float speed = dp(110 + random.nextInt(240));
                Particle p = new Particle();
                p.x = cx;
                p.y = cy;
                p.vx = (float) Math.cos(angle) * speed;
                p.vy = (float) Math.sin(angle) * speed - dp(80);
                p.life = 1f;
                p.size = dp(2.5f + random.nextFloat() * 3.5f);
                p.color = colors[random.nextInt(colors.length)];
                particles.add(p);
            }
            lastFrameTime = System.nanoTime();
            postInvalidateOnAnimation();
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            int w = getWidth();
            int h = getHeight();
            if (w <= 0 || h <= 0) return;

            paint.setShader(new LinearGradient(0, 0, 0, h, bgTop, bgBottom, Shader.TileMode.CLAMP));
            paint.setStyle(Paint.Style.FILL);
            canvas.drawRect(0, 0, w, h, paint);
            paint.setShader(null);

            float side = dp(22);
            float top = dp(32);

            paint.setTypeface(Typeface.create("sans-serif", Typeface.BOLD));
            paint.setTextSize(dp(25));
            paint.setColor(text);
            paint.setTextAlign(Paint.Align.LEFT);
            canvas.drawText("Get a Point", side, top + dp(24), paint);

            paint.setTypeface(Typeface.create("sans-serif", Typeface.NORMAL));
            paint.setTextSize(dp(13));
            paint.setColor(muted);
            canvas.drawText("Un point par jour. Pas plus.", side, top + dp(47), paint);

            float centerX = w / 2f;
            float scoreY = top + dp(142);

            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(7));
            paint.setStrokeCap(Paint.Cap.ROUND);
            paint.setColor(Color.rgb(55, 52, 81));
            canvas.drawCircle(centerX, scoreY, dp(66), paint);
            paint.setColor(accent);
            float milestoneProgress = (points % 10) / 10f;
            RectF ring = new RectF(centerX - dp(66), scoreY - dp(66), centerX + dp(66), scoreY + dp(66));
            canvas.drawArc(ring, -90, Math.max(10f, 360f * milestoneProgress), false, paint);
            paint.setStyle(Paint.Style.FILL);

            paint.setTypeface(Typeface.create("sans-serif", Typeface.BOLD));
            paint.setTextAlign(Paint.Align.CENTER);
            paint.setTextSize(dp(points >= 1000 ? 39 : 48));
            paint.setColor(text);
            drawCentered(canvas, String.valueOf(points), centerX, scoreY - dp(4), paint);
            paint.setTypeface(Typeface.create("sans-serif", Typeface.BOLD));
            paint.setTextSize(dp(11));
            paint.setColor(muted);
            canvas.drawText(points == 1 ? "POINT" : "POINTS", centerX, scoreY + dp(42), paint);

            float statsTop = scoreY + dp(94);
            float gap = dp(12);
            float statW = (w - side * 2 - gap) / 2f;
            drawStatCard(canvas, side, statsTop, statW, dp(78), "SÉRIE", streak + " j", accent2);
            drawStatCard(canvas, side + statW + gap, statsTop, statW, dp(78), "RECORD", bestStreak + " j", Color.rgb(255, 204, 94));

            float buttonTop = statsTop + dp(107);
            float buttonHeight = dp(72);
            buttonRect.set(side, buttonTop, w - side, buttonTop + buttonHeight);
            float pressInset = pressed ? dp(3) : 0;
            RectF drawnButton = new RectF(buttonRect.left + pressInset, buttonRect.top + pressInset,
                    buttonRect.right - pressInset, buttonRect.bottom - pressInset);

            paint.setStyle(Paint.Style.FILL);
            paint.setShadowLayer(pressed ? dp(4) : dp(14), 0, dp(7), Color.argb(80, 0, 0, 0));
            paint.setColor(claimedToday ? inactive : accent);
            canvas.drawRoundRect(drawnButton, dp(22), dp(22), paint);
            paint.clearShadowLayer();

            paint.setTypeface(Typeface.create("sans-serif", Typeface.BOLD));
            paint.setTextSize(dp(claimedToday ? 13 : 18));
            paint.setColor(claimedToday ? Color.rgb(198, 199, 210) : Color.WHITE);
            paint.setTextAlign(Paint.Align.CENTER);
            drawCentered(canvas, claimedToday ? "POINT DU JOUR RÉCUPÉRÉ" : "+1 POINT", centerX, drawnButton.centerY(), paint);

            paint.setTypeface(Typeface.create("sans-serif", Typeface.NORMAL));
            paint.setTextSize(dp(12));
            paint.setColor(muted);
            canvas.drawText(claimedToday ? "Reviens demain pour le prochain." : "Une pression suffit. Le reste attend demain.",
                    centerX, buttonRect.bottom + dp(29), paint);

            float historyTop = buttonRect.bottom + dp(67);
            paint.setTextAlign(Paint.Align.LEFT);
            paint.setTypeface(Typeface.create("sans-serif", Typeface.BOLD));
            paint.setTextSize(dp(13));
            paint.setColor(text);
            canvas.drawText("7 DERNIERS JOURS", side, historyTop, paint);

            drawHistory(canvas, side, historyTop + dp(27), w - side * 2);

            paint.setTextAlign(Paint.Align.CENTER);
            paint.setTypeface(Typeface.create("sans-serif", Typeface.NORMAL));
            paint.setTextSize(dp(10.5f));
            paint.setColor(Color.rgb(116, 117, 139));
            canvas.drawText("Données stockées uniquement sur cet appareil", centerX, h - dp(24), paint);

            drawParticles(canvas);
        }

        private void drawStatCard(Canvas canvas, float x, float y, float width, float height, String label, String value, int valueColor) {
            RectF r = new RectF(x, y, x + width, y + height);
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(card);
            canvas.drawRoundRect(r, dp(18), dp(18), paint);

            strokePaint.setStyle(Paint.Style.STROKE);
            strokePaint.setStrokeWidth(dp(1));
            strokePaint.setColor(cardBorder);
            canvas.drawRoundRect(r, dp(18), dp(18), strokePaint);

            paint.setTextAlign(Paint.Align.LEFT);
            paint.setTypeface(Typeface.create("sans-serif", Typeface.BOLD));
            paint.setTextSize(dp(10));
            paint.setColor(muted);
            canvas.drawText(label, x + dp(16), y + dp(25), paint);

            paint.setTextSize(dp(24));
            paint.setColor(valueColor);
            canvas.drawText(value, x + dp(16), y + dp(57), paint);
        }

        private void drawHistory(Canvas canvas, float x, float y, float width) {
            float step = width / 7f;
            Calendar c = Calendar.getInstance();
            c.add(Calendar.DAY_OF_YEAR, -6);
            String today = todayKey();

            for (int i = 0; i < 7; i++) {
                String date = key(c);
                boolean done = history.contains(date);
                boolean isToday = date.equals(today);
                float cx = x + step * i + step / 2f;
                float cy = y + dp(19);

                paint.setStyle(Paint.Style.FILL);
                paint.setColor(done ? accent2 : Color.rgb(43, 44, 64));
                canvas.drawCircle(cx, cy, dp(11), paint);

                strokePaint.setStyle(Paint.Style.STROKE);
                strokePaint.setStrokeWidth(isToday ? dp(2) : dp(1));
                strokePaint.setColor(isToday ? accent : cardBorder);
                canvas.drawCircle(cx, cy, isToday ? dp(15) : dp(12), strokePaint);

                if (done) {
                    paint.setColor(bgTop);
                    paint.setStyle(Paint.Style.FILL);
                    paint.setStrokeWidth(dp(2));
                    paint.setStrokeCap(Paint.Cap.ROUND);
                    canvas.drawRect(cx - dp(1.5f), cy - dp(5), cx + dp(1.5f), cy + dp(5), paint);
                    canvas.drawRect(cx - dp(5), cy - dp(1.5f), cx + dp(5), cy + dp(1.5f), paint);
                }

                String label = dayFormat.format(c.getTime()).replace(".", "").toUpperCase(Locale.FRENCH);
                if (label.length() > 3) label = label.substring(0, 3);
                paint.setTextAlign(Paint.Align.CENTER);
                paint.setTypeface(Typeface.create("sans-serif", isToday ? Typeface.BOLD : Typeface.NORMAL));
                paint.setTextSize(dp(9.5f));
                paint.setColor(isToday ? text : muted);
                canvas.drawText(label, cx, y + dp(51), paint);

                c.add(Calendar.DAY_OF_YEAR, 1);
            }
        }

        private void drawParticles(Canvas canvas) {
            if (particles.isEmpty()) return;
            long now = System.nanoTime();
            float dt = lastFrameTime == 0 ? 0.016f : Math.min(0.032f, (now - lastFrameTime) / 1_000_000_000f);
            lastFrameTime = now;

            for (int i = particles.size() - 1; i >= 0; i--) {
                Particle p = particles.get(i);
                p.life -= dt * 1.15f;
                if (p.life <= 0) {
                    particles.remove(i);
                    continue;
                }
                p.vy += dp(410) * dt;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                paint.setStyle(Paint.Style.FILL);
                paint.setColor(withAlpha(p.color, (int) (255 * Math.min(1f, p.life))));
                canvas.drawCircle(p.x, p.y, p.size * Math.max(0.35f, p.life), paint);
            }

            if (!particles.isEmpty()) postInvalidateOnAnimation();
        }

        private int withAlpha(int color, int alpha) {
            return Color.argb(Math.max(0, Math.min(255, alpha)), Color.red(color), Color.green(color), Color.blue(color));
        }

        private void drawCentered(Canvas canvas, String value, float x, float centerY, Paint p) {
            Paint.FontMetrics fm = p.getFontMetrics();
            float baseline = centerY - (fm.ascent + fm.descent) / 2f;
            canvas.drawText(value, x, baseline, p);
        }

        @Override
        public boolean onTouchEvent(MotionEvent event) {
            float x = event.getX();
            float y = event.getY();
            switch (event.getActionMasked()) {
                case MotionEvent.ACTION_DOWN:
                    pressed = !claimedToday && buttonRect.contains(x, y);
                    if (pressed) invalidate();
                    return true;
                case MotionEvent.ACTION_MOVE:
                    if (pressed && !buttonRect.contains(x, y)) {
                        pressed = false;
                        invalidate();
                    }
                    return true;
                case MotionEvent.ACTION_UP:
                    boolean shouldClaim = pressed && buttonRect.contains(x, y) && !claimedToday;
                    pressed = false;
                    if (shouldClaim) claimPoint();
                    else invalidate();
                    return true;
                case MotionEvent.ACTION_CANCEL:
                    pressed = false;
                    invalidate();
                    return true;
                default:
                    return true;
            }
        }

        private static final class Particle {
            float x;
            float y;
            float vx;
            float vy;
            float life;
            float size;
            int color;
        }
    }
}
