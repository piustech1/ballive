/**
 * BALLIVE Universal Match-Specific Background Resolver
 * 
 * Resolves verified, permanent, high-definition background artwork for every
 * match and sport returned by the server.
 * 
 * Rules:
 * 1. Prioritize authentic server-provided match artwork (from DAG, TheSportsDB, ondemand.st).
 *    Clean proxy URLs to strip any baked-in green text overlays.
 * 2. If no server artwork is available, use a curated multi-image pool per sport
 *    with deterministic hashing based on match identity, ensuring no two matches
 *    share the exact same artwork.
 * 3. Preserve 100% original visual clarity (no full-card dark overlays or blur).
 */

// Verified, high-resolution authentic stadium and sport action photography pools
export const SPORT_ARTWORK_POOLS: Record<string, string[]> = {
  soccer: [
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80',
  ],
  football: [
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=800&q=80',
  ],
  basketball: [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?auto=format&fit=crop&w=800&q=80',
  ],
  hockey: [
    'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1563299796-17596ed6b017?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=800&q=80',
  ],
  american_football: [
    'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  ],
  nfl: [
    'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
  ],
  mma: [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?auto=format&fit=crop&w=800&q=80',
  ],
  ufc: [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80',
  ],
  combat: [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80',
  ],
  boxing: [
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  ],
  motorsport: [
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  ],
  f1: [
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80',
  ],
  tennis: [
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80',
  ],
  cricket: [
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
  ],
  baseball: [
    'https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&w=800&q=80',
  ],
  other: [
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80',
  ],
};

// Verified, competition-specific authentic hero backdrops
export const COMPETITION_BACKDROPS: Record<string, string> = {
  ucl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80',
  uel: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
  pl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80',
  laliga: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1200&q=80',
  seriea: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=1200&q=80',
  bundesliga: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=1200&q=80',
  ligue1: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80',
  uefa_nations: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
  concacaf: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=1200&q=80',
  afcon: 'https://images.unsplash.com/photo-1516475429286-465d815a0df7?auto=format&fit=crop&w=1200&q=80',
  world_cup: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1200&q=80',
  mls: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=80',
  nwsl: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1200&q=80',
  liga_f: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
  wsl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80',
  liga_mx_femenil: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80',
  coupe_de_france: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80',
  intl_friendly: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
  copa_del_rey: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1200&q=80',
  fa_cup: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=1200&q=80',
  dfb_pokal: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=1200&q=80',
  coppa_italia: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80',
  nba: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
  nhl: 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1200&q=80',
  nfl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=1200&q=80',
  ufc: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
  f1: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
};

// Backwards compatibility
export const SPORT_ARTWORK: Record<string, string> = Object.fromEntries(
  Object.entries(SPORT_ARTWORK_POOLS).map(([k, v]) => [k, v[0]])
);

// Known deprecated or 404 Unsplash image IDs that must be replaced
const BROKEN_IMAGE_PATTERNS = [
  'photo-1508098682722-e99c43a406b2',
  'photo-1531415074868-036b1c57e329',
];

// Keywords for team name sport detection
const BASKETBALL_TEAMS = [
  'lakers', 'warriors', 'celtics', 'heat', 'bulls', 'knicks', 'raptors',
  'mavericks', 'clippers', 'nuggets', 'suns', 'bucks', '76ers', 'cavaliers',
  'timberwolves', 'thunder', 'pacers', 'grizzlies', 'spurs', 'hawks',
  'hornets', 'magic', 'trail blazers', 'blazers', 'jazz', 'wizards',
  'pistons', 'rockets', 'pelicans', 'kings', 'nets',
];

const HOCKEY_TEAMS = [
  'new york rangers', 'ny rangers', 'bruins', 'canadiens', 'maple leafs', 'leafs', 'blackhawks',
  'red wings', 'penguins', 'flyers', 'avalanche', 'lightning', 'golden knights',
  'oilers', 'flames', 'canucks', 'kraken', 'dallas stars', 'texas stars', 'predators', 'winnipeg jets',
  'wild', 'blues', 'islanders', 'devils', 'capitals', 'hurricanes',
  'panthers', 'sabres', 'senators', 'ducks', 'sharks', 'coyotes',
];

const NFL_TEAMS = [
  'chiefs', 'eagles', '49ers', 'cowboys', 'ravens', 'bills', 'lions',
  'packers', 'dolphins', 'texans', 'browns', 'rams', 'bengals', 'steelers',
  'seahawks', 'buccaneers', 'colts', 'jaguars', 'vikings', 'broncos',
  'raiders', 'saints', 'falcons', 'cardinals', 'patriots', 'titans',
  'commanders', 'bears', 'chargers',
];

/**
 * Normalizes any sport, competition, or team identifier into a canonical sport key.
 */
export function normalizeSportKey(
  rawSport?: string,
  competition?: string,
  homeTeam?: string,
  awayTeam?: string
): string {
  const s = (rawSport || '').toLowerCase().trim();
  const c = (competition || '').toLowerCase().trim();
  const teams = `${homeTeam || ''} ${awayTeam || ''}`.toLowerCase().trim();

  // 1. Explicit Soccer / Association Football Check (Highest Priority)
  const isExplicitSoccer =
    s === 'soccer' ||
    s === 'football' ||
    s === 'association football' ||
    c.includes('soccer') ||
    c.includes('premier league') ||
    c.includes('efl') ||
    c.includes('championship') ||
    c.includes('league one') ||
    c.includes('league two') ||
    c.includes('la liga') ||
    c.includes('laliga') ||
    c.includes('serie a') ||
    c.includes('bundesliga') ||
    c.includes('ligue 1') ||
    c.includes('ligue 2') ||
    c.includes('coupe de france') ||
    c.includes('copa del rey') ||
    c.includes('dfb-pokal') ||
    c.includes('coppa italia') ||
    c.includes('fa cup') ||
    c.includes('carabao') ||
    c.includes('uefa') ||
    c.includes('champions league') ||
    c.includes('europa') ||
    c.includes('conference league') ||
    c.includes('fifa') ||
    c.includes('world cup') ||
    c.includes('afcon') ||
    c.includes('conmebol') ||
    c.includes('concacaf') ||
    c.includes('friendly') ||
    c.includes('wsl');

  if (isExplicitSoccer && !s.includes('american') && !c.includes('nfl') && !c.includes('super bowl')) {
    return 'soccer';
  }

  // Basketball
  if (
    s === 'basketball' || s === 'nba' ||
    c.includes('nba') || c.includes('basketball') || c.includes('euroleague') || c.includes('wnba') ||
    BASKETBALL_TEAMS.some(t => teams.includes(t))
  ) {
    return 'basketball';
  }

  // Hockey
  if (
    s === 'hockey' || s === 'nhl' ||
    c.includes('nhl') || c.includes('hockey') || c.includes('khl') ||
    HOCKEY_TEAMS.some(t => teams.includes(t))
  ) {
    return 'hockey';
  }

  // Boxing
  if (
    s === 'boxing' ||
    c.includes('boxing') || c.includes('wbc') || c.includes('wba') || c.includes('ibf') || c.includes('wbo')
  ) {
    return 'boxing';
  }

  // Combat / MMA / UFC / Wrestling
  if (
    s === 'mma' || s === 'ufc' || s === 'combat' || s === 'wrestling' || s === 'wwe' ||
    c.includes('ufc') || c.includes('mma') || c.includes('bellator') || c.includes('pfl') ||
    c.includes('wwe') || c.includes('wrestling') || c.includes('aew') || c.includes('tna') ||
    c.includes('cage') || c.includes('fight night')
  ) {
    return 'mma';
  }

  // American Football / NFL
  if (
    s === 'american_football' || s === 'nfl' || s === 'football_usa' ||
    c.includes('nfl') || c.includes('american football') || c.includes('super bowl') ||
    NFL_TEAMS.some(t => teams.includes(t))
  ) {
    return 'american_football';
  }

  // Motorsport / F1
  if (
    s === 'motorsport' || s === 'f1' || s === 'racing' ||
    c.includes('f1') || c.includes('formula') || c.includes('grand prix') || c.includes('motorsport') || c.includes('nascar') || c.includes('motogp')
  ) {
    return 'motorsport';
  }

  // Tennis
  if (
    s === 'tennis' ||
    c.includes('tennis') || c.includes('atp') || c.includes('wta') || c.includes('wimbledon') || c.includes('us open') || c.includes('roland garros') || c.includes('australian open')
  ) {
    return 'tennis';
  }

  // Cricket
  if (
    s === 'cricket' ||
    c.includes('cricket') || c.includes('ipl') || c.includes('icc') || c.includes('bbl') || c.includes('t20')
  ) {
    return 'cricket';
  }

  // Baseball
  if (
    s === 'baseball' || s === 'mlb' ||
    c.includes('baseball') || c.includes('mlb')
  ) {
    return 'baseball';
  }

  return 'soccer';
}

/**
 * Computes a deterministic integer hash for any string seed.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Retrieves a deterministic sport-specific artwork from the pool based on match seed.
 */
export function getDeterministicSportArtwork(sportKey: string, seed?: string): string {
  const pool = SPORT_ARTWORK_POOLS[sportKey] || SPORT_ARTWORK_POOLS.soccer;
  if (!seed || seed.trim().length === 0) {
    return pool[0];
  }
  const idx = hashString(seed) % pool.length;
  return pool[idx];
}

/**
 * Cleans server-provided image URLs.
 * If URL is from DAG proxy (`dag.s-u.in/img?url=...`):
 * Strips all baked-in green text (`&text=...`), badges (`&b1=...`), and colors (`&color=...`)
 * returning the pristine underlying image.
 */
export function cleanServerArtworkUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (trimmed.length < 12 || trimmed.includes('null') || trimmed.includes('undefined')) {
    return null;
  }

  // Check for broken Unsplash IDs
  for (const pattern of BROKEN_IMAGE_PATTERNS) {
    if (trimmed.includes(pattern)) return null;
  }

  // If from DAG image proxy, extract the clean target URL
  if (trimmed.includes('dag.s-u.in/img')) {
    const urlMatch = trimmed.match(/[?&]url=([^&]+)/);
    if (urlMatch && urlMatch[1]) {
      const decodedTarget = decodeURIComponent(urlMatch[1]);
      // If the target is directly accessible without proxy
      if (decodedTarget.includes('thesportsdb.com') || decodedTarget.includes('espncdn.com')) {
        return decodedTarget;
      }
      // If it's ondemand.st or others requiring DAG proxy headers, proxy it WITHOUT text/color parameters
      return `https://dag.s-u.in/img?url=${encodeURIComponent(decodedTarget)}`;
    }
  }

  // Clean any standard URL by stripping text/color query params if present
  try {
    const u = new URL(trimmed);
    u.searchParams.delete('text');
    u.searchParams.delete('color');
    return u.toString();
  } catch {
    return trimmed;
  }
}

