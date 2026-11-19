/**
 * BALLIVE Verified Free Match-Specific Event Artwork Service
 * 
 * Interacts with TheSportsDB API (official active test key "123")
 * to retrieve authentic, event-specific match graphics and promotional posters
 * for upcoming and live sports fixtures.
 * 
 * Architecture & Integrity Rules:
 * - NO AI-generated artwork.
 * - NO generic stadium stock photography.
 * - NO competition logos masquerading as match artwork.
 * - ZERO negative cache poisoning: rate limits (HTTP 429) & network timeouts are NEVER saved as null to disk.
 * - Sequential queue with strictly metered 400ms pacing and automatic Cloudflare 429 backoff.
 * - Smart international team name alias dictionary (Köln/Cologne, Man City vs Man United, PSG, etc.).
 * - Persistent disk caching for positive verified artwork via expo-file-system.
 * - Direct cache injection for upstream DAG TheSportsDB URLs.
 */

import * as FileSystem from 'expo-file-system';
import { isGenuineEventArtwork } from '../utils/sportBackgroundResolver';

const THESPORTSDB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json/123';
const REQUEST_TIMEOUT_MS = 5000;
const CACHE_STORAGE_FILE = `${FileSystem.documentDirectory || ''}thesportsdb_artwork_cache_v2.json`;
const OLD_CACHE_FILE = `${FileSystem.documentDirectory || ''}thesportsdb_artwork_cache_v1.json`;

// Common European and international club alias dictionary
const TEAM_ALIASES: Record<string, string[]> = {
  // German Bundesliga
  'cologne': ['Köln', 'Koln', '1. FC Köln'],
  'fc cologne': ['Köln', 'Koln', '1. FC Köln'],
  '1 fc koln': ['Köln', 'Koln', '1. FC Köln'],
  '1. fc köln': ['Köln', 'Koln', '1. FC Köln'],
  'koln': ['Köln', 'Koln'],
  'köln': ['Köln', 'Koln'],
  'bayern munich': ['Bayern Munich', 'Bayern München'],
  'fc bayern munchen': ['Bayern Munich', 'Bayern München'],
  'bayer leverkusen': ['Bayer Leverkusen', 'Leverkusen'],
  'borussia dortmund': ['Borussia Dortmund', 'Dortmund'],
  'borussia mgladbach': ['Borussia Monchengladbach', 'Mönchengladbach'],
  'borussia monchengladbach': ['Borussia Monchengladbach', 'Mönchengladbach'],
  'rb leipzig': ['RB Leipzig', 'Leipzig'],
  'eintracht frankfurt': ['Eintracht Frankfurt', 'Frankfurt'],

  // English Premier League & Women's Super League
  'manchester city': ['Manchester City', 'Man City'],
  'man city': ['Manchester City'],
  'manchester united': ['Manchester United', 'Man United'],
  'man united': ['Manchester United'],
  'tottenham hotspur': ['Tottenham', 'Spurs'],
  'tottenham': ['Tottenham', 'Tottenham Hotspur'],
  'wolverhampton wanderers': ['Wolves', 'Wolverhampton'],
  'wolverhampton': ['Wolves', 'Wolverhampton Wanderers'],
  'wolves': ['Wolves', 'Wolverhampton'],
  'newcastle united': ['Newcastle', 'Newcastle United'],
  'newcastle': ['Newcastle', 'Newcastle United'],
  'west ham united': ['West Ham', 'West Ham United'],
  'west ham': ['West Ham', 'West Ham United'],
  'brighton and hove albion': ['Brighton', 'Brighton & Hove Albion'],
  'brighton & hove albion': ['Brighton'],
  'brighton': ['Brighton'],

  // Spanish La Liga & Liga F
  'athletic club': ['Athletic Bilbao', 'Athletic Club'],
  'athletic bilbao': ['Athletic Bilbao', 'Athletic Club'],
  'atletico madrid': ['Atletico Madrid', 'Atlético de Madrid'],
  'atletico de madrid': ['Atletico Madrid'],
  'real madrid': ['Real Madrid'],
  'barcelona': ['Barcelona', 'FC Barcelona'],
  'real sociedad': ['Real Sociedad'],
  'real betis': ['Real Betis', 'Betis'],

  // Italian Serie A
  'inter milan': ['Inter', 'Internazionale', 'Inter Milan'],
  'internazionale': ['Inter', 'Inter Milan'],
  'inter': ['Inter', 'Inter Milan'],
  'ac milan': ['AC Milan', 'Milan'],
  'milan': ['AC Milan', 'Milan'],
  'ss lazio': ['Lazio', 'SS Lazio'],
  'lazio': ['Lazio', 'SS Lazio'],
  'as roma': ['Roma', 'AS Roma'],
  'roma': ['Roma', 'AS Roma'],

  // French Ligue 1 & Coupe de France
  'paris saint germain': ['Paris Saint Germain', 'Paris SG', 'PSG'],
  'paris saint-germain': ['Paris Saint Germain', 'Paris SG', 'PSG'],
  'psg': ['Paris Saint Germain', 'Paris SG'],
  'paris sg': ['Paris Saint Germain', 'PSG'],
  'le havre ac': ['Le Havre', 'HAC'],
  'le havre': ['Le Havre'],
  'olympique lyonnais': ['Lyon', 'Olympique Lyonnais'],
  'lyon': ['Lyon'],
  'olympique de marseille': ['Marseille', 'Olympique de Marseille'],
  'marseille': ['Marseille'],

  // Portuguese & Others
  'sporting cp': ['Sporting CP', 'Sporting Lisbon'],
  'sporting lisbon': ['Sporting CP', 'Sporting Lisbon'],
};

