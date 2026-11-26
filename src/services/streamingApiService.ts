import * as FileSystem from 'expo-file-system';
import { API_CONFIG, getBroadcastChannelId, isUnsupportedStreamingCompetition } from '../config/api';
import { LiveMatch } from '../constants/mockData';
import { DiscoverMatchup } from '../constants/discoverData';
import { getTeamCrest } from '../utils/teamCrestResolver';
import { LEAGUE_EMBLEMS, CLUB_CRESTS } from '../constants/crests';
import { sportsApiService } from './sportsApiService';
import { resolveSportBackground, isVerifiedEventImage, SPORT_ARTWORK } from '../utils/sportBackgroundResolver';
import { resolveCompetitionLogo } from '../components/common/CompetitionLogo';
import {
  formatKickoffEAT,
  normalizeMatchStatus,
  parseKickoffTimestamp,
  formatMatchSchedule,
  sortUpcomingChronologically,
  sortMatchesWithLiveFirst,
  isWithinTodayOrTomorrow,
} from '../utils/matchStatus';
import { theSportsDbService } from './theSportsDbService';
import { matchArtworkEnricher } from './matchArtworkEnricher';
import { savedMatchesService } from './savedMatchesService';
import { competitionResolverService } from './competitionResolverService';

export interface RawStreamSource {
  id: string;
  name: string;
  url: string;
}

/**
 * Strips prefixes like '🔴 LIVE: ', '⏱️ ', '📺 ' and excess whitespace.
 */
function cleanMatchName(name: string): string {
  if (!name) return '';
  return name
    .replace(/^\s*🔴\s*LIVE:\s*/i, '')
    .replace(/^\s*⏱️\s*/i, '')
    .replace(/^\s*📺\s*/i, '')
    .trim();
}

/**
 * Strictly identifies unwanted sports categories (Cricket, Tennis, College Football, College Sports)
 * so they are completely eliminated from data ingestion and UI display.
 */
export function isBannedSport(sport?: string, competition?: string, title?: string, genre?: string): boolean {
  const combined = `${sport || ''} ${competition || ''} ${title || ''} ${genre || ''}`.toLowerCase();
  return (
    combined.includes('ufc') ||
    combined.includes('ultimate fighting') ||
    combined.includes('cricket') ||
    combined.includes('ipl') ||
    combined.includes('t20') ||
    combined.includes('icc') ||
    combined.includes('bbl') ||
    combined.includes('tennis') ||
    combined.includes('wta') ||
    combined.includes('atp') ||
    combined.includes('itf') ||
    combined.includes('davis cup') ||
    combined.includes('billie jean') ||
    combined.includes('college football') ||
    combined.includes('ncaaf') ||
    combined.includes('ncaa football') ||
    combined.includes('college basketball') ||
    combined.includes('ncaa basketball') ||
    combined.includes('ncaa-m') ||
    combined.includes('ncaab') ||
    combined.includes('college')
  );
}

/**
 * Attempts to parse Home and Away team names from a fixture title.
 * Strictly respects 'Team A at Team B' and 'Team A @ Team B' conventions (B is HOME, A is AWAY),
 * as well as traditional 'Team A vs Team B' (A is HOME, B is AWAY).
 */
function parseTeams(name: string): { home: string; away: string } {
  const clean = cleanMatchName(name);

  // Check for 'at' or '@' delimiter (American sports: Away at Home)
  const atMatch = clean.match(/\s+(?:at|@)\s+/i);
  if (atMatch) {
    const parts = clean.split(/\s+(?:at|@)\s+/i);
    if (parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
      return { home: parts[1].trim(), away: parts[0].trim() };
    }
  }

  // Standard 'vs', 'vs.', '–', '-', 'v' delimiter (Home vs Away)
  const parts = clean.split(/\s+(?:vs\.?|–|-|v)\s+/i);
  if (parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
    return { home: parts[0].trim(), away: parts[1].trim() };
  }

  return { home: clean, away: 'Opponent' };
}

/**
 * Extracts query parameters from poster image URLs with null safety.
 */
function extractPosterParam(url: string | undefined, param: string): string | null {
  if (!url || !url.includes('?')) return null;
  try {
    const queryString = url.split('?')[1];
    const params = new URLSearchParams(queryString);
    const val = params.get(param);
    if (!val || val === 'null' || val === 'undefined' || val.trim() === '') return null;
    return val.trim();
  } catch {
    return null;
  }
}

export const SPORT_BACKDROPS: Record<string, string> = SPORT_ARTWORK;

const UPCOMING_DISK_CACHE_FILE = `${FileSystem.cacheDirectory || FileSystem.documentDirectory || ''}ballive_upcoming_cache_v1.json`;
const UPCOMING_DISK_TTL_MS = 5 * 60 * 1000; // 5 minutes for upcoming schedules only

type LiveMatchesListener = (live: LiveMatch[], upcoming: LiveMatch[]) => void;

class StreamingApiService {
  private cachedLiveMatches: LiveMatch[] = [];
  private cachedUpcomingMatches: LiveMatch[] = [];
  private cachedDagMetas: any[] = [];
  private lastFetchTime = 0;
  private readonly CACHE_TTL = 60000; // 60 seconds
  private inFlightLivePromise: Promise<LiveMatch[]> | null = null;
  private inFlightUpcomingPromise: Promise<LiveMatch[]> | null = null;
  private inFlightResolutions = new Map<string, Promise<RawStreamSource[]>>();
  private resolvedMirrorsCache = new Map<string, { data: RawStreamSource[]; timestamp: number }>();
  private readonly MIRRORS_CACHE_TTL = 45000; // 45 seconds
  private listeners = new Set<LiveMatchesListener>();
  private diskInitPromise: Promise<void> | null = null;
  private isDiskHydrated = false;

