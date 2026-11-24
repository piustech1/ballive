/**
 * BALLIVE Team Emblem Service
 * 
 * High-performance, centralized team badge fetching, persistent disk/memory caching,
 * in-flight request deduplication, and preloading engine.
 */

import * as FileSystem from 'expo-file-system';
import { getTeamCrest, DEFAULT_CREST } from '../utils/teamCrestResolver';

const EMBLEM_CACHE_DIR = `${FileSystem.cacheDirectory || FileSystem.documentDirectory || ''}team_emblems/`;

// Module-level in-memory cache: cacheKey -> resolved URI (local file:// or validated remote URL)
const memoryCache = new Map<string, string>();

// In-flight download deduplication: cacheKey -> Promise<string | null>
const inFlightDownloads = new Map<string, Promise<string | null>>();

// Known broken or 404 URLs to prevent repeated failing requests
const brokenUrlSet = new Set<string>();

let isDirInitialized = false;

async function ensureDirectoryExists(): Promise<void> {
  if (isDirInitialized) return;
  try {
    const dirInfo = await FileSystem.getInfoAsync(EMBLEM_CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(EMBLEM_CACHE_DIR, { intermediates: true });
    }
    isDirInitialized = true;
  } catch {
    // Graceful fallback if filesystem directory creation fails
    isDirInitialized = true;
  }
}

/**
 * Normalizes string into a safe filename/cache key.
 */
function sanitizeKey(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, '_')
    .slice(0, 48);
}

/**
 * Computes a fast alphanumeric hash for arbitrary URLs.
 */
function hashUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash << 5) - hash + url.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export class TeamEmblemService {
  /**
   * Generates a deterministic cache key based on stable team identity or URL.
   */
  public getCacheKey(
    teamId?: string | null,
    teamName?: string | null,
    uri?: string | null
  ): string {
    if (teamId && typeof teamId === 'string' && teamId.trim().length > 0) {
      return `team_${sanitizeKey(teamId)}`;
    }
    if (teamName && typeof teamName === 'string' && teamName.trim().length > 0) {
      return `name_${sanitizeKey(teamName)}`;
    }
    if (uri && typeof uri === 'string' && uri.trim().length > 0) {
      return `uri_${hashUrl(uri.trim())}`;
    }
    return 'universal_placeholder';
  }

  /**
   * Resolves the authoritative remote emblem URL for a team,
   * checking provided URLs, verified CDN mappings, and fallback shields.
   */
  public resolveRemoteUrl(
    teamIdentifierOrName?: string | null,
    providedUri?: string | null
  ): string {
    if (providedUri && typeof providedUri === 'string') {
      const trimmed = providedUri.trim();
      if (
        trimmed.length > 10 &&
        trimmed !== DEFAULT_CREST &&
        !trimmed.includes('ui-avatars.com') &&
        !trimmed.includes('default-team-logo') &&
        !brokenUrlSet.has(trimmed)
      ) {
        return trimmed;
      }
    }

    if (teamIdentifierOrName && typeof teamIdentifierOrName === 'string') {
      const resolved = getTeamCrest(teamIdentifierOrName);
      if (resolved && resolved !== DEFAULT_CREST && !brokenUrlSet.has(resolved)) {
        return resolved;
      }
    }

    return DEFAULT_CREST;
  }

  /**
   * Returns immediately from in-memory cache if already cached.
   */
  public getCachedUri(cacheKey: string): string | null {
    return memoryCache.get(cacheKey) || null;
  }

  /**
   * Fetches, persists, and caches a team emblem.
   * Deduplicates simultaneous requests and saves to local storage.
   */
  public async getOrFetchEmblem(
    teamId?: string | null,
    teamName?: string | null,
    providedUri?: string | null
  ): Promise<string> {
    const remoteUrl = this.resolveRemoteUrl(teamId || teamName, providedUri);

    // If unresolved or default crest, return fallback
    if (!remoteUrl || remoteUrl === DEFAULT_CREST || brokenUrlSet.has(remoteUrl)) {
      return DEFAULT_CREST;
    }

    const cacheKey = this.getCacheKey(teamId, teamName, remoteUrl);

    // 1. In-memory cache hit
    const inMem = memoryCache.get(cacheKey);
    if (inMem) {
      return inMem;
    }

    // 2. In-flight request deduplication
    const inFlight = inFlightDownloads.get(cacheKey);
    if (inFlight) {
      const result = await inFlight;
      return result || remoteUrl;
    }

    // 3. Persistent disk check & download
    const fetchPromise = (async (): Promise<string> => {
      try {
        await ensureDirectoryExists();
        const diskFile = `${EMBLEM_CACHE_DIR}${cacheKey}.png`;
        const fileInfo = await FileSystem.getInfoAsync(diskFile);

        if (fileInfo.exists && (fileInfo as any).size > 100) {
          memoryCache.set(cacheKey, diskFile);
          return diskFile;
        }

        // Download image to persistent cache directory
        const downloadResult = await FileSystem.downloadAsync(remoteUrl, diskFile);
        if (downloadResult.status === 200) {
          memoryCache.set(cacheKey, diskFile);
          return diskFile;
        } else {
          brokenUrlSet.add(remoteUrl);
          return remoteUrl;
        }
      } catch {
        // Return remote URL on network/filesystem failure
        return remoteUrl;
      } finally {
        inFlightDownloads.delete(cacheKey);
      }
    })();

    inFlightDownloads.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  /**
   * Efficient batch preloader for visible or soon-to-be-visible matches.
   * Warms the cache in background without blocking rendering.
   */
  public preloadEmblems(
    items: Array<{ teamId?: string; teamName?: string; crestUrl?: string }>
  ): void {
    if (!items || items.length === 0) return;

    // Run asynchronously without awaiting
    (async () => {
      const batch = items.slice(0, 16); // Throttled batch limit
      for (const item of batch) {
        if (item.crestUrl || item.teamName || item.teamId) {
          this.getOrFetchEmblem(item.teamId, item.teamName, item.crestUrl).catch(() => {});
        }
      }
    })();
  }

  /**
   * Records a URL failure so future requests skip network retry.
   */
  public markBroken(url?: string | null): void {
    if (url && typeof url === 'string') {
      brokenUrlSet.add(url.trim());
    }
  }

  /**
   * Checks if a URL is known to be broken.
   */
  public isBroken(url?: string | null): boolean {
    if (!url || typeof url !== 'string') return true;
    return brokenUrlSet.has(url.trim());
  }
}

export const teamEmblemService = new TeamEmblemService();
export default teamEmblemService;
