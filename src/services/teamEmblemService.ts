/**
 * BALLIVE Team Emblem & Competition Badge Preload Coordinator
 *
 * Delegates storage, deduplication, priority queueing, retry logic, and
 * corrupt-file recovery to the shared `imageCacheService`.
 */

import { getTeamCrest, DEFAULT_CREST } from '../utils/teamCrestResolver';
import { isPlaceholderParticipant, normalizeParticipantEntity } from '../utils/fixtureValidator';
import { imageCacheService, ImagePriority, normalizeImageUrl } from './imageCacheService';
import { normalizeTeamId } from './profileStorage';

function isValidNonDefault(url?: string | null): string | null {
  const norm = normalizeImageUrl(url);
  if (!norm || norm === DEFAULT_CREST) return null;
  return norm;
}

const DYNAMIC_CREST_ALIASES: Record<string, string> = {
  'kcca': 'Kampala Capital City Authority',
  'kcca fc': 'Kampala Capital City Authority',
  'ura': 'URA',
  'ura fc': 'URA',
  'ura sc': 'URA',
  'bul': 'BUL Jinja',
  'bul fc': 'BUL Jinja',
  'express': 'Express',
  'express fc': 'Express',
  'vipers': 'Vipers',
  'vipers sc': 'Vipers',
  'sc villa': 'SC Villa',
  'villa': 'SC Villa',
  'hearts of midlothian': 'Heart of Midlothian',
};

export class TeamEmblemService {
  private dynamicLookupMemory = new Map<string, string | null>();
  private inFlightDynamicLookups = new Map<string, Promise<string | null>>();
  private lastTsdbRequestMs = 0;

  /**
   * Builds a stable normalized entity key for cross-screen disk lookup
   * (especially offline launches where API URLs may be absent).
   */
  public getEntityKey(teamId?: string | null, teamName?: string | null): string | null {
    if (teamName && typeof teamName === 'string' && teamName.trim().length > 0) {
      const cleanName = teamName.trim();
      if (!isPlaceholderParticipant(cleanName)) {
        return `team:${normalizeTeamId(cleanName)}`;
      }
    }
    if (teamId && typeof teamId === 'string' && teamId.trim().length > 0) {
      return `team:${normalizeTeamId(teamId.trim())}`;
    }
    return null;
  }

