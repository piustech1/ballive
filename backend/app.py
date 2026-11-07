#!/usr/bin/env python3
"""Universal Streaming App Backend API.

Production-ready backend API designed specifically to power mobile & web streaming apps
(Flutter, React Native, iOS, Android, Web).

Features:
- Live Sports Matches (Football, Basketball, MMA, Tennis, etc.)
- 24/7 Sports TV Channels (SuperSport, Sky Sports, TNT, beIN, etc.)
- Upcoming Fixtures Schedule with Kickoff Times
- Luganda Dubbed & Translated Movies & Series Catalog
- High-Performance In-Memory TTL Caching (reduces latency to <5ms)
- Universal .m3u8 Playback Endpoints (zero header configuration required on the mobile app)
"""

from typing import Any, Dict, List, Optional
import base64
import os
import re
import sys
import threading
import time
import urllib.parse
from flask import Flask, Response, jsonify, request, stream_with_context
from werkzeug.middleware.proxy_fix import ProxyFix
import requests

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

PORT = int(os.environ.get("PORT", 8080))
SPORTS_UPSTREAM = "https://dag.s-u.in"
MOVIES_UPSTREAM = "https://api.s-u.in"

UPSTREAM_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Linux; Android 14; Mobile) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
    ),
    "Origin": "https://s-u.in",
    "Referer": "https://s-u.in/",
    "Accept": "application/json, text/plain, */*",
}

# TuloTv Upstream Configuration
TULO_BOOTSTRAP_URL = "https://zyromod.com/TuloTv/bootstrap.json"
TULO_HEADERS = {
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 14; Mobile)",
    "Accept": "application/json, text/plain, */*",
}
STREAM_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Linux; Android 14; Mobile) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
    ),
    "Accept": "*/*",
}


def get_base_url() -> str:
    """Return public base URL, supporting PUBLIC_API_URL env and reverse proxies."""
    override = os.environ.get("PUBLIC_API_URL")
    if override:
        return override.rstrip("/")
    return request.host_url.rstrip("/")


def parse_clearkey(clear_key_str: Optional[str]) -> Optional[Dict[str, Any]]:
    """Parse hex 'key_id:key' into multi-platform ClearKey DRM configuration."""
    if not clear_key_str or ":" not in clear_key_str:
        return None
    try:
        kid_hex, k_hex = clear_key_str.split(":", 1)
        kid_hex = kid_hex.strip().lower()
        k_hex = k_hex.strip().lower()
        kid_b64 = base64.urlsafe_b64encode(bytes.fromhex(kid_hex)).decode().rstrip("=")
        k_b64 = base64.urlsafe_b64encode(bytes.fromhex(k_hex)).decode().rstrip("=")
        return {
            "type": "clearkey",
            "key_id": kid_hex,
            "key": k_hex,
            "string": f"{kid_hex}:{k_hex}",
            "shaka_keys": {kid_hex: k_hex},
            "jwk": {
                "keys": [
                    {
                        "kty": "oct",
                        "alg": "A128KW",
                        "kid": kid_b64,
                        "k": k_b64,
                    }
                ]
            },
        }
    except Exception:
        return {"type": "clearkey", "string": clear_key_str}


# -----------------------------------------------------------------------------
# High-Performance In-Memory Cache with TTL
# -----------------------------------------------------------------------------
class SimpleCache:
    def __init__(self):
        self._cache = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            if key in self._cache:
                val, expires_at = self._cache[key]
                if time.time() < expires_at:
                    return val
                del self._cache[key]
        return None

    def set(self, key: str, val: Any, ttl_seconds: int = 60):
        with self._lock:
            self._cache[key] = (val, time.time() + ttl_seconds)


cache = SimpleCache()


def fetch_tulo_channels() -> List[Dict[str, Any]]:
    """Fetch raw channel list from TuloTv bootstrap endpoint with caching."""
    cached = cache.get("tulo_raw_channels")
    if cached is not None:
        return cached

    try:
        r = requests.get(TULO_BOOTSTRAP_URL, headers=TULO_HEADERS, timeout=8)
        if r.status_code == 200:
            channels = r.json().get("channels", [])
            cache.set("tulo_raw_channels", channels, ttl_seconds=300)
            return channels
    except Exception as e:
        print(f"[Tulo bootstrap error]: {e}", file=sys.stderr)
    return []


