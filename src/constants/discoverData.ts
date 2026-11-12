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
  season: string;
  teamsCount: number;
  sport?: SportType;
}

export interface PopularLeague {
  id: string;
  name: string;
  country: string;
  description: string;
  logoUrl: string;
  currentMatchweek: string;
  sport?: SportType;
}

export interface PopularTeam {
  id: string;
  name: string;
  shortName: string;
  country: string;
  crestUrl: string;
  stadium: string;
  domesticTitle: string;
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
  kickoffDate: string;
  kickoffTime: string;
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
  poster?: string;
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
    season: '2024/25 Season',
    teamsCount: 20,
    sport: 'soccer',
  },
  {
    id: 'ucl',
    name: 'UEFA Champions League',
    shortName: 'UCL',
    country: 'Europe',
    region: 'International',
    logoUrl: LEAGUE_EMBLEMS['ucl'],
    accentColor: '#F8BE38',
    season: 'League Phase',
    teamsCount: 36,
    sport: 'soccer',
  },
  {
    id: 'nba',
    name: 'NBA Basketball',
    shortName: 'NBA',
    country: 'USA',
    region: 'North America',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png',
    accentColor: '#C9082A',
    season: '2024/25 Regular Season',
    teamsCount: 30,
    sport: 'basketball',
  },
  {
    id: 'nhl',
    name: 'NHL Hockey',
    shortName: 'NHL',
    country: 'North America',
    region: 'North America',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png',
    accentColor: '#08B3E5',
    season: '2024/25 Regular Season',
    teamsCount: 32,
    sport: 'hockey',
  },
  {
    id: 'ufc',
    name: 'UFC & Mixed Martial Arts',
    shortName: 'UFC',
    country: 'Global',
    region: 'International',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/mma.png',
    accentColor: '#EF4444',
    season: 'Championship Series',
    teamsCount: 20,
    sport: 'mma',
  },
  {
    id: 'laliga',
    name: 'LaLiga EA Sports',
    shortName: 'LaLiga',
    country: 'Spain',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['laliga'],
    accentColor: '#08B3E5',
    season: '2024/25 Season',
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
    season: '2024/25 Season',
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
    season: '2024/25 Season',
    teamsCount: 18,
    sport: 'soccer',
  },
  {
    id: 'nfl',
    name: 'NFL Football',
    shortName: 'NFL',
    country: 'USA',
    region: 'North America',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png',
    accentColor: '#F59E0B',
    season: '2024/25 Season',
    teamsCount: 32,
    sport: 'american_football',
  },
  {
    id: 'f1',
    name: 'Formula 1 World Championship',
    shortName: 'F1',
    country: 'Global',
    region: 'International',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/f1.png',
    accentColor: '#E10600',
    season: '2024/25 Season',
    teamsCount: 10,
    sport: 'motorsport',
  },
  {
    id: 'ligue1',
    name: 'Ligue 1 McDonald’s',
    shortName: 'Ligue 1',
    country: 'France',
    region: 'Europe',
    logoUrl: LEAGUE_EMBLEMS['ligue-1'],
    accentColor: '#091c3e',
    season: '2024/25 Season',
    teamsCount: 18,
    sport: 'soccer',
  },
  {
    id: 'tennis',
    name: 'ATP & WTA Tennis Tour',
    shortName: 'Tennis',
    country: 'Global',
    region: 'International',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/tennis.png',
    accentColor: '#10B981',
    season: '2025 World Tour',
    teamsCount: 32,
    sport: 'tennis',
  },
  {
    id: 'wwe',
    name: 'WWE World Wrestling',
    shortName: 'WWE',
    country: 'USA',
    region: 'Global',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/mma.png',
    accentColor: '#EF4444',
    season: 'Live Events',
    teamsCount: 16,
    sport: 'mma',
  },
  {
    id: 'cricket',
    name: 'ICC World Cricket Championship',
    shortName: 'Cricket',
    country: 'Global',
    region: 'International',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/cricket.png',
    accentColor: '#08B3E5',
    season: 'Championship Series',
    teamsCount: 10,
    sport: 'other',
  },
  {
    id: 'boxing',
    name: 'World Championship Boxing',
    shortName: 'Boxing',
    country: 'Global',
    region: 'International',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/boxing.png',
    accentColor: '#F59E0B',
    season: 'Title Bouts',
    teamsCount: 12,
    sport: 'mma',
  },
  {
    id: 'wc',
    name: 'FIFA World Cup',
    shortName: 'World Cup',
    country: 'International',
    region: 'Global',
    logoUrl: 'https://media.api-sports.io/football/leagues/1.png',
    accentColor: '#F8BE38',
    season: 'World Tournament',
    teamsCount: 32,
    sport: 'soccer',
  },
];

