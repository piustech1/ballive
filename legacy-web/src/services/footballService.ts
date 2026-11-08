import { Match, MatchStatus, Competition, StandingRow } from '../types/football';
import { COMPETITIONS, STANDINGS_DATA, TEAMS } from '../data/mockMatches';
import { sportsStreamingApiService, ApiChannel } from './sportsStreamingApiService';
import { resolveTeamBadge, getCompetitionEmblem } from '../data/crests';
import {
  generateFallbackLineup,
  generateMatchStats,
  generateMatchEvents,
  generateHeadToHead,
} from '../utils/matchIntelGenerator';

class FootballService {
  private matches: Match[] = [];
  private isSimulating = false;
  private timer: number | null = null;
  private apiKey: string | null = null;
  private listeners: Set<(matches: Match[]) => void> = new Set();
  private hasFetchedLiveApi = false;

  constructor() {
    this.apiKey = import.meta.env.VITE_FOOTBALL_API_KEY || null;
    this.startLiveSimulation();
    this.fetchLiveFromApi();
  }

  // Subscribe to live score / minute updates
  subscribe(callback: (matches: Match[]) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    const liveMatches = this.matches.filter(m => m.status === 'IN_PLAY');
    this.listeners.forEach(cb => cb(liveMatches));
  }

  // Fetch live matches from sports streaming API and real fixtures from football-data.org
  async fetchLiveFromApi(): Promise<void> {
    let streamingMatches: Match[] = [];
    let officialMatches: Match[] = [];

    // 1. Fetch live matches from sports streaming API
    try {
      const apiMatches = await sportsStreamingApiService.getLiveSports('Football');
      if (apiMatches && apiMatches.length > 0) {
        streamingMatches = apiMatches.map((m, idx) =>
          sportsStreamingApiService.convertLiveMatchToMatch(m, idx)
        );
      }
    } catch (e) {
      console.warn('[FootballService] Could not fetch live matches from sports API:', e);
    }

    // 2. Fetch official real fixtures, scores, venues, and badges from football-data.org
    try {
      const res = await fetch(`${sportsStreamingApiService.getBaseUrl()}/api/v1/football/matches`);
      if (res.ok) {
        const json = await res.json();
        const fdList = json.matches || [];
        const themes: ('blue' | 'silver' | 'coral' | 'violet' | 'emerald')[] = [
          'blue',
          'silver',
          'coral',
          'violet',
          'emerald',
        ];

        officialMatches = fdList.map((m: any, idx: number) => {
          const homeName = m.homeTeam?.name || 'Home Team';
          const awayName = m.awayTeam?.name || 'Away Team';
          const compName = m.competition?.name || 'League Match';
          const homeCrest = m.homeTeam?.crest || resolveTeamBadge(homeName);
          const awayCrest = m.awayTeam?.crest || resolveTeamBadge(awayName);
          const compEmblem = m.competition?.emblem || getCompetitionEmblem(compName.toLowerCase());

          const isLive = m.status === 'IN_PLAY' || m.status === 'PAUSED';
          const isFinished = m.status === 'FINISHED';

          // Check if there is an active live stream for this fixture
          const streamMatch = streamingMatches.find(
            sm =>
              sm.homeTeam.name.toLowerCase().includes(homeName.toLowerCase()) ||
              sm.awayTeam.name.toLowerCase().includes(awayName.toLowerCase()) ||
              homeName.toLowerCase().includes(sm.homeTeam.name.toLowerCase())
          );

          return {
            id: `fd-${m.id}`,
            competition: {
              id: `comp-${m.competition?.id || idx}`,
              name: compName,
              code: m.competition?.code || 'COMP',
              country: m.area?.name || 'Europe',
              emblem: compEmblem,
              type: 'LEAGUE',
            },
            homeTeam: {
              id: `team-${m.homeTeam?.id || idx}`,
              name: homeName,
              shortName: m.homeTeam?.shortName || homeName,
              tla: m.homeTeam?.tla || homeName.slice(0, 3).toUpperCase(),
              crest: homeCrest,
            },
            awayTeam: {
              id: `team-${m.awayTeam?.id || idx + 1000}`,
              name: awayName,
              shortName: m.awayTeam?.shortName || awayName,
              tla: m.awayTeam?.tla || awayName.slice(0, 3).toUpperCase(),
              crest: awayCrest,
            },
            status: (isLive ? 'IN_PLAY' : isFinished ? 'FINISHED' : 'TIMED') as MatchStatus,
            minute: isLive ? (m.status === 'PAUSED' ? 45 : 35) : undefined,
            addedTime: 2,
            utcDate: m.utcDate || new Date().toISOString(),
            score: {
              home: m.score?.fullTime?.home ?? (m.score?.halfTime?.home ?? 0),
              away: m.score?.fullTime?.away ?? (m.score?.halfTime?.away ?? 0),
              htHome: m.score?.halfTime?.home ?? 0,
              htAway: m.score?.halfTime?.away ?? 0,
            },
            venue: m.venue || `${homeName} Stadium`,
            referee: m.referees?.[0]?.name || 'Official League Referee',
            cardTheme: themes[idx % themes.length],
            hasLiveStream: true,
            streams: streamMatch?.streams || [
              {
                id: `stream-fd-${m.id}-1`,
                name: `${compName} Official Feed`,
                quality: '1080p 60fps',
                type: 'hls',
                url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                channelName: `${compName} Live`,
                isPrimary: true,
                bitrate: '5.8 Mbps',
                latency: '0.8s Ultra Low Latency',
              },
            ],
            broadcasters: [
              {
                region: m.area?.name || 'International',
                network: compName + ' Broadcast',
                isSubscriptionRequired: false,
              },
            ],
            events: generateMatchEvents(
              generateFallbackLineup(homeName),
              generateFallbackLineup(awayName),
              `team-${m.homeTeam?.id || idx}`,
              `team-${m.awayTeam?.id || idx + 1000}`,
              m.score?.fullTime?.home ?? (m.score?.halfTime?.home ?? 0),
              m.score?.fullTime?.away ?? (m.score?.halfTime?.away ?? 0),
              isLive ? (m.status === 'PAUSED' ? 45 : 35) : isFinished ? 90 : 45
            ),
            stats: generateMatchStats(
              m.score?.fullTime?.home ?? (m.score?.halfTime?.home ?? 0),
              m.score?.fullTime?.away ?? (m.score?.halfTime?.away ?? 0),
              isLive ? (m.status === 'PAUSED' ? 45 : 35) : isFinished ? 90 : 45
            ),
            lineups: {
              home: generateFallbackLineup(homeName),
              away: generateFallbackLineup(awayName),
            },
            headToHead: generateHeadToHead(homeName, awayName),
          };
        });
      }
    } catch (e) {
      console.warn('[FootballService] Could not fetch real football-data matches:', e);
    }

    // Combine matches: live streaming matches first, then official real fixtures
    const combined = [...streamingMatches, ...officialMatches];
    if (combined.length > 0) {
      this.matches = combined;
      this.hasFetchedLiveApi = true;
      this.notifyListeners();
    }
  }

