/**
 * BALLIVE Unified Persistent Image Cache & Prioritized Preloading Engine
 *
 * Manages fast in-memory + persistent Expo FileSystem disk caching for:
 * - Team crests (`team`)
 * - Competition emblems (`competition`)
 * - Extended Hero photographs (`hero`)
 *
 * Key Guarantees:
 * 1. Two-level index (`entityKey -> urlKey -> localFileUri`):
 *    - Same asset URL shared across screens resolves to 1 disk file & 1 download.
 *    - Changing a URL for an entity automatically downloads & revalidates without stale bytes.
 *    - Offline launches still resolve last-known local file by stable entityKey even when
 *      remote network or temporary URL is unavailable.
 * 2. Single-call directory reconciliation during `init()` validates all disk files in O(1) FS call.
 * 3. Atomic `.tmp` downloads + HTTP status + Content-Type + byte-size verification prevent
 *    HTML error pages or 0-byte writes from poisoning the cache.
 * 4. Priority-ordered download queue (0=visible, 1=live, 2=upcoming, 3=featured/explore,
 *    4=followed, 5=background) capped at 4 concurrent workers with transient-error backoff.
 */

import * as FileSystem from 'expo-file-system';
import { DEFAULT_CREST } from '../utils/teamCrestResolver';

export type ImageCategory = 'team' | 'competition' | 'hero' | 'player' | 'flag';

/**
 * 0 = currently visible on screen
 * 1 = live matches
 * 2 = upcoming matches
 * 3 = featured / explore competitions
 * 4 = followed teams / leagues
 * 5 = background catalog teams
 */
export type ImagePriority = 0 | 1 | 2 | 3 | 4 | 5;

export interface ImageCacheSpec {
  entityKey?: string | null;
  category: ImageCategory;
  candidates: Array<string | null | undefined>;
  priority?: ImagePriority;
}

interface ManifestEntry {
  urlKey: string;
  sourceUrl: string;
  fileName: string;
  category: ImageCategory;
  cachedAt: number;
  lastAccessedAt: number;
  byteSize: number;
}

interface PersistedManifest {
  version: number;
  entries: Record<string, ManifestEntry>;
  entityMap: Record<string, string>;
}

interface QueueJob {
  urlKey: string;
  url: string;
  category: ImageCategory;
  priority: ImagePriority;
  entityKey?: string | null;
  resolve: (fileUri: string | null) => void;
}

const BASE_DIR = FileSystem?.cacheDirectory || FileSystem?.documentDirectory || '';
const CACHE_DIR = BASE_DIR ? `${BASE_DIR}ballive_img_cache_v1/` : '';
const MANIFEST_FILE = CACHE_DIR ? `${CACHE_DIR}manifest_v1.json` : '';
const LEGACY_CACHE_DIR = BASE_DIR ? `${BASE_DIR}team_emblems/` : '';

const MAX_CONCURRENT_DOWNLOADS = 4;
const CACHE_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const TRANSIENT_COOLDOWN_MS = 60 * 1000; // Retry transient failures after 60s
const HARD_FAILURE_COOLDOWN_MS = 15 * 60 * 1000; // Skip 404/400/corrupt URLs for 15m
const MAX_RETRY_ATTEMPTS = 2;

const TRUSTED_HTTPS_UPGRADE_HOSTS = [
  'a.espncdn.com',
  'media.api-sports.io',
  'r2.thesportsdb.com',
  'www.thesportsdb.com',
  'crests.football-data.org',
  'upload.wikimedia.org',
  'thumb.wikimedia.org',
];

export function normalizeImageUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let url = rawUrl.trim();
  if (!url || url.length < 10) return null;

  if (url.startsWith('//')) {
    url = `https:${url}`;
  } else if (url.startsWith('http://')) {
    const lowerHostCheck = url.slice(7).toLowerCase();
    if (TRUSTED_HTTPS_UPGRADE_HOSTS.some(h => lowerHostCheck.startsWith(h))) {
      url = `https://${url.slice(7)}`;
    }
  }

  if (url.startsWith('file://')) return url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return null;

  const lower = url.toLowerCase();
  // Filter known placeholder URLs and unsupported rasterized formats (SVG fails on RN Image Android)
  if (
    lower === DEFAULT_CREST.toLowerCase() ||
    lower.includes('default-team-logo') ||
    lower.includes('ui-avatars.com') ||
    /\.svg(?:\?|$)/i.test(lower)
  ) {
    return null;
  }

  return url;
}