// ── 2. POPULAR LEAGUES (Section C) ──
export const POPULAR_LEAGUES: PopularLeague[] = [
  {
    id: 'league-pl',
    name: 'Premier League',
    country: 'England',
    description: 'The most watched and competitive league in world football',
    logoUrl: LEAGUE_EMBLEMS['premier-league'],
    currentMatchweek: 'Matchweek 28',
    sport: 'soccer',
  },
  {
    id: 'league-nba',
    name: 'National Basketball Association',
    country: 'USA',
    description: 'The pinnacle of global basketball, high-flying dunks, and elite superstars',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png',
    currentMatchweek: 'Regular Season',
    sport: 'basketball',
  },
  {
    id: 'league-ufc',
    name: 'Ultimate Fighting Championship',
    country: 'Global',
    description: 'Premier combat sports organization featuring undisputed title bouts',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/mma.png',
    currentMatchweek: 'Fight Night & PPVs',
    sport: 'mma',
  },
  {
    id: 'league-nhl',
    name: 'National Hockey League',
    country: 'North America',
    description: 'Fastest game on ice with blistering slapshots and intense rivalries',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png',
    currentMatchweek: 'Regular Season',
    sport: 'hockey',
  },
  {
    id: 'league-laliga',
    name: 'LaLiga',
    country: 'Spain',
    description: 'Home of El Clásico, technical mastery, and continental champions',
    logoUrl: LEAGUE_EMBLEMS['laliga'],
    currentMatchweek: 'Matchweek 27',
    sport: 'soccer',
  },
  {
    id: 'league-seriea',
    name: 'Serie A',
    country: 'Italy',
    description: 'Tactical masterclasses, legendary derbies, and historic clubs',
    logoUrl: LEAGUE_EMBLEMS['serie-a'],
    currentMatchweek: 'Matchweek 28',
    sport: 'soccer',
  },
  {
    id: 'league-bundesliga',
    name: 'Bundesliga',
    country: 'Germany',
    description: 'Electrifying atmosphere, highest goals-per-game, and iconic fanbases',
    logoUrl: LEAGUE_EMBLEMS['bundesliga'],
    currentMatchweek: 'Matchday 25',
    sport: 'soccer',
  },
  {
    id: 'league-nfl',
    name: 'NFL Football',
    country: 'USA',
    description: 'Gridiron drama, Super Bowl contenders, and Thursday/Sunday Night showdowns',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png',
    currentMatchweek: 'Week 11',
    sport: 'american_football',
  },
];

// ── 3. POPULAR TEAMS (Section D) ──
export const POPULAR_TEAMS: PopularTeam[] = [
  {
    id: 'team-real-madrid',
    name: 'Real Madrid',
    shortName: 'RMA',
    country: 'Spain',
    crestUrl: CLUB_CRESTS['real-madrid'],
    stadium: 'Santiago Bernabéu',
    domesticTitle: '15x European Champions',
    sport: 'soccer',
  },
  {
    id: 'team-barcelona',
    name: 'FC Barcelona',
    shortName: 'BAR',
    country: 'Spain',
    crestUrl: CLUB_CRESTS['barcelona'],
    stadium: 'Camp Nou',
    domesticTitle: 'Blaugrana & La Masia Magic',
    sport: 'soccer',
  },
  {
    id: 'team-lakers',
    name: 'Los Angeles Lakers',
    shortName: 'LAL',
    country: 'USA',
    crestUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/lal.png',
    stadium: 'Crypto.com Arena',
    domesticTitle: '17x NBA Champions',
    sport: 'basketball',
  },
  {
    id: 'team-warriors',
    name: 'Golden State Warriors',
    shortName: 'GSW',
    country: 'USA',
    crestUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/gsw.png',
    stadium: 'Chase Center',
    domesticTitle: '7x NBA Champions',
    sport: 'basketball',
  },
  {
    id: 'team-celtics',
    name: 'Boston Celtics',
    shortName: 'BOS',
    country: 'USA',
    crestUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/bos.png',
    stadium: 'TD Garden',
    domesticTitle: '18x NBA Champions',
    sport: 'basketball',
  },
  {
    id: 'team-man-city',
    name: 'Manchester City',
    shortName: 'MCI',
    country: 'England',
    crestUrl: CLUB_CRESTS['man-city'],
    stadium: 'Etihad Stadium',
    domesticTitle: 'Reigning English Champions',
    sport: 'soccer',
  },
  {
    id: 'team-arsenal',
    name: 'Arsenal',
    shortName: 'ARS',
    country: 'England',
    crestUrl: CLUB_CRESTS['arsenal'],
    stadium: 'Emirates Stadium',
    domesticTitle: 'North London Gunners',
    sport: 'soccer',
  },
  {
    id: 'team-liverpool',
    name: 'Liverpool',
    shortName: 'LIV',
    country: 'England',
    crestUrl: CLUB_CRESTS['liverpool'],
    stadium: 'Anfield',
    domesticTitle: 'Anfield Fortress & European Elite',
    sport: 'soccer',
  },
  {
    id: 'team-rangers-nhl',
    name: 'New York Rangers',
    shortName: 'NYR',
    country: 'USA',
    crestUrl: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/nyr.png',
    stadium: 'Madison Square Garden',
    domesticTitle: 'Original Six Hockey Club',
    sport: 'hockey',
  },
];

// ── 4. UPCOMING HIGHLIGHTS (Section E) ──
export const UPCOMING_HIGHLIGHTS: DiscoverMatchup[] = [];

