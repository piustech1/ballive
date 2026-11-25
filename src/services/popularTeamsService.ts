import { API_CONFIG } from '../config/api';
import { POPULAR_TEAMS, PopularTeam } from '../constants/discoverData';
import { SportType } from '../constants/mockData';
import { streamingApiService } from './streamingApiService';
import { normalizeTeamId } from './profileStorage';
import { getTeamCrest, DEFAULT_CREST } from '../utils/teamCrestResolver';

interface StandingSource {
  sport: SportType;
  espnSport: string;
  espnLeague: string;
  competitionId: string;
  competitionName: string;
  country: string;
  take: number;
}

const STANDING_SOURCES: StandingSource[] = [
  {
    sport: 'soccer',
    espnSport: 'soccer',
    espnLeague: 'eng.1',
    competitionId: 'pl',
    competitionName: 'Premier League',
    country: 'England',
    take: 6,
  },
  {
    sport: 'soccer',
    espnSport: 'soccer',
    espnLeague: 'esp.1',
    competitionId: 'laliga',
    competitionName: 'LaLiga EA Sports',
    country: 'Spain',
    take: 4,
  },
  {
    sport: 'basketball',
    espnSport: 'basketball',
    espnLeague: 'nba',
    competitionId: 'nba',
    competitionName: 'NBA Basketball',
    country: 'USA',
    take: 5,
  },
  {
    sport: 'soccer',
    espnSport: 'soccer',
    espnLeague: 'ita.1',
    competitionId: 'seriea',
    competitionName: 'Serie A Enilive',
    country: 'Italy',
    take: 4,
  },
  {
    sport: 'soccer',
    espnSport: 'soccer',
    espnLeague: 'ger.1',
    competitionId: 'bundesliga',
    competitionName: 'Bundesliga',
    country: 'Germany',
    take: 3,
  },
  {
    sport: 'soccer',
    espnSport: 'soccer',
    espnLeague: 'fra.1',
    competitionId: 'ligue1',
    competitionName: 'Ligue 1 McDonald’s',
    country: 'France',
    take: 3,
  },
  {
    sport: 'hockey',
    espnSport: 'hockey',
    espnLeague: 'nhl',
    competitionId: 'nhl',
    competitionName: 'NHL Hockey',
    country: 'North America',
    take: 4,
  },
  {
    sport: 'soccer',
    espnSport: 'soccer',
    espnLeague: 'mex.1',
    competitionId: 'liga_mx',
    competitionName: 'Liga MX',
    country: 'Mexico',
    take: 3,
  },
  {
    sport: 'soccer',
    espnSport: 'soccer',
    espnLeague: 'arg.1',
    competitionId: 'argentina_primera',
    competitionName: 'Liga Profesional Argentina',
    country: 'Argentina',
    take: 3,
  },
];

const CACHE_TTL_MS = 5 * 60 * 1000;

function extractStandingsEntries(data: any): any[] {
  const entries: any[] = [];
  if (Array.isArray(data?.children) && data.children.length > 0) {
    data.children.forEach((child: any) => {
      if (Array.isArray(child?.standings?.entries)) {
        entries.push(...child.standings.entries);
      }
    });
  } else if (Array.isArray(data?.standings?.entries)) {
    entries.push(...data.standings.entries);
  }
  return entries;
}

function makeShortName(name: string, abbr?: string): string {
  if (abbr && abbr.trim().length >= 2 && abbr.trim().length <= 5) {
    return abbr.trim().toUpperCase();
  }
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return words
      .slice(0, 3)
      .map(w => w[0])
      .join('')
      .toUpperCase();
  }
  return name.slice(0, 3).toUpperCase();
}

class PopularTeamsService {
  private cachedTeams: PopularTeam[] = [];
  private cacheTimestamp = 0;
  private inFlightPromise: Promise<PopularTeam[]> | null = null;

  public getCachedPopularTeams(): PopularTeam[] {
    return this.cachedTeams.length > 0 ? this.cachedTeams : POPULAR_TEAMS;
  }

