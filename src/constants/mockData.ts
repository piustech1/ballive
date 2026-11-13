/**
 * BALLIVE Mock Data
 * Realistic development fixtures, competition categories, and featured competitions
 */

export type SportType =
  | 'soccer'
  | 'basketball'
  | 'hockey'
  | 'mma'
  | 'american_football'
  | 'tennis'
  | 'motorsport'
  | 'other';

export interface CompetitionCategory {
  id: string;
  name: string;
  shortLabel: string;
  color: string;
  iconName: 'trophy' | 'award' | 'shield' | 'flame' | 'radio';
  sport?: SportType;
}

export interface LiveMatch {
  id: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  score: { home: number; away: number };
  minute: number;
  imageUrl: string;
  hasLiveStream: boolean;
  streamUrl?: string;
  streams?: Array<{ id: string; name: string; url: string }>;
  homeBadge?: string;
  awayBadge?: string;
  sport?: SportType;
  status?: 'LIVE' | 'FT' | 'UPCOMING';
  kickoffTime?: string;
  time?: string;
  isLive?: boolean;
  playTime?: string;
  venue?: string;
}

export interface FeaturedCompetition {
  id: string;
  name: string;
  country: string;
  matchesCount: number;
  season: string;
  crestUrl: string;
  verified: boolean;
  sport?: SportType;
}

export const COMPETITION_CATEGORIES: CompetitionCategory[] = [
  {
    id: 'all',
    name: 'All Sports',
    shortLabel: 'All',
    color: '#7952FC',
    iconName: 'flame',
  },
  {
    id: 'football',
    name: 'Football',
    shortLabel: 'Football',
    color: '#22C55E',
    iconName: 'trophy',
    sport: 'soccer',
  },
  {
    id: 'nba',
    name: 'NBA Basketball',
    shortLabel: 'NBA',
    color: '#C9082A',
    iconName: 'trophy',
    sport: 'basketball',
  },
  {
    id: 'nhl',
    name: 'NHL Hockey',
    shortLabel: 'NHL',
    color: '#08B3E5',
    iconName: 'shield',
    sport: 'hockey',
  },
  {
    id: 'mma',
    name: 'UFC & Combat',
    shortLabel: 'UFC/WWE',
    color: '#EF4444',
    iconName: 'award',
    sport: 'mma',
  },
  {
    id: 'nfl',
    name: 'NFL Football',
    shortLabel: 'NFL',
    color: '#F59E0B',
    iconName: 'shield',
    sport: 'american_football',
  },
  {
    id: 'motorsport',
    name: 'Formula 1',
    shortLabel: 'F1',
    color: '#E10600',
    iconName: 'flame',
    sport: 'motorsport',
  },
  {
    id: 'tennis',
    name: 'Tennis Tour',
    shortLabel: 'Tennis',
    color: '#10B981',
    iconName: 'award',
    sport: 'tennis',
  },
];

export const LIVE_MATCHES: LiveMatch[] = [];

export const FEATURED_COMPETITIONS: FeaturedCompetition[] = [
  {
    id: 'comp-ucl',
    name: 'UEFA Champions League',
    country: 'Europe',
    matchesCount: 8,
    season: '2024/25 Season',
    crestUrl: 'https://media.api-sports.io/football/leagues/2.png',
    verified: true,
    sport: 'soccer',
  },
  {
    id: 'comp-pl',
    name: 'Premier League',
    country: 'England',
    matchesCount: 10,
    season: '2024/25 Season',
    crestUrl: 'https://media.api-sports.io/football/leagues/39.png',
    verified: true,
    sport: 'soccer',
  },
  {
    id: 'comp-nba',
    name: 'NBA Basketball',
    country: 'USA',
    matchesCount: 12,
    season: '2024/25 Regular Season',
    crestUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png',
    verified: true,
    sport: 'basketball',
  },
  {
    id: 'comp-nhl',
    name: 'NHL Hockey',
    country: 'North America',
    matchesCount: 8,
    season: '2024/25 Regular Season',
    crestUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png',
    verified: true,
    sport: 'hockey',
  },
  {
    id: 'comp-ufc',
    name: 'UFC & Mixed Martial Arts',
    country: 'Global',
    matchesCount: 5,
    season: 'Championship Series',
    crestUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/mma.png',
    verified: true,
    sport: 'mma',
  },
  {
    id: 'comp-laliga',
    name: 'LaLiga EA Sports',
    country: 'Spain',
    matchesCount: 6,
    season: '2024/25 Season',
    crestUrl: 'https://media.api-sports.io/football/leagues/140.png',
    verified: true,
    sport: 'soccer',
  },
  {
    id: 'comp-seriea',
    name: 'Serie A Enilive',
    country: 'Italy',
    matchesCount: 7,
    season: '2024/25 Season',
    crestUrl: 'https://media.api-sports.io/football/leagues/135.png',
    verified: true,
    sport: 'soccer',
  },
  {
    id: 'comp-bundesliga',
    name: 'Bundesliga',
    country: 'Germany',
    matchesCount: 5,
    season: '2024/25 Season',
    crestUrl: 'https://media.api-sports.io/football/leagues/78.png',
    verified: true,
    sport: 'soccer',
  },
  {
    id: 'comp-nfl',
    name: 'NFL Football',
    country: 'USA',
    matchesCount: 14,
    season: '2024/25 Season',
    crestUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png',
    verified: true,
    sport: 'american_football',
  },
  {
    id: 'comp-f1',
    name: 'Formula 1 World Championship',
    country: 'Global',
    matchesCount: 24,
    season: '2025 Grand Prix Season',
    crestUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/f1.png',
    verified: true,
    sport: 'motorsport',
  },
  {
    id: 'comp-tennis',
    name: 'ATP & WTA Tennis Tour',
    country: 'Global',
    matchesCount: 16,
    season: '2025 Tour Season',
    crestUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/tennis.png',
    verified: true,
    sport: 'tennis',
  },
];

