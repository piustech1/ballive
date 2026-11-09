import { getTeamCrest } from '../utils/teamCrestResolver';

export interface StandingsRow {
  pos: number;
  team: string;
  teamId: string;
  crestUrl: string;
  p: number; // Played
  w: number; // Won
  d: number; // Drawn
  l: number; // Lost
  gd: string; // Goal Difference
  pts: number; // Points
  zone?: 'ucl' | 'uel' | 'normal' | 'relegation';
}

export const PREMIER_LEAGUE_STANDINGS: StandingsRow[] = [
  { pos: 1, team: 'Liverpool', teamId: 'liverpool', crestUrl: getTeamCrest('liverpool'), p: 10, w: 8, d: 1, l: 1, gd: '+17', pts: 25, zone: 'ucl' },
  { pos: 2, team: 'Manchester City', teamId: 'man-city', crestUrl: getTeamCrest('man-city'), p: 10, w: 7, d: 2, l: 1, gd: '+14', pts: 23, zone: 'ucl' },
  { pos: 3, team: 'Arsenal', teamId: 'arsenal', crestUrl: getTeamCrest('arsenal'), p: 10, w: 6, d: 3, l: 1, gd: '+11', pts: 21, zone: 'ucl' },
  { pos: 4, team: 'Chelsea', teamId: 'chelsea', crestUrl: getTeamCrest('chelsea'), p: 10, w: 6, d: 2, l: 2, gd: '+9', pts: 20, zone: 'ucl' },
  { pos: 5, team: 'Aston Villa', teamId: 'aston-villa', crestUrl: getTeamCrest('aston-villa'), p: 10, w: 5, d: 3, l: 2, gd: '+6', pts: 18, zone: 'uel' },
  { pos: 6, team: 'Tottenham', teamId: 'tottenham', crestUrl: getTeamCrest('tottenham'), p: 10, w: 5, d: 1, l: 4, gd: '+5', pts: 16, zone: 'normal' },
  { pos: 7, team: 'Brighton', teamId: 'brighton', crestUrl: getTeamCrest('brighton'), p: 10, w: 4, d: 4, l: 2, gd: '+3', pts: 16, zone: 'normal' },
  { pos: 8, team: 'Newcastle', teamId: 'newcastle', crestUrl: getTeamCrest('newcastle'), p: 10, w: 4, d: 3, l: 3, gd: '+2', pts: 15, zone: 'normal' },
];

export const UCL_STANDINGS: StandingsRow[] = [
  { pos: 1, team: 'Liverpool', teamId: 'liverpool', crestUrl: getTeamCrest('liverpool'), p: 4, w: 4, d: 0, l: 0, gd: '+9', pts: 12, zone: 'ucl' },
  { pos: 2, team: 'Sporting CP', teamId: 'sporting-cp', crestUrl: getTeamCrest('sporting-cp'), p: 4, w: 3, d: 1, l: 0, gd: '+7', pts: 10, zone: 'ucl' },
  { pos: 3, team: 'Monaco', teamId: 'monaco', crestUrl: getTeamCrest('monaco'), p: 4, w: 3, d: 1, l: 0, gd: '+6', pts: 10, zone: 'ucl' },
  { pos: 4, team: 'Brest', teamId: 'brest', crestUrl: getTeamCrest('brest'), p: 4, w: 3, d: 1, l: 0, gd: '+6', pts: 10, zone: 'ucl' },
  { pos: 5, team: 'Inter Milan', teamId: 'inter', crestUrl: getTeamCrest('inter'), p: 4, w: 3, d: 1, l: 0, gd: '+6', pts: 10, zone: 'ucl' },
  { pos: 6, team: 'FC Barcelona', teamId: 'barcelona', crestUrl: getTeamCrest('barcelona'), p: 4, w: 3, d: 0, l: 1, gd: '+10', pts: 9, zone: 'ucl' },
  { pos: 7, team: 'Borussia Dortmund', teamId: 'dortmund', crestUrl: getTeamCrest('dortmund'), p: 4, w: 3, d: 0, l: 1, gd: '+7', pts: 9, zone: 'ucl' },
  { pos: 8, team: 'Real Madrid', teamId: 'real-madrid', crestUrl: getTeamCrest('real-madrid'), p: 4, w: 2, d: 0, l: 2, gd: '+2', pts: 6, zone: 'ucl' },
];