  public subscribe(listener: LiveMatchesListener): () => void {
    this.listeners.add(listener);
    if (this.cachedLiveMatches.length > 0 || this.cachedUpcomingMatches.length > 0) {
      try {
        listener(this.cachedLiveMatches, this.cachedUpcomingMatches);
      } catch {}
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(fn => {
      try {
        fn(this.cachedLiveMatches, this.cachedUpcomingMatches);
      } catch {}
    });
  }

  /**
   * Hydrates non-live upcoming schedule items from short-lived disk cache so Discover
   * displays future schedules immediately while fresh LIVE data streams in asynchronously.
   */
  public initDiskCache(): Promise<void> {
    if (this.isDiskHydrated) return Promise.resolve();
    if (this.diskInitPromise) return this.diskInitPromise;

    this.diskInitPromise = (async () => {
      try {
        if (!UPCOMING_DISK_CACHE_FILE || !FileSystem?.getInfoAsync) return;
        const info = await FileSystem.getInfoAsync(UPCOMING_DISK_CACHE_FILE);
        if (!info.exists) return;
        const raw = await FileSystem.readAsStringAsync(UPCOMING_DISK_CACHE_FILE);
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          Array.isArray(parsed.upcoming) &&
          typeof parsed.timestamp === 'number' &&
          Date.now() - parsed.timestamp < UPCOMING_DISK_TTL_MS
        ) {
          const now = Date.now();
          const freshUpcoming: LiveMatch[] = parsed.upcoming.filter(
            (m: LiveMatch) =>
              m &&
              m.status === 'UPCOMING' &&
              !m.isLive &&
              (!m.kickoffTimestamp || m.kickoffTimestamp === Number.MAX_SAFE_INTEGER || m.kickoffTimestamp > now - 5 * 60 * 1000)
          );
          if (freshUpcoming.length > 0 && this.cachedUpcomingMatches.length === 0) {
            this.cachedUpcomingMatches = freshUpcoming;
            if (this.cachedLiveMatches.length === 0) {
              this.cachedLiveMatches = freshUpcoming;
            }
            this.notifyListeners();
          }
        }
      } catch {
        // Ignore corrupt disk cache
      } finally {
        this.isDiskHydrated = true;
      }
    })();

    return this.diskInitPromise;
  }

  getCachedLiveMatches(): LiveMatch[] {
    return this.cachedLiveMatches;
  }

  getCachedUpcomingMatches(): LiveMatch[] {
    return this.cachedUpcomingMatches;
  }

