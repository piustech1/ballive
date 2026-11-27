/**
 * BALLIVE Sport Classification & Naming Authority
 * 
 * Centralized source of truth for sport categorization, user-facing display names,
 * and layout differentiation (team score sports vs combat vs racing/motorsports).
 * 
 * Rules:
 * - Association Football (soccer) is strictly displayed as: "Football"
 * - American Football (NFL / NCAA gridiron) is strictly displayed as: "American Football"
 * - Combat sports (Boxing, MMA, WWE) and Motorsports (F1, MotoGP, NASCAR)
 *   are identified to prevent inappropriate team-score or "VS" layouts.
 */

export type CanonicalSport =
  | 'soccer'
  | 'american_football'
  | 'basketball'
  | 'hockey'
  | 'tennis'
  | 'cricket'
  | 'other';

/**
 * Normalizes any sport string or competition name into a canonical sport identifier.
 */
export function getCanonicalSport(
  sport?: string | null,
  competition?: string | null,
  eventName?: string | null
): CanonicalSport {
  const s = (sport || '').toLowerCase().trim();
  const c = (competition || '').toLowerCase().trim();
  const e = (eventName || '').toLowerCase().trim();
  const combined = `${s} ${c} ${e}`;

  // 1. Explicit check for American Football (NFL, NCAAF, Super Bowl)
  if (
    s === 'american_football' ||
    s === 'americanfootball' ||
    s === 'nfl' ||
    c.includes('nfl') ||
    c.includes('american football') ||
    c.includes('super bowl') ||
    c.includes('ncaa football') ||
    c.includes('cfl') ||
    combined.includes('nfl')
  ) {
    return 'american_football';
  }

  // 2. Basketball (checked strictly BEFORE generic World Cup soccer rule so FIBA World Cup stays basketball!)
  if (
    s === 'basketball' ||
    s === 'nba' ||
    c.includes('nba') ||
    c.includes('basketball') ||
    c.includes('euroleague') ||
    c.includes('euro league') ||
    c.includes('eurocup') ||
    c.includes('wnba') ||
    c.includes('fiba') ||
    c === 'nbl' ||
    c.includes('new zealand nbl')
  ) {
    return 'basketball';
  }

  // 3. Hockey (NHL, KHL, DEL, MHL, ICEHL, AIHL, HockeyAllsvenskan)
  if (
    s === 'hockey' ||
    s === 'ice_hockey' ||
    s === 'nhl' ||
    c.includes('nhl') ||
    c.includes('hockey') ||
    c.includes('stanley cup') ||
    c.includes('icehl') ||
    c.includes('aihl') ||
    c.includes('allsvenskan') ||
    c.includes('russia mhl') ||
    c.includes('russian mhl') ||
    c === 'del' ||
    c.includes('germany del') ||
    c.includes('khl')
  ) {
    return 'hockey';
  }

  // 4. Cricket (ICC, IPL, BBL, WBBL)
  if (
    s === 'cricket' ||
    c.includes('cricket') ||
    c.includes('icc') ||
    c.includes('ipl') ||
    c.includes('bbl') ||
    c.includes('wbbl')
  ) {
    return 'cricket';
  }

  // 5. Tennis (ATP, WTA, Grand Slam)
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

  // 6. Association Football (Soccer)
  if (
    s === 'soccer' ||
    s === 'football' ||
    c.includes('premier league') ||
    c.includes('premier liga') ||
    c.includes('la liga') ||
    c.includes('laliga') ||
    c.includes('serie a') ||
    c.includes('bundesliga') ||
    c.includes('ligue 1') ||
    c.includes('champions league') ||
    c.includes('europa league') ||
    c.includes('conference league') ||
    c.includes('fifa world cup') ||
    (c.includes('world cup') && !c.includes('fiba') && !c.includes('basketball') && !c.includes('cricket') && !c.includes('rugby')) ||
    c.includes('liga mx') ||
    c.includes('liga profesional') ||
    c.includes('j1') ||
    c.includes('j.league') ||
    c.includes('saudi pro') ||
    c.includes('saudi first') ||
    c.includes('copa') ||
    c.includes('mls') ||
    c.includes('eredivisie') ||
    c.includes('super lig') ||
    c.includes('süper lig') ||
    c.includes('fc') ||
    c.includes('fa cup')
  ) {
    return 'soccer';
  }

  return 'other';
}

/**
 * Returns the authoritative user-facing display name for a sport.
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
      return 'Ice Hockey';
    case 'tennis':
      return 'Tennis';
    case 'cricket':
      return 'Cricket';
    default:
      return 'Sports';
  }
}

export function isCombatSport(_sport?: string | null, _competition?: string | null, _eventName?: string | null): boolean {
  return false;
}

export function isNonScoreSport(_sport?: string | null, _competition?: string | null, _eventName?: string | null): boolean {
  return false;
}

export function isTeamScoreSport(sport?: string | null, competition?: string | null, eventName?: string | null): boolean {
  const canonical = getCanonicalSport(sport, competition, eventName);
  return (
    canonical === 'soccer' ||
    canonical === 'american_football' ||
    canonical === 'basketball' ||
    canonical === 'hockey'
  );
}

/**
 * Shortens and formats long competition or event titles by removing sponsor boilerplate.
 */
export function cleanEventTitle(title: string, _sport?: string): string {
  if (!title) return '';
  const cleaned = title
    .trim()
    .replace(/\s+presented\s+by\s+.*$/gi, '')
    .replace(/\s+sponsored\s+by\s+.*$/gi, '')
    .trim();

  return cleaned || title;
}
