# SPORT2 — Premium Football Streaming Web Application

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpiustech1%2Fballive)

A modern, responsive, high-performance football streaming web application. **SPORT2** strictly preserves the visual reference from the top navigation through the live match cards on mobile, while completely redesigning everything below into a state-of-the-art match discovery and streaming interface with a purpose-built desktop widescreen experience.

---

## 🚀 1-Click Vercel Deployment

Deploy directly to Vercel with continuous deployment enabled:

👉 **[Deploy to Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpiustech1%2Fballive)**

The project includes:
- **`vercel.json`**: SPA client routing rewrites + serverless Python routing
- **`api/index.py`**: Auto-configured Python serverless runtime
- Auto-detected production origin for seamless live streaming APIs

---

## ⚽ Features

- **Visual Reference Preserved**:
  - Minimal top navigation with left hamburger menu, centered **SPORT2** branding, and search button.
  - Horizontally scrollable **Live Matches** cards matching screenshot colorways (Electric Royal Blue, Clean Off-White / Silver, Coral Red, Violet, Emerald).
- **Match Discovery (Redesigned Below Live Matches)**:
  - **Spotlight Marquee Banner**: Match of the week with 4K broadcast tag.
  - **24/7 Live Sports TV Channels**: SuperSport, Sky Sports Premier League, TNT Sports, Azam Sports, and beIN Sports.
  - **Interactive Date Strip**: "🔴 Live" filter badge, today, yesterday, tomorrow, and calendar date picker.
  - **Competition Filters**: Champions League, Premier League, LaLiga, Serie A, Bundesliga, Ligue 1.
  - **Fixtures Feed**: Local kickoff times, live scores, and browser reminder notifications.
- **Match Watching Experience (`/match/:id`)**:
  - 16:9 responsive video player with HLS (`hls.js`) multi-bitrate streaming.
  - Stream source angle switcher & quality selector (1080p 60fps, 720p, 480p, Auto).
  - Interactive Goal FX confetti celebrations.
  - Live scoreboard, match clock, referee, venue.
  - **Timeline Events**, **Live Stats Comparison Bars**, **2D Tactical Football Pitch Lineups**, **Head-to-Head**, and **Official Broadcasters**.
- **Responsive Layout**:
  - Mobile: Smooth navigation drawer + 5-tab bottom navigation bar.
  - Desktop: Left navigation sidebar + right-side live stream preview and standings panel.

---

## 🛠️ Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Run Python Streaming Backend
```bash
npm run server
# Runs on http://127.0.0.1:8080
```

### 3. Run Vite Frontend
```bash
npm run dev
# Runs on http://127.0.0.1:5173
```

### 4. Build for Production
```bash
npm run build
```
