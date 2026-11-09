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
    id: 'fb-pl-560639',
    title: 'Manchester United vs Aston Villa',
    homeTeam: 'Manchester United',
    awayTeam: 'Aston Villa',
    competition: 'Premier League',
    score: { home: 4, away: 4 },
    minute: 88,
    imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
    hasLiveStream: true,
    homeBadge: 'https://crests.football-data.org/66.png',
    awayBadge: 'https://crests.football-data.org/58.png',
    streamUrl: 'https://dag.s-u.in/stream/tv/moviebay_sport_cdn_ch_xx_sky-sports-premier-league-fhd-uk.json',
    streams: [
      { id: 'srv-pl', name: 'Server 1 (Sky Sports PL 1080p)', url: 'https://dag.s-u.in/stream/tv/moviebay_sport_cdn_ch_xx_sky-sports-premier-league-fhd-uk.json' },
      { id: 'srv-tnt', name: 'Server 2 (TNT Sports HD)', url: 'https://dag.s-u.in/stream/tv/moviebay_sport_cdn_ch_xx_tnt-sports-1-fhd-uk.json' },
    ],
  },
  {
    id: 'fb-pl-560635',
    title: 'Crystal Palace vs Liverpool',
    homeTeam: 'Crystal Palace',
    awayTeam: 'Liverpool',
    competition: 'Premier League',
    score: { home: 1, away: 3 },
    minute: 74,
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    hasLiveStream: true,
    homeBadge: 'https://crests.football-data.org/354.png',
    awayBadge: 'https://crests.football-data.org/64.png',
    streamUrl: 'https://dag.s-u.in/stream/tv/moviebay_sport_cdn_ch_xx_sky-sports-premier-league-fhd-uk.json',
    streams: [
      { id: 'srv-pl', name: 'Server 1 (Sky Sports PL 1080p)', url: 'https://dag.s-u.in/stream/tv/moviebay_sport_cdn_ch_xx_sky-sports-premier-league-fhd-uk.json' },
      { id: 'srv-supersport', name: 'Server 2 (SuperSport PL)', url: 'https://dag.s-u.in/stream/tv/moviebay_sport_dlv_ch_414_supersport-premier-league.json' },
    ],
  },
  {
    id: 'fb-pl-560640',
    title: 'Arsenal vs Hull City',
    homeTeam: 'Arsenal',
    awayTeam: 'Hull City',
    competition: 'Premier League',
    score: { home: 1, away: 0 },
    minute: 65,
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    hasLiveStream: true,
    homeBadge: 'https://crests.football-data.org/57.png',
    awayBadge: 'https://crests.football-data.org/322.png',
    streamUrl: 'https://dag.s-u.in/stream/tv/moviebay_sport_cdn_ch_xx_sky-sports-premier-league-fhd-uk.json',
    streams: [
      { id: 'srv-pl', name: 'Server 1 (Sky Sports PL 1080p)', url: 'https://dag.s-u.in/stream/tv/moviebay_sport_cdn_ch_xx_sky-sports-premier-league-fhd-uk.json' },
      { id: 'srv-tnt', name: 'Server 2 (TNT Sports HD)', url: 'https://dag.s-u.in/stream/tv/moviebay_sport_cdn_ch_xx_tnt-sports-1-fhd-uk.json' },
    ],
  },
  {
    id: 'fb-pl-560641',
    title: 'Nottingham Forest vs Manchester City',
    homeTeam: 'Nottingham Forest',
    awayTeam: 'Manchester City',
    competition: 'Premier League',
    score: { home: 3, away: 1 },
    minute: 82,
    imageUrl: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=800&q=80',
    hasLiveStream: true,
    homeBadge: 'https://crests.football-data.org/351.png',
    awayBadge: 'https://crests.football-data.org/65.png',
    streamUrl: 'https://dag.s-u.in/stream/tv/moviebay_sport_cdn_ch_xx_sky-sports-premier-league-fhd-uk.json',
    streams: [
      { id: 'srv-pl', name: 'Server 1 (Sky Sports PL 1080p)', url: 'https://dag.s-u.in/stream/tv/moviebay_sport_cdn_ch_xx_sky-sports-premier-league-fhd-uk.json' },
      { id: 'srv-supersport', name: 'Server 2 (SuperSport PL)', url: 'https://dag.s-u.in/stream/tv/moviebay_sport_dlv_ch_414_supersport-premier-league.json' },
    ],
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