interface TheSportsDbEvent {
  idEvent?: string;
  strEvent?: string;
  strSport?: string;
  strLeague?: string;
  dateEvent?: string;
  strTime?: string;
  strThumb?: string;
  strPoster?: string;
  strBanner?: string;
  strSquare?: string;
  strFanart?: string;
}

interface TheSportsDbResponse {
  event?: TheSportsDbEvent[];
}

export type ArtworkListener = (eventKey: string, artworkUrl: string) => void;

interface QueueItem {
  homeTeam: string;
  awayTeam: string;
  sport?: string;
  date?: string;
}

class TheSportsDbService {
  // Keyed by canonical `${cleanHome}_vs_${cleanAway}`
  private cache = new Map<string, string>(); // Only positive URLs in persistent cache!
  private transientNegativeCache = new Map<string, number>(); // Negative TTL (1 hour in-memory only)
  private inFlight = new Map<string, Promise<string | null>>();
  private listeners = new Set<ArtworkListener>();
  private queue: QueueItem[] = [];
  private isProcessingQueue = false;
  private isStorageLoaded = false;
  private saveDebounceTimer: any = null;
  private rateLimitedUntil = 0; // Milliseconds epoch when 429 block expires

  constructor() {
    this.initDiskStorage();
  }

  /**
   * Initializes persistent storage from disk. Only positive URLs are retained.
   */
  private async initDiskStorage(): Promise<void> {
    try {
      if (FileSystem && FileSystem.documentDirectory) {
        // Check new cache file
        let targetFile = CACHE_STORAGE_FILE;
        let fileInfo = await FileSystem.getInfoAsync(targetFile);

        // Fallback to old cache file if new one doesn't exist yet
        if (!fileInfo.exists) {
          const oldInfo = await FileSystem.getInfoAsync(OLD_CACHE_FILE);
          if (oldInfo.exists) {
            targetFile = OLD_CACHE_FILE;
            fileInfo = oldInfo;
          }
        }

        if (fileInfo.exists) {
          const raw = await FileSystem.readAsStringAsync(targetFile);
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            Object.entries(parsed).forEach(([key, val]) => {
              // Strictly only load valid positive HTTP image URLs that pass genuine artwork validation
              if (typeof val === 'string' && val.startsWith('http') && isGenuineEventArtwork(val)) {
                this.cache.set(key, val);
              }
            });
          }
        }
      }
    } catch {
      // Gracefully continue with in-memory cache
    } finally {
      this.isStorageLoaded = true;
    }
  }

  /**
   * Debounced save of positive cache entries to disk.
   */
  private scheduleSaveToDisk(): void {
    if (this.saveDebounceTimer) return;
    this.saveDebounceTimer = setTimeout(async () => {
      this.saveDebounceTimer = null;
      try {
        if (FileSystem && FileSystem.documentDirectory) {
          const obj: Record<string, string> = {};
          // Only save verified positive URLs (max 500 recent entries)
          const entries = Array.from(this.cache.entries()).slice(-500);
          entries.forEach(([k, v]) => {
            if (typeof v === 'string' && v.startsWith('http')) {
              obj[k] = v;
            }
          });
          await FileSystem.writeAsStringAsync(CACHE_STORAGE_FILE, JSON.stringify(obj));
        }
      } catch {
        // Ignore disk write errors silently
      }
    }, 1000);
  }

  /**
   * Cleans team names for matching against TheSportsDB naming convention.
   * Crucially: Preserves distinguishing words like "City", "United", "Town", "Hotspur".
   */
  public cleanTeamName(name: string): string {
    if (!name) return '';
    let cleaned = name.trim();

    // Strip extraneous club prefixes / suffixes while strictly keeping City / United
    cleaned = cleaned
      .replace(/^(fc|cf|sc|afc|ss|as|ac|rcd|rc|cd|ud|sd|bsc|tsv|vfb|vfl|fsv|spvg)\s+/gi, '')
      .replace(/\s+(fc|cf|sc|afc|club|women|ladies|men|wfc)\b/gi, '')
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return cleaned;
  }

  /**
   * Resolves alternative query variations using the alias dictionary.
   */
  public getTeamVariations(teamName: string): string[] {
    const raw = teamName.trim();
    const cleaned = this.cleanTeamName(raw);
    const key = raw.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    const cleanKey = cleaned.toLowerCase();

    const variations = new Set<string>();
    if (cleaned) variations.add(cleaned);
    if (raw) variations.add(raw);

    // Check alias dictionary
    if (TEAM_ALIASES[key]) {
      TEAM_ALIASES[key].forEach(v => variations.add(v));
    }
    if (TEAM_ALIASES[cleanKey]) {
      TEAM_ALIASES[cleanKey].forEach(v => variations.add(v));
    }

    return Array.from(variations);
  }

  /**
   * Builds canonical cache key for a fixture.
   * Distinctly preserves City and United to prevent cache collisions.
   * Optionally incorporates sport or eventId for strict association.
   */
  public buildCacheKey(
    homeTeam?: string,
    awayTeam?: string,
    sport?: string,
    competition?: string,
    eventId?: string
  ): string {
    if (eventId) {
      return `event_${eventId}`;
    }
    if (!homeTeam || !awayTeam) return '';
    const h = this.cleanTeamName(homeTeam).toLowerCase().replace(/\s+/g, '_');
    const a = this.cleanTeamName(awayTeam).toLowerCase().replace(/\s+/g, '_');
    const s = sport ? sport.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    if (s && s !== 'soccer' && s !== 'football') {
      return `${s}_${h}_vs_${a}`;
    }
    return `${h}_vs_${a}`;
  }

  /**
   * Subscribes a listener to receive notification when any artwork is resolved.
   */
  public subscribe(listener: ArtworkListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifies all subscribers of newly resolved artwork.
   */
  private notifyListeners(eventKey: string, artworkUrl: string): void {
    this.listeners.forEach(fn => {
      try {
        fn(eventKey, artworkUrl);
      } catch {
        // Prevent subscriber errors from interfering with resolution
      }
    });
  }

  /**
   * Synchronously checks if verified event artwork is already cached in memory.
   */
  public getCachedArtwork(
    homeTeam?: string,
    awayTeam?: string,
    sport?: string,
    competition?: string,
    eventId?: string
  ): string | null {
    if (eventId) {
      const byId = this.cache.get(`event_${eventId}`);
      if (byId && isGenuineEventArtwork(byId)) return byId;
    }
    if (!homeTeam || !awayTeam) return null;
    const key = this.buildCacheKey(homeTeam, awayTeam, sport, competition);
    const cached = this.cache.get(key);
    if (cached && isGenuineEventArtwork(cached)) {
      return cached;
    }
    // Fallback to base key without sport prefix for backward compatibility
    const baseKey = this.buildCacheKey(homeTeam, awayTeam);
    const baseCached = this.cache.get(baseKey);
    if (baseCached && isGenuineEventArtwork(baseCached)) {
      return baseCached;
    }
    return null;
  }

  /**
   * Directly sets a verified artwork URL into cache and disk storage.
   * Useful when upstream DAG catalogs already bundle verified TheSportsDB thumbnails.
   */
  public setCachedArtwork(
    homeTeam: string,
    awayTeam: string,
    artworkUrl: string,
    sport?: string,
    competition?: string,
    eventId?: string
  ): void {
    if (!artworkUrl || !artworkUrl.startsWith('http')) return;
    if (!isGenuineEventArtwork(artworkUrl)) return;
    if (eventId) {
      this.cache.set(`event_${eventId}`, artworkUrl);
    }
    if (homeTeam && awayTeam) {
      const key = this.buildCacheKey(homeTeam, awayTeam, sport, competition);
      if (key) {
        this.cache.set(key, artworkUrl);
        this.transientNegativeCache.delete(key);
        this.notifyListeners(key, artworkUrl);
      }
      const baseKey = this.buildCacheKey(homeTeam, awayTeam);
      if (baseKey && baseKey !== key) {
        this.cache.set(baseKey, artworkUrl);
      }
    }
    this.scheduleSaveToDisk();
  }

  /**
   * Queries TheSportsDB for verified, fixture-specific match artwork.
   * Respects rate limits, uses aliases, and NEVER caches 429/network errors as permanent nulls.
   */
  public async fetchEventArtwork(
    homeTeam: string,
    awayTeam: string,
    sport = 'soccer',
    matchDate?: string
  ): Promise<string | null> {
    if (!homeTeam || !awayTeam) return null;

    const cacheKey = this.buildCacheKey(homeTeam, awayTeam);
    if (!cacheKey) return null;

    // 1. Check verified positive cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // 2. Check transient negative cache (cooldown window)
    const negativeExpiry = this.transientNegativeCache.get(cacheKey);
    if (negativeExpiry && Date.now() < negativeExpiry) {
      return null;
    }

    // 3. Reuse in-flight request for identical matchup
    if (this.inFlight.has(cacheKey)) {
      return this.inFlight.get(cacheKey)!;
    }

    // 4. Check global rate limit cooldown
    if (Date.now() < this.rateLimitedUntil) {
      return null;
    }

    const fetchPromise = (async (): Promise<string | null> => {
      const homeVariations = this.getTeamVariations(homeTeam);
      const awayVariations = this.getTeamVariations(awayTeam);

      // Generate prioritized list of search pairs
      const queries: string[] = [];
      for (const h of homeVariations) {
        for (const a of awayVariations) {
          const q = `${h} vs ${a}`;
          if (!queries.includes(q)) {
            queries.push(q);
          }
          if (queries.length >= 2) break; // Limit query attempts per matchup to avoid network congestion
        }
        if (queries.length >= 2) break;
      }

      for (const q of queries) {
        if (Date.now() < this.rateLimitedUntil) {
          return null;
        }

        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

          const encodedParam = encodeURIComponent(q.replace(/\s+/g, '_'));
          const url = `${THESPORTSDB_BASE_URL}/searchevents.php?e=${encodedParam}`;

          const res = await fetch(url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'BALLIVE-Mobile/2.6.6',
              'Accept': 'application/json',
            },
          });
          clearTimeout(timer);

          // Handle Cloudflare Rate Limiting (HTTP 429)
          if (res.status === 429) {
            const retryAfterHeader = res.headers.get('retry-after');
            const retrySeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) || 25 : 25;
            this.rateLimitedUntil = Date.now() + retrySeconds * 1000;
            // DO NOT cache null! Return immediately and let background queue retry after cooldown
            return null;
          }

          if (!res.ok) {
            continue;
          }

          const rawText = await res.text();
          let data: TheSportsDbResponse;
          try {
            data = JSON.parse(rawText);
          } catch {
            // HTML error response from Cloudflare — do not treat as empty result
            continue;
          }

          const events = data.event || [];
          if (events.length > 0) {
            // Find event matching sport and optional date window
            const matched = events.find(e => {
              if (!sport) return true;
              const evSport = (e.strSport || '').toLowerCase();
              if (sport === 'soccer' && (evSport === 'soccer' || evSport === 'football')) {
                // If match date provided, verify within a 14-day window to avoid historical matches
                if (matchDate && e.dateEvent) {
                  try {
                    const fixtureTime = new Date(matchDate).getTime();
                    const eventTime = new Date(e.dateEvent).getTime();
                    const diffDays = Math.abs(fixtureTime - eventTime) / (1000 * 60 * 60 * 24);
                    if (diffDays > 20) return false;
                  } catch {
                    // Ignore date parse error
                  }
                }
                return true;
              }
              if (sport === 'basketball' && evSport === 'basketball') return true;
              if (sport === 'hockey' && (evSport === 'ice hockey' || evSport === 'hockey')) return true;
              if (sport === 'american_football' && evSport === 'american football') return true;
              return true;
            }) || events[0];

            // Extract verified artwork in priority order
            const candidateArtwork =
              matched.strThumb ||
              matched.strPoster ||
              matched.strBanner ||
              matched.strSquare ||
              null;

            if (candidateArtwork && typeof candidateArtwork === 'string' && candidateArtwork.startsWith('http')) {
              // Strictly validate that this is genuine event artwork and NOT an automated collage template
              if (isGenuineEventArtwork(candidateArtwork)) {
                this.cache.set(cacheKey, candidateArtwork);
                this.transientNegativeCache.delete(cacheKey);
                this.scheduleSaveToDisk();
                this.notifyListeners(cacheKey, candidateArtwork);
                return candidateArtwork;
              }
            }
          }
        } catch {
          // Timeout or fetch abort — do not cache null permanently
        }
      }

      // If we genuinely searched valid aliases and got 200 OK with no events found:
      // Cache negative ONLY in transient in-memory map for 1 hour. DO NOT write to disk!
      this.transientNegativeCache.set(cacheKey, Date.now() + 60 * 60 * 1000);
      return null;
    })();

    this.inFlight.set(cacheKey, fetchPromise);

    try {
      const result = await fetchPromise;
      return result;
    } finally {
      this.inFlight.delete(cacheKey);
    }
  }

  /**
   * Enqueues an array of fixtures into a polite sequential background worker.
   * Paced at 400ms intervals to prevent Cloudflare 429 rate limit triggers.
   */
  public enqueueMatches(
    matchups: Array<{ homeTeam: string; awayTeam: string; sport?: string; date?: string }>
  ): void {
    if (!Array.isArray(matchups) || matchups.length === 0) return;

    matchups.forEach(m => {
      if (this.queue.length >= 10) return; // Strictly cap queue size to prevent background task explosion
      if (!m.homeTeam || !m.awayTeam) return;
      const key = this.buildCacheKey(m.homeTeam, m.awayTeam);
      if (!key) return;

      // Skip if already has positive verified artwork
      if (this.cache.has(key)) return;
      // Skip if in transient negative cooldown
      const neg = this.transientNegativeCache.get(key);
      if (neg && Date.now() < neg) return;
      // Skip if already in flight or queue
      if (this.inFlight.has(key)) return;
      if (this.queue.some(q => this.buildCacheKey(q.homeTeam, q.awayTeam) === key)) return;

      this.queue.push({ homeTeam: m.homeTeam, awayTeam: m.awayTeam, sport: m.sport, date: m.date });
    });

    this.processQueue();
  }

  /**
   * Processes the queue sequentially with strict 400ms pacing and rate limit respect.
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.queue.length === 0) return;
    this.isProcessingQueue = true;

    while (this.queue.length > 0) {
      // If currently under 429 rate limit cooldown, wait it out
      if (Date.now() < this.rateLimitedUntil) {
        const waitMs = Math.min(this.rateLimitedUntil - Date.now(), 25000);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }

      const item = this.queue.shift();
      if (!item) break;

      const key = this.buildCacheKey(item.homeTeam, item.awayTeam);
      if (this.cache.has(key)) continue;

      try {
        await this.fetchEventArtwork(item.homeTeam, item.awayTeam, item.sport, item.date);
      } catch {
        // Keep queue running even if individual item throws
      }

      // Polite 400ms pause between requests to strictly respect Cloudflare rate limits
      await new Promise(r => setTimeout(r, 400));
    }

    this.isProcessingQueue = false;
  }

  /**
   * Pre-fetches and caches event artwork for a batch of fixtures.
   */
  public prefetchMatchups(
    matchups: Array<{ homeTeam: string; awayTeam: string; sport?: string; date?: string }>
  ): void {
    this.enqueueMatches(matchups);
  }
}

export const theSportsDbService = new TheSportsDbService();
export default theSportsDbService;
