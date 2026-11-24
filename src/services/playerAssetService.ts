/**
 * BALLIVE Player Asset & Dynamic Selection Service
 * 
 * Provides authentic, high-resolution athlete photography stored locally for offline use.
 * Implements context-aware team/match player matching, cross-section deduplication,
 * and deterministic rotation across screens.
 */

import { ImageSourcePropType } from 'react-native';

export type AthleteKey =
  | 'nico_paz'
  | 'michael_olise'
  | 'raphinha'
  | 'cristiano_ronaldo'
  | 'erling_haaland'
  | 'mohamed_salah'
  | 'leon_goretzka'
  | 'max_verstappen'
  | 'lewis_hamilton';

export interface AthleteInfo {
  key: AthleteKey;
  name: string;
  sport: 'football' | 'motorsport';
  teams: string[];
  competitions: string[];
  source: ImageSourcePropType;
}

export const LOCAL_ATHLETE_ASSETS: Record<AthleteKey, AthleteInfo> = {
  mohamed_salah: {
    key: 'mohamed_salah',
    name: 'Mohamed Salah',
    sport: 'football',
    teams: ['liverpool', 'egypt'],
    competitions: ['premier league', 'epl', 'eng.1', 'champions league', 'ucl'],
    source: require('../../assets/images/players/football/mohamed_salah.jpg'),
  },
  erling_haaland: {
    key: 'erling_haaland',
    name: 'Erling Haaland',
    sport: 'football',
    teams: ['manchester city', 'man city', 'norway'],
    competitions: ['premier league', 'epl', 'eng.1', 'champions league', 'ucl'],
    source: require('../../assets/images/players/football/erling_haaland.jpg'),
  },
  raphinha: {
    key: 'raphinha',
    name: 'Raphinha',
    sport: 'football',
    teams: ['barcelona', 'fc barcelona', 'brazil'],
    competitions: ['la liga', 'laliga', 'esp.1', 'champions league', 'ucl'],
    source: require('../../assets/images/players/football/raphinha.jpg'),
  },
  michael_olise: {
    key: 'michael_olise',
    name: 'Michael Olise',
    sport: 'football',
    teams: ['bayern', 'bayern munich', 'france'],
    competitions: ['bundesliga', 'ger.1', 'champions league', 'ucl'],
    source: require('../../assets/images/players/football/michael_olise.jpg'),
  },
  leon_goretzka: {
    key: 'leon_goretzka',
    name: 'Leon Goretzka',
    sport: 'football',
    teams: ['bayern', 'bayern munich', 'germany'],
    competitions: ['bundesliga', 'ger.1', 'champions league', 'ucl'],
    source: require('../../assets/images/players/football/leon_goretzka.jpg'),
  },
  nico_paz: {
    key: 'nico_paz',
    name: 'Nico Paz',
    sport: 'football',
    teams: ['como', 'argentina', 'real madrid'],
    competitions: ['serie a', 'ita.1'],
    source: require('../../assets/images/players/football/nico_paz.jpg'),
  },
  cristiano_ronaldo: {
    key: 'cristiano_ronaldo',
    name: 'Cristiano Ronaldo',
    sport: 'football',
    teams: ['al nassr', 'al-nassr', 'portugal'],
    competitions: ['saudi pro', 'ksa.1'],
    source: require('../../assets/images/players/football/cristiano_ronaldo.jpg'),
  },
  max_verstappen: {
    key: 'max_verstappen',
    name: 'Max Verstappen',
    sport: 'motorsport',
    teams: ['red bull', 'red bull racing'],
    competitions: ['formula 1', 'f1', 'grand prix'],
    source: require('../../assets/images/players/motorsport/max_verstappen.jpg'),
  },
  lewis_hamilton: {
    key: 'lewis_hamilton',
    name: 'Lewis Hamilton',
    sport: 'motorsport',
    teams: ['mercedes', 'ferrari'],
    competitions: ['formula 1', 'f1', 'grand prix'],
    source: require('../../assets/images/players/motorsport/lewis_hamilton.jpg'),
  },
};

const FOOTBALL_KEYS: AthleteKey[] = [
  'erling_haaland',
  'mohamed_salah',
  'raphinha',
  'michael_olise',
  'cristiano_ronaldo',
  'nico_paz',
  'leon_goretzka',
];

