import * as FileSystem from 'expo-file-system';
import { DiscoverMatchup, UPCOMING_HIGHLIGHTS } from '../constants/discoverData';
import { LiveMatch } from '../constants/mockData';
import { resolveLiveMatchToMatchup } from '../navigation/navHelpers';
import { parseKickoffTimestamp } from '../utils/matchStatus';

export interface StoredMotdRecord {
  date: string; // YYYY-MM-DD in device-local time
  matchId: string;
  cachedMatchup: DiscoverMatchup;
  updatedAt: number;
}

const STORAGE_FILE = `${FileSystem.documentDirectory || ''}ballive_motd_v1.json`;

const ELITE_TEAMS = [
  'real madrid', 'barcelona', 'manchester city', 'man city', 'liverpool', 'arsenal',
  'bayern munich', 'bayern', 'paris saint-germain', 'psg', 'inter milan', 'internazionale',
  'juventus', 'ac milan', 'milan', 'chelsea', 'manchester united', 'man utd',
  'atletico madrid', 'atletico', 'borussia dortmund', 'dortmund', 'bayer leverkusen',
  'los angeles lakers', 'la lakers', 'lakers', 'boston celtics', 'celtics', 'golden state warriors',
  'kansas city chiefs', 'chiefs', 'san francisco 49ers', '49ers', 'dallas cowboys'
];

const MARQUEE_DERBIES: Array<{ teams: [string, string]; boost: number; name: string }> = [
  { teams: ['real madrid', 'barcelona'], boost: 100, name: 'El Clasico' },
  { teams: ['manchester city', 'manchester united'], boost: 80, name: 'Manchester Derby' },
  { teams: ['arsenal', 'tottenham'], boost: 75, name: 'North London Derby' },
  { teams: ['liverpool', 'manchester united'], boost: 80, name: 'North West Derby' },
  { teams: ['liverpool', 'everton'], boost: 60, name: 'Merseyside Derby' },
  { teams: ['real madrid', 'atletico madrid'], boost: 70, name: 'Madrid Derby' },
  { teams: ['inter milan', 'ac milan'], boost: 75, name: 'Derby della Madonnina' },
  { teams: ['inter milan', 'juventus'], boost: 70, name: "Derby d'Italia" },
  { teams: ['bayern munich', 'borussia dortmund'], boost: 70, name: 'Der Klassiker' },
  { teams: ['los angeles lakers', 'boston celtics'], boost: 70, name: 'Lakers vs Celtics' },
  { teams: ['usyk', 'fury'], boost: 90, name: 'Undisputed Heavyweight Championship' },
  { teams: ['canelo', 'crawford'], boost: 85, name: 'Pound-for-Pound Mega Fight' },
];

export function getDeviceLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isMatchScheduledForDate(
  rawDate?: string | null,
  kickoffTime?: string | null,
  targetDateStr: string = getDeviceLocalDate()
): boolean {
  if (!rawDate && !kickoffTime) return false;

  // 1. Direct YYYY-MM-DD match
  const raw = (rawDate || '').trim();
  if (raw.startsWith(targetDateStr)) return true;

  // 2. Parse timestamp if available
  const parsedTs = parseKickoffTimestamp(raw || kickoffTime || '');
  if (parsedTs && parsedTs > 0) {
    const d = new Date(parsedTs);
    const itemYear = d.getFullYear();
    const itemMonth = String(d.getMonth() + 1).padStart(2, '0');
    const itemDay = String(d.getDate()).padStart(2, '0');
    const itemDateStr = `${itemYear}-${itemMonth}-${itemDay}`;
    return itemDateStr === targetDateStr;
  }

  // 3. String tokens (e.g. "Today" or local date keywords)
  const combined = `${raw} ${kickoffTime || ''}`.toLowerCase();
  if (combined.includes('today')) return true;

  return false;
}

/**
 * Deterministic multi-signal anticipation ranking algorithm.
 * Higher score = higher priority for Match of the Day.
 */