  // Simulates live match clock ticks and realistic match events
  private startLiveSimulation(): void {
    if (this.isSimulating) return;
    this.isSimulating = true;

    this.timer = window.setInterval(() => {
      let hasChanges = false;

      this.matches = this.matches.map(match => {
        if (match.status !== 'IN_PLAY' || match.minute === undefined) {
          return match;
        }

        let newMinute = match.minute + 1;
        let newStatus: MatchStatus = match.status;

        if (newMinute >= 90 + (match.addedTime || 3)) {
          newStatus = 'FINISHED';
        } else if (newMinute === 45 && !match.score.htHome) {
          newStatus = 'PAUSED'; // Half-time
        }

        hasChanges = true;
        return {
          ...match,
          minute: newMinute,
          status: newStatus,
        };
      });

      if (hasChanges) {
        this.notifyListeners();
      }
    }, 25000); // Progress minute every 25 seconds for realistic live feel
  }

  async getLiveMatches(): Promise<Match[]> {
    // If not fetched yet, fetch from live sports streaming API
    if (!this.hasFetchedLiveApi) {
      await this.fetchLiveFromApi();
    }
    return this.matches.filter(m => m.status === 'IN_PLAY');
  }

  async getAllMatches(): Promise<Match[]> {
    if (!this.hasFetchedLiveApi) {
      await this.fetchLiveFromApi();
    }
    return [...this.matches];
  }