function hashString(str: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 = (h2 * 33) ^ ch;
  }
  return `${(h1 >>> 0).toString(36)}_${(h2 >>> 0).toString(36)}`;
}

function guessExtension(url: string, contentType?: string | null): string {
  const ct = (contentType || '').toLowerCase();
  if (ct.includes('webp')) return 'webp';
  if (ct.includes('jpeg') || ct.includes('jpg')) return 'jpg';
  if (ct.includes('png')) return 'png';
  const pathOnly = url.split('?')[0].toLowerCase();
  if (pathOnly.endsWith('.jpg') || pathOnly.endsWith('.jpeg')) return 'jpg';
  if (pathOnly.endsWith('.webp')) return 'webp';
  return 'png';
}

class ImageCacheService {
  private memoryByUrlKey = new Map<string, string>();
  private manifestEntries = new Map<string, ManifestEntry>();
  private entityToUrlKey = new Map<string, string>();

  // In-flight deduplication by urlKey
  private inFlightByUrlKey = new Map<string, Promise<string | null>>();

  // Cooldown map instead of permanent session poisoning
  private failureCooldown = new Map<string, number>();

  // Controlled priority queue
  private queue: QueueJob[] = [];
  private queuedByUrlKey = new Map<string, QueueJob>();
  private activeWorkers = 0;

  private initPromise: Promise<void> | null = null;
  private isInitialized = false;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  public getUrlKey(category: ImageCategory, normalizedUrl: string): string {
    return `${category}_${hashString(normalizedUrl)}`;
  }

