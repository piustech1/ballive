import * as FileSystem from 'expo-file-system';
import { DiscoverMatchup } from '../constants/discoverData';
import { LiveMatch } from '../constants/mockData';
import { normalizeMatchStatus, parseKickoffTimestamp } from '../utils/matchStatus';
import { sportsApiService } from './sportsApiService';
import { ProfileStorage } from './profileStorage';

export interface SavedMatchRecord {
  id: string;
  competition: string;
  competitionLogo?: string;
  sport: string;
  homeTeam: {
    id: string;
    name: string;
    crestUrl?: string;
    score?: number;
  };
  awayTeam: {
    id: string;
    name: string;
    crestUrl?: string;
    score?: number;
  };
  status: 'LIVE' | 'FT' | 'UPCOMING';
  minute?: number;
  playTime?: string;
  kickoffDate?: string;
  kickoffTime?: string;
  rawDate?: string;
  venue?: string;
  streamUrl?: string;
  hasLiveBroadcast?: boolean;
  matchBannerUrl?: string;
  poster?: string | null;
  savedAt: number;
}

const STORAGE_FILE = `${FileSystem.documentDirectory || ''}ballive_saved_matches_v1.json`;

type SavedMatchesListener = (matches: DiscoverMatchup[]) => void;

class SavedMatchesService {
  private savedRecords: Map<string, SavedMatchRecord> = new Map();
  private listeners: Set<SavedMatchesListener> = new Set();
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.init();
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  public getCachedSavedMatchesSync(): DiscoverMatchup[] {
    return this.convertRecordsToMatchups(Array.from(this.savedRecords.values()));
  }

