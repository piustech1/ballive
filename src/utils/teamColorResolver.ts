/**
 * BALLIVE Team Primary & Secondary Color Resolver
 * 
 * Provides authentic, verified primary and secondary brand colors for sports clubs
 * and franchises across Association Football (Soccer), Basketball (NBA), American Football (NFL),
 * Hockey (NHL), and College Sports.
 * 
 * Includes smart color-collision detection: when two teams in the same match share similar hues
 * (e.g. Arsenal vs Liverpool or Chelsea vs Everton), the away team receives their secondary or contrasting
 * away kit color so the two halves remain visually distinct and faithful to broadcast standards.
 */

export interface TeamColorDefinition {
  primary: string;
  secondary: string;
}

// Normalized lookup table for club brand colors
const TEAM_COLORS: Record<string, TeamColorDefinition> = {
  // ── PREMIER LEAGUE ──
  'arsenal': { primary: '#EF0107', secondary: '#063672' },
  'aston-villa': { primary: '#670E36', secondary: '#95BFE5' },
  'aston villa': { primary: '#670E36', secondary: '#95BFE5' },
  'bournemouth': { primary: '#DA291C', secondary: '#1D1D1B' },
  'afc-bournemouth': { primary: '#DA291C', secondary: '#1D1D1B' },
  'afc bournemouth': { primary: '#DA291C', secondary: '#1D1D1B' },
  'brentford': { primary: '#E30613', secondary: '#000000' },
  'brighton': { primary: '#0057B8', secondary: '#FFCD00' },
  'brighton-and-hove-albion': { primary: '#0057B8', secondary: '#FFCD00' },
  'brighton & hove albion': { primary: '#0057B8', secondary: '#FFCD00' },
  'chelsea': { primary: '#034694', secondary: '#EE242C' },
  'crystal-palace': { primary: '#1B458F', secondary: '#C4122E' },
  'crystal palace': { primary: '#1B458F', secondary: '#C4122E' },
  'everton': { primary: '#003399', secondary: '#FFFFFF' },
  'fulham': { primary: '#1D1D1B', secondary: '#CC0000' },
  'ipswich': { primary: '#00447C', secondary: '#E30613' },
  'ipswich-town': { primary: '#00447C', secondary: '#E30613' },
  'ipswich town': { primary: '#00447C', secondary: '#E30613' },
  'leicester': { primary: '#003090', secondary: '#FDBE11' },
  'leicester-city': { primary: '#003090', secondary: '#FDBE11' },
  'leicester city': { primary: '#003090', secondary: '#FDBE11' },
  'liverpool': { primary: '#C8102E', secondary: '#00B2A9' },
  'man-city': { primary: '#6CABDD', secondary: '#1C2C5B' },
  'manchester-city': { primary: '#6CABDD', secondary: '#1C2C5B' },
  'manchester city': { primary: '#6CABDD', secondary: '#1C2C5B' },
  'man-utd': { primary: '#DA291C', secondary: '#FBE122' },
  'manchester-united': { primary: '#DA291C', secondary: '#FBE122' },
  'manchester united': { primary: '#DA291C', secondary: '#FBE122' },
  'newcastle': { primary: '#241F20', secondary: '#41B6E6' },
  'newcastle-united': { primary: '#241F20', secondary: '#41B6E6' },
  'newcastle united': { primary: '#241F20', secondary: '#41B6E6' },
  'nottingham-forest': { primary: '#DD0000', secondary: '#FFFFFF' },
  'nottingham forest': { primary: '#DD0000', secondary: '#FFFFFF' },
  'southampton': { primary: '#D71920', secondary: '#131112' },
  'tottenham': { primary: '#132257', secondary: '#FFFFFF' },
  'tottenham-hotspur': { primary: '#132257', secondary: '#FFFFFF' },
  'tottenham hotspur': { primary: '#132257', secondary: '#FFFFFF' },
  'spurs': { primary: '#132257', secondary: '#FFFFFF' },
  'west-ham': { primary: '#7A263A', secondary: '#1BB1E7' },
  'west-ham-united': { primary: '#7A263A', secondary: '#1BB1E7' },
  'west ham': { primary: '#7A263A', secondary: '#1BB1E7' },
  'west ham united': { primary: '#7A263A', secondary: '#1BB1E7' },
  'wolves': { primary: '#FDB913', secondary: '#231F20' },
  'wolverhampton': { primary: '#FDB913', secondary: '#231F20' },
  'wolverhampton-wanderers': { primary: '#FDB913', secondary: '#231F20' },

  // ── SPANISH LA LIGA ──
  'real-madrid': { primary: '#00529F', secondary: '#FEBE10' },
  'real madrid': { primary: '#00529F', secondary: '#FEBE10' },
  'barcelona': { primary: '#004D98', secondary: '#A50044' },
  'fc-barcelona': { primary: '#004D98', secondary: '#A50044' },
  'fc barcelona': { primary: '#004D98', secondary: '#A50044' },
  'atletico-madrid': { primary: '#CB3524', secondary: '#272E61' },
  'atletico madrid': { primary: '#CB3524', secondary: '#272E61' },
  'athletic-club': { primary: '#EE2524', secondary: '#000000' },
  'athletic club': { primary: '#EE2524', secondary: '#000000' },
  'athletic-bilbao': { primary: '#EE2524', secondary: '#000000' },
  'villarreal': { primary: '#FFE600', secondary: '#00529F' },
  'real-sociedad': { primary: '#0067B1', secondary: '#FFFFFF' },
  'real sociedad': { primary: '#0067B1', secondary: '#FFFFFF' },
  'real-betis': { primary: '#0BB364', secondary: '#000000' },
  'real betis': { primary: '#0BB364', secondary: '#000000' },
  'betis': { primary: '#0BB364', secondary: '#000000' },
  'sevilla': { primary: '#D4001F', secondary: '#FFFFFF' },
  'girona': { primary: '#CD1318', secondary: '#FFFFFF' },
  'valencia': { primary: '#FF7300', secondary: '#000000' },
  'celta-vigo': { primary: '#8AC3EE', secondary: '#C8102E' },
  'celta vigo': { primary: '#8AC3EE', secondary: '#C8102E' },
  'celta': { primary: '#8AC3EE', secondary: '#C8102E' },
  'osasuna': { primary: '#0A1D37', secondary: '#D91A2A' },
  'mallorca': { primary: '#E20613', secondary: '#000000' },
  'rayo-vallecano': { primary: '#E52320', secondary: '#FFFFFF' },
  'rayo vallecano': { primary: '#E52320', secondary: '#FFFFFF' },
  'las-palmas': { primary: '#FEE100', secondary: '#00529F' },
  'las palmas': { primary: '#FEE100', secondary: '#00529F' },
  'getafe': { primary: '#00539F', secondary: '#D50000' },
  'espanyol': { primary: '#007FC8', secondary: '#ED1C24' },
  'rcd-espanyol': { primary: '#007FC8', secondary: '#ED1C24' },
  'rcd espanyol': { primary: '#007FC8', secondary: '#ED1C24' },
  'alaves': { primary: '#005BA6', secondary: '#FFFFFF' },
  'deportivo-alaves': { primary: '#005BA6', secondary: '#FFFFFF' },
  'leganes': { primary: '#0055A5', secondary: '#FFFFFF' },
  'valladolid': { primary: '#5B2C6F', secondary: '#FFFFFF' },
  'real-valladolid': { primary: '#5B2C6F', secondary: '#FFFFFF' },

  // ── ITALIAN SERIE A ──
  'inter': { primary: '#010E80', secondary: '#000000' },
  'inter-milan': { primary: '#010E80', secondary: '#000000' },
  'inter milan': { primary: '#010E80', secondary: '#000000' },
  'internazionale': { primary: '#010E80', secondary: '#000000' },
  'ac-milan': { primary: '#FB090B', secondary: '#000000' },
  'ac milan': { primary: '#FB090B', secondary: '#000000' },
  'milan': { primary: '#FB090B', secondary: '#000000' },
  'juventus': { primary: '#1A1A1A', secondary: '#D4AF37' },
  'napoli': { primary: '#12A0D7', secondary: '#FFFFFF' },
  'roma': { primary: '#8E1F2F', secondary: '#F1A80A' },
  'as-roma': { primary: '#8E1F2F', secondary: '#F1A80A' },
  'as roma': { primary: '#8E1F2F', secondary: '#F1A80A' },
  'lazio': { primary: '#87D8F7', secondary: '#002F6C' },
  'ss-lazio': { primary: '#87D8F7', secondary: '#002F6C' },
  'ss lazio': { primary: '#87D8F7', secondary: '#002F6C' },
  'atalanta': { primary: '#1E71B8', secondary: '#000000' },
  'fiorentina': { primary: '#4F2683', secondary: '#FFFFFF' },
  'bologna': { primary: '#1B2845', secondary: '#A71930' },
  'torino': { primary: '#8A1B2D', secondary: '#FFFFFF' },
  'como': { primary: '#0047AB', secondary: '#FFFFFF' },
  'cagliari': { primary: '#A30026', secondary: '#002855' },
  'lecce': { primary: '#D41E26', secondary: '#F2D335' },
  'parma': { primary: '#F7D000', secondary: '#0033A0' },
  'udinese': { primary: '#1A1A1A', secondary: '#FFFFFF' },
  'verona': { primary: '#FEE100', secondary: '#002F6C' },
  'hellas-verona': { primary: '#FEE100', secondary: '#002F6C' },
  'genoa': { primary: '#A71930', secondary: '#002855' },
  'empoli': { primary: '#005CA9', secondary: '#FFFFFF' },
  'monza': { primary: '#E30613', secondary: '#FFFFFF' },
  'venezia': { primary: '#006543', secondary: '#DF7A00' },

  // ── GERMAN BUNDESLIGA ──
  'bayern': { primary: '#DC052D', secondary: '#0066B2' },
  'bayern-munich': { primary: '#DC052D', secondary: '#0066B2' },
  'bayern munich': { primary: '#DC052D', secondary: '#0066B2' },
  'fc-bayern': { primary: '#DC052D', secondary: '#0066B2' },
  'dortmund': { primary: '#FDE100', secondary: '#000000' },
  'borussia-dortmund': { primary: '#FDE100', secondary: '#000000' },
  'borussia dortmund': { primary: '#FDE100', secondary: '#000000' },
  'leverkusen': { primary: '#E32221', secondary: '#000000' },
  'bayer-leverkusen': { primary: '#E32221', secondary: '#000000' },
  'bayer leverkusen': { primary: '#E32221', secondary: '#000000' },
  'leipzig': { primary: '#DD0741', secondary: '#0C2340' },
  'rb-leipzig': { primary: '#DD0741', secondary: '#0C2340' },
  'rb leipzig': { primary: '#DD0741', secondary: '#0C2340' },
  'frankfurt': { primary: '#E1000F', secondary: '#000000' },
  'eintracht-frankfurt': { primary: '#E1000F', secondary: '#000000' },
  'eintracht frankfurt': { primary: '#E1000F', secondary: '#000000' },
  'stuttgart': { primary: '#E32219', secondary: '#FFFFFF' },
  'vfb-stuttgart': { primary: '#E32219', secondary: '#FFFFFF' },
  'monchengladbach': { primary: '#169B43', secondary: '#000000' },
  'borussia-monchengladbach': { primary: '#169B43', secondary: '#000000' },
  'wolfsburg': { primary: '#65B32E', secondary: '#FFFFFF' },
  'vfl-wolfsburg': { primary: '#65B32E', secondary: '#FFFFFF' },
  'bremen': { primary: '#1D9053', secondary: '#FFFFFF' },
  'werder-bremen': { primary: '#1D9053', secondary: '#FFFFFF' },
  'koln': { primary: '#ED1C24', secondary: '#FFFFFF' },
  'cologne': { primary: '#ED1C24', secondary: '#FFFFFF' },
  '1-fc-koln': { primary: '#ED1C24', secondary: '#FFFFFF' },
  'fc-cologne': { primary: '#ED1C24', secondary: '#FFFFFF' },
  'freiburg': { primary: '#D11919', secondary: '#000000' },
  'sc-freiburg': { primary: '#D11919', secondary: '#000000' },
  'mainz': { primary: '#C3141E', secondary: '#FFFFFF' },
  'fsv-mainz': { primary: '#C3141E', secondary: '#FFFFFF' },
  'union-berlin': { primary: '#EB1923', secondary: '#FDE100' },
  'union berlin': { primary: '#EB1923', secondary: '#FDE100' },
  'hoffenheim': { primary: '#1961AC', secondary: '#FFFFFF' },
  'tsg-hoffenheim': { primary: '#1961AC', secondary: '#FFFFFF' },
  'augsburg': { primary: '#BA3733', secondary: '#006241' },
  'bochum': { primary: '#005CA9', secondary: '#FFFFFF' },
  'heidenheim': { primary: '#E30613', secondary: '#003399' },
  'st-pauli': { primary: '#6A432D', secondary: '#FFFFFF' },
  'holstein-kiel': { primary: '#0055A5', secondary: '#ED1C24' },

  // ── FRENCH LIGUE 1 ──
  'psg': { primary: '#004170', secondary: '#DA291C' },
  'paris-saint-germain': { primary: '#004170', secondary: '#DA291C' },
  'paris saint-germain': { primary: '#004170', secondary: '#DA291C' },
  'paris-sg': { primary: '#004170', secondary: '#DA291C' },
  'marseille': { primary: '#2FAEE0', secondary: '#FFFFFF' },
  'olympique-de-marseille': { primary: '#2FAEE0', secondary: '#FFFFFF' },
  'monaco': { primary: '#E2001A', secondary: '#D4AF37' },
  'as-monaco': { primary: '#E2001A', secondary: '#D4AF37' },
  'lyon': { primary: '#1B449C', secondary: '#DA291C' },
  'olympique-lyonnais': { primary: '#1B449C', secondary: '#DA291C' },
  'lille': { primary: '#D71920', secondary: '#1B2C5C' },
  'losc-lille': { primary: '#D71920', secondary: '#1B2C5C' },
  'nice': { primary: '#E2001A', secondary: '#000000' },
  'ogc-nice': { primary: '#E2001A', secondary: '#000000' },
  'lens': { primary: '#EC1C24', secondary: '#FFF200' },
  'rc-lens': { primary: '#EC1C24', secondary: '#FFF200' },
  'rennes': { primary: '#E30613', secondary: '#000000' },
  'stade-rennais': { primary: '#E30613', secondary: '#000000' },
  'strasbourg': { primary: '#009FE3', secondary: '#FFFFFF' },
  'rc-strasbourg': { primary: '#009FE3', secondary: '#FFFFFF' },
  'toulouse': { primary: '#492B7C', secondary: '#FFFFFF' },
  'le-havre': { primary: '#7EC2E8', secondary: '#002B49' },
  'le havre': { primary: '#7EC2E8', secondary: '#002B49' },
  'le-havre-ac': { primary: '#7EC2E8', secondary: '#002B49' },
  'troyes': { primary: '#0055A5', secondary: '#FFFFFF' },
  'nantes': { primary: '#FCDB00', secondary: '#008C44' },
  'montpellier': { primary: '#002D62', secondary: '#FF6600' },
  'brest': { primary: '#E30613', secondary: '#FFFFFF' },
  'stade-brestois': { primary: '#E30613', secondary: '#FFFFFF' },
  'reims': { primary: '#E30613', secondary: '#FFFFFF' },
  'stade-de-reims': { primary: '#E30613', secondary: '#FFFFFF' },
  'auxerre': { primary: '#0055A5', secondary: '#FFFFFF' },
  'saint-etienne': { primary: '#008040', secondary: '#FFFFFF' },
  'angers': { primary: '#000000', secondary: '#FFFFFF' },

  // ── OTHER EUROPEAN / INTERNATIONAL ──
  'ajax': { primary: '#D2122E', secondary: '#FFFFFF' },
  'benfica': { primary: '#E81B23', secondary: '#FFFFFF' },
  'porto': { primary: '#003882', secondary: '#FFFFFF' },
  'sporting': { primary: '#008050', secondary: '#FFFFFF' },
  'sporting-cp': { primary: '#008050', secondary: '#FFFFFF' },
  'sporting cp': { primary: '#008050', secondary: '#FFFFFF' },
  'feyenoord': { primary: '#E30613', secondary: '#000000' },
  'psv': { primary: '#ED1C24', secondary: '#FFFFFF' },
  'celtic': { primary: '#018749', secondary: '#FFFFFF' },
  'rangers': { primary: '#0033A0', secondary: '#D91A2A' },
  'galatasaray': { primary: '#A90432', secondary: '#FDB913' },
  'fenerbahce': { primary: '#002D72', secondary: '#FDE100' },
  'besiktas': { primary: '#000000', secondary: '#FFFFFF' },
  'al-nassr': { primary: '#FEE100', secondary: '#003399' },
  'al-hilal': { primary: '#00529F', secondary: '#FFFFFF' },
  'inter-miami': { primary: '#F7B5CD', secondary: '#231F20' },
  'inter miami': { primary: '#F7B5CD', secondary: '#231F20' },

  // ── NBA BASKETBALL ──
  'lakers': { primary: '#552583', secondary: '#FDB927' },
  'warriors': { primary: '#1D428A', secondary: '#FFC72C' },
  'celtics': { primary: '#007A33', secondary: '#BA9653' },
  'bulls': { primary: '#CE1141', secondary: '#000000' },
  'heat': { primary: '#98002E', secondary: '#F9A01B' },
  'knicks': { primary: '#006BB6', secondary: '#F58426' },
  'mavericks': { primary: '#00538C', secondary: '#002B5E' },
  '76ers': { primary: '#006BB6', secondary: '#ED174C' },
  'suns': { primary: '#1D1160', secondary: '#E56020' },
  'bucks': { primary: '#00471B', secondary: '#EEE1C6' },
  'nuggets': { primary: '#0E2240', secondary: '#FEC524' },
  'clippers': { primary: '#C8102E', secondary: '#1D428A' },
  'nets': { primary: '#000000', secondary: '#FFFFFF' },
  'cavaliers': { primary: '#860038', secondary: '#041E42' },
  'raptors': { primary: '#CE1141', secondary: '#000000' },
  'san antonio spurs': { primary: '#000000', secondary: '#8A8D8F' },
  'san antonio': { primary: '#000000', secondary: '#8A8D8F' },
  'thunder': { primary: '#007AC1', secondary: '#EF3B24' },
  'pacers': { primary: '#002D62', secondary: '#FDBB30' },
  'timberwolves': { primary: '#0C2340', secondary: '#236192' },
  'rockets': { primary: '#CE1141', secondary: '#000000' },
  'hawks': { primary: '#E03A3E', secondary: '#C1D32F' },
  'grizzlies': { primary: '#5D76A9', secondary: '#12173F' },
  'pelicans': { primary: '#0C2340', secondary: '#C8102E' },
  'kings': { primary: '#5A2D81', secondary: '#63727A' },
  'magic': { primary: '#0077C0', secondary: '#C4CED4' },
  'trail-blazers': { primary: '#E03A3E', secondary: '#000000' },
  'trail blazers': { primary: '#E03A3E', secondary: '#000000' },
  'jazz': { primary: '#002B5C', secondary: '#00471B' },
  'wizards': { primary: '#002B5C', secondary: '#E31837' },
  'pistons': { primary: '#1D428A', secondary: '#BEC0C2' },
  'hornets': { primary: '#1D1160', secondary: '#00788C' },

  // ── NFL AMERICAN FOOTBALL ──
  'chiefs': { primary: '#E31837', secondary: '#FFB81C' },
  'kansas-city-chiefs': { primary: '#E31837', secondary: '#FFB81C' },
  'eagles': { primary: '#004C54', secondary: '#A5ACAF' },
  'philadelphia-eagles': { primary: '#004C54', secondary: '#A5ACAF' },
  '49ers': { primary: '#AA0000', secondary: '#B3995D' },
  'san-francisco-49ers': { primary: '#AA0000', secondary: '#B3995D' },
  'cowboys': { primary: '#003594', secondary: '#041E42' },
  'dallas-cowboys': { primary: '#003594', secondary: '#041E42' },
  'ravens': { primary: '#241773', secondary: '#000000' },
  'baltimore-ravens': { primary: '#241773', secondary: '#000000' },
  'bills': { primary: '#00338D', secondary: '#C60C30' },
  'buffalo-bills': { primary: '#00338D', secondary: '#C60C30' },
  'lions': { primary: '#0076B6', secondary: '#B0B7BC' },
  'detroit-lions': { primary: '#0076B6', secondary: '#B0B7BC' },
  'packers': { primary: '#203731', secondary: '#FFB612' },
  'green-bay-packers': { primary: '#203731', secondary: '#FFB612' },
  'dolphins': { primary: '#008E97', secondary: '#FC4C02' },
  'miami-dolphins': { primary: '#008E97', secondary: '#FC4C02' },
  'texans': { primary: '#03202F', secondary: '#A71930' },
  'houston-texans': { primary: '#03202F', secondary: '#A71930' },
  'steelers': { primary: '#FFB612', secondary: '#101820' },
  'seahawks': { primary: '#002244', secondary: '#69BE28' },
  'bengals': { primary: '#FB4F14', secondary: '#000000' },
  'rams': { primary: '#003594', secondary: '#FFA300' },
  'buccaneers': { primary: '#D50A0A', secondary: '#0A0A08' },
  'vikings': { primary: '#4F2683', secondary: '#FFC62F' },
  'broncos': { primary: '#FB4F14', secondary: '#002244' },
  'raiders': { primary: '#000000', secondary: '#A5ACAF' },
  'patriots': { primary: '#002244', secondary: '#C60C30' },
  'chargers': { primary: '#0080C6', secondary: '#FFC20E' },
  'bears': { primary: '#0B162A', secondary: '#C83803' },

  // ── NCAA / COLLEGIATE ──
  'usc': { primary: '#990000', secondary: '#FFC72C' },
  'usc-trojans': { primary: '#990000', secondary: '#FFC72C' },
  'ucla': { primary: '#2D68C4', secondary: '#F2A900' },
  'alabama': { primary: '#9E1B32', secondary: '#FFFFFF' },
  'michigan': { primary: '#00274C', secondary: '#FFCB05' },
  'ohio-state': { primary: '#BB0000', secondary: '#666666' },
  'texas': { primary: '#BF5700', secondary: '#FFFFFF' },
  'georgia': { primary: '#BA0C2F', secondary: '#000000' },
  'notre-dame': { primary: '#0C2340', secondary: '#C99700' },
};