  /**
   * Fetches real live sports matches and channels directly from cloud APIs.
   * Multi-sport architecture combining ESPN (Soccer, NBA, NHL), DAG Sports, and Football-Data.org.
   */
  async getLiveMatches(forceRefresh = false): Promise<LiveMatch[]> {
    const now = Date.now();
    if (!forceRefresh && this.cachedLiveMatches.length > 0 && now - this.lastFetchTime < this.CACHE_TTL) {
      return this.cachedLiveMatches;
    }

    if (this.inFlightLivePromise) {
      return this.inFlightLivePromise;
    }

    this.inFlightLivePromise = (async () => {
      const fetchedMatches: LiveMatch[] = [];
      const fetchedUpcoming: LiveMatch[] = [];
      const seenMatchIds = new Set<string>();
      this.cachedDagMetas = [];

      // Timeout controller for resilient multi-source fetch
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT_MS);

    // Multi-sport catalogs from DAG Upstream (Tennis completely eliminated)
    const dagCatalogs = [
      { file: 'moviebay_sports_live.json', defaultSport: 'soccer' as const, isLiveSource: true },
      { file: 'moviebay_sports_football.json', defaultSport: 'soccer' as const, isLiveSource: false },
      { file: 'moviebay_sports_basketball.json', defaultSport: 'basketball' as const, isLiveSource: false },
      { file: 'moviebay_sports_hockey.json', defaultSport: 'hockey' as const, isLiveSource: false },
      { file: 'moviebay_sports_american_football.json', defaultSport: 'american_football' as const, isLiveSource: false },
      { file: 'moviebay_sports_motorsport.json', defaultSport: 'motorsport' as const, isLiveSource: false },
      { file: 'moviebay_sports_upcoming.json', defaultSport: 'soccer' as const, isLiveSource: false },
    ];

    try {
      const [espnMatchesRes, fbLiveRes, ...dagResults] = await Promise.allSettled([
        // 1. ESPN Real-time Multi-sport scoreboards (NBA, NHL, EPL, LaLiga, UCL, Serie A, Bundesliga, Boxing)
        sportsApiService.getScoreboardMatches(undefined, false),

        // 2. Football-Data.org In-Play Matches
        fetch(`${API_CONFIG.FOOTBALL_DATA_BASE_URL}/matches?status=IN_PLAY,PAUSED`, {
          headers: { 'X-Auth-Token': API_CONFIG.FOOTBALL_DATA_API_KEY },
          signal: controller.signal,
        }),

        // 3. All DAG Sports Catalogs Concurrently
        ...dagCatalogs.map(cat =>
          fetch(`${API_CONFIG.DAG_SPORTS_BASE}/catalog/tv/${cat.file}`, {
            headers: API_CONFIG.DAG_HEADERS,
            signal: controller.signal,
          })
        ),
      ]);

      clearTimeout(timer);

      // ── Process Source 1: ESPN Multi-Sport Scoreboard (Live & Upcoming Events) ──
      if (espnMatchesRes.status === 'fulfilled' && Array.isArray(espnMatchesRes.value)) {
        espnMatchesRes.value.forEach(m => {
          // Strictly drop banned sports (Cricket, Tennis, College Sports)
          if (isBannedSport(m.sport, m.competition, m.title)) return;
          // Strictly drop finished matches (user requested ended matches must be cleared completely)
          if (m.status === 'FT' || (m as any).state === 'post') return;
          if (isUnsupportedStreamingCompetition(m.competition, m.title)) return;
          if (!seenMatchIds.has(m.id)) {
            seenMatchIds.add(m.id);
            if (m.status === 'UPCOMING' || !m.isLive) {
              if (isWithinTodayOrTomorrow(m.kickoffTimestamp || m.rawDate || m.kickoffTime)) {
                fetchedUpcoming.push(m);
              }
            } else {
              if (!m.streamUrl) {
                const bChannel = getBroadcastChannelId(m.competition, m.sport);
                m.streamUrl = `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${bChannel}.json`;
                m.hasLiveStream = true;
                m.streams = [{ id: `srv-${bChannel}`, name: 'Server 1 (Live HD Broadcast)', url: m.streamUrl }];
              }
              fetchedMatches.push(m);
            }
          }
        });
      }

      // ── Process Source 2: All DAG Sports Catalogs ──
      const espnLiveList: LiveMatch[] = (espnMatchesRes.status === 'fulfilled' && Array.isArray(espnMatchesRes.value))
        ? espnMatchesRes.value
        : [];

      const GENERIC_TOKENS = new Set([
        'u15', 'u16', 'u17', 'u18', 'u19', 'u20', 'u21', 'u23',
        'youth', 'women', 'ladies', 'men', 'team', 'club', 'fc', 'cf', 'sc', 'afc', 'ac', 'cd', 'ud',
        'city', 'united', 'town', 'athletic', 'real', 'sporting', 'reserves', 'amateur'
      ]);

      const cleanName = (s: string) =>
        s.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\b(fc|cf|sc|afc|club|united|city|women|ladies|men)\b/g, '').trim();

      const getDistinctTokens = (s: string) => {
        const toks = s.split(/\s+/).filter(w => w.length >= 3 && !GENERIC_TOKENS.has(w));
        return toks.length > 0 ? toks : s.split(/\s+/).filter(w => w.length >= 3);
      };

      const findMatchedEspn = (homeStr: string, awayStr: string, eventIdOrPoster?: string): LiveMatch | undefined => {
        if (eventIdOrPoster) {
          const directHit = espnLiveList.find(em => em.id && eventIdOrPoster.includes(em.id));
          if (directHit) return directHit;
        }

        const hClean = cleanName(homeStr);
        const aClean = cleanName(awayStr);
        const hToks = getDistinctTokens(hClean);
        const aToks = getDistinctTokens(aClean);

        return espnLiveList.find(em => {
          const emH = cleanName(em.homeTeam);
          const emA = cleanName(em.awayTeam);
          const hHit = hToks.some(t => emH.includes(t) || emA.includes(t));
          const aHit = aToks.some(t => emH.includes(t) || emA.includes(t));
          return hHit && aHit;
        });
      };

      for (let i = 0; i < dagCatalogs.length; i++) {
        const catConfig = dagCatalogs[i];
        const result = dagResults[i];
        if (result && result.status === 'fulfilled' && result.value.ok) {
          try {
            const dagJson = await result.value.json();
            const metas = dagJson.metas || [];
            this.cachedDagMetas.push(...metas);
            metas.forEach((m: any, idx: number) => {
              if (seenMatchIds.has(m.id)) return;

              const genre = (m.genres?.[0] || 'LIVE SPORTS').toUpperCase();
              // Strictly exclude 24/7 standalone TV channels without fixture
              if (genre === 'NETWORKS' || genre.includes('CHANNEL')) return;
              const cleanTitle = cleanMatchName(m.name || '');

              // Strictly drop unwanted banned sports (Combat, College Sports, Cricket, Tennis)
              if (isBannedSport(catConfig.defaultSport, m.genres?.[0] || genre, cleanTitle, m.category)) return;

              // Strictly drop ended/finished matches
              if (m.releaseInfo === 'FT' || m.status === 'FT' || /ended|finished|final|postponed|cancelled/i.test(m.description || '')) return;

              // Strictly exclude non-sports game/reality shows & broadcast promo wrappers (not real fixtures)
              if (
                /kaun banega|game show|reality|lottery|bingo|simulcast|goals show|watchalong|preview show|matchday \d+/i.test(cleanTitle)
              ) {
                return;
              }

              // Exclude mis-tagged handball/volleyball Champions League items in DAG FOOTBALL feed
              const rawLgHint = `${extractPosterParam(m.poster, 'lg') || ''} ${m.description || ''} ${cleanTitle}`.toLowerCase();
              if (
                rawLgHint.includes('champions league women') ||
                rawLgHint.includes('vero volley') ||
                rawLgHint.includes('vakifbank') ||
                rawLgHint.includes('budowlani') ||
                rawLgHint.includes('asterix avo') ||
                rawLgHint.includes('paris st-cloud') ||
                rawLgHint.includes('magdeburg') ||
                rawLgHint.includes('vive kielce') ||
                rawLgHint.includes('dinamo bucuresti')
              ) {
                return;
              }

              // Strictly exclude competitions without confirmed streaming presence on DAG
              if (isUnsupportedStreamingCompetition(m.genres?.[0] || genre, cleanTitle)) return;

              let home = m.team1?.name;
              let away = m.team2?.name;
              if (!home || !away) {
                const parsed = parseTeams(cleanTitle);
                home = home || parsed.home;
                away = away || parsed.away;
              }

              // Drop immediately if authoritative ESPN scoreboards confirm this fixture is finished
              if (sportsApiService.isFixtureFinished(home, away, m.id)) {
                return;
              }

              // Completely exclude combat sports (Boxing, UFC, MMA, WWE, Bare Knuckle)
              const isCombat =
                genre.includes('MMA') ||
                genre.includes('WRESTLING') ||
                genre.includes('BOXING') ||
                genre.includes('COMBAT') ||
                /wwe|tna|aew|mma|boxing|ufc|bellator|pfl|bkfc/i.test(cleanTitle) ||
                /wwe|tna|aew|mma|boxing|ufc|bellator|pfl|bkfc/i.test(m.description || '');

              if (isCombat) {
                return;
              }

              // Exclude fake fixtures ("vs Opponent" or standalone TV channel titles)
              if (!away || away.toLowerCase() === 'opponent' || away.toLowerCase().includes('live 24/7') || (home && home.toLowerCase().includes('tv') && !m.team2)) {
                return;
              }

              // Resolve competition FIRST so genuine OTHER-genre sports like Japan J League are rescued accurately
              const preliminarSport =
                genre.includes('BASKETBALL') || cleanTitle.toLowerCase().includes('nba') || rawLgHint.includes('euroleague')
                  ? 'basketball'
                  : genre.includes('HOCKEY') || cleanTitle.toLowerCase().includes('nhl') || rawLgHint.includes('allsvenskan') || rawLgHint.includes('ice hockey') || rawLgHint.includes('mhl')
                  ? 'hockey'
                  : genre.includes('AMERICAN FOOTBALL') || cleanTitle.toLowerCase().includes('nfl')
                  ? 'american_football'
                  : genre.includes('MOTORSPORT') || cleanTitle.toLowerCase().includes('f1') || cleanTitle.toLowerCase().includes('formula')
                  ? 'motorsport'
                  : catConfig.defaultSport;

              const resolvedComp = competitionResolverService.resolveCompetition({
                rawId: m.id,
                rawName: cleanTitle,
                posterUrl: m.poster || m.background,
                description: m.description,
                genres: m.genres,
                homeTeam: home,
                awayTeam: away,
                sport: genre === 'OTHER' || m.genres?.includes('OTHER') ? 'other' : preliminarSport,
              });

              // Drop genuinely unidentified 'OTHER' items (keep Japan J League, recognized leagues, etc.)
              if (
                (genre === 'OTHER' || m.genres?.includes('OTHER') || m.category === 'OTHER') &&
                !resolvedComp.isIdentified
              ) {
                return;
              }

              seenMatchIds.add(m.id);

              // Final authoritative sport selection
              let sport: LiveMatch['sport'] = (resolvedComp.sport && resolvedComp.sport !== 'other'
                ? resolvedComp.sport
                : preliminarSport) as LiveMatch['sport'];
              const titleLower = cleanTitle.toLowerCase();
              if (genre.includes('BASKETBALL') || titleLower.includes('nba')) {
                sport = 'basketball';
              } else if (genre.includes('HOCKEY') || titleLower.includes('nhl')) {
                sport = 'hockey';
              } else if (genre.includes('AMERICAN FOOTBALL') || titleLower.includes('nfl')) {
                sport = 'american_football';
              } else if (genre.includes('MOTORSPORT') || titleLower.includes('f1') || titleLower.includes('formula')) {
                sport = 'motorsport';
              }

              // High-resolution authentic team crests directly from DAG event meta, poster query or resolver
              const rawLogo1 = (typeof m.team1?.logo === 'string' && m.team1.logo.trim().length > 10 && !m.team1.logo.includes('null')) ? m.team1.logo.trim() : null;
              const rawLogo2 = (typeof m.team2?.logo === 'string' && m.team2.logo.trim().length > 10 && !m.team2.logo.includes('null')) ? m.team2.logo.trim() : null;
              const posterLogo1 = extractPosterParam(m.poster, 'b1');
              const posterLogo2 = extractPosterParam(m.poster, 'b2');

              const b1 = rawLogo1 || posterLogo1 || getTeamCrest(home);
              const b2 = rawLogo2 || posterLogo2 || getTeamCrest(away);

              // Deduplicate against existing authentic matches (e.g. ESPN scoreboards)
              const cleanHome = cleanName(home);
              const cleanAway = cleanName(away);
              const hToks = getDistinctTokens(cleanHome);
              const aToks = getDistinctTokens(cleanAway);

              const existingMatch = [...fetchedMatches, ...fetchedUpcoming].find(em => {
                if (em.id && m.id && (m.id.includes(em.id) || em.id.includes(m.id))) return true;
                if (m.poster && em.id && m.poster.includes(em.id)) return true;
                const emH = cleanName(em.homeTeam);
                const emA = cleanName(em.awayTeam);
                const hHit = hToks.some(t => emH.includes(t) || emA.includes(t));
                const aHit = aToks.some(t => emH.includes(t) || emA.includes(t));
                return (hHit && aHit) || (emH === cleanHome && emA === cleanAway);
              });

              if (existingMatch) {
                // 1. Resolve DAG artwork (which often provides verified thesportsdb.com or ondemand.st event thumbnail)
                const dagPoster = m.poster || m.background;
                if (dagPoster) {
                  const resolvedDagArt = resolveSportBackground(
                    existingMatch.sport,
                    existingMatch.competition,
                    dagPoster,
                    existingMatch.homeTeam,
                    existingMatch.awayTeam,
                    m.id
                  );
                  if (
                    isVerifiedEventImage(resolvedDagArt) ||
                    !existingMatch.imageUrl ||
                    existingMatch.imageUrl.includes('images.unsplash.com') ||
                    !isVerifiedEventImage(existingMatch.imageUrl)
                  ) {
                    existingMatch.imageUrl = resolvedDagArt;
                  }
                }

                // 2. High-resolution crest update if existing match lacks them
                if (b1 && (!existingMatch.homeBadge || existingMatch.homeBadge.includes('default-team-logo'))) {
                  existingMatch.homeBadge = b1;
                }
                if (b2 && (!existingMatch.awayBadge || existingMatch.awayBadge.includes('default-team-logo'))) {
                  existingMatch.awayBadge = b2;
                }

                // 3. Upgrade generic competition to canonical resolved competition
                if (
                  (existingMatch.competition === 'Global Football' ||
                   existingMatch.competition === 'Football' ||
                   existingMatch.competition === 'SOCCER') &&
                  resolvedComp.isIdentified
                ) {
                  existingMatch.competition = resolvedComp.name;
                  existingMatch.competitionLogo = resolvedComp.logoUrl;
                }

                // 4. Merge direct stream URL into the existing authentic match
                const directUrl = `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${m.id}.json`;
                if (!existingMatch.streams) {
                  existingMatch.streams = [];
                }
                if (!existingMatch.streams.some(s => s.url === directUrl)) {
                  existingMatch.streams.unshift({
                    id: `srv-direct-${m.id}`,
                    name: 'Server 1 (Direct Match Broadcast)',
                    url: directUrl,
                  });
                  existingMatch.streamUrl = directUrl;
                  existingMatch.hasLiveStream = true;
                }
                return;
              }

              // Check live status strictly - prioritize confirmed live ESPN scoreboard or explicit live release
              const cleanKickoff = m.releaseInfo ? m.releaseInfo.replace(/^⏱️\s*/, '') : 'Upcoming';
              const kickoffTimestamp = parseKickoffTimestamp(m.releaseInfo || cleanKickoff);
              const isFutureKickoff = kickoffTimestamp !== Number.MAX_SAFE_INTEGER && kickoffTimestamp > Date.now() + 5 * 60 * 1000;
              const isTimeUpcoming = typeof m.releaseInfo === 'string' && (m.releaseInfo.includes('AM') || m.releaseInfo.includes('PM') || m.releaseInfo.includes(':') || cleanTitle.startsWith('⏱️'));

              const elapsedMs = kickoffTimestamp !== Number.MAX_SAFE_INTEGER ? Date.now() - kickoffTimestamp : 0;
              const maxDurationMs =
                sport === 'basketball' || sport === 'hockey'
                  ? 180 * 60 * 1000
                  : sport === 'american_football'
                  ? 240 * 60 * 1000
                  : 140 * 60 * 1000;

              const isPastMaxDuration = kickoffTimestamp !== Number.MAX_SAFE_INTEGER && elapsedMs > maxDurationMs;

              const matchedEspn = findMatchedEspn(home, away, `${m.id || ''} ${m.poster || ''}`);
              const isEspnLive = Boolean(matchedEspn && matchedEspn.isLive && (matchedEspn.minute > 0 || matchedEspn.score.home > 0 || matchedEspn.score.away > 0 || matchedEspn.playTime === 'HT'));

              if (isPastMaxDuration && !isEspnLive) {
                return;
              }

              const isReleaseLive = m.releaseInfo === 'LIVE' || cleanTitle.includes('🔴 LIVE') || Boolean(m.description && m.description.includes('LIVE NOW'));

              const isTrulyLive = !isFutureKickoff && !isTimeUpcoming && !isPastMaxDuration && (
                matchedEspn ? matchedEspn.isLive : isReleaseLive
              );

              // Select authentic unique artwork using RESOLVED competition name!
              const backdrop = resolveSportBackground(
                sport,
                resolvedComp.name,
                m.poster || m.background,
                home,
                away,
                m.id
              );

              const venueFallback =
                sport === 'basketball'
                  ? resolvedComp.id === 'nba' ? 'NBA Arena' : 'Basketball Arena'
                  : sport === 'hockey'
                  ? resolvedComp.id === 'nhl' ? 'NHL Ice Arena' : 'Ice Hockey Arena'
                  : 'Stadium Arena';

              if (!isTrulyLive) {
                if (!isWithinTodayOrTomorrow(m.releaseInfo || kickoffTimestamp)) {
                  return;
                }

                const scheduleInfo = formatMatchSchedule(m.releaseInfo || cleanKickoff);
                const eatKickoff = scheduleInfo.fullKickoff !== 'Upcoming' ? scheduleInfo.fullKickoff : (cleanKickoff.includes('EAT') ? cleanKickoff : formatKickoffEAT(cleanKickoff));

                fetchedUpcoming.push({
                  id: m.id,
                  title: cleanTitle.replace(/^⏱️\s*/, ''),
                  homeTeam: home,
                  awayTeam: away,
                  competition: resolvedComp.name,
                  competitionLogo: resolvedComp.logoUrl,
                  score: { home: 0, away: 0 },
                  minute: 0,
                  playTime: undefined,
                  status: 'UPCOMING',
                  isLive: false,
                  imageUrl: backdrop,
                  hasLiveStream: false,
                  homeBadge: b1,
                  awayBadge: b2,
                  streamUrl: undefined,
                  streams: [],
                  sport,
                  kickoffTime: eatKickoff,
                  time: eatKickoff,
                  kickoffTimestamp,
                  rawDate: typeof m.releaseInfo === 'string' ? m.releaseInfo : undefined,
                  venue: venueFallback,
                });
                return;
              }

              let scoreHome = 0;
              let scoreAway = 0;
              let minute = 1;
              let playTime: string | undefined = undefined;
              let kickoffTime = 'Live In-Play';

              if (matchedEspn && (matchedEspn.isLive || matchedEspn.score)) {
                const emH = cleanName(matchedEspn.homeTeam);
                const hClean = cleanName(home);
                const isDirectOrder = emH.includes(hClean) || hClean.includes(emH) || hToks.some(t => emH.includes(t));

                if (isDirectOrder) {
                  scoreHome = matchedEspn.score?.home ?? 0;
                  scoreAway = matchedEspn.score?.away ?? 0;
                } else {
                  scoreHome = matchedEspn.score?.away ?? 0;
                  scoreAway = matchedEspn.score?.home ?? 0;
                }
                minute = matchedEspn.minute;
                playTime = matchedEspn.playTime;
                kickoffTime = matchedEspn.kickoffTime || (matchedEspn.playTime ? `${matchedEspn.playTime} Live` : 'Live In-Play');
              } else {
                scoreHome = 0;
                scoreAway = 0;
                minute = 1;
                playTime = 'Live';
                kickoffTime = 'Live In-Play';
              }

              fetchedMatches.push({
                id: m.id,
                title: cleanTitle.replace(/^🔴\s*LIVE:\s*/i, ''),
                homeTeam: home,
                awayTeam: away,
                competition: (matchedEspn?.competition && matchedEspn.competition !== 'Global Football' && matchedEspn.competition !== 'Football'
                  ? matchedEspn.competition
                  : resolvedComp.name),
                competitionLogo: (matchedEspn?.competitionLogo || resolvedComp.logoUrl),
                score: { home: scoreHome, away: scoreAway },
                minute,
                playTime,
                status: 'LIVE',
                isLive: true,
                imageUrl: (matchedEspn && isVerifiedEventImage(matchedEspn.imageUrl)) ? matchedEspn.imageUrl : backdrop,
                hasLiveStream: true,
                homeBadge: b1,
                awayBadge: b2,
                streamUrl: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${m.id}.json`,
                streams: [{ id: `srv-direct-${m.id}`, name: 'Server 1 (Direct Match Broadcast)', url: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${m.id}.json` }],
                sport,
                kickoffTime,
                venue: venueFallback,
              });
            });
          } catch {
            // continue
          }
        }
      }

