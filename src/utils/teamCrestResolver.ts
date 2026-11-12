/**
 * BALLIVE Multi-Sport Team Crest & Badge Image Resolver
 * Centralized mapping associating team identifiers/names with high-resolution CDN assets.
 * Covers Football (Soccer), Basketball (NBA), Hockey (NHL), and generic sports shields.
 */

const CDN_FOOTBALL = 'https://media.api-sports.io/football/teams';
const CDN_NBA = 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard';
const CDN_NHL = 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard';

// Neutral official sports shield placeholder (Never defaults to Arsenal or any specific club)
export const DEFAULT_CREST = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png';

// Authentic high-resolution PNG badges
const CREST_MAP: Record<string, string> = {
  // ── PREMIER LEAGUE ──
  'arsenal': `${CDN_FOOTBALL}/42.png`,
  'aston-villa': `${CDN_FOOTBALL}/66.png`,
  'aston villa': `${CDN_FOOTBALL}/66.png`,
  'bournemouth': `${CDN_FOOTBALL}/35.png`,
  'afc-bournemouth': `${CDN_FOOTBALL}/35.png`,
  'afc bournemouth': `${CDN_FOOTBALL}/35.png`,
  'brentford': `${CDN_FOOTBALL}/55.png`,
  'brighton': `${CDN_FOOTBALL}/51.png`,
  'brighton-and-hove-albion': `${CDN_FOOTBALL}/51.png`,
  'brighton & hove albion': `${CDN_FOOTBALL}/51.png`,
  'chelsea': `${CDN_FOOTBALL}/49.png`,
  'crystal-palace': `${CDN_FOOTBALL}/52.png`,
  'crystal palace': `${CDN_FOOTBALL}/52.png`,
  'everton': `${CDN_FOOTBALL}/45.png`,
  'fulham': `${CDN_FOOTBALL}/36.png`,
  'ipswich': `${CDN_FOOTBALL}/57.png`,
  'ipswich-town': `${CDN_FOOTBALL}/57.png`,
  'ipswich town': `${CDN_FOOTBALL}/57.png`,
  'leicester': `${CDN_FOOTBALL}/46.png`,
  'leicester-city': `${CDN_FOOTBALL}/46.png`,
  'leicester city': `${CDN_FOOTBALL}/46.png`,
  'liverpool': `${CDN_FOOTBALL}/40.png`,
  'man-city': `${CDN_FOOTBALL}/50.png`,
  'manchester-city': `${CDN_FOOTBALL}/50.png`,
  'manchester city': `${CDN_FOOTBALL}/50.png`,
  'man-city-fc': `${CDN_FOOTBALL}/50.png`,
  'man-utd': `${CDN_FOOTBALL}/33.png`,
  'manchester-united': `${CDN_FOOTBALL}/33.png`,
  'manchester united': `${CDN_FOOTBALL}/33.png`,
  'newcastle': `${CDN_FOOTBALL}/34.png`,
  'newcastle-united': `${CDN_FOOTBALL}/34.png`,
  'newcastle united': `${CDN_FOOTBALL}/34.png`,
  'nottingham-forest': `${CDN_FOOTBALL}/65.png`,
  'nottingham forest': `${CDN_FOOTBALL}/65.png`,
  'southampton': `${CDN_FOOTBALL}/41.png`,
  'tottenham': `${CDN_FOOTBALL}/47.png`,
  'tottenham-hotspur': `${CDN_FOOTBALL}/47.png`,
  'tottenham hotspur': `${CDN_FOOTBALL}/47.png`,
  'spurs': `${CDN_FOOTBALL}/47.png`,
  'west-ham': `${CDN_FOOTBALL}/48.png`,
  'west-ham-united': `${CDN_FOOTBALL}/48.png`,
  'west ham': `${CDN_FOOTBALL}/48.png`,
  'west ham united': `${CDN_FOOTBALL}/48.png`,
  'wolves': `${CDN_FOOTBALL}/39.png`,
  'wolverhampton': `${CDN_FOOTBALL}/39.png`,
  'wolverhampton-wanderers': `${CDN_FOOTBALL}/39.png`,

  // ── LALIGA ──
  'real-madrid': `${CDN_FOOTBALL}/541.png`,
  'real madrid': `${CDN_FOOTBALL}/541.png`,
  'barcelona': `${CDN_FOOTBALL}/529.png`,
  'fc-barcelona': `${CDN_FOOTBALL}/529.png`,
  'fc barcelona': `${CDN_FOOTBALL}/529.png`,
  'atletico-madrid': `${CDN_FOOTBALL}/530.png`,
  'atletico madrid': `${CDN_FOOTBALL}/530.png`,
  'athletic-club': `${CDN_FOOTBALL}/531.png`,
  'athletic club': `${CDN_FOOTBALL}/531.png`,
  'athletic-bilbao': `${CDN_FOOTBALL}/531.png`,
  'villarreal': `${CDN_FOOTBALL}/533.png`,
  'real-sociedad': `${CDN_FOOTBALL}/548.png`,
  'real sociedad': `${CDN_FOOTBALL}/548.png`,
  'real-betis': `${CDN_FOOTBALL}/543.png`,
  'real betis': `${CDN_FOOTBALL}/543.png`,
  'betis': `${CDN_FOOTBALL}/543.png`,
  'sevilla': `${CDN_FOOTBALL}/536.png`,
  'girona': `${CDN_FOOTBALL}/547.png`,
  'valencia': `${CDN_FOOTBALL}/532.png`,
  'celta-vigo': `${CDN_FOOTBALL}/538.png`,
  'celta vigo': `${CDN_FOOTBALL}/538.png`,
  'celta': `${CDN_FOOTBALL}/538.png`,
  'osasuna': `${CDN_FOOTBALL}/727.png`,
  'mallorca': `${CDN_FOOTBALL}/798.png`,
  'rayo-vallecano': `${CDN_FOOTBALL}/728.png`,
  'rayo vallecano': `${CDN_FOOTBALL}/728.png`,
  'las-palmas': `${CDN_FOOTBALL}/534.png`,
  'las palmas': `${CDN_FOOTBALL}/534.png`,
  'getafe': `${CDN_FOOTBALL}/546.png`,
  'espanyol': `${CDN_FOOTBALL}/540.png`,
  'alaves': `${CDN_FOOTBALL}/542.png`,
  'deportivo-alaves': `${CDN_FOOTBALL}/542.png`,
  'leganes': `${CDN_FOOTBALL}/545.png`,
  'valladolid': `${CDN_FOOTBALL}/720.png`,
  'real-valladolid': `${CDN_FOOTBALL}/720.png`,

  // ── BUNDESLIGA ──
  'bayern': `${CDN_FOOTBALL}/157.png`,
  'bayern-munich': `${CDN_FOOTBALL}/157.png`,
  'bayern munich': `${CDN_FOOTBALL}/157.png`,
  'bayer-leverkusen': `${CDN_FOOTBALL}/168.png`,
  'bayer leverkusen': `${CDN_FOOTBALL}/168.png`,
  'leverkusen': `${CDN_FOOTBALL}/168.png`,
  'dortmund': `${CDN_FOOTBALL}/165.png`,
  'borussia-dortmund': `${CDN_FOOTBALL}/165.png`,
  'borussia dortmund': `${CDN_FOOTBALL}/165.png`,
  'rb-leipzig': `${CDN_FOOTBALL}/173.png`,
  'rb leipzig': `${CDN_FOOTBALL}/173.png`,
  'eintracht-frankfurt': `${CDN_FOOTBALL}/169.png`,
  'eintracht frankfurt': `${CDN_FOOTBALL}/169.png`,
  'frankfurt': `${CDN_FOOTBALL}/169.png`,
  'stuttgart': `${CDN_FOOTBALL}/172.png`,
  'vfb-stuttgart': `${CDN_FOOTBALL}/172.png`,

  // ── SERIE A ──
  'inter': `${CDN_FOOTBALL}/505.png`,
  'inter-milan': `${CDN_FOOTBALL}/505.png`,
  'inter milan': `${CDN_FOOTBALL}/505.png`,
  'milan': `${CDN_FOOTBALL}/489.png`,
  'ac-milan': `${CDN_FOOTBALL}/489.png`,
  'ac milan': `${CDN_FOOTBALL}/489.png`,
  'juventus': `${CDN_FOOTBALL}/496.png`,
  'napoli': `${CDN_FOOTBALL}/492.png`,
  'atalanta': `${CDN_FOOTBALL}/499.png`,
  'fiorentina': `${CDN_FOOTBALL}/502.png`,
  'lazio': `${CDN_FOOTBALL}/487.png`,
  'roma': `${CDN_FOOTBALL}/497.png`,
  'as-roma': `${CDN_FOOTBALL}/497.png`,

  // ── LIGUE 1 & EUROPEAN ELITE ──
  'psg': `${CDN_FOOTBALL}/85.png`,
  'paris-saint-germain': `${CDN_FOOTBALL}/85.png`,
  'paris saint-germain': `${CDN_FOOTBALL}/85.png`,
  'sporting-cp': `${CDN_FOOTBALL}/228.png`,
  'sporting cp': `${CDN_FOOTBALL}/228.png`,
  'monaco': `${CDN_FOOTBALL}/91.png`,
  'as-monaco': `${CDN_FOOTBALL}/91.png`,
  'brest': `${CDN_FOOTBALL}/106.png`,
  'stade-brestois-29': `${CDN_FOOTBALL}/106.png`,
  'benfica': `${CDN_FOOTBALL}/211.png`,
  'porto': `${CDN_FOOTBALL}/212.png`,
  'ajax': `${CDN_FOOTBALL}/194.png`,
  'feyenoord': `${CDN_FOOTBALL}/197.png`,
  'psv': `${CDN_FOOTBALL}/197.png`,

  // ── NBA BASKETBALL (30 TEAMS) ──
  'atlanta-hawks': `${CDN_NBA}/atl.png`,
  'hawks': `${CDN_NBA}/atl.png`,
  'boston-celtics': `${CDN_NBA}/bos.png`,
  'celtics': `${CDN_NBA}/bos.png`,
  'brooklyn-nets': `${CDN_NBA}/bkn.png`,
  'nets': `${CDN_NBA}/bkn.png`,
  'charlotte-hornets': `${CDN_NBA}/cha.png`,
  'hornets': `${CDN_NBA}/cha.png`,
  'chicago-bulls': `${CDN_NBA}/chi.png`,
  'bulls': `${CDN_NBA}/chi.png`,
  'cleveland-cavaliers': `${CDN_NBA}/cle.png`,
  'cavaliers': `${CDN_NBA}/cle.png`,
  'cavs': `${CDN_NBA}/cle.png`,
  'dallas-mavericks': `${CDN_NBA}/dal.png`,
  'mavericks': `${CDN_NBA}/dal.png`,
  'mavs': `${CDN_NBA}/dal.png`,
  'denver-nuggets': `${CDN_NBA}/den.png`,
  'nuggets': `${CDN_NBA}/den.png`,
  'detroit-pistons': `${CDN_NBA}/det.png`,
  'pistons': `${CDN_NBA}/det.png`,
  'golden-state-warriors': `${CDN_NBA}/gsw.png`,
  'warriors': `${CDN_NBA}/gsw.png`,
  'houston-rockets': `${CDN_NBA}/hou.png`,
  'rockets': `${CDN_NBA}/hou.png`,
  'indiana-pacers': `${CDN_NBA}/ind.png`,
  'pacers': `${CDN_NBA}/ind.png`,
  'la-clippers': `${CDN_NBA}/lac.png`,
  'los-angeles-clippers': `${CDN_NBA}/lac.png`,
  'clippers': `${CDN_NBA}/lac.png`,
  'los-angeles-lakers': `${CDN_NBA}/lal.png`,
  'la-lakers': `${CDN_NBA}/lal.png`,
  'lakers': `${CDN_NBA}/lal.png`,
  'memphis-grizzlies': `${CDN_NBA}/mem.png`,
  'grizzlies': `${CDN_NBA}/mem.png`,
  'miami-heat': `${CDN_NBA}/mia.png`,
  'heat': `${CDN_NBA}/mia.png`,
  'milwaukee-bucks': `${CDN_NBA}/mil.png`,
  'bucks': `${CDN_NBA}/mil.png`,
  'minnesota-timberwolves': `${CDN_NBA}/min.png`,
  'timberwolves': `${CDN_NBA}/min.png`,
  'wolves-nba': `${CDN_NBA}/min.png`,
  'new-orleans-pelicans': `${CDN_NBA}/nop.png`,
  'pelicans': `${CDN_NBA}/nop.png`,
  'new-york-knicks': `${CDN_NBA}/nyk.png`,
  'knicks': `${CDN_NBA}/nyk.png`,
  'oklahoma-city-thunder': `${CDN_NBA}/okc.png`,
  'thunder': `${CDN_NBA}/okc.png`,
  'orlando-magic': `${CDN_NBA}/orl.png`,
  'magic': `${CDN_NBA}/orl.png`,
  'philadelphia-76ers': `${CDN_NBA}/phi.png`,
  '76ers': `${CDN_NBA}/phi.png`,
  'sixers': `${CDN_NBA}/phi.png`,
  'phoenix-suns': `${CDN_NBA}/phx.png`,
  'suns': `${CDN_NBA}/phx.png`,
  'portland-trail-blazers': `${CDN_NBA}/por.png`,
  'trail-blazers': `${CDN_NBA}/por.png`,
  'blazers': `${CDN_NBA}/por.png`,
  'sacramento-kings': `${CDN_NBA}/sac.png`,
  'kings-nba': `${CDN_NBA}/sac.png`,
  'san-antonio-spurs': `${CDN_NBA}/sas.png`,
  'spurs-nba': `${CDN_NBA}/sas.png`,
  'toronto-raptors': `${CDN_NBA}/tor.png`,
  'raptors': `${CDN_NBA}/tor.png`,
  'utah-jazz': `${CDN_NBA}/uta.png`,
  'jazz': `${CDN_NBA}/uta.png`,
  'washington-wizards': `${CDN_NBA}/was.png`,
  'wizards': `${CDN_NBA}/was.png`,

  // ── NHL HOCKEY (32 TEAMS) ──
  'anaheim-ducks': `${CDN_NHL}/ana.png`,
  'ducks': `${CDN_NHL}/ana.png`,
  'boston-bruins': `${CDN_NHL}/bos.png`,
  'bruins': `${CDN_NHL}/bos.png`,
  'buffalo-sabres': `${CDN_NHL}/buf.png`,
  'sabres': `${CDN_NHL}/buf.png`,
  'calgary-flames': `${CDN_NHL}/cgy.png`,
  'flames': `${CDN_NHL}/cgy.png`,
  'carolina-hurricanes': `${CDN_NHL}/car.png`,
  'hurricanes': `${CDN_NHL}/car.png`,
  'canes': `${CDN_NHL}/car.png`,
  'chicago-blackhawks': `${CDN_NHL}/chi.png`,
  'blackhawks': `${CDN_NHL}/chi.png`,
  'colorado-avalanche': `${CDN_NHL}/col.png`,
  'avalanche': `${CDN_NHL}/col.png`,
  'columbus-blue-jackets': `${CDN_NHL}/cbj.png`,
  'blue-jackets': `${CDN_NHL}/cbj.png`,
  'dallas-stars': `${CDN_NHL}/dal.png`,
  'stars': `${CDN_NHL}/dal.png`,
  'detroit-red-wings': `${CDN_NHL}/det.png`,
  'red-wings': `${CDN_NHL}/det.png`,
  'edmonton-oilers': `${CDN_NHL}/edm.png`,
  'oilers': `${CDN_NHL}/edm.png`,
  'florida-panthers': `${CDN_NHL}/fla.png`,
  'panthers': `${CDN_NHL}/fla.png`,
  'los-angeles-kings': `${CDN_NHL}/la.png`,
  'la-kings': `${CDN_NHL}/la.png`,
  'minnesota-wild': `${CDN_NHL}/min.png`,
  'wild': `${CDN_NHL}/min.png`,
  'montreal-canadiens': `${CDN_NHL}/mtl.png`,
  'canadiens': `${CDN_NHL}/mtl.png`,
  'habs': `${CDN_NHL}/mtl.png`,
  'nashville-predators': `${CDN_NHL}/nsh.png`,
  'predators': `${CDN_NHL}/nsh.png`,
  'new-jersey-devils': `${CDN_NHL}/nj.png`,
  'devils': `${CDN_NHL}/nj.png`,
  'new-york-islanders': `${CDN_NHL}/nyi.png`,
  'islanders': `${CDN_NHL}/nyi.png`,
  'new-york-rangers': `${CDN_NHL}/nyr.png`,
  'rangers': `${CDN_NHL}/nyr.png`,
  'ottawa-senators': `${CDN_NHL}/ott.png`,
  'senators': `${CDN_NHL}/ott.png`,
  'philadelphia-flyers': `${CDN_NHL}/phi.png`,
  'flyers': `${CDN_NHL}/phi.png`,
  'pittsburgh-penguins': `${CDN_NHL}/pit.png`,
  'penguins': `${CDN_NHL}/pit.png`,
  'san-jose-sharks': `${CDN_NHL}/sj.png`,
  'sharks': `${CDN_NHL}/sj.png`,
  'seattle-kraken': `${CDN_NHL}/sea.png`,
  'kraken': `${CDN_NHL}/sea.png`,
  'st-louis-blues': `${CDN_NHL}/stl.png`,
  'blues': `${CDN_NHL}/stl.png`,
  'tampa-bay-lightning': `${CDN_NHL}/tb.png`,
  'lightning': `${CDN_NHL}/tb.png`,
  'bolts': `${CDN_NHL}/tb.png`,
  'toronto-maple-leafs': `${CDN_NHL}/tor.png`,
  'maple-leafs': `${CDN_NHL}/tor.png`,
  'leafs': `${CDN_NHL}/tor.png`,
  'utah-hockey-club': `${CDN_NHL}/uta.png`,
  'vancouver-canucks': `${CDN_NHL}/van.png`,
  'canucks': `${CDN_NHL}/van.png`,
  'vegas-golden-knights': `${CDN_NHL}/vgs.png`,
  'golden-knights': `${CDN_NHL}/vgs.png`,
  'washington-capitals': `${CDN_NHL}/wsh.png`,
  'capitals': `${CDN_NHL}/wsh.png`,
  'caps': `${CDN_NHL}/wsh.png`,
  'winnipeg-jets': `${CDN_NHL}/wpg.png`,
  'jets': `${CDN_NHL}/wpg.png`,
};

/**
 * Resolves a team identifier or natural club name to an authentic CDN badge URL.
 * Falls back to an authentic neutral sports shield emblem when unmatched.
 */
export function getTeamCrest(teamIdentifierOrName?: string | null): string {
  if (!teamIdentifierOrName || typeof teamIdentifierOrName !== 'string') {
    return DEFAULT_CREST;
  }

  const raw = teamIdentifierOrName.trim();
  if (!raw || raw.toLowerCase() === 'opponent' || raw.toLowerCase().includes('live 24/7')) {
    return DEFAULT_CREST;
  }

  // Direct exact match
  if (CREST_MAP[raw]) {
    return CREST_MAP[raw];
  }

  // Normalized match: lowercase, replace spaces & non-alphanumeric with hyphen
  const normalized = raw
    .toLowerCase()
    .replace(/['.]+/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-');

  if (CREST_MAP[normalized]) {
    return CREST_MAP[normalized];
  }

  // Search by normalized word boundaries (longest key first)
  const sortedKeys = Object.keys(CREST_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (key.length >= 4) {
      if (normalized.includes(key)) {
        return CREST_MAP[key];
      }
    }
  }

  return DEFAULT_CREST;
}

export default getTeamCrest;
