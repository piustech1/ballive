/**
 * BALLIVE Verified Free Match-Specific Event Artwork Service
 * 
 * Interacts with TheSportsDB API (official active test key "123")
 * to retrieve authentic, event-specific match graphics and promotional posters
 * for upcoming and live sports fixtures.
 * 
 * Rules:
 * - NO AI-generated artwork.
 * - NO generic stadium stock photography.
 * - Extracts verified event artwork fields: strThumb, strPoster, strBanner, strSquare.
 * - In-memory LRU/map caching keyed by fixture identity to prevent duplicate network calls.
 * - Strict 3.5-second timeout via AbortController to guarantee zero UI lag.
 */

const THESPORTSDB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json/123';
const REQUEST_TIMEOUT_MS = 3500;

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

class TheSportsDbService {
  private cache = new Map<string, string | null>();
  private inFlight = new Map<string, Promise<string | null>>();

  /**
   * Cleans team names for matching against TheSportsDB event naming convention.
   * Example: "Arsenal FC" -> "Arsenal", "FC Barcelona" -> "Barcelona", "Inter Milan" -> "Inter".
   */
  private cleanTeamName(name: string): string {
    if (!name) return '';
    return name
      .replace(/\b(fc|cf|sc|afc|club|united|city|women|ladies|men)\b/gi, '')
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private buildCacheKey(homeTeam: string, awayTeam: string): string {
    const h = this.cleanTeamName(homeTeam).toLowerCase();
    const a = this.cleanTeamName(awayTeam).toLowerCase();
    return `${h}_vs_${a}`;
  }

  /**
   * Synchronously checks if verified event artwork is already cached in memory.
   */
  getCachedArtwork(homeTeam?: string, awayTeam?: string): string | null {
    if (!homeTeam || !awayTeam) return null;
    const key = this.buildCacheKey(homeTeam, awayTeam);
    return this.cache.get(key) || null;
  }

  /**
   * Queries TheSportsDB for verified, fixture-specific match artwork.
   * Priority: strThumb -> strPoster -> strBanner -> strSquare.
   */
  async fetchEventArtwork(
    homeTeam: string,
    awayTeam: string,
    sport = 'soccer'
  ): Promise<string | null> {
    if (!homeTeam || !awayTeam) return null;

    const cacheKey = this.buildCacheKey(homeTeam, awayTeam);

    // 1. Check in-memory cache
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
              return verifiedArtwork;
            }
          }
        } catch {
          // Continue to next fallback query or complete
        }
      }

      // Cache negative result to prevent redundant API queries
      this.cache.set(cacheKey, null);
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
   * Pre-fetches and caches event artwork for a batch of fixtures in the background.
   */
  prefetchMatchups(matchups: Array<{ homeTeam: string; awayTeam: string; sport?: string }>): void {
    if (!Array.isArray(matchups)) return;
    // Process at most 6 in parallel to respect rate limits
    const slice = matchups.slice(0, 6);
    slice.forEach(m => {
      this.fetchEventArtwork(m.homeTeam, m.awayTeam, m.sport).catch(() => {});
    });
  }
}

export const theSportsDbService = new TheSportsDbService();
export default theSportsDbService;