def resolve_tulo_stream_url(stream_url: str) -> str:
    """Resolve dynamic token stream URL (e.g. Azam Sports get_intlive?X)."""
    if "get_intlive?" in stream_url:
        try:
            r = requests.get(stream_url, headers=TULO_HEADERS, timeout=6)
            if r.status_code == 200:
                data = r.json()
                if "stream_url" in data:
                    return data["stream_url"]
        except Exception as e:
            print(f"[Tulo stream resolve error]: {e}", file=sys.stderr)
    return stream_url


# -----------------------------------------------------------------------------
# CORS & Preflight Handling
# -----------------------------------------------------------------------------
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Range, Authorization"
    return response


@app.route("/<path:dummy>", methods=["OPTIONS"])
def handle_options(dummy):
    return "", 204


# -----------------------------------------------------------------------------
# String Normalization Helpers
# -----------------------------------------------------------------------------
def clean_match_title(name: str) -> str:
    if not name:
        return ""
    n = re.sub(r"^\s*🔴\s*LIVE:\s*", "", name, flags=re.IGNORECASE)
    n = re.sub(r"^\s*⏱️\s*", "", n)
    n = re.sub(r"^\s*📺\s*", "", n)
    return n.strip()


def parse_teams(title: str) -> Optional[Dict[str, str]]:
    clean = clean_match_title(title)
    parts = re.split(r"\s+vs\.?\s+", clean, maxsplit=1, flags=re.IGNORECASE)
    if len(parts) == 2:
        return {"home": parts[0].strip(), "away": parts[1].strip()}
    return None


# -----------------------------------------------------------------------------
# System & Health
# -----------------------------------------------------------------------------
@app.route("/", methods=["GET"])
def index():
    host = get_base_url()
    return jsonify(
        {
            "name": "Universal Streaming App Backend API",
            "version": "1.0.0",
            "status": "online",
            "endpoints": {
                "health": f"{host}/health",
                "live_sports": f"{host}/api/v1/sports/live",
                "upcoming_sports": f"{host}/api/v1/sports/upcoming",
                "sports_channels": f"{host}/api/v1/sports/channels",
                "tulo_sports_channels": f"{host}/api/v1/sports/tulo/channels",
                "tulo_channel_detail": f"{host}/api/v1/sports/tulo/channel/CH-0007",
                "tulo_stream_sample": f"{host}/api/v1/stream/tulo/CH-0007.mpd",
                "premier_league": f"{host}/api/v1/sports/premier-league",
                "uganda_shows": f"{host}/api/v1/uganda/shows",
                "movies_catalog": f"{host}/api/v1/movies/latest",
                "movie_search": f"{host}/api/v1/movies/search?q=action",
                "series_catalog": f"{host}/api/v1/series/latest",
            },
            "docs": f"{host}/docs",
        }
    )


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "timestamp": int(time.time())})


