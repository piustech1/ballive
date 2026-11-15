/**
 * BALLIVE Universal Match-Specific Background Resolver
 * 
 * Strict Artwork Authentication Engine:
 * 1. ONLY accepts genuine event-specific match artwork:
 *    - Authentic broadcaster stream promo graphics (e.g. UEFA Nations League, NFL broadcast cards, UFC fight posters).
 *    - Official ESPN event cards (espncdn.com/i/cards, espncdn.com/images/match).
 *    - Clean ondemand.st broadcast artwork.
 * 2. STRICTLY REJECTS:
 *    - Generic stock photos (images.unsplash.com footballs on grass, cleats, aerial pitch diagrams, generic stadium bowls).
 *    - Competition-only logos (Premier League lion, Serie A triangle, LaLiga emblem).
 *    - Automated collage templates with oversized league logos.
 *    - TV channel logos and synthetic fixture cards.
 * 3. HONEST NEUTRAL FALLBACK:
 *    - When genuine event artwork is unavailable, returns NULL.
 *    - The UI renders the approved neutral dark container (#1E1730 with subtle sports gradient) honestly.
 *    - A clean neutral fallback is strictly preferred over fake or generic images.
 */

import { theSportsDbService } from '../services/theSportsDbService';

// Banned generic stock photography IDs
const BANNED_IMAGE_PATTERNS = [
  'unsplash.com',
  'photo-1579952363873-27f3bade9f55',
  'photo-1522778119026-d647f0596c20',
  'photo-1518091043644-c1d4457512c6',
  'photo-1574629810360-7efbbe195018',
  'photo-1556056504-5c7696c4c28d',
  'photo-1489944440615-453fc2b6a9a9',
  'photo-1511886929837-354d827aae26',
  'photo-1431324155629-1a6deb1dec8d',
  'photo-1508098682722-e99c43a406b2',
  'photo-1531415074868-036b1c57e329',
  'tv-logos',
  'sky-sport-',
  'supersport',
];

// Compatibility definitions (now empty for generic stock to prevent misuse)
export const SPORT_ARTWORK_POOLS: Record<string, string[]> = {
  soccer: [],
  football: [],
  basketball: [],
  hockey: [],
  american_football: [],
  nfl: [],
  mma: [],
  ufc: [],
  combat: [],
  boxing: [],
  motorsport: [],
  f1: [],
  tennis: [],
  cricket: [],
  baseball: [],
  other: [],
};

export const SPORT_ARTWORK: Record<string, string> = {};

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
 * Strict validator for genuine, fixture-specific event artwork.
 * Returns true ONLY for authentic broadcaster promo graphics, tournament cards, or official event posters.
 * Strictly rejects generic stock photography, competition logos, TV channel logos, and automated collage templates.
 */
export function isGenuineEventArtwork(rawUrl?: string | null): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const s = rawUrl.trim().toLowerCase();
  if (s.length < 12 || s.includes('null') || s.includes('undefined')) return false;

  // 1. Strictly BAN all Unsplash stock photography (cleats, balls on grass, pitch diagrams, stadium bowls)
  if (s.includes('unsplash.com') || s.includes('images.unsplash.com')) {
    return false;
  }

  // 2. Strictly BAN synthetic fixture generators and placeholders
  if (
    s.includes('dag.s-u.in/img/match') ||
    s.includes('generator') ||
    s.includes('placeholder') ||
    s.includes('default_match')
  ) {
    return false;
  }

  // 3. Strictly BAN TV channel logos masquerading as match artwork
  if (
    s.includes('tv-logos') ||
    s.includes('cdn.jsdelivr.net/gh/tv-logo') ||
    s.includes('sky-sport-bundesliga') ||
    s.includes('sky-sports-') ||
    s.includes('supersport') ||
    s.includes('channel_logo')
  ) {
    return false;
  }

  // 4. Strictly BAN competition-only logos and banners masquerading as match artwork
  if (
    s.endsWith('/premier_league.png') ||
    s.endsWith('/laliga.png') ||
    s.endsWith('/seriea.png') ||
    s.endsWith('/bundesliga.png') ||
    s.endsWith('/ligue1.png') ||
    s.endsWith('/ucl.png') ||
    s.endsWith('/uel.png') ||
    s.includes('competition_logos') ||
    s.includes('league_logos')
  ) {
    return false;
  }

  // 5. Strictly BAN TheSportsDB automated league-branding collage templates
  // (TheSportsDB event thumbs for regular domestic soccer matches consist of automated collages
  // with giant Premier League lions, Serie A badges, or LaLiga emblems between team crests).
  if (s.includes('thesportsdb.com')) {
    if (s.includes('/event/thumb/')) {
      return false;
    }
  }

  // 6. ACCEPT verified broadcaster stream promos, ondemand event graphics, and ESPN event cards
  if (
    s.includes('ondemand.st') ||
    s.includes('espncdn.com/i/cards') ||
    s.includes('espncdn.com/images/match') ||
    s.includes('espncdn.com/photo')
  ) {
    return true;
  }

  // 7. ACCEPT authentic DAG stream promos that wrap real broadcaster graphics
  if (s.includes('dag.s-u.in')) {
    // If it's a DAG proxy pointing to verified promo art
    if (s.includes('url=')) {
      const target = decodeURIComponent(s.split('url=')[1]?.split('&')[0] || '').toLowerCase();
      if (
        target.includes('ondemand.st') ||
        target.includes('espncdn.com') ||
        target.includes('uefa.com') ||
        target.includes('nfl.com') ||
        target.includes('ufc.com')
      ) {
        return true;
      }
      if (
        target.includes('thesportsdb.com') && target.includes('/event/thumb/') ||
        target.includes('unsplash.com') ||
        target.includes('tv-logos')
      ) {
        return false;
      }
    }
    // Verified event promos from DAG catalogs (e.g. Nations League promo cards, UFC fight cards)
    if (
      s.includes('/stream_icon') ||
      s.includes('/event_poster') ||
      s.includes('/poster/') ||
      s.includes('/promo/')
    ) {
      return true;
    }
  }

  // 8. Broadcaster CDN event cards
  if (
    s.includes('akamaihd.net') ||
    s.includes('cloudinary.com') ||
    s.includes('uefa.com') ||
    s.includes('nfl.com') ||
    s.includes('ufc.com') ||
    s.includes('wwe.com')
  ) {
    return true;
  }

  return false;
}