  public async getPopularTeams(forceRefresh = false): Promise<PopularTeam[]> {
    const now = Date.now();
    if (!forceRefresh && this.cachedTeams.length > 0 && now - this.cacheTimestamp < CACHE_TTL_MS) {
      return this.cachedTeams;
    }
    if (this.inFlightPromise) {
      return this.inFlightPromise;
    }

    this.inFlightPromise = (async () => {
      try {
        const baselineByKey = new Map<string, PopularTeam>();
        POPULAR_TEAMS.forEach(t => {
          baselineByKey.set(t.name.toLowerCase().trim(), t);
          baselineByKey.set(normalizeTeamId(t.id), t);
        });

        const buckets: PopularTeam[][] = [];

        // 1. Fetch live ESPN league standings top clubs/franchises
        const standingResults = await Promise.allSettled(
          STANDING_SOURCES.map(async src => {
            const url = `${API_CONFIG.ESPN_STANDINGS_BASE}/${src.espnSport}/${src.espnLeague}/standings`;
            const res = await fetch(url);
            if (!res.ok) return [] as PopularTeam[];
            const json = await res.json();
            const entries = extractStandingsEntries(json);
            const bucket: PopularTeam[] = [];

            for (let i = 0; i < Math.min(src.take, entries.length); i++) {
              const team = entries[i]?.team;
              const name = team?.displayName || team?.name;
              if (!name) continue;

              const normId = normalizeTeamId(`team-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
              const seedMatch = baselineByKey.get(name.toLowerCase().trim()) || baselineByKey.get(normId);
              const apiLogo =
                team?.logos?.[0]?.href ||
                (src.espnSport !== 'soccer' && team?.abbreviation
                  ? `https://a.espncdn.com/i/teamlogos/${src.espnLeague}/500/scoreboard/${team.abbreviation.toLowerCase()}.png`
                  : getTeamCrest(name));

              bucket.push({
                id: seedMatch?.id || normId,
                name,
                shortName: seedMatch?.shortName || makeShortName(name, team?.abbreviation),
                country: seedMatch?.country || src.country,
                crestUrl: apiLogo && apiLogo !== DEFAULT_CREST ? apiLogo : seedMatch?.crestUrl || getTeamCrest(name),
                stadium: seedMatch?.stadium,
                competitionId: src.competitionId,
                competitionName: src.competitionName,
                espnId: team?.id ? String(team.id) : seedMatch?.espnId,
                espnSport: src.espnSport,
                espnLeague: src.espnLeague,
                sport: src.sport,
              });
            }
            return bucket;
          })
        );

        standingResults.forEach(r => {
          if (r.status === 'fulfilled' && r.value.length > 0) {
            buckets.push(r.value);
          }
        });

        // Interleave across sports & top leagues so horizontal Discover list feels balanced
        const combined: PopularTeam[] = [];
        const seen = new Set<string>();
        const addIfUnique = (t: PopularTeam) => {
          const nameKey = t.name.toLowerCase().trim();
          const idKey = normalizeTeamId(t.id);
          if (!nameKey || seen.has(nameKey) || seen.has(idKey)) return;
          seen.add(nameKey);
          seen.add(idKey);
          combined.push(t);
        };

        const maxLen = buckets.reduce((m, b) => Math.max(m, b.length), 0);
        for (let idx = 0; idx < maxLen; idx++) {
          buckets.forEach(bucket => {
            if (bucket[idx]) {
              addIfUnique(bucket[idx]);
            }
          });
        }

        // 2. Supplement with active teams from live / upcoming fixtures tonight
        const activeMatches = streamingApiService.getCachedLiveMatches();
        activeMatches
          .filter(m => m.sport !== 'motorsport' && m.sport !== 'tennis')
          .slice(0, 14)
          .forEach(m => {
            [
              { name: m.homeTeam, badge: m.homeBadge },
              { name: m.awayTeam, badge: m.awayBadge },
            ].forEach(side => {
              if (!side.name || ['tbd', 'tba', 'opponent'].includes(side.name.toLowerCase())) return;
              const slug = `team-${side.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
              const normId = normalizeTeamId(slug);
              const seedMatch = baselineByKey.get(side.name.toLowerCase().trim()) || baselineByKey.get(normId);
              const crest =
                (side.badge && !side.badge.includes('default-team-logo') ? side.badge : undefined) ||
                seedMatch?.crestUrl ||
                getTeamCrest(side.name);

              addIfUnique({
                id: seedMatch?.id || normId,
                name: side.name,
                shortName: seedMatch?.shortName || makeShortName(side.name),
                country: seedMatch?.country || m.competition || 'International',
                crestUrl: crest,
                stadium: seedMatch?.stadium,
                competitionId: seedMatch?.competitionId,
                competitionName: m.competition || seedMatch?.competitionName,
                espnId: seedMatch?.espnId,
                espnSport: seedMatch?.espnSport,
                espnLeague: seedMatch?.espnLeague,
                sport: m.sport || 'soccer',
              });
            });
          });

        // 3. Ensure core baseline teams are always present even on partial network responses
        POPULAR_TEAMS.forEach(addIfUnique);

        this.cachedTeams = combined;
        this.cacheTimestamp = Date.now();
        return combined;
      } catch {
        return POPULAR_TEAMS;
      } finally {
        this.inFlightPromise = null;
      }
    })();

    return this.inFlightPromise;
  }
}

export const popularTeamsService = new PopularTeamsService();
export default popularTeamsService;
