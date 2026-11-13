import { API_CONFIG } from '../config/api';
import { LiveMatch } from '../constants/mockData';
import { DiscoverMatchup } from '../constants/discoverData';
import { getTeamCrest } from '../utils/teamCrestResolver';
import { LEAGUE_EMBLEMS, CLUB_CRESTS } from '../constants/crests';
import { sportsApiService } from './sportsApiService';

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

export const SPORT_BACKDROPS: Record<string, string> = {
  soccer: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
  basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
  hockey: 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=800&q=80',
  american_football: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=800&q=80',
  mma: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  motorsport: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
  tennis: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
};

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

      const findMatchedEspn = (homeStr: string, awayStr: string): LiveMatch | undefined => {
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

              const combatLogo = 'https://a.espncdn.com/i/teamlogos/leagues/500/mma.png';
              const b1 = rawLogo1 || posterLogo1 || (isCombat ? combatLogo : getTeamCrest(home));
              const b2 = rawLogo2 || posterLogo2 || (isCombat ? combatLogo : getTeamCrest(away));

              // Deduplicate against existing authentic matches (e.g. ESPN scoreboards)
              const cleanHome = cleanName(home);
              const cleanAway = cleanName(away);
              const hToks = cleanHome.split(/\s+/).filter(w => w.length >= 3);
              const aToks = cleanAway.split(/\s+/).filter(w => w.length >= 3);

              const existingMatch = [...fetchedMatches, ...fetchedUpcoming].find(em => {
                const emH = cleanName(em.homeTeam);
                const emA = cleanName(em.awayTeam);
                const hHit = hToks.some(t => emH.includes(t) || emA.includes(t));
                const aHit = aToks.some(t => emH.includes(t) || emA.includes(t));
                return (hHit && aHit) || (emH === cleanHome && emA === cleanAway);
              });

              if (existingMatch) {
                // Merge direct stream URL into the existing authentic match and discard duplicate generic card
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
                }
                return;
              }

              // Check live status strictly - ignore scheduled upcoming games with future times
              const isReleaseLive = m.releaseInfo === 'LIVE' || cleanTitle.includes('🔴 LIVE') || Boolean(m.description && m.description.includes('LIVE NOW'));
              const isTimeUpcoming = typeof m.releaseInfo === 'string' && (m.releaseInfo.includes('AM') || m.releaseInfo.includes('PM') || m.releaseInfo.includes(':') || cleanTitle.startsWith('⏱️'));
              const matchedEspn = findMatchedEspn(home, away);
              const isEspnLive = Boolean(matchedEspn && matchedEspn.isLive && matchedEspn.minute > 0);
              const isTrulyLive = !isTimeUpcoming && (isReleaseLive || isEspnLive);

              // Select authentic unique artwork or sport backdrop (never generic placeholder)
              const backdrop = (m.poster && !m.poster.includes('null') && !m.poster.includes('undefined'))
                ? m.poster
                : (m.background && !m.background.includes('null'))
                ? m.background
                : (SPORT_BACKDROPS[sport] || SPORT_BACKDROPS.soccer);

              // Generate sport-specific secondary server mirrors
              const streams: Array<{ id: string; name: string; url: string }> = [
                {
                  id: 'srv-direct',
                  name: 'Server 1 (Direct Match Broadcast)',
                  url: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${m.id}.json`,
                },
              ];

              if (sport === 'basketball') {
                streams.push({
                  id: 'srv-nba',
                  name: 'Server 2 (NBA TV FHD)',
                  url: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${API_CONFIG.PRIORITY_CHANNELS.NBA}.json`,
                });
                streams.push({
                  id: 'srv-nba-2',
                  name: 'Server 3 (NBA TV USA)',
                  url: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${API_CONFIG.PRIORITY_CHANNELS.NBA_BACKUP}.json`,
                });
              } else if (sport === 'hockey') {
                streams.push({
                  id: 'srv-nhl',
                  name: 'Server 2 (NHL Network HD)',
                  url: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${API_CONFIG.PRIORITY_CHANNELS.NHL}.json`,
                });
              } else if (sport === 'motorsport') {
                streams.push({
                  id: 'srv-f1',
                  name: 'Server 2 (Sky Sports F1 FHD)',
                  url: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${API_CONFIG.PRIORITY_CHANNELS.F1}.json`,
                });
              } else {
                streams.push({
                  id: 'srv-pl',
                  name: 'Server 2 (Sky Sports PL 1080p)',
                  url: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${API_CONFIG.PRIORITY_CHANNELS.PL}.json`,
                });
                streams.push({
                  id: 'srv-tnt',
                  name: 'Server 3 (TNT Sports 1 HD)',
                  url: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${API_CONFIG.PRIORITY_CHANNELS.UCL}.json`,
                });
              }

              if (!isTrulyLive) {
                // Route upcoming fixtures to upcoming collection with clean scheduled kickoff
                const cleanKickoff = m.releaseInfo ? m.releaseInfo.replace(/^⏱️\s*/, '') : 'Upcoming Today';
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
                  streamUrl: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${m.id}.json`,
                  streams,
                  sport,
                  kickoffTime: cleanKickoff,
                  time: cleanKickoff,
                  venue: isCombat ? 'Championship Octagon' : sport === 'basketball' ? 'NBA Arena' : sport === 'hockey' ? 'NHL Ice Arena' : 'Stadium Arena',
                });
                return;
              }

              // Active Live Game
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
                competition: isCombat ? 'UFC / Combat' : (m.genres?.[0] || genre),
                score: { home: scoreHome, away: scoreAway },
                minute,
                playTime,
                status: 'LIVE',
                imageUrl: backdrop,
                hasLiveStream: true,
                homeBadge: b1,
                awayBadge: b2,
                streamUrl: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${m.id}.json`,
                streams,
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

            fetchedMatches.push({
              id: matchId,
              title: `${home} vs ${away}`,
              homeTeam: home,
              awayTeam: away,
              competition: m.competition?.name || 'Premier League',
              score: { home: scoreHome, away: scoreAway },
              minute,
              imageUrl:
                'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
              hasLiveStream: true,
              homeBadge: m.homeTeam?.crest || getTeamCrest(home),
              awayBadge: m.awayTeam?.crest || getTeamCrest(away),
              streamUrl: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${API_CONFIG.PRIORITY_CHANNELS.PL}.json`,
              streams: [
                { id: 'srv-pl', name: 'Server 1 (Sky Sports PL 1080p)', url: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${API_CONFIG.PRIORITY_CHANNELS.PL}.json` },
                { id: 'srv-tnt', name: 'Server 2 (TNT Sports HD)', url: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${API_CONFIG.PRIORITY_CHANNELS.UCL}.json` },
                { id: 'srv-supersport', name: 'Server 3 (SuperSport PL)', url: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${API_CONFIG.PRIORITY_CHANNELS.SUPERSPORT}.json` },
              ],
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
  async resolveStreamMirrors(itemId: string, competitionOrSport: string = ''): Promise<RawStreamSource[]> {
    const mirrors: RawStreamSource[] = [];
    const cleanId = itemId.replace(/\.json$/, '');

    // 1. If itemId is a direct DAG item ID, resolve its native playable manifests and web embeds
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
        // continue to backup channels
      }
    }

    // 2. Select sport-appropriate guaranteed backup channels
    const compLower = competitionOrSport.toLowerCase();
    const isBasketball = compLower.includes('basketball') || compLower.includes('nba');
    const isHockey = compLower.includes('hockey') || compLower.includes('nhl');
    const isMotorsport = compLower.includes('motorsport') || compLower.includes('f1');

    let fallbackChannels = [
      { name: 'Server (Sky Sports PL 1080p)', id: API_CONFIG.PRIORITY_CHANNELS.PL },
      { name: 'Server (TNT Sports 1 HD)', id: API_CONFIG.PRIORITY_CHANNELS.UCL },
      { name: 'Server (LaLiga TV HD)', id: API_CONFIG.PRIORITY_CHANNELS.LALIGA },
    ];

    if (isBasketball) {
      fallbackChannels = [
        { name: 'Server (NBA TV FHD 1080p)', id: API_CONFIG.PRIORITY_CHANNELS.NBA },
        { name: 'Server (NBA TV USA HD)', id: API_CONFIG.PRIORITY_CHANNELS.NBA_BACKUP },
      ];
    } else if (isHockey) {
      fallbackChannels = [
        { name: 'Server (NHL Network HD)', id: API_CONFIG.PRIORITY_CHANNELS.NHL },
        { name: 'Server (Sky Sports Event HD)', id: API_CONFIG.PRIORITY_CHANNELS.PL },
      ];
    } else if (isMotorsport) {
      fallbackChannels = [
        { name: 'Server (Sky Sports F1 FHD)', id: API_CONFIG.PRIORITY_CHANNELS.F1 },
      ];
    }

    const channelResolutions = await Promise.allSettled(
      fallbackChannels.map(async ch => {
        const res = await fetch(`${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${ch.id}.json`, {
          headers: API_CONFIG.DAG_HEADERS,
        });
        if (res.ok) {
          const data = await res.json();
          const first = data.streams?.[0];
          const playUrl = first?.url || first?.externalUrl;
          if (playUrl) {
            return {
              id: ch.id,
              name: ch.name,
              url: playUrl,
            };
          }
        }
        return null;
      })
    );

    channelResolutions.forEach(r => {
      if (r.status === 'fulfilled' && r.value) {
        if (!mirrors.some(m => m.url === r.value!.url)) {
          mirrors.push(r.value);
        }
      }
    });

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

    const compLower = live.competition.toLowerCase();
    let compLogo = LEAGUE_EMBLEMS['ucl'];
    if (compLower.includes('premier')) compLogo = LEAGUE_EMBLEMS['premier-league'];
    else if (compLower.includes('laliga')) compLogo = LEAGUE_EMBLEMS['laliga'];
    else if (compLower.includes('serie')) compLogo = LEAGUE_EMBLEMS['serie-a'];
    else if (compLower.includes('bundesliga')) compLogo = LEAGUE_EMBLEMS['bundesliga'];
    else if (compLower.includes('nba') || compLower.includes('basketball')) compLogo = 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png';
    else if (compLower.includes('nhl') || compLower.includes('hockey')) compLogo = 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png';
    else if (compLower.includes('ufc') || compLower.includes('mma') || compLower.includes('wwe') || compLower.includes('wrestling')) compLogo = 'https://a.espncdn.com/i/teamlogos/leagues/500/mma.png';
    else if (compLower.includes('nfl') || compLower.includes('american football')) compLogo = 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png';
    else if (compLower.includes('f1') || compLower.includes('formula') || compLower.includes('motorsport')) compLogo = 'https://a.espncdn.com/i/teamlogos/leagues/500/f1.png';

    const isLive = live.status === 'LIVE' || (live.isLive ?? false) || (live.minute > 0 && live.minute < 90);
    const isFinished = live.status === 'FT' || live.minute >= 90;
    const matchStatus = live.status || (isLive ? 'LIVE' : isFinished ? 'FT' : 'UPCOMING');
    const kickoffTime = isLive
      ? (live.playTime ? `${live.playTime} Live` : `${live.minute || 0}' Live`)
      : isFinished
      ? 'Full Time'
      : (live.kickoffTime || live.time || 'Today');

    return {
      id: live.id,
      competition: live.competition,
      competitionLogo: compLogo,
      status: matchStatus,
      kickoffDate: 'Today',
      kickoffTime,
      minute: live.minute,
      sport: live.sport,
      homeTeam: {
        id: `team-${live.homeTeam.toLowerCase().replace(/\s+/g, '-')}`,
        name: live.homeTeam,
        crestUrl: homeCrest,
        score: live.score.home,
      },
      awayTeam: {
        id: `team-${live.awayTeam.toLowerCase().replace(/\s+/g, '-')}`,
        name: live.awayTeam,
        crestUrl: awayCrest,
        score: live.score.away,
      },
      venue: live.venue || (compLower.includes('nba') ? 'NBA Arena' : compLower.includes('nhl') ? 'NHL Ice Arena' : 'Stadium Broadcast'),
      hasLiveBroadcast: true,
      streamUrl: live.streamUrl,
      streams: live.streams,
      poster: live.imageUrl,
    };
  }
}

export const streamingApiService = new StreamingApiService();
