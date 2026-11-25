import { CLUB_CRESTS, LEAGUE_EMBLEMS } from './crests';
import { SportType } from './mockData';

export interface DiscoverCompetition {
  id: string;
  name: string;
  shortName: string;
  country: string;
  region: string;
  logoUrl: string;
  accentColor: string;
  season?: string;
  teamsCount?: number;
  sport?: SportType;
}

export interface PopularLeague {
  id: string;
  name: string;
  country: string;
  description: string;
  logoUrl: string;
  currentMatchweek?: string;
  sport?: SportType;
}

export interface PopularTeam {
  id: string;
  name: string;
  shortName: string;
  country: string;
  crestUrl: string;
  stadium?: string;
  domesticTitle?: string;
  competitionId?: string;
  competitionName?: string;
  espnId?: string;
  espnSport?: string;
  espnLeague?: string;
  sport?: SportType;
}

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'FT';

export interface FighterProfile {
  id: string;
  name: string;
  nickname?: string;
  record: string;
  country: string;
  flagUrl: string;
  photoUrl: string;
  avatar?: string;
  height: string;
  weight: string;
  reach: string;
  stance: string;
}

export interface DiscoverMatchup {
  id: string;
  competition: string;
  competitionLogo: string;
  status: MatchStatus;
  isLive?: boolean;
  kickoffDate: string;
  kickoffTime: string;
  kickoffTimestamp?: number;
  rawDate?: string;
  playTime?: string;
  minute?: number;
  sport?: SportType;
  homeTeam: {
    id: string;
    name: string;
    crestUrl: string;
    score?: number;
  };
  awayTeam: {
    id: string;
    name: string;
    crestUrl: string;
    score?: number;
  };
  venue: string;
  hasLiveBroadcast: boolean;
  isReminderSet?: boolean;
  streamUrl?: string;
  streams?: Array<{ id: string; name: string; url: string }>;
  poster?: string | null;
  matchBannerUrl?: string | null;
  fighter1?: FighterProfile;
  fighter2?: FighterProfile;
}

