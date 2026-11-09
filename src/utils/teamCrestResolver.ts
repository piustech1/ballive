/**
 * BALLIVE Team Crest Image Resolver
 * Centralized mapping associating team identifiers/names with high-resolution CDN assets.
 * Compatible with future football API integration.
 */

const CDN_TEAMS = 'https://media.api-sports.io/football/teams';

// Authentic API-Sports Team IDs for high-resolution PNG badges
const CREST_MAP: Record<string, string> = {
  // Premier League
  'arsenal': `${CDN_TEAMS}/42.png`,
  'liverpool': `${CDN_TEAMS}/40.png`,
  'man-city': `${CDN_TEAMS}/50.png`,
  'manchester-city': `${CDN_TEAMS}/50.png`,
  'manchester city': `${CDN_TEAMS}/50.png`,
  'man-city-fc': `${CDN_TEAMS}/50.png`,
  'man-utd': `${CDN_TEAMS}/33.png`,
  'manchester-united': `${CDN_TEAMS}/33.png`,
  'manchester united': `${CDN_TEAMS}/33.png`,
  'chelsea': `${CDN_TEAMS}/49.png`,
  'tottenham': `${CDN_TEAMS}/47.png`,
  'tottenham-hotspur': `${CDN_TEAMS}/47.png`,
  'aston-villa': `${CDN_TEAMS}/66.png`,
  'aston villa': `${CDN_TEAMS}/66.png`,
  'brighton': `${CDN_TEAMS}/51.png`,
  'newcastle': `${CDN_TEAMS}/34.png`,
  'newcastle-united': `${CDN_TEAMS}/34.png`,
  'west-ham': `${CDN_TEAMS}/48.png`,
  'nottingham-forest': `${CDN_TEAMS}/65.png`,

  // LaLiga
  'real-madrid': `${CDN_TEAMS}/541.png`,
  'real madrid': `${CDN_TEAMS}/541.png`,
  'barcelona': `${CDN_TEAMS}/529.png`,
  'fc-barcelona': `${CDN_TEAMS}/529.png`,
  'fc barcelona': `${CDN_TEAMS}/529.png`,
  'atletico-madrid': `${CDN_TEAMS}/530.png`,
  'atletico madrid': `${CDN_TEAMS}/530.png`,
  'athletic-club': `${CDN_TEAMS}/531.png`,
  'athletic club': `${CDN_TEAMS}/531.png`,
  'villarreal': `${CDN_TEAMS}/533.png`,
  'real-sociedad': `${CDN_TEAMS}/548.png`,

  // Bundesliga
  'bayern': `${CDN_TEAMS}/157.png`,
  'bayern-munich': `${CDN_TEAMS}/157.png`,
  'bayern munich': `${CDN_TEAMS}/157.png`,
  'bayer-leverkusen': `${CDN_TEAMS}/168.png`,
  'bayer leverkusen': `${CDN_TEAMS}/168.png`,
  'leverkusen': `${CDN_TEAMS}/168.png`,
  'dortmund': `${CDN_TEAMS}/165.png`,
  'borussia-dortmund': `${CDN_TEAMS}/165.png`,
  'borussia dortmund': `${CDN_TEAMS}/165.png`,
  'rb-leipzig': `${CDN_TEAMS}/173.png`,
  'rb leipzig': `${CDN_TEAMS}/173.png`,
  'eintracht-frankfurt': `${CDN_TEAMS}/169.png`,
  'eintracht frankfurt': `${CDN_TEAMS}/169.png`,

  // Serie A
  'inter': `${CDN_TEAMS}/505.png`,
  'inter-milan': `${CDN_TEAMS}/505.png`,
  'inter milan': `${CDN_TEAMS}/505.png`,
  'milan': `${CDN_TEAMS}/489.png`,
  'ac-milan': `${CDN_TEAMS}/489.png`,
  'ac milan': `${CDN_TEAMS}/489.png`,
  'juventus': `${CDN_TEAMS}/496.png`,
  'napoli': `${CDN_TEAMS}/492.png`,
  'atalanta': `${CDN_TEAMS}/499.png`,
  'fiorentina': `${CDN_TEAMS}/502.png`,
  'lazio': `${CDN_TEAMS}/487.png`,
  'roma': `${CDN_TEAMS}/497.png`,

  // Ligue 1 & Other UCL Contenders
  'psg': `${CDN_TEAMS}/85.png`,
  'paris-saint-germain': `${CDN_TEAMS}/85.png`,
  'paris saint-germain': `${CDN_TEAMS}/85.png`,
  'sporting-cp': `${CDN_TEAMS}/228.png`,
  'sporting cp': `${CDN_TEAMS}/228.png`,
  'monaco': `${CDN_TEAMS}/91.png`,
  'as-monaco': `${CDN_TEAMS}/91.png`,
  'brest': `${CDN_TEAMS}/106.png`,
  'stade-brestois-29': `${CDN_TEAMS}/106.png`,
};

// Fallback shield crest
const DEFAULT_CREST = `${CDN_TEAMS}/42.png`;

/**
 * Resolves a team identifier or natural club name to an authentic CDN badge URL.
 */
export function getTeamCrest(teamIdentifierOrName?: string | null): string {
  if (!teamIdentifierOrName) return DEFAULT_CREST;

  // Direct exact match
  if (CREST_MAP[teamIdentifierOrName]) {
    return CREST_MAP[teamIdentifierOrName];
  }

  // Normalized match: lowercase, trim, replace spaces/underscores with hyphen
  const normalized = teamIdentifierOrName
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, '-');

  if (CREST_MAP[normalized]) {
    return CREST_MAP[normalized];
  }

  // Substring search
  const lower = teamIdentifierOrName.toLowerCase();
  for (const [key, url] of Object.entries(CREST_MAP)) {
    if (lower.includes(key) || key.includes(lower)) {
      return url;
    }
  }

  return DEFAULT_CREST;
}

export default getTeamCrest;