/**
 * Backward compatibility alias for isGenuineEventArtwork
 */
export const isVerifiedEventImage = isGenuineEventArtwork;

/**
 * Cleans server-provided image URLs.
 * If URL is from DAG proxy (`dag.s-u.in/img?url=...`):
 * Strips all baked-in green text (`&text=...`), badges (`&b1=...`), and colors (`&color=...`)
 * returning the clean underlying image.
 */
export function cleanServerArtworkUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (trimmed.length < 12 || trimmed.includes('null') || trimmed.includes('undefined')) {
    return null;
  }

  // Check for banned image patterns
  for (const pattern of BANNED_IMAGE_PATTERNS) {
    if (trimmed.includes(pattern)) return null;
  }

  // If from DAG image proxy, extract the clean target URL
  if (trimmed.includes('dag.s-u.in/img')) {
    const urlMatch = trimmed.match(/[?&]url=([^&]+)/);
    if (urlMatch && urlMatch[1]) {
      const decodedTarget = decodeURIComponent(urlMatch[1]);
      // Check if target has banned patterns
      for (const pattern of BANNED_IMAGE_PATTERNS) {
        if (decodedTarget.includes(pattern)) return null;
      }
      if (decodedTarget.includes('thesportsdb.com') && decodedTarget.includes('/event/thumb/')) {
        return null;
      }
      if (decodedTarget.includes('espncdn.com') || decodedTarget.includes('ondemand.st')) {
        return decodedTarget;
      }
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
 * Normalizes any tournament or competition title into a canonical competition key.
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
 * Resolves genuine, match-specific event artwork.
 * 
 * Rules:
 * 1. Checks server-provided raw image for genuine event artwork.
 * 2. Checks cached positive artwork from TheSportsDB/DAG for genuine event artwork.
 * 3. If genuine artwork is found, returns the verified URL.
 * 4. If no verified event artwork exists, returns NULL.
 *    The UI displays the approved neutral dark stadium theme honestly (#1E1730).
 *    NEVER returns generic soccer stock photography or oversized league templates.
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
): string | null {
  // 1. Check server-provided raw image
  const cleanedServerImage = cleanServerArtworkUrl(rawImage);
  if (cleanedServerImage && isGenuineEventArtwork(cleanedServerImage)) {
    return cleanedServerImage;
  }

  // 2. Check cached positive artwork if available
  if (homeTeam && awayTeam) {
    const tsdbArt = theSportsDbService.getCachedArtwork(homeTeam, awayTeam);
    if (tsdbArt && isGenuineEventArtwork(tsdbArt)) {
      return tsdbArt;
    }
  }

  // 3. Honest Neutral Fallback: Return null when genuine event artwork is unavailable.
  // Card UI renders the approved neutral dark container honestly.
  return null;
}

export default resolveSportBackground;