// ── 1. EXPLORE COMPETITIONS (Section B) ──
export const EXPLORE_COMPETITIONS: DiscoverCompetition[] = [
  {
    id: 'pl',
    name: 'Premier League',
    shortName: 'EPL',
    country: 'England',
    region: 'United Kingdom',
    logoUrl: LEAGUE_EMBLEMS['premier-league'],
    accentColor: '#7952FC',
    teamsCount: 20,
    sport: 'soccer',
  },
  {
    id: 'ucl',
    name: 'UEFA Champions League',
    shortName: 'UCL',
    country: 'Europe',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['ucl'],
    accentColor: '#F8BE38',
    teamsCount: 36,
    sport: 'soccer',
  },
  {
    id: 'uel',
    name: 'UEFA Europa League',
    shortName: 'UEL',
    country: 'Europe',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['uel'],
    accentColor: '#F97316',
    teamsCount: 36,
    sport: 'soccer',
  },
  {
    id: 'uecl',
    name: 'UEFA Conference League',
    shortName: 'UECL',
    country: 'Europe',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['uecl'],
    accentColor: '#22C55E',
    teamsCount: 36,
    sport: 'soccer',
  },
  {
    id: 'nba',
    name: 'NBA Basketball',
    shortName: 'NBA',
    country: 'USA',
    region: 'North America',
    logoUrl: LEAGUE_EMBLEMS['nba'],
    accentColor: '#C9082A',
    teamsCount: 30,
    sport: 'basketball',
  },
  {
    id: 'euroleague',
    name: 'EuroLeague Basketball',
    shortName: 'EuroLeague',
    country: 'Europe',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['euroleague'],
    accentColor: '#FF5500',
    teamsCount: 18,
    sport: 'basketball',
  },
  {
    id: 'nhl',
    name: 'NHL Hockey',
    shortName: 'NHL',
    country: 'North America',
    region: 'North America',
    logoUrl: LEAGUE_EMBLEMS['nhl'],
    accentColor: '#08B3E5',
    teamsCount: 32,
    sport: 'hockey',
  },
  {
    id: 'laliga',
    name: 'LaLiga EA Sports',
    shortName: 'LaLiga',
    country: 'Spain',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['laliga'],
    accentColor: '#08B3E5',
    teamsCount: 20,
    sport: 'soccer',
  },
  {
    id: 'seriea',
    name: 'Serie A Enilive',
    shortName: 'Serie A',
    country: 'Italy',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['serie-a'],
    accentColor: '#F04E6E',
    teamsCount: 20,
    sport: 'soccer',
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    shortName: 'Bundesliga',
    country: 'Germany',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['bundesliga'],
    accentColor: '#22C55E',
    teamsCount: 18,
    sport: 'soccer',
  },
  {
    id: 'ligue1',
    name: 'Ligue 1 McDonald’s',
    shortName: 'Ligue 1',
    country: 'France',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['ligue-1'],
    accentColor: '#091c3e',
    teamsCount: 18,
    sport: 'soccer',
  },
  {
    id: 'liga_mx',
    name: 'Liga MX',
    shortName: 'Liga MX',
    country: 'Mexico',
    region: 'North America',
    logoUrl: LEAGUE_EMBLEMS['liga-mx'],
    accentColor: '#16A34A',
    teamsCount: 18,
    sport: 'soccer',
  },
  {
    id: 'argentina_primera',
    name: 'Liga Profesional Argentina',
    shortName: 'LPF',
    country: 'Argentina',
    region: 'South America',
    logoUrl: LEAGUE_EMBLEMS['argentina-primera'],
    accentColor: '#38BDF8',
    teamsCount: 28,
    sport: 'soccer',
  },
  {
    id: 'afc_champions_league',
    name: 'AFC Champions League Elite',
    shortName: 'ACL Elite',
    country: 'Asia',
    region: 'Asia',
    logoUrl: LEAGUE_EMBLEMS['afc-champions-league'],
    accentColor: '#6366F1',
    teamsCount: 24,
    sport: 'soccer',
  },
  {
    id: 'ukrainian_premier',
    name: 'Ukrainian Premier League',
    shortName: 'UPL',
    country: 'Ukraine',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['ukrainian-premier'],
    accentColor: '#FACC15',
    teamsCount: 16,
    sport: 'soccer',
  },
  {
    id: 'nfl',
    name: 'NFL Football',
    shortName: 'NFL',
    country: 'USA',
    region: 'North America',
    logoUrl: LEAGUE_EMBLEMS['nfl'],
    accentColor: '#F59E0B',
    teamsCount: 32,
    sport: 'american_football',
  },
  {
    id: 'f1',
    name: 'Formula 1 World Championship',
    shortName: 'F1',
    country: 'Global',
    region: 'International',
    logoUrl: LEAGUE_EMBLEMS['f1'],
    accentColor: '#E10600',
    teamsCount: 10,
    sport: 'motorsport',
  },
  {
    id: 'del',
    name: 'Germany DEL',
    shortName: 'DEL',
    country: 'Germany',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['del'],
    accentColor: '#DC2626',
    teamsCount: 14,
    sport: 'hockey',
  },
  {
    id: 'icehl',
    name: 'Austrian ICE Hockey League',
    shortName: 'ICEHL',
    country: 'Austria',
    region: 'Central Europe',
    logoUrl: LEAGUE_EMBLEMS['icehl'],
    accentColor: '#0284C7',
    teamsCount: 13,
    sport: 'hockey',
  },
  {
    id: 'hockey_allsvenskan',
    name: 'HockeyAllsvenskan',
    shortName: 'Allsvenskan',
    country: 'Sweden',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['hockey-allsvenskan'],
    accentColor: '#0F172A',
    teamsCount: 14,
    sport: 'hockey',
  },
  {
    id: 'russia_mhl',
    name: 'Russia MHL',
    shortName: 'MHL',
    country: 'Russia',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['russia-mhl'],
    accentColor: '#1D4ED8',
    teamsCount: 37,
    sport: 'hockey',
  },
  {
    id: 'tennis',
    name: 'ATP & WTA Tennis Tour',
    shortName: 'Tennis',
    country: 'Global',
    region: 'International',
    logoUrl: LEAGUE_EMBLEMS['tennis'],
    accentColor: '#10B981',
    sport: 'tennis',
  },
  {
    id: 'cricket',
    name: 'ICC World Cricket Championship',
    shortName: 'Cricket',
    country: 'Global',
    region: 'International',
    logoUrl: LEAGUE_EMBLEMS['cricket'],
    accentColor: '#08B3E5',
    sport: 'cricket',
  },
  {
    id: 'wc',
    name: 'FIFA World Cup',
    shortName: 'World Cup',
    country: 'International',
    region: 'Global',
    logoUrl: LEAGUE_EMBLEMS['world-cup'],
    accentColor: '#F8BE38',
    sport: 'soccer',
  },
  {
    id: 'j1_league',
    name: 'Meiji Yasuda J1 League',
    shortName: 'J1 League',
    country: 'Japan',
    region: 'East Asia',
    logoUrl: LEAGUE_EMBLEMS['j1-league'],
    accentColor: '#E60012',
    teamsCount: 20,
    sport: 'soccer',
  },
  {
    id: 'saudi_pro',
    name: 'Saudi Pro League',
    shortName: 'Roshn Saudi League',
    country: 'Saudi Arabia',
    region: 'Middle East',
    logoUrl: LEAGUE_EMBLEMS['saudi-pro-league'],
    accentColor: '#1E3A8A',
    teamsCount: 18,
    sport: 'soccer',
  },
  {
    id: 'saudi_first_division',
    name: 'Saudi First Division League',
    shortName: 'Saudi 1st Div',
    country: 'Saudi Arabia',
    region: 'Middle East',
    logoUrl: LEAGUE_EMBLEMS['saudi-first-division'],
    accentColor: '#1A472A',
    teamsCount: 18,
    sport: 'soccer',
  },
  {
    id: 'fifa_u17',
    name: 'FIFA U-17 World Cup',
    shortName: 'FIFA U-17',
    country: 'International',
    region: 'Global',
    logoUrl: LEAGUE_EMBLEMS['fifa-u-17'],
    accentColor: '#0055A5',
    teamsCount: 24,
    sport: 'soccer',
  },
  {
    id: 'csl',
    name: 'Chinese Super League',
    shortName: 'CSL',
    country: 'China',
    region: 'East Asia',
    logoUrl: LEAGUE_EMBLEMS['csl'],
    accentColor: '#D81E06',
    teamsCount: 16,
    sport: 'soccer',
  },
  {
    id: 'egyptian_premier',
    name: 'Egyptian Premier League',
    shortName: 'Egyptian Premier',
    country: 'Egypt',
    region: 'North Africa',
    logoUrl: LEAGUE_EMBLEMS['egyptian-premier'],
    accentColor: '#C8102E',
    teamsCount: 18,
    sport: 'soccer',
  },
  {
    id: 'isl',
    name: 'Indian Super League',
    shortName: 'ISL',
    country: 'India',
    region: 'South Asia',
    logoUrl: LEAGUE_EMBLEMS['isl'],
    accentColor: '#FF6F00',
    teamsCount: 13,
    sport: 'soccer',
  },
  {
    id: 'kenyan_premier',
    name: 'Kenyan Premier League',
    shortName: 'FKF Premier League',
    country: 'Kenya',
    region: 'East Africa',
    logoUrl: LEAGUE_EMBLEMS['kenyan-premier'],
    accentColor: '#008000',
    teamsCount: 18,
    sport: 'soccer',
  },
];

