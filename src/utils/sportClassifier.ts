/**
 * BALLIVE Sport Classification & Naming Authority
 * 
 * Centralized source of truth for sport categorization, user-facing display names,
 * and layout differentiation (team score sports vs combat vs racing/motorsports).
 * 
 * Rules:
 * - Association Football (soccer) is strictly displayed as: "Football"
 * - American Football (NFL / NCAA gridiron) is strictly displayed as: "American Football"
 * - Combat sports (UFC, MMA, Boxing, WWE) and Motorsports (F1, MotoGP, NASCAR)
 *   are identified to prevent inappropriate team-score or "VS" layouts.
 */

export type CanonicalSport =
  | 'soccer'
  | 'american_football'
  | 'basketball'
  | 'hockey'
  | 'mma'
  | 'motorsport'
  | 'tennis'
  | 'other';

/**
 * Normalizes any sport string or competition name into a canonical sport identifier.
 */
export function getCanonicalSport(sport?: string | null, competition?: string | null): CanonicalSport {
  const s = (sport || '').toLowerCase().trim();
  const c = (competition || '').toLowerCase().trim();

  // 1. Explicit check for American Football (NFL, NCAAF, Super Bowl)
  if (
    s === 'american_football' ||
    s === 'americanfootball' ||
    s === 'nfl' ||
    c.includes('nfl') ||
    c.includes('american football') ||
    c.includes('super bowl') ||
    c.includes('ncaa football') ||
    c.includes('cfl')
  ) {
    return 'american_football';
  }

  // 2. Combat Sports (UFC, MMA, Boxing, WWE)
  if (
    s === 'mma' ||
    s === 'ufc' ||
    s === 'boxing' ||
    s === 'combat' ||
    c.includes('ufc') ||
    c.includes('mma') ||
    c.includes('boxing') ||
    c.includes('bellator') ||
    c.includes('pfl') ||
    c.includes('wwe') ||
    c.includes('one championship')
  ) {
    return 'mma';
  }

  // 3. Motorsports & Racing (F1, MotoGP, NASCAR, IndyCar)
  if (
    s === 'motorsport' ||
    s === 'racing' ||
    s === 'formula1' ||
    s === 'f1' ||
    c.includes('formula 1') ||
    c.includes('formula one') ||
    c.includes('f1') ||
    c.includes('grand prix') ||
    c.includes('motogp') ||
    c.includes('nascar') ||
    c.includes('indycar')
  ) {
    return 'motorsport';
  }

  // 4. Basketball (NBA, EuroLeague, WNBA, NCAA Basketball)
  if (
    s === 'basketball' ||
    s === 'nba' ||
    c.includes('nba') ||
    c.includes('basketball') ||
    c.includes('euroleague') ||
    c.includes('wnba')
  ) {
    return 'basketball';
  }

  // 5. Hockey (NHL, KHL)
  if (
    s === 'hockey' ||
    s === 'nhl' ||
    c.includes('nhl') ||
    c.includes('hockey') ||
    c.includes('stanley cup')
  ) {
    return 'hockey';
  }

  // 6. Tennis (ATP, WTA, Grand Slam)
  if (
    s === 'tennis' ||
    c.includes('tennis') ||
    c.includes('atp') ||
    c.includes('wta') ||
    c.includes('wimbledon') ||
    c.includes('us open') ||
    c.includes('roland garros') ||
    c.includes('australian open')
  ) {
    return 'tennis';
  }

  // 7. Association Football (Soccer)
  if (
    s === 'soccer' ||
    s === 'football' ||
    c.includes('premier league') ||
    c.includes('la liga') ||
    c.includes('serie a') ||
    c.includes('bundesliga') ||
    c.includes('ligue 1') ||
    c.includes('champions league') ||
    c.includes('europa league') ||
    c.includes('world cup') ||
    c.includes('copa') ||
    c.includes('mls') ||
    c.includes('eredivisie') ||
    c.includes('fc') ||
    c.includes('fa cup')
  ) {
    return 'soccer';
  }

  return 'other';
}

/**
 * Returns the authoritative user-facing display name for a sport.
 * Strictly guarantees:
 * - Association Football -> "Football"
 * - American Football -> "American Football"
 */
export function getSportDisplayName(sport?: string | null, competition?: string | null): string {
  const canonical = getCanonicalSport(sport, competition);
  switch (canonical) {
    case 'soccer':
      return 'Football';
    case 'american_football':
      return 'American Football';
    case 'basketball':
      return 'Basketball';
    case 'hockey':
      return 'Hockey';
    case 'mma':
      return 'UFC & Combat';
    case 'motorsport':
      return 'Formula 1';
    case 'tennis':
      return 'Tennis';
    default:
      return 'Sports';
  }
}

/**
 * Returns true if the event is a combat sport (UFC, MMA, Boxing, WWE).
 * These sports do NOT use football-style team score layouts.
 */
export function isCombatSport(sport?: string | null, competition?: string | null): boolean {
  return getCanonicalSport(sport, competition) === 'mma';
}

/**
 * Returns true if the event is a motorsport / racing event (Formula 1, MotoGP, NASCAR).
 * These sports do NOT use football-style team score or "VS" layouts.
 */
export function isMotorsport(sport?: string | null, competition?: string | null): boolean {
  return getCanonicalSport(sport, competition) === 'motorsport';
}

/**
 * Returns true if the event is a non-score event (Combat, Motorsports).
 */
export function isNonScoreSport(sport?: string | null, competition?: string | null): boolean {
  const canonical = getCanonicalSport(sport, competition);
  return canonical === 'mma' || canonical === 'motorsport';
}

/**
 * Returns true if the event is a standard team-versus-team sport with numeric scores.
 * (Football, American Football, Basketball, Hockey).
 */
export function isTeamScoreSport(sport?: string | null, competition?: string | null): boolean {
  const canonical = getCanonicalSport(sport, competition);
  return (
    canonical === 'soccer' ||
    canonical === 'american_football' ||
    canonical === 'basketball' ||
    canonical === 'hockey'
  );
}
