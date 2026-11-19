/**
 * BALLIVE Match-Data Level Artwork Enrichment Service
 * 
 * Automatically enriches fixtures with authentic, verified event artwork
 * before they reach the UI screens or detail views.
 * 
 * Rules:
 * 1. Eagerly extracts verified TheSportsDB and ondemand.st event promo artwork
 *    from upstream data sources (DAG catalogs, ESPN event feeds).
 * 2. Directly updates the shared match models in place so that all UI consumers
 *    (Home, Discover, Live Streams, Navigation params, Match Details) share the
 *    exact same verified artwork.
 * 3. Enqueues fixtures missing artwork into the strictly paced TheSportsDB background
 *    worker without user interaction.
 * 4. Strictly separates match artwork from competition branding. Never assigns
 *    competition logos or league banners as match backgrounds.
 */

import { LiveMatch } from '../constants/mockData';
import { DiscoverMatchup } from '../constants/discoverData';
import { theSportsDbService } from './theSportsDbService';
import { isGenuineEventArtwork, cleanServerArtworkUrl } from '../utils/sportBackgroundResolver';

export type EnrichableMatch = LiveMatch | DiscoverMatchup;
export type EnricherListener = (eventKey: string, artworkUrl: string) => void;

class MatchArtworkEnricher {
  private activeMatches = new Set<EnrichableMatch>();
  private listeners = new Set<EnricherListener>();

  constructor() {
    // Listen to background TheSportsDB resolutions and enrich active match objects
    theSportsDbService.subscribe((eventKey, artworkUrl) => {
      this.handleArtworkResolved(eventKey, artworkUrl);
    });
  }

  /**
   * Helper to extract clean team names from either LiveMatch or DiscoverMatchup.
   */
  public getTeamNames(match: EnrichableMatch): { home: string; away: string } {
    let home = '';
    let away = '';

    if ('homeTeam' in match) {
      if (typeof match.homeTeam === 'object' && match.homeTeam !== null) {
        home = match.homeTeam.name || '';
      } else if (typeof match.homeTeam === 'string') {
        home = match.homeTeam;
      }
    }

    if ('awayTeam' in match) {
      if (typeof match.awayTeam === 'object' && match.awayTeam !== null) {
        away = (match.awayTeam as any).name || '';
      } else if (typeof match.awayTeam === 'string') {
        away = match.awayTeam;
      }
    }

    return { home, away };
  }

  /**
   * Unwraps verified, event-specific artwork from any raw URL or DAG proxy.
   * Strictly validates that the target is genuine event artwork.
   */
  public extractVerifiedArtwork(rawUrl?: string | null): string | null {
    if (!rawUrl || typeof rawUrl !== 'string') return null;
    const cleaned = cleanServerArtworkUrl(rawUrl);
    if (cleaned && isGenuineEventArtwork(cleaned)) {
      return cleaned;
    }
    return null;
  }

  /**
   * Enriches an array of matches at the data level.
   * Modifies matches in place so that callers, lists, and navigation params
   * automatically receive authentic artwork.
   */
  public enrichMatches<T extends EnrichableMatch>(matches: T[]): T[] {
    if (!Array.isArray(matches) || matches.length === 0) return matches;

    const toEnqueue: Array<{ homeTeam: string; awayTeam: string; sport?: string; date?: string }> = [];

    matches.forEach(m => {
      // Retain max 100 active matches to prevent unbounded memory growth
      if (this.activeMatches.size > 100) {
        this.activeMatches.clear();
      }
      this.activeMatches.add(m);

      const { home, away } = this.getTeamNames(m);
      if (!home || !away) return;

      const rawArtwork =
        (m as any).poster ||
        (m as any).imageUrl ||
        (m as any).matchBannerUrl ||
        (m as any).background;

      // 1. Check if upstream data already carries verified match artwork
      const verifiedUpstream = this.extractVerifiedArtwork(rawArtwork);
      if (verifiedUpstream) {
        theSportsDbService.setCachedArtwork(home, away, verifiedUpstream);
        this.applyArtworkToMatch(m, verifiedUpstream);
        return;
      }

      // 2. Check if already in persistent / memory cache
      const cached = theSportsDbService.getCachedArtwork(home, away);
      if (cached) {
        this.applyArtworkToMatch(m, cached);
        return;
      }

      // 3. Queue for background resolution (strictly cap at 6 to prevent network saturation)
      if (toEnqueue.length < 6) {
        const rawDate = (m as any).rawDate || (m as any).kickoffDate;
        toEnqueue.push({
          homeTeam: home,
          awayTeam: away,
          sport: m.sport,
          date: rawDate,
        });
      }
    });

    if (toEnqueue.length > 0) {
      theSportsDbService.enqueueMatches(toEnqueue);
    }

    return matches;
  }

  /**
   * Applies the verified artwork URL to the appropriate fields of the match object.
   */
  private applyArtworkToMatch(match: EnrichableMatch, artworkUrl: string): void {
    if ('imageUrl' in match) {
      (match as LiveMatch).imageUrl = artworkUrl;
    }
    if ('matchBannerUrl' in match) {
      (match as DiscoverMatchup).matchBannerUrl = artworkUrl;
    }
    if ('poster' in match) {
      (match as any).poster = artworkUrl;
    }
  }

  /**
   * Handles artwork resolved by TheSportsDB service and updates matching objects.
   */
  private handleArtworkResolved(eventKey: string, artworkUrl: string): void {
    this.activeMatches.forEach(m => {
      const { home, away } = this.getTeamNames(m);
      const key = theSportsDbService.buildCacheKey(home, away, m.sport, m.competition, m.id);
      const baseKey = theSportsDbService.buildCacheKey(home, away);
      if (key === eventKey || baseKey === eventKey) {
        this.applyArtworkToMatch(m, artworkUrl);
      }
    });

    this.notifyListeners(eventKey, artworkUrl);
  }

  private periodicTimer: any = null;

  /**
   * Starts periodic background revalidation of active matches missing genuine artwork.
   * Runs every 60 seconds politely so that newly uploaded artwork or cleared rate limits
   * are automatically picked up without user interaction.
   */
  public startPeriodicEnrichment(intervalMs = 60000): void {
    if (this.periodicTimer) return;
    this.periodicTimer = setInterval(() => {
      this.recheckPendingMatches();
    }, intervalMs);
  }

  public stopPeriodicEnrichment(): void {
    if (this.periodicTimer) {
      clearInterval(this.periodicTimer);
      this.periodicTimer = null;
    }
  }

  private recheckPendingMatches(): void {
    if (this.activeMatches.size === 0) return;
    const pendingMatches = Array.from(this.activeMatches).filter(m => {
      const current = (m as any).imageUrl || (m as any).matchBannerUrl || (m as any).poster;
      return !isGenuineEventArtwork(current);
    });

    if (pendingMatches.length > 0) {
      this.enrichMatches(pendingMatches);
    }
  }

  /**
   * Subscribes a listener to receive notifications when any match is enriched.
   */
  public subscribe(listener: EnricherListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifies subscribers of newly enriched artwork.
   */
  private notifyListeners(eventKey: string, artworkUrl: string): void {
    this.listeners.forEach(fn => {
      try {
        fn(eventKey, artworkUrl);
      } catch {
        // Prevent subscriber errors
      }
    });
  }
}

export const matchArtworkEnricher = new MatchArtworkEnricher();
export default matchArtworkEnricher;