export function calculateMatchAnticipationScore(
  homeName: string,
  awayName: string,
  competition: string,
  status?: string | null,
  rawDate?: string | null,
  kickoffTime?: string | null,
  targetDateStr: string = getDeviceLocalDate()
): number {
  let score = 0;
  const comp = (competition || '').toLowerCase();
  const home = (homeName || '').toLowerCase();
  const away = (awayName || '').toLowerCase();
  const combinedTeams = `${home} ${away}`;

  // 1. Date Relevance (+200 for matching today's device-local date)
  const isToday = isMatchScheduledForDate(rawDate, kickoffTime, targetDateStr);
  if (isToday) {
    score += 200;
  }

  // 2. Competition Tier
  if (comp.includes('champions league') || comp.includes('ucl') || comp.includes('uefa.champions')) {
    score += 100;
  } else if (comp.includes('premier league') || comp.includes('epl') || comp.includes('eng.1')) {
    score += 90;
  } else if (comp.includes('la liga') || comp.includes('laliga') || comp.includes('esp.1')) {
    score += 85;
  } else if (comp.includes('serie a') || comp.includes('ita.1') || comp.includes('bundesliga') || comp.includes('ger.1')) {
    score += 80;
  } else if (comp.includes('world cup') || comp.includes('fifa')) {
    score += 95;
  } else if (comp.includes('europa') || comp.includes('uel')) {
    score += 75;
  } else if (comp.includes('nba') || comp.includes('national basketball')) {
    score += 75;
  } else if (comp.includes('nfl') || comp.includes('super bowl')) {
    score += 75;
  } else if (comp.includes('formula 1') || comp.includes('f1') || comp.includes('grand prix')) {
    score += 75;
  } else if (comp.includes('nhl')) {
    score += 60;
  } else if (comp.includes('ligue 1') || comp.includes('fra.1')) {
    score += 70;
  } else {
    score += 35;
  }

  // 3. Elite Teams (+40 each)
  const isHomeElite = ELITE_TEAMS.some(t => home.includes(t));
  const isAwayElite = ELITE_TEAMS.some(t => away.includes(t));
  if (isHomeElite) score += 40;
  if (isAwayElite) score += 40;

  // 4. Historic Derbies & Rivalries
  for (const derby of MARQUEE_DERBIES) {
    const [t1, t2] = derby.teams;
    if (
      (home.includes(t1) && away.includes(t2)) ||
      (home.includes(t2) && away.includes(t1))
    ) {
      score += derby.boost;
      break;
    }
  }

  if (comp.includes('derby') || comp.includes('clasico') || combinedTeams.includes('derby')) {
    score += 30;
  }

  // 5. Tournament / Knockout stakes
  if (comp.includes('final') || comp.includes('championship')) {
    score += 50;
  } else if (comp.includes('semi-final') || comp.includes('semifinal')) {
    score += 40;
  } else if (comp.includes('quarter-final') || comp.includes('quarterfinal')) {
    score += 30;
  } else if (comp.includes('playoff') || comp.includes('knockout')) {
    score += 25;
  }

  // 6. Active Live Match Boost (+30 for in-play excitement)
  const cleanStatus = (status || '').toUpperCase();
  if (cleanStatus === 'LIVE' || cleanStatus === 'IN PLAY' || cleanStatus === 'HT') {
    score += 30;
  }

  return score;
}

type MotdListener = (match: DiscoverMatchup | null) => void;

class MatchOfTheDayService {
  private currentRecord: StoredMotdRecord | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private listeners: Set<MotdListener> = new Set();
  private lastCheckDate: string = getDeviceLocalDate();
  private midnightTimer: any = null;

  constructor() {
    this.init();
    this.setupMidnightWatcher();
  }