// ── 2. POPULAR LEAGUES (Section C) ──
export const POPULAR_LEAGUES: PopularLeague[] = [
  {
    id: 'pl',
    name: 'Premier League',
    country: 'England',
    description: 'Top-flight English club football',
    logoUrl: LEAGUE_EMBLEMS['premier-league'],
    sport: 'soccer',
  },
  {
    id: 'ucl',
    name: 'UEFA Champions League',
    country: 'Europe',
    description: 'Premier European club tournament',
    logoUrl: LEAGUE_EMBLEMS['ucl'],
    sport: 'soccer',
  },
  {
    id: 'nba',
    name: 'NBA Basketball',
    country: 'USA',
    description: 'North American pro basketball league',
    logoUrl: LEAGUE_EMBLEMS['nba'],
    sport: 'basketball',
  },
  {
    id: 'nhl',
    name: 'NHL Hockey',
    country: 'North America',
    description: 'North American pro ice hockey league',
    logoUrl: LEAGUE_EMBLEMS['nhl'],
    sport: 'hockey',
  },
  {
    id: 'laliga',
    name: 'LaLiga EA Sports',
    country: 'Spain',
    description: 'Top-flight Spanish club football',
    logoUrl: LEAGUE_EMBLEMS['laliga'],
    sport: 'soccer',
  },
  {
    id: 'seriea',
    name: 'Serie A Enilive',
    country: 'Italy',
    description: 'Top-flight Italian club football',
    logoUrl: LEAGUE_EMBLEMS['serie-a'],
    sport: 'soccer',
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    country: 'Germany',
    description: 'Top-flight German club football',
    logoUrl: LEAGUE_EMBLEMS['bundesliga'],
    sport: 'soccer',
  },
  {
    id: 'nfl',
    name: 'NFL Football',
    country: 'USA',
    description: 'National Football League',
    logoUrl: LEAGUE_EMBLEMS['nfl'],
    sport: 'american_football',
  },
];

