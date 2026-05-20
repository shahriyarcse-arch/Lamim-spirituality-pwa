# Lamim — Complete Technical Architecture & Feature Workflow

This document provides a highly detailed, module-by-module breakdown of every feature within the Lamim application, explaining the exact logic, workflows, and algorithms powering the app under the hood.

---

## 1. System Architecture & The "Sync Engine"
Lamim is built as an **Offline-First PWA**. This means the application completely assumes the user has no internet connection, ensuring a 0ms UI response time.

### 1.1 The DB Abstraction (`db.js`)
Instead of calling `localStorage` directly, all features use the `DB` module.
* `DB.set(key, val)` and `DB.get(key)` handle automatic JSON serialization.
* It includes a safety net: if a `QuotaExceededError` occurs (localStorage is full), it safely catches it without crashing the app.

### 1.2 The Offline Sync Queue (`sync.js`)
When a user clicks "Complete" on a prayer or habit, the following workflow triggers:
1. **Local Save:** `DB.set()` updates the local interface instantly.
2. **Queueing:** The payload is pushed into an array called `lamim_sync_queue` in `localStorage`.
3. **Background Processing:** If the user has internet, `Sync.processQueue()` loops through the queue, sending data to Supabase. If successful, the item is popped from the queue. If it fails, it remains in the queue for the next retry.
4. **Poison-Pill Protection:** To prevent infinite sync freezes caused by corrupted data payloads, the queue tracker implements a strict 3-retry limit. If an item fails 3 times consecutively, it is dropped so the rest of the queue can successfully sync.

### 1.3 Supabase Client (`supabase-client.js`)
* **CDN Initialization:** Safe-guards client initialization by listening to CDN script load states.
* **Global Reference:** Sets up the `window.supabaseClient` instance using `SUPABASE_URL` and the public `SUPABASE_ANON_KEY`, enabling cloud sync and database communication.

### 1.4 Helper Utilities (`utils.js`)
Contains core logic helper routines used across all UI panels:
* **Time & Date Offsets:** `getOffsetDate()` and `todayStr()` implement the 3:00 AM Waking Day boundary.
* **Security Sanitization:** `escapeHTML(str)` filters text values before DOM injection to thwart XSS attacks.
* **Islamic Lunar Math:** `toHijri(date)` handles the conversion of solar Julian days to Islamic Hijri calendars with dynamic offsets.
* **Solar Geometry Calculation:** `calcPrayerTimes()` evaluates solar noon, twilight declination, and shadow length to output accurate Fajr, Dhuhr, Asr (Hanafi), Maghrib, and Isha times, leveraging a 60-second caching wrapper.
* **UI Interactions:** Custom non-blocking glassmorphic alert notifications (`toast()`) and confirmations (`confirm()`).

---

## 2. Authentication Flow (`auth.js`)
* **Login/Signup:** Uses `supabase.auth.signInWithPassword`.
* **Event Interception:** `auth.js` listens to `onAuthStateChange`. When a user logs in, it triggers a system-wide UI refresh (`App.initAll()`).
* **Self-Healing Profiles:** Sometimes, due to Row Level Security (RLS) delays or network drops during signup, a user is authenticated but their row in the `profiles` table fails to create. `auth.js` detects this and automatically triggers an `upsert` recovery command to "heal" the profile, preventing the app from crashing.

---

## 3. Module Breakdown & Internal Workflows

### 3.0 `app.js` (The Router & Bootstrapper)
The entry point of the application. It handles:
* **Splash Screen Boot Sequence:** Renders a cinematic splash screen while the app asynchronously bootstraps the `DB`, reconciles theme preferences, and prepares the DOM.
* **SPA Routing:** Manages Single Page Application transitions (`App.navigateTo()`).
* **Service Worker Registration:** Bootstraps the PWA capabilities.
* **Version Tracking:** Forces a hard cache reset if a specific cache flag (e.g., `lamim_cache_cleared_v33`) is absent, acting as an aggressive recovery mechanism.

### 3.1 Home Dashboard (`home.js`)
* **Realtime Clock:** Uses `requestAnimationFrame` (instead of `setInterval`) to render the current time and live countdown to the next prayer, guaranteeing zero UI lag.
* **Greeting Logic:** Calculates the time of day and parses the user's name to extract their last name, strictly rendering it through `Utils.escapeHTML()` to prevent XSS.
* **Spirit Pulse:** Reads the globally cached `Analysis.calculateSHS()` object to determine the user's spiritual rank and colors the animated pulse on the home screen accordingly.

