/**
 * BALLIVE Universal Sport Background Resolver
 * 
 * Provides verified, permanent high-definition background artwork for every
 * sport returned by the server, eliminating missing/404 backdrops and ensuring
 * deterministic, sport-authentic visual presentation across all match cards.
 */

export const SPORT_ARTWORK: Record<string, string> = {
  soccer: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
  football: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
  basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
  hockey: 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=800&q=80',
  american_football: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=800&q=80',
  nfl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=800&q=80',
  mma: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  ufc: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  combat: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  boxing: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80',
  wrestling: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  wwe: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  motorsport: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
  f1: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
  racing: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
  tennis: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
  cricket: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
  baseball: 'https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&w=800&q=80',
  other: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
};

// Known deprecated/broken Unsplash image IDs that must be replaced
const BROKEN_IMAGE_PATTERNS = [
  'photo-1508098682722-e99c43a406b2', // 404 soccer image
  'photo-1531415074868-036b1c57e329', // 404 cricket image
  'photo-1574629810360-7efbbe195018', // unbranded placeholder
];

// Reusable soccer image patterns to detect if a non-soccer match was given a soccer default
const SOCCER_IMAGE_PATTERNS = [
  'photo-1579952363873-27f3bade9f55',
  'photo-1522778119026-d647f0596c20',
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
  'rangers', 'bruins', 'canadiens', 'maple leafs', 'leafs', 'blackhawks',
  'red wings', 'penguins', 'flyers', 'avalanche', 'lightning', 'golden knights',
  'oilers', 'flames', 'canucks', 'kraken', 'stars', 'predators', 'jets',
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
 * Resolves the appropriate background image for any match.
 * 1. Prioritizes verified server-supplied artwork (DAG poster / banner / venue) if valid.
 * 2. If the rawImage is a known broken ID or a mismatched soccer default on a non-soccer match,
 *    it replaces it with the authentic sport-specific backdrop.
 * 3. Falls back to verified authentic sport artwork with 100% clarity.
 */
export function resolveSportBackground(
  rawSport?: string,
  competition?: string,
  rawImage?: string | null,
  homeTeam?: string,
  awayTeam?: string
): string {
  const sportKey = normalizeSportKey(rawSport, competition, homeTeam, awayTeam);
  const authenticSportBackdrop = SPORT_ARTWORK[sportKey] || SPORT_ARTWORK.soccer;

  if (!rawImage || typeof rawImage !== 'string' || rawImage.trim().length < 12) {
    return authenticSportBackdrop;
  }

  const trimmed = rawImage.trim();
  if (trimmed.includes('null') || trimmed.includes('undefined')) {
    return authenticSportBackdrop;
  }

  // 1. Check if image matches known 404 or broken IDs
  for (const pattern of BROKEN_IMAGE_PATTERNS) {
    if (trimmed.includes(pattern)) {
      return authenticSportBackdrop;
    }
  }

  // 2. If the sport is NOT soccer (e.g. basketball, hockey, nfl) but the rawImage
  // is one of the generic soccer default photos, discard it and use the authentic sport backdrop!
  if (sportKey !== 'soccer') {
    for (const soccerPattern of SOCCER_IMAGE_PATTERNS) {
      if (trimmed.includes(soccerPattern)) {
        return authenticSportBackdrop;
      }
    }
  }

  return trimmed;
}

export default resolveSportBackground;