// ── 3. POPULAR TEAMS (Section D Baseline Seed Before Live Hydration) ──
export const POPULAR_TEAMS: PopularTeam[] = [
  {
    id: 'team-real-madrid',
    name: 'Real Madrid',
    shortName: 'RMA',
    country: 'Spain',
    crestUrl: CLUB_CRESTS['real-madrid'],
    stadium: 'Santiago Bernabéu',
    competitionId: 'laliga',
    competitionName: 'LaLiga EA Sports',
    espnId: '86',
    espnSport: 'soccer',
    espnLeague: 'esp.1',
    sport: 'soccer',
  },
  {
    id: 'team-barcelona',
    name: 'FC Barcelona',
    shortName: 'BAR',
    country: 'Spain',
    crestUrl: CLUB_CRESTS['barcelona'],
    stadium: 'Spotify Camp Nou',
    competitionId: 'laliga',
    competitionName: 'LaLiga EA Sports',
    espnId: '83',
    espnSport: 'soccer',
    espnLeague: 'esp.1',
    sport: 'soccer',
  },
  {
    id: 'team-arsenal',
    name: 'Arsenal',
    shortName: 'ARS',
    country: 'England',
    crestUrl: CLUB_CRESTS['arsenal'],
    stadium: 'Emirates Stadium',
    competitionId: 'pl',
    competitionName: 'Premier League',
    espnId: '359',
    espnSport: 'soccer',
    espnLeague: 'eng.1',
    sport: 'soccer',
  },
  {
    id: 'team-man-city',
    name: 'Manchester City',
    shortName: 'MCI',
    country: 'England',
    crestUrl: CLUB_CRESTS['man-city'],
    stadium: 'Etihad Stadium',
    competitionId: 'pl',
    competitionName: 'Premier League',
    espnId: '382',
    espnSport: 'soccer',
    espnLeague: 'eng.1',
    sport: 'soccer',
  },
  {
    id: 'team-liverpool',
    name: 'Liverpool',
    shortName: 'LIV',
    country: 'England',
    crestUrl: CLUB_CRESTS['liverpool'],
    stadium: 'Anfield',
    competitionId: 'pl',
    competitionName: 'Premier League',
    espnId: '364',
    espnSport: 'soccer',
    espnLeague: 'eng.1',
    sport: 'soccer',
  },
  {
    id: 'team-lakers',
    name: 'Los Angeles Lakers',
    shortName: 'LAL',
    country: 'USA',
    crestUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/lal.png',
    stadium: 'Crypto.com Arena',
    competitionId: 'nba',
    competitionName: 'NBA Basketball',
    espnId: '13',
    espnSport: 'basketball',
    espnLeague: 'nba',
    sport: 'basketball',
  },
  {
    id: 'team-warriors',
    name: 'Golden State Warriors',
    shortName: 'GSW',
    country: 'USA',
    crestUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/gsw.png',
    stadium: 'Chase Center',
    competitionId: 'nba',
    competitionName: 'NBA Basketball',
    espnId: '9',
    espnSport: 'basketball',
    espnLeague: 'nba',
    sport: 'basketball',
  },
  {
    id: 'team-celtics',
    name: 'Boston Celtics',
    shortName: 'BOS',
    country: 'USA',
    crestUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/bos.png',
    stadium: 'TD Garden',
    competitionId: 'nba',
    competitionName: 'NBA Basketball',
    espnId: '2',
    espnSport: 'basketball',
    espnLeague: 'nba',
    sport: 'basketball',
  },
  {
    id: 'team-rangers-nhl',
    name: 'New York Rangers',
    shortName: 'NYR',
    country: 'USA',
    crestUrl: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/nyr.png',
    stadium: 'Madison Square Garden',
    competitionId: 'nhl',
    competitionName: 'NHL Hockey',
    espnId: '13',
    espnSport: 'hockey',
    espnLeague: 'nhl',
    sport: 'hockey',
  },
];

// ── 4. UPCOMING HIGHLIGHTS (Section E) ──
export const UPCOMING_HIGHLIGHTS: DiscoverMatchup[] = [];

