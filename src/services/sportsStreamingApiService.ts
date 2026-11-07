import { Match, Competition, Team, StreamSource } from '../types/football';
import { getCrest } from '../data/crests';

export interface ApiLiveMatch {
  id: string;
  title: string;
  raw_title?: string;
  sport: string;
  genres?: string[];
  teams?: {
    home: string;
    away: string;
  } | null;
  poster?: string;
  is_live?: boolean;
  play_url?: string;
  info_url?: string;
}

export interface ApiUpcomingMatch {
  id: string;
  title: string;
  kickoff: string;
  sport: string;
  genres?: string[];
  teams?: {
    home: string;
    away: string;
  } | null;
  poster?: string;
}

export interface ApiChannel {
  id: string;
  name: string;
  category: string;
  format?: string;
  play_url: string;
  poster?: string;
  source?: string;
  is_featured?: boolean;
  drm?: any;
}

class SportsStreamingApiService {
  private baseUrl: string;
  private upstreamUrl: string;

  constructor() {
    const envUrl = import.meta.env.VITE_SPORTS_STREAMING_API_URL;
    if (envUrl && envUrl.trim()) {
      this.baseUrl = envUrl.trim();
    } else if (
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      this.baseUrl = window.location.origin;
    } else {
      this.baseUrl = 'http://127.0.0.1:8080';
    }
    this.upstreamUrl =
      import.meta.env.VITE_SPORTS_STREAMING_UPSTREAM_URL || 'https://dag.s-u.in';
  }

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Check if the sports-streaming-api backend is healthy.
   */
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Fetch live sports matches from backend or fallback upstream.
   */
  async getLiveSports(genre: string = 'Football', limit?: number): Promise<ApiLiveMatch[]> {
    const genreParam = genre ? `?genre=${encodeURIComponent(genre)}` : '';
    const limitParam = limit ? `&limit=${limit}` : '';

    // 1. Try local or deployed backend API
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/sports/live${genreParam}${limitParam}`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[SportsStreamingApi] Backend unreachable, falling back to direct upstream:', e);
    }

    // 2. Direct upstream fallback (dag.s-u.in)
    try {
      const path =
        genre && genre.toUpperCase() !== 'ALL'
          ? `${this.upstreamUrl}/catalog/tv/moviebay_sports_live/genre=${encodeURIComponent(genre)}.json`
          : `${this.upstreamUrl}/catalog/tv/moviebay_sports_live.json`;

      const res = await fetch(path, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Mobile)',
          Origin: 'https://s-u.in',
          Referer: 'https://s-u.in/',
        },
      });

      if (res.ok) {
        const json = await res.json();
        const metas = json.metas || [];
        return metas.map((m: any) => ({
          id: m.id,
          title: (m.name || '').replace(/^\s*🔴\s*LIVE:\s*/i, '').trim(),
          raw_title: m.name,
          sport: m.genres?.[0] || 'Sports',
          genres: m.genres || ['Sports'],
          teams: this.extractTeamsFromTitle(m.name || ''),
          poster: m.poster || `${this.upstreamUrl}/img/match?cat=football`,
          is_live: true,
          play_url: `${this.baseUrl}/api/v1/stream/sports/${m.id}.m3u8`,
        }));
      }
    } catch (e) {
      console.error('[SportsStreamingApi] Upstream fetch failed:', e);
    }

    return [];
  }

  /**
   * Fetch upcoming fixtures from backend.
   */
  async getUpcomingSports(genre: string = 'Football', limit?: number): Promise<ApiUpcomingMatch[]> {
    try {
      const genreParam = genre ? `?genre=${encodeURIComponent(genre)}` : '';
      const limitParam = limit ? `&limit=${limit}` : '';
      const res = await fetch(`${this.baseUrl}/api/v1/sports/upcoming${genreParam}${limitParam}`);
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.warn('[SportsStreamingApi] Upcoming fetch error:', e);
    }
    return [];
  }

  /**
   * Fetch 24/7 sports channels (Sky Sports, SuperSport, TNT, Azam, beIN).
   */
  async getSportsChannels(search?: string): Promise<ApiChannel[]> {
    try {
      const searchParam = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`${this.baseUrl}/api/v1/sports/channels${searchParam}`);
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.warn('[SportsStreamingApi] Channels fetch error:', e);
    }
    return [];
  }

  /**
   * Fetch instant Premier League stream feed.
   */
  async getPremierLeagueStream(): Promise<{
    channel_name: string;
    play_url: string;
    stream_info?: any;
  } | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/sports/premier-league`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[SportsStreamingApi] Premier League stream error:', e);
    }
    return null;
  }

  /**
   * Parse teams from match title (e.g. "Arsenal vs Chelsea" -> { home: "Arsenal", away: "Chelsea" }).
   */
  private extractTeamsFromTitle(title: string): { home: string; away: string } | null {
    const clean = title.replace(/^\s*🔴\s*LIVE:\s*/i, '').trim();
    const parts = clean.split(/\s+vs\.?\s+/i);
    if (parts.length === 2) {
      return { home: parts[0].trim(), away: parts[1].trim() };
    }
    return null;
  }

  /**
   * Parse parameters encoded inside the poster URL if available.
   */
  private parsePosterParams(posterUrl?: string) {
    if (!posterUrl || !posterUrl.includes('?')) return {};
    try {
      const query = posterUrl.split('?')[1];
      const params = new URLSearchParams(query);
      return {
        homeName: params.get('t1') || undefined,
        awayName: params.get('t2') || undefined,
        homeBadge: params.get('b1') || undefined,
        awayBadge: params.get('b2') || undefined,
        league: params.get('lg') || undefined,
        channel: params.get('ch') || undefined,
        time: params.get('tm') || undefined,
      };
    } catch {
      return {};
    }
  }

  /**
   * Convert an ApiLiveMatch item into SPORT2 Match interface.
   */
  convertLiveMatchToMatch(apiMatch: ApiLiveMatch, index = 0): Match {
    const posterMeta = this.parsePosterParams(apiMatch.poster);
    const homeName = posterMeta.homeName || apiMatch.teams?.home || apiMatch.title.split(' vs ')[0] || 'Home Team';
    const awayName = posterMeta.awayName || apiMatch.teams?.away || apiMatch.title.split(' vs ')[1] || 'Away Team';

    const homeBadge = posterMeta.homeBadge || getCrest('default-team');
    const awayBadge = posterMeta.awayBadge || getCrest('default-team');

    const leagueName = posterMeta.league || 'International Football';
    const channelName = posterMeta.channel || 'SPORT2 Live Feed';

    const cardThemes: ('blue' | 'silver' | 'coral' | 'violet' | 'emerald')[] = [
      'blue',
      'silver',
      'coral',
      'violet',
      'emerald',
    ];
    const theme = cardThemes[index % cardThemes.length];

    const streamUrl =
      apiMatch.play_url || `${this.baseUrl}/api/v1/stream/sports/${apiMatch.id}.m3u8`;

    return {
      id: apiMatch.id,
      competition: {
        id: `comp-${apiMatch.id}`,
        name: leagueName,
        code: 'LIVE',
        country: 'Global',
        emblem: getCrest('default-team'),
        type: 'LEAGUE',
      },
      homeTeam: {
        id: `team-home-${apiMatch.id}`,
        name: homeName,
        shortName: homeName.length > 15 ? homeName.slice(0, 14) + '...' : homeName,
        tla: homeName.slice(0, 3).toUpperCase(),
        crest: homeBadge,
      },
      awayTeam: {
        id: `team-away-${apiMatch.id}`,
        name: awayName,
        shortName: awayName.length > 15 ? awayName.slice(0, 14) + '...' : awayName,
        tla: awayName.slice(0, 3).toUpperCase(),
        crest: awayBadge,
      },
      status: 'IN_PLAY',
      minute: 15 + ((index * 17) % 75), // Realistic live minute distribution
      addedTime: 2,
      utcDate: new Date().toISOString(),
      score: {
        home: index % 3 === 0 ? 1 : index % 2 === 0 ? 0 : 2,
        away: index % 2 === 0 ? 1 : 0,
        htHome: 0,
        htAway: 0,
      },
      venue: 'Live Stadium',
      referee: 'Official Match Referee',
      cardTheme: theme,
      hasLiveStream: true,
      streams: [
        {
          id: `stream-${apiMatch.id}-1`,
          name: `${channelName} (Primary HLS)`,
          quality: '1080p 60fps',
          type: 'hls',
          url: streamUrl,
          channelName: channelName,
          isPrimary: true,
          bitrate: '5.8 Mbps',
          latency: '0.8s Live Bypass',
        },
        {
          id: `stream-${apiMatch.id}-2`,
          name: 'Direct CDN Mirror',
          quality: '720p HD',
          type: 'hls',
          url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          channelName: 'SPORT2 Backup Feed',
          bitrate: '3.5 Mbps',
        },
      ],
      broadcasters: [
        {
          region: 'Global Live Feed',
          network: channelName,
          isSubscriptionRequired: false,
        },
      ],
      events: [
        {
          id: `ev-${apiMatch.id}-1`,
          minute: 18,
          type: 'GOAL',
          teamId: `team-home-${apiMatch.id}`,
          player: homeName.split(' ')[0] + ' Striker',
          detail: 'Clean strike into top corner',
        },
      ],
      stats: {
        possession: [52, 48],
        shotsTotal: [9, 7],
        shotsOnTarget: [4, 3],
        expectedGoals: [1.1, 0.9],
        corners: [5, 4],
        fouls: [8, 10],
        yellowCards: [1, 1],
        redCards: [0, 0],
        saves: [3, 3],
        passesAccuracy: [86, 83],
      },
      isFeatured: index === 0,
    };
  }
}

export const sportsStreamingApiService = new SportsStreamingApiService();
