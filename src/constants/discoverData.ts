import { CLUB_CRESTS, LEAGUE_EMBLEMS } from './crests';

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
}

export interface PopularLeague {
  id: string;
  name: string;
  country: string;
  description: string;
  logoUrl: string;
  currentMatchweek: string;
}

export interface PopularTeam {
  id: string;
  name: string;
  shortName: string;
  country: string;
  crestUrl: string;
  stadium: string;
  domesticTitle: string;
}

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'FT';

export interface DiscoverMatchup {
  id: string;
  competition: string;
  competitionLogo: string;
  status: MatchStatus;
  kickoffDate: string;
  kickoffTime: string;
  minute?: number;
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
  },
  {
    id: 'league-laliga',
    name: 'LaLiga',
    country: 'Spain',
    description: 'Home of El Clásico, technical mastery, and continental champions',
    logoUrl: LEAGUE_EMBLEMS['laliga'],
    currentMatchweek: 'Matchweek 27',
  },
  {
    id: 'league-seriea',
    name: 'Serie A',
    country: 'Italy',
    description: 'Tactical masterclasses, legendary derbies, and historic clubs',
    logoUrl: LEAGUE_EMBLEMS['serie-a'],
    currentMatchweek: 'Matchweek 28',
  },
  {
    id: 'league-bundesliga',
    name: 'Bundesliga',
    country: 'Germany',
    description: 'Electrifying atmosphere, highest goals-per-game, and iconic fanbases',
    logoUrl: LEAGUE_EMBLEMS['bundesliga'],
    currentMatchweek: 'Matchday 25',
  },
  {
    id: 'league-ligue1',
    name: 'Ligue 1',
    country: 'France',
    description: 'Elite talent incubator with explosive attacking football',
    logoUrl: LEAGUE_EMBLEMS['ligue-1'],
    currentMatchweek: 'Matchweek 26',
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
  },
  {
    id: 'team-barcelona',
    name: 'FC Barcelona',
    shortName: 'BAR',
    country: 'Spain',
    crestUrl: CLUB_CRESTS['barcelona'],
    stadium: 'Camp Nou',
    domesticTitle: 'Blaugrana & La Masia Magic',
  },
  {
    id: 'team-man-city',
    name: 'Manchester City',
    shortName: 'MCI',
    country: 'England',
    crestUrl: CLUB_CRESTS['man-city'],
    stadium: 'Etihad Stadium',
    domesticTitle: 'Reigning English Champions',
  },
  {
    id: 'team-arsenal',
    name: 'Arsenal',
    shortName: 'ARS',
    country: 'England',
    crestUrl: CLUB_CRESTS['arsenal'],
    stadium: 'Emirates Stadium',
    domesticTitle: 'North London Gunners',
  },
  {
    id: 'team-liverpool',
    name: 'Liverpool',
    shortName: 'LIV',
    country: 'England',
    crestUrl: CLUB_CRESTS['liverpool'],
    stadium: 'Anfield',
    domesticTitle: 'Anfield Fortress & European Elite',
  },
  {
    id: 'team-man-utd',
    name: 'Manchester United',
    shortName: 'MUN',
    country: 'England',
    crestUrl: CLUB_CRESTS['man-utd'],
    stadium: 'Old Trafford',
    domesticTitle: 'Historic Red Devils',
  },
];

// ── 4. UPCOMING HIGHLIGHTS (Section E) ──
export const UPCOMING_HIGHLIGHTS: DiscoverMatchup[] = [
  {
    id: 'matchup-1',
    competition: 'UEFA Champions League',
    competitionLogo: LEAGUE_EMBLEMS['ucl'],
    status: 'LIVE',
    kickoffDate: 'Today',
    kickoffTime: '20:00 GMT',
    minute: 68,
    homeTeam: {
      id: 'team-real-madrid',
      name: 'Real Madrid',
      crestUrl: CLUB_CRESTS['real-madrid'],
      score: 2,
    },
    awayTeam: {
      id: 'team-man-city',
      name: 'Man City',
      crestUrl: CLUB_CRESTS['man-city'],
      score: 1,
    },
    venue: 'Santiago Bernabéu, Madrid',
    hasLiveBroadcast: true,
  },
  {
    id: 'matchup-2',
    competition: 'Premier League',
    competitionLogo: LEAGUE_EMBLEMS['premier-league'],
    status: 'UPCOMING',
    kickoffDate: 'Tomorrow',
    kickoffTime: '17:30 GMT',
    homeTeam: {
      id: 'team-arsenal',
      name: 'Arsenal',
      crestUrl: CLUB_CRESTS['arsenal'],
    },
    awayTeam: {
      id: 'team-liverpool',
      name: 'Liverpool',
      crestUrl: CLUB_CRESTS['liverpool'],
    },
    venue: 'Emirates Stadium, London',
    hasLiveBroadcast: true,
    isReminderSet: true,
  },
  {
    id: 'matchup-3',
    competition: 'LaLiga EA Sports',
    competitionLogo: LEAGUE_EMBLEMS['laliga'],
    status: 'UPCOMING',
    kickoffDate: 'Sunday',
    kickoffTime: '21:00 GMT',
    homeTeam: {
      id: 'team-barcelona',
      name: 'Barcelona',
      crestUrl: CLUB_CRESTS['barcelona'],
    },
    awayTeam: {
      id: 'team-atletico-madrid',
      name: 'Atlético Madrid',
      crestUrl: CLUB_CRESTS['atletico-madrid'],
    },
    venue: 'Estadi Olímpic Lluís Companys',
    hasLiveBroadcast: true,
    isReminderSet: false,
  },
  {
    id: 'matchup-4',
    competition: 'Serie A Enilive',
    competitionLogo: LEAGUE_EMBLEMS['serie-a'],
    status: 'UPCOMING',
    kickoffDate: 'Sunday',
    kickoffTime: '19:45 GMT',
    homeTeam: {
      id: 'team-inter',
      name: 'Inter',
      crestUrl: CLUB_CRESTS['inter'],
    },
    awayTeam: {
      id: 'team-juventus',
      name: 'Juventus',
      crestUrl: CLUB_CRESTS['juventus'],
    },
    venue: 'San Siro, Milan',
    hasLiveBroadcast: true,
    isReminderSet: false,
  },
];