  private async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        if (!FileSystem.documentDirectory) return;
        const info = await FileSystem.getInfoAsync(STORAGE_FILE);
        if (info.exists) {
          const raw = await FileSystem.readAsStringAsync(STORAGE_FILE);
          const parsed = JSON.parse(raw) as StoredMotdRecord;
          if (parsed && parsed.date && parsed.cachedMatchup) {
            this.currentRecord = parsed;
          }
        }
      } catch (err) {
        console.warn('[MatchOfTheDayService] Failed to load stored MOTD:', err);
      } finally {
        this.isInitialized = true;
      }
    })();

    return this.initPromise;
  }

  private setupMidnightWatcher() {
    // Check every 60 seconds if the device calendar day changed
    this.midnightTimer = setInterval(() => {
      const today = getDeviceLocalDate();
      if (today !== this.lastCheckDate) {
        this.lastCheckDate = today;
        console.log('[MatchOfTheDayService] Calendar day rolled over to:', today);
        this.refreshMotd();
      }
    }, 60000);
  }

  public subscribe(listener: MotdListener): () => void {
    this.listeners.add(listener);
    if (this.currentRecord?.cachedMatchup) {
      listener(this.currentRecord.cachedMatchup);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(match: DiscoverMatchup | null) {
    this.listeners.forEach(l => {
      try {
        l(match);
      } catch (e) {
        console.error('[MatchOfTheDayService] Listener error:', e);
      }
    });
  }

  private async persistRecord(record: StoredMotdRecord): Promise<void> {
    this.currentRecord = record;
    this.notify(record.cachedMatchup);

    try {
      if (FileSystem.documentDirectory) {
        await FileSystem.writeAsStringAsync(STORAGE_FILE, JSON.stringify(record));
      }
    } catch (err) {
      console.warn('[MatchOfTheDayService] Failed to persist MOTD record:', err);
    }
  }

  /**
   * Resolves or refreshes the intelligent Match of the Day.
   * If today's match is already locked in ballive_motd_v1.json, preserves its identity
   * and synchronizes latest scores, minutes, and status (Upcoming -> Live -> Concluded FT).
   */
  public async getMatchOfTheDay(availableLiveMatches: LiveMatch[] = []): Promise<DiscoverMatchup | null> {
    await this.init();
    const today = getDeviceLocalDate();

    // 1. If we have a saved MOTD for today, check for real-time status updates
    if (this.currentRecord && this.currentRecord.date === today) {
      const matchId = this.currentRecord.matchId;
      const liveMatch = availableLiveMatches.find(m => m.id === matchId);

      if (liveMatch) {
        const updatedMatchup = resolveLiveMatchToMatchup(liveMatch);
        // Persist update if status, score, or minute changed
        if (
          updatedMatchup.status !== this.currentRecord.cachedMatchup.status ||
          updatedMatchup.homeTeam.score !== this.currentRecord.cachedMatchup.homeTeam.score ||
          updatedMatchup.awayTeam.score !== this.currentRecord.cachedMatchup.awayTeam.score ||
          updatedMatchup.minute !== this.currentRecord.cachedMatchup.minute
        ) {
          const newRecord: StoredMotdRecord = {
            date: today,
            matchId,
            cachedMatchup: updatedMatchup,
            updatedAt: Date.now(),
          };
          await this.persistRecord(newRecord);
          return updatedMatchup;
        }
      }

      return this.currentRecord.cachedMatchup;
    }

    // 2. New day or first run: Run deterministic ranking
    return this.selectAndPersistMotd(today, availableLiveMatches);
  }

  public async refreshMotd(availableLiveMatches: LiveMatch[] = []): Promise<DiscoverMatchup | null> {
    const today = getDeviceLocalDate();
    return this.selectAndPersistMotd(today, availableLiveMatches);
  }

  private async selectAndPersistMotd(today: string, availableLiveMatches: LiveMatch[]): Promise<DiscoverMatchup | null> {
    type Candidate = {
      matchup: DiscoverMatchup;
      score: number;
    };

    const candidates: Candidate[] = [];

    // Evaluate live & upcoming matches from memory
    for (const lm of availableLiveMatches) {
      const matchup = resolveLiveMatchToMatchup(lm);
      const score = calculateMatchAnticipationScore(
        lm.homeTeam,
        lm.awayTeam,
        lm.competition,
        lm.status,
        lm.rawDate,
        lm.kickoffTime || lm.time,
        today
      );
      candidates.push({ matchup, score });
    }

    // Evaluate static UPCOMING_HIGHLIGHTS if candidates are low
    if (candidates.length < 3 && UPCOMING_HIGHLIGHTS && UPCOMING_HIGHLIGHTS.length > 0) {
      for (const uh of UPCOMING_HIGHLIGHTS) {
        if (!candidates.some(c => c.matchup.id === uh.id)) {
          const score = calculateMatchAnticipationScore(
            uh.homeTeam.name,
            uh.awayTeam.name,
            uh.competition,
            uh.status,
            uh.rawDate,
            uh.kickoffTime,
            today
          );
          candidates.push({ matchup: uh, score });
        }
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    // Sort descending by calculated score
    candidates.sort((a, b) => b.score - a.score);
    const winner = candidates[0].matchup;

    const record: StoredMotdRecord = {
      date: today,
      matchId: winner.id,
      cachedMatchup: winner,
      updatedAt: Date.now(),
    };

    await this.persistRecord(record);
    return winner;
  }
}

export const matchOfTheDayService = new MatchOfTheDayService();
