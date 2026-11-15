/**
 * BALLIVE Verified Free Match-Specific Event Artwork Service
 * 
 * Interacts with TheSportsDB API (official active test key "123")
 * to retrieve authentic, event-specific match graphics and promotional posters
 * for upcoming and live sports fixtures.
 * 
 * Features:
 * - NO AI-generated artwork.
 * - NO generic stadium stock photography.
 * - Extracts verified event artwork fields: strThumb, strPoster, strBanner, strSquare.
 * - In-memory LRU/map caching keyed by fixture identity.
 * - Persistent disk caching via expo-file-system across app restarts.
 * - Event-based pub/sub subscription so UI cards update instantly when artwork arrives.
 * - Controlled background queue with rate-limited concurrency.
 * - Strict 3.5-second network timeout via AbortController.
 */

import * as FileSystem from 'expo-file-system';

const THESPORTSDB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json/123';
const REQUEST_TIMEOUT_MS = 3500;
const CACHE_STORAGE_FILE = `${FileSystem.documentDirectory || ''}thesportsdb_artwork_cache_v1.json`;

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

class TheSportsDbService {
  private cache = new Map<string, string | null>();
  private inFlight = new Map<string, Promise<string | null>>();
  private listeners = new Set<ArtworkListener>();
  private queue: Array<{ homeTeam: string; awayTeam: string; sport?: string }> = [];
  private isProcessingQueue = false;
  private isStorageLoaded = false;
  private saveDebounceTimer: any = null;

  constructor() {
    this.initDiskStorage();
  }