      // ── Process Source 3: Football-Data.org Live In-Play Matches ──
      if (fbLiveRes.status === 'fulfilled' && fbLiveRes.value.ok) {
        try {
          const plJson = await fbLiveRes.value.json();
          const plMatches = plJson.matches || [];
          plMatches.forEach((m: any) => {
            if (m.status !== 'IN_PLAY' && m.status !== 'PAUSED') return;

            const home = m.homeTeam?.name || 'Home Team';
            const away = m.awayTeam?.name || 'Away Team';
            const compName = m.competition?.name || 'Premier League';
            if (isUnsupportedStreamingCompetition(compName, `${home} vs ${away}`)) return;

            const matchId = `fb-live-${m.id}`;
            if (seenMatchIds.has(matchId)) return;
            seenMatchIds.add(matchId);

            const scoreHome = m.score?.fullTime?.home ?? (m.score?.halfTime?.home ?? 0);
            const scoreAway = m.score?.fullTime?.away ?? (m.score?.halfTime?.away ?? 0);
            const minute = m.minute || 45;
            const bgImage = resolveSportBackground('soccer', m.competition?.name || 'Premier League', null, home, away, matchId);

            const bChannel = getBroadcastChannelId(compName, 'soccer');
            const liveStreamUrl = `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${bChannel}.json`;

            fetchedMatches.push({
              id: matchId,
              title: `${home} vs ${away}`,
              homeTeam: home,
              awayTeam: away,
              competition: compName,
              score: { home: scoreHome, away: scoreAway },
              minute,
              imageUrl: bgImage,
              hasLiveStream: true,
              homeBadge: m.homeTeam?.crest || getTeamCrest(home),
              awayBadge: m.awayTeam?.crest || getTeamCrest(away),
              streamUrl: liveStreamUrl,
              streams: [{ id: `srv-${bChannel}`, name: 'Server 1 (Live HD Broadcast)', url: liveStreamUrl }],
              sport: 'soccer',
              kickoffTime: `${minute}' Live`,
            });
          });
        } catch {
          // continue
        }
      }

