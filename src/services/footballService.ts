import { Match, MatchStatus, Competition, StandingRow } from '../types/football';
import { INITIAL_MATCHES, COMPETITIONS, STANDINGS_DATA, TEAMS } from '../data/mockMatches';
import { sportsStreamingApiService, ApiChannel } from './sportsStreamingApiService';

class FootballService {
  private matches: Match[] = [...INITIAL_MATCHES];
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

  // Fetch live matches directly from sports-streaming-api
  async fetchLiveFromApi(): Promise<void> {
    try {
      const apiMatches = await sportsStreamingApiService.getLiveSports('Football');
      if (apiMatches && apiMatches.length > 0) {
        const converted = apiMatches.map((m, idx) =>
          sportsStreamingApiService.convertLiveMatchToMatch(m, idx)
        );

        // Keep reference matches and prepend/merge real live API matches
        const existingIds = new Set(this.matches.map(m => m.id));
        const newMatches = converted.filter(m => !existingIds.has(m.id));

        if (newMatches.length > 0) {
          this.matches = [...newMatches, ...this.matches];
          this.hasFetchedLiveApi = true;
          this.notifyListeners();
        }
      }
    } catch (e) {
      console.warn('[FootballService] Could not fetch live matches from sports API:', e);
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
    return [...this.matches];
  }

  async getFixtures(options?: { date?: string; competitionId?: string; status?: string }): Promise<Match[]> {
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

  async getMatchById(id: string): Promise<Match | undefined> {
    const existing = this.matches.find(m => m.id === id);
    if (existing) return existing;

    // Try re-fetching live sports in case it's an API match ID
    await this.fetchLiveFromApi();
    const found = this.matches.find(m => m.id === id);
    if (found) return found;

    // Check if it's a 24/7 Live Sports Channel ID
    try {
      const channels = await sportsStreamingApiService.getSportsChannels();
      const ch = channels.find(c => c.id === id);
      if (ch) {
        return {
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