export const LALIGA_STANDINGS: StandingsRow[] = [
  { pos: 1, team: 'FC Barcelona', teamId: 'barcelona', crestUrl: getTeamCrest('barcelona'), p: 12, w: 11, d: 0, l: 1, gd: '+29', pts: 33, zone: 'ucl' },
  { pos: 2, team: 'Real Madrid', teamId: 'real-madrid', crestUrl: getTeamCrest('real-madrid'), p: 11, w: 7, d: 3, l: 1, gd: '+10', pts: 24, zone: 'ucl' },
  { pos: 3, team: 'Atletico Madrid', teamId: 'atletico-madrid', crestUrl: getTeamCrest('atletico-madrid'), p: 12, w: 6, d: 5, l: 1, gd: '+11', pts: 23, zone: 'ucl' },
  { pos: 4, team: 'Villarreal', teamId: 'villarreal', crestUrl: getTeamCrest('villarreal'), p: 11, w: 6, d: 3, l: 2, gd: '+4', pts: 21, zone: 'ucl' },
  { pos: 5, team: 'Athletic Club', teamId: 'athletic-club', crestUrl: getTeamCrest('athletic-club'), p: 12, w: 5, d: 4, l: 3, gd: '+6', pts: 19, zone: 'uel' },
];

export const SERIE_A_STANDINGS: StandingsRow[] = [
  { pos: 1, team: 'Napoli', teamId: 'napoli', crestUrl: getTeamCrest('napoli'), p: 11, w: 8, d: 1, l: 2, gd: '+10', pts: 25, zone: 'ucl' },
  { pos: 2, team: 'Inter Milan', teamId: 'inter', crestUrl: getTeamCrest('inter'), p: 11, w: 7, d: 3, l: 1, gd: '+12', pts: 24, zone: 'ucl' },
  { pos: 3, team: 'Atalanta', teamId: 'atalanta', crestUrl: getTeamCrest('atalanta'), p: 11, w: 7, d: 1, l: 3, gd: '+15', pts: 22, zone: 'ucl' },
  { pos: 4, team: 'Fiorentina', teamId: 'fiorentina', crestUrl: getTeamCrest('fiorentina'), p: 11, w: 6, d: 4, l: 1, gd: '+13', pts: 22, zone: 'ucl' },
  { pos: 5, team: 'Juventus', teamId: 'juventus', crestUrl: getTeamCrest('juventus'), p: 11, w: 5, d: 6, l: 0, gd: '+12', pts: 21, zone: 'uel' },
];

export const BUNDESLIGA_STANDINGS: StandingsRow[] = [
  { pos: 1, team: 'Bayern Munich', teamId: 'bayern', crestUrl: getTeamCrest('bayern'), p: 9, w: 7, d: 2, l: 0, gd: '+25', pts: 23, zone: 'ucl' },
  { pos: 2, team: 'RB Leipzig', teamId: 'rb-leipzig', crestUrl: getTeamCrest('rb-leipzig'), p: 9, w: 6, d: 2, l: 1, gd: '+10', pts: 20, zone: 'ucl' },
  { pos: 3, team: 'Eintracht Frankfurt', teamId: 'eintracht-frankfurt', crestUrl: getTeamCrest('eintracht-frankfurt'), p: 9, w: 5, d: 2, l: 2, gd: '+9', pts: 17, zone: 'ucl' },
  { pos: 4, team: 'Bayer Leverkusen', teamId: 'bayer-leverkusen', crestUrl: getTeamCrest('bayer-leverkusen'), p: 9, w: 4, d: 4, l: 1, gd: '+5', pts: 16, zone: 'ucl' },
  { pos: 5, team: 'Borussia Dortmund', teamId: 'dortmund', crestUrl: getTeamCrest('dortmund'), p: 9, w: 5, d: 1, l: 3, gd: '+2', pts: 16, zone: 'uel' },
];

export function getCompetitionStandings(competitionId?: string | null): StandingsRow[] {
  if (!competitionId) return PREMIER_LEAGUE_STANDINGS;
  const id = competitionId.toLowerCase();

  if (id.includes('ucl') || id.includes('champions')) {
    return UCL_STANDINGS;
  }
  if (id.includes('laliga')) {
    return LALIGA_STANDINGS;
  }
  if (id.includes('serie') || id.includes('seriea')) {
    return SERIE_A_STANDINGS;
  }
  if (id.includes('bundes') || id.includes('bundesliga')) {
    return BUNDESLIGA_STANDINGS;
  }

  return PREMIER_LEAGUE_STANDINGS;
}