### 3.2 Salah Tracker & Math (`salah.js`)
* **Trigonometric Math:** Prayer times are calculated dynamically based on the user's latitude/longitude using complex sun-angle math. To prevent CPU throttling, `Utils.calcPrayerTimes()` caches its math output for 60 seconds.
* **Heatmap Matrix:** The module fetches the last 21 days (3 weeks) of prayer logs from `DB`. It maps these to a glassmorphic grid. Colors range from deep violet (missed) to bright gold (all 5 Jama'at), providing instant visual feedback.
* **Ring Charts:** The daily progress wheel is rendered using custom SVG `<circle>` calculations. The `stroke-dashoffset` is dynamically updated based on completion percentage.

### 3.3 Dhikr Counter (`dhikr.js`)
* **Tap Logic:** A massive, screen-centered button responds to clicks/touches. It triggers CSS ripple animations and plays a subtle haptic feedback vibration (if supported by the device).
* **Presets:** Users can switch between "Subhanallah", "Alhamdulillah", etc. Switching presets resets the current active count but commits the previous count to the daily total.

### 3.4 Mujahid / Habit Forge (`mujahid.js`)
The most complex module in the app, designed for breaking bad habits.
* **State Machine:** Habits track a `startDate`. If a user fails, they click "Relapse". This resets the `startDate` to `Date.now()`, clearing their streak but logging the failure in a historical array.
* **Badge Unlock Logic:** An algorithm checks the difference between `startDate` and `now`. If the user passes specific thresholds (e.g., 7 days, 30 days), the UI unlocks premium glassmorphic badges.
* **Breathing Exercise:** Uses advanced CSS `@keyframes` chained with JavaScript `setTimeout` to guide the user through a 4-7-8 breathing technique (Inhale, Hold, Exhale) to combat sudden urges.

### 3.5 Nafl Tracker & The "3 AM Logic"
Tracking night prayers (Tahajjud/Witr) presents a unique timezone problem. If a user prays Tahajjud at 2:00 AM on Tuesday, technically it is Tuesday, but Islamically it belongs to Monday night.
* **The Workflow:** The system uses `Utils.getOffsetDate()`, which subtracts 3 hours from the current clock time. Thus, anything logged before 3:00 AM is saved under the previous day's date string.
* **Radio Locks:** Once a user selects their Sunnah or Witr configuration for a day, the UI locks the radio buttons, preventing accidental overrides.

### 3.6 Global Vanguard Leaderboard (`leaderboard.js`)
* **Scoring:** Ranks users based on their `spirit_score`.
* **True Rank Algorithm (Ties):** If two users have 150 points, they both receive Rank #1. The next user with 140 points receives Rank #3. The logic handles this array sorting dynamically before rendering.
* **XSS Fallback:** User avatars are rendered via `<img src="..." onerror="...">`. If an avatar is missing or malicious, it falls back to an inline `<svg>` generating an initial-based avatar dynamically using the user's name string (which is sanitized via `escapeHTML`).

### 3.7 Smart Finance Engine (`finance.js`)
* **Smart Ledger:** A highly optimized engine tracking income and expenses across a 220+ master category database, with distinct visual icons and categorized sections (Bazar, Household, Transport, etc.).
* **Dynamic Analytics:** Calculates rolling monthly summaries and total net balances, dynamically adapting between local currencies (BDT/USD) using a live conversion rate logic.
* **Savings Vaults:** Goal-based savings system using high-contrast, multi-stop CSS gradient progress bars. When users reach 100%, the UI dynamically shifts to a radiant gold "completed" state.
* **Automated Statements (PDF):** The module features a built-in PDF generator that instantly outputs beautifully styled, chronological HTML-to-print financial statements for the selected month, complete with cyber-seals and metadata.

### 3.8 Goals & Sunnah (`goals.js`)
* **Boolean Checklist:** Renders a list of daily Sunnahs (e.g., "Read Surah Mulk").
* **History Tracker:** When the day ends (post-3 AM), the exact boolean states are bundled and pushed into a 30-day history array.

### 3.9 Analysis Engine (`analysis.js`)
* **The SHS Formula:** The Spirit Health Score is a weighted calculation of the entire app:
  * Salah completion = 40%
  * Nafl completion = 20%
  * Dhikr totals = 15%
  * Mujahid streaks = 15%
  * Goals = 10%
* **Rank Assignment:** Based on the final calculated score (0-100), a `switch/if` statement assigns a title: *Ghafil, Musafir, Murid, Mujahid, Mukhlis, Muttaqi, Muhsin,* or *Wali*. This score is synced back to Supabase to position the user on the Leaderboard.

### 3.10 Profile & Settings (`profile.js`)
* **Avatar & Meta:** Handles updating the user's display name and avatar (either custom URL or generated SVGs).
* **Personal Dashboard:** Renders a focused view of the user's specific lifetime statistics (total prayers, total dhikr, current rank).
* **Theme Engine:** Interacts with the global settings object to toggle between Dark Mode and Light Mode. The `index.html` `<head>` executes a blocking script to read `localStorage` and apply `data-theme` instantly before body paint to prevent flash-of-unstyled-content (FOUC).

### 3.11 Notifications Engine (`notifications.js` & `prayer-notifier.js`)
* **In-App Alerts:** A custom toast/notification engine that renders beautiful, auto-dismissing glassmorphic alerts for streaks, level-ups, and admin broadcasts.
* **Queueing:** Prevents notification spam by queueing multiple alerts and displaying them sequentially.
* **Doze-Mode Resilient Prayer Alerts:** A background polling module (`PrayerNotifier`) checks the sun-math arrays every 30 seconds. To survive Android "Doze" / iOS Deep Sleep mechanics, it uses a time-window threshold (0-120 seconds). If the device wakes up momentarily within 2 minutes of the prayer time, it immediately pushes the Service Worker Push Notification.

### 3.12 Calendar Core (`hijri.js`)
* **Astronomical Approximation:** Uses standard algorithms to convert the Gregorian date to the Hijri (Islamic) lunar calendar.
* **Offset Adjustments:** Allows for ±1 day adjustments depending on local moon sightings, syncing perfectly with the `home.js` dashboard display.

### 3.13 Sanctum Admin Panel (`admin.js`)
* **Parallel Loading:** Uses `Promise.allSettled` to fetch the user list, auth status, and storage status concurrently, mapping the latency to generate a "System Health API ms" metric.
* **Realtime Presence:** Listens to a custom `lamim:presence-updated` event dispatched by `sync.js` to render green "Online" dots next to active users in real-time.
* **Broadcasts:** Admins can compose a message. The payload is inserted into the `app_broadcasts` table in Supabase. Supabase Realtime immediately blasts this payload to all connected clients, rendering an in-app notification instantly.

---

## 4. Supabase Database Schema

To fully deploy Lamim, the following tables must be instantiated in your Supabase project:
* `profiles`: Stores `id` (UUID), `name`, `email`, `avatar`, `role`, `spirit_score`, `spirit_level`, and `last_active`.
* `app_broadcasts`: Stores `id`, `message`, `admin_email`, and `created_at`.
* `user_data`: (Optional depending on how you structure raw JSON syncs, but standard for backing up the raw `localStorage` dump).

All tables must have RLS enabled.

---

## 5. Progressive Web App (PWA) Mechanics

* **Web App Manifest:** The `manifest.json` is configured with `display: "standalone"`, meaning when a user installs Lamim on their phone, it runs entirely without browser UI (no URL bar), feeling exactly like a native app.
* **A2HS (Add to Home Screen):** The app supports automatic browser prompts to install the application locally.
* **Vector Assets:** The icon is mapped to `assets/icon.svg`, providing infinitely scalable resolution on any device screen.

---

## 6. Security & Error Handling

* **Row Level Security (RLS):** 
  * All Postgres tables require `auth.uid() = user_id`.
  * The Admin panel bypasses this using an advanced `SECURITY DEFINER` SQL function `is_admin()`, completely preventing infinite recursion bugs.
* **Cross-Site Scripting (XSS) & Auto-Translation:** 
  * Any data pulled from Supabase (names, emails, broadcast texts) that is injected into `innerHTML` is first passed through `Utils.escapeHTML()`. This converts dangerous tags like `<script>` into safe strings like `&lt;script&gt;`.
  * The App uses a `MutationObserver` for real-time Bengali translation. To prevent DOM corruption, the observer explicitly blacklists `<svg>`, `INPUT`, `TEXTAREA`, and `<script>` nodes, ensuring numbers inside SVG `viewBox` coordinates are not accidentally translated into Bengali strings, which would break the graphics engine.
* **Service Worker Caching:** 
  * `sw.js` uses a `Network-First` with a 1.5s Timeout strategy for HTML navigation and local assets. It provides blazing-fast offline support while guaranteeing that online users always receive real-time UI patches within 1.5 seconds.

---

## 7. Development Utilities (`.scripts/`)

During the development phase, several Node.js utility scripts were created to maintain code hygiene. These are safely tucked away in the hidden `.scripts/` directory and are not deployed to production:
* `cleanup_css.js` / `split_css.js`: Used to modularize the massive legacy CSS file into the current 29 highly-focused CSS modules.
* `find_duplicates.js`: Scans the CSS tree to prevent duplicate class declarations.
* `supabase_security.sql`: The raw SQL queries required to establish the RLS security policies on a fresh Supabase instance.
