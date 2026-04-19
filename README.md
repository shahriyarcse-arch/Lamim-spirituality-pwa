1# Lamim - Islamic Lifestyle & Productivity App

Lamim is a premium, fully responsive, and comprehensive Islamic lifestyle dashboard. Built completely with Vanilla HTML, CSS, and JS, it provides an all-in-one suite of tools for daily prayers, dhikr, goal tracking, and Islamic finance.

## 🚀 Key Features

*   **Secure Authentication System**: Sleek Login, Signup, and Password Reset screens with real-time field validation, smooth animations, and a polished Google Auth layout.
*   **Smart Dashboard Home**: Features a responsive top header with a live-updating clock, synchronized multi-calendar dates (Gregorian, Bangla Native, and Hijri), and personalized greetings.
*   **Salah (Prayer) Tracker**: 
    *   Live countdown to the next prayer.
    *   Daily completion ring-chart (SVGs dynamically generated via JS).
    *   A 3-week interactive GitHub-style heatmap to track prayer consistency.
*   **Dhikr (Tasbeeh) Counter**: 
    *   Premium glowing tap button with ripple animations.
    *   Dhikr presets (Subhanallah, Alhamdulillah, Allahu Akbar).
    *   Streak tracking and daily completion targets.
*   **Habits & Islamic Finance**: Complete modules for tracking Akhlaq (habits) and Zakat/Sadaqah (finance).
*   **Offline Ready**: Integrates a `manifest.json` and Service Worker (`sw.js`) allowing the app to be installed as a PWA (Progressive Web App).

## 🎨 Design System (Premium Glassmorphism)

The entire application underwent a comprehensive UI/UX overhaul to implement a "State-of-the-Art Dark Glassmorphic" aesthetic:
*   **Colors**: Deep, rich dark backgrounds (`#0a0a0f`) highlighted by vibrant, high-contrast violet, purple, and gold gradient accents.
*   **Glassmorphism**: Extensive use of `backdrop-filter: blur(20px)` and semi-transparent RGBA backgrounds (`rgba(255,255,255,0.05)`) to create a frosted glass effect on all cards, modals, sidebars, and banners.
*   **Typography**: Clean `Inter` sans-serif fonts for the UI, with beautiful `Amiri` serif fonts for Arabic Quranic quotes.
*   **Micro-Animations**: Custom CSS animations (`fadeInUp`, pulse, gradient shifts) ensure the UI feels alive and highly interactive.

## 📱 100% Responsive Architecture

The project guarantees flawless rendering across all devices (Desktop, Tablet, Mobile) through a strict responsive scaling system:

1.  **Fluid Grids**: Implementation of CSS Grid with `repeat(auto-fit, minmax(X, 1fr))` ensures elements like Quick Actions, Dhikr Presets, and Goal cards organically adapt to the exact width of the screen.
2.  **Adaptive Flex Layouts**: 
    *   Strict `flex-wrap` properties ensure tight modules (like the Salah Ring Chart) intelligently stack vertically on narrow viewports rather than bursting horizontally.
    *   Main navigation tabs feature hidden scrollbars (`overflow-x: auto`), allowing users to smoothly swipe through options on mobile devices.
3.  **Synchronized Breakpoints**: Media queries precisely control container padding across `1024px`, `768px`, and `480px` widths. Mobile Topbars and containers dynamically calculate negative margins using `calc()` formulas to perfectly lock onto the screen edges without causing horizontal layout overflow.
4.  **Smart Typography & String Truncation**: 
    *   Large headings scale down smoothly via media queries.
    *   Long greeting strings are allowed to wrap.
    *   Date strings dynamically shorten (e.g., `Saturday, April 18` -> `Apr 18`) exclusively when a mobile viewport is detected, maximizing critical screen real estate.

## 🛠 Tech Stack

*   **Structure**: Semantic HTML5.
*   **Styling**: Pure, modular Vanilla CSS3 (Custom Properties/Variables, Flexbox, Grid, Keyframes).
*   **Logic**: ES6+ Vanilla JavaScript.
*   **Storage**: LocalStorage (`DB` module) for persistent offline state.

---
*Created and maintained with ❤️ for the Ummah.*
