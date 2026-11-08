export type MatchStatus =
  | 'SCHEDULED'
  | 'TIMED'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'FINISHED'
  | 'POSTPONED'
  | 'CANCELLED';

export interface Competition {
  id: string;
  name: string;
  code: string;
  country: string;
  countryCode?: string;
  flag?: string;
  emblem: string;
  type?: 'LEAGUE' | 'CUP' | 'INTERNATIONAL';
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface Score {
  home: number | null;
  away: number | null;
  htHome?: number | null;
  htAway?: number | null;
}

export type EventType = 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION' | 'VAR';

export interface MatchEvent {
  id: string;
  minute: number;
  addedTime?: number;
  type: EventType;
  teamId: string;
  player: string;
  assist?: string;
  detail?: string;
}

export interface MatchStats {
  possession: [number, number]; // [home, away] %
  shotsTotal: [number, number];
  shotsOnTarget: [number, number];
  expectedGoals: [number, number]; // xG
  corners: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  saves: [number, number];
  passesAccuracy: [number, number]; // %
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  rating: number;
  isCaptain?: boolean;
  photo?: string;
}

export interface Lineup {
  formation: string;
  coach: string;
  startingXI: Player[];
  substitutes: Player[];
}

export interface StreamSource {
  id: string;
  name: string;
  quality: '1080p 60fps' | '720p HD' | '480p SD' | 'Auto';
  type: 'hls' | 'embed' | 'authorized_link';
  url: string;
  channelName: string;
  isPrimary?: boolean;
  bitrate?: string;
  latency?: string;
}

export interface Broadcaster {
  region: string;
  network: string;
  channelLogo?: string;
  authUrl?: string;
  isSubscriptionRequired?: boolean;
}

export interface Match {
  id: string;
  competition: Competition;
  homeTeam: Team;
  awayTeam: Team;
  status: MatchStatus;
  minute?: number;
  addedTime?: number;
  utcDate: string; // ISO date
  score: Score;
  venue: string;
  referee?: string;
  cardTheme?: 'blue' | 'silver' | 'coral' | 'emerald' | 'violet';
  hasLiveStream: boolean;
  streams?: StreamSource[];
  broadcasters?: Broadcaster[];
  events?: MatchEvent[];
  stats?: MatchStats;
  lineups?: {
    home: Lineup;
    away: Lineup;
  };
  headToHead?: {
    totalPlayed: number;
    homeWins: number;
    awayWins: number;
    draws: number;
    lastMatches: {
      date: string;
      homeScore: number;
      awayScore: number;
      winner: 'HOME' | 'AWAY' | 'DRAW';
    }[];
  };
  isFeatured?: boolean;
}

export interface StandingRow {
  position: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}