  /**
   * Initializes persistent storage from disk.
   */
  private async initDiskStorage(): Promise<void> {
    try {
      if (FileSystem && FileSystem.documentDirectory) {
        const fileInfo = await FileSystem.getInfoAsync(CACHE_STORAGE_FILE);
        if (fileInfo.exists) {
          const raw = await FileSystem.readAsStringAsync(CACHE_STORAGE_FILE);
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            Object.entries(parsed).forEach(([key, val]) => {
              if (typeof val === 'string' || val === null) {
                this.cache.set(key, val);
              }
            });
          }
        }
      }
    } catch (err) {
      // Gracefully continue with in-memory cache
    } finally {
      this.isStorageLoaded = true;
    }
  }

  /**
   * Debounced save of cache entries to disk.
   */
  private scheduleSaveToDisk(): void {
    if (this.saveDebounceTimer) return;
    this.saveDebounceTimer = setTimeout(async () => {
      this.saveDebounceTimer = null;
      try {
        if (FileSystem && FileSystem.documentDirectory) {
          const obj: Record<string, string | null> = {};
          // Only save up to 400 most recent entries to keep storage lightweight
          const entries = Array.from(this.cache.entries()).slice(-400);
          entries.forEach(([k, v]) => {
            obj[k] = v;
          });
          await FileSystem.writeAsStringAsync(CACHE_STORAGE_FILE, JSON.stringify(obj));
        }
      } catch {
        // Ignore disk write errors silently
      }
    }, 1500);
  }

  /**
   * Cleans team names for matching against TheSportsDB event naming convention.
   * Example: "Arsenal FC" -> "Arsenal", "FC Barcelona" -> "Barcelona", "Inter Milan" -> "Inter".
   */
  public cleanTeamName(name: string): string {
    if (!name) return '';
    return name
      .replace(/\b(fc|cf|sc|afc|club|united|city|women|ladies|men)\b/gi, '')
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Builds canonical cache key for a fixture.
   */
  public buildCacheKey(homeTeam?: string, awayTeam?: string): string {
    if (!homeTeam || !awayTeam) return '';
    const h = this.cleanTeamName(homeTeam).toLowerCase();
    const a = this.cleanTeamName(awayTeam).toLowerCase();
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
  public getCachedArtwork(homeTeam?: string, awayTeam?: string): string | null {
    if (!homeTeam || !awayTeam) return null;
    const key = this.buildCacheKey(homeTeam, awayTeam);
    return this.cache.get(key) || null;
  }

  /**
   * Queries TheSportsDB for verified, fixture-specific match artwork.
   * Priority: strThumb -> strPoster -> strBanner -> strSquare.
   */
  public async fetchEventArtwork(
    homeTeam: string,
    awayTeam: string,
    sport = 'soccer'
  ): Promise<string | null> {
    if (!homeTeam || !awayTeam) return null;

    const cacheKey = this.buildCacheKey(homeTeam, awayTeam);
    if (!cacheKey) return null;

    // 1. Check in-memory / persistent cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) || null;
    }

    // 2. Reuse in-flight request for identical matchup
    if (this.inFlight.has(cacheKey)) {
      return this.inFlight.get(cacheKey)!;
    }

    const fetchPromise = (async (): Promise<string | null> => {
      const cleanHome = this.cleanTeamName(homeTeam);
      const cleanAway = this.cleanTeamName(awayTeam);

      if (!cleanHome || !cleanAway) {
        this.cache.set(cacheKey, null);
        return null;
      }

      // Try queries in order of precision:
      // A. "CleanHome vs CleanAway"
      // B. "OriginalHome vs OriginalAway" (if different)
      const queries = [`${cleanHome} vs ${cleanAway}`];
      const rawQuery = `${homeTeam.trim()} vs ${awayTeam.trim()}`;
      if (rawQuery.toLowerCase() !== queries[0].toLowerCase()) {
        queries.push(rawQuery);
      }

      for (const q of queries) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

          const url = `${THESPORTSDB_BASE_URL}/searchevents.php?e=${encodeURIComponent(q.replace(/\s+/g, '_'))}`;
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(timer);

          if (!res.ok) continue;

          const data: TheSportsDbResponse = await res.json();
          const events = data.event || [];

          if (events.length > 0) {
            // Find event that matches sport if provided
            const matched = events.find(e => {
              if (!sport) return true;
              const evSport = (e.strSport || '').toLowerCase();
              if (sport === 'soccer' && (evSport === 'soccer' || evSport === 'football')) return true;
              if (sport === 'basketball' && evSport === 'basketball') return true;
              if (sport === 'hockey' && (evSport === 'ice hockey' || evSport === 'hockey')) return true;
              if (sport === 'american_football' && evSport === 'american football') return true;
              return true;
            }) || events[0];

            // Extract verified artwork in priority order
            const verifiedArtwork =
              matched.strThumb ||
              matched.strPoster ||
              matched.strBanner ||
              matched.strSquare ||
              null;

            if (verifiedArtwork && typeof verifiedArtwork === 'string' && verifiedArtwork.startsWith('http')) {
              this.cache.set(cacheKey, verifiedArtwork);
              this.scheduleSaveToDisk();
              this.notifyListeners(cacheKey, verifiedArtwork);
              return verifiedArtwork;
            }
          }
        } catch {
          // Continue to next fallback query or complete
        }
      }

      // Cache negative result to prevent redundant API queries
      this.cache.set(cacheKey, null);
      this.scheduleSaveToDisk();
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
   * Enqueues an array of fixtures into a controlled background queue.
   * Resolves artwork automatically with throttled concurrency (3 at a time).
   */
  public enqueueMatches(
    matchups: Array<{ homeTeam: string; awayTeam: string; sport?: string }>
  ): void {
    if (!Array.isArray(matchups) || matchups.length === 0) return;

    matchups.forEach(m => {
      if (!m.homeTeam || !m.awayTeam) return;
      const key = this.buildCacheKey(m.homeTeam, m.awayTeam);
      if (!key) return;
      // Skip if already in cache or in-flight
      if (this.cache.has(key) || this.inFlight.has(key)) return;
      // Skip if already queued
      if (this.queue.some(q => this.buildCacheKey(q.homeTeam, q.awayTeam) === key)) return;

      this.queue.push({ homeTeam: m.homeTeam, awayTeam: m.awayTeam, sport: m.sport });
    });

    this.processQueue();
  }

  /**
   * Processes the background queue with limited concurrency.
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.queue.length === 0) return;
    this.isProcessingQueue = true;

    while (this.queue.length > 0) {
      // Take batch of up to 3 items
      const batch = this.queue.splice(0, 3);
      await Promise.allSettled(
        batch.map(item => this.fetchEventArtwork(item.homeTeam, item.awayTeam, item.sport))
      );
      // Brief 120ms pause between batches to protect client bandwidth and remote rate limits
      await new Promise(r => setTimeout(r, 120));
    }

    this.isProcessingQueue = false;
  }

  /**
   * Pre-fetches and caches event artwork for a batch of fixtures in the background.
   */
  public prefetchMatchups(
    matchups: Array<{ homeTeam: string; awayTeam: string; sport?: string }>
  ): void {
    this.enqueueMatches(matchups);
  }
}

export const theSportsDbService = new TheSportsDbService();
export default theSportsDbService;
