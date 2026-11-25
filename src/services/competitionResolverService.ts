/**
 * BALLIVE Intelligent Competition Recognition & Categorization Service
 * 
 * Provides centralized resolution, disambiguation, and metadata caching
 * for football leagues and multi-sport tournaments across BALLIVE.
 * 
 * Resolves identifiable competitions from multiple provider signals:
 * - Provider league IDs / slugs (e.g., ESPN `jpn.1`, `ksa.1`, `fifa.world.u17`, `chn.1`, `ind.1`, `ken.1`)
 * - URL query parameters (`lg` and `lb` in DAG poster URLs)
 * - Raw descriptions and titles (`🏆 League: ...`, `genres`)
 * - Distinctive club signatures when competition name is missing or generic
 * 
 * Guarantees strict disambiguation (e.g., Saudi Pro League vs Saudi First Division,
 * FIFA U-17 World Cup vs Senior World Cup) and caches metadata in-memory.
 */

import { LEAGUE_EMBLEMS } from '../constants/crests';

export interface CanonicalCompetition {
  id: string;
  name: string;
  shortName: string;
  country: string;
  region: string;
  logoUrl: string;
  accentColor: string;
  sport: 'soccer' | 'basketball' | 'hockey' | 'american_football' | 'racing' | 'tennis' | 'cricket' | 'other';
  providerAliases: string[];
  clubSignatures: string[];
}

export interface CompetitionResolutionInput {
  rawId?: string | null;
  rawName?: string | null;
  competition?: string | null;
  posterUrl?: string | null;
  description?: string | null;
  genres?: string[] | null;
  homeTeam?: string | null;
  awayTeam?: string | null;
  sport?: string | null;
  country?: string | null;
}

export interface ResolvedCompetition {
  id: string;
  name: string;
  shortName: string;
  country: string;
  region: string;
  logoUrl: string;
  accentColor: string;
  sport: string;
  isIdentified: boolean;
}