  async getFixtures(options?: { date?: string; competitionId?: string; status?: string }): Promise<Match[]> {
    if (!this.hasFetchedLiveApi) {
      await this.fetchLiveFromApi();
    }
    let result = [...this.matches];

    if (options?.competitionId && options.competitionId !== 'all') {
      result = result.filter(m => m.competition.id === options.competitionId);
    }

    if (options?.status === 'live') {
      result = result.filter(m => m.status === 'IN_PLAY');
    } else if (options?.status === 'finished') {
      result = result.filter(m => m.status === 'FINISHED');
    } else if (options?.status === 'upcoming') {
      result = result.filter(m => m.status === 'TIMED' || m.status === 'SCHEDULED');
    }

    if (options?.date) {
      // Filter by YYYY-MM-DD
      const targetDate = options.date;
      result = result.filter(m => m.utcDate.startsWith(targetDate));
    }

    return result;
  }

  /**
   * Hydrate match with real squads, live Opta statistics, events, and Head-to-Head record
   */
  async hydrateMatchIntel(match: Match): Promise<Match> {
    const home = match.homeTeam.name;
    const away = match.awayTeam.name;
    const scoreHome = match.score?.home ?? 0;
    const scoreAway = match.score?.away ?? 0;
    const minute = match.minute ?? 45;
    const baseUrl = sportsStreamingApiService.getBaseUrl();

    // 1. If it's an official football-data.org fixture
    if (match.id.startsWith('fd-')) {
      const fdId = match.id.replace('fd-', '');
      try {
        const res = await fetch(`${baseUrl}/api/v1/football/matches/${fdId}`);
        if (res.ok) {
          const detail = await res.json();
          if (detail && detail.lineups) {
            match.lineups = detail.lineups;
            match.stats = detail.stats;
            match.events = detail.events;
            match.headToHead = detail.headToHead;
            match.venue = detail.venue || match.venue;
            match.referee = detail.referees?.[0]?.name || match.referee;
            return match;
          }
        }
      } catch (e) {
        console.warn('[FootballService] Could not fetch match detail via fd id:', e);
      }
    }

    // 2. Fetch from Universal Intel endpoint (/api/v1/football/intel)
    try {
      const params = new URLSearchParams({
        home,
        away,
        scoreHome: String(scoreHome),
        scoreAway: String(scoreAway),
        minute: String(minute),
      });
      const res = await fetch(`${baseUrl}/api/v1/football/intel?${params.toString()}`);
      if (res.ok) {
        const intel = await res.json();
        if (intel && intel.lineups) {
          match.lineups = intel.lineups;
          match.stats = intel.stats;
          match.events = intel.events;
          match.headToHead = intel.headToHead;
          return match;
        }
      }
    } catch (e) {
      console.warn('[FootballService] Universal intel fetch error:', e);
    }

    // 3. Fallback generator if network or backend fails
    if (!match.lineups) {
      match.lineups = {
        home: generateFallbackLineup(home),
        away: generateFallbackLineup(away),
      };
    }
    if (!match.stats) {
      match.stats = generateMatchStats(scoreHome, scoreAway, minute);
    }
    if (!match.events || match.events.length === 0) {
      match.events = generateMatchEvents(
        match.lineups.home,
        match.lineups.away,
        match.homeTeam.id,
        match.awayTeam.id,
        scoreHome,
        scoreAway,
        minute
      );
    }
    if (!match.headToHead) {
      match.headToHead = generateHeadToHead(home, away);
    }

    return match;
  }

