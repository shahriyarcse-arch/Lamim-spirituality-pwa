# Lamim — Complete Islamic Lifestyle PWA

Lamim is a premium, fully responsive, offline-first Islamic lifestyle dashboard. Built with a Vanilla JS frontend and a Supabase backend, it provides an enterprise-grade suite of tools for daily prayers, dhikr, goal tracking, habit forging, and global leaderboards.

![Lamim UI Overview](assets/icon.svg)

## 🚀 Key Features

* **Offline-First Architecture**: Log prayers or habits offline. The custom sync engine queues all actions and syncs to the cloud the second you regain connection.
* **Global Vanguard Leaderboard**: Compete with Muslims globally based on a dynamically calculated "Spirit Score".
* **Sanctum Admin Panel**: A beautifully designed, RLS-protected admin console to view active users, monitor system health metrics, manage access roles, export CSVs, and send real-time broadcast announcements.
* **Smart Finance Ledger**: Track income and expenses across 220+ master categories. Includes dynamic monthly summaries, visual transaction timelines, and auto-generated PDF Statement exports.
* **Savings Vaults**: Create goal-based savings vaults with high-contrast, percentage-based visual progression bars and dynamic milestones.
* **Salah (Prayer) Tracker**: 
    * Live countdown to the next prayer using sun-angle math.
    * A 3-week interactive heatmap with tiered, glassmorphic visual feedback.
* **Dhikr (Tasbeeh) Counter**: Premium glowing tap button with ripple animations and streak tracking.
* **Mujahid (Habit Forge)**: A robust module for tracking habits, logging relapses, earning progression badges, and guided breathing exercises.
* **Nafl Salah (Optional Prayers)**: Track Sunnah Muakkadah, Tahajjud, and Witr with a custom 3 AM "Waking Day" boundary logic.

## 🔒 Enterprise-Grade Security
* **Supabase Authentication**: Secure login, signup, and password recovery flows with "Self-Healing" profile generation.
* **Row Level Security (RLS)**: PostgreSQL policies ensure that users can only access their own data, and only verified Admins can trigger system broadcasts.
* **XSS Fortified**: Every piece of user-generated content is strictly sanitized via a global HTML escaper before rendering to the DOM.

## 🎨 Design System (Premium Glassmorphism)

The application features a "State-of-the-Art Dark Glassmorphic" aesthetic:
* **Glassmorphism**: Extensive use of `backdrop-filter: blur(20px)` to create a frosted glass effect on cards, modals, sidebars, and banners.
* **Micro-Animations**: Custom CSS animations (`fadeInUp`, pulse, gradient shifts) ensure the UI feels alive.
* **Responsive**: Fluid CSS Grid and Flexbox logic guarantees flawless rendering across Mobile, Tablet, and Desktop.

## 🛠 Tech Stack

* **Frontend**: Pure Vanilla HTML5, CSS3, ES6+ JavaScript. No bundlers (Vite/Webpack) required.
* **Backend**: Supabase (PostgreSQL, Auth, Realtime).
* **PWA**: Custom Service Worker (`sw.js`) with a `Stale-While-Revalidate` caching strategy and a scalable Web App Manifest.

---

## 📖 Developer Documentation
For an in-depth look at how the routing, database abstraction, and sync queues work under the hood, please read the [DOCUMENTATION.md](DOCUMENTATION.md).

*Created and maintained with ❤️ for the Ummah.*