// ── CANONICAL COMPETITION DEFINITIONS (Ordered most-specific first) ──
export const CANONICAL_COMPETITIONS: Record<string, CanonicalCompetition> = {
  // ── 1. FIFA U-17 WORLD CUP (Checked before senior World Cup) ──
  fifa_u17: {
    id: 'fifa_u17',
    name: 'FIFA U-17 World Cup',
    shortName: 'FIFA U-17',
    country: 'International',
    region: 'Global',
    logoUrl: LEAGUE_EMBLEMS['fifa-u-17'],
    accentColor: '#0055A5',
    sport: 'soccer',
    providerAliases: [
      'fifa.world.u17',
      'fifa.u17',
      'u-17 world cup',
      'u17 world cup',
      'under-17 world cup',
      'under 17 world cup',
      'fifa u-17',
      'fifa u17',
      'fifa under-17 world cup',
    ],
    clubSignatures: [],
  },

  // ── 2. AFC CHAMPIONS LEAGUE (Checked before UEFA Champions League) ──
  afc_champions_league: {
    id: 'afc_champions_league',
    name: 'AFC Champions League Elite',
    shortName: 'AFC Champions League',
    country: 'Asia',
    region: 'Asia',
    logoUrl: LEAGUE_EMBLEMS['afc-champions-league'],
    accentColor: '#E5A823',
    sport: 'soccer',
    providerAliases: [
      'afc champions league',
      'afc champions league elite',
      'afc champions league two',
      'afc champions',
      'acl elite',
      'asian champions league',
      'afc.champions',
      'afc champions league 2',
      'afc cup',
    ],
    clubSignatures: [
      'al hilal',
      'al nassr',
      'al ahli saudi',
      'al ain',
      'al sadd',
      'al rayyan',
      'persepolis',
      'esteghlal',
      'gamba osaka',
      'port fc',
      'kashima antlers',
      'jeonbuk hyundai',
      'vissel kobe',
      'kawasaki frontale',
      'yokohama f marinos',
      'pohang steelers',
      'ulsan hd',
      'gwangju fc',
      'shanghai port',
      'shanghai shenhua',
      'shandong taishan',
    ],
  },

  // ── 3. UKRAINIAN PREMIER LEAGUE (Checked before English Premier League) ──
  ukrainian_premier: {
    id: 'ukrainian_premier',
    name: 'Ukrainian Premier League',
    shortName: 'UPL',
    country: 'Ukraine',
    region: 'Eastern Europe',
    logoUrl: LEAGUE_EMBLEMS['ukrainian-premier'],
    accentColor: '#F59E0B',
    sport: 'soccer',
    providerAliases: [
      'ukr.1',
      'ukrainian premier league',
      'ukraine premier league',
      'ukrainian premier',
      'upl',
    ],
    clubSignatures: [
      'shakhtar donetsk',
      'dynamo kyiv',
      'kryvbas',
      'fc kharkiv',
      'metalist',
      'polissya',
      'rukh lviv',
      'zorya luhansk',
      'vorskla poltava',
      'oleksandriya',
      'kolos kovalivka',
      'obolon kyiv',
      'veres rivne',
      'lnz cherkasy',
      'karpaty lviv',
    ],
  },

  // ── 4. EGYPTIAN PREMIER LEAGUE (Checked before English Premier League) ──
  egyptian_premier: {
    id: 'egyptian_premier',
    name: 'Egyptian Premier League',
    shortName: 'Egyptian Premier',
    country: 'Egypt',
    region: 'North Africa',
    logoUrl: LEAGUE_EMBLEMS['egyptian-premier'],
    accentColor: '#C8102E',
    sport: 'soccer',
    providerAliases: [
      'egy.1',
      'egyptian premier league',
      'egypt premier league',
      'egyptian league',
      'nile league',
      'egyptian premier',
    ],
    clubSignatures: [
      'al ahly',
      'al-ahly',
      'zamalek',
      'pyramids fc',
      'pyramids',
      'modern sport',
      'future fc',
      'al masry',
      'ceramica cleopatra',
      'smouha',
      'enppi',
      'el gouna',
      'el geish',
      'talaea el gaish',
      'pharco',
      'ismaily',
      'haras el hodoud',
      'petrojet',
      'ghazl el mahalla',
      'ghazl el mehalla',
    ],
  },

  // ── 5. KENYAN PREMIER LEAGUE (Checked before English Premier League) ──
  kenyan_premier: {
    id: 'kenyan_premier',
    name: 'Kenyan Premier League',
    shortName: 'FKF Premier League',
    country: 'Kenya',
    region: 'East Africa',
    logoUrl: LEAGUE_EMBLEMS['kenyan-premier-league'],
    accentColor: '#008000',
    sport: 'soccer',
    providerAliases: [
      'ken.1',
      'kenyan premier league',
      'fkf premier league',
      'fkf',
      'kpl',
      'kenya premier league',
      'betika fkf',
    ],
    clubSignatures: [
      'gor mahia',
      'afc leopards',
      'tusker fc',
      'kenya police',
      'bandari',
      'ulinzi stars',
      'sofapaka',
      'kariobangi sharks',
      'kakamega homeboyz',
      'bidco united',
      'shabana',
      'muranga seal',
      "murang'a seal",
      'fc talanta',
      'nairobi city stars',
      'posta rangers',
    ],
  },

  // ── 6. ARGENTINA LIGA PROFESIONAL (Checked before LaLiga Primera Division) ──
  argentina_primera: {
    id: 'argentina_primera',
    name: 'Argentina Liga Profesional',
    shortName: 'Argentina LPF',
    country: 'Argentina',
    region: 'South America',
    logoUrl: LEAGUE_EMBLEMS['argentina-primera'],
    accentColor: '#0EA5E9',
    sport: 'soccer',
    providerAliases: [
      'arg.1',
      'argentina primera division',
      'argentina primera',
      'liga profesional de futbol',
      'liga profesional argentina',
      'argentina league',
      'argentina football league',
      'argentine liga profesional',
      'torneo betano',
      'lpf argentina',
    ],
    clubSignatures: [
      'boca juniors',
      'river plate',
      'racing club',
      'independiente',
      'independiente rivadavia',
      'san lorenzo',
      'estudiantes de la plata',
      'velez sarsfield',
      'talleres cordoba',
      'rosario central',
      'newells old boys',
      'huracan',
      'argentinos juniors',
      'lanus',
      'banfield',
      'belgrano',
      'godoy cruz',
      'platense',
    ],
  },

  // ── 7. LIGA MX ──
  liga_mx: {
    id: 'liga_mx',
    name: 'Liga MX',
    shortName: 'Liga MX',
    country: 'Mexico',
    region: 'North America',
    logoUrl: LEAGUE_EMBLEMS['liga-mx'],
    accentColor: '#16A34A',
    sport: 'soccer',
    providerAliases: [
      'mex.1',
      'liga mx',
      'liga bbva mx',
      'mexican liga mx',
      'mexico primera',
    ],
    clubSignatures: [
      'club america',
      'chivas guadalajara',
      'cruz azul',
      'tigres uanl',
      'monterrey',
      'pumas unam',
      'toluca',
      'pachuca',
      'santos laguna',
      'atlas',
      'tijuana',
      'necaxa',
      'queretaro',
      'mazatlan',
      'puebla',
      'juarez',
      'atletico san luis',
      'club leon',
    ],
  },

  // ── 8. MEIJI YASUDA J1 LEAGUE (JAPAN) ──
  j1_league: {
    id: 'j1_league',
    name: 'Meiji Yasuda J1 League',
    shortName: 'J1 League',
    country: 'Japan',
    region: 'East Asia',
    logoUrl: LEAGUE_EMBLEMS['j1-league'],
    accentColor: '#E60012',
    sport: 'soccer',
    providerAliases: [
      'jpn.1',
      'j-league',
      'j.league',
      'j league',
      'japan j league',
      'japan j1',
      'j1 league',
      'meiji yasuda',
      'japanese j.league',
      'japanese j1 league',
    ],
    clubSignatures: [
      'vissel kobe',
      'yokohama f. marinos',
      'yokohama f marinos',
      'kawasaki frontale',
      'urawa red diamonds',
      'urawa reds',
      'sanfrecce hiroshima',
      'gamba osaka',
      'cerezo osaka',
      'kashima antlers',
      'nagoya grampus',
      'machida zelvia',
      'tokyo verdy',
      'fc tokyo',
      'kashiwa reysol',
      'avispa fukuoka',
      'kyoto sanga',
      'shonan bellmare',
      'albirex niigata',
      'jubilo iwata',
      'sagan tosu',
      'consadole sapporo',
      'shimizu s pulse',
      'v varen nagasaki',
      'fagiano okayama',
    ],
  },

  // ── 9. SAUDI FIRST DIVISION LEAGUE (YELO LEAGUE, TIER 2) ──
  saudi_first_division: {
    id: 'saudi_first_division',
    name: 'Saudi First Division League',
    shortName: 'Saudi 1st Div',
    country: 'Saudi Arabia',
    region: 'Middle East',
    logoUrl: LEAGUE_EMBLEMS['saudi-first-division'],
    accentColor: '#1A472A',
    sport: 'soccer',
    providerAliases: [
      'ksa.2',
      'saudi first division',
      'saudi division 1',
      'saudi division one',
      'yelo league',
      'yelo',
      'saudi 1st division',
      'saudi first division league',
    ],
    clubSignatures: [
      'al hazem',
      'al-hazem',
      'al batin',
      'al-batin',
      'ohod',
      'al faisaly',
      'al-faisaly',
      'al jabalain',
      'al adalah',
      'al-adalah',
      'al bukiryah',
      'al ain saudi',
      'al jandal',
      'al safa',
      'al najma',
      'al zulfi',
      'jeddah club',
      'neom sc',
      'al arabi saudi',
    ],
  },

  // ── 10. SAUDI KING CUP & ARAB CLUB CUP ──
  saudi_king_cup: {
    id: 'saudi_king_cup',
    name: 'King Cup of Champions',
    shortName: 'King Cup',
    country: 'Saudi Arabia',
    region: 'Middle East',
    logoUrl: LEAGUE_EMBLEMS['saudi-king-cup'],
    accentColor: '#005A36',
    sport: 'soccer',
    providerAliases: [
      'king cup',
      'saudi king cup',
      'custodian of the two holy mosques cup',
      'king cup of champions',
      'saudi cup',
      'kings cup',
    ],
    clubSignatures: [],
  },
  arab_club_champions: {
    id: 'arab_club_champions',
    name: 'Arab Club Champions Cup',
    shortName: 'King Salman Cup',
    country: 'Arab World',
    region: 'Middle East',
    logoUrl: LEAGUE_EMBLEMS['arab-club-champions'],
    accentColor: '#1F3864',
    sport: 'soccer',
    providerAliases: [
      'arab club champions cup',
      'arab club championship',
      'king salman club cup',
      'arab champions league',
      'uafa club cup',
      'arab club cup',
    ],
    clubSignatures: [],
  },

  // ── 11. SAUDI PRO LEAGUE (TIER 1) ──
  saudi_pro: {
    id: 'saudi_pro',
    name: 'Saudi Pro League',
    shortName: 'Saudi Pro League',
    country: 'Saudi Arabia',
    region: 'Middle East',
    logoUrl: LEAGUE_EMBLEMS['saudi-pro-league'],
    accentColor: '#1E3A8A',
    sport: 'soccer',
    providerAliases: [
      'ksa.1',
      'saudi pro league',
      'saudi pro',
      'roshn saudi league',
      'roshn',
      'spl',
      'saudi professional league',
    ],
    clubSignatures: [
      'al hilal',
      'al-hilal',
      'al nassr',
      'al-nassr',
      'al ittihad',
      'al-ittihad',
      'al ahli saudi',
      'al-ahli saudi',
      'al shabab',
      'al-shabab',
      'al ettifaq',
      'al-ettifaq',
      'al taawoun',
      'al-taawoun',
      'al fateh',
      'al wehda',
      'al raed',
      'al fayha',
      'al khaleej',
      'al okhdood',
      'damac',
      'al riyadh',
      'al orobah',
      'al kholood',
      'al qadsiah',
    ],
  },

  // ── 12. CHINESE SUPER LEAGUE & INDIAN SUPER LEAGUE ──
  csl: {
    id: 'csl',
    name: 'Chinese Super League',
    shortName: 'CSL',
    country: 'China',
    region: 'East Asia',
    logoUrl: LEAGUE_EMBLEMS['csl'],
    accentColor: '#D81E06',
    sport: 'soccer',
    providerAliases: [
      'chn.1',
      'csl',
      'chinese super league',
      'china super league',
      'ping an csl',
    ],
    clubSignatures: [
      'shanghai port',
      'shandong taishan',
      'shanghai shenhua',
      'beijing guoan',
      'chengdu rongcheng',
      'zhejiang professional',
      'wuhan three towns',
      'tianjin jinmen tiger',
      'changchun yatai',
      'henan fc',
      'qingdao hainiu',
      'shenzhen peng city',
      'meizhou hakka',
      'nantong zhiyun',
      'qingdao west coast',
    ],
  },
  isl: {
    id: 'isl',
    name: 'Indian Super League',
    shortName: 'ISL',
    country: 'India',
    region: 'South Asia',
    logoUrl: LEAGUE_EMBLEMS['isl'],
    accentColor: '#FF6F00',
    sport: 'soccer',
    providerAliases: [
      'ind.1',
      'isl',
      'indian super league',
      'india super league',
      'hero isl',
    ],
    clubSignatures: [
      'mohun bagan',
      'mohun bagan sg',
      'mumbai city',
      'mumbai city fc',
      'kerala blasters',
      'bengaluru fc',
      'fc goa',
      'east bengal',
      'odisha fc',
      'chennaiyin',
      'hyderabad fc',
      'jamshedpur fc',
      'northeast united',
      'punjab fc',
      'mohammedan sc',
    ],
  },

  // ── 13. UEFA CLUB & EUROPEAN COMPETITIONS ──
  conference_league: {
    id: 'conference_league',
    name: 'UEFA Conference League',
    shortName: 'UECL',
    country: 'Europe',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['conference-league'],
    accentColor: '#00E880',
    sport: 'soccer',
    providerAliases: ['uefa.europa.conf', 'uefa conference league', 'europa conference league', 'conference league', 'uecl'],
    clubSignatures: [],
  },
  europa_league: {
    id: 'europa_league',
    name: 'UEFA Europa League',
    shortName: 'UEL',
    country: 'Europe',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['europa-league'],
    accentColor: '#F68E1E',
    sport: 'soccer',
    providerAliases: ['uefa.europa', 'uefa europa league', 'europa league', 'uel'],
    clubSignatures: [],
  },
  champions_league: {
    id: 'champions_league',
    name: 'UEFA Champions League',
    shortName: 'UCL',
    country: 'Europe',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['ucl'],
    accentColor: '#0A1E5C',
    sport: 'soccer',
    providerAliases: ['uefa.champions', 'uefa champions league', 'ucl'],
    clubSignatures: [],
  },
  premier_league: {
    id: 'premier_league',
    name: 'Premier League',
    shortName: 'Premier League',
    country: 'England',
    region: 'United Kingdom',
    logoUrl: LEAGUE_EMBLEMS['premier-league'],
    accentColor: '#7952FC',
    sport: 'soccer',
    providerAliases: ['eng.1', 'premier league', 'english premier league', 'epl', 'premier-league'],
    clubSignatures: ['arsenal', 'chelsea', 'liverpool', 'manchester city', 'manchester united', 'tottenham hotspur', 'aston villa', 'newcastle united', 'nottingham forest', 'brighton'],
  },
  la_liga: {
    id: 'la_liga',
    name: 'LaLiga EA Sports',
    shortName: 'LaLiga',
    country: 'Spain',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['laliga'],
    accentColor: '#EE1133',
    sport: 'soccer',
    providerAliases: ['esp.1', 'la liga', 'laliga', 'laliga ea sports', 'spain primera division'],
    clubSignatures: ['real madrid', 'fc barcelona', 'atletico madrid', 'athletic club', 'real sociedad', 'sevilla', 'villarreal', 'valencia'],
  },
  serie_a: {
    id: 'serie_a',
    name: 'Serie A',
    shortName: 'Serie A',
    country: 'Italy',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['serie-a'],
    accentColor: '#008FD7',
    sport: 'soccer',
    providerAliases: ['ita.1', 'serie a', 'italian serie a', 'serie a enilive'],
    clubSignatures: ['inter milan', 'ac milan', 'juventus', 'as roma', 'napoli', 'lazio', 'atalanta', 'fiorentina', 'bologna', 'como'],
  },
  bundesliga: {
    id: 'bundesliga',
    name: 'Bundesliga',
    shortName: 'Bundesliga',
    country: 'Germany',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['bundesliga'],
    accentColor: '#D10214',
    sport: 'soccer',
    providerAliases: ['ger.1', 'bundesliga', 'german bundesliga'],
    clubSignatures: ['bayern munich', 'bayern munchen', 'borussia dortmund', 'bayer leverkusen', 'rb leipzig', 'eintracht frankfurt', 'vfb stuttgart'],
  },
  ligue_1: {
    id: 'ligue_1',
    name: 'Ligue 1 McDonald’s',
    shortName: 'Ligue 1',
    country: 'France',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['ligue-1'],
    accentColor: '#091C3E',
    sport: 'soccer',
    providerAliases: ['fra.1', 'ligue 1', 'french ligue 1', 'ligue 1 mcdonalds'],
    clubSignatures: ['paris saint-germain', 'olympique marseille', 'as monaco', 'olympique lyonnais', 'lille osc', 'rc lens', 'ogc nice'],
  },
  mls: {
    id: 'mls',
    name: 'Major League Soccer',
    shortName: 'MLS',
    country: 'USA / Canada',
    region: 'North America',
    logoUrl: LEAGUE_EMBLEMS['mls'],
    accentColor: '#002B49',
    sport: 'soccer',
    providerAliases: ['usa.1', 'mls', 'major league soccer'],
    clubSignatures: ['inter miami', 'la galaxy', 'lafc', 'seattle sounders', 'columbus crew', 'sj earthquakes', 'houston dynamo'],
  },
  efl_championship: {
    id: 'efl_championship',
    name: 'EFL Championship',
    shortName: 'Championship',
    country: 'England',
    region: 'United Kingdom',
    logoUrl: LEAGUE_EMBLEMS['efl-championship'],
    accentColor: '#002B49',
    sport: 'soccer',
    providerAliases: ['eng.2', 'efl championship', 'sky bet championship', 'championship'],
    clubSignatures: ['leeds united', 'sheffield united', 'sunderland', 'burnley', 'west brom', 'norwich city', 'middlesbrough'],
  },
  brasileirao: {
    id: 'brasileirao',
    name: 'Brasileirão Série A',
    shortName: 'Brasileirão',
    country: 'Brazil',
    region: 'South America',
    logoUrl: LEAGUE_EMBLEMS['brasileirao'],
    accentColor: '#15803D',
    sport: 'soccer',
    providerAliases: ['bra.1', 'brasileirao', 'brazil serie a', 'brazil brasileirao'],
    clubSignatures: ['flamengo', 'palmeiras', 'atletico mineiro', 'corinthians', 'sao paulo', 'botafogo'],
  },
  eredivisie: {
    id: 'eredivisie',
    name: 'Eredivisie',
    shortName: 'Eredivisie',
    country: 'Netherlands',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['eredivisie'],
    accentColor: '#1D4ED8',
    sport: 'soccer',
    providerAliases: ['ned.1', 'eredivisie', 'dutch eredivisie'],
    clubSignatures: ['ajax amsterdam', 'psv eindhoven', 'feyenoord', 'az alkmaar', 'fc twente'],
  },
  primeira_liga: {
    id: 'primeira_liga',
    name: 'Primeira Liga',
    shortName: 'Liga Portugal',
    country: 'Portugal',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['primeira-liga'],
    accentColor: '#DC2626',
    sport: 'soccer',
    providerAliases: ['por.1', 'primeira liga', 'liga portugal', 'portuguese primeira liga'],
    clubSignatures: ['benfica', 'fc porto', 'sporting cp', 'sc braga'],
  },
  super_lig: {
    id: 'super_lig',
    name: 'Turkish Süper Lig',
    shortName: 'Süper Lig',
    country: 'Turkey',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['super-lig'],
    accentColor: '#E11D48',
    sport: 'soccer',
    providerAliases: ['tur.1', 'super lig', 'turkish super lig', 'trendyol super lig'],
    clubSignatures: ['galatasaray', 'fenerbahce', 'besiktas', 'trabzonspor'],
  },
  libertadores: {
    id: 'libertadores',
    name: 'CONMEBOL Libertadores',
    shortName: 'Libertadores',
    country: 'South America',
    region: 'South America',
    logoUrl: LEAGUE_EMBLEMS['libertadores'],
    accentColor: '#D97706',
    sport: 'soccer',
    providerAliases: ['conmebol.libertadores', 'copa libertadores', 'conmebol libertadores'],
    clubSignatures: [],
  },
  world_cup: {
    id: 'world_cup',
    name: 'FIFA World Cup',
    shortName: 'World Cup',
    country: 'International',
    region: 'Global',
    logoUrl: LEAGUE_EMBLEMS['world-cup'],
    accentColor: '#F8BE38',
    sport: 'soccer',
    providerAliases: ['fifa.world', 'fifa world cup', 'world cup'],
    clubSignatures: [],
  },

  // ── 14. BASKETBALL LEAGUES (Specific before NBA) ──
  euroleague: {
    id: 'euroleague',
    name: 'EuroLeague Basketball',
    shortName: 'EuroLeague',
    country: 'Europe',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['euroleague'],
    accentColor: '#FF5500',
    sport: 'basketball',
    providerAliases: ['euroleague', 'euro league', 'euroleague basketball', 'euroleague women', 'eurocup women', 'eurocup'],
    clubSignatures: ['partizan', 'zalgiris', 'olympiakos', 'panathinaikos', 'fenerbahce beko', 'anadolu efes', 'baskonia', 'virtus bologna', 'crvena zvezda', 'hapoel tel aviv', 'monaco basket'],
  },
  nba: {
    id: 'nba',
    name: 'NBA Basketball',
    shortName: 'NBA',
    country: 'USA / Canada',
    region: 'North America',
    logoUrl: LEAGUE_EMBLEMS['nba'],
    accentColor: '#1D428A',
    sport: 'basketball',
    providerAliases: ['nba', 'nba basketball', 'national basketball association'],
    clubSignatures: ['boston celtics', 'los angeles lakers', 'golden state warriors', 'new york knicks', 'oklahoma city thunder', 'milwaukee bucks', 'miami heat'],
  },

  // ── 15. ICE HOCKEY LEAGUES (Specific before NHL) ──
  russia_mhl: {
    id: 'russia_mhl',
    name: 'Russia MHL',
    shortName: 'MHL',
    country: 'Russia',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['russia-mhl'],
    accentColor: '#1D4ED8',
    sport: 'hockey',
    providerAliases: ['russia mhl', 'mhl', 'molodezhnaya hokkeinaya liga'],
    clubSignatures: ['amurskie tigry', 'almaz cherepovets', 'ska-1946', 'krasnaya armiya', 'spartak u20'],
  },
  del: {
    id: 'del',
    name: 'Germany DEL',
    shortName: 'DEL',
    country: 'Germany',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['del'],
    accentColor: '#DC2626',
    sport: 'hockey',
    providerAliases: ['germany del', 'german del', 'penny del', 'deutsche eishockey liga', 'del'],
    clubSignatures: ['eisbaren berlin', 'iserlohn roosters', 'schwenninger', 'adler mannheim', 'red bull munich', 'kolner haie', 'straubing tigers', 'nurnberg ice tigers', 'grizzlys wolfsburg'],
  },
  icehl: {
    id: 'icehl',
    name: 'Austrian ICE Hockey League',
    shortName: 'ICEHL',
    country: 'Austria',
    region: 'Central Europe',
    logoUrl: LEAGUE_EMBLEMS['icehl'],
    accentColor: '#0284C7',
    sport: 'hockey',
    providerAliases: ['austria ice hockey league', 'austrian ice hockey league', 'ice hockey league', 'win2day ice hockey league', 'icehl'],
    clubSignatures: ['red bull salzburg', 'graz 99ers', 'hk olimpija', 'pustertal', 'kac klagenfurt', 'vienna capitals', 'bolzano', 'linz black wings'],
  },
  hockey_allsvenskan: {
    id: 'hockey_allsvenskan',
    name: 'HockeyAllsvenskan',
    shortName: 'Allsvenskan',
    country: 'Sweden',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['hockey-allsvenskan'],
    accentColor: '#0F172A',
    sport: 'hockey',
    providerAliases: ['hockeyallsvenskan', 'hockey allsvenskan', 'allsvenskan hockey'],
    clubSignatures: ['bik karlskoga', 'sodertalje', 'vimmerby', 'vasteras', 'almtuna', 'oskarshamn', 'djurgardens if', 'bjorkloven'],
  },
  khl: {
    id: 'khl',
    name: 'KHL Hockey',
    shortName: 'KHL',
    country: 'International',
    region: 'Eurasia',
    logoUrl: LEAGUE_EMBLEMS['khl'],
    accentColor: '#B91C1C',
    sport: 'hockey',
    providerAliases: ['russia khl', 'khl', 'kontinental hockey league'],
    clubSignatures: ['barys astana', 'ska st petersburg', 'lokomotiv yaroslavl', 'cska moscow', 'avangard omsk', 'ak bars kazan'],
  },
  nhl: {
    id: 'nhl',
    name: 'NHL Hockey',
    shortName: 'NHL',
    country: 'North America',
    region: 'North America',
    logoUrl: LEAGUE_EMBLEMS['nhl'],
    accentColor: '#111111',
    sport: 'hockey',
    providerAliases: ['nhl', 'nhl hockey', 'national hockey league'],
    clubSignatures: ['toronto maple leafs', 'edmonton oilers', 'boston bruins', 'new york rangers', 'florida panthers', 'colorado avalanche'],
  },

  // ── 16. AMERICAN FOOTBALL, MOTORSPORT, TENNIS & CRICKET ──
  nfl: {
    id: 'nfl',
    name: 'NFL Football',
    shortName: 'NFL',
    country: 'USA',
    region: 'North America',
    logoUrl: LEAGUE_EMBLEMS['nfl'],
    accentColor: '#013369',
    sport: 'american_football',
    providerAliases: ['nfl', 'nfl football', 'national football league'],
    clubSignatures: ['kansas city chiefs', 'san francisco 49ers', 'philadelphia eagles', 'dallas cowboys'],
  },
  f1: {
    id: 'f1',
    name: 'Formula 1 World Championship',
    shortName: 'F1',
    country: 'Global',
    region: 'International',
    logoUrl: LEAGUE_EMBLEMS['f1'],
    accentColor: '#E10600',
    sport: 'racing',
    providerAliases: ['f1', 'formula 1', 'formula-1', 'formula 1 world championship', 'grand prix'],
    clubSignatures: ['red bull racing', 'ferrari', 'mercedes', 'mclaren', 'aston martin'],
  },
  tennis: {
    id: 'tennis',
    name: 'ATP & WTA Tennis Tour',
    shortName: 'ATP & WTA',
    country: 'Global',
    region: 'International',
    logoUrl: LEAGUE_EMBLEMS['tennis'],
    accentColor: '#10B981',
    sport: 'tennis',
    providerAliases: ['atp', 'wta', 'atp tour', 'wta tour', 'atp & wta tennis tour', 'davis cup', 'wimbledon'],
    clubSignatures: [],
  },
  cricket: {
    id: 'cricket',
    name: 'ICC World Cricket Championship',
    shortName: 'Cricket',
    country: 'Global',
    region: 'International',
    logoUrl: LEAGUE_EMBLEMS['cricket'],
    accentColor: '#08B3E5',
    sport: 'cricket',
    providerAliases: ['cricket', 'icc', 'icc world cricket', 'big bash league', 'ipl', 'wbbl'],
    clubSignatures: [],
  },
};

