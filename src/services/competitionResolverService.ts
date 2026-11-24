/**
 * BALLIVE Intelligent Competition Recognition & Categorization Service
 * 
 * Provides centralized resolution, disambiguation, and metadata caching
 * for football leagues and multi-sport tournaments across BALLIVE.
 * 
 * Resolves identifiable competitions from multiple provider signals:
 * - Provider league IDs / slugs (e.g., ESPN `jpn.1`, `ksa.1`, `fifa.world.u17`, `chn.1`, `ind.1`, `ken.1`)
 * - URL query parameters (`lg` and `lb` in DAG poster URLs)
 * - Raw descriptions and titles (`🏆 League: ...`, `genres`)
 * - Distinctive club signatures when competition name is missing or generic
 * 
 * Guarantees strict disambiguation (e.g., Saudi Pro League vs Saudi First Division,
 * FIFA U-17 World Cup vs Senior World Cup) and caches metadata in-memory.
 */

import { LEAGUE_EMBLEMS } from '../constants/crests';

export interface CanonicalCompetition {
  id: string;
  name: string;
  shortName: string;
  country: string;
  region: string;
  logoUrl: string;
  accentColor: string;
  sport: 'soccer' | 'basketball' | 'hockey' | 'american_football' | 'racing';
  providerAliases: string[];
  clubSignatures: string[];
}

export interface CompetitionResolutionInput {
  rawId?: string | null;
  rawName?: string | null;
  competition?: string | null;
  posterUrl?: string | null;
  description?: string | null;
  genres?: string[] | null;
  homeTeam?: string | null;
  awayTeam?: string | null;
  sport?: string | null;
  country?: string | null;
}

export interface ResolvedCompetition {
  id: string;
  name: string;
  shortName: string;
  country: string;
  region: string;
  logoUrl: string;
  accentColor: string;
  sport: string;
  isIdentified: boolean;
}

