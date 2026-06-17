# Lamim — Complete Technical Architecture & Feature Workflow (v4.1.0)

This document provides a highly detailed, module-by-module breakdown of every feature within the Lamim application, explaining the exact logic, workflows, and algorithms powering the app under the hood.

---

## 1. System Architecture & Storage Infrastructure
Lamim is built as a pure **Offline-First PWA**. The application runs entirely client-side with zero external cloud dependencies, ensuring 100% data privacy and 0ms response times.

### 1.1 The DB Abstraction (`db.js`)
To bypass the browser's 5MB `localStorage` limit, Lamim uses an **IndexedDB-backed Storage Engine** with a synchronous caching layer.
* **Synchronous RAM Cache (`DB._cache`)**: Upon initialization, all key-value pairs from the `lamim_db` IndexedDB database are loaded into RAM. All read operations (`DB.get()`, `DB.rawGet()`) read directly from this cache in 0.001ms, preventing UI freezes.
* **Asynchronous Disk Writes**: Writes (`DB.set()`, `DB.rawSet()`) write immediately to the RAM cache and schedule an asynchronous write to IndexedDB in a non-blocking background thread.
* **Auto-Migration**: On first boot, the system automatically detects legacy `localStorage` keys starting with `lamim_`, transfers them to IndexedDB, and purges the old `localStorage` items.
* **Quota Management & Fallbacks**: If IndexedDB fails to initialize or hits a strict browser quota (e.g. disk space limit), it falls back gracefully to `localStorage` and alerts the user via a toast.

### 1.2 Helper Utilities (`utils.js`)
Contains core logic helper routines used across all UI panels:
* **Dynamic Script Loader (`loadScript(url)`)**: Loads third-party CDN libraries asynchronously and returns a promise. Used to defer loading heavy assets like Chart.js and html2pdf.js.
* **Time & Date Offsets**: `getOffsetDate()` and `todayStr()` implement the 3:00 AM Waking Day boundary.
* **Security Sanitization**: `escapeHTML(str)` filters text values before DOM injection to thwart XSS attacks.
* **Islamic Lunar Math**: `toHijri(date)` handles the conversion of solar Gregorian days to Islamic Hijri calendars with dynamic offsets.
* **Solar Geometry Calculation**: `calcPrayerTimes()` evaluates solar noon, twilight declination, and shadow length to output accurate Fajr, Dhuhr, Asr (Hanafi), Maghrib, and Isha times, leveraging a 60-second caching wrapper to minimize CPU usage.

---

## 2. Speed Optimization & Lazy Loading

To optimize page load times, Lamim implements a **dynamic lazy-loading script system**:
* **Chart.js (Finance)**: The massive Chart.js library is not loaded on initial boot. Instead, when the user visits the Finance tab, `Finance.initChart()` checks for `Chart`. If missing, it overlays a blurred loader on the container, triggers `Utils.loadScript()`, and renders the line chart upon completion.
* **html2pdf.js (Analysis)**: The PDF export library is loaded only when the user clicks the "Export Statement" button in the Analysis dashboard. This deferment reduces initial bandwidth and parse time.

---

## 3. Module Breakdown & Internal Workflows

### 3.0 `app.js` (The Router & Bootstrapper)
The entry point of the application. It handles:
* **Boot Sequence**: Initializes the database cache (`await DB.init()`), loads global language settings, and clears the splash screen.
* **SPA Routing**: Manages Single Page Application transitions (`App.navigateTo()`).
* **Auto-Backup Reminder**: Every 30 days, `checkBackupReminder()` prompts the user with a confirmation modal to download a JSON backup file of their local data. To keep a clean user experience, the prompt only triggers once per browser session.
* **Safety Fallback**: A safety timer (8000ms) guarantees the splash screen hides and routes to the dashboard/setup even if a script takes abnormally long to load.

### 3.1 Home Dashboard (`home.js`)
* **Realtime Clock**: Uses `requestAnimationFrame` (instead of `setInterval`) to render the current time and live countdown to the next prayer, guaranteeing zero UI lag.
* **Spirit Pulse**: Reads the globally cached `Analysis.calculateSHS()` object to determine the user's spiritual rank and colors the animated pulse on the home screen accordingly.

### 3.2 Salah Tracker & Math (`salah.js`)
* **Heatmap Matrix**: Fetches the last 21 days (3 weeks) of prayer logs from `DB` and maps them to a glassmorphic grid, coloring from deep violet (missed) to bright gold (all 5 Jama'at).
* **Progress Ring**: Renders daily completion status via custom SVG `<circle>` calculations.

### 3.3 Dhikr Counter (`dhikr.js`)
* **Tap Logic**: Centered screen tap button triggers CSS ripple animations and plays a subtle haptic feedback vibration (`navigator.vibrate(25)`) to replicate physical Tasbeeh beads.

### 3.4 Mujahid / Habit Forge (`mujahid.js`)
Designed for tracking bad habits and maintaining clean streaks.
* **Streak Calculator**: Measures the difference between `startDate` and the current date to unlock progressive glassmorphic badges.
* **Guided Breathing**: Chained CSS animations guide the user through a 4-7-8 breathing technique (Inhale, Hold, Exhale) to combat sudden urges.

### 3.5 Nafl Tracker & The "3 AM Logic"
* **The 3:00 AM Rollover**: Islamically, night prayers (Tahajjud/Witr) logged after midnight belong to the previous waking day. The system uses `Utils.getOffsetDate()` (subtracting 3 hours from the clock) to file logs under the correct calendar day.

### 3.6 Smart Finance Engine (`finance.js`)
* **Smart Ledger**: Categorizes transaction logs into 220+ categories with monthly rollups and vaults.
* **Savings Vaults**: Progress indicator bars utilizing multi-stop CSS gradient styling that transitions to glowing gold at 100% completion.

### 3.7 Goals & Sunnah (`goals.js`)
* **Boolean checklist**: Renders a list of daily spiritual habits which are logged, bundled, and preserved for a rolling 30-day window.

### 3.8 Analysis Engine (`analysis.js`)
* **The SHS Formula**: Evaluates the user's spiritual health using a weighted index:
  * Salah completion = 40%
  * Nafl completion = 20%
  * Dhikr totals = 15%
  * Mujahid streaks = 15%
  * Goals = 10%
* **Rank Assignment**: Assigns an Islamic spiritual title (*Ghafil, Musafir, Murid, Mujahid, Mukhlis, Muttaqi, Muhsin,* or *Wali*) depending on the score.

### 3.9 Profile & Settings (`profile.js`)
* **Local Data Management**: Allows updating names, bios, and profile pictures (supporting client-side compression to minimize database/storage foot-print).
* **Backup Export/Import**: Provides full JSON export (`Profile.exportData()`) and restoration. Successfully exporting manually updates the `lastBackupDate` timestamp, resetting the 30-day auto-backup timer.

### 3.10 Notification Dispatcher (`prayer-notifier.js`)
* **Doze-Mode Resilience**: A background polling routine checks the local sun-math array every 30 seconds. Uses a 120-second time-window check so that if a device wakes up momentarily within 2 minutes of the prayer time, it immediately pushes the service worker notification.

---

## 4. Progressive Web App (PWA) Mechanics

* **Standalone Display**: The `manifest.json` specifies `display: "standalone"`, forcing the app to run without browser URL address bars on mobile.
* **Service Worker Caching**: `sw.js` uses a `Network-First` with a 1.5s Timeout strategy for page HTML navigation and assets. This ensures prompt offline functionality while fetching new builds seamlessly within 1.5 seconds when an internet connection is active.
