/**
 * BALLIVE Universal Sport Background Resolver
 * 
 * Provides verified, permanent high-resolution background artwork for every
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
  other: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
};

// Known deprecated/broken Unsplash image IDs that must be replaced
const BROKEN_IMAGE_PATTERNS = [
  'photo-1508098682722-e99c43a406b2', // 404 soccer image
  'photo-1531415074868-036b1c57e329', // 404 cricket image
  'photo-1574629810360-7efbbe195018', // unbranded placeholder
];

/**
 * Normalizes any sport or competition identifier into a canonical sport key.
 */
export function normalizeSportKey(rawSport?: string, competition?: string): string {
  const s = (rawSport || '').toLowerCase().trim();
  const c = (competition || '').toLowerCase().trim();

  if (s === 'basketball' || s === 'nba' || c.includes('nba') || c.includes('basketball') || c.includes('euroleague')) {
    return 'basketball';
  }
  if (s === 'hockey' || s === 'nhl' || c.includes('nhl') || c.includes('hockey') || c.includes('khl')) {
    return 'hockey';
  }
  if (s === 'boxing' || c.includes('boxing') || c.includes('wbc') || c.includes('wba')) {
    return 'boxing';
  }
  if (
    s === 'mma' || s === 'ufc' || s === 'combat' || s === 'wrestling' || s === 'wwe' ||
    c.includes('ufc') || c.includes('mma') || c.includes('bellator') || c.includes('pfl') ||
    c.includes('wwe') || c.includes('wrestling') || c.includes('aew') || c.includes('tna')
  ) {
    return 'mma';
  }
  if (
    s === 'american_football' || s === 'nfl' || s === 'football_usa' ||
    c.includes('nfl') || c.includes('american football') || c.includes('super bowl')
  ) {
    return 'american_football';
  }
  if (
    s === 'motorsport' || s === 'f1' || s === 'racing' ||
    c.includes('f1') || c.includes('formula') || c.includes('grand prix') || c.includes('motorsport') || c.includes('nascar')
  ) {
    return 'motorsport';
  }
  if (s === 'tennis' || c.includes('tennis') || c.includes('atp') || c.includes('wta') || c.includes('wimbledon') || c.includes('us open')) {
    return 'tennis';
  }
  if (s === 'cricket' || c.includes('cricket') || c.includes('ipl') || c.includes('icc') || c.includes('bbl')) {
    return 'cricket';
  }

  return 'soccer';
}

/**
 * Resolves the appropriate background image for any match.
 * If rawImage is provided, valid, and not in the broken list, it is used.
 * Otherwise, the verified authentic sport-specific backdrop is returned.
 */
export function resolveSportBackground(
  rawSport?: string,
  competition?: string,
  rawImage?: string | null
): string {
  const sportKey = normalizeSportKey(rawSport, competition);
  const fallback = SPORT_ARTWORK[sportKey] || SPORT_ARTWORK.soccer;

  if (!rawImage || typeof rawImage !== 'string' || rawImage.trim().length < 12) {
    return fallback;
  }

  const trimmed = rawImage.trim();
  if (trimmed.includes('null') || trimmed.includes('undefined')) {
    return fallback;
  }

  // Check if image matches known 404 or broken IDs
  for (const pattern of BROKEN_IMAGE_PATTERNS) {
    if (trimmed.includes(pattern)) {
      return fallback;
    }
  }

  return trimmed;
}

export default resolveSportBackground;