// ── CANONICAL COMPETITION DEFINITIONS ──
export const CANONICAL_COMPETITIONS: Record<string, CanonicalCompetition> = {
  // ── 1. MEIJI YASUDA J1 LEAGUE (JAPAN) ──
  j1_league: {
    id: 'j1_league',
    name: 'Meiji Yasuda J1 League',
    shortName: 'J1 League',
    country: 'Japan',
    region: 'East Asia',
    logoUrl: 'https://media.api-sports.io/football/leagues/98.png',
    accentColor: '#E60012',
    sport: 'soccer',
    providerAliases: [
      'jpn.1',
      'j-league',
      'j.league',
      'j league',
      'j1',
      'j1 league',
      'meiji yasuda',
      'japanese j.league',
      'japan j1',
    ],
    clubSignatures: [
      'vissel kobe',
      'yokohama f. marinos',
      'yokohama f marinos',
      'kawasaki frontale',
      'urawa red diamonds',
      'urawa reds',
      'sanfrecce hiroshima',
      'gamba osaka',
      'cerezo osaka',
      'kashima antlers',
      'nagoya grampus',
      'machida zelvia',
      'tokyo verdy',
      'fc tokyo',
      'kashiwa reysol',
      'avispa fukuoka',
      'kyoto sanga',
      'shonan bellmare',
      'albirex niigata',
      'jubilo iwata',
      'sagan tosu',
      'consadole sapporo',
    ],
  },

  // ── 2. SAUDI FIRST DIVISION LEAGUE (YELO LEAGUE, TIER 2) ──
  saudi_first_division: {
    id: 'saudi_first_division',
    name: 'Saudi First Division League',
    shortName: 'Saudi 1st Div',
    country: 'Saudi Arabia',
    region: 'Middle East',
    logoUrl: 'https://media.api-sports.io/football/leagues/308.png',
    accentColor: '#1A472A',
    sport: 'soccer',
    providerAliases: [
      'ksa.2',
      'saudi first division',
      'saudi division 1',
      'saudi division one',
      'yelo league',
      'yelo',
      'saudi 1st division',
      'saudi first division league',
      'first division league',
    ],
    clubSignatures: [
      'al hazem',
      'al-hazem',
      'al batin',
      'al-batin',
      'ohod',
      'al faisaly',
      'al-faisaly',
      'al jabalain',
      'al adalah',
      'al-adalah',
      'al bukiryah',
      'al ain saudi',
      'al jandal',
      'al safa',
      'al najma',
      'al zulfi',
      'jeddah club',
      'neom sc',
      'al arabi saudi',
    ],
  },

  // ── 3. FIFA U-17 WORLD CUP ──
  fifa_u17: {
    id: 'fifa_u17',
    name: 'FIFA U-17 World Cup',
    shortName: 'FIFA U-17',
    country: 'International',
    region: 'Global',
    logoUrl: 'https://media.api-sports.io/football/leagues/17.png',
    accentColor: '#0055A5',
    sport: 'soccer',
    providerAliases: [
      'fifa.world.u17',
      'fifa.u17',
      'u-17 world cup',
      'u17 world cup',
      'under-17 world cup',
      'under 17 world cup',
      'fifa u-17',
      'fifa u17',
      'fifa under-17 world cup',
    ],
    clubSignatures: [],
  },

  // ── 4. CHINESE SUPER LEAGUE (CSL) ──
  csl: {
    id: 'csl',
    name: 'Chinese Super League',
    shortName: 'CSL',
    country: 'China',
    region: 'East Asia',
    logoUrl: 'https://media.api-sports.io/football/leagues/169.png',
    accentColor: '#D81E06',
    sport: 'soccer',
    providerAliases: [
      'chn.1',
      'csl',
      'chinese super league',
      'china super league',
      'ping an csl',
      'chinese super',
    ],
    clubSignatures: [
      'shanghai port',
      'shandong taishan',
      'shanghai shenhua',
      'beijing guoan',
      'chengdu rongcheng',
      'zhejiang professional',
      'wuhan three towns',
      'tianjin jinmen tiger',
      'changchun yatai',
      'henan fc',
      'qingdao hainiu',
      'shenzhen peng city',
      'meizhou hakka',
      'nantong zhiyun',
      'cangzhou mighty lions',
      'qingdao west coast',
    ],
  },

  // ── 5. EGYPTIAN PREMIER LEAGUE ──
  egyptian_premier: {
    id: 'egyptian_premier',
    name: 'Egyptian Premier League',
    shortName: 'Egyptian Premier',
    country: 'Egypt',
    region: 'North Africa',
    logoUrl: 'https://media.api-sports.io/football/leagues/233.png',
    accentColor: '#C8102E',
    sport: 'soccer',
    providerAliases: [
      'egy.1',
      'egyptian premier league',
      'egypt premier league',
      'egyptian league',
      'nile league',
      'egyptian premier',
    ],
    clubSignatures: [
      'al ahly',
      'al-ahly',
      'zamalek',
      'pyramids fc',
      'pyramids',
      'modern sport',
      'future fc',
      'al masry',
      'ceramica cleopatra',
      'smouha',
      'enppi',
      'el gouna',
      'al ittihad alexandria',
      'national bank of egypt',
      'talaea el gaish',
      'pharco',
      'ismaily',
      'haras el hodoud',
      'petrojet',
      'ghazl el mahalla',
    ],
  },

  // ── 6. SAUDI PRO LEAGUE (ROSHN SAUDI LEAGUE, TIER 1) ──
  saudi_pro: {
    id: 'saudi_pro',
    name: 'Saudi Pro League',
    shortName: 'Saudi Pro League',
    country: 'Saudi Arabia',
    region: 'Middle East',
    logoUrl: 'https://media.api-sports.io/football/leagues/307.png',
    accentColor: '#1E3A8A',
    sport: 'soccer',
    providerAliases: [
      'ksa.1',
      'saudi pro league',
      'saudi pro',
      'roshn saudi league',
      'roshn',
      'spl',
      'saudi professional league',
    ],
    clubSignatures: [
      'al hilal',
      'al-hilal',
      'al nassr',
      'al-nassr',
      'al ittihad',
      'al-ittihad',
      'al ahli saudi',
      'al-ahli saudi',
      'al shabab',
      'al-shabab',
      'al ettifaq',
      'al-ettifaq',
      'al taawoun',
      'al-taawoun',
      'al fateh',
      'al wehda',
      'al raed',
      'al fayha',
      'al khaleej',
      'al okhdood',
      'damac',
      'al riyadh',
      'al orobah',
      'al kholood',
      'al qadsiah',
    ],
  },

  // ── 7. INDIAN SUPER LEAGUE (ISL) ──
  isl: {
    id: 'isl',
    name: 'Indian Super League',
    shortName: 'ISL',
    country: 'India',
    region: 'South Asia',
    logoUrl: 'https://media.api-sports.io/football/leagues/323.png',
    accentColor: '#FF6F00',
    sport: 'soccer',
    providerAliases: [
      'ind.1',
      'isl',
      'indian super league',
      'india super league',
      'hero isl',
    ],
    clubSignatures: [
      'mohun bagan',
      'mohun bagan sg',
      'mumbai city',
      'mumbai city fc',
      'kerala blasters',
      'bengaluru fc',
      'bengaluru',
      'fc goa',
      'east bengal',
      'odisha fc',
      'chennaiyin',
      'hyderabad fc',
      'jamshedpur fc',
      'north east united',
      'northeast united',
      'punjab fc',
      'mohammedan sc',
    ],
  },

  // ── 8. KENYAN PREMIER LEAGUE (FKF PREMIER LEAGUE) ──
  kenyan_premier: {
    id: 'kenyan_premier',
    name: 'Kenyan Premier League',
    shortName: 'FKF Premier League',
    country: 'Kenya',
    region: 'East Africa',
    logoUrl: 'https://media.api-sports.io/football/leagues/279.png',
    accentColor: '#008000',
    sport: 'soccer',
    providerAliases: [
      'ken.1',
      'kenyan premier league',
      'fkf premier league',
      'fkf',
      'kpl',
      'kenya premier league',
      'betika fkf',
    ],
    clubSignatures: [
      'gor mahia',
      'afc leopards',
      'tusker fc',
      'tusker',
      'kenya police',
      'bandari',
      'ulinzi stars',
      'sofapaka',
      'kariobangi sharks',
      'kakamega homeboyz',
      'bidco united',
      'shabana',
      'muranga seal',
      "murang'a seal",
      'fc talanta',
      'nairobi city stars',
      'postaa rangers',
      'posta rangers',
    ],
  },

  // ── MAJOR EUROPEAN & WORLD COMPETITIONS ──
  premier_league: {
    id: 'premier_league',
    name: 'Premier League',
    shortName: 'EPL',
    country: 'England',
    region: 'United Kingdom',
    logoUrl: LEAGUE_EMBLEMS['premier-league'],
    accentColor: '#7952FC',
    sport: 'soccer',
    providerAliases: ['eng.1', 'premier league', 'epl', 'english premier league'],
    clubSignatures: ['arsenal', 'chelsea', 'liverpool', 'manchester city', 'manchester united', 'tottenham', 'aston villa', 'newcastle'],
  },
  champions_league: {
    id: 'champions_league',
    name: 'UEFA Champions League',
    shortName: 'UCL',
    country: 'Europe',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['ucl'],
    accentColor: '#0A1E5C',
    sport: 'soccer',
    providerAliases: ['uefa.champions', 'uefa champions league', 'ucl'],
    clubSignatures: [],
  },
  afc_champions_league: {
    id: 'afc_champions_league',
    name: 'AFC Champions League Elite',
    shortName: 'AFC Champions League',
    country: 'Asia',
    region: 'Asia',
    logoUrl: 'https://a.espncdn.com/i/leaguelogos/soccer/500/296.png',
    accentColor: '#E5A823',
    sport: 'soccer',
    providerAliases: [
      'afc champions league',
      'afc champions league elite',
      'afc champions league two',
      'afc champions',
      'acl elite',
      'asian champions league',
      'afc.champions',
      'afc champions league 2',
      'afc cup',
    ],
    clubSignatures: [
      'al hilal',
      'al nassr',
      'al ahli saudi',
      'al ain',
      'al sadd',
      'al rayyan',
      'persepolis',
      'esteghlal',
      'vissel kobe',
      'kawasaki frontale',
      'yokohama f marinos',
      'pohang steelers',
      'ulsan hd',
      'gwangju fc',
      'shanghai port',
      'shanghai shenhua',
      'shandong taishan',
    ],
  },
  saudi_king_cup: {
    id: 'saudi_king_cup',
    name: 'King Cup of Champions',
    shortName: 'King Cup',
    country: 'Saudi Arabia',
    region: 'Middle East',
    logoUrl: 'https://media.api-sports.io/football/leagues/309.png',
    accentColor: '#005A36',
    sport: 'soccer',
    providerAliases: [
      'king cup',
      'saudi king cup',
      'custodian of the two holy mosques cup',
      'king cup of champions',
      'saudi cup',
      'kings cup',
    ],
    clubSignatures: [],
  },
  arab_club_champions: {
    id: 'arab_club_champions',
    name: 'Arab Club Champions Cup',
    shortName: 'King Salman Cup',
    country: 'Arab World',
    region: 'Middle East',
    logoUrl: 'https://media.api-sports.io/football/leagues/883.png',
    accentColor: '#1F3864',
    sport: 'soccer',
    providerAliases: [
      'arab club champions cup',
      'arab club championship',
      'king salman club cup',
      'arab champions league',
      'uafa club cup',
      'arab club cup',
    ],
    clubSignatures: [],
  },
  europa_league: {
    id: 'europa_league',
    name: 'UEFA Europa League',
    shortName: 'UEL',
    country: 'Europe',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['uel'] || 'https://a.espncdn.com/i/leaguelogos/soccer/500/2310.png',
    accentColor: '#F68E1E',
    sport: 'soccer',
    providerAliases: ['uefa.europa', 'europa league', 'uel', 'uefa europa league'],
    clubSignatures: [],
  },
  conference_league: {
    id: 'conference_league',
    name: 'UEFA Conference League',
    shortName: 'UECL',
    country: 'Europe',
    region: 'Europe',
    logoUrl: 'https://a.espncdn.com/i/leaguelogos/soccer/500/uefa.europa.conf.png',
    accentColor: '#00E880',
    sport: 'soccer',
    providerAliases: ['uefa.europa.conf', 'conference league', 'uecl'],
    clubSignatures: [],
  },
  la_liga: {
    id: 'la_liga',
    name: 'LaLiga EA Sports',
    shortName: 'LaLiga',
    country: 'Spain',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['laliga'],
    accentColor: '#EE1133',
    sport: 'soccer',
    providerAliases: ['esp.1', 'la liga', 'laliga', 'primera division'],
    clubSignatures: ['real madrid', 'barcelona', 'atletico madrid', 'athletic club', 'real sociedad', 'sevilla', 'valencia'],
  },
  serie_a: {
    id: 'serie_a',
    name: 'Serie A',
    shortName: 'Serie A',
    country: 'Italy',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['serie-a'],
    accentColor: '#008FD7',
    sport: 'soccer',
    providerAliases: ['ita.1', 'serie a', 'italian serie a'],
    clubSignatures: ['inter milan', 'ac milan', 'juventus', 'as roma', 'napoli', 'lazio', 'atalanta', 'fiorentina', 'como'],
  },
  bundesliga: {
    id: 'bundesliga',
    name: 'Bundesliga',
    shortName: 'Bundesliga',
    country: 'Germany',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['bundesliga'],
    accentColor: '#D10214',
    sport: 'soccer',
    providerAliases: ['ger.1', 'bundesliga', 'german bundesliga'],
    clubSignatures: ['bayern munich', 'borussia dortmund', 'bayer leverkusen', 'rb leipzig', 'eintracht frankfurt', 'vfb stuttgart'],
  },
  ligue_1: {
    id: 'ligue_1',
    name: 'Ligue 1 McDonald’s',
    shortName: 'Ligue 1',
    country: 'France',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['ligue-1'],
    accentColor: '#091C3E',
    sport: 'soccer',
    providerAliases: ['fra.1', 'ligue 1', 'french ligue 1'],
    clubSignatures: ['paris saint-germain', 'marseille', 'monaco', 'lyon', 'lille', 'lens', 'nice'],
  },
  mls: {
    id: 'mls',
    name: 'Major League Soccer',
    shortName: 'MLS',
    country: 'USA / Canada',
    region: 'North America',
    logoUrl: LEAGUE_EMBLEMS['mls'],
    accentColor: '#002B49',
    sport: 'soccer',
    providerAliases: ['usa.1', 'mls', 'major league soccer'],
    clubSignatures: ['inter miami', 'la galaxy', 'lafc', 'seattle sounders', 'columbus crew'],
  },
  efl_championship: {
    id: 'efl_championship',
    name: 'EFL Championship',
    shortName: 'Championship',
    country: 'England',
    region: 'United Kingdom',
    logoUrl: 'https://media.api-sports.io/football/leagues/40.png',
    accentColor: '#002B49',
    sport: 'soccer',
    providerAliases: ['eng.2', 'championship', 'efl championship'],
    clubSignatures: ['leeds united', 'sheffield united', 'sunderland', 'burnley', 'west brom', 'norwich city', 'middlesbrough'],
  },

  // ── MULTI-SPORT LEAGUES ──
  nba: {
    id: 'nba',
    name: 'NBA Basketball',
    shortName: 'NBA',
    country: 'USA / Canada',
    region: 'North America',
    logoUrl: LEAGUE_EMBLEMS['nba'],
    accentColor: '#1D428A',
    sport: 'basketball',
    providerAliases: ['nba', 'national basketball association'],
    clubSignatures: ['boston celtics', 'los angeles lakers', 'golden state warriors', 'new york knicks'],
  },
  nhl: {
    id: 'nhl',
    name: 'NHL Hockey',
    shortName: 'NHL',
    country: 'USA / Canada',
    region: 'North America',
    logoUrl: LEAGUE_EMBLEMS['nhl'],
    accentColor: '#111111',
    sport: 'hockey',
    providerAliases: ['nhl', 'national hockey league'],
    clubSignatures: ['toronto maple leafs', 'edmonton oilers', 'boston bruins', 'new york rangers'],
  },
  nfl: {
    id: 'nfl',
    name: 'NFL Football',
    shortName: 'NFL',
    country: 'USA',
    region: 'North America',
    logoUrl: LEAGUE_EMBLEMS['nfl'],
    accentColor: '#013369',
    sport: 'american_football',
    providerAliases: ['nfl', 'national football league'],
    clubSignatures: ['kansas city chiefs', 'san francisco 49ers', 'philadelphia eagles', 'dallas cowboys'],
  },
  f1: {
    id: 'f1',
    name: 'Formula 1',
    shortName: 'F1',
    country: 'Global',
    region: 'International',
    logoUrl: LEAGUE_EMBLEMS['f1'],
    accentColor: '#E10600',
    sport: 'racing',
    providerAliases: ['f1', 'formula 1', 'formula-1', 'grand prix'],
    clubSignatures: ['red bull racing', 'ferrari', 'mercedes', 'mclaren', 'aston martin'],
  },
};