# -----------------------------------------------------------------------------
# SPORTS: 1. Live Matches
# -----------------------------------------------------------------------------
@app.route("/api/v1/sports/live", methods=["GET"])
def get_live_sports():
    genre = request.args.get("genre", "").strip()
    limit = request.args.get("limit", type=int)
    cache_key = f"sports_live_{genre}_{limit}"

    cached = cache.get(cache_key)
    if cached is not None:
        return jsonify({"success": True, "cached": True, **cached})

    if genre and genre.upper() != "ALL":
        path = f"{SPORTS_UPSTREAM}/catalog/tv/moviebay_sports_live/genre={urllib.parse.quote(genre)}.json"
    else:
        path = f"{SPORTS_UPSTREAM}/catalog/tv/moviebay_sports_live.json"

    try:
        r = requests.get(path, headers=UPSTREAM_HEADERS, timeout=8)
        raw_items = r.json().get("metas", [])
        host = get_base_url()

        matches = []
        for m in raw_items:
            title = clean_match_title(m.get("name", ""))
            genres = m.get("genres", ["Sports"])
            matches.append(
                {
                    "id": m.get("id"),
                    "title": title,
                    "raw_title": m.get("name", ""),
                    "sport": genres[0] if genres else "Sports",
                    "genres": genres,
                    "teams": parse_teams(title),
                    "poster": m.get("poster") or f"{SPORTS_UPSTREAM}/img/match?cat=footbal",
                    "is_live": True,
                    "play_url": f"{host}/api/v1/stream/sports/{m.get('id')}.m3u8",
                    "info_url": f"{host}/api/v1/sports/resolve/{m.get('id')}",
                }
            )

        if limit and limit > 0:
            matches = matches[:limit]

        result = {"total": len(matches), "data": matches}
        cache.set(cache_key, result, ttl_seconds=45)
        return jsonify({"success": True, "cached": False, **result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# -----------------------------------------------------------------------------
# SPORTS: 2. Upcoming Matches
# -----------------------------------------------------------------------------
@app.route("/api/v1/sports/upcoming", methods=["GET"])
def get_upcoming_sports():
    genre = request.args.get("genre", "").strip()
    limit = request.args.get("limit", type=int)
    cache_key = f"sports_upcoming_{genre}_{limit}"

    cached = cache.get(cache_key)
    if cached is not None:
        return jsonify({"success": True, "cached": True, **cached})

    if genre and genre.upper() != "ALL":
        path = f"{SPORTS_UPSTREAM}/catalog/tv/moviebay_sports_upcoming/genre={urllib.parse.quote(genre)}.json"
    else:
        path = f"{SPORTS_UPSTREAM}/catalog/tv/moviebay_sports_upcoming.json"

    try:
        r = requests.get(path, headers=UPSTREAM_HEADERS, timeout=8)
        raw_items = r.json().get("metas", [])

        fixtures = []
        for m in raw_items:
            title = clean_match_title(m.get("name", ""))
            genres = m.get("genres", ["Sports"])
            fixtures.append(
                {
                    "id": m.get("id"),
                    "title": title,
                    "kickoff": m.get("releaseInfo", "Upcoming"),
                    "sport": genres[0] if genres else "Sports",
                    "genres": genres,
                    "teams": parse_teams(title),
                    "poster": m.get("poster") or f"{SPORTS_UPSTREAM}/img/match?cat=footbal",
                }
            )

        if limit and limit > 0:
            fixtures = fixtures[:limit]

        result = {"total": len(fixtures), "data": fixtures}
        cache.set(cache_key, result, ttl_seconds=180)
        return jsonify({"success": True, "cached": False, **result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# -----------------------------------------------------------------------------
# SPORTS: 3. 24/7 Channels
# -----------------------------------------------------------------------------
@app.route("/api/v1/sports/channels", methods=["GET"])
def get_sports_channels():
    search = request.args.get("search", "").strip()
    limit = request.args.get("limit", type=int)
    include_tulo = request.args.get("tulo", "true").lower() in ("true", "1", "yes")
    cache_key = f"sports_channels_{search}_{limit}_{include_tulo}"

    cached = cache.get(cache_key)
    if cached is not None:
        return jsonify({"success": True, "cached": True, **cached})

    host = get_base_url()
    channels = []

    # 1. Fetch TuloTv direct DASH channels (Azam Sports 1-5, Bein 1-3, TNT 1-4, CBS, Caze)
    if include_tulo:
        tulo_raw = fetch_tulo_channels()
        for t in tulo_raw:
            title = t.get("title", "")
            if search and search.lower() not in title.lower():
                continue
            channels.append(
                {
                    "id": f"tulo_{t.get('id')}",
                    "tulo_id": t.get("id"),
                    "name": title,
                    "raw_name": title,
                    "source": "tulo",
                    "format": "DASH",
                    "category": t.get("category", "Sports"),
                    "is_featured": t.get("is_featured", False),
                    "poster": t.get("image_url") or t.get("thumbnail"),
                    "play_url": f"{host}/api/v1/stream/tulo/{t.get('id')}.mpd",
                    "stream_url": t.get("stream_url"),
                    "drm": parse_clearkey(t.get("drm_clear_key")),
                }
            )

    # 2. Fetch Stremio / DaddyLive channels (SuperSport, Sky Sports, etc.)
    if search:
        path = f"{SPORTS_UPSTREAM}/catalog/tv/moviebay_sports_networks/search={urllib.parse.quote(search)}.json"
    else:
        path = f"{SPORTS_UPSTREAM}/catalog/tv/moviebay_sports_networks.json"

    try:
        r = requests.get(path, headers=UPSTREAM_HEADERS, timeout=8)
        raw_items = r.json().get("metas", [])

        for m in raw_items:
            name = clean_match_title(m.get("name", ""))
            channels.append(
                {
                    "id": m.get("id"),
                    "name": name,
                    "raw_name": m.get("name", ""),
                    "source": "moviebay",
                    "format": "HLS",
                    "poster": m.get("poster") or f"{SPORTS_UPSTREAM}/img/match?cat=footbal",
                    "play_url": f"{host}/api/v1/stream/sports/{m.get('id')}.m3u8",
                    "info_url": f"{host}/api/v1/sports/resolve/{m.get('id')}",
                    "drm": None,
                }
            )

        # 3. Local Ugandan Channels (NBS TV from hik.apk)
        if not search or any(k in search.lower() for k in ("nbs", "uganda", "local")):
            channels.insert(0, {
                "id": "ug_nbs_tv",
                "name": "NBS Television Uganda",
                "raw_name": "NBS TV Uganda",
                "source": "uganda_local",
                "format": "YouTube_Live",
                "category": "News & Entertainment",
                "is_featured": True,
                "poster": "https://yt3.googleusercontent.com/ytc/AIdro_k6kXbO-YjN56U3uI1i4h7F3_Lw=s900-c-k-c0x00ffffff-no-rj",
                "play_url": "https://www.youtube.com/@nbstvug/live",
                "shows_url": f"{host}/api/v1/uganda/shows",
                "drm": None,
            })

        if limit and limit > 0:
            channels = channels[:limit]

        result = {"total": len(channels), "data": channels}
        cache.set(cache_key, result, ttl_seconds=300)
        return jsonify({"success": True, "cached": False, **result})
    except Exception as e:
        if channels:
            result = {"total": len(channels), "data": channels}
            return jsonify({"success": True, "cached": False, **result})
        return jsonify({"success": False, "error": str(e)}), 500


# -----------------------------------------------------------------------------
# SPORTS: 3b. Dedicated TuloTv Endpoints (Azam, TNT, Bein, CBS)
# -----------------------------------------------------------------------------
@app.route("/api/v1/sports/tulo/channels", methods=["GET"])
def get_tulo_channels():
    search = request.args.get("search", "").lower().strip()
    host = get_base_url()
    raw_channels = fetch_tulo_channels()

    formatted = []
    for c in raw_channels:
        title = c.get("title", "")
        if search and search not in title.lower():
            continue
        cid = c.get("id", "")
        formatted.append(
            {
                "id": cid,
                "title": title,
                "category": c.get("category", "Sports"),
                "format": "DASH",
                "is_featured": c.get("is_featured", False),
                "poster": c.get("image_url") or c.get("thumbnail"),
                "play_url": f"{host}/api/v1/stream/tulo/{cid}.mpd",
                "stream_url": c.get("stream_url"),
                "drm": parse_clearkey(c.get("drm_clear_key")),
            }
        )
    return jsonify({"success": True, "total": len(formatted), "data": formatted})


@app.route("/api/v1/sports/tulo/channel/<path:cid>", methods=["GET"])
def get_tulo_channel_detail(cid):
    clean_id = cid.replace(".mpd", "").replace(".json", "")
    host = get_base_url()
    raw_channels = fetch_tulo_channels()
    target = next((c for c in raw_channels if c.get("id") == clean_id), None)
    if not target:
        return jsonify({"success": False, "error": f"Channel {clean_id} not found"}), 404

    resolved_url = resolve_tulo_stream_url(target.get("stream_url", ""))
    return jsonify(
        {
            "success": True,
            "id": clean_id,
            "title": target.get("title"),
            "category": target.get("category", "Sports"),
            "format": "DASH",
            "play_url": f"{host}/api/v1/stream/tulo/{clean_id}.mpd",
            "resolved_stream_url": resolved_url,
            "drm": parse_clearkey(target.get("drm_clear_key")),
            "headers": STREAM_HEADERS,
        }
    )


@app.route("/api/v1/stream/tulo/<path:cid>.mpd", methods=["GET"])
def stream_tulo_mpd(cid):
    clean_id = cid.replace(".mpd", "")
    raw_channels = fetch_tulo_channels()
    target = next((c for c in raw_channels if c.get("id") == clean_id), None)
    if not target:
        return Response(f"Channel {clean_id} not found", status=404)

    resolved_url = resolve_tulo_stream_url(target.get("stream_url", ""))
    try:
        r = requests.get(resolved_url, headers=STREAM_HEADERS, timeout=8)
        if r.status_code != 200:
            return Response(f"Upstream stream returned {r.status_code}", status=r.status_code)

        manifest = r.text
        if "<BaseURL>" not in manifest and "intlive.azamtvltd.co.tz" in resolved_url:
            base_cdn = resolved_url.split("?")[0].rsplit("/", 1)[0] + "/"
            manifest = re.sub(
                r"(<MPD[^>]*>)",
                rf"\1\n  <BaseURL>{base_cdn}</BaseURL>",
                manifest,
                count=1,
            )

        return Response(
            manifest,
            mimetype="application/dash+xml",
            headers={
                "Cache-Control": "no-cache, no-store",
                "Access-Control-Allow-Origin": "*",
            },
        )
    except Exception as e:
        return Response(f"Stream error: {e}", status=500)


# -----------------------------------------------------------------------------
# UGANDA LOCAL TV & SHOWS (NBS Television Uganda from hik.apk)
# -----------------------------------------------------------------------------
NBS_SHOWS = [
    {
        "id": "nbs_frontline",
        "title": "NBS FrontLine",
        "category": "Politics & Current Affairs",
        "playlist_url": "https://www.youtube.com/playlist?list=PL4uMSWt7KNsS8vh-hztMqxFH-V-dQoEsK",
        "embed_url": "https://www.youtube.com/embed/?listType=playlist&list=PL4uMSWt7KNsS8vh-hztMqxFH-V-dQoEsK",
    },
    {
        "id": "nbs_the_score",
        "title": "NBS The Score",
        "category": "Sports",
        "playlist_url": "https://www.youtube.com/playlist?list=PL4uMSWt7KNsSA6fnc68yTHIMdYW2SqXJA",
        "embed_url": "https://www.youtube.com/embed/?listType=playlist&list=PL4uMSWt7KNsSA6fnc68yTHIMdYW2SqXJA",
    },
    {
        "id": "nbs_live_at_9",
        "title": "NBS Live At 9",
        "category": "News",
        "playlist_url": "https://www.youtube.com/playlist?list=PL4uMSWt7KNsS68XxE4H-JCfgU6bWkmdC8",
        "embed_url": "https://www.youtube.com/embed/?listType=playlist&list=PL4uMSWt7KNsS68XxE4H-JCfgU6bWkmdC8",
    },
    {
        "id": "nbs_after_5",
        "title": "NBS After 5",
        "category": "Music & Entertainment",
        "playlist_url": "https://www.youtube.com/playlist?list=PL4uMSWt7KNsRuqVXdnAmNDb70BJw5LeBw",
        "embed_url": "https://www.youtube.com/embed/?listType=playlist&list=PL4uMSWt7KNsRuqVXdnAmNDb70BJw5LeBw",
    },
    {
        "id": "nbs_morning_breeze",
        "title": "NBS Morning Breeze",
        "category": "Talk Show",
        "playlist_url": "https://www.youtube.com/playlist?list=PL4uMSWt7KNsQ2eHRupcXCOPyuzGBl7lV-",
        "embed_url": "https://www.youtube.com/embed/?listType=playlist&list=PL4uMSWt7KNsQ2eHRupcXCOPyuzGBl7lV-",
    },
    {
        "id": "nbs_amasengejje",
        "title": "NBS Amasengejje",
        "category": "Luganda News",
        "playlist_url": "https://www.youtube.com/playlist?list=PL4uMSWt7KNsR55NvpGb8FVH9A7M_cNKsV",
        "embed_url": "https://www.youtube.com/embed/?listType=playlist&list=PL4uMSWt7KNsR55NvpGb8FVH9A7M_cNKsV",
    },
    {
        "id": "nbs_investigates",
        "title": "NBS Investigates",
        "category": "Investigative",
        "playlist_url": "https://www.youtube.com/playlist?list=PL4uMSWt7KNsRwaflHbFX3oHE3Ft1M1LyF",
        "embed_url": "https://www.youtube.com/embed/?listType=playlist&list=PL4uMSWt7KNsRwaflHbFX3oHE3Ft1M1LyF",
    },
    {
        "id": "nbs_one_on_one_tamale",
        "title": "One on One with Tamale Mirundi",
        "category": "Commentary",
        "playlist_url": "https://www.youtube.com/playlist?list=PL4uMSWt7KNsRcJgmcGdVdh7qrlsTZaoc7",
        "embed_url": "https://www.youtube.com/embed/?listType=playlist&list=PL4uMSWt7KNsRcJgmcGdVdh7qrlsTZaoc7",
    },
]


@app.route("/api/v1/uganda/shows", methods=["GET"])
def get_uganda_shows():
    search = request.args.get("search", "").lower().strip()
    filtered = [
        s
        for s in NBS_SHOWS
        if not search or search in s["title"].lower() or search in s["category"].lower()
    ]
    return jsonify(
        {
            "success": True,
            "channel": "NBS Television Uganda",
            "live_url": "https://www.youtube.com/@nbstvug/live",
            "total": len(filtered),
            "data": filtered,
        }
    )


# -----------------------------------------------------------------------------
# SPORTS: 4. Premier League Quick Stream
# -----------------------------------------------------------------------------
@app.route("/api/v1/sports/premier-league", methods=["GET"])
def get_premier_league():
    fallbacks = [
        ("SuperSport Premier League", "moviebay_sport_dlv_ch_414_supersport-premier-league"),
        ("Sky Sports Premier League", "moviebay_sport_cdn_ch_xx_sky-sports-premier-league-fhd-uk"),
        ("TNT Sports 1", "moviebay_sport_cdn_ch_xx_tnt-sports-1-fhd-uk"),
    ]
    host = get_base_url()
    for name, channel_id in fallbacks:
        try:
            r = requests.get(
                f"{SPORTS_UPSTREAM}/stream/tv/{channel_id}.json",
                headers=UPSTREAM_HEADERS,
                timeout=5,
            )
            streams = r.json().get("streams", [])
            if streams:
                return jsonify(
                    {
                        "success": True,
                        "channel_name": name,
                        "channel_id": channel_id,
                        "play_url": f"{host}/api/v1/stream/sports/{channel_id}.m3u8",
                        "stream_info": streams[0],
                    }
                )
        except Exception:
            continue
    return jsonify({"success": False, "error": "Premier League feeds temporarily offline"}), 404


# -----------------------------------------------------------------------------
# SPORTS: 5. Stream Source Inspector
# -----------------------------------------------------------------------------
@app.route("/api/v1/sports/resolve/<path:item_id>", methods=["GET"])
def resolve_sports_info(item_id):
    clean_id = item_id.replace(".json", "")
    try:
        r = requests.get(
            f"{SPORTS_UPSTREAM}/stream/tv/{clean_id}.json",
            headers=UPSTREAM_HEADERS,
            timeout=8,
        )
        data = r.json()
        host = get_base_url()
        return jsonify(
            {
                "success": True,
                "id": clean_id,
                "play_url": f"{host}/api/v1/stream/sports/{clean_id}.m3u8",
                "streams": data.get("streams", []),
            }
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# -----------------------------------------------------------------------------
# MOVIES & SERIES: 1. Latest Movies Catalog
# -----------------------------------------------------------------------------
@app.route("/api/v1/movies/latest", methods=["GET"])
def get_latest_movies():
    limit = request.args.get("limit", type=int)
    cache_key = f"movies_latest_{limit}"

    cached = cache.get(cache_key)
    if cached is not None:
        return jsonify({"success": True, "cached": True, **cached})

    try:
        r = requests.get(
            f"{MOVIES_UPSTREAM}/catalog/movie/moviebay-latest-movies.json",
            headers=UPSTREAM_HEADERS,
            timeout=8,
        )
        metas = r.json().get("metas", [])
        host = get_base_url()

        movies = []
        for m in metas:
            movies.append(
                {
                    "id": m.get("id"),
                    "title": m.get("name"),
                    "year": m.get("year", "N/A"),
                    "genres": m.get("genres", ["Movie"]),
                    "vj": m.get("vj") or (m.get("vjs", ["VJ"])[0] if m.get("vjs") else "VJ"),
                    "poster": m.get("poster"),
                    "banner": m.get("background") or m.get("banner"),
                    "play_url": f"{host}/api/v1/stream/movie/{m.get('id')}.m3u8",
                }
            )

        if limit and limit > 0:
            movies = movies[:limit]

        result = {"total": len(movies), "data": movies}
        cache.set(cache_key, result, ttl_seconds=300)
        return jsonify({"success": True, "cached": False, **result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# -----------------------------------------------------------------------------
# MOVIES & SERIES: 2. Search Movies
# -----------------------------------------------------------------------------
@app.route("/api/v1/movies/search", methods=["GET"])
def search_movies():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"success": False, "error": "Query param 'q' is required"}), 400

    try:
        clean_q = urllib.parse.quote(q)
        r = requests.get(
            f"{MOVIES_UPSTREAM}/catalog/movie/munowatch-movies/search={clean_q}.json",
            headers=UPSTREAM_HEADERS,
            timeout=8,
        )
        metas = r.json().get("metas", [])
        host = get_base_url()

        movies = [
            {
                "id": m.get("id"),
                "title": m.get("name"),
                "year": m.get("year", "N/A"),
                "genres": m.get("genres", ["Movie"]),
                "vj": m.get("vj") or "VJ",
                "poster": m.get("poster"),
                "play_url": f"{host}/api/v1/stream/movie/{m.get('id')}.m3u8",
            }
            for m in metas
        ]
        return jsonify({"success": True, "query": q, "total": len(movies), "data": movies})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# -----------------------------------------------------------------------------
# MOVIES & SERIES: 3. Series Catalog
# -----------------------------------------------------------------------------
@app.route("/api/v1/series/latest", methods=["GET"])
def get_latest_series():
    limit = request.args.get("limit", type=int)
    cache_key = f"series_latest_{limit}"

    cached = cache.get(cache_key)
    if cached is not None:
        return jsonify({"success": True, "cached": True, **cached})

    try:
        r = requests.get(
            f"{MOVIES_UPSTREAM}/catalog/series/moviebay-latest-series.json",
            headers=UPSTREAM_HEADERS,
            timeout=8,
        )
        metas = r.json().get("metas", [])
        host = get_base_url()

        series_list = [
            {
                "id": s.get("id"),
                "title": s.get("name"),
                "year": s.get("year", "N/A"),
                "genres": s.get("genres", ["Series"]),
                "vj": s.get("vj") or "VJ",
                "poster": s.get("poster"),
                "info_url": f"{host}/api/v1/series/{s.get('id')}",
            }
            for s in metas
        ]

        if limit and limit > 0:
            series_list = series_list[:limit]

        result = {"total": len(series_list), "data": series_list}
        cache.set(cache_key, result, ttl_seconds=300)
        return jsonify({"success": True, "cached": False, **result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# -----------------------------------------------------------------------------
# UNIVERSAL HLS PLAYBACK ENDPOINTS (Zero client-side header hack needed)
# -----------------------------------------------------------------------------
@app.route("/api/v1/stream/sports/<path:item_id>.m3u8", methods=["GET"])
def stream_sports_m3u8(item_id):
    """Serve rewritten HLS playlist for any sports match or channel."""
    try:
        r = requests.get(
            f"{SPORTS_UPSTREAM}/stream/tv/{item_id}.json",
            headers=UPSTREAM_HEADERS,
            timeout=8,
        )
        streams = r.json().get("streams", [])
        if not streams or not streams[0].get("url"):
            return Response("Stream source offline", status=404)

        raw_manifest_url = streams[0]["url"]
        m_res = requests.get(raw_manifest_url, headers=UPSTREAM_HEADERS, timeout=8)
        if m_res.status_code != 200:
            return Response("Upstream stream error", status=m_res.status_code)

        host = get_base_url()
        rewritten = []
        for line in m_res.text.splitlines():
            if line.startswith(("/api/hlschunk", "http")):
                rewritten.append(
                    f"{host}/api/v1/relay/chunk?url={urllib.parse.quote(line)}"
                )
            else:
                rewritten.append(line)

        return Response(
            "\n".join(rewritten),
            mimetype="application/vnd.apple.mpegurl",
            headers={"Cache-Control": "no-cache, no-store", "Access-Control-Allow-Origin": "*"},
        )
    except Exception as e:
        return Response(f"Stream error: {e}", status=500)


@app.route("/api/v1/stream/movie/<path:movie_id>.m3u8", methods=["GET"])
def stream_movie_m3u8(movie_id):
    """Serve rewritten HLS playlist for any movie."""
    try:
        r = requests.get(
            f"{MOVIES_UPSTREAM}/stream/movie/{movie_id}.json",
            headers=UPSTREAM_HEADERS,
            timeout=8,
        )
        streams = r.json().get("streams", [])
        if not streams or not streams[0].get("url"):
            return Response("Movie stream offline", status=404)

        raw_url = streams[0]["url"]
        m_res = requests.get(raw_url, headers=UPSTREAM_HEADERS, timeout=8)
        if m_res.status_code != 200:
            return Response("Upstream movie error", status=m_res.status_code)

        host = get_base_url()
        rewritten = []
        for line in m_res.text.splitlines():
            if line.startswith(("http", "/")):
                full = line if line.startswith("http") else f"{MOVIES_UPSTREAM}{line}"
                rewritten.append(f"{host}/api/v1/relay/chunk?url={urllib.parse.quote(full)}")
            else:
                rewritten.append(line)

        return Response(
            "\n".join(rewritten),
            mimetype="application/vnd.apple.mpegurl",
            headers={"Cache-Control": "no-cache, no-store", "Access-Control-Allow-Origin": "*"},
        )
    except Exception as e:
        return Response(f"Movie stream error: {e}", status=500)


# -----------------------------------------------------------------------------
# VIDEO SEGMENT RELAY (Streams TS segments with required headers)
# -----------------------------------------------------------------------------
@app.route("/api/v1/relay/chunk", methods=["GET"])
def relay_video_chunk():
    raw_path_or_url = request.args.get("url")
    if not raw_path_or_url:
        return Response("Missing 'url' query param", status=400)

    target_url = (
        raw_path_or_url
        if raw_path_or_url.startswith("http")
        else f"{SPORTS_UPSTREAM}{raw_path_or_url}"
    )

    try:
        r = requests.get(target_url, headers=UPSTREAM_HEADERS, stream=True, timeout=12)
        headers = {
            "Content-Type": r.headers.get("Content-Type", "video/mp2t"),
            "Access-Control-Allow-Origin": "*",
        }
        if "Content-Length" in r.headers:
            headers["Content-Length"] = r.headers["Content-Length"]

        return Response(
            stream_with_context(r.iter_content(chunk_size=65536)),
            status=r.status_code,
            headers=headers,
        )
    except Exception as e:
        return Response(f"Chunk relay error: {e}", status=502)


# -----------------------------------------------------------------------------
# Execution Entrypoint
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    print("=" * 65)
    print("🎬 UNIVERSAL STREAMING APP BACKEND API")
    print(f"👉 Local Endpoint: http://127.0.0.1:{PORT}")
    print(f"👉 Health Check:   http://127.0.0.1:{PORT}/health")
    print("=" * 65)
    app.run(host="0.0.0.0", port=PORT, threaded=True)
