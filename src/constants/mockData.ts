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
];

export const LIVE_MATCHES: LiveMatch[] = [
  {
    id: 'match-1',
    title: 'Real Madrid vs Man City',
    homeTeam: 'Real Madrid',
    awayTeam: 'Man City',
    competition: 'UEFA Champions League',
    score: { home: 1, away: 1 },
    minute: 68,
    // High quality stadium match image
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    hasLiveStream: true,
  },
  {
    id: 'match-2',
    title: 'Arsenal vs Liverpool',
    homeTeam: 'Arsenal',
    awayTeam: 'Liverpool',
    competition: 'Premier League',
    score: { home: 2, away: 1 },
    minute: 74,
    imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
    hasLiveStream: true,
  },
  {
    id: 'match-3',
    title: 'Barcelona vs PSG',
    homeTeam: 'Barcelona',
    awayTeam: 'PSG',
    competition: 'UEFA Champions League',
    score: { home: 0, away: 2 },
    minute: 53,
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    hasLiveStream: true,
  },
  {
    id: 'match-4',
    title: 'Inter vs AC Milan',
    homeTeam: 'Inter',
    awayTeam: 'AC Milan',
    competition: 'Serie A',
    score: { home: 1, away: 0 },
    minute: 82,
    imageUrl: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=800&q=80',
    hasLiveStream: true,
  },
];

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
