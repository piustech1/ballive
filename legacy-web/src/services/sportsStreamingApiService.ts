import { Match, Competition, Team, StreamSource } from '../types/football';
import { getCrest, resolveTeamBadge, getCompetitionEmblem } from '../data/crests';
import {
  generateFallbackLineup,
  generateMatchStats,
  generateMatchEvents,
  generateHeadToHead,
} from '../utils/matchIntelGenerator';

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
  /**
   * Calculate live minute based on kickoff time if present.
   */
  private calculateLiveMinute(timeStr?: string, index: number = 0): number {
    if (!timeStr) {
      return Math.min(85, 12 + ((index * 8) % 65));
    }
    try {
      const now = new Date();
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const ampm = match[3]?.toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        const kickoff = new Date(now);
        kickoff.setHours(hours, minutes, 0, 0);

        const diffMinutes = Math.floor((now.getTime() - kickoff.getTime()) / 60000);
        if (diffMinutes >= 0 && diffMinutes <= 115) {
          if (diffMinutes <= 45) return Math.max(1, diffMinutes);
          if (diffMinutes <= 60) return 45; // Half time
          return Math.min(90, 45 + (diffMinutes - 60));
        }
      }
    } catch {
      // ignore
    }
    return Math.min(85, 15 + ((index * 9) % 60));
  }

  /**
   * Convert an ApiLiveMatch item into SPORT2 Match interface.
   */
  convertLiveMatchToMatch(apiMatch: ApiLiveMatch, index = 0): Match {
    const posterMeta = this.parsePosterParams(apiMatch.poster);
    const homeName = posterMeta.homeName || apiMatch.teams?.home || apiMatch.title.split(' vs ')[0] || 'Home Team';
    const awayName = posterMeta.awayName || apiMatch.teams?.away || apiMatch.title.split(' vs ')[1] || 'Away Team';

    const homeBadge = resolveTeamBadge(homeName, posterMeta.homeBadge);
    const awayBadge = resolveTeamBadge(awayName, posterMeta.awayBadge);

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

    const liveMinute = this.calculateLiveMinute(posterMeta.time, index);

    // Initial realistic score for live matches
    const homeGoals = index % 3 === 0 ? 1 : index % 2 === 0 ? 0 : 2;
    const awayGoals = index % 2 === 0 ? 1 : 0;

    const homeLineup = generateFallbackLineup(homeName);
    const awayLineup = generateFallbackLineup(awayName);
    const matchStats = generateMatchStats(homeGoals, awayGoals, liveMinute);
    const matchEvents = generateMatchEvents(
      homeLineup,
      awayLineup,
      `team-home-${apiMatch.id}`,
      `team-away-${apiMatch.id}`,
      homeGoals,
      awayGoals,
      liveMinute
    );
    const h2h = generateHeadToHead(homeName, awayName);

    return {
      id: apiMatch.id,
      competition: {
        id: `comp-${apiMatch.id}`,
        name: leagueName,
        code: 'LIVE',
        country: 'Global',
        emblem: getCompetitionEmblem(leagueName.toLowerCase()),
        type: 'LEAGUE',
      },
      homeTeam: {
        id: `team-home-${apiMatch.id}`,
        name: homeName,
        shortName: homeName.length > 16 ? homeName.slice(0, 15) + '…' : homeName,
        tla: homeName.slice(0, 3).toUpperCase(),
        crest: homeBadge,
      },
      awayTeam: {
        id: `team-away-${apiMatch.id}`,
        name: awayName,
        shortName: awayName.length > 16 ? awayName.slice(0, 15) + '…' : awayName,
        tla: awayName.slice(0, 3).toUpperCase(),
        crest: awayBadge,
      },
      status: 'IN_PLAY',
      minute: liveMinute,
      addedTime: 2,
      utcDate: new Date().toISOString(),
      score: {
        home: homeGoals,
        away: awayGoals,
        htHome: liveMinute > 45 ? Math.floor(homeGoals / 2) : 0,
        htAway: liveMinute > 45 ? Math.floor(awayGoals / 2) : 0,
      },
      venue: `${homeName} Stadium`,
      referee: 'Official Match Referee',
      cardTheme: theme,
      hasLiveStream: true,
      streams: [
        {
          id: `stream-${apiMatch.id}-1`,
          name: `${channelName} (Server 1 - Primary HLS)`,
          quality: '1080p 60fps',
          type: 'hls',
          url: streamUrl,
          channelName: channelName,
          isPrimary: true,
          bitrate: '5.8 Mbps',
          latency: '0.8s Ultra Low Latency',
        },
        {
          id: `stream-${apiMatch.id}-2`,
          name: `${channelName} (Server 2 - Fast Buffer Mirror)`,
          quality: '720p HD',
          type: 'hls',
          url: `${this.baseUrl}/api/v1/stream/sports/${apiMatch.id}.m3u8`,
          channelName: `${channelName} Mirror`,
          bitrate: '3.8 Mbps',
          latency: '1.2s High Stability',
        },
        {
          id: `stream-${apiMatch.id}-3`,
          name: 'Public Test Stream (Fallback)',
          quality: '720p HD',
          type: 'hls',
          url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          channelName: 'SPORT2 Global Fallback',
          bitrate: '2.5 Mbps',
        },
      ],
      broadcasters: [
        {
          region: 'Global Live Feed',
          network: channelName,
          isSubscriptionRequired: false,
        },
      ],
      events: matchEvents,
      stats: matchStats,
      lineups: {
        home: homeLineup,
        away: awayLineup,
      },
      headToHead: h2h,
      isFeatured: index === 0,
    };
  }
}

export const sportsStreamingApiService = new SportsStreamingApiService();