      // Sort: Live in-play games first
      fetchedMatches.sort((a, b) => {
        const aLive = a.minute > 0 && a.minute < 90 ? 1 : 0;
        const bLive = b.minute > 0 && b.minute < 90 ? 1 : 0;
        return bLive - aLive;
      });

      // Deduplicate upcoming fixtures by id and team matchup
      const seenUpcomingKeys = new Set<string>();
      const uniqueUpcoming: LiveMatch[] = [];
      fetchedUpcoming.forEach(u => {
        if (!isWithinTodayOrTomorrow(u.kickoffTimestamp || u.rawDate || u.kickoffTime)) {
          return;
        }
        const uKey = `${cleanName(u.homeTeam)}-${cleanName(u.awayTeam)}`;
        if (!seenUpcomingKeys.has(uKey) && !seenUpcomingKeys.has(u.id)) {
          seenUpcomingKeys.add(uKey);
          seenUpcomingKeys.add(u.id);
          uniqueUpcoming.push(u);
        }
      });

      // Sort upcoming fixtures strictly chronologically ascending (nearest kickoff first)
      const sortedUpcoming = sortUpcomingChronologically(uniqueUpcoming);

      // Combine: Live matches first, then scheduled upcoming fixtures sorted chronologically
      const combined = [...fetchedMatches, ...sortedUpcoming];