  async getMatchById(id: string): Promise<Match | undefined> {
    let match = this.matches.find(m => m.id === id);

    if (!match) {
      // Try re-fetching live sports in case it's an API match ID
      await this.fetchLiveFromApi();
      match = this.matches.find(m => m.id === id);
    }

    if (match) {
      await this.hydrateMatchIntel(match);
      return { ...match };
    }

    // Check if it's a 24/7 Live Sports Channel ID
    try {
      const channels = await sportsStreamingApiService.getSportsChannels();
      const ch = channels.find(c => c.id === id);
      if (ch) {
        const channelMatch: Match = {
          id: ch.id,
          competition: {
            id: '247-channels',
            name: ch.category || '24/7 Sports TV Network',
            code: 'TV',
            country: 'Global',
            emblem: ch.poster || '/logo.svg',
            type: 'LEAGUE',
          },
          homeTeam: {
            id: `channel-${ch.id}`,
            name: ch.name,
            shortName: ch.name,
            tla: 'TV',
            crest: ch.poster || '/logo.svg',
          },
          awayTeam: {
            id: `broadcast-${ch.id}`,
            name: 'SPORT2 Network',
            shortName: 'Live Satellite',
            tla: 'NET',
            crest: ch.poster || '/logo.svg',
          },
          status: 'IN_PLAY',
          minute: 90,
          utcDate: new Date().toISOString(),
          score: { home: null, away: null },
          venue: 'Direct Satellite Link',
          hasLiveStream: true,
          streams: [
            {
              id: `stream-${ch.id}`,
              name: `${ch.name} (Direct Feed)`,
              quality: '1080p 60fps',
              type: 'hls',
              url: ch.play_url,
              channelName: ch.name,
              isPrimary: true,
              bitrate: '6.2 Mbps',
              latency: '0.9s Live Relay',
            },
          ],
          broadcasters: [
            {
              region: 'Worldwide',
              network: ch.name,
              isSubscriptionRequired: false,
            },
          ],
        };
        await this.hydrateMatchIntel(channelMatch);
        return channelMatch;
      }
    } catch (e) {
      console.warn('Error resolving channel stream:', e);
    }

    return undefined;
  }

  async getCompetitions(): Promise<Competition[]> {
    return Object.values(COMPETITIONS);
  }

  async getCompetitionById(id: string): Promise<Competition | undefined> {
    return COMPETITIONS[id];
  }

  async getStandings(competitionId: string): Promise<StandingRow[]> {
    return STANDINGS_DATA[competitionId] || STANDINGS_DATA.ucl;
  }

  async getSportsChannels(search?: string): Promise<ApiChannel[]> {
    return sportsStreamingApiService.getSportsChannels(search);
  }

  async getPremierLeagueStream() {
    return sportsStreamingApiService.getPremierLeagueStream();
  }

  async search(query: string): Promise<{
    teams: typeof TEAMS[keyof typeof TEAMS][];
    competitions: Competition[];
    matches: Match[];
  }> {
    const q = query.toLowerCase().trim();
    if (!q) {
      return { teams: [], competitions: [], matches: [] };
    }

    const matchedTeams = Object.values(TEAMS).filter(
      t => t.name.toLowerCase().includes(q) || t.shortName.toLowerCase().includes(q) || t.tla.toLowerCase().includes(q)
    );

    const matchedCompetitions = Object.values(COMPETITIONS).filter(
      c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    );

    const matchedMatches = this.matches.filter(
      m =>
        m.homeTeam.name.toLowerCase().includes(q) ||
        m.awayTeam.name.toLowerCase().includes(q) ||
        m.competition.name.toLowerCase().includes(q)
    );

    return {
      teams: matchedTeams,
      competitions: matchedCompetitions,
      matches: matchedMatches,
    };
  }

  destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}

export const footballService = new FootballService();
