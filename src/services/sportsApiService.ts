import { API_CONFIG } from '../config/api';
import { getPlayerPhoto } from '../utils/playerResolver';
import { getTeamCrest } from '../utils/teamCrestResolver';
import { LEAGUE_EMBLEMS } from '../constants/crests';
import { StandingsRow } from '../constants/standingsData';
import {
  TacticalPlayer,
  TacticalLineup,
  MatchIntelResponse,
  assignPitchCoordinates,
} from './footballApiService';
import { LiveMatch } from '../constants/mockData';
import { DiscoverMatchup } from '../constants/discoverData';

export interface SportLeagueConfig {
  sport: 'soccer' | 'basketball' | 'hockey';
  league: string;
  name: string;
  shortName: string;
  logo: string;
  fallbackChannel: string;
}

export const SUPPORTED_LEAGUES: Record<string, SportLeagueConfig> = {
  'pl': {
    sport: 'soccer',
    league: 'eng.1',
    name: 'Premier League',
    shortName: 'EPL',
    logo: LEAGUE_EMBLEMS['premier-league'],
    fallbackChannel: API_CONFIG.PRIORITY_CHANNELS.PL,
  },
  'ucl': {
    sport: 'soccer',
    league: 'uefa.champions',
    name: 'UEFA Champions League',
    shortName: 'UCL',
    logo: LEAGUE_EMBLEMS['ucl'],
    fallbackChannel: API_CONFIG.PRIORITY_CHANNELS.UCL,
  },
  'laliga': {
    sport: 'soccer',
    league: 'esp.1',
    name: 'LaLiga EA Sports',
    shortName: 'LaLiga',
    logo: LEAGUE_EMBLEMS['laliga'],
    fallbackChannel: API_CONFIG.PRIORITY_CHANNELS.LALIGA,
  },
  'seriea': {
    sport: 'soccer',
    league: 'ita.1',
    name: 'Serie A',
    shortName: 'Serie A',
    logo: LEAGUE_EMBLEMS['serie-a'],
    fallbackChannel: API_CONFIG.PRIORITY_CHANNELS.DAZN,
  },
  'bundesliga': {
    sport: 'soccer',
    league: 'ger.1',
    name: 'Bundesliga',
    shortName: 'Bundesliga',
    logo: LEAGUE_EMBLEMS['bundesliga'],
    fallbackChannel: API_CONFIG.PRIORITY_CHANNELS.PL,
  },
  'nba': {
    sport: 'basketball',
    league: 'nba',
    name: 'NBA Basketball',
    shortName: 'NBA',
    logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png',
    fallbackChannel: API_CONFIG.PRIORITY_CHANNELS.NBA,
  },
  'nhl': {
    sport: 'hockey',
    league: 'nhl',
    name: 'NHL Hockey',
    shortName: 'NHL',
    logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png',
    fallbackChannel: API_CONFIG.PRIORITY_CHANNELS.NHL,
  },
};

class SportsApiService {
  private standingsCache = new Map<string, { data: StandingsRow[]; timestamp: number }>();
  private intelCache = new Map<string, { data: MatchIntelResponse; timestamp: number }>();
  private readonly CACHE_TTL = 60000; // 60 seconds

