import { ImageSourcePropType } from 'react-native';

/**
 * BALLIVE Dedicated League & Sport Fallback Thumbnail Resolver
 *
 * Provides authentic, high-resolution background artwork for major competitions and sports.
 * Specific competitions always resolve BEFORE broad sport fallbacks (so EuroLeague, DEL,
 * Austrian ICE Hockey League, Russia MHL, HockeyAllsvenskan, AFC Champions League,
 * Argentina LPF, Liga MX, and Ukrainian Premier League never collapse to NBA/NHL/EPL/UCL).
 */

export const LEAGUE_THUMBNAILS: Record<string, ImageSourcePropType> = {
  premier_league: require('../../assets/images/thumbnails/premier_league.jpg'),
  laliga: require('../../assets/images/thumbnails/laliga.png'),
  bundesliga: require('../../assets/images/thumbnails/bundesliga.png'),
  champions_league: require('../../assets/images/thumbnails/champions_league.jpg'),
  europa_league: require('../../assets/images/thumbnails/europa_league.jpg'),
  conference_league: require('../../assets/images/thumbnails/conference_league.jpg'),
  afc_champions_league: require('../../assets/images/thumbnails/afc_champions_league.jpg'),
  argentina_primera: require('../../assets/images/thumbnails/argentina_primera.jpg'),
  ukrainian_premier: require('../../assets/images/thumbnails/ukrainian_premier.jpg'),
  liga_mx: require('../../assets/images/thumbnails/liga_mx.jpg'),
  football_general: require('../../assets/images/thumbnails/football_general.jpg'),
  ligue1: require('../../assets/images/thumbnails/ligue1.jpg'),
  saudi_pro: require('../../assets/images/thumbnails/saudi_pro.webp'),
  efl: require('../../assets/images/thumbnails/efl.png'),
  mls: require('../../assets/images/thumbnails/mls.jpg'),
  nba: require('../../assets/images/thumbnails/nba.webp'),
  euroleague: require('../../assets/images/thumbnails/euroleague.jpg'),
  hockey: require('../../assets/images/thumbnails/hockey.jpg'),
  del: require('../../assets/images/thumbnails/del.jpg'),
  austrian_ice_hockey: require('../../assets/images/thumbnails/austrian_ice_hockey.jpg'),
  russia_mhl: require('../../assets/images/thumbnails/russia_mhl.jpg'),
  hockey_allsvenskan: require('../../assets/images/thumbnails/hockey_allsvenskan.jpg'),
  csl: require('../../assets/images/thumbnails/csl.jpg'),
  j1: require('../../assets/images/thumbnails/j1.jpg'),
  fifa_u17: require('../../assets/images/thumbnails/fifa_u17.jpg'),
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

  // ── 1. SPECIFIC BASKETBALL LEAGUES (Must precede generic basketball -> nba) ──
  if (comp.includes('euroleague') || comp.includes('euro league')) {
    return 'euroleague';
  }
  if (comp === 'nba' || comp.includes('nba') || comp.includes('national basketball association')) {
    return 'nba';
  }

  // ── 2. SPECIFIC ICE HOCKEY LEAGUES (Must precede generic hockey -> nhl) ──
  if (comp.includes('russia mhl') || comp.includes('mhl') || comp.includes('molodezhnaya')) {
    return 'russia_mhl';
  }
  if (
    comp === 'del' ||
    comp.includes('germany del') ||
    comp.includes('german del') ||
    comp.includes('penny del') ||
    comp.includes('deutsche eishockey')
  ) {
    return 'del';
  }
  if (
    comp.includes('ice hockey league') ||
    comp.includes('icehl') ||
    comp.includes('win2day') ||
    comp.includes('austria ice') ||
    comp.includes('austrian ice')
  ) {
    return 'austrian_ice_hockey';
  }
  if (
    comp.includes('hockeyallsvenskan') ||
    comp.includes('hockey allsvenskan') ||
    (sp === 'hockey' && comp.includes('allsvenskan'))
  ) {
    return 'hockey_allsvenskan';
  }
  if (comp.includes('nhl') || comp.includes('stanley cup')) {
    return 'hockey';
  }

  // ── 3. SPECIFIC FOOTBALL COMPETITIONS ──
  // FIFA U-17 World Cup
  if (
    comp.includes('u-17') ||
    comp.includes('u17') ||
    comp.includes('under-17') ||
    comp.includes('under 17')
  ) {
    return 'fifa_u17';
  }

  // AFC Champions League (Elite & Two - checked strictly BEFORE UEFA Champions League)
  if (
    comp.includes('afc champions') ||
    comp.includes('acl elite') ||
    comp.includes('asian champions') ||
    comp.includes('afc cup') ||
    comp.includes('afc.champions')
  ) {
    return 'afc_champions_league';
  }

  // Ukrainian Premier League (checked BEFORE English Premier League!)
  if (
    comp.includes('ukrain') ||
    comp.includes('ukr.1') ||
    comp === 'upl'
  ) {
    return 'ukrainian_premier';
  }

  // Egyptian & Kenyan Premier Leagues (checked BEFORE English Premier League so they don't show EPL artwork!)
  if (
    comp.includes('egyptian') ||
    comp.includes('egypt premier') ||
    comp.includes('egy.1') ||
    comp.includes('kenyan') ||
    comp.includes('fkf') ||
    comp.includes('ken.1') ||
    comp.includes('indian super') ||
    comp.includes('ind.1')
  ) {
    return 'football_general';
  }

  // Argentina Football League / Liga Profesional (checked BEFORE LaLiga Primera División)
  if (
    comp.includes('argentin') ||
    comp.includes('liga profesional') ||
    comp.includes('primera división argentina') ||
    comp.includes('primera division argentina') ||
    comp.includes('arg.1') ||
    comp === 'lpf'
  ) {
    return 'argentina_primera';
  }

  // Liga MX
  if (
    comp.includes('liga mx') ||
    comp.includes('bbva mx') ||
    comp.includes('mex.1')
  ) {
    return 'liga_mx';
  }

  // Meiji Yasuda J1 League
  if (
    comp.includes('j1') ||
    comp.includes('j-league') ||
    comp.includes('j.league') ||
    comp.includes('j league') ||
    comp.includes('meiji yasuda') ||
    comp.includes('jpn.1')
  ) {
    return 'j1';
  }

  // Chinese Super League (CSL)
  if (
    comp.includes('csl') ||
    comp.includes('chinese super') ||
    comp.includes('china super') ||
    comp.includes('chn.1')
  ) {
    return 'csl';
  }

  // UEFA Conference League (checked before Europa League)
  if (
    comp.includes('conference') ||
    comp.includes('uecl') ||
    comp.includes('europa.conf') ||
    comp.includes('europa conference')
  ) {
    return 'conference_league';
  }

  // UEFA Champions League (Strictly guarded against AFC, Arab, Asian, Gulf, and non-UEFA cups)
  const isNonUefa =
    comp.includes('afc') ||
    comp.includes('asian') ||
    comp.includes('arab') ||
    comp.includes('gulf') ||
    comp.includes('caf') ||
    comp.includes('concacaf') ||
    comp.includes('ehf') ||
    comp.includes('cev') ||
    comp.includes('handball') ||
    comp.includes('volley');

  if (
    !isNonUefa &&
    (comp.includes('champions league') ||
      comp.includes('ucl') ||
      comp.includes('uefa.champions') ||
      comp === 'champions')
  ) {
    return 'champions_league';
  }

  // UEFA Europa League
  if (
    comp.includes('europa league') ||
    comp.includes('uel') ||
    comp.includes('uefa.europa') ||
    comp === 'europa'
  ) {
    return 'europa_league';
  }

  // English Premier League
  if (
    comp === 'premier league' ||
    comp.includes('english premier') ||
    comp.includes('epl') ||
    comp.includes('eng.1') ||
    comp === 'premier-league' ||
    comp === 'pl' ||
    (comp.includes('premier league') && !comp.includes('ukrain') && !comp.includes('egypt') && !comp.includes('kenya'))
  ) {
    return 'premier_league';
  }

  // LaLiga
  if (
    comp.includes('laliga') ||
    comp.includes('la liga') ||
    comp.includes('esp.1') ||
    comp.includes('spain - la liga') ||
    (comp.includes('primera division') && !comp.includes('argentin'))
  ) {
    return 'laliga';
  }

  // Bundesliga
  if (
    comp.includes('bundesliga') ||
    comp.includes('ger.1') ||
    comp.includes('german bundesliga')
  ) {
    return 'bundesliga';
  }

  // Ligue 1
  if (
    comp.includes('ligue 1') ||
    comp.includes('ligue1') ||
    comp.includes('fra.1') ||
    comp.includes('french ligue')
  ) {
    return 'ligue1';
  }

  // Saudi Pro League (strictly separate from Saudi First Division & King Cup)
  if (
    (comp.includes('saudi pro') ||
      comp.includes('ksa.1') ||
      comp.includes('roshn') ||
      comp.includes('spl') ||
      (comp.includes('saudi') &&
        !comp.includes('first') &&
        !comp.includes('yelo') &&
        !comp.includes('division') &&
        !comp.includes('1st') &&
        !comp.includes('king')))
  ) {
    return 'saudi_pro';
  }

  // EFL Championship
  if (
    comp.includes('championship') ||
    comp.includes('efl') ||
    comp.includes('eng.2')
  ) {
    return 'efl';
  }

  // Major League Soccer (MLS)
  if (
    comp.includes('mls') ||
    comp.includes('major league soccer') ||
    comp.includes('usa.1')
  ) {
    return 'mls';
  }

  // ── 4. BROAD SPORT FALLBACKS (Never fall back basketball/hockey to football) ──
  if (sp === 'basketball' || comp.includes('basketball') || comp.includes('eurocup') || comp.includes('fiba')) {
    return 'nba';
  }
  if (sp === 'hockey' || sp === 'ice_hockey' || comp.includes('hockey') || comp.includes('khl') || comp.includes('shl')) {
    return 'hockey';
  }

  // ── 5. GENERAL FOOTBALL FALLBACK ──
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
