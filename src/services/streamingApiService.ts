import { API_CONFIG } from '../config/api';
import { LiveMatch } from '../constants/mockData';
import { DiscoverMatchup } from '../constants/discoverData';
import { getTeamCrest } from '../utils/teamCrestResolver';
import { LEAGUE_EMBLEMS, CLUB_CRESTS } from '../constants/crests';
import { sportsApiService } from './sportsApiService';
import { resolveSportBackground, isVerifiedEventImage, SPORT_ARTWORK } from '../utils/sportBackgroundResolver';
import { resolveCompetitionLogo } from '../components/common/CompetitionLogo';
import { formatKickoffEAT, normalizeMatchStatus } from '../utils/matchStatus';

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
 * Attempts to parse Home and Away team names from a fixture title.
 */
function parseTeams(name: string): { home: string; away: string } {
  const clean = cleanMatchName(name);
  const parts = clean.split(/\s+(?:vs\.?|–|-|v|at)\s+/i);
  if (parts.length >= 2) {
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

class StreamingApiService {
  private cachedLiveMatches: LiveMatch[] = [];
  private cachedUpcomingMatches: LiveMatch[] = [];
  private lastFetchTime = 0;
  private readonly CACHE_TTL = 30000; // 30 seconds

  /**
   * Fetches real live sports matches and channels directly from cloud APIs.
   * Multi-sport architecture combining ESPN (Soccer, NBA, NHL), DAG Sports, and Football-Data.org.
   */
  async getLiveMatches(forceRefresh = false): Promise<LiveMatch[]> {
    const now = Date.now();
    if (!forceRefresh && this.cachedLiveMatches.length > 0 && now - this.lastFetchTime < this.CACHE_TTL) {
      return this.cachedLiveMatches;
    }

    const fetchedMatches: LiveMatch[] = [];
    const fetchedUpcoming: LiveMatch[] = [];
    const seenMatchIds = new Set<string>();

    // Timeout controller for resilient multi-source fetch
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT_MS);

    // Multi-sport catalogs from DAG Upstream
    const dagCatalogs = [
      { file: 'moviebay_sports_live.json', defaultSport: 'soccer' as const, isLiveSource: true },
      { file: 'moviebay_sports_football.json', defaultSport: 'soccer' as const, isLiveSource: false },
      { file: 'moviebay_sports_basketball.json', defaultSport: 'basketball' as const, isLiveSource: false },
      { file: 'moviebay_sports_hockey.json', defaultSport: 'hockey' as const, isLiveSource: false },
      { file: 'moviebay_sports_american_football.json', defaultSport: 'american_football' as const, isLiveSource: false },
      { file: 'moviebay_sports_mma.json', defaultSport: 'mma' as const, isLiveSource: false },
      { file: 'moviebay_sports_motorsport.json', defaultSport: 'motorsport' as const, isLiveSource: false },
      { file: 'moviebay_sports_tennis.json', defaultSport: 'tennis' as const, isLiveSource: false },
      { file: 'moviebay_sports_upcoming.json', defaultSport: 'soccer' as const, isLiveSource: false },
    ];

    try {
      const [espnMatchesRes, fbLiveRes, ...dagResults] = await Promise.allSettled([
        // 1. ESPN Real-time Multi-sport scoreboards (NBA, NHL, EPL, LaLiga, UCL, Serie A, Bundesliga, UFC)
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
          if (!seenMatchIds.has(m.id)) {
            seenMatchIds.add(m.id);
            if (m.status === 'UPCOMING' || !m.isLive) {
              fetchedUpcoming.push(m);
            } else {
              fetchedMatches.push(m);
            }
          }
        });
      }

      // ── Process Source 2: All DAG Sports Catalogs ──
      const espnLiveList: LiveMatch[] = (espnMatchesRes.status === 'fulfilled' && Array.isArray(espnMatchesRes.value))
        ? espnMatchesRes.value
        : [];

      const cleanName = (s: string) =>
        s.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\b(fc|cf|sc|afc|club|united|city|women|ladies|men)\b/g, '').trim();

      const findMatchedEspn = (homeStr: string, awayStr: string, eventIdOrPoster?: string): LiveMatch | undefined => {
        if (eventIdOrPoster) {
          const directHit = espnLiveList.find(em => em.id && eventIdOrPoster.includes(em.id));
          if (directHit) return directHit;
        }

        const hClean = cleanName(homeStr);
        const aClean = cleanName(awayStr);
        const hToks = hClean.split(/\s+/).filter(w => w.length >= 3);
        const aToks = aClean.split(/\s+/).filter(w => w.length >= 3);

        return espnLiveList.find(em => {
          const emH = cleanName(em.homeTeam);
          const emA = cleanName(em.awayTeam);
          const hHit = hToks.some(t => emH.includes(t) || emA.includes(t));
          const aHit = aToks.some(t => emH.includes(t) || emA.includes(t));
          return hHit && aHit;
        }) || espnLiveList.find(em => {
          const emH = cleanName(em.homeTeam);
          const emA = cleanName(em.awayTeam);
          return hToks.some(t => t.length >= 4 && (emH.includes(t) || emA.includes(t))) ||
                 aToks.some(t => t.length >= 4 && (emH.includes(t) || emA.includes(t)));
        });
      };

      for (let i = 0; i < dagCatalogs.length; i++) {
        const catConfig = dagCatalogs[i];
        const result = dagResults[i];
        if (result && result.status === 'fulfilled' && result.value.ok) {
          try {
            const dagJson = await result.value.json();
            const metas = dagJson.metas || [];
            metas.forEach((m: any, idx: number) => {
              if (seenMatchIds.has(m.id)) return;

              const genre = (m.genres?.[0] || 'LIVE SPORTS').toUpperCase();
              // Strictly exclude 24/7 standalone TV channels without fixture
              if (genre === 'NETWORKS' || genre.includes('CHANNEL')) return;
              if (m.name && (m.name.startsWith('📺') || m.name.includes('24/7 Network'))) return;

              const cleanTitle = cleanMatchName(m.name || '');

              let home = m.team1?.name;
              let away = m.team2?.name;
              if (!home || !away) {
                const parsed = parseTeams(cleanTitle);
                home = home || parsed.home;
                away = away || parsed.away;
              }

              // Support combat sports (UFC, WWE, TNA, MMA) where event title is headline
              const isCombat =
                catConfig.defaultSport === 'mma' ||
                genre.includes('MMA') ||
                genre.includes('WRESTLING') ||
                /ufc|wwe|tna|aew|mma|boxing/i.test(cleanTitle) ||
                /ufc|wwe|tna|aew|mma|boxing/i.test(m.description || '');

              if (isCombat) {
                if (!home) home = cleanTitle;
                if (!away) away = 'Championship Card';
              } else {
                // Exclude fake fixtures ("vs Opponent" or standalone TV channel titles)
                if (!away || away.toLowerCase() === 'opponent' || away.toLowerCase().includes('live 24/7') || (home && home.toLowerCase().includes('tv') && !m.team2)) {
                  return;
                }
              }

              seenMatchIds.add(m.id);

              // Detect specific sport
              let sport: LiveMatch['sport'] = catConfig.defaultSport;
              const titleLower = cleanTitle.toLowerCase();
              if (genre.includes('BASKETBALL') || titleLower.includes('nba')) {
                sport = 'basketball';
              } else if (genre.includes('HOCKEY') || titleLower.includes('nhl')) {
                sport = 'hockey';
              } else if (isCombat) {
                sport = 'mma';
              } else if (genre.includes('AMERICAN FOOTBALL') || titleLower.includes('nfl')) {
                sport = 'american_football';
              } else if (genre.includes('MOTORSPORT') || titleLower.includes('f1') || titleLower.includes('formula')) {
                sport = 'motorsport';
              } else if (genre.includes('TENNIS') || titleLower.includes('atp') || titleLower.includes('wta')) {
                sport = 'tennis';
              }

              // High-resolution authentic team crests directly from DAG event meta, poster query or resolver
              const rawLogo1 = (typeof m.team1?.logo === 'string' && m.team1.logo.trim().length > 10 && !m.team1.logo.includes('null')) ? m.team1.logo.trim() : null;
              const rawLogo2 = (typeof m.team2?.logo === 'string' && m.team2.logo.trim().length > 10 && !m.team2.logo.includes('null')) ? m.team2.logo.trim() : null;
              const posterLogo1 = extractPosterParam(m.poster, 'b1');
              const posterLogo2 = extractPosterParam(m.poster, 'b2');

              const combatLogo = 'https://a.espncdn.com/i/teamlogos/leagues/500/ufc.png';
              const b1 = rawLogo1 || posterLogo1 || (isCombat ? combatLogo : getTeamCrest(home));
              const b2 = rawLogo2 || posterLogo2 || (isCombat ? combatLogo : getTeamCrest(away));

              // Deduplicate against existing authentic matches (e.g. ESPN scoreboards)
              const cleanHome = cleanName(home);
              const cleanAway = cleanName(away);
              const hToks = cleanHome.split(/\s+/).filter(w => w.length >= 3);
              const aToks = cleanAway.split(/\s+/).filter(w => w.length >= 3);

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
                  // If DAG provided a verified event thumbnail or existing match has a generic Unsplash image, upgrade to DAG artwork
                  if (
                    isVerifiedEventImage(resolvedDagArt) ||
                    !existingMatch.imageUrl ||
                    existingMatch.imageUrl.includes('images.unsplash.com') ||
                    !isVerifiedEventImage(existingMatch.imageUrl)
                  ) {
                    existingMatch.imageUrl = resolvedDagArt;
                  }
                }

                // 2. If existing match still has generic "Global Football", upgrade to specific DAG genre if available
                if (
                  existingMatch.competition === 'Global Football' &&
                  m.genres?.[0] &&
                  m.genres[0] !== 'FOOTBALL' &&
                  m.genres[0] !== 'SOCCER'
                ) {
                  existingMatch.competition = m.genres[0];
                  existingMatch.competitionLogo = resolveCompetitionLogo(m.genres[0]);
                }

                // 3. Merge direct stream URL into the existing authentic match and discard duplicate generic card
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

              // Check live status strictly - ignore scheduled upcoming games with future times
              const isReleaseLive = m.releaseInfo === 'LIVE' || cleanTitle.includes('🔴 LIVE') || Boolean(m.description && m.description.includes('LIVE NOW'));
              const isTimeUpcoming = typeof m.releaseInfo === 'string' && (m.releaseInfo.includes('AM') || m.releaseInfo.includes('PM') || m.releaseInfo.includes(':') || cleanTitle.startsWith('⏱️'));
              const matchedEspn = findMatchedEspn(home, away, `${m.id || ''} ${m.poster || ''}`);
              const isEspnLive = Boolean(matchedEspn && matchedEspn.isLive && (matchedEspn.minute > 0 || matchedEspn.score.home > 0 || matchedEspn.score.away > 0));
              const isTrulyLive = !isTimeUpcoming && (isReleaseLive || isEspnLive);

              // Select authentic unique artwork with multi-sport detection (never generic placeholder)
              const backdrop = resolveSportBackground(
                sport,
                m.genres?.[0] || genre,
                m.poster || m.background,
                home,
                away,
                m.id
              );

              if (!isTrulyLive) {
                // Route upcoming fixtures to upcoming collection with clean scheduled kickoff in EAT
                const cleanKickoff = m.releaseInfo ? m.releaseInfo.replace(/^⏱️\s*/, '') : 'Upcoming';
                const eatKickoff = cleanKickoff.includes('EAT') ? cleanKickoff : formatKickoffEAT(cleanKickoff);

                fetchedUpcoming.push({
                  id: m.id,
                  title: cleanTitle.replace(/^⏱️\s*/, ''),
                  homeTeam: home,
                  awayTeam: away,
                  competition: isCombat ? 'UFC / Combat' : (m.genres?.[0] || genre),
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
                  venue: isCombat ? 'Championship Octagon' : sport === 'basketball' ? 'NBA Arena' : sport === 'hockey' ? 'NHL Ice Arena' : 'Stadium Arena',
                });
                return;
              }

              // Active Live Game: Only attach direct fixture-specific stream
              const directStreamUrl = `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${m.id}.json`;
              const directStreams: Array<{ id: string; name: string; url: string }> = [
                {
                  id: `srv-direct-${m.id}`,
                  name: 'Server 1 (Direct Match Broadcast)',
                  url: directStreamUrl,
                },
              ];

              let scoreHome = 0;
              let scoreAway = 0;
              let minute = 1;
              let playTime: string | undefined = undefined;
              let kickoffTime = 'Live In-Play';

              if (matchedEspn && matchedEspn.isLive) {
                scoreHome = matchedEspn.score.home;
                scoreAway = matchedEspn.score.away;
                minute = matchedEspn.minute;
                playTime = matchedEspn.playTime;
                kickoffTime = matchedEspn.kickoffTime || (matchedEspn.playTime ? `${matchedEspn.playTime} Live` : 'Live In-Play');
              } else if (matchedEspn && matchedEspn.score) {
                scoreHome = matchedEspn.score.home;
                scoreAway = matchedEspn.score.away;
                minute = matchedEspn.minute;
                playTime = matchedEspn.playTime || 'Live';
                kickoffTime = matchedEspn.kickoffTime || 'Live In-Play';
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
                competition: isCombat
                  ? 'UFC / Combat'
                  : (matchedEspn?.competition && matchedEspn.competition !== 'Global Football'
                      ? matchedEspn.competition
                      : (m.genres?.[0] || genre)),
                score: { home: scoreHome, away: scoreAway },
                minute,
                playTime,
                status: 'LIVE',
                imageUrl: (matchedEspn && isVerifiedEventImage(matchedEspn.imageUrl)) ? matchedEspn.imageUrl : backdrop,
                hasLiveStream: true,
                homeBadge: b1,
                awayBadge: b2,
                streamUrl: directStreamUrl,
                streams: directStreams,
                sport,
                kickoffTime,
                venue: isCombat ? 'Championship Octagon' : sport === 'basketball' ? 'NBA Arena' : sport === 'hockey' ? 'NHL Ice Arena' : 'Stadium Arena',
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
            const matchId = `fb-live-${m.id}`;
            if (seenMatchIds.has(matchId)) return;
            seenMatchIds.add(matchId);

            const scoreHome = m.score?.fullTime?.home ?? (m.score?.halfTime?.home ?? 0);
            const scoreAway = m.score?.fullTime?.away ?? (m.score?.halfTime?.away ?? 0);
            const minute = m.minute || 45;
            const bgImage = resolveSportBackground('soccer', m.competition?.name || 'Premier League', null, home, away, matchId);

            fetchedMatches.push({
              id: matchId,
              title: `${home} vs ${away}`,
              homeTeam: home,
              awayTeam: away,
              competition: m.competition?.name || 'Premier League',
              score: { home: scoreHome, away: scoreAway },
              minute,
              imageUrl: bgImage,
              hasLiveStream: false,
              homeBadge: m.homeTeam?.crest || getTeamCrest(home),
              awayBadge: m.awayTeam?.crest || getTeamCrest(away),
              streamUrl: undefined,
              streams: [],
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
        const uKey = `${cleanName(u.homeTeam)}-${cleanName(u.awayTeam)}`;
        if (!seenUpcomingKeys.has(uKey) && !seenUpcomingKeys.has(u.id)) {
          seenUpcomingKeys.add(uKey);
          seenUpcomingKeys.add(u.id);
          uniqueUpcoming.push(u);
        }
      });

      // Combine: Live matches first, then scheduled upcoming fixtures
      const combined = [...fetchedMatches, ...uniqueUpcoming];

      if (combined.length > 0) {
        this.cachedLiveMatches = combined;
        this.lastFetchTime = now;
      }
      if (uniqueUpcoming.length > 0) {
        this.cachedUpcomingMatches = uniqueUpcoming;
      }
    } catch (err) {
      console.warn('[StreamingApiService] Error fetching live sports:', err);
    } finally {
      clearTimeout(timer);
    }

    return this.cachedLiveMatches;
  }

  /**
   * Returns authenticated upcoming fixtures across sports.
   */
  async getUpcomingMatches(forceRefresh = false): Promise<LiveMatch[]> {
    if (!forceRefresh && this.cachedUpcomingMatches.length > 0) {
      return this.cachedUpcomingMatches;
    }
    await this.getLiveMatches(forceRefresh);
    return this.cachedUpcomingMatches;
  }

  /**
   * Resolves playable HLS stream manifests or responsive web embeds specifically for any fixture or channel ID.
   * If it's a DAG item, resolves both stream.url and stream.externalUrl.
   * Attaches sport-appropriate guaranteed working mirrors.
   */
  /**
   * Resolves playable HLS stream manifests or responsive web embeds specifically for any fixture ID.
   * Never injects unrelated 24/7 TV channels as fake fallbacks.
   */
  async resolveStreamMirrors(itemId: string, competitionOrSport: string = ''): Promise<RawStreamSource[]> {
    const mirrors: RawStreamSource[] = [];
    const cleanId = itemId.replace(/\.json$/, '');

    // Only resolve authentic streams belonging specifically to this fixture ID
    if (itemId.startsWith('moviebay_')) {
      try {
        const res = await fetch(`${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${cleanId}.json`, {
          headers: API_CONFIG.DAG_HEADERS,
        });
        if (res.ok) {
          const data = await res.json();
          (data.streams || []).forEach((s: any, idx: number) => {
            const playUrl = s.url || s.externalUrl;
            if (playUrl) {
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

    // Strictly never fabricate or attach unrelated TV channels as match stream fallbacks!
    return mirrors;
  }

  /**
   * Converts a LiveMatch into a full DiscoverMatchup object for navigation.
   */
  convertLiveMatchToMatchup(live: LiveMatch): DiscoverMatchup {
    const validHomeBadge = (live.homeBadge && typeof live.homeBadge === 'string' && live.homeBadge.trim().length > 10 && !live.homeBadge.includes('null')) ? live.homeBadge.trim() : null;
    const validAwayBadge = (live.awayBadge && typeof live.awayBadge === 'string' && live.awayBadge.trim().length > 10 && !live.awayBadge.includes('null')) ? live.awayBadge.trim() : null;
    const homeCrest = validHomeBadge || getTeamCrest(live.homeTeam);
    const awayCrest = validAwayBadge || getTeamCrest(live.awayTeam);

    const compLogo = live.competitionLogo || resolveCompetitionLogo(live.competition);
    const compLower = (live.competition || '').toLowerCase();

    // Authoritative Match Status Normalization
    const statusInfo = normalizeMatchStatus({
      rawStatus: live.status,
      minute: live.minute,
      playTime: live.playTime,
      completed: live.status === 'FT' || live.minute === 90,
    });

    const { status, isLive, isUpcoming, isFinished } = statusInfo;
    const homeScore = isUpcoming ? 0 : (live.score?.home ?? 0);
    const awayScore = isUpcoming ? 0 : (live.score?.away ?? 0);

    const kickoffTime = isLive
      ? (live.playTime ? (live.playTime.toUpperCase().includes('LIVE') ? live.playTime : `${live.playTime} Live`) : (live.minute > 0 ? `${live.minute}' Live` : 'Live In-Play'))
      : isFinished
      ? 'Full Time'
      : (live.kickoffTime?.includes('EAT') ? live.kickoffTime : formatKickoffEAT(live.kickoffTime || live.time));

    const hasLiveStream = isLive && Boolean(live.streamUrl || (live.streams && live.streams.length > 0));

    const poster = resolveSportBackground(
      live.sport,
      live.competition,
      live.imageUrl,
      live.homeTeam,
      live.awayTeam,
      live.id
    );

    return {
      id: live.id,
      competition: live.competition,
      competitionLogo: compLogo,
      status,
      kickoffDate: 'Today',
      kickoffTime,
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
      hasLiveBroadcast: hasLiveStream,
      streamUrl: isLive ? live.streamUrl : undefined,
      streams: isLive ? live.streams : undefined,
      poster,
    };
  }
}

export const streamingApiService = new StreamingApiService();