/**
 * Extracts a query parameter from a URL string with safety checks.
 */
function extractQueryParam(url: string | null | undefined, paramName: string): string | null {
  if (!url || !url.includes('?')) return null;
  try {
    const queryString = url.split('?')[1];
    const params = new URLSearchParams(queryString);
    const val = params.get(paramName);
    if (!val || val === 'null' || val === 'undefined' || val.trim() === '') return null;
    return val.trim();
  } catch {
    return null;
  }
}

/**
 * Extracts the league name from an item description containing "🏆 League: <name>".
 */
function extractLeagueFromDescription(desc: string | null | undefined): string | null {
  if (!desc) return null;
  const match = desc.match(/(?:🏆\s*League:\s*|League:\s*)([^\n\r]+)/i);
  if (match && match[1] && match[1].trim()) {
    return match[1].trim();
  }
  return null;
}

/**
 * Normalizes text for fuzzy token matching.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export class CompetitionResolverService {
  // In-memory resolution cache for O(1) lookups
  private resolutionCache = new Map<string, ResolvedCompetition>();

  /**
   * Resolves a competition from any combination of available match fields.
   */
  public resolveCompetition(input: CompetitionResolutionInput): ResolvedCompetition {
    const cacheKey = this.buildCacheKey(input);
    const cached = this.resolutionCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const resolved = this.executeResolution(input);
    this.resolutionCache.set(cacheKey, resolved);
    return resolved;
  }

  private buildCacheKey(input: CompetitionResolutionInput): string {
    return `${input.rawId || ''}|${input.rawName || ''}|${input.competition || ''}|${input.homeTeam || ''}|${input.awayTeam || ''}|${input.sport || ''}|${input.description ? input.description.slice(0, 30) : ''}`;
  }

  private executeResolution(input: CompetitionResolutionInput): ResolvedCompetition {
    // 1. Check URL parameters from poster (e.g., `lg=Meiji+Yasuda+J1+League`)
    const posterLg = extractQueryParam(input.posterUrl, 'lg');
    const posterLb = extractQueryParam(input.posterUrl, 'lb');

    // 2. Check item description for "🏆 League: <name>"
    const descLeague = extractLeagueFromDescription(input.description);

    // Collect all candidate strings for competition identification
    const candidates = [
      posterLg,
      descLeague,
      input.competition,
      input.rawName,
      input.rawId,
      ...(input.genres || []),
    ].filter(Boolean) as string[];

    // ── STAGE 1: DIRECT CANONICAL / ALIAS MATCHING ──
    for (const candidate of candidates) {
      const normCand = normalizeText(candidate);
      if (!normCand || normCand === 'football' || normCand === 'soccer' || normCand === 'sports' || normCand === 'global football') {
        continue;
      }

      // Check all canonical competitions
      for (const comp of Object.values(CANONICAL_COMPETITIONS)) {
        // Strict separation: Saudi Pro League vs Saudi First Division
        if (comp.id === 'saudi_first_division') {
          const isExplicitFirstDiv =
            normCand.includes('first division') ||
            normCand.includes('yelo') ||
            normCand.includes('ksa 2') ||
            normCand.includes('division 1') ||
            normCand.includes('division one') ||
            normCand === 'saudi 1st div';
          if (isExplicitFirstDiv) {
            return this.buildResolved(comp, posterLb);
          }
        } else if (comp.id === 'saudi_pro') {
          const isExplicitPro =
            (normCand.includes('saudi') || normCand.includes('spl') || normCand.includes('ksa 1')) &&
            !normCand.includes('first') &&
            !normCand.includes('yelo') &&
            !normCand.includes('division');
          if (isExplicitPro) {
            return this.buildResolved(comp, posterLb);
          }
        }

        // Strict separation: FIFA U-17 vs senior World Cup
        if (comp.id === 'fifa_u17') {
          const isU17 =
            normCand.includes('u17') ||
            normCand.includes('u 17') ||
            normCand.includes('under 17') ||
            normCand.includes('fifa world u17');
          if (isU17) {
            return this.buildResolved(comp, posterLb);
          }
        }

        // Strict separation: UEFA Champions League vs AFC / Arab / Non-UEFA Champions League
        if (comp.id === 'champions_league') {
          const isNonUefaCup =
            normCand.includes('afc') ||
            normCand.includes('asian') ||
            normCand.includes('arab') ||
            normCand.includes('gulf') ||
            normCand.includes('caf') ||
            normCand.includes('concacaf') ||
            normCand.includes('elite') ||
            normCand.includes('two') ||
            normCand.includes('asia');
          if (isNonUefaCup) {
            continue;
          }
        }

        // Standard canonical or alias match
        const matchesCanonical =
          normCand === normalizeText(comp.name) ||
          normCand === normalizeText(comp.shortName) ||
          comp.providerAliases.some(alias => normCand.includes(normalizeText(alias)));

        if (matchesCanonical) {
          // Guard against false positive U-17 match when candidate is senior World Cup
          if (comp.id === 'fifa_u17' && !normCand.includes('17')) {
            continue;
          }
          return this.buildResolved(comp, posterLb);
        }
      }
    }

    // ── STAGE 2: CLUB SIGNATURE ANALYSIS ──
    // When the competition is missing, generic ("Football"), or ambiguous, conclusive club identity resolves the competition.
    const combinedTeams = `${normalizeText(input.homeTeam || '')} ${normalizeText(input.awayTeam || '')}`.trim();
    if (combinedTeams.length > 2) {
      for (const comp of Object.values(CANONICAL_COMPETITIONS)) {
        if (!comp.clubSignatures || comp.clubSignatures.length === 0) continue;

        const matchedClub = comp.clubSignatures.some(club => {
          const normClub = normalizeText(club);
          return combinedTeams.includes(normClub);
        });

        if (matchedClub) {
          // Extra guard for Saudi First Division vs Saudi Pro League
          if (comp.id === 'saudi_first_division') {
            // Verify neither team is a Saudi Pro League powerhouse
            const hasProPowerhouse = CANONICAL_COMPETITIONS.saudi_pro.clubSignatures.some(c =>
              combinedTeams.includes(normalizeText(c))
            );
            if (!hasProPowerhouse) {
              return this.buildResolved(comp, posterLb);
            }
          } else {
            return this.buildResolved(comp, posterLb);
          }
        }
      }
    }

    // ── STAGE 3: POSTER LEAGUE TEXT PRESERVATION ──
    // If provider supplied a genuine league name in the poster `lg` parameter or description,
    // preserve that exact authentic name rather than collapsing to generic "Football".
    const preservedName = posterLg || descLeague;
    if (
      preservedName &&
      preservedName.trim().length > 2 &&
      !['football', 'soccer', 'sports', 'live'].includes(preservedName.trim().toLowerCase())
    ) {
      return {
        id: `custom_${normalizeText(preservedName).replace(/\s+/g, '_')}`,
        name: preservedName.trim(),
        shortName: preservedName.trim(),
        country: input.country || 'Global',
        region: 'Global',
        logoUrl: posterLb || LEAGUE_EMBLEMS['football'],
        accentColor: '#7952FC',
        sport: input.sport || 'soccer',
        isIdentified: true,
      };
    }

    // ── STAGE 4: FALLBACK TO GENERIC FOOTBALL / SPORT ──
    // Genuine fallback when no competition hints or club identities are available
    const sportName = input.sport || 'soccer';
    return {
      id: sportName,
      name: sportName === 'soccer' || sportName === 'football' ? 'Football' : sportName.toUpperCase(),
      shortName: sportName === 'soccer' || sportName === 'football' ? 'Football' : sportName.toUpperCase(),
      country: 'Global',
      region: 'Global',
      logoUrl: LEAGUE_EMBLEMS['football'],
      accentColor: '#7952FC',
      sport: sportName,
      isIdentified: false,
    };
  }

  private buildResolved(comp: CanonicalCompetition, fallbackPosterBadge?: string | null): ResolvedCompetition {
    return {
      id: comp.id,
      name: comp.name,
      shortName: comp.shortName,
      country: comp.country,
      region: comp.region,
      logoUrl: comp.logoUrl || fallbackPosterBadge || LEAGUE_EMBLEMS['football'],
      accentColor: comp.accentColor,
      sport: comp.sport,
      isIdentified: true,
    };
  }

  /**
   * Retrieves a canonical competition by its internal ID.
   */
  public getCompetitionById(id: string): CanonicalCompetition | undefined {
    return CANONICAL_COMPETITIONS[id];
  }

  /**
   * Returns all supported canonical competitions.
   */
  public getAllCompetitions(): CanonicalCompetition[] {
    return Object.values(CANONICAL_COMPETITIONS);
  }
}

export const competitionResolverService = new CompetitionResolverService();
export default competitionResolverService;
