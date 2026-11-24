/**
 * BALLIVE Win Probability Service
 * 
 * Fetches and computes authentic, mathematically grounded match win probabilities
 * directly from authoritative sports data providers (ESPN Predictor, DraftKings lines).
 * 
 * Converts provider moneyline odds into vig-free implied win probabilities:
 * - Positive American odds (+150): P = 100 / (150 + 100) = 40.0%
 * - Negative American odds (-130): P = 130 / (130 + 100) = 56.5%
 * - Vig removal normalization: P_team / (P_home + P_draw + P_away)
 * 
 * When genuine probability or market odds are unavailable, reports unavailable state
 * without fabricating predictions or generating pseudo-random percentages.
 */

import { API_CONFIG } from '../config/api';
import { sportsApiService } from './sportsApiService';

export interface WinProbabilityResult {
  isAvailable: boolean;
  homePercent?: number; // e.g. 42.1
  drawPercent?: number; // e.g. 28.4
  awayPercent?: number; // e.g. 29.5
  provider?: string;    // e.g. "DraftKings" | "ESPN Match Predictor"
  sport?: string;
  isTwoWay?: boolean;
}

// In-memory cache for probabilities with 5-minute TTL
const probabilityCache = new Map<string, { result: WinProbabilityResult; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Converts American odds string or number into implied probability (0 to 1).
 */
function parseAmericanOddsToProbability(oddsVal: string | number | undefined | null): number | null {
  if (oddsVal === undefined || oddsVal === null) return null;
  const num = typeof oddsVal === 'number' ? oddsVal : parseFloat(String(oddsVal).replace('+', ''));
  if (isNaN(num) || num === 0) return null;

  if (num > 0) {
    return 100 / (num + 100);
  } else {
    const abs = Math.abs(num);
    return abs / (abs + 100);
  }
}

export class WinProbabilityService {
  /**
   * Resolves win probability for a fixture using provider event ID or league context.
   */
  public async getWinProbability(params: {
    matchId?: string;
    sport?: string;
    competition?: string;
    homeTeam?: string;
    awayTeam?: string;
  }): Promise<WinProbabilityResult> {
    const { matchId, sport = 'soccer', competition = '', homeTeam = '', awayTeam = '' } = params;
    const cacheKey = `${matchId || ''}_${sport}_${homeTeam}_${awayTeam}`;

    const cached = probabilityCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.result;
    }

    const sportLower = sport.toLowerCase();
    const isTwoWay =
      sportLower.includes('basketball') ||
      sportLower.includes('nba') ||
      sportLower.includes('hockey') ||
      sportLower.includes('nhl') ||
      sportLower.includes('tennis') ||
      sportLower.includes('american_football') ||
      sportLower.includes('nfl');

    // Extract ESPN event ID if matchId starts with espn-
    let espnEventId: string | null = null;
    let espnLeague: string = 'eng.1';
    let espnSport: string = 'soccer';

    if (matchId && matchId.startsWith('espn-')) {
      const parts = matchId.split('-');
      if (parts.length >= 3) {
        espnLeague = parts[1];
        espnEventId = parts.slice(2).join('-');
      }
      if (isTwoWay) {
        if (sportLower.includes('basketball')) espnSport = 'basketball';
        else if (sportLower.includes('hockey')) espnSport = 'hockey';
        else if (sportLower.includes('football') || sportLower.includes('nfl')) espnSport = 'football';
      }
    } else if (homeTeam && awayTeam) {
      try {
        const preferred = isTwoWay
          ? (sportLower.includes('basketball') ? 'basketball' : (sportLower.includes('hockey') ? 'hockey' : 'soccer'))
          : 'soccer';
        const matched = await sportsApiService.findEspnEvent(homeTeam, awayTeam, preferred);
        if (matched && matched.id) {
          espnEventId = matched.id;
          if (matched.league && matched.league !== 'all') {
            espnLeague = matched.league;
          }
          if (matched.sport) {
            espnSport = matched.sport === 'football' ? 'soccer' : matched.sport;
          }
        }
      } catch {
        // Fallback without failing
      }
    }

    // Attempt 1: Fetch ESPN game summary with predictor or pickcenter
    if (espnEventId) {
      try {
        const url = `${API_CONFIG.ESPN_BASE}/${espnSport}/${espnLeague}/summary?event=${espnEventId}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();

          // 1. Check ESPN direct Predictor
          const predictor = data.predictor;
          if (predictor && predictor.homeTeam && predictor.awayTeam) {
            const hProb = parseFloat(predictor.homeTeam.gameProjection || predictor.homeTeam.winProbability || '0');
            const aProb = parseFloat(predictor.awayTeam.gameProjection || predictor.awayTeam.winProbability || '0');
            const dProb = parseFloat(predictor.drawPercentage || '0');

            if (hProb > 0 && aProb > 0) {
              const total = hProb + aProb + (isTwoWay ? 0 : dProb);
              const homePercent = Number(((hProb / total) * 100).toFixed(1));
              const awayPercent = Number(((aProb / total) * 100).toFixed(1));
              const drawPercent = isTwoWay ? undefined : Number(((dProb / total) * 100).toFixed(1));

              const result: WinProbabilityResult = {
                isAvailable: true,
                homePercent,
                drawPercent,
                awayPercent,
                provider: 'ESPN Predictor',
                sport,
                isTwoWay,
              };
              probabilityCache.set(cacheKey, { result, timestamp: Date.now() });
              return result;
            }
          }

          // 2. Check PickCenter Odds (e.g. DraftKings / Caesars)
          const pickcenter = data.pickcenter;
          if (Array.isArray(pickcenter) && pickcenter.length > 0) {
            for (const item of pickcenter) {
              const moneyline = item.moneyline;
              if (moneyline) {
                const homeOdds = moneyline.home?.close?.odds ?? moneyline.home?.open?.odds;
                const awayOdds = moneyline.away?.close?.odds ?? moneyline.away?.open?.odds;
                const drawOdds = moneyline.draw?.close?.odds ?? moneyline.draw?.open?.odds;

                const pHome = parseAmericanOddsToProbability(homeOdds);
                const pAway = parseAmericanOddsToProbability(awayOdds);
                const pDraw = isTwoWay ? 0 : parseAmericanOddsToProbability(drawOdds);

                if (pHome && pAway && (isTwoWay || pDraw)) {
                  const total = pHome + pAway + (pDraw || 0);
                  const homePercent = Number(((pHome / total) * 100).toFixed(1));
                  const awayPercent = Number(((pAway / total) * 100).toFixed(1));
                  const drawPercent = isTwoWay ? undefined : Number((((pDraw || 0) / total) * 100).toFixed(1));

                  const result: WinProbabilityResult = {
                    isAvailable: true,
                    homePercent,
                    drawPercent,
                    awayPercent,
                    provider: item.provider?.name || 'DraftKings',
                    sport,
                    isTwoWay,
                  };
                  probabilityCache.set(cacheKey, { result, timestamp: Date.now() });
                  return result;
                }
              }
            }
          }
        }
      } catch {
        // Fallback gracefully without throwing
      }
    }

    // Default: Authentically report that win probability is unavailable
    const unavailableResult: WinProbabilityResult = {
      isAvailable: false,
      sport,
      isTwoWay,
    };
    probabilityCache.set(cacheKey, { result: unavailableResult, timestamp: Date.now() });
    return unavailableResult;
  }
}

export const winProbabilityService = new WinProbabilityService();
export default winProbabilityService;