  /**
   * Initializes persistent cache directory and hydrates the in-memory index
   * using a single readDirectoryAsync scan.
   */
  public init(): Promise<void> {
    if (this.isInitialized) return Promise.resolve();
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      if (!CACHE_DIR || !FileSystem?.getInfoAsync) {
        this.isInitialized = true;
        return;
      }

      try {
        const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
        }

        // Remove legacy v0 emblem folder asynchronously so stale unversioned PNGs don't waste space
        if (LEGACY_CACHE_DIR) {
          FileSystem.deleteAsync(LEGACY_CACHE_DIR, { idempotent: true }).catch(() => {});
        }

        const [filesOnDisk, manifestInfo] = await Promise.all([
          FileSystem.readDirectoryAsync(CACHE_DIR).catch(() => [] as string[]),
          MANIFEST_FILE ? FileSystem.getInfoAsync(MANIFEST_FILE).catch(() => ({ exists: false })) : Promise.resolve({ exists: false }),
        ]);

        const diskSet = new Set(filesOnDisk);
        const now = Date.now();
        let dirty = false;

        if (manifestInfo.exists && MANIFEST_FILE) {
          const raw = await FileSystem.readAsStringAsync(MANIFEST_FILE).catch(() => '');
          if (raw) {
            const parsed: PersistedManifest = JSON.parse(raw);
            if (parsed?.version === 1 && parsed.entries) {
              Object.entries(parsed.entries).forEach(([urlKey, entry]) => {
                if (
                  entry &&
                  entry.fileName &&
                  diskSet.has(entry.fileName) &&
                  entry.byteSize >= 150
                ) {
                  this.manifestEntries.set(urlKey, entry);
                  this.memoryByUrlKey.set(urlKey, `${CACHE_DIR}${entry.fileName}`);
                  if (now - entry.cachedAt > CACHE_TTL_MS) {
                    dirty = true;
                  }
                } else {
                  dirty = true;
                }
              });
            }
            if (parsed?.entityMap) {
              Object.entries(parsed.entityMap).forEach(([entityKey, urlKey]) => {
                if (this.memoryByUrlKey.has(urlKey)) {
                  this.entityToUrlKey.set(entityKey, urlKey);
                } else {
                  dirty = true;
                }
              });
            }
          }
        }

        // Clean orphan temp files on startup
        filesOnDisk
          .filter(name => name.endsWith('.tmp'))
          .forEach(tmp => {
            FileSystem.deleteAsync(`${CACHE_DIR}${tmp}`, { idempotent: true }).catch(() => {});
          });

        if (dirty) {
          this.scheduleSaveManifest();
        }
      } catch {
        // Non-fatal: continue gracefully with network + memory cache
      } finally {
        this.isInitialized = true;
      }
    })();

    return this.initPromise;
  }

  /**
   * Synchronous zero-latency lookup in memory cache.
   */
  public getImmediateCachedUri(
    category: ImageCategory,
    candidates: Array<string | null | undefined>,
    entityKey?: string | null
  ): string | null {
    for (const raw of candidates) {
      const url = normalizeImageUrl(raw);
      if (!url) continue;
      if (url.startsWith('file://')) return url;
      const urlKey = this.getUrlKey(category, url);
      const hit = this.memoryByUrlKey.get(urlKey);
      if (hit) {
        if (entityKey) this.entityToUrlKey.set(entityKey, urlKey);
        return hit;
      }
    }

    if (entityKey) {
      const linkedUrlKey = this.entityToUrlKey.get(entityKey);
      if (linkedUrlKey) {
        const hit = this.memoryByUrlKey.get(linkedUrlKey);
        if (hit) return hit;
      }
    }

    return null;
  }

  /**
   * Resolves the best playable local `file://` URI (or valid remote URI fallback if offline/FS skipped)
   * across an ordered candidate list, deduplicating in-flight downloads and enforcing queue priority.
   */
  public async resolveImage(spec: ImageCacheSpec): Promise<string | null> {
    await this.init();

    const priority: ImagePriority = spec.priority ?? 2;
    const normalizedCandidates: string[] = [];
    const seen = new Set<string>();

    for (const raw of spec.candidates) {
      const clean = normalizeImageUrl(raw);
      if (clean && !seen.has(clean)) {
        seen.add(clean);
        normalizedCandidates.push(clean);
      }
    }

    // 1. Check & download ordered candidates by exact URL hash (never let stale entityKey mask a new URL)
    const now = Date.now();
    for (const url of normalizedCandidates) {
      if (url.startsWith('file://')) return url;
      const urlKey = this.getUrlKey(spec.category, url);

      const cached = this.memoryByUrlKey.get(urlKey);
      if (cached) {
        if (spec.entityKey) this.entityToUrlKey.set(spec.entityKey, urlKey);
        const entry = this.manifestEntries.get(urlKey);
        if (entry) {
          entry.lastAccessedAt = now;
          if (now - entry.cachedAt > CACHE_TTL_MS) {
            this.enqueueDownload(urlKey, url, spec.category, 5, spec.entityKey).catch(() => {});
          }
        }
        return cached;
      }

      const cooldownUntil = this.failureCooldown.get(urlKey);
      if (cooldownUntil && now < cooldownUntil) {
        continue;
      }

      const downloaded = await this.enqueueDownload(urlKey, url, spec.category, priority, spec.entityKey);
      if (downloaded) {
        return downloaded;
      }
    }

    // 3. Offline last-resort: return entity-mapped cached file even if URL hash differed
    if (spec.entityKey) {
      const linkedUrlKey = this.entityToUrlKey.get(spec.entityKey);
      if (linkedUrlKey) {
        const cached = this.memoryByUrlKey.get(linkedUrlKey);
        if (cached) return cached;
      }
    }

    // 4. Final fallback: return first non-cooled remote URL for React Native <Image> to try directly
    for (const url of normalizedCandidates) {
      const urlKey = this.getUrlKey(spec.category, url);
      const cooldownUntil = this.failureCooldown.get(urlKey);
      if (!cooldownUntil || now >= cooldownUntil) {
        return url;
      }
    }

    return null;
  }

  /**
   * Non-blocking prioritized preloader for background warming.
   */
  public preload(specs: ImageCacheSpec[]): void {
    if (!specs || specs.length === 0) return;

    (async () => {
      await this.init();
      const seenUrlKeys = new Set<string>();

      for (const spec of specs) {
        const candidates = spec.candidates
          .map(normalizeImageUrl)
          .filter((u): u is string => Boolean(u));
        if (candidates.length === 0) continue;

        const first = candidates[0];
        if (first.startsWith('file://')) continue;
        const urlKey = this.getUrlKey(spec.category, first);
        if (seenUrlKeys.has(urlKey) || this.memoryByUrlKey.has(urlKey)) {
          if (spec.entityKey && this.memoryByUrlKey.has(urlKey)) {
            this.entityToUrlKey.set(spec.entityKey, urlKey);
          }
          continue;
        }
        seenUrlKeys.add(urlKey);

        this.resolveImage({
          ...spec,
          priority: spec.priority ?? 3,
        }).catch(() => {});
      }
    })();
  }

  /**
   * Marks a failed image URI. If a local disk file failed decoding, removes it cleanly
   * so next attempt re-fetches instead of getting stuck on a corrupt file.
   */
  public async reportLoadError(
    failedUri?: string | null,
    category: ImageCategory = 'team'
  ): Promise<void> {
    if (!failedUri) return;
    const trimmed = failedUri.trim();

    if (trimmed.startsWith('file://')) {
      for (const [uk, pathUri] of this.memoryByUrlKey.entries()) {
        if (pathUri === trimmed) {
          this.memoryByUrlKey.delete(uk);
          const entry = this.manifestEntries.get(uk);
          if (entry) {
            this.failureCooldown.set(uk, Date.now() + TRANSIENT_COOLDOWN_MS);
          }
          this.manifestEntries.delete(uk);
          this.scheduleSaveManifest();
          break;
        }
      }
      FileSystem?.deleteAsync?.(trimmed, { idempotent: true }).catch(() => {});
      return;
    }

    const norm = normalizeImageUrl(trimmed);
    if (norm) {
      const uk = this.getUrlKey(category, norm);
      this.failureCooldown.set(uk, Date.now() + TRANSIENT_COOLDOWN_MS);
    }
  }

  public async clearCache(): Promise<void> {
    this.memoryByUrlKey.clear();
    this.manifestEntries.clear();
    this.entityToUrlKey.clear();
    this.failureCooldown.clear();
    if (CACHE_DIR && FileSystem?.deleteAsync) {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true }).catch(() => {});
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true }).catch(() => {});
    }
  }

  private enqueueDownload(
    urlKey: string,
    url: string,
    category: ImageCategory,
    priority: ImagePriority,
    entityKey?: string | null
  ): Promise<string | null> {
    // 1. Existing in-flight download deduplication
    const inFlight = this.inFlightByUrlKey.get(urlKey);
    if (inFlight) {
      const existingJob = this.queuedByUrlKey.get(urlKey);
      if (existingJob && priority < existingJob.priority) {
        existingJob.priority = priority;
        this.sortQueue();
      }
      return inFlight;
    }

    // 2. Enqueue new controlled job
    const promise = new Promise<string | null>(resolve => {
      const job: QueueJob = {
        urlKey,
        url,
        category,
        priority,
        entityKey,
        resolve,
      };
      this.queue.push(job);
      this.queuedByUrlKey.set(urlKey, job);
      this.sortQueue();
      this.pumpQueue();
    });

    this.inFlightByUrlKey.set(urlKey, promise);
    promise.finally(() => {
      this.inFlightByUrlKey.delete(urlKey);
    });

    return promise;
  }

  private sortQueue(): void {
    if (this.queue.length > 1) {
      this.queue.sort((a, b) => a.priority - b.priority);
    }
  }

  private pumpQueue(): void {
    while (this.activeWorkers < MAX_CONCURRENT_DOWNLOADS && this.queue.length > 0) {
      const job = this.queue.shift()!;
      this.queuedByUrlKey.delete(job.urlKey);
      this.activeWorkers++;

      this.executeDownloadWithRetry(job)
        .then(result => {
          job.resolve(result);
        })
        .catch(() => {
          job.resolve(null);
        })
        .finally(() => {
          this.activeWorkers--;
          this.pumpQueue();
        });
    }
  }

  private async executeDownloadWithRetry(job: QueueJob): Promise<string | null> {
    if (!CACHE_DIR || !FileSystem?.downloadAsync) {
      return job.url;
    }

    for (let attempt = 0; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, attempt === 1 ? 350 : 1000));
      }

      const tmpFile = `${CACHE_DIR}${job.urlKey}_${attempt}.tmp`;
      try {
        const result = await FileSystem.downloadAsync(job.url, tmpFile, {
          headers: {
            Accept: 'image/png,image/jpeg,image/webp,image/*;q=0.8',
          },
        });

        const status = result?.status || 0;
        if (status === 404 || status === 410 || status === 400) {
          FileSystem.deleteAsync(tmpFile, { idempotent: true }).catch(() => {});
          this.failureCooldown.set(job.urlKey, Date.now() + HARD_FAILURE_COOLDOWN_MS);
          return null;
        }

        if (status !== 200) {
          FileSystem.deleteAsync(tmpFile, { idempotent: true }).catch(() => {});
          continue; // Retry transient 429/5xx
        }

        // Check response headers for non-image HTML error bodies
        const headers = result?.headers || {};
        const ctHeader =
          headers['content-type'] ||
          headers['Content-Type'] ||
          headers['CONTENT-TYPE'] ||
          '';
        if (ctHeader && !ctHeader.toLowerCase().includes('image/') && !ctHeader.toLowerCase().includes('octet-stream')) {
          FileSystem.deleteAsync(tmpFile, { idempotent: true }).catch(() => {});
          this.failureCooldown.set(job.urlKey, Date.now() + HARD_FAILURE_COOLDOWN_MS);
          return null;
        }

        const info = await FileSystem.getInfoAsync(tmpFile);
        const byteSize = (info as any)?.size ?? 0;
        if (!info.exists || byteSize < 150) {
          FileSystem.deleteAsync(tmpFile, { idempotent: true }).catch(() => {});
          continue;
        }

        const ext = guessExtension(job.url, ctHeader);
        const fileName = `${job.urlKey}.${ext}`;
        const finalUri = `${CACHE_DIR}${fileName}`;

        await FileSystem.deleteAsync(finalUri, { idempotent: true }).catch(() => {});
        await FileSystem.moveAsync({ from: tmpFile, to: finalUri });

        const now = Date.now();
        this.memoryByUrlKey.set(job.urlKey, finalUri);
        this.manifestEntries.set(job.urlKey, {
          urlKey: job.urlKey,
          sourceUrl: job.url,
          fileName,
          category: job.category,
          cachedAt: now,
          lastAccessedAt: now,
          byteSize,
        });
        if (job.entityKey) {
          this.entityToUrlKey.set(job.entityKey, job.urlKey);
        }
        this.failureCooldown.delete(job.urlKey);
        this.scheduleSaveManifest();

        return finalUri;
      } catch {
        FileSystem.deleteAsync(tmpFile, { idempotent: true }).catch(() => {});
      }
    }

    this.failureCooldown.set(job.urlKey, Date.now() + TRANSIENT_COOLDOWN_MS);
    return null;
  }

  private scheduleSaveManifest(): void {
    if (!MANIFEST_FILE || !FileSystem?.writeAsStringAsync) return;
    if (this.saveTimer) return;

    this.saveTimer = setTimeout(async () => {
      this.saveTimer = null;
      try {
        // Retain up to 600 most recently accessed items cleanly
        const sortedEntries = Array.from(this.manifestEntries.entries())
          .sort((a, b) => b[1].lastAccessedAt - a[1].lastAccessedAt)
          .slice(0, 600);

        const keptKeys = new Set(sortedEntries.map(([k]) => k));
        const entriesObj: Record<string, ManifestEntry> = {};
        sortedEntries.forEach(([k, v]) => {
          entriesObj[k] = v;
        });

        const entityObj: Record<string, string> = {};
        this.entityToUrlKey.forEach((uk, ek) => {
          if (keptKeys.has(uk)) entityObj[ek] = uk;
        });

        const payload: PersistedManifest = {
          version: 1,
          entries: entriesObj,
          entityMap: entityObj,
        };
        await FileSystem.writeAsStringAsync(MANIFEST_FILE, JSON.stringify(payload));
      } catch {
        // ignore disk save failure
      }
    }, 800);
  }
}

export const imageCacheService = new ImageCacheService();
export default imageCacheService;