function extractQueryParam(url: string | null | undefined, paramName: string): string | null {
  if (!url || !url.includes('?')) return null;
  try {
    const queryString = url.split('?')[1];
    const params = new URLSearchParams(queryString);
    const val = params.get(paramName);
    if (!val || val === 'null' || val === 'undefined' || val.trim() === '') return null;
    return val.trim();
  } catch {
    return null;
  }
}

function extractLeagueFromDescription(desc: string | null | undefined): string | null {
  if (!desc) return null;
  const match = desc.match(/(?:🏆\s*League:\s*|League:\s*)([^\n\r]+)/i);
  if (match && match[1] && match[1].trim()) {
    return match[1].trim();
  }
  return null;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Matches short aliases using word boundaries so e.g. 'del' doesn't match 'Copa del Rey',
 * and 'isl' doesn't match 'Islanders'.
 */
function matchesAliasToken(normCand: string, rawAlias: string): boolean {
  const alias = normalizeText(rawAlias);
  if (!alias) return false;
  if (normCand === alias) return true;
  const words = alias.split(' ').length;
  if (alias.length <= 5 || words === 1) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|\\s)${escaped}(\\s|$)`).test(normCand);
  }
  return normCand.includes(alias);
}

/**
 * Detects EHF Handball / CEV Volleyball mis-labeled under Football "Champions League" in upstream feeds.
 */
function isNonFootballChampionsCup(candLower: string, teamsLower: string): boolean {
  const combined = `${candLower} ${teamsLower}`;
  return (
    combined.includes('ehf') ||
    combined.includes('cev') ||
    combined.includes('handball') ||
    combined.includes('volleyball') ||
    combined.includes('vero volley') ||
    combined.includes('vakifbank') ||
    combined.includes('budowlani') ||
    combined.includes('asterix avo') ||
    combined.includes('paris st-cloud') ||
    combined.includes('magdeburg') ||
    combined.includes('vive kielce') ||
    combined.includes('dinamo bucuresti') ||
    candLower === 'champions league women'
  );
}

export class CompetitionResolverService {
  private resolutionCache = new Map<string, ResolvedCompetition>();

  public resolveCompetition(input: CompetitionResolutionInput): ResolvedCompetition {
    const cacheKey = this.buildCacheKey(input);
    const cached = this.resolutionCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const resolved = this.executeResolution(input);
    this.resolutionCache.set(cacheKey, resolved);
    return resolved;
  }

  private buildCacheKey(input: CompetitionResolutionInput): string {
    return `${input.rawId || ''}|${input.rawName || ''}|${input.competition || ''}|${input.homeTeam || ''}|${input.awayTeam || ''}|${input.sport || ''}|${input.description ? input.description.slice(0, 30) : ''}`;
  }

  private executeResolution(input: CompetitionResolutionInput): ResolvedCompetition {
    const posterLg = extractQueryParam(input.posterUrl, 'lg');
    const descLeague = extractLeagueFromDescription(input.description);

    const candidates = [
      posterLg,
      descLeague,
      input.competition,
      input.rawName,
      input.rawId,
      ...(input.genres || []),
    ].filter(Boolean) as string[];

    const combinedTeams = `${normalizeText(input.homeTeam || '')} ${normalizeText(input.awayTeam || '')}`.trim();

    // ── STAGE 1: DIRECT CANONICAL / ALIAS MATCHING ──
    for (const candidate of candidates) {
      const normCand = normalizeText(candidate);
      if (
        !normCand ||
        ['football', 'soccer', 'sports', 'global football', 'live sports', 'other', 'basketball', 'hockey'].includes(normCand)
      ) {
        continue;
      }

      // Check every canonical competition (already ordered most-specific first!)
      for (const comp of Object.values(CANONICAL_COMPETITIONS)) {
        // Guard DEL against non-hockey matches (e.g. Copa del Rey)
        if (comp.id === 'del') {
          if (normCand.includes('copa del') || normCand.includes('sol')) continue;
          const spLower = (input.sport || '').toLowerCase();
          if (spLower === 'soccer' || spLower === 'football') continue;
        }

        // Strict separation: Saudi First Division vs Saudi Pro vs King Cup
        if (comp.id === 'saudi_first_division') {
          const isExplicitFirstDiv =
            normCand.includes('first division') ||
            normCand.includes('yelo') ||
            normCand.includes('ksa 2') ||
            normCand.includes('division 1') ||
            normCand.includes('division one') ||
            normCand === 'saudi 1st div';
          if (isExplicitFirstDiv) {
            return this.buildResolved(comp);
          }
          continue;
        }
        if (comp.id === 'saudi_pro') {
          const isExplicitPro =
            (normCand.includes('saudi') || matchesAliasToken(normCand, 'spl') || normCand.includes('ksa 1') || normCand.includes('roshn')) &&
            !normCand.includes('first') &&
            !normCand.includes('yelo') &&
            !normCand.includes('division') &&
            !normCand.includes('king');
          if (isExplicitPro) {
            return this.buildResolved(comp);
          }
          continue;
        }

        // Strict separation: FIFA U-17 vs Senior World Cup
        if (comp.id === 'fifa_u17') {
          const isU17 =
            normCand.includes('u17') ||
            normCand.includes('u 17') ||
            normCand.includes('under 17') ||
            normCand.includes('fifa world u17');
          if (isU17) {
            return this.buildResolved(comp);
          }
          continue;
        }
        if (comp.id === 'world_cup' && (normCand.includes('17') || normCand.includes('women') || normCand.includes('u20'))) {
          continue;
        }

        // Strict separation: Non-English Premier Leagues & Russian/Belarus Premier must NEVER hit English Premier League
        if (comp.id === 'premier_league') {
          const isRegionalPremier =
            normCand.includes('ukrain') ||
            normCand.includes('egypt') ||
            normCand.includes('kenya') ||
            normCand.includes('fkf') ||
            normCand.includes('indian') ||
            normCand.includes('russian') ||
            normCand.includes('belarus') ||
            normCand.includes('scottish') ||
            normCand.includes('welsh') ||
            normCand.includes('canadian') ||
            normCand.includes('kazakh');
          if (isRegionalPremier) continue;
        }

        // Strict separation: Argentina Primera vs LaLiga Primera
        if (comp.id === 'la_liga' && normCand.includes('argentin')) {
          continue;
        }

        // Strict separation: UEFA Champions League vs AFC/Arab/Handball/Volleyball Champions League
        if (comp.id === 'champions_league') {
          const isNonUefa =
            normCand.includes('afc') ||
            normCand.includes('asian') ||
            normCand.includes('arab') ||
            normCand.includes('gulf') ||
            normCand.includes('caf') ||
            normCand.includes('concacaf') ||
            normCand.includes('elite') ||
            normCand.includes('two') ||
            normCand.includes('asia') ||
            isNonFootballChampionsCup(normCand, combinedTeams);
          if (isNonUefa) {
            continue;
          }
        }

        // Guard NBA / NHL against specific non-NBA / non-NHL leagues
        if (comp.id === 'nba' && (normCand.includes('euroleague') || normCand.includes('euro cup') || normCand.includes('eurocup') || normCand.includes('wnba'))) {
          continue;
        }
        if (comp.id === 'nhl' && (normCand.includes('mhl') || normCand.includes('icehl') || normCand.includes('ice hockey league') || normCand.includes('allsvenskan') || normCand.includes('khl') || matchesAliasToken(normCand, 'del'))) {
          continue;
        }

        const matchesCanonical =
          normCand === normalizeText(comp.name) ||
          normCand === normalizeText(comp.shortName) ||
          normCand === normalizeText(comp.id) ||
          comp.providerAliases.some(alias => matchesAliasToken(normCand, alias));

        if (matchesCanonical) {
          return this.buildResolved(comp);
        }
      }
    }

    // ── STAGE 2: CLUB SIGNATURE ANALYSIS ──
    if (combinedTeams.length > 2) {
      const sportFilter = (input.sport || '').toLowerCase();
      for (const comp of Object.values(CANONICAL_COMPETITIONS)) {
        if (!comp.clubSignatures || comp.clubSignatures.length === 0) continue;
        if (sportFilter && sportFilter !== 'other' && sportFilter !== 'soccer' && comp.sport !== sportFilter) {
          continue;
        }

        const matchedClub = comp.clubSignatures.some(club => {
          const normClub = normalizeText(club);
          return matchesAliasToken(combinedTeams, normClub);
        });

        if (matchedClub) {
          if (comp.id === 'saudi_first_division') {
            const hasProPowerhouse = CANONICAL_COMPETITIONS.saudi_pro.clubSignatures.some(c =>
              matchesAliasToken(combinedTeams, normalizeText(c))
            );
            if (!hasProPowerhouse) {
              return this.buildResolved(comp);
            }
          } else {
            return this.buildResolved(comp);
          }
        }
      }
    }

    // ── STAGE 3: PROVIDER LEAGUE TEXT PRESERVATION ──
    // Preserve authentic unmapped competition names (e.g., "Czechia, 1. Liga", "Slovakia SHL", "Poland - Puchar Polski")
    // without inventing wrong leagues or inheriting mis-matched logos from another league.
    const preservedName = posterLg || descLeague || (
      input.competition &&
      !['football', 'soccer', 'sports', 'global football', 'live sports', 'other', 'basketball', 'hockey'].includes(input.competition.trim().toLowerCase())
        ? input.competition.trim()
        : null
    );
    if (preservedName && preservedName.trim().length > 1) {
      const cleanPreserved = preservedName.trim();
      const normPreserved = cleanPreserved.toLowerCase();
      const inferredSport =
        input.sport && input.sport !== 'other'
          ? input.sport
          : normPreserved.includes('euroleague') || normPreserved.includes('eurocup') || normPreserved.includes('basket')
          ? 'basketball'
          : normPreserved.includes('hockey') || normPreserved.includes('liga') && input.genres?.includes('HOCKEY') || normPreserved.includes('shl') || normPreserved.includes('khl')
          ? 'hockey'
          : 'soccer';

      return {
        id: `custom_${normalizeText(cleanPreserved).replace(/\s+/g, '_')}`,
        name: cleanPreserved,
        shortName: cleanPreserved,
        country: input.country || 'International',
        region: 'Global',
        logoUrl: LEAGUE_EMBLEMS[inferredSport] || LEAGUE_EMBLEMS['football'],
        accentColor: '#7952FC',
        sport: inferredSport,
        isIdentified: true,
      };
    }

    // ── STAGE 4: GENUINE SPORT FALLBACK ──
    const sportName = input.sport && input.sport !== 'other' ? input.sport : 'soccer';
    return {
      id: sportName,
      name: sportName === 'soccer' || sportName === 'football' ? 'Football' : sportName === 'hockey' ? 'Ice Hockey' : sportName.charAt(0).toUpperCase() + sportName.slice(1),
      shortName: sportName === 'soccer' || sportName === 'football' ? 'Football' : sportName === 'hockey' ? 'Hockey' : sportName.toUpperCase(),
      country: 'Global',
      region: 'Global',
      logoUrl: LEAGUE_EMBLEMS[sportName] || LEAGUE_EMBLEMS['football'],
      accentColor: '#7952FC',
      sport: sportName,
      isIdentified: false,
    };
  }

  private buildResolved(comp: CanonicalCompetition): ResolvedCompetition {
    return {
      id: comp.id,
      name: comp.name,
      shortName: comp.shortName,
      country: comp.country,
      region: comp.region,
      logoUrl: comp.logoUrl || LEAGUE_EMBLEMS['football'],
      accentColor: comp.accentColor,
      sport: comp.sport,
      isIdentified: true,
    };
  }

  /**
   * Retrieves a canonical competition by its internal ID, slug, or alias.
   */
  public getCompetitionById(idOrAlias: string): CanonicalCompetition | undefined {
    if (!idOrAlias) return undefined;
    const raw = idOrAlias.toLowerCase().replace(/^(comp-|league-)/, '').trim();
    if (CANONICAL_COMPETITIONS[raw]) return CANONICAL_COMPETITIONS[raw];

    const aliasMap: Record<string, string> = {
      pl: 'premier_league',
      epl: 'premier_league',
      'premier-league': 'premier_league',
      ucl: 'champions_league',
      'champions-league': 'champions_league',
      uel: 'europa_league',
      'europa-league': 'europa_league',
      uecl: 'conference_league',
      'conference-league': 'conference_league',
      laliga: 'la_liga',
      'la-liga': 'la_liga',
      seriea: 'serie_a',
      'serie-a': 'serie_a',
      ligue1: 'ligue_1',
      'ligue-1': 'ligue_1',
      saudi_first: 'saudi_first_division',
      'saudi-first': 'saudi_first_division',
      'saudi-pro-league': 'saudi_pro',
      wc: 'world_cup',
      'world-cup': 'world_cup',
      j1: 'j1_league',
      'afc-champions-league': 'afc_champions_league',
      'argentina-primera': 'argentina_primera',
      'liga-mx': 'liga_mx',
      'ukrainian-premier': 'ukrainian_premier',
      'russia-mhl': 'russia_mhl',
      'hockey-allsvenskan': 'hockey_allsvenskan',
    };
    if (aliasMap[raw] && CANONICAL_COMPETITIONS[aliasMap[raw]]) {
      return CANONICAL_COMPETITIONS[aliasMap[raw]];
    }

    const resolved = this.resolveCompetition({ competition: idOrAlias });
    if (resolved.isIdentified && CANONICAL_COMPETITIONS[resolved.id]) {
      return CANONICAL_COMPETITIONS[resolved.id];
    }
    return undefined;
  }

  /**
   * Returns all supported canonical competitions.
   */
  public getAllCompetitions(): CanonicalCompetition[] {
    return Object.values(CANONICAL_COMPETITIONS);
  }
}

export const competitionResolverService = new CompetitionResolverService();
export default competitionResolverService;