  public async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        if (!FileSystem.documentDirectory) return;
        const info = await FileSystem.getInfoAsync(STORAGE_FILE);
        if (info.exists) {
          const raw = await FileSystem.readAsStringAsync(STORAGE_FILE);
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            this.savedRecords.clear();
            parsed.forEach((rec: SavedMatchRecord) => {
              if (rec && rec.id) {
                this.savedRecords.set(rec.id, rec);
              }
            });
          }
        }
      } catch (err) {
        console.warn('[SavedMatchesService] Init error:', err);
      } finally {
        this.isInitialized = true;
        await this.purgeFinishedMatches();
        this.notifyListeners();
      }
    })();

    return this.initPromise;
  }

  private async persist(): Promise<void> {
    try {
      if (!FileSystem.documentDirectory) return;
      const data = Array.from(this.savedRecords.values());
      await FileSystem.writeAsStringAsync(STORAGE_FILE, JSON.stringify(data));
      // Sync saved match IDs into profile storage for backwards compatibility
      ProfileStorage.updateProfile({ savedMatchIds: Array.from(this.savedRecords.keys()) }).catch(() => {});
    } catch (err) {
      console.warn('[SavedMatchesService] Persist error:', err);
    }
  }

  public subscribe(listener: SavedMatchesListener): () => void {
    this.listeners.add(listener);
    if (this.isInitialized) {
      try {
        listener(this.getCachedSavedMatchesSync());
      } catch {}
    } else {
      this.getSavedMatches().then(matches => {
        try {
          listener(matches);
        } catch {}
      });
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const list = this.convertRecordsToMatchups(Array.from(this.savedRecords.values()));
    this.listeners.forEach(fn => {
      try {
        fn(list);
      } catch {}
    });
  }

  public isMatchSaved(id: string): boolean {
    return this.savedRecords.has(id);
  }

  public async getSavedMatches(): Promise<DiscoverMatchup[]> {
    if (!this.isInitialized) {
      await this.init();
    }
    return this.convertRecordsToMatchups(Array.from(this.savedRecords.values()));
  }

  public async saveMatch(match: DiscoverMatchup | LiveMatch): Promise<void> {
    if (!this.isInitialized) await this.init();
    const record = this.toMatchRecord(match);
    this.savedRecords.set(record.id, record);
    await this.persist();
    this.notifyListeners();
  }

  public async removeSavedMatch(id: string): Promise<void> {
    if (!this.isInitialized) await this.init();
    if (this.savedRecords.has(id)) {
      this.savedRecords.delete(id);
      await this.persist();
      this.notifyListeners();
    }
  }

  public async toggleSaveMatch(match: DiscoverMatchup | LiveMatch): Promise<boolean> {
    if (!this.isInitialized) await this.init();
    const id = match.id;
    if (this.savedRecords.has(id)) {
      this.savedRecords.delete(id);
      await this.persist();
      this.notifyListeners();
      return false;
    } else {
      const record = this.toMatchRecord(match);
      this.savedRecords.set(id, record);
      await this.persist();
      this.notifyListeners();
      return true;
    }
  }

  private lastPurgeTime = 0;

  /**
   * Automatic match-state handling:
   * 1. Removes completed matches (status === 'FT', authoritative ESPN FT, or elapsed time exceeded).
   * 2. Synchronizes status and scores for saved upcoming matches that have become live.
   */
  public async purgeFinishedMatches(liveMatches?: LiveMatch[]): Promise<DiscoverMatchup[]> {
    const now = Date.now();
    if (!liveMatches && this.lastPurgeTime > 0 && now - this.lastPurgeTime < 30000) {
      return this.getCachedSavedMatchesSync();
    }
    this.lastPurgeTime = now;

    let changed = false;

    for (const [id, rec] of Array.from(this.savedRecords.entries())) {
      // 1. Check if authoritative ESPN scoreboards confirm fixture is finished
      if (sportsApiService.isFixtureFinished(rec.homeTeam.name, rec.awayTeam.name, id)) {
        this.savedRecords.delete(id);
        changed = true;
        continue;
      }

      // 2. Check normalizeMatchStatus status
      const normalized = normalizeMatchStatus({
        rawStatus: rec.status,
        playTime: rec.playTime,
        minute: rec.minute,
        kickoffDate: rec.rawDate || rec.kickoffDate,
        sport: rec.sport,
      });

      if (normalized.isFinished || rec.status === 'FT') {
        this.savedRecords.delete(id);
        changed = true;
        continue;
      }

      // 3. Elapsed time check against maximum play duration
      const kickoffTs = parseKickoffTimestamp(rec.rawDate || rec.kickoffDate);
      if (kickoffTs !== Number.MAX_SAFE_INTEGER && kickoffTs < now) {
        const elapsed = now - kickoffTs;
        const s = (rec.sport || '').toLowerCase();
        const maxDuration = s.includes('basket') || s.includes('hockey')
          ? 180 * 60 * 1000
          : s.includes('combat') || s.includes('mma') || s.includes('nfl') || s.includes('american')
          ? 240 * 60 * 1000
          : 140 * 60 * 1000;

        if (elapsed > maxDuration) {
          this.savedRecords.delete(id);
          changed = true;
          continue;
        }
      }

      // 4. If liveMatches are supplied, check if upcoming saved match transitioned to live
      if (liveMatches && liveMatches.length > 0) {
        const matchingLive = liveMatches.find(lm =>
          lm.id === id ||
          (lm.homeTeam?.toLowerCase() === rec.homeTeam.name.toLowerCase() &&
           lm.awayTeam?.toLowerCase() === rec.awayTeam.name.toLowerCase())
        );

        if (matchingLive) {
          if (matchingLive.status === 'FT' || (matchingLive as any).clockInfo?.status === 'FT') {
            this.savedRecords.delete(id);
            changed = true;
            continue;
          }

          if (matchingLive.isLive) {
            rec.status = 'LIVE';
            rec.minute = matchingLive.minute;
            rec.playTime = matchingLive.playTime;
            rec.homeTeam.score = matchingLive.score?.home ?? rec.homeTeam.score;
            rec.awayTeam.score = matchingLive.score?.away ?? rec.awayTeam.score;
            if (matchingLive.streamUrl) rec.streamUrl = matchingLive.streamUrl;
            rec.hasLiveBroadcast = true;
            changed = true;
          }
        }
      }
    }

    if (changed) {
      await this.persist();
      this.notifyListeners();
    }

    return this.convertRecordsToMatchups(Array.from(this.savedRecords.values()));
  }

  private toMatchRecord(match: DiscoverMatchup | LiveMatch): SavedMatchRecord {
    const isLiveMatch = 'homeBadge' in match || 'streamUrl' in match;

    if (isLiveMatch) {
      const lm = match as LiveMatch;
      return {
        id: lm.id,
        competition: lm.competition || 'Sports Match',
        competitionLogo: lm.competitionLogo,
        sport: lm.sport || 'soccer',
        homeTeam: {
          id: `team-${lm.homeTeam.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          name: lm.homeTeam,
          crestUrl: lm.homeBadge,
          score: lm.score?.home,
        },
        awayTeam: {
          id: `team-${lm.awayTeam.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          name: lm.awayTeam,
          crestUrl: lm.awayBadge,
          score: lm.score?.away,
        },
        status: lm.status || (lm.isLive ? 'LIVE' : 'UPCOMING'),
        minute: lm.minute,
        playTime: lm.playTime,
        kickoffDate: lm.kickoffTime,
        kickoffTime: lm.time || lm.kickoffTime,
        rawDate: lm.rawDate,
        venue: lm.venue,
        streamUrl: lm.streamUrl,
        hasLiveBroadcast: lm.hasLiveStream,
        matchBannerUrl: lm.imageUrl || undefined,
        poster: (lm as any).poster || null,
        savedAt: Date.now(),
      };
    }

    const dm = match as DiscoverMatchup;
    return {
      id: dm.id,
      competition: dm.competition || 'Sports Match',
      competitionLogo: dm.competitionLogo,
      sport: dm.sport || 'soccer',
      homeTeam: {
        id: dm.homeTeam?.id || `team-h-${dm.id}`,
        name: dm.homeTeam?.name || 'Home Team',
        crestUrl: dm.homeTeam?.crestUrl || (dm as any).homeBadge,
        score: dm.homeTeam?.score,
      },
      awayTeam: {
        id: dm.awayTeam?.id || `team-a-${dm.id}`,
        name: dm.awayTeam?.name || 'Away Team',
        crestUrl: dm.awayTeam?.crestUrl || (dm as any).awayBadge,
        score: dm.awayTeam?.score,
      },
      status: dm.status || 'UPCOMING',
      minute: dm.minute,
      playTime: dm.playTime,
      kickoffDate: dm.kickoffDate,
      kickoffTime: dm.kickoffTime,
      rawDate: (dm as any).rawDate,
      venue: dm.venue,
      streamUrl: dm.streamUrl,
      hasLiveBroadcast: dm.hasLiveBroadcast,
      matchBannerUrl: dm.matchBannerUrl || (dm as any).imageUrl || undefined,
      poster: dm.poster || null,
      savedAt: Date.now(),
    };
  }

  private convertRecordsToMatchups(records: SavedMatchRecord[]): DiscoverMatchup[] {
    return records.map(rec => ({
      id: rec.id,
      competition: rec.competition,
      competitionLogo: rec.competitionLogo || '',
      sport: (rec.sport || 'football') as any,
      homeTeam: {
        id: rec.homeTeam.id,
        name: rec.homeTeam.name,
        crestUrl: rec.homeTeam.crestUrl || '',
        score: rec.homeTeam.score,
      },
      awayTeam: {
        id: rec.awayTeam.id,
        name: rec.awayTeam.name,
        crestUrl: rec.awayTeam.crestUrl || '',
        score: rec.awayTeam.score,
      },
      status: rec.status,
      minute: rec.minute,
      playTime: rec.playTime,
      kickoffDate: rec.kickoffDate || '',
      kickoffTime: rec.kickoffTime || '',
      rawDate: rec.rawDate,
      venue: rec.venue || '',
      streamUrl: rec.streamUrl,
      hasLiveBroadcast: rec.hasLiveBroadcast ?? Boolean(rec.streamUrl),
      matchBannerUrl: rec.matchBannerUrl,
      poster: rec.poster,
    }));
  }
}

export const savedMatchesService = new SavedMatchesService();