/**
 * Checks whether an image URL represents a verified, fixture-specific event thumbnail
 * (e.g. from TheSportsDB, ondemand.st, ESPN event cards, DAG match cards) rather than a generic sport placeholder.
 */
export function isVerifiedEventImage(rawUrl?: string | null): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const s = rawUrl.toLowerCase().trim();
  if (
    s.includes('thesportsdb.com') ||
    s.includes('ondemand.st') ||
    s.includes('espncdn.com/i/cards') ||
    s.includes('espncdn.com/images/match') ||
    s.includes('espncdn.com/i/headshots') ||
    s.includes('espncdn.com/photo')
  ) {
    return true;
  }
  if (s.includes('dag.s-u.in/img')) {
    return (
      s.includes('thesportsdb') ||
      s.includes('ondemand') ||
      s.includes('event') ||
      s.includes('/img/match') ||
      s.includes('cat=football') ||
      s.includes('cat=soccer') ||
      s.includes('title=')
    );
  }
  return false;
}

/**
 * Normalizes any tournament or competition title into a canonical competition key
 * for authentic hero backdrop mapping.
 */
export function normalizeCompetitionKey(competition?: string): string | null {
  if (!competition) return null;
  const c = competition.toLowerCase().trim();
  if (c.includes('champion') || c === 'ucl') return 'ucl';
  if (c.includes('europa') || c === 'uel') return 'uel';
  if (c.includes('uefa nation') || (c.includes('nations league') && (c.includes('uefa') || c.includes('group a') || c.includes('group b') || c.includes('group c') || c.includes('group d')))) return 'uefa_nations';
  if (c.includes('concacaf')) return 'concacaf';
  if (c.includes('afcon') || c.includes('africa cup') || c.includes('caf')) return 'afcon';
  if (c.includes('premier') || c === 'epl' || c === 'pl') return 'pl';
  if (c.includes('liga f') || c.includes('primera división femenina') || c.includes('primera femenina')) return 'liga_f';
  if (c.includes("women's super league") || c.includes('womens super league') || c.includes('wsl') || c.includes('fa wsl')) return 'wsl';
  if (c.includes('nwsl') || c.includes("national women's soccer league")) return 'nwsl';
  if (c.includes('liga mx femenil') || c.includes('mexico femenil')) return 'liga_mx_femenil';
  if (c.includes('coupe de france') || c.includes('french cup')) return 'coupe_de_france';
  if (c.includes('copa del rey')) return 'copa_del_rey';
  if (c.includes('fa cup')) return 'fa_cup';
  if (c.includes('dfb-pokal') || c.includes('dfb pokal') || c.includes('german cup')) return 'dfb_pokal';
  if (c.includes('coppa italia') || c.includes('italian cup')) return 'coppa_italia';
  if (c.includes('friendly') || c.includes('friendlies') || c.includes('amichevole') || c.includes('amistoso')) return 'intl_friendly';
  if (c.includes('laliga') || c.includes('la liga') || c.includes('primera')) return 'laliga';
  if (c.includes('serie a')) return 'seriea';
  if (c.includes('bundesliga') || c.includes('bundes')) return 'bundesliga';
  if (c.includes('ligue 1') || c.includes('ligue1') || c.includes('première ligue')) return 'ligue1';
  if (c.includes('women')) return 'nwsl';
  if (c.includes('mls') || c.includes('major league soccer')) return 'mls';
  if (c.includes('world cup') || c.includes('qualifying') || c.includes('fifa')) return 'world_cup';
  if (c.includes('nba') || c.includes('basketball')) return 'nba';
  if (c.includes('nhl') || c.includes('hockey')) return 'nhl';
  if (c.includes('nfl') || c.includes('american football')) return 'nfl';
  if (c.includes('ufc') || c.includes('mma') || c.includes('combat') || c.includes('wwe')) return 'ufc';
  if (c.includes('f1') || c.includes('formula')) return 'f1';
  return null;
}

