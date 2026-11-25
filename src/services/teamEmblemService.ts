/**
 * BALLIVE Team Emblem & Competition Badge Preload Coordinator
 *
 * Delegates storage, deduplication, priority queueing, retry logic, and
 * corrupt-file recovery to the shared `imageCacheService`.
 */

import { getTeamCrest, DEFAULT_CREST } from '../utils/teamCrestResolver';
import { imageCacheService, ImagePriority, normalizeImageUrl } from './imageCacheService';
import { normalizeTeamId } from './profileStorage';

function isValidNonDefault(url?: string | null): string | null {
  const norm = normalizeImageUrl(url);
  if (!norm || norm === DEFAULT_CREST) return null;
  return norm;
}

export class TeamEmblemService {
  /**
   * Builds a stable normalized entity key for cross-screen disk lookup
   * (especially offline launches where API URLs may be absent).
   */
  public getEntityKey(teamId?: string | null, teamName?: string | null): string | null {
    if (teamName && typeof teamName === 'string' && teamName.trim().length > 0) {
      const cleanName = teamName.trim();
      if (!['opponent', 'tbd', 'tba', 'unknown', 'none'].includes(cleanName.toLowerCase())) {
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
    providedUri?: string | null
  ): string[] {
    const out: string[] = [];
    const seen = new Set<string>();

    const add = (candidate?: string | null) => {
      const clean = isValidNonDefault(candidate);
      if (clean && !seen.has(clean)) {
        seen.add(clean);
        out.push(clean);
      }
    };

    // 1. Explicit verified API URL
    add(providedUri);

    // 2. Team name CDN match (skip generic placeholders)
    if (teamName && typeof teamName === 'string' && teamName.trim().length > 1) {
      const nameResolved = getTeamCrest(teamName.trim());
      if (nameResolved !== DEFAULT_CREST) {
        add(nameResolved);
      }
    }

    // 3. Team ID CDN match (if distinct from name)
    if (teamId && typeof teamId === 'string' && teamId.trim().length > 1) {
      const idResolved = getTeamCrest(teamId.trim());
      if (idResolved !== DEFAULT_CREST) {
        add(idResolved);
      }
    }

    return out;
  }

  /**
   * Preserved compatibility signature returning a deterministic key.
   */
  public getCacheKey(
    teamId?: string | null,
    teamName?: string | null,
    uri?: string | null
  ): string {
    const candidates = this.buildCandidates(teamId, teamName, uri);
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
    teamName?: string | null
  ): string {
    const candidates = this.buildCandidates(teamIdentifierOrName, teamName || teamIdentifierOrName, providedUri);
    return candidates[0] || DEFAULT_CREST;
  }

  /**
   * Synchronous memory cache check.
   */
  public getCachedUri(
    teamId?: string | null,
    teamName?: string | null,
    providedUri?: string | null
  ): string | null {
    const candidates = this.buildCandidates(teamId, teamName, providedUri);
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
    priority: ImagePriority = 0
  ): Promise<string> {
    const candidates = this.buildCandidates(teamId, teamName, providedUri);
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

    return resolved || DEFAULT_CREST;
  }

  /**
   * Non-blocking prioritized batch preloader.
   */
  public preloadEmblems(
    items: Array<{ teamId?: string; teamName?: string; crestUrl?: string; priority?: ImagePriority }>
  ): void {
    if (!items || items.length === 0) return;

    const specs = items
      .map(item => ({
        entityKey: this.getEntityKey(item.teamId, item.teamName),
        category: 'team' as const,
        candidates: this.buildCandidates(item.teamId, item.teamName, item.crestUrl),
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
