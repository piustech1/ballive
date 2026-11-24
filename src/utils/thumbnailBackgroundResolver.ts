import { ImageSourcePropType } from 'react-native';

/**
 * BALLIVE Dedicated League & Sport Fallback Thumbnail Resolver
 * 
 * Provides authentic, high-resolution background artwork for major competitions and sports.
 * Strictly used as fallbacks when genuine match-specific broadcast or event thumbnails are unavailable.
 */

export const LEAGUE_THUMBNAILS: Record<string, ImageSourcePropType> = {
  premier_league: require('../../assets/images/thumbnails/premier_league.jpg'),
  laliga: require('../../assets/images/thumbnails/laliga.png'),
  bundesliga: require('../../assets/images/thumbnails/bundesliga.png'),
  champions_league: require('../../assets/images/thumbnails/champions_league.jpg'),
  europa_league: require('../../assets/images/thumbnails/europa_league.jpg'),
  conference_league: require('../../assets/images/thumbnails/conference_league.jpg'),
  football_general: require('../../assets/images/thumbnails/football_general.jpg'),
  ligue1: require('../../assets/images/thumbnails/ligue1.jpg'),
  saudi_pro: require('../../assets/images/thumbnails/saudi_pro.webp'),
  efl: require('../../assets/images/thumbnails/efl.png'),
  mls: require('../../assets/images/thumbnails/mls.jpg'),
  nba: require('../../assets/images/thumbnails/nba.webp'),
  hockey: require('../../assets/images/thumbnails/hockey.jpg'),
};

export type LeagueThumbnailKey = keyof typeof LEAGUE_THUMBNAILS;

/**
 * Identifies the appropriate league-specific fallback background artwork key
 * based on stable competition IDs and normalized competition strings.
 */
export function getLeagueThumbnailKey(
  competition?: string | null,
  sport?: string | null
): LeagueThumbnailKey {
  const comp = (competition || '').toLowerCase().trim();
  const sp = (sport || '').toLowerCase().trim();

  // 1. Basketball / NBA
  if (
    sp === 'basketball' ||
    comp.includes('nba') ||
    comp === 'national basketball association'
  ) {
    return 'nba';
  }

  // 2. Ice Hockey / NHL
  if (
    sp === 'hockey' ||
    sp === 'ice_hockey' ||
    comp.includes('nhl') ||
    comp.includes('stanley cup')
  ) {
    return 'hockey';
  }

  // 3. UEFA Conference League (must check before Europa League to avoid substring collision)
  if (
    comp.includes('conference') ||
    comp.includes('uecl') ||
    comp.includes('europa.conf') ||
    comp.includes('europa conference')
  ) {
    return 'conference_league';
  }

  // 4. UEFA Champions League
  if (
    comp.includes('champions league') ||
    comp.includes('ucl') ||
    comp.includes('uefa.champions') ||
    comp === 'champions'
  ) {
    return 'champions_league';
  }

  // 5. UEFA Europa League
  if (
    comp.includes('europa league') ||
    comp.includes('uel') ||
    comp.includes('uefa.europa') ||
    comp === 'europa'
  ) {
    return 'europa_league';
  }

  // 6. Premier League
  if (
    comp.includes('premier league') ||
    comp.includes('epl') ||
    comp.includes('eng.1') ||
    comp === 'premier-league' ||
    comp.includes('english premier')
  ) {
    return 'premier_league';
  }

  // 7. LaLiga
  if (
    comp.includes('laliga') ||
    comp.includes('la liga') ||
    comp.includes('esp.1') ||
    comp.includes('primera division') ||
    comp.includes('spain - la liga')
  ) {
    return 'laliga';
  }

  // 8. Bundesliga
  if (
    comp.includes('bundesliga') ||
    comp.includes('ger.1') ||
    comp.includes('german bundesliga')
  ) {
    return 'bundesliga';
  }

  // 9. Ligue 1
  if (
    comp.includes('ligue 1') ||
    comp.includes('ligue1') ||
    comp.includes('fra.1') ||
    comp.includes('french ligue')
  ) {
    return 'ligue1';
  }

  // 10. Saudi Pro League (strictly separate from Saudi First Division)
  if (
    (comp.includes('saudi pro') || comp.includes('ksa.1') || comp.includes('roshn') || comp.includes('spl') ||
     (comp.includes('saudi') && !comp.includes('first') && !comp.includes('yelo') && !comp.includes('division') && !comp.includes('1st')))
  ) {
    return 'saudi_pro';
  }

  // 11. EFL Championship
  if (
    comp.includes('championship') ||
    comp.includes('efl') ||
    comp.includes('eng.2')
  ) {
    return 'efl';
  }

  // 12. Major League Soccer (MLS)
  if (
    comp.includes('mls') ||
    comp.includes('major league soccer') ||
    comp.includes('usa.1')
  ) {
    return 'mls';
  }

  // 13. Default for all other / unidentified football competitions
  return 'football_general';
}

/**
 * Returns the resolved ImageSourcePropType for the given competition/sport fallback background.
 */
export function resolveThumbnailBackground(
  competition?: string | null,
  sport?: string | null
): ImageSourcePropType {
  const key = getLeagueThumbnailKey(competition, sport);
  return LEAGUE_THUMBNAILS[key] || LEAGUE_THUMBNAILS.football_general;
}

export default resolveThumbnailBackground;