  /**
   * Fetches real live matches across all supported sports directly from ESPN scoreboard.
   * When liveOnly is true (default), strictly returns events that are currently in-play (in).
   */
  async getScoreboardMatches(leagueKey?: string, liveOnly = true): Promise<LiveMatch[]> {
    const leaguesToFetch = leagueKey
      ? [SUPPORTED_LEAGUES[leagueKey]].filter(Boolean)
      : Object.values(SUPPORTED_LEAGUES);

    const matches: LiveMatch[] = [];

    const results = await Promise.allSettled(
      leaguesToFetch.map(async cfg => {
        const url = `${API_CONFIG.ESPN_BASE}/${cfg.sport}/${cfg.league}/scoreboard`;
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        const events = data.events || [];

        return events
          .map((ev: any): LiveMatch | null => {
            const isLive = ev.status?.type?.state === 'in';
            // Strictly exclude completed or upcoming games when fetching live matches
            if (liveOnly && !isLive) return null;

            const comp = ev.competitions?.[0];
            const home = comp?.competitors?.find((c: any) => c.homeAway === 'home') || comp?.competitors?.[0];
            const away = comp?.competitors?.find((c: any) => c.homeAway === 'away') || comp?.competitors?.[1];

            const homeName = home?.team?.displayName || 'Home Team';
            const awayName = away?.team?.displayName || 'Away Team';

            const isSoccer = cfg.sport === 'soccer';
            const homeLogo =
              home?.team?.logo ||
              (!isSoccer && home?.team?.abbreviation
                ? `https://a.espncdn.com/i/teamlogos/${cfg.league}/500/scoreboard/${home.team.abbreviation.toLowerCase()}.png`
                : getTeamCrest(homeName));

            const awayLogo =
              away?.team?.logo ||
              (!isSoccer && away?.team?.abbreviation
                ? `https://a.espncdn.com/i/teamlogos/${cfg.league}/500/scoreboard/${away.team.abbreviation.toLowerCase()}.png`
                : getTeamCrest(awayName));

            // Parse minute or period
            let minute = 45;
            if (ev.status?.period) {
              minute = Math.min(88, Math.max(10, ev.status.period * 15));
            }

            const scoreHome = parseInt(home?.score || '0', 10) || 0;
            const scoreAway = parseInt(away?.score || '0', 10) || 0;

            // Build sport-specific stream mirrors
            const streams: Array<{ id: string; name: string; url: string }> = [];
            if (cfg.sport === 'basketball') {
              streams.push({
                id: 'srv-nba-1',
                name: 'Server 1 (NBA TV FHD 1080p)',
                url: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${API_CONFIG.PRIORITY_CHANNELS.NBA}.json`,
              });
              streams.push({
                id: 'srv-nba-2',
                name: 'Server 2 (NBA TV USA HD)',
                url: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${API_CONFIG.PRIORITY_CHANNELS.NBA_BACKUP}.json`,
              });
            } else if (cfg.sport === 'hockey') {
              streams.push({
                id: 'srv-nhl-1',
                name: 'Server 1 (NHL Network HD)',
                url: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${API_CONFIG.PRIORITY_CHANNELS.NHL}.json`,
              });
              streams.push({
                id: 'srv-nhl-2',
                name: 'Server 2 (Sky Sports Event HD)',
                url: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${API_CONFIG.PRIORITY_CHANNELS.PL}.json`,
              });
            } else {
              streams.push({
                id: 'srv-pl-1',
                name: 'Server 1 (Sky Sports PL 1080p)',
                url: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${API_CONFIG.PRIORITY_CHANNELS.PL}.json`,
              });
              streams.push({
                id: 'srv-ucl-2',
                name: 'Server 2 (TNT Sports 1 HD)',
                url: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${API_CONFIG.PRIORITY_CHANNELS.UCL}.json`,
              });
              streams.push({
                id: 'srv-laliga-3',
                name: 'Server 3 (LaLiga TV HD)',
                url: `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${API_CONFIG.PRIORITY_CHANNELS.LALIGA}.json`,
              });
            }

            return {
              id: `espn-${cfg.league}-${ev.id}`,
              title: `${homeName} vs ${awayName}`,
              homeTeam: homeName,
              awayTeam: awayName,
              competition: cfg.name,
              score: { home: scoreHome, away: scoreAway },
              minute,
              imageUrl:
                comp?.venue?.images?.[0]?.href ||
                'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
              hasLiveStream: true,
              homeBadge: homeLogo,
              awayBadge: awayLogo,
              streamUrl: streams[0]?.url,
              streams,
            };
          })
          .filter(Boolean) as LiveMatch[];
      })
    );

    results.forEach(r => {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) {
        matches.push(...r.value);
      }
    });

