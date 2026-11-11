/**
 * BALLIVE Mock Data
 * Realistic development fixtures, competition categories, and featured competitions
 */

export interface CompetitionCategory {
  id: string;
  name: string;
  shortLabel: string;
  color: string;
  iconName: 'trophy' | 'award' | 'shield' | 'flame' | 'radio';
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
}

export interface FeaturedCompetition {
  id: string;
  name: string;
  country: string;
  matchesCount: number;
  season: string;
  crestUrl: string;
  verified: boolean;
}

export const COMPETITION_CATEGORIES: CompetitionCategory[] = [
  {
    id: 'pl',
    name: 'Premier League',
    shortLabel: 'Premier',
    color: '#7952FC',
    iconName: 'trophy',
  },
  {
    id: 'ucl',
    name: 'Champions League',
    shortLabel: 'UCL',
    color: '#F8BE38',
    iconName: 'award',
  },
  {
    id: 'laliga',
    name: 'LaLiga',
    shortLabel: 'LaLiga',
    color: '#08B3E5',
    iconName: 'shield',
  },
  {
    id: 'seriea',
    name: 'Serie A',
    shortLabel: 'Serie A',
    color: '#F04E6E',
    iconName: 'flame',
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    shortLabel: 'Bundesliga',
    color: '#22C55E',
    iconName: 'radio',
  },
  {
    id: 'nba',
    name: 'NBA Basketball',
    shortLabel: 'NBA',
    color: '#C9082A',
    iconName: 'trophy',
  },
  {
    id: 'nhl',
    name: 'NHL Hockey',
    shortLabel: 'NHL',
    color: '#000000',
    iconName: 'shield',
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
  },
  {
    id: 'comp-pl',
    name: 'Premier League',
    country: 'England',
    matchesCount: 10,
    season: '2024/25 Season',
    crestUrl: 'https://media.api-sports.io/football/leagues/39.png',
    verified: true,
  },
  {
    id: 'comp-laliga',
    name: 'LaLiga EA Sports',
    country: 'Spain',
    matchesCount: 6,
    season: '2024/25 Season',
    crestUrl: 'https://media.api-sports.io/football/leagues/140.png',
    verified: true,
  },
  {
    id: 'comp-seriea',
    name: 'Serie A Enilive',
    country: 'Italy',
    matchesCount: 7,
    season: '2024/25 Season',
    crestUrl: 'https://media.api-sports.io/football/leagues/135.png',
    verified: true,
  },
  {
    id: 'comp-bundesliga',
    name: 'Bundesliga',
    country: 'Germany',
    matchesCount: 5,
    season: '2024/25 Season',
    crestUrl: 'https://media.api-sports.io/football/leagues/78.png',
    verified: true,
  },
];