// Rich curated athletic fallback palette for unmapped teams
const ATHLETIC_PALETTE = [
  '#1E3A8A', // Deep Royal Blue
  '#991B1B', // Rich Crimson
  '#065F46', // Emerald Green
  '#581C87', // Royal Purple
  '#831843', // Deep Maroon / Ruby
  '#0E7490', // Ocean Teal
  '#9A3412', // Rust / Burnt Amber
  '#1E293B', // Slate Midnight
  '#0F766E', // Forest Teal
  '#3730A3', // Indigo Navy
  '#854D0E', // Golden Ochre
  '#1C1917', // Onyx Neutral
];

/**
 * Normalizes team name to a canonical slug.
 */
function normalizeTeamKey(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/^(fc|cf|sc|afc|as|ac|rcd|rc|cd|ud|sd|bsc|tsv|vfb|vfl|fsv|spvg)\s+/gi, '')
    .replace(/\s+(fc|cf|sc|afc|club|women|ladies|men|wfc)\b/gi, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Computes deterministic integer hash for arbitrary string seed.
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
 * Measures basic color similarity / collision between two hex colors.
 */
function areColorsColliding(colorA: string, colorB: string): boolean {
  if (colorA.toLowerCase() === colorB.toLowerCase()) return true;

  // Simple RGB Euclidean distance check
  const parseHex = (hex: string) => {
    const c = hex.replace('#', '');
    if (c.length !== 6) return [0, 0, 0];
    return [
      parseInt(c.substring(0, 2), 16),
      parseInt(c.substring(2, 4), 16),
      parseInt(c.substring(4, 6), 16),
    ];
  };

  const [r1, g1, b1] = parseHex(colorA);
  const [r2, g2, b2] = parseHex(colorB);

  const distance = Math.sqrt(
    Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
  );

  // If distance is less than 65, the colors look almost identical on screen
  return distance < 65;
}

/**
 * Resolves the primary and secondary colors for a single team.
 */
export function getTeamColorDefinition(teamName?: string): TeamColorDefinition {
  if (!teamName) {
    return { primary: '#1E1730', secondary: '#7952FC' };
  }

  const rawKey = teamName.toLowerCase().trim();
  const slug = normalizeTeamKey(teamName);

  if (TEAM_COLORS[slug]) {
    return TEAM_COLORS[slug];
  }
  if (TEAM_COLORS[rawKey]) {
    return TEAM_COLORS[rawKey];
  }

  // Search by token boundaries
  const sortedKeys = Object.keys(TEAM_COLORS).sort((a, b) => b.length - a.length);
  for (const k of sortedKeys) {
    if (k.length >= 4 && (slug.includes(k) || rawKey.includes(k))) {
      return TEAM_COLORS[k];
    }
  }

  // Deterministic athletic fallback
  const h = hashString(slug || rawKey);
  const primary = ATHLETIC_PALETTE[h % ATHLETIC_PALETTE.length];
  const secondary = ATHLETIC_PALETTE[(h + 5) % ATHLETIC_PALETTE.length];

  return { primary, secondary };
}

/**
 * Resolves authentic colors for a matchup with automatic collision avoidance.
 * 
 * If the two teams share identical or nearly identical primary brand colors
 * (e.g. Arsenal red vs Liverpool red, or Chelsea blue vs Everton blue),
 * the away team will automatically receive their secondary/away kit color
 * to guarantee that the two halves of the artwork are clearly distinct.
 */
export function getMatchupColors(
  homeTeamName?: string,
  awayTeamName?: string
): { homeColor: string; awayColor: string } {
  const homeDef = getTeamColorDefinition(homeTeamName);
  const awayDef = getTeamColorDefinition(awayTeamName);

  let homeColor = homeDef.primary;
  let awayColor = awayDef.primary;

  // Collision detection
  if (areColorsColliding(homeColor, awayColor)) {
    // Try away team's secondary color if it doesn't collide with home
    if (!areColorsColliding(homeColor, awayDef.secondary)) {
      awayColor = awayDef.secondary;
    } else if (!areColorsColliding(homeDef.secondary, awayColor)) {
      // Or try home team's secondary
      homeColor = homeDef.secondary;
    } else {
      // Offset into athletic palette
      const hash = hashString((awayTeamName || '') + 'away');
      awayColor = ATHLETIC_PALETTE[(hash + 3) % ATHLETIC_PALETTE.length];
    }
  }

  return { homeColor, awayColor };
}

export default getMatchupColors;
