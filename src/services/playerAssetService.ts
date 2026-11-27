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
  | 'leon_goretzka';

export interface AthleteInfo {
  key: AthleteKey;
  name: string;
  sport: 'football';
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

export interface PlayerSelectionContext {
  screen?: 'home' | 'discover' | 'saved' | 'profile' | 'details';
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
   * Returns an ordered athlete pool suitable for rotating crossfade on a screen.
   */
  public getAthletePool(context: PlayerSelectionContext = {}): AthleteInfo[] {
    if (context.athleteKey && LOCAL_ATHLETE_ASSETS[context.athleteKey]) {
      return [LOCAL_ATHLETE_ASSETS[context.athleteKey]];
    }

    // Team context prioritized match
    const primary = this.selectAthlete(context);

    let baseKeys: AthleteKey[] = [];
    if (context.screen === 'discover') {
      baseKeys = ['nico_paz', 'michael_olise', 'leon_goretzka', 'raphinha', 'erling_haaland'];
    } else if (context.screen === 'saved') {
      baseKeys = ['cristiano_ronaldo', 'mohamed_salah', 'erling_haaland', 'raphinha'];
    } else if (context.screen === 'profile') {
      baseKeys = ['cristiano_ronaldo', 'raphinha', 'erling_haaland', 'mohamed_salah', 'michael_olise'];
    } else {
      baseKeys = FOOTBALL_KEYS;
    }

    // Ensure primary athlete is first in rotation without duplication
    const poolKeys = [primary.key, ...baseKeys.filter(k => k !== primary.key)];
    return poolKeys.map(k => LOCAL_ATHLETE_ASSETS[k]);
  }

  /**
   * Resolves the most appropriate athlete based on verified context,
   * avoiding accidental misidentification while ensuring variety across screens.
   */
  public selectAthlete(context: PlayerSelectionContext = {}): AthleteInfo {
    // 1. Explicit athlete key provided
    if (context.athleteKey && LOCAL_ATHLETE_ASSETS[context.athleteKey]) {
      return LOCAL_ATHLETE_ASSETS[context.athleteKey];
    }

    // 2. Match team context (Liverpool, Man City, Barca, Bayern, Como, Al Nassr)
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

    if (context.screen === 'profile') {
      const profilePool: AthleteKey[] = ['cristiano_ronaldo', 'raphinha', 'erling_haaland'];
      const key = profilePool[(dayOfMonth + offset) % profilePool.length];
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
