import { ImageSourcePropType } from 'react-native';

/**
 * BALLIVE Dedicated League & Sport Fallback Thumbnail Resolver
 *
 * Provides authentic, high-resolution background artwork for competitions and sports.
 * Specific competitions resolve strictly BEFORE broad sport fallbacks so Basketball/Hockey/Regional PLs
 * never collapse to English Premier League, NBA, NHL, or UCL artwork.
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
  ugandan_premier: require('../../assets/images/heroes/competitions/ugandan_premier.jpg'),
  egyptian_premier: require('../../assets/images/heroes/competitions/egyptian_premier.jpg'),
  liga_mx: require('../../assets/images/thumbnails/liga_mx.jpg'),
  football_general: require('../../assets/images/thumbnails/football_general.jpg'),
  ligue1: require('../../assets/images/thumbnails/ligue1.jpg'),
  saudi_pro: require('../../assets/images/thumbnails/saudi_pro.webp'),
  saudi_first_division: require('../../assets/images/heroes/competitions/saudi_first_division.jpg'),
  efl: require('../../assets/images/thumbnails/efl.png'),
  mls: require('../../assets/images/thumbnails/mls.jpg'),
  eredivisie: require('../../assets/images/thumbnails/eredivisie.jpg'),
  super_lig: require('../../assets/images/thumbnails/super_lig.jpg'),
  brasileirao: require('../../assets/images/thumbnails/brasileirao.jpg'),
  copa_paraguay: require('../../assets/images/heroes/competitions/copa_paraguay.jpg'),
  premier_liga: require('../../assets/images/heroes/competitions/premier_liga.jpg'),
  champions_super_league: require('../../assets/images/heroes/competitions/champions_super_league.jpg'),
  nba: require('../../assets/images/thumbnails/nba.webp'),
  euroleague: require('../../assets/images/thumbnails/euroleague.jpg'),
  fiba_world_cup: require('../../assets/images/heroes/competitions/fiba_world_cup.jpg'),
  nz_basketball: require('../../assets/images/heroes/competitions/nz_basketball.jpg'),
  hockey: require('../../assets/images/thumbnails/hockey.jpg'),
  del: require('../../assets/images/thumbnails/del.jpg'),
  austrian_ice_hockey: require('../../assets/images/thumbnails/austrian_ice_hockey.jpg'),
  russia_mhl: require('../../assets/images/thumbnails/russia_mhl.jpg'),
  aihl: require('../../assets/images/heroes/competitions/aihl.jpg'),
  hockey_allsvenskan: require('../../assets/images/thumbnails/hockey_allsvenskan.jpg'),
  csl: require('../../assets/images/thumbnails/csl.jpg'),
  j1: require('../../assets/images/thumbnails/j1.jpg'),
  fifa_u17: require('../../assets/images/thumbnails/fifa_u17.jpg'),
};

export type LeagueThumbnailKey = keyof typeof LEAGUE_THUMBNAILS;

const NON_ENGLISH_PREMIER_TERMS = [
  'ukrain', 'egypt', 'kenya', 'fkf', 'ugand', 'turk', 'israel', 'azerbaijan',
  'indian', 'russian', 'russia', 'belarus', 'scottish', 'scotland', 'welsh',
  'wales', 'canadian', 'canada', 'kazakh', 'irish', 'northern irish',
  'cambodia', 'singapore', 'bahrain', 'kuwait', 'oman', 'ghana', 'nigeria',
  'tanzania', 'ethiopia', 'bosnia', 'malta', 'faroe', 'armen', 'georgia',
  'thailand', 'bangladesh', 'hong kong', 'south africa', 'premiership',
];

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

  // ── 1. SPECIFIC BASKETBALL LEAGUES (Must precede World Cup & NBA checks!) ──
  const isBasketball =
    sp === 'basketball' ||
    comp.includes('fiba') ||
    comp.includes('basketball') ||
    comp.includes('euroleague') ||
    comp.includes('euro league') ||
    comp.includes('new zealand') ||
    comp.includes('nz nbl');

  if (comp.includes('euroleague') || comp.includes('euro league')) {
    return 'euroleague';
  }
  if (comp.includes('new zealand') || comp.includes('nz nbl') || comp.includes('rapid league')) {
    return 'nz_basketball';
  }
  if (comp.includes('fiba') || (isBasketball && (comp.includes('world cup') || comp.includes('qualif')))) {
    return 'fiba_world_cup';
  }
  if (comp === 'nba' || comp.includes('nba') || comp.includes('national basketball association') || isBasketball) {
    return 'nba';
  }

  // ── 2. SPECIFIC ICE HOCKEY LEAGUES ──
  if (comp.includes('russia mhl') || comp.includes('russian mhl') || comp === 'mhl' || comp.includes('molodezhnaya')) {
    return 'russia_mhl';
  }
  if (comp.includes('australian ice') || comp === 'aihl') {
    return 'aihl';
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
  if (comp.includes('nhl') || comp.includes('stanley cup') || sp === 'hockey' || sp === 'ice_hockey' || comp.includes('hockey') || comp.includes('khl') || comp.includes('shl')) {
    return 'hockey';
  }

  // ── 3. SPECIFIC FOOTBALL COMPETITIONS ──
  if (comp.includes('u-17') || comp.includes('u17') || comp.includes('under-17') || comp.includes('under 17')) {
    return 'fifa_u17';
  }

  // AFC Champions League (strictly before UEFA Champions League)
  if (
    comp.includes('afc champions') ||
    comp.includes('acl elite') ||
    comp.includes('asian champions') ||
    comp.includes('afc cup') ||
    comp.includes('afc.champions')
  ) {
    return 'afc_champions_league';
  }

  // Regional / National Premier Leagues (Checked strictly BEFORE English PL!)
  if (comp.includes('ukrain') || comp.includes('ukr.1') || comp === 'upl') {
    return 'ukrainian_premier';
  }
  if (comp.includes('ugand') || comp.includes('uga.1')) {
    return 'ugandan_premier';
  }
  if (comp.includes('egypt') || comp.includes('egy.1')) {
    return 'egyptian_premier';
  }
  if (comp.includes('turk') || comp.includes('super lig') || comp.includes('süper lig') || comp.includes('tur.1')) {
    return 'super_lig';
  }
  if (comp.includes('russian premier') || comp.includes('rus.1') || comp === 'premier liga') {
    return 'premier_liga';
  }
  if (comp.includes('paraguay') || comp.includes('par.1')) {
    return 'copa_paraguay';
  }
  if (comp.includes('eredivisie') || comp.includes('ned.1')) {
    return 'eredivisie';
  }
  if (comp.includes('brasileir') || comp.includes('bra.1')) {
    return 'brasileirao';
  }
  if (comp.includes('champions super')) {
    return 'champions_super_league';
  }

  // Argentina Football League (checked BEFORE LaLiga)
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
  if (comp.includes('liga mx') || comp.includes('bbva mx') || comp.includes('mex.1')) {
    return 'liga_mx';
  }

  // J1 League
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

  // Chinese Super League
  if (comp.includes('csl') || comp.includes('chinese super') || comp.includes('china super') || comp.includes('chn.1')) {
    return 'csl';
  }

  // Saudi First Division strictly separate from Saudi Pro League
  if (
    comp.includes('first division') ||
    comp.includes('yelo') ||
    comp.includes('ksa.2') ||
    comp.includes('saudi 1st') ||
    comp.includes('saudi_first')
  ) {
    return 'saudi_first_division';
  }
  if (
    comp.includes('saudi pro') ||
    comp.includes('ksa.1') ||
    comp.includes('roshn') ||
    comp.includes('spl') ||
    (comp.includes('saudi') && !comp.includes('king'))
  ) {
    return 'saudi_pro';
  }

  // UEFA Competitions
  if (comp.includes('conference') || comp.includes('uecl') || comp.includes('europa.conf') || comp.includes('europa conference')) {
    return 'conference_league';
  }
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
    comp.includes('volley') ||
    comp.includes('champions super');
  if (
    !isNonUefa &&
    (comp.includes('champions league') || comp.includes('ucl') || comp.includes('uefa.champions') || comp === 'champions')
  ) {
    return 'champions_league';
  }
  if (comp.includes('europa league') || comp.includes('uel') || comp.includes('uefa.europa') || comp === 'europa') {
    return 'europa_league';
  }

  // English Premier League (Strictly guarded against non-English PLs)
  const hasForeignPremierMarker = NON_ENGLISH_PREMIER_TERMS.some(term => comp.includes(term));
  if (
    !hasForeignPremierMarker &&
    (comp === 'premier league' ||
      comp.includes('english premier') ||
      comp.includes('epl') ||
      comp.includes('eng.1') ||
      comp === 'premier-league' ||
      comp === 'pl')
  ) {
    return 'premier_league';
  }

  // LaLiga
  if (
    comp.includes('laliga') ||
    comp.includes('la liga') ||
    comp.includes('esp.1') ||
    comp.includes('spain - la liga') ||
    (comp.includes('primera division') && !comp.includes('argentin') && !comp.includes('paraguay'))
  ) {
    return 'laliga';
  }

  // Bundesliga
  if (comp.includes('bundesliga') || comp.includes('ger.1') || comp.includes('german bundesliga')) {
    return 'bundesliga';
  }

  // Ligue 1
  if (comp.includes('ligue 1') || comp.includes('ligue1') || comp.includes('fra.1') || comp.includes('french ligue')) {
    return 'ligue1';
  }

  // EFL Championship
  if (comp.includes('championship') || comp.includes('efl') || comp.includes('eng.2')) {
    return 'efl';
  }

  // MLS
  if (comp.includes('mls') || comp.includes('major league soccer') || comp.includes('usa.1')) {
    return 'mls';
  }

  // ── 4. GENERAL FOOTBALL FALLBACK ──
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
