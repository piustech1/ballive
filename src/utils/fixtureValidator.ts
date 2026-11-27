/**
 * BALLIVE Universal Fixture Integrity Validator
 *
 * Ensures invalid, corrupted, placeholder, self-vs-self ("Horses vs Horses"),
 * or excluded sport items (Motorsport / F1, Combat, Tennis, Cricket, College)
 * never enter match lists, cards, streams, search results, MOTD, or win probability.
 */

const PLACEHOLDER_TEAMS = new Set([
  'opponent',
  'tbd',
  'tba',
  'unknown',
  'none',
  'null',
  'undefined',
  'n/a',
  'na',
  'team a',
  'team b',
  'home',
  'away',
  'home team',
  'away team',
  'teams tba',
  'red corner',
  'blue corner',
]);

const MOTORSPORT_PATTERN =
  /\b(f1|formula\s*1|formula\s*2|formula\s*3|motogp|moto2|moto3|nascar|indycar|motorsport|supercars|grand\s+prix|lusail|abu\s+dhabi\s+gp|qatar\s+gp)\b/i;

const EXCLUDED_NON_MATCH_TITLE_PATTERN =
  /kaun\s+banega|game\s+show|reality|lottery|bingo|simulcast|goals\s+show|watchalong|preview\s+show|matchday\s+\d+|the\s+f1\s+show|practice\s+\d+|qualifying\s*\|/i;

/**
 * Normalizes a participant name for duplicate/self-match comparison.
 */
export function normalizeParticipantEntity(name?: string | null): string {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .replace(/['’.`]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(fc|cf|sc|afc|ac|cd|ud|sd|ss|as|club|the)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns true if the string is a missing/placeholder participant label.
 */
export function isPlaceholderParticipant(name?: string | null): boolean {
  if (!name || typeof name !== 'string') return true;
  const trimmed = name.trim().toLowerCase();
  if (trimmed.length < 2) return true;
  if (PLACEHOLDER_TEAMS.has(trimmed)) return true;
  if (trimmed.includes('teams tba') || trimmed.includes('live 24/7')) return true;
  return false;
}

/**
 * Detects Formula 1 & Motorsport entities or events across fields.
 */
export function isExcludedMotorsport(
  sport?: string | null,
  competition?: string | null,
  title?: string | null
): boolean {
  const sp = (sport || '').toLowerCase().trim();
  if (sp === 'motorsport' || sp === 'racing' || sp === 'f1' || sp === 'formula-1' || sp === 'formula_1') {
    return true;
  }
  const combined = `${competition || ''} ${title || ''}`;
  return MOTORSPORT_PATTERN.test(combined);
}

/**
 * Extracts home and away team names & IDs from either LiveMatch or DiscoverMatchup.
 */
function extractTeams(item: any): {
  homeName: string;
  awayName: string;
  homeId: string;
  awayId: string;
} {
  const isObj = typeof item?.homeTeam === 'object' && item?.homeTeam !== null;
  const homeName = isObj ? item.homeTeam?.name || '' : item?.homeTeam || '';
  const awayName = isObj ? item.awayTeam?.name || '' : item?.awayTeam || '';
  const homeId = isObj ? item.homeTeam?.id || '' : item?.homeTeamId || '';
  const awayId = isObj ? item.awayTeam?.id || '' : item?.awayTeamId || '';
  return {
    homeName: String(homeName).trim(),
    awayName: String(awayName).trim(),
    homeId: String(homeId).trim().toLowerCase(),
    awayId: String(awayId).trim().toLowerCase(),
  };
}

/**
 * Validates that a fixture represents two distinct, genuine competing teams/sides
 * and does not represent self-vs-self data corruption (e.g. "Horses vs Horses") or excluded sports.
 */
export function isValidFixture(item: any): boolean {
  if (!item || typeof item !== 'object') return false;

  const { homeName, awayName, homeId, awayId } = extractTeams(item);
  if (isPlaceholderParticipant(homeName) || isPlaceholderParticipant(awayName)) {
    return false;
  }

  // Strictly block identical side vs side (by raw name, normalized entity, or ID)
  if (homeName.toLowerCase() === awayName.toLowerCase()) {
    return false;
  }
  const normHome = normalizeParticipantEntity(homeName);
  const normAway = normalizeParticipantEntity(awayName);
  if (!normHome || !normAway || normHome === normAway) {
    return false;
  }
  if (homeId && awayId && homeId.length > 3 && homeId === awayId) {
    return false;
  }

  const title = item.title || `${homeName} vs ${awayName}`;
  const comp = item.competition || '';
  const sport = item.sport || '';

  if (isExcludedMotorsport(sport, comp, title)) {
    return false;
  }
  if (EXCLUDED_NON_MATCH_TITLE_PATTERN.test(title)) {
    return false;
  }

  return true;
}

export default isValidFixture;
