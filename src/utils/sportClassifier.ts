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
  | 'boxing'
  | 'mma'
  | 'motorsport'
  | 'tennis'
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

  // 2. Combat Sports (Boxing, MMA, WWE, Muay Thai, Bare Knuckle)
  if (
    s === 'boxing' ||
    c.includes('boxing') ||
    c.includes('wbc') ||
    c.includes('wba') ||
    c.includes('ibf') ||
    c.includes('wbo')
  ) {
    return 'boxing';
  }

  if (
    s === 'mma' ||
    s === 'combat' ||
    c.includes('mma') ||
    c.includes('bellator') ||
    c.includes('pfl') ||
    c.includes('wwe') ||
    c.includes('one championship') ||
    c.includes('bare knuckle') ||
    c.includes('bkfc') ||
    c.includes('muay thai') ||
    c.includes('kickboxing') ||
    combined.includes('bellator') ||
    combined.includes('pfl') ||
    combined.includes('bkfc')
  ) {
    return 'boxing';
  }

  // 3. Motorsports & Racing (F1, MotoGP, NASCAR, IndyCar, Ferrari Challenge, Supercars, WEC)
  if (
    s === 'motorsport' ||
    s === 'motorsports' ||
    s === 'racing' ||
    s === 'formula1' ||
    s === 'f1' ||
    c.includes('formula 1') ||
    c.includes('formula one') ||
    c.includes('f1') ||
    c.includes('grand prix') ||
    c.includes('motogp') ||
    c.includes('moto2') ||
    c.includes('moto3') ||
    c.includes('nascar') ||
    c.includes('indycar') ||
    c.includes('ferrari challenge') ||
    c.includes('supercars') ||
    c.includes('le mans') ||
    c.includes('wec') ||
    c.includes('dtm') ||
    c.includes('porsche cup') ||
    c.includes('rally') ||
    c.includes('wrc') ||
    combined.includes('formula 1') ||
    combined.includes('motogp') ||
    combined.includes('grand prix') ||
    combined.includes('ferrari challenge') ||
    combined.includes('indycar') ||
    combined.includes('nascar') ||
    combined.includes('supercars') ||
    combined.includes('wec')
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
    case 'boxing':
    case 'mma':
      return 'Boxing & Combat';
    case 'motorsport':
      return 'Formula 1';
    case 'tennis':
      return 'Tennis';
    default:
      return 'Sports';
  }
}

/**
 * Returns true if the event is a combat sport (Boxing, MMA, WWE).
 * These sports do NOT use football-style team score layouts.
 */
export function isCombatSport(sport?: string | null, competition?: string | null, eventName?: string | null): boolean {
  const c = getCanonicalSport(sport, competition, eventName);
  return c === 'boxing' || c === 'mma';
}

/**
 * Returns true if the event is a motorsport / racing event (Formula 1, MotoGP, NASCAR).
 * These sports do NOT use football-style team score or "VS" layouts.
 */
export function isMotorsport(sport?: string | null, competition?: string | null, eventName?: string | null): boolean {
  return getCanonicalSport(sport, competition, eventName) === 'motorsport';
}

/**
 * Returns true if the event is a non-score event (Combat, Motorsports).
 */
export function isNonScoreSport(sport?: string | null, competition?: string | null, eventName?: string | null): boolean {
  const canonical = getCanonicalSport(sport, competition, eventName);
  return canonical === 'boxing' || canonical === 'mma' || canonical === 'motorsport';
}

/**
 * Returns true if the event is a standard team-versus-team sport with numeric scores.
 * (Football, American Football, Basketball, Hockey).
 */
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
 * Shortens and formats long motorsport / event titles by removing sponsor boilerplate
 * and excessive qualifying clauses while keeping the primary series and session clear.
 */
export function cleanEventTitle(title: string, sport?: string): string {
  if (!title) return '';
  let cleaned = title.trim();

  // If motorsport or long title:
  if (sport === 'motorsport' || isMotorsport(sport, title)) {
    // Specific popular series simplifications
    if (/ferrari\s+challenge/i.test(cleaned)) {
      if (/europe/i.test(cleaned)) return 'Ferrari Challenge: Europe';
      if (/north\s+america/i.test(cleaned)) return 'Ferrari Challenge: NA';
      if (/uk/i.test(cleaned)) return 'Ferrari Challenge: UK';
      return 'Ferrari Challenge';
    }
    if (/formula\s*1|f1\b/i.test(cleaned)) {
      const gpMatch = cleaned.match(/(?:formula\s*1\s+)?([a-zA-Z\s]+(?:\s+grand\s+prix|\s+gp))/i);
      if (gpMatch && gpMatch[1]) {
        return gpMatch[1].trim();
      }
    }
    if (/motogp/i.test(cleaned)) {
      const motoMatch = cleaned.match(/(?:motogp\s+)?([a-zA-Z\s]+(?:\s+grand\s+prix|\s+gp))/i);
      if (motoMatch && motoMatch[1]) {
        return `MotoGP: ${motoMatch[1].trim()}`;
      }
    }
    // Remove commercial sponsors and verbose suffixes like "Pirelli Trophy at the World Finals"
    cleaned = cleaned
      .replace(/\s+(pirelli\s+trophy|coppa\s+shell|world\s+finals|trofeo\s+pirelli)\b.*/gi, '')
      .replace(/\s+at\s+the\s+.*$/gi, '')
      .replace(/\s+presented\s+by\s+.*$/gi, '')
      .replace(/\s+sponsored\s+by\s+.*$/gi, '')
      .trim();
  }

  return cleaned || title;
}
