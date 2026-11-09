import { API_CONFIG, getActiveBackendUrl } from '../config/api';
import { getPlayerPhoto } from '../utils/playerResolver';

export interface TacticalPlayer {
  id: string;
  name: string;
  number: number;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  rating: number;
  isCaptain?: boolean;
  photo?: string;
  x?: string;
  y?: string;
}

export interface TacticalLineup {
  formation: string;
  coach: string;
  startingXI: TacticalPlayer[];
  substitutes: TacticalPlayer[];
}

export interface MatchIntelResponse {
  success: boolean;
  source?: string;
  home: string;
  away: string;
  lineups: {
    home: TacticalLineup;
    away: TacticalLineup;
  };
  stats: {
    possession: [number, number];
    shotsTotal: [number, number];
    shotsOnTarget: [number, number];
    expectedGoals: [number, number];
    corners: [number, number];
    fouls: [number, number];
    yellowCards: [number, number];
    redCards: [number, number];
    saves: [number, number];
    passesAccuracy: [number, number];
  };
  events: Array<{
    id: string;
    minute: number;
    type: string;
    teamId: string;
    player: string;
    assist?: string;
    detail?: string;
  }>;
  headToHead: {
    totalPlayed: number;
    homeWins: number;
    awayWins: number;
    draws: number;
    lastMatches: Array<{
      date: string;
      homeScore: number;
      awayScore: number;
      winner: 'HOME' | 'AWAY' | 'DRAW';
    }>;
  };
}

/**
 * Assigns pitch percentage coordinates (x, y) for an 11-player lineup
 * based on their tactical formation (e.g. 4-2-3-1, 3-4-2-1, 5-3-2, 4-3-3).
 */
export function assignPitchCoordinates(
  players: TacticalPlayer[],
  formation: string = '4-3-3'
): TacticalPlayer[] {
  const parts = formation
    .split(/[-–—/]/)
    .map(p => parseInt(p.trim(), 10))
    .filter(n => !isNaN(n) && n > 0);

  const rows = parts.reduce((a, b) => a + b, 0) === 10 ? parts : [4, 3, 3];

  const result: TacticalPlayer[] = [];
  const gk = players.find(p => p.position === 'GK') || players[0];
  if (gk) {
    result.push({
      ...gk,
      x: '50%',
      y: '88%',
    });
  }

  const outfielders = players.filter(p => p.id !== gk?.id);
  let playerIdx = 0;
  const numRows = rows.length;
  const startY = 72; // Defense row
  const endY = 16; // Attack row
  const yStep = numRows > 1 ? (startY - endY) / (numRows - 1) : 0;

  rows.forEach((count, rowIndex) => {
    const yVal = Math.round(startY - rowIndex * yStep);
    const rowPlayers = outfielders.slice(playerIdx, playerIdx + count);
    playerIdx += count;

    rowPlayers.forEach((p, colIndex) => {
      let xVal = 50;
      if (count === 1) xVal = 50;
      else if (count === 2) xVal = colIndex === 0 ? 35 : 65;
      else if (count === 3) xVal = colIndex === 0 ? 22 : colIndex === 1 ? 50 : 78;
      else if (count === 4) xVal = colIndex === 0 ? 16 : colIndex === 1 ? 38 : colIndex === 2 ? 62 : 84;
      else if (count === 5) xVal = colIndex === 0 ? 12 : colIndex === 1 ? 31 : colIndex === 2 ? 50 : colIndex === 3 ? 69 : 88;
      else {
        xVal = Math.round(14 + (colIndex / Math.max(1, count - 1)) * 72);
      }

      result.push({
        ...p,
        x: `${xVal}%`,
        y: `${yVal}%`,
      });
    });
  });

  return result;
}

class FootballApiService {
  private cache = new Map<string, { data: MatchIntelResponse; timestamp: number }>();
  private readonly CACHE_TTL = 60000; // 60 seconds

  /**
   * Fetches authentic match intelligence (squads, formations, stats, timeline, H2H)
   * for any given home and away teams.
   */
  async getMatchIntel(
    homeTeam: string,
    awayTeam: string,
    scoreHome = 0,
    scoreAway = 0,
    minute = 45
  ): Promise<MatchIntelResponse | null> {
    const cacheKey = `${homeTeam.toLowerCase()}_${awayTeam.toLowerCase()}_${scoreHome}_${scoreAway}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const baseUrl = await getActiveBackendUrl();
      const url = `${baseUrl}/api/v1/football/intel?home=${encodeURIComponent(
        homeTeam
      )}&away=${encodeURIComponent(awayTeam)}&scoreHome=${scoreHome}&scoreAway=${scoreAway}&minute=${minute}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT_MS);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data: MatchIntelResponse = await res.json();
        // Hydrate player photos if missing
        if (data.lineups?.home?.startingXI) {
          data.lineups.home.startingXI = data.lineups.home.startingXI.map(p => ({
            ...p,
            photo: p.photo || getPlayerPhoto(p.name),
          }));
        }
        if (data.lineups?.away?.startingXI) {
          data.lineups.away.startingXI = data.lineups.away.startingXI.map(p => ({
            ...p,
            photo: p.photo || getPlayerPhoto(p.name),
          }));
        }

        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      }
    } catch (err) {
      console.warn('[FootballApiService] Error fetching match intel:', err);
    }

    return null;
  }
}

export const footballApiService = new FootballApiService();