const MOTORSPORT_KEYS: AthleteKey[] = [
  'max_verstappen',
  'lewis_hamilton',
];

export interface PlayerSelectionContext {
  screen?: 'home' | 'discover' | 'saved' | 'details';
  sport?: string;
  competition?: string;
  teamName?: string;
  homeTeam?: string;
  awayTeam?: string;
  athleteKey?: AthleteKey;
  sectionId?: string;
}

export class PlayerAssetService {
  /**
   * Resolves the most appropriate athlete based on verified context,
   * avoiding accidental misidentification while ensuring variety across screens.
   */
  public selectAthlete(context: PlayerSelectionContext = {}): AthleteInfo {
    // 1. Explicit athlete key provided
    if (context.athleteKey && LOCAL_ATHLETE_ASSETS[context.athleteKey]) {
      return LOCAL_ATHLETE_ASSETS[context.athleteKey];
    }

    const sportLower = (context.sport || '').toLowerCase();
    const isMotorsport =
      sportLower.includes('motor') ||
      sportLower.includes('f1') ||
      sportLower.includes('formula') ||
      sportLower.includes('racing');

    // 2. Motorsport context
    if (isMotorsport) {
      const day = new Date().getDate();
      const idx = (day + (context.sectionId?.length || 0)) % MOTORSPORT_KEYS.length;
      return LOCAL_ATHLETE_ASSETS[MOTORSPORT_KEYS[idx]];
    }

    // 3. Match team context (Liverpool, Man City, Barca, Bayern, Como, Al Nassr)
    const combinedTeams = `${context.teamName || ''} ${context.homeTeam || ''} ${context.awayTeam || ''}`.toLowerCase();
    if (combinedTeams.length > 2) {
      if (combinedTeams.includes('liverpool')) {
        return LOCAL_ATHLETE_ASSETS.mohamed_salah;
      }
      if (combinedTeams.includes('manchester city') || combinedTeams.includes('man city')) {
        return LOCAL_ATHLETE_ASSETS.erling_haaland;
      }
      if (combinedTeams.includes('barcelona') || combinedTeams.includes('barca')) {
        return LOCAL_ATHLETE_ASSETS.raphinha;
      }
      if (combinedTeams.includes('bayern')) {
        const day = new Date().getDate();
        return day % 2 === 0
          ? LOCAL_ATHLETE_ASSETS.michael_olise
          : LOCAL_ATHLETE_ASSETS.leon_goretzka;
      }
      if (combinedTeams.includes('como')) {
        return LOCAL_ATHLETE_ASSETS.nico_paz;
      }
      if (combinedTeams.includes('al nassr') || combinedTeams.includes('al-nassr')) {
        return LOCAL_ATHLETE_ASSETS.cristiano_ronaldo;
      }
    }

    // 4. Screen-specific deduplicated pools
    const dayOfMonth = new Date().getDate();
    const offset = (context.sectionId ? context.sectionId.charCodeAt(0) : 0);

    if (context.screen === 'discover') {
      const discoverPool: AthleteKey[] = ['nico_paz', 'michael_olise', 'leon_goretzka'];
      const key = discoverPool[(dayOfMonth + offset) % discoverPool.length];
      return LOCAL_ATHLETE_ASSETS[key];
    }

    if (context.screen === 'saved') {
      const savedPool: AthleteKey[] = ['cristiano_ronaldo', 'mohamed_salah', 'erling_haaland'];
      const key = savedPool[(dayOfMonth + offset) % savedPool.length];
      return LOCAL_ATHLETE_ASSETS[key];
    }

    // 5. Default Home/General rotation: Deterministic, rotating daily marquee star
    const homePool: AthleteKey[] = [
      'erling_haaland',
      'mohamed_salah',
      'raphinha',
      'michael_olise',
      'cristiano_ronaldo',
      'nico_paz',
      'leon_goretzka',
    ];
    const key = homePool[(dayOfMonth + offset) % homePool.length];
    return LOCAL_ATHLETE_ASSETS[key];
  }

  /**
   * Returns all available authentic athlete profiles.
   */
  public getAllAthletes(): AthleteInfo[] {
    return Object.values(LOCAL_ATHLETE_ASSETS);
  }
}

export const playerAssetService = new PlayerAssetService();
export default playerAssetService;