      if (sortedUpcoming.length > 0) {
        matchArtworkEnricher.enrichMatches(sortedUpcoming);
        this.cachedUpcomingMatches = sortedUpcoming;
        if (UPCOMING_DISK_CACHE_FILE && FileSystem?.writeAsStringAsync) {
          FileSystem.writeAsStringAsync(
            UPCOMING_DISK_CACHE_FILE,
            JSON.stringify({
              upcoming: sortedUpcoming.slice(0, 40),
              timestamp: now,
            })
          ).catch(() => {});
        }
      }
      if (combined.length > 0) {
        // Eagerly enrich matches at data level with verified artwork & persistent caching
        matchArtworkEnricher.enrichMatches(combined);
        this.cachedLiveMatches = combined;
        this.lastFetchTime = now;
        // Automatically sync and purge finished matches from Saved list
        savedMatchesService.purgeFinishedMatches(combined).catch(() => {});
      }
      if (combined.length > 0 || sortedUpcoming.length > 0) {
        this.notifyListeners();
      }
    } catch (err) {
      console.warn('[StreamingApiService] Error fetching live sports:', err);
    } finally {
      clearTimeout(timer);
    }

    return this.cachedLiveMatches;
  })().finally(() => {
    this.inFlightLivePromise = null;
  });

  return this.inFlightLivePromise;
}

  /**
   * Returns authenticated upcoming fixtures across sports.
   */
  async getUpcomingMatches(forceRefresh = false): Promise<LiveMatch[]> {
    if (!forceRefresh && this.cachedUpcomingMatches.length > 0) {
      return this.cachedUpcomingMatches;
    }

    if (this.inFlightUpcomingPromise) {
      return this.inFlightUpcomingPromise;
    }

    this.inFlightUpcomingPromise = (async () => {
      try {
        await this.getLiveMatches(forceRefresh);
        return this.cachedUpcomingMatches;
      } finally {
        this.inFlightUpcomingPromise = null;
      }
    })();

    return this.inFlightUpcomingPromise;
  }

  /**
   * Resolves playable HLS stream manifests or responsive web embeds for any fixture, ESPN match, or broadcast feed.
   * If a direct DAG fixture exists, resolves its dedicated mirrors.
   * Otherwise, fetches verified high-availability 24/7 broadcast feeds tailored to the competition.
   */
  async resolveStreamMirrors(
    itemId: string,
    competitionOrSport: string = '',
    homeTeam?: string,
    awayTeam?: string
  ): Promise<RawStreamSource[]> {
    const cacheKey = `${itemId}_${competitionOrSport}_${homeTeam || ''}_${awayTeam || ''}`;
    const cached = this.resolvedMirrorsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.MIRRORS_CACHE_TTL && cached.data.length > 0) {
      return cached.data;
    }

    if (this.inFlightResolutions.has(cacheKey)) {
      return this.inFlightResolutions.get(cacheKey)!;
    }

    const resolutionPromise = (async () => {
      // 0. Ensure catalog readiness if cachedDagMetas is empty
      if (this.cachedDagMetas.length === 0) {
        try {
          await this.getLiveMatches();
        } catch {
          // ignore
        }
      }

      const mirrors: RawStreamSource[] = [];
      let cleanId = itemId.replace(/\.json$/, '');
      if (cleanId.startsWith('srv-direct-')) {
        cleanId = cleanId.replace('srv-direct-', '');
      }
      if (cleanId.includes('/stream/tv/')) {
        const match = cleanId.match(/\/stream\/tv\/([^/]+?)(?:\.json)?$/);
        if (match) cleanId = match[1];
      }

      // 1. Direct DAG fixture ID lookup (handles nuvio_, moviebay_, or any sport fixture ID)
      if (cleanId.startsWith('nuvio_') || cleanId.startsWith('moviebay_') || cleanId.includes('_sport_')) {
        try {
          const res = await fetch(`${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${cleanId}.json`, {
            headers: API_CONFIG.DAG_HEADERS,
          });
          if (res.ok) {
            const data = await res.json();
            (data.streams || []).forEach((s: any, idx: number) => {
              const playUrl = s.url || s.externalUrl;
              if (playUrl && typeof playUrl === 'string' && !playUrl.endsWith('.json') && !playUrl.includes('/stream/tv/')) {
                mirrors.push({
                  id: `stream-direct-${idx}`,
                  name: s.name || `Server ${idx + 1} (${s.resolution || 'HD Live'})`,
                  url: playUrl,
                });
              }
            });
          }
        } catch {
          // stream unavailable
        }
      }

      // If direct stream succeeded, return it immediately
      if (mirrors.length > 0) {
        return mirrors;
      }

      // 2. Check if cached DAG catalog items match homeTeam and awayTeam
      if (homeTeam && awayTeam && this.cachedDagMetas.length > 0) {
        const clean = (s: string) =>
          s.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\b(fc|cf|sc|afc|club|united|city|women|ladies|men)\b/g, '').trim();
        const hClean = clean(homeTeam);
        const aClean = clean(awayTeam);
        const hToks = hClean.split(/\s+/).filter(w => w.length >= 3);
        const aToks = aClean.split(/\s+/).filter(w => w.length >= 3);

        const matchedDag = this.cachedDagMetas.find(dm => {
          const dName = clean(dm.name || '');
          const dH = clean(dm.team1?.name || '');
          const dA = clean(dm.team2?.name || '');
          const allStr = `${dName} ${dH} ${dA}`;
          const hHit = hToks.some(t => allStr.includes(t));
          const aHit = aToks.some(t => allStr.includes(t));
          return (hHit && aHit) || (dH === hClean && dA === aClean);
        });

        if (matchedDag?.id) {
          try {
            const directRes = await fetch(`${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${matchedDag.id}.json`, {
              headers: API_CONFIG.DAG_HEADERS,
            });
            if (directRes.ok) {
              const dJson = await directRes.json();
              (dJson.streams || []).forEach((s: any, idx: number) => {
                const playUrl = s.url || s.externalUrl;
                if (playUrl && typeof playUrl === 'string' && !playUrl.endsWith('.json') && !playUrl.includes('/stream/tv/')) {
                  mirrors.push({
                    id: `stream-matched-${idx}`,
                    name: s.name || `Server ${idx + 1} (${s.resolution || 'HD Live'})`,
                    url: playUrl,
                  });
                }
              });
            }
          } catch {
            // ignore
          }
        }
      }

      if (mirrors.length > 0) {
        return mirrors;
      }

      // 3. Resolve verified 24/7 sports broadcast feeds for this competition/sport
      if (isUnsupportedStreamingCompetition(competitionOrSport)) {
        return [];
      }

      const CHANNEL_LABELS: Record<string, string> = {
        [API_CONFIG.PRIORITY_CHANNELS.BEIN]: 'beIN Sports HD',
        [API_CONFIG.PRIORITY_CHANNELS.GOLAZO]: 'CBS Sports Golazo',
        [API_CONFIG.PRIORITY_CHANNELS.FOOTBALL]: 'Sky Sports Football',
        [API_CONFIG.PRIORITY_CHANNELS.PL]: 'Sky Sports Premier League',
        [API_CONFIG.PRIORITY_CHANNELS.MAIN_EVENT]: 'Sky Sports Main Event',
        [API_CONFIG.PRIORITY_CHANNELS.UCL]: 'TNT Sports 1 HD',
        [API_CONFIG.PRIORITY_CHANNELS.LALIGA]: 'LaLiga TV HD',
        [API_CONFIG.PRIORITY_CHANNELS.DAZN]: 'DAZN LaLiga HD',
        [API_CONFIG.PRIORITY_CHANNELS.NBA]: 'NBA TV HD',
        [API_CONFIG.PRIORITY_CHANNELS.NBA_BACKUP]: 'NBA TV Backup',
        [API_CONFIG.PRIORITY_CHANNELS.NHL]: 'NHL Network',
        [API_CONFIG.PRIORITY_CHANNELS.F1]: 'Sky Sports F1 HD',
        [API_CONFIG.PRIORITY_CHANNELS.TENNIS]: 'Sky Sport Tennis',
      };

      const primaryChannel = getBroadcastChannelId(competitionOrSport, '');
      const compLower = (competitionOrSport || '').toLowerCase();
      let secondaryChannels: string[] = [];

      if (
        compLower.includes('friendly') ||
        compLower.includes('fifa') ||
        compLower.includes('afc') ||
        compLower.includes('caf') ||
        compLower.includes('conmebol') ||
        compLower.includes('concacaf') ||
        compLower.includes('qualifier') ||
        compLower.includes('international')
      ) {
        secondaryChannels = [
          API_CONFIG.PRIORITY_CHANNELS.GOLAZO,
          API_CONFIG.PRIORITY_CHANNELS.FOOTBALL,
          API_CONFIG.PRIORITY_CHANNELS.MAIN_EVENT,
        ];
      } else if (compLower.includes('efl') || compLower.includes('championship')) {
        secondaryChannels = [
          API_CONFIG.PRIORITY_CHANNELS.MAIN_EVENT,
          API_CONFIG.PRIORITY_CHANNELS.BEIN,
        ];
      } else if (primaryChannel === API_CONFIG.PRIORITY_CHANNELS.PL) {
        secondaryChannels = [
          API_CONFIG.PRIORITY_CHANNELS.FOOTBALL,
          API_CONFIG.PRIORITY_CHANNELS.BEIN,
        ];
      } else if (primaryChannel === API_CONFIG.PRIORITY_CHANNELS.BEIN) {
        secondaryChannels = [
          API_CONFIG.PRIORITY_CHANNELS.GOLAZO,
          API_CONFIG.PRIORITY_CHANNELS.FOOTBALL,
        ];
      } else if (primaryChannel === API_CONFIG.PRIORITY_CHANNELS.LALIGA) {
        secondaryChannels = [
          API_CONFIG.PRIORITY_CHANNELS.DAZN,
          API_CONFIG.PRIORITY_CHANNELS.FOOTBALL,
        ];
      } else if (primaryChannel === API_CONFIG.PRIORITY_CHANNELS.UCL) {
        secondaryChannels = [
          API_CONFIG.PRIORITY_CHANNELS.FOOTBALL,
          API_CONFIG.PRIORITY_CHANNELS.BEIN,
        ];
      } else if (primaryChannel === API_CONFIG.PRIORITY_CHANNELS.NBA) {
        secondaryChannels = [
          API_CONFIG.PRIORITY_CHANNELS.NBA_BACKUP,
        ];
      }

      const channelsToFetch = Array.from(new Set([primaryChannel, ...secondaryChannels])).filter(Boolean);

      let serverCounter = 1;
      const channelResults = await Promise.allSettled(
        channelsToFetch.map(async (chId) => {
          const res = await fetch(`${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${chId}.json`, {
            headers: API_CONFIG.DAG_HEADERS,
          });
          if (!res.ok) return [];
          const data = await res.json();
          const extracted: RawStreamSource[] = [];
          const label = CHANNEL_LABELS[chId] || 'Live Satellite Feed';
          (data.streams || []).forEach((s: any) => {
            const playUrl = s.url || s.externalUrl;
            if (playUrl && typeof playUrl === 'string' && !playUrl.endsWith('.json') && !playUrl.includes('/stream/tv/')) {
              extracted.push({
                id: `stream-bcast-${chId}-${extracted.length}`,
                name: `Server ${serverCounter++} (${label})`,
                url: playUrl,
              });
            }
          });
          return extracted;
        })
      );

      channelResults.forEach(r => {
        if (r.status === 'fulfilled' && Array.isArray(r.value)) {
          mirrors.push(...r.value);
        }
      });

      // Strict filter: Guarantee no .json endpoints or invalid strings are returned as video streams
      const validMirrors = mirrors.filter(m => {
        if (!m.url || typeof m.url !== 'string') return false;
        const u = m.url.trim().toLowerCase();
        if (u.endsWith('.json') || u.includes('/stream/tv/')) return false;
        return u.startsWith('http://') || u.startsWith('https://');
      });

      return validMirrors;
    })();

    this.inFlightResolutions.set(cacheKey, resolutionPromise);
    try {
      const result = await resolutionPromise;
      if (result.length > 0) {
        this.resolvedMirrorsCache.set(cacheKey, { data: result, timestamp: Date.now() });
      }
      return result;
    } finally {
      this.inFlightResolutions.delete(cacheKey);
    }
  }

  /**
   * Returns a guaranteed working default stream URL for a competition or sport.
   */
  getDefaultStreamUrl(competition: string = '', sport: string = ''): string {
    const ch = getBroadcastChannelId(competition, sport);
    return `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${ch}.json`;
  }

  /**
   * Converts a LiveMatch into a full DiscoverMatchup object for navigation.
   */
  convertLiveMatchToMatchup(live: LiveMatch): DiscoverMatchup {
    const validHomeBadge = (live.homeBadge && typeof live.homeBadge === 'string' && live.homeBadge.trim().length > 10 && !live.homeBadge.includes('null')) ? live.homeBadge.trim() : null;
    const validAwayBadge = (live.awayBadge && typeof live.awayBadge === 'string' && live.awayBadge.trim().length > 10 && !live.awayBadge.includes('null')) ? live.awayBadge.trim() : null;
    const homeCrest = validHomeBadge || getTeamCrest(live.homeTeam);
    const awayCrest = validAwayBadge || getTeamCrest(live.awayTeam);

    let effectiveCompetition = live.competition;
    let compLogo = live.competitionLogo;

    if (
      !effectiveCompetition ||
      effectiveCompetition === 'Global Football' ||
      effectiveCompetition === 'Football' ||
      effectiveCompetition === 'SOCCER'
    ) {
      const resolved = competitionResolverService.resolveCompetition({
        rawId: live.id,
        rawName: live.title,
        homeTeam: live.homeTeam,
        awayTeam: live.awayTeam,
        sport: live.sport,
      });
      if (resolved.isIdentified) {
        effectiveCompetition = resolved.name;
        compLogo = resolved.logoUrl;
      }
    }

    if (!compLogo) {
      compLogo = resolveCompetitionLogo(effectiveCompetition);
    }
    const compLower = (effectiveCompetition || '').toLowerCase();

    // Authoritative Match Status Normalization
    const rawKickoffRef = live.rawDate || live.kickoffTime || live.time;
    const statusInfo = normalizeMatchStatus({
      rawStatus: live.status,
      minute: live.minute,
      playTime: live.playTime,
      kickoffDate: typeof rawKickoffRef === 'string' ? rawKickoffRef : undefined,
      completed: live.status === 'FT' || (live as any).state === 'post',
    });

    const { status, isLive, isUpcoming, isFinished } = statusInfo;
    const homeScore = isUpcoming ? 0 : (live.score?.home ?? 0);
    const awayScore = isUpcoming ? 0 : (live.score?.away ?? 0);

    const scheduleInfo = (live.kickoffTimestamp || live.rawDate || live.kickoffTime || live.time)
      ? formatMatchSchedule(live.rawDate || live.kickoffTimestamp || live.kickoffTime || live.time)
      : null;

    const kickoffDate = scheduleInfo && scheduleInfo.dateLabel !== 'Upcoming' ? scheduleInfo.dateLabel : 'Today';
    const kickoffTime = isLive
      ? (live.playTime ? (live.playTime.toUpperCase().includes('LIVE') ? live.playTime : `${live.playTime} Live`) : (live.minute > 0 ? `${live.minute}' Live` : 'Live In-Play'))
      : isFinished
      ? 'Full Time'
      : (scheduleInfo && scheduleInfo.timeEAT !== 'Upcoming' ? scheduleInfo.timeEAT : (live.kickoffTime?.includes('EAT') ? live.kickoffTime : formatKickoffEAT(live.kickoffTime || live.time)));

    const kickoffTimestamp = live.kickoffTimestamp !== undefined && live.kickoffTimestamp !== null && live.kickoffTimestamp > 0
      ? live.kickoffTimestamp
      : parseKickoffTimestamp(live.rawDate || live.kickoffTime || live.time);

    const isUnsupported = isUnsupportedStreamingCompetition(live.competition, live.title);
    const compChannel = isUnsupported ? '' : getBroadcastChannelId(live.competition, live.sport);
    const resolvedStreamUrl = isUnsupported ? undefined : (live.streamUrl || (isLive ? `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${compChannel}.json` : undefined));
    const resolvedStreams = isUnsupported
      ? undefined
      : ((live.streams && live.streams.length > 0)
        ? live.streams
        : (isLive && resolvedStreamUrl ? [{ id: `srv-${compChannel}`, name: 'Server 1 (Live HD Broadcast)', url: resolvedStreamUrl }] : undefined));

    const hasLiveStream = !isUnsupported && isLive && Boolean(resolvedStreamUrl || (resolvedStreams && resolvedStreams.length > 0));

    const poster = resolveSportBackground(
      live.sport,
      live.competition,
      live.imageUrl,
      live.homeTeam,
      live.awayTeam,
      live.id,
      homeCrest,
      awayCrest
    );

    return {
      id: live.id,
      competition: effectiveCompetition,
      competitionLogo: compLogo,
      status,
      isLive,
      kickoffDate,
      kickoffTime,
      kickoffTimestamp,
      rawDate: live.rawDate,
      minute: isLive ? live.minute : 0,
      playTime: isLive ? live.playTime : undefined,
      sport: live.sport,
      homeTeam: {
        id: `team-${live.homeTeam.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: live.homeTeam,
        crestUrl: homeCrest,
        score: homeScore,
      },
      awayTeam: {
        id: `team-${live.awayTeam.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: live.awayTeam,
        crestUrl: awayCrest,
        score: awayScore,
      },
      venue: live.venue || (compLower.includes('nba') ? 'NBA Arena' : compLower.includes('nhl') ? 'NHL Ice Arena' : 'Stadium Broadcast'),
      hasLiveBroadcast: isLive || hasLiveStream,
      streamUrl: isLive ? resolvedStreamUrl : undefined,
      streams: isLive ? resolvedStreams : undefined,
      poster,
    };
  }
}

export const streamingApiService = new StreamingApiService();