  /**
   * Builds an ordered list of candidate emblem URLs:
   * 1. Verified upstream API URL (`providedUri`)
   * 2. Verified CDN badge via `teamName` (never short-circuited by opaque `teamId`)
   * 3. Verified CDN badge via `teamId`
   */
  public buildCandidates(
    teamId?: string | null,
    teamName?: string | null,
    providedUri?: string | null,
    sport?: string | null
  ): string[] {
    const out: string[] = [];
    const seen = new Set<string>();
    const sp = (sport || '').toLowerCase().trim();
    const isSoccerHint = sp === 'soccer' || sp === 'football' || sp === 'association football';

    const add = (candidate?: string | null) => {
      const clean = isValidNonDefault(candidate);
      if (!clean || seen.has(clean)) return;
      if (isSoccerHint && /\/teamlogos\/(nba|nhl|nfl|ncaa)\//i.test(clean)) return;
      seen.add(clean);
      out.push(clean);
    };

    // 1. Explicit verified API URL (unless it's a placeholder/invalid format filtered by normalizeImageUrl)
    add(providedUri);

    // 2. Team name CDN match (skip generic placeholders)
    if (teamName && typeof teamName === 'string' && teamName.trim().length > 1) {
      const nameResolved = getTeamCrest(teamName.trim(), sport);
      if (nameResolved !== DEFAULT_CREST) {
        add(nameResolved);
      }
    }

    // 3. Team ID CDN match (if distinct from name)
    if (teamId && typeof teamId === 'string' && teamId.trim().length > 1) {
      const idResolved = getTeamCrest(teamId.trim(), sport);
      if (idResolved !== DEFAULT_CREST) {
        add(idResolved);
      }
    }

    return out;
  }

  /**
   * Resolves a missing crest dynamically via TheSportsDB when static maps & upstream URL are absent,
   * persists the resolved emblem to disk under `entityKey`, and deduplicates concurrent requests.
   */
  public async lookupDynamicCrest(
    teamName?: string | null,
    sport?: string | null,
    teamId?: string | null
  ): Promise<string | null> {
    if (!teamName || isPlaceholderParticipant(teamName)) return null;

    const localStatic = getTeamCrest(teamName, sport);
    if (localStatic !== DEFAULT_CREST) return localStatic;

    const entityKey = this.getEntityKey(teamId, teamName);
    if (entityKey) {
      await imageCacheService.init();
      const cachedDisk = imageCacheService.getImmediateCachedUri('team', [], entityKey);
      if (cachedDisk) return cachedDisk;
    }

    const cacheKey = `${normalizeParticipantEntity(teamName)}|${(sport || '').toLowerCase()}`;
    if (!cacheKey || cacheKey.startsWith('|')) return null;

    if (this.dynamicLookupMemory.has(cacheKey)) {
      return this.dynamicLookupMemory.get(cacheKey) || null;
    }
    if (this.inFlightDynamicLookups.has(cacheKey)) {
      return this.inFlightDynamicLookups.get(cacheKey)!;
    }

    const promise = (async (): Promise<string | null> => {
      try {
        const lowerRaw = teamName.toLowerCase().trim();
        const searchTerm =
          DYNAMIC_CREST_ALIASES[lowerRaw] ||
          teamName
            .replace(/\b(fc|cf|sc|afc|ac|club|the)\b/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim() ||
          teamName.trim();

        // Meter requests gently to avoid TheSportsDB 429 burst limits
        const now = Date.now();
        const waitMs = Math.max(0, this.lastTsdbRequestMs + 350 - now);
        if (waitMs > 0) {
          await new Promise(r => setTimeout(r, waitMs));
        }
        this.lastTsdbRequestMs = Date.now();

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4500);
        const res = await fetch(
          `https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=${encodeURIComponent(searchTerm)}`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);

        if (!res.ok) return null;
        const json = await res.json();
        const teams: any[] = json?.teams || [];
        if (!Array.isArray(teams) || teams.length === 0) {
          this.dynamicLookupMemory.set(cacheKey, null);
          return null;
        }

        const wantWomen = /\b(women|femeni|femenino|wfc|ladies)\b/i.test(teamName);
        const targetNorm = normalizeParticipantEntity(teamName);
        const aliasNorm = normalizeParticipantEntity(searchTerm);
        const wantSport = (sport || '').toLowerCase();

        const matched = teams.find(t => {
          const tName = String(t?.strTeam || '');
          const isWomen = /\b(women|femeni|femenino|wfc|ladies|w)\b/i.test(tName);
          if (isWomen !== wantWomen) return false;

          const tSport = String(t?.strSport || '').toLowerCase();
          if (wantSport) {
            const expectedTsdb =
              wantSport === 'american_football'
                ? 'american football'
                : wantSport === 'hockey'
                ? 'ice hockey'
                : wantSport;
            if (tSport && tSport !== expectedTsdb) return false;
          }

          const candNorm = normalizeParticipantEntity(tName);
          const altNorm = normalizeParticipantEntity(t?.strTeamAlternate || '');
          return (
            candNorm === targetNorm ||
            candNorm === aliasNorm ||
            (altNorm && (altNorm === targetNorm || altNorm.includes(targetNorm))) ||
            (candNorm.length >= 4 && targetNorm.length >= 4 && (candNorm.includes(targetNorm) || targetNorm.includes(candNorm)))
          );
        });

        const badgeUrl = normalizeImageUrl(matched?.strBadge || matched?.strTeamBadge);
        if (!badgeUrl) {
          this.dynamicLookupMemory.set(cacheKey, null);
          return null;
        }

        this.dynamicLookupMemory.set(cacheKey, badgeUrl);
        if (entityKey) {
          const cachedFile = await imageCacheService.resolveImage({
            entityKey,
            category: 'team',
            candidates: [badgeUrl],
            priority: 1,
          });
          if (cachedFile) {
            return cachedFile;
          }
        }
        return badgeUrl;
      } catch {
        return null;
      } finally {
        this.inFlightDynamicLookups.delete(cacheKey);
      }
    })();

    this.inFlightDynamicLookups.set(cacheKey, promise);
    return promise;
  }

  /**
   * Preserved compatibility signature returning a deterministic key.
   */
  public getCacheKey(
    teamId?: string | null,
    teamName?: string | null,
    uri?: string | null,
    sport?: string | null
  ): string {
    const candidates = this.buildCandidates(teamId, teamName, uri, sport);
    if (candidates.length > 0) {
      return imageCacheService.getUrlKey('team', candidates[0]);
    }
    return this.getEntityKey(teamId, teamName) || 'universal_placeholder';
  }

  /**
   * Resolves best remote CDN URL across provided URI, teamName, and teamId.
   */
  public resolveRemoteUrl(
    teamIdentifierOrName?: string | null,
    providedUri?: string | null,
    teamName?: string | null,
    sport?: string | null
  ): string {
    const candidates = this.buildCandidates(teamIdentifierOrName, teamName || teamIdentifierOrName, providedUri, sport);
    return candidates[0] || DEFAULT_CREST;
  }

  /**
   * Synchronous memory cache check.
   */
  public getCachedUri(
    teamId?: string | null,
    teamName?: string | null,
    providedUri?: string | null,
    sport?: string | null
  ): string | null {
    const candidates = this.buildCandidates(teamId, teamName, providedUri, sport);
    const entityKey = this.getEntityKey(teamId, teamName);
    return imageCacheService.getImmediateCachedUri('team', candidates, entityKey);
  }

  /**
   * Fetches, validates, deduplicates, and persistently caches a team emblem.
   */
  public async getOrFetchEmblem(
    teamId?: string | null,
    teamName?: string | null,
    providedUri?: string | null,
    priority: ImagePriority = 0,
    sport?: string | null
  ): Promise<string> {
    const candidates = this.buildCandidates(teamId, teamName, providedUri, sport);
    const entityKey = this.getEntityKey(teamId, teamName);

    if (candidates.length === 0 && !entityKey) {
      return DEFAULT_CREST;
    }

    const resolved = await imageCacheService.resolveImage({
      entityKey,
      category: 'team',
      candidates,
      priority,
    });

    if (resolved) return resolved;

    if (candidates.length === 0 && teamName && priority <= 1) {
      const dynamicResolved = await this.lookupDynamicCrest(teamName, sport, teamId);
      if (dynamicResolved) return dynamicResolved;
    }

    return DEFAULT_CREST;
  }

  /**
   * Non-blocking prioritized batch preloader.
   */
  public preloadEmblems(
    items: Array<{ teamId?: string; teamName?: string; crestUrl?: string; sport?: string; priority?: ImagePriority }>
  ): void {
    if (!items || items.length === 0) return;

    const specs = items
      .map(item => ({
        entityKey: this.getEntityKey(item.teamId, item.teamName),
        category: 'team' as const,
        candidates: this.buildCandidates(item.teamId, item.teamName, item.crestUrl, item.sport),
        priority: item.priority ?? (2 as ImagePriority),
      }))
      .filter(s => s.candidates.length > 0);

    imageCacheService.preload(specs);
  }

  public markBroken(url?: string | null): void {
    if (url) {
      imageCacheService.reportLoadError(url, 'team').catch(() => {});
    }
  }
}

export const teamEmblemService = new TeamEmblemService();
export default teamEmblemService;