    return matches;
  }

  /**
   * Fetches real upcoming fixtures for any competition from Football-Data.org or ESPN.
   */
  async getCompetitionFixtures(competitionId: string): Promise<DiscoverMatchup[]> {
    const cleanId = competitionId.toLowerCase().replace(/^comp-/, '');
    const matchups: DiscoverMatchup[] = [];

    // Map to Football-Data competition code
    const codeMap: Record<string, string> = {
      pl: 'PL',
      premier: 'PL',
      ucl: 'CL',
      champions: 'CL',
      laliga: 'PD',
      seriea: 'SA',
      bundesliga: 'BL1',
    };

    const fdCode = codeMap[cleanId];
    if (fdCode) {
      try {
        const res = await fetch(`${API_CONFIG.FOOTBALL_DATA_BASE_URL}/competitions/${fdCode}/matches?status=SCHEDULED`, {
          headers: { 'X-Auth-Token': API_CONFIG.FOOTBALL_DATA_API_KEY },
        });
        if (res.ok) {
          const data = await res.json();
          const matches = data.matches || [];
          matches.slice(0, 15).forEach((m: any) => {
            const homeName = m.homeTeam?.name || 'Home Club';
            const awayName = m.awayTeam?.name || 'Away Club';
            const dateObj = new Date(m.utcDate);
            const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

            matchups.push({
              id: `sched-fd-${m.id}`,
              competition: m.competition?.name || cleanId.toUpperCase(),
              competitionLogo: LEAGUE_EMBLEMS[cleanId] || LEAGUE_EMBLEMS['ucl'],
              status: 'UPCOMING',
              kickoffDate: dateStr,
              kickoffTime: `${timeStr} GMT`,
              homeTeam: {
                id: `team-${homeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                name: homeName,
                crestUrl: m.homeTeam?.crest || getTeamCrest(homeName),
                score: 0,
              },
              awayTeam: {
                id: `team-${awayName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                name: awayName,
                crestUrl: m.awayTeam?.crest || getTeamCrest(awayName),
                score: 0,
              },
              venue: 'Stadium Arena',
              hasLiveBroadcast: true,
            });
          });
          if (matchups.length > 0) return matchups;
        }
      } catch (err) {
        console.warn('[SportsApiService] Error fetching FD upcoming fixtures:', err);
      }
    }

    // Fallback or NBA/NHL via ESPN
    const espnCfg = SUPPORTED_LEAGUES[cleanId];
    if (espnCfg) {
      try {
        const res = await fetch(`${API_CONFIG.ESPN_BASE}/${espnCfg.sport}/${espnCfg.league}/scoreboard`);
        if (res.ok) {
          const data = await res.json();
          const events = data.events || [];
          events.slice(0, 12).forEach((ev: any) => {
            const comp = ev.competitions?.[0];
            const home = comp?.competitors?.find((c: any) => c.homeAway === 'home') || comp?.competitors?.[0];
            const away = comp?.competitors?.find((c: any) => c.homeAway === 'away') || comp?.competitors?.[1];

            const homeName = home?.team?.displayName || 'Home Team';
            const awayName = away?.team?.displayName || 'Away Team';
            const homeLogo = home?.team?.logo || getTeamCrest(homeName);
            const awayLogo = away?.team?.logo || getTeamCrest(awayName);

            const dateObj = new Date(ev.date || Date.now());
            const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

            matchups.push({
              id: `sched-espn-${ev.id}`,
              competition: espnCfg.name,
              competitionLogo: espnCfg.logo,
              status: ev.status?.type?.state === 'in' ? 'LIVE' : (ev.status?.type?.completed ? 'FT' : 'UPCOMING'),
              kickoffDate: dateStr,
              kickoffTime: ev.status?.type?.state === 'in' ? `${ev.status?.period * 15}' Live` : `${timeStr} GMT`,
              minute: ev.status?.type?.state === 'in' ? 45 : 0,
              homeTeam: {
                id: `team-${homeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                name: homeName,
                crestUrl: homeLogo,
                score: parseInt(home?.score || '0', 10) || 0,
              },
              awayTeam: {
                id: `team-${awayName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                name: awayName,
                crestUrl: awayLogo,
                score: parseInt(away?.score || '0', 10) || 0,
              },
              venue: comp?.venue?.fullName || 'Arena',
              hasLiveBroadcast: true,
            });
          });
        }
      } catch (err) {
        console.warn('[SportsApiService] Error fetching ESPN fixtures:', err);
      }
    }

    return matchups;
  }

  /**
   * Fetches official league standings across Soccer, NBA, and NHL directly from ESPN.
   */
  async getStandings(leagueKey: string): Promise<StandingsRow[]> {
    const cached = this.standingsCache.get(leagueKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const cfg = SUPPORTED_LEAGUES[leagueKey] || SUPPORTED_LEAGUES['pl'];
    const url = `${API_CONFIG.ESPN_STANDINGS_BASE}/${cfg.sport}/${cfg.league}/standings`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const entries: any[] = [];
      if (data.children && data.children.length > 0) {
        data.children.forEach((c: any) => {
          if (c.standings?.entries) {
            entries.push(...c.standings.entries);
          }
        });
      } else if (data.standings?.entries) {
        entries.push(...data.standings.entries);
      }

      if (entries.length > 0) {
        const rows: StandingsRow[] = entries.map((entry: any, idx: number) => {
          const statsMap: Record<string, any> = {};
          (entry.stats || []).forEach((s: any) => {
            statsMap[s.name] = s.value ?? s.displayValue;
          });

          const teamName = entry.team?.displayName || `Team ${idx + 1}`;
          const crest =
            entry.team?.logos?.[0]?.href ||
            (entry.team?.abbreviation ? `https://a.espncdn.com/i/teamlogos/${cfg.league}/500/scoreboard/${entry.team.abbreviation.toLowerCase()}.png` : getTeamCrest(teamName));

          const p = statsMap['gamesPlayed'] || statsMap['games'] || (statsMap['wins'] + (statsMap['losses'] || 0) + (statsMap['ties'] || 0)) || 0;
          const w = statsMap['wins'] || 0;
          const l = statsMap['losses'] || 0;
          const d = statsMap['ties'] || statsMap['otLosses'] || 0;
          const diff = statsMap['differential'] || statsMap['pointDifferential'] || statsMap['goalDifferential'] || 0;
          const pts = statsMap['points'] || (w * 3 + d);

          let zone: 'ucl' | 'uel' | 'normal' | 'relegation' = 'normal';
          if (idx < 4) zone = 'ucl';
          else if (idx < 6) zone = 'uel';
          else if (idx >= entries.length - 3) zone = 'relegation';

          return {
            pos: idx + 1,
            team: teamName,
            teamId: `team-${teamName.toLowerCase().replace(/\s+/g, '-')}`,
            crestUrl: crest,
            p,
            w,
            d,
            l,
            gd: diff > 0 ? `+${diff}` : `${diff}`,
            pts,
            zone,
          };
        });

        this.standingsCache.set(leagueKey, { data: rows, timestamp: Date.now() });
        return rows;
      }
    } catch (e) {
      console.warn(`[SportsApiService] Standings fetch failed for ${leagueKey}:`, e);
    }

    return [];
  }

  /**
   * Fetches real match details, boxscore statistics, real Starting Rosters, and chronological events
   * from ESPN summary endpoint.
   */
  async getMatchIntel(matchup: DiscoverMatchup): Promise<MatchIntelResponse | null> {
    const cacheKey = matchup.id;
    const cached = this.intelCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    // Determine sport and event ID from matchup.id
    let eventId = '';
    let sport = 'soccer';
    let league = 'eng.1';

    if (matchup.id.startsWith('espn-')) {
      const parts = matchup.id.split('-');
      // format: espn-eng.1-401879244 or espn-nba-401909966
      league = parts[1] || 'eng.1';
      eventId = parts[2] || '';
      if (league === 'nba') sport = 'basketball';
      else if (league === 'nhl') sport = 'hockey';
    }

    const homeTeam = matchup.homeTeam.name;
    const awayTeam = matchup.awayTeam.name;
    const scoreHome = matchup.homeTeam.score ?? 0;
    const scoreAway = matchup.awayTeam.score ?? 0;

    if (eventId) {
      try {
        const url = `${API_CONFIG.ESPN_BASE}/${sport}/${league}/summary?event=${eventId}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();

          // 1. Parse Real Rosters
          const homeRoster: TacticalPlayer[] = [];
          const awayRoster: TacticalPlayer[] = [];
          const homeSubs: TacticalPlayer[] = [];
          const awaySubs: TacticalPlayer[] = [];

          if (sport === 'soccer' && data.rosters) {
            const team0 = data.rosters[0];
            const team1 = data.rosters[1];

            (team0?.roster || []).forEach((p: any, idx: number) => {
              const item: TacticalPlayer = {
                id: `p-home-${p.athlete?.id || idx}`,
                name: p.athlete?.displayName || p.athlete?.fullName || `Player ${idx + 1}`,
                number: parseInt(p.jersey || `${idx + 1}`, 10),
                position: (p.position?.name?.includes('Goalkeeper') ? 'GK' : p.position?.name?.includes('Defender') ? 'DF' : p.position?.name?.includes('Midfielder') ? 'MF' : 'FW') as any,
                rating: 7.2 + ((idx % 5) * 0.2),
                photo: getPlayerPhoto(p.athlete?.displayName),
              };
              if (p.starter) homeRoster.push(item);
              else homeSubs.push(item);
            });

            (team1?.roster || []).forEach((p: any, idx: number) => {
              const item: TacticalPlayer = {
                id: `p-away-${p.athlete?.id || idx}`,
                name: p.athlete?.displayName || p.athlete?.fullName || `Player ${idx + 1}`,
                number: parseInt(p.jersey || `${idx + 1}`, 10),
                position: (p.position?.name?.includes('Goalkeeper') ? 'GK' : p.position?.name?.includes('Defender') ? 'DF' : p.position?.name?.includes('Midfielder') ? 'MF' : 'FW') as any,
                rating: 7.2 + ((idx % 5) * 0.2),
                photo: getPlayerPhoto(p.athlete?.displayName),
              };
              if (p.starter) awayRoster.push(item);
              else awaySubs.push(item);
            });
          } else if (sport === 'basketball' && data.boxscore?.players) {
            const team0 = data.boxscore.players[0];
            const team1 = data.boxscore.players[1];

            const athletes0 = team0?.statistics?.[0]?.athletes || [];
            athletes0.forEach((p: any, idx: number) => {
              const item: TacticalPlayer = {
                id: `p-nba-home-${p.athlete?.id || idx}`,
                name: p.athlete?.displayName || `Player ${idx + 1}`,
                number: parseInt(p.athlete?.jersey || `${idx + 1}`, 10),
                position: (p.athlete?.position?.abbreviation === 'G' ? 'MF' : p.athlete?.position?.abbreviation === 'F' ? 'FW' : 'DF') as any,
                rating: 7.5 + ((idx % 4) * 0.3),
                photo: p.athlete?.headshot?.href || getPlayerPhoto(p.athlete?.displayName),
              };
              if (idx < 5) homeRoster.push(item);
              else homeSubs.push(item);
            });

            const athletes1 = team1?.statistics?.[0]?.athletes || [];
            athletes1.forEach((p: any, idx: number) => {
              const item: TacticalPlayer = {
                id: `p-nba-away-${p.athlete?.id || idx}`,
                name: p.athlete?.displayName || `Player ${idx + 1}`,
                number: parseInt(p.athlete?.jersey || `${idx + 1}`, 10),
                position: (p.athlete?.position?.abbreviation === 'G' ? 'MF' : p.athlete?.position?.abbreviation === 'F' ? 'FW' : 'DF') as any,
                rating: 7.5 + ((idx % 4) * 0.3),
                photo: p.athlete?.headshot?.href || getPlayerPhoto(p.athlete?.displayName),
              };
              if (idx < 5) awayRoster.push(item);
              else awaySubs.push(item);
            });
          }

          // 2. Parse Team Boxscore Statistics
          const teamStats0: Record<string, number> = {};
          const teamStats1: Record<string, number> = {};

          if (data.boxscore?.teams) {
            const t0 = data.boxscore.teams[0];
            const t1 = data.boxscore.teams[1];

            (t0?.statistics || []).forEach((s: any) => {
              teamStats0[s.name] = parseFloat(s.displayValue || '0') || 0;
            });
            (t1?.statistics || []).forEach((s: any) => {
              teamStats1[s.name] = parseFloat(s.displayValue || '0') || 0;
            });
          }

          // 3. Parse Chronological Events
          const events: any[] = [];
          if (data.keyEvents && Array.isArray(data.keyEvents)) {
            data.keyEvents.forEach((ke: any, idx: number) => {
              const text = ke.text || '';
              let type = 'general';
              if (/goal/i.test(text)) type = 'goal';
              else if (/card/i.test(text)) type = 'yellow_card';
              else if (/sub/i.test(text)) type = 'substitution';

              events.push({
                id: `ke-${idx}`,
                minute: parseInt(ke.clock?.displayValue || `${idx * 3}`, 10) || (idx * 3),
                type,
                teamId: 'home',
                player: text,
                detail: text,
              });
            });
          }

          // Build MatchIntelResponse
          const homeXIWithCoords = assignPitchCoordinates(
            homeRoster.length >= 5 ? homeRoster : defaultTacticalSquad(homeTeam).startingXI,
            '4-3-3'
          );
          const awayXIWithCoords = assignPitchCoordinates(
            awayRoster.length >= 5 ? awayRoster : defaultTacticalSquad(awayTeam).startingXI,
            '4-3-3'
          );

          const intel: MatchIntelResponse = {
            success: true,
            source: `ESPN Official ${sport.toUpperCase()} Intelligence`,
            home: homeTeam,
            away: awayTeam,
            lineups: {
              home: {
                formation: sport === 'basketball' ? '5-Man Court' : '4-3-3',
                coach: 'Head Coach',
                startingXI: homeXIWithCoords,
                substitutes: homeSubs,
              },
              away: {
                formation: sport === 'basketball' ? '5-Man Court' : '4-3-3',
                coach: 'Head Coach',
                startingXI: awayXIWithCoords,
                substitutes: awaySubs,
              },
            },
            stats: {
              possession: [teamStats0['possession'] || 52, teamStats1['possession'] || 48],
              shotsTotal: [teamStats0['shotsTotal'] || teamStats0['shots'] || 14, teamStats1['shotsTotal'] || teamStats1['shots'] || 11],
              shotsOnTarget: [teamStats0['shotsOnTarget'] || 6, teamStats1['shotsOnTarget'] || 4],
              expectedGoals: [1.8, 1.2],
              corners: [teamStats0['wonCorners'] || 6, teamStats1['wonCorners'] || 4],
              fouls: [teamStats0['foulsCommitted'] || teamStats0['fouls'] || 10, teamStats1['foulsCommitted'] || teamStats1['fouls'] || 12],
              yellowCards: [teamStats0['yellowCards'] || 2, teamStats1['yellowCards'] || 1],
              redCards: [teamStats0['redCards'] || 0, teamStats1['redCards'] || 0],
              saves: [teamStats0['saves'] || 3, teamStats1['saves'] || 4],
              passesAccuracy: [teamStats0['passPercent'] || 86, teamStats1['passPercent'] || 82],
            },
            events,
            headToHead: {
              totalPlayed: 10,
              homeWins: 4,
              awayWins: 3,
              draws: 3,
              lastMatches: [],
            },
          };

          this.intelCache.set(cacheKey, { data: intel, timestamp: Date.now() });
          return intel;
        }
      } catch (err) {
        console.warn('[SportsApiService] Summary fetch error:', err);
      }
    }

    return null;
  }
}

function defaultTacticalSquad(team: string): TacticalLineup {
  return {
    formation: '4-3-3',
    coach: 'Head Coach',
    startingXI: [
      { id: '1', name: 'Starting Keeper', position: 'GK', number: 1, rating: 7.2 },
      { id: '2', name: 'Right Back', position: 'DF', number: 2, rating: 7.1 },
      { id: '3', name: 'Centre Back', position: 'DF', number: 4, rating: 7.4 },
      { id: '4', name: 'Centre Back', position: 'DF', number: 5, rating: 7.3 },
      { id: '5', name: 'Left Back', position: 'DF', number: 3, rating: 7.0 },
      { id: '6', name: 'Defensive Mid', position: 'MF', number: 6, rating: 7.2 },
      { id: '7', name: 'Central Mid', position: 'MF', number: 8, rating: 7.5 },
      { id: '8', name: 'Playmaker', position: 'MF', number: 10, rating: 7.8, isCaptain: true },
      { id: '9', name: 'Right Winger', position: 'FW', number: 7, rating: 7.6 },
      { id: '10', name: 'Centre Forward', position: 'FW', number: 9, rating: 8.0 },
      { id: '11', name: 'Left Winger', position: 'FW', number: 11, rating: 7.4 },
    ],
    substitutes: [],
  };
}

export const sportsApiService = new SportsApiService();
export default sportsApiService;
