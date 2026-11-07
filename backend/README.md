# Universal Sports & Movies Streaming Backend API

Universal REST API built for mobile apps (Flutter, React Native, Swift, Kotlin) and web apps. Serves live sports, 24/7 channels, upcoming fixtures, movies, and rewritten HLS playlists (`.m3u8`) with automatic header bypass.

---

## 🚀 1-Click 24/7 Cloud Deployment

Deploy this API directly to your preferred cloud provider for free:

| Provider | 1-Click Deploy Link | Free Tier Specs |
| :--- | :--- | :--- |
| **Render** | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/piustech1/sports-streaming-api) | 100 GB/month bandwidth, Auto-HTTPS |
| **Koyeb** | [![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=git&repository=github.com/piustech1/sports-streaming-api&branch=main&name=sports-streaming-api) | 550 hours/month, global edge |
| **Railway** | [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/new) | \$5 monthly credit, instant Docker build |

---

## ⚡ Keeping Free Tier Alive 24/7 (Prevent Sleep)

Free hosting services (like Render) put inactive web services to sleep after 15 minutes of inactivity. To keep your API hot and responsive 24/7 with zero cold starts:

1. Go to [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com) (both 100% free).
2. Create an HTTP monitor/cron job targeting your live health URL:
   ```
   https://<your-deployed-subdomain>.onrender.com/health
   ```
3. Set the interval to **every 10 minutes**.
4. Your server will stay active 24 hours a day, 7 days a week!

---

## 📡 API Reference Endpoints

All endpoints support CORS (`*`) and return JSON.

### 1. System Health
- **`GET /health`** — Health check with server timestamp and active status.
- **`GET /`** — Sitemap listing all available routes.

### 2. Live Sports Matches
- **`GET /api/v1/sports/live`** — All current live sporting events (football, basketball, MMA, etc.).
- **`GET /api/v1/sports/live?category=football`** — Filter live matches by sport (football, basketball, mma, tennis, cricket).
- **`GET /api/v1/sports/live?search=Arsenal`** — Search for a specific team or match.

### 3. Upcoming Fixtures
- **`GET /api/v1/sports/upcoming`** — Upcoming match schedule with kickoff times and status (`UPCOMING`).

### 4. 24/7 TV Channels
- **`GET /api/v1/sports/channels`** — Combined unified list of all 24/7 sports networks:
  - **DaddyLive/Stremio:** SuperSport, Sky Sports, TNT HLS channels (`format: "HLS"`).
  - **TuloTv Direct:** Azam Sports 1–5, Bein Sports 1–3, TNT Sports 1–4, CBS Sports, Caze TV (`format: "DASH"` with pre-parsed `drm` ClearKeys).
- **`GET /api/v1/sports/channels?search=azam`** — Filter channels by name.
- **`GET /api/v1/sports/tulo/channels`** — Dedicated TuloTv DASH sports channels.
- **`GET /api/v1/sports/tulo/channel/<id>`** — Channel details with auto-resolved tokens (calls `get_intlive` on the fly for Azam Sports so tokens never expire).
- **`GET /api/v1/stream/tulo/<id>.mpd`** — Rewritten DASH manifest with embedded `<BaseURL>` for direct CDN segment playback.
- **`GET /api/v1/sports/premier-league`** — Instant direct stream for the active English Premier League broadcast.

### 5. Uganda Local TV & Shows (NBS Television)
- **`GET /api/v1/uganda/shows`** — Catalog of top Ugandan TV shows, political debates, and news playlists (NBS FrontLine, Live At 9, The Score, After 5, Morning Breeze, Amasengejje, Tamale Mirundi).
- **`GET /api/v1/sports/channels?search=nbs`** — Instant channel entry for NBS Television Uganda.

### 6. Movies & Series Catalog
- **`GET /api/v1/movies/latest`** — Latest Luganda dubbed & English translated movie catalog.
- **`GET /api/v1/movies/search?q=Avatar`** — Search movies by title.
- **`GET /api/v1/series/latest`** — Latest TV series catalog.

### 7. Universal HLS Stream Playback
- **`GET /api/v1/stream/sports/<id>.m3u8`** — Rewritten HLS playlist with anti-hotlink bypass for any match or channel.
- **`GET /api/v1/stream/movie/<id>.m3u8`** — Rewritten HLS playlist for any movie.
- **`GET /api/v1/relay/chunk?url=<quoted_url>`** — Video chunk streaming relay.

---

## 📱 Mobile App Integration

See [CLIENT_INTEGRATION.md](CLIENT_INTEGRATION.md) for full Flutter, React Native, and Android Kotlin sample code.