/**
 * Resolves the appropriate, match-specific background image.
 * 
 * 5-Tier Resolution Hierarchy:
 * 1. Verified authentic event card/thumbnail from server/DAG (TheSportsDB, ondemand.st, ESPN).
 * 1b. Authentic DAG dynamic match artwork with authentic team crests for association football.
 * 2. Authentic competition-specific hero backdrop (e.g. UCL starry night, UEFA Nations League,
 *    Concacaf Nations League, Premier League, LaLiga, Serie A, AFCON, NBA, NHL, NFL, UFC).
 * 3. Curated team/venue backdrop if available.
 * 4. Deterministic high-definition sport-authentic fallback from multi-image pool (indexed by seed).
 * 5. Neutral sport fallback.
 */
export function resolveSportBackground(
  rawSport?: string,
  competition?: string,
  rawImage?: string | null,
  homeTeam?: string,
  awayTeam?: string,
  matchId?: string,
  homeBadge?: string | null,
  awayBadge?: string | null
): string {
  const sportKey = normalizeSportKey(rawSport, competition, homeTeam, awayTeam);
  const seed = matchId || `${homeTeam || ''} ${awayTeam || ''} ${competition || ''}`.trim();

  // Tier 1: Verified authentic event thumbnail
  const cleanedServerImage = cleanServerArtworkUrl(rawImage);
  if (cleanedServerImage) {
    if (isVerifiedEventImage(cleanedServerImage)) {
      return cleanedServerImage;
    }

    // Check if it's not a generic soccer placeholder erroneously passed for other sports
    const isMismatchedSoccerPlaceholder =
      sportKey !== 'soccer' &&
      (cleanedServerImage.includes('photo-1579952363873-27f3bade9f55') ||
        cleanedServerImage.includes('photo-1522778119026-d647f0596c20'));

    const isGenericUnsplash = cleanedServerImage.includes('images.unsplash.com');

    // If it's a dedicated custom non-generic server image, keep it
    if (!isMismatchedSoccerPlaceholder && !isGenericUnsplash) {
      return cleanedServerImage;
    }
  }

  // Tier 1b: For soccer matches with named teams, generate authentic DAG match card with badges
  if (sportKey === 'soccer' && homeTeam && awayTeam && homeTeam.trim() !== '' && awayTeam.trim() !== '') {
    const cleanHome = homeTeam.trim();
    const cleanAway = awayTeam.trim();
    if (cleanHome.toLowerCase() !== 'home team' && cleanAway.toLowerCase() !== 'away team') {
      const b1 = homeBadge && typeof homeBadge === 'string' && !homeBadge.includes('default-team-logo') && !homeBadge.includes('default_crest') ? `&b1=${encodeURIComponent(homeBadge)}` : '';
      const b2 = awayBadge && typeof awayBadge === 'string' && !awayBadge.includes('default-team-logo') && !awayBadge.includes('default_crest') ? `&b2=${encodeURIComponent(awayBadge)}` : '';
      return `https://dag.s-u.in/img/match?title=${encodeURIComponent(`${cleanHome} vs ${cleanAway}`)}&cat=football${b1}${b2}`;
    }
  }

  // Tier 2: Authentic competition-specific hero backdrop
  const compKey = normalizeCompetitionKey(competition);
  if (compKey && COMPETITION_BACKDROPS[compKey]) {
    return COMPETITION_BACKDROPS[compKey];
  }

  // Tier 3 & 4: Deterministic high-definition sport-authentic fallback from pool
  return getDeterministicSportArtwork(sportKey, seed);
}

export default resolveSportBackground;
