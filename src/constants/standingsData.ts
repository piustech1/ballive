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
  { pos: 1, team: 'Liverpool', teamId: 'liverpool', crestUrl: getTeamCrest('liverpool'), p: 11, w: 9, d: 1, l: 1, gd: '+19', pts: 28, zone: 'ucl' },
  { pos: 2, team: 'Manchester City', teamId: 'man-city', crestUrl: getTeamCrest('man-city'), p: 11, w: 7, d: 2, l: 2, gd: '+11', pts: 23, zone: 'ucl' },
  { pos: 3, team: 'Chelsea', teamId: 'chelsea', crestUrl: getTeamCrest('chelsea'), p: 11, w: 5, d: 4, l: 2, gd: '+8', pts: 19, zone: 'ucl' },
  { pos: 4, team: 'Arsenal', teamId: 'arsenal', crestUrl: getTeamCrest('arsenal'), p: 11, w: 5, d: 4, l: 2, gd: '+6', pts: 19, zone: 'ucl' },
  { pos: 5, team: 'Nottingham Forest', teamId: 'nottingham-forest', crestUrl: getTeamCrest('forest'), p: 11, w: 5, d: 4, l: 2, gd: '+5', pts: 19, zone: 'uel' },
  { pos: 6, team: 'Brighton', teamId: 'brighton', crestUrl: getTeamCrest('brighton'), p: 11, w: 5, d: 4, l: 2, gd: '+4', pts: 19, zone: 'normal' },
  { pos: 7, team: 'Fulham', teamId: 'fulham', crestUrl: getTeamCrest('fulham'), p: 11, w: 5, d: 3, l: 3, gd: '+3', pts: 18, zone: 'normal' },
  { pos: 8, team: 'Newcastle', teamId: 'newcastle', crestUrl: getTeamCrest('newcastle'), p: 11, w: 5, d: 3, l: 3, gd: '+2', pts: 18, zone: 'normal' },
  { pos: 9, team: 'Aston Villa', teamId: 'aston-villa', crestUrl: getTeamCrest('aston-villa'), p: 11, w: 5, d: 3, l: 3, gd: '+2', pts: 18, zone: 'normal' },
  { pos: 10, team: 'Tottenham', teamId: 'tottenham', crestUrl: getTeamCrest('tottenham'), p: 11, w: 5, d: 1, l: 5, gd: '+10', pts: 16, zone: 'normal' },
  { pos: 11, team: 'Brentford', teamId: 'brentford', crestUrl: getTeamCrest('brentford'), p: 11, w: 5, d: 1, l: 5, gd: '0', pts: 16, zone: 'normal' },
  { pos: 12, team: 'Bournemouth', teamId: 'bournemouth', crestUrl: getTeamCrest('bournemouth'), p: 11, w: 4, d: 3, l: 4, gd: '0', pts: 15, zone: 'normal' },
  { pos: 13, team: 'Manchester United', teamId: 'man-united', crestUrl: getTeamCrest('man-united'), p: 11, w: 4, d: 3, l: 4, gd: '-1', pts: 15, zone: 'normal' },
  { pos: 14, team: 'West Ham', teamId: 'west-ham', crestUrl: getTeamCrest('west-ham'), p: 11, w: 3, d: 3, l: 5, gd: '-6', pts: 12, zone: 'normal' },
  { pos: 15, team: 'Leicester City', teamId: 'leicester', crestUrl: getTeamCrest('leicester'), p: 11, w: 2, d: 4, l: 5, gd: '-7', pts: 10, zone: 'normal' },
  { pos: 16, team: 'Everton', teamId: 'everton', crestUrl: getTeamCrest('everton'), p: 11, w: 2, d: 4, l: 5, gd: '-7', pts: 10, zone: 'normal' },
  { pos: 17, team: 'Ipswich Town', teamId: 'ipswich', crestUrl: getTeamCrest('ipswich'), p: 11, w: 1, d: 5, l: 5, gd: '-10', pts: 8, zone: 'normal' },
  { pos: 18, team: 'Crystal Palace', teamId: 'crystal-palace', crestUrl: getTeamCrest('crystal-palace'), p: 11, w: 1, d: 4, l: 6, gd: '-7', pts: 7, zone: 'relegation' },
  { pos: 19, team: 'Wolves', teamId: 'wolves', crestUrl: getTeamCrest('wolves'), p: 11, w: 1, d: 3, l: 7, gd: '-13', pts: 6, zone: 'relegation' },
  { pos: 20, team: 'Southampton', teamId: 'southampton', crestUrl: getTeamCrest('southampton'), p: 11, w: 1, d: 1, l: 9, gd: '-14', pts: 4, zone: 'relegation' },
];

export const UCL_STANDINGS: StandingsRow[] = [
  { pos: 1, team: 'Liverpool', teamId: 'liverpool', crestUrl: getTeamCrest('liverpool'), p: 4, w: 4, d: 0, l: 0, gd: '+9', pts: 12, zone: 'ucl' },
  { pos: 2, team: 'Sporting CP', teamId: 'sporting-cp', crestUrl: getTeamCrest('sporting'), p: 4, w: 3, d: 1, l: 0, gd: '+7', pts: 10, zone: 'ucl' },
  { pos: 3, team: 'Monaco', teamId: 'monaco', crestUrl: getTeamCrest('monaco'), p: 4, w: 3, d: 1, l: 0, gd: '+6', pts: 10, zone: 'ucl' },
  { pos: 4, team: 'Brest', teamId: 'brest', crestUrl: getTeamCrest('brest'), p: 4, w: 3, d: 1, l: 0, gd: '+6', pts: 10, zone: 'ucl' },
  { pos: 5, team: 'Inter Milan', teamId: 'inter', crestUrl: getTeamCrest('inter'), p: 4, w: 3, d: 1, l: 0, gd: '+6', pts: 10, zone: 'ucl' },
  { pos: 6, team: 'FC Barcelona', teamId: 'barcelona', crestUrl: getTeamCrest('barcelona'), p: 4, w: 3, d: 0, l: 1, gd: '+10', pts: 9, zone: 'ucl' },
  { pos: 7, team: 'Borussia Dortmund', teamId: 'dortmund', crestUrl: getTeamCrest('dortmund'), p: 4, w: 3, d: 0, l: 1, gd: '+7', pts: 9, zone: 'ucl' },
  { pos: 8, team: 'Aston Villa', teamId: 'aston-villa', crestUrl: getTeamCrest('aston-villa'), p: 4, w: 3, d: 0, l: 1, gd: '+5', pts: 9, zone: 'ucl' },
  { pos: 9, team: 'Atalanta', teamId: 'atalanta', crestUrl: getTeamCrest('atalanta'), p: 4, w: 2, d: 2, l: 0, gd: '+5', pts: 8, zone: 'uel' },
  { pos: 10, team: 'Manchester City', teamId: 'man-city', crestUrl: getTeamCrest('man-city'), p: 4, w: 2, d: 1, l: 1, gd: '+6', pts: 7, zone: 'uel' },
  { pos: 11, team: 'Juventus', teamId: 'juventus', crestUrl: getTeamCrest('juventus'), p: 4, w: 2, d: 1, l: 1, gd: '+2', pts: 7, zone: 'uel' },
  { pos: 12, team: 'Arsenal', teamId: 'arsenal', crestUrl: getTeamCrest('arsenal'), p: 4, w: 2, d: 1, l: 1, gd: '+2', pts: 7, zone: 'uel' },
  { pos: 13, team: 'Bayer Leverkusen', teamId: 'leverkusen', crestUrl: getTeamCrest('leverkusen'), p: 4, w: 2, d: 1, l: 1, gd: '+1', pts: 7, zone: 'uel' },
  { pos: 14, team: 'Bayern Munich', teamId: 'bayern', crestUrl: getTeamCrest('bayern'), p: 4, w: 2, d: 0, l: 2, gd: '+4', pts: 6, zone: 'normal' },
  { pos: 15, team: 'Real Madrid', teamId: 'real-madrid', crestUrl: getTeamCrest('real-madrid'), p: 4, w: 2, d: 0, l: 2, gd: '+2', pts: 6, zone: 'normal' },
  { pos: 16, team: 'AC Milan', teamId: 'milan', crestUrl: getTeamCrest('milan'), p: 4, w: 2, d: 0, l: 2, gd: '+1', pts: 6, zone: 'normal' },
];

export const LALIGA_STANDINGS: StandingsRow[] = [
  { pos: 1, team: 'FC Barcelona', teamId: 'barcelona', crestUrl: getTeamCrest('barcelona'), p: 13, w: 11, d: 0, l: 2, gd: '+28', pts: 33, zone: 'ucl' },
  { pos: 2, team: 'Real Madrid', teamId: 'real-madrid', crestUrl: getTeamCrest('real-madrid'), p: 12, w: 8, d: 3, l: 1, gd: '+14', pts: 27, zone: 'ucl' },
  { pos: 3, team: 'Atletico Madrid', teamId: 'atletico-madrid', crestUrl: getTeamCrest('atletico'), p: 13, w: 7, d: 5, l: 1, gd: '+12', pts: 26, zone: 'ucl' },
  { pos: 4, team: 'Villarreal', teamId: 'villarreal', crestUrl: getTeamCrest('villarreal'), p: 12, w: 7, d: 3, l: 2, gd: '+6', pts: 24, zone: 'ucl' },
  { pos: 5, team: 'Osasuna', teamId: 'osasuna', crestUrl: getTeamCrest('osasuna'), p: 13, w: 6, d: 3, l: 4, gd: '-3', pts: 21, zone: 'uel' },
  { pos: 6, team: 'Athletic Club', teamId: 'athletic-club', crestUrl: getTeamCrest('athletic'), p: 13, w: 5, d: 5, l: 3, gd: '+6', pts: 20, zone: 'normal' },
  { pos: 7, team: 'Real Betis', teamId: 'real-betis', crestUrl: getTeamCrest('betis'), p: 13, w: 5, d: 5, l: 3, gd: '+3', pts: 20, zone: 'normal' },
  { pos: 8, team: 'Real Sociedad', teamId: 'real-sociedad', crestUrl: getTeamCrest('sociedad'), p: 13, w: 5, d: 3, l: 5, gd: '+1', pts: 18, zone: 'normal' },
  { pos: 9, team: 'Mallorca', teamId: 'mallorca', crestUrl: getTeamCrest('mallorca'), p: 13, w: 5, d: 3, l: 5, gd: '0', pts: 18, zone: 'normal' },
  { pos: 10, team: 'Girona', teamId: 'girona', crestUrl: getTeamCrest('girona'), p: 13, w: 5, d: 3, l: 5, gd: '-1', pts: 18, zone: 'normal' },
  { pos: 11, team: 'Celta Vigo', teamId: 'celta-vigo', crestUrl: getTeamCrest('celta'), p: 13, w: 5, d: 2, l: 6, gd: '-2', pts: 17, zone: 'normal' },
  { pos: 12, team: 'Rayo Vallecano', teamId: 'rayo', crestUrl: getTeamCrest('rayo'), p: 12, w: 4, d: 4, l: 4, gd: '-1', pts: 16, zone: 'normal' },
  { pos: 13, team: 'Sevilla', teamId: 'sevilla', crestUrl: getTeamCrest('sevilla'), p: 13, w: 4, d: 3, l: 6, gd: '-6', pts: 15, zone: 'normal' },
  { pos: 14, team: 'Leganes', teamId: 'leganes', crestUrl: getTeamCrest('leganes'), p: 13, w: 3, d: 5, l: 5, gd: '-3', pts: 14, zone: 'normal' },
  { pos: 15, team: 'Alaves', teamId: 'alaves', crestUrl: getTeamCrest('alaves'), p: 13, w: 4, d: 1, l: 8, gd: '-8', pts: 13, zone: 'normal' },
  { pos: 16, team: 'Las Palmas', teamId: 'las-palmas', crestUrl: getTeamCrest('palmas'), p: 13, w: 3, d: 3, l: 7, gd: '-6', pts: 12, zone: 'normal' },
  { pos: 17, team: 'Getafe', teamId: 'getafe', crestUrl: getTeamCrest('getafe'), p: 13, w: 1, d: 7, l: 5, gd: '-3', pts: 10, zone: 'normal' },
  { pos: 18, team: 'Espanyol', teamId: 'espanyol', crestUrl: getTeamCrest('espanyol'), p: 12, w: 3, d: 1, l: 8, gd: '-11', pts: 10, zone: 'relegation' },
  { pos: 19, team: 'Real Valladolid', teamId: 'valladolid', crestUrl: getTeamCrest('valladolid'), p: 13, w: 2, d: 3, l: 8, gd: '-15', pts: 9, zone: 'relegation' },
  { pos: 20, team: 'Valencia', teamId: 'valencia', crestUrl: getTeamCrest('valencia'), p: 11, w: 1, d: 4, l: 6, gd: '-9', pts: 7, zone: 'relegation' },
];

export const SERIE_A_STANDINGS: StandingsRow[] = [
  { pos: 1, team: 'Napoli', teamId: 'napoli', crestUrl: getTeamCrest('napoli'), p: 12, w: 8, d: 2, l: 2, gd: '+10', pts: 26, zone: 'ucl' },
  { pos: 2, team: 'Atalanta', teamId: 'atalanta', crestUrl: getTeamCrest('atalanta'), p: 12, w: 8, d: 1, l: 3, gd: '+16', pts: 25, zone: 'ucl' },
  { pos: 3, team: 'Fiorentina', teamId: 'fiorentina', crestUrl: getTeamCrest('fiorentina'), p: 12, w: 7, d: 4, l: 1, gd: '+15', pts: 25, zone: 'ucl' },
  { pos: 4, team: 'Inter Milan', teamId: 'inter', crestUrl: getTeamCrest('inter'), p: 12, w: 7, d: 4, l: 1, gd: '+12', pts: 25, zone: 'ucl' },
  { pos: 5, team: 'Lazio', teamId: 'lazio', crestUrl: getTeamCrest('lazio'), p: 12, w: 8, d: 1, l: 3, gd: '+14', pts: 25, zone: 'uel' },
  { pos: 6, team: 'Juventus', teamId: 'juventus', crestUrl: getTeamCrest('juventus'), p: 12, w: 6, d: 6, l: 0, gd: '+14', pts: 24, zone: 'normal' },
  { pos: 7, team: 'AC Milan', teamId: 'milan', crestUrl: getTeamCrest('milan'), p: 11, w: 5, d: 3, l: 3, gd: '+6', pts: 18, zone: 'normal' },
  { pos: 8, team: 'Bologna', teamId: 'bologna', crestUrl: getTeamCrest('bologna'), p: 11, w: 4, d: 6, l: 1, gd: '+2', pts: 18, zone: 'normal' },
  { pos: 9, team: 'Udinese', teamId: 'udinese', crestUrl: getTeamCrest('udinese'), p: 12, w: 5, d: 1, l: 6, gd: '-3', pts: 16, zone: 'normal' },
  { pos: 10, team: 'Empoli', teamId: 'empoli', crestUrl: getTeamCrest('empoli'), p: 12, w: 3, d: 6, l: 3, gd: '-1', pts: 15, zone: 'normal' },
  { pos: 11, team: 'Torino', teamId: 'torino', crestUrl: getTeamCrest('torino'), p: 12, w: 4, d: 2, l: 6, gd: '-3', pts: 14, zone: 'normal' },
  { pos: 12, team: 'AS Roma', teamId: 'roma', crestUrl: getTeamCrest('roma'), p: 12, w: 3, d: 4, l: 5, gd: '-3', pts: 13, zone: 'normal' },
  { pos: 13, team: 'Parma', teamId: 'parma', crestUrl: getTeamCrest('parma'), p: 12, w: 2, d: 6, l: 4, gd: '-2', pts: 12, zone: 'normal' },
  { pos: 14, team: 'Verona', teamId: 'verona', crestUrl: getTeamCrest('verona'), p: 12, w: 4, d: 0, l: 8, gd: '-10', pts: 12, zone: 'normal' },
  { pos: 15, team: 'Como', teamId: 'como', crestUrl: getTeamCrest('como'), p: 12, w: 2, d: 4, l: 6, gd: '-8', pts: 10, zone: 'normal' },
  { pos: 16, team: 'Cagliari', teamId: 'cagliari', crestUrl: getTeamCrest('cagliari'), p: 12, w: 2, d: 4, l: 6, gd: '-10', pts: 10, zone: 'normal' },
  { pos: 17, team: 'Genoa', teamId: 'genoa', crestUrl: getTeamCrest('genoa'), p: 12, w: 2, d: 4, l: 6, gd: '-13', pts: 10, zone: 'normal' },
  { pos: 18, team: 'Lecce', teamId: 'lecce', crestUrl: getTeamCrest('lecce'), p: 12, w: 2, d: 3, l: 7, gd: '-16', pts: 9, zone: 'relegation' },
  { pos: 19, team: 'Monza', teamId: 'monza', crestUrl: getTeamCrest('monza'), p: 12, w: 1, d: 5, l: 6, gd: '-5', pts: 8, zone: 'relegation' },
  { pos: 20, team: 'Venezia', teamId: 'venezia', crestUrl: getTeamCrest('venezia'), p: 12, w: 2, d: 2, l: 8, gd: '-10', pts: 8, zone: 'relegation' },
];

export const BUNDESLIGA_STANDINGS: StandingsRow[] = [
  { pos: 1, team: 'Bayern Munich', teamId: 'bayern', crestUrl: getTeamCrest('bayern'), p: 10, w: 8, d: 2, l: 0, gd: '+26', pts: 26, zone: 'ucl' },
  { pos: 2, team: 'RB Leipzig', teamId: 'rb-leipzig', crestUrl: getTeamCrest('leipzig'), p: 10, w: 6, d: 3, l: 1, gd: '+10', pts: 21, zone: 'ucl' },
  { pos: 3, team: 'Eintracht Frankfurt', teamId: 'eintracht-frankfurt', crestUrl: getTeamCrest('frankfurt'), p: 10, w: 6, d: 2, l: 2, gd: '+10', pts: 20, zone: 'ucl' },
  { pos: 4, team: 'Bayer Leverkusen', teamId: 'bayer-leverkusen', crestUrl: getTeamCrest('leverkusen'), p: 10, w: 4, d: 5, l: 1, gd: '+5', pts: 17, zone: 'ucl' },
  { pos: 5, team: 'Freiburg', teamId: 'freiburg', crestUrl: getTeamCrest('freiburg'), p: 10, w: 5, d: 2, l: 3, gd: '+2', pts: 17, zone: 'uel' },
  { pos: 6, team: 'Union Berlin', teamId: 'union-berlin', crestUrl: getTeamCrest('union'), p: 10, w: 4, d: 4, l: 2, gd: '+1', pts: 16, zone: 'normal' },
  { pos: 7, team: 'Borussia Dortmund', teamId: 'dortmund', crestUrl: getTeamCrest('dortmund'), p: 10, w: 5, d: 1, l: 4, gd: '0', pts: 16, zone: 'normal' },
  { pos: 8, team: 'Werder Bremen', teamId: 'werder-bremen', crestUrl: getTeamCrest('bremen'), p: 10, w: 4, d: 3, l: 3, gd: '-4', pts: 15, zone: 'normal' },
  { pos: 9, team: 'Borussia Mgladbach', teamId: 'mgladbach', crestUrl: getTeamCrest('gladbach'), p: 10, w: 4, d: 2, l: 4, gd: '+1', pts: 14, zone: 'normal' },
  { pos: 10, team: 'Mainz 05', teamId: 'mainz', crestUrl: getTeamCrest('mainz'), p: 10, w: 3, d: 4, l: 3, gd: '+1', pts: 13, zone: 'normal' },
  { pos: 11, team: 'VfB Stuttgart', teamId: 'stuttgart', crestUrl: getTeamCrest('stuttgart'), p: 10, w: 3, d: 4, l: 3, gd: '0', pts: 13, zone: 'normal' },
  { pos: 12, team: 'Wolfsburg', teamId: 'wolfsburg', crestUrl: getTeamCrest('wolfsburg'), p: 10, w: 3, d: 3, l: 4, gd: '+1', pts: 12, zone: 'normal' },
  { pos: 13, team: 'FC Augsburg', teamId: 'augsburg', crestUrl: getTeamCrest('augsburg'), p: 10, w: 3, d: 3, l: 4, gd: '-7', pts: 12, zone: 'normal' },
  { pos: 14, team: 'Heidenheim', teamId: 'heidenheim', crestUrl: getTeamCrest('heidenheim'), p: 10, w: 3, d: 1, l: 6, gd: '+2', pts: 10, zone: 'normal' },
  { pos: 15, team: 'St. Pauli', teamId: 'st-pauli', crestUrl: getTeamCrest('pauli'), p: 10, w: 2, d: 2, l: 6, gd: '-4', pts: 8, zone: 'normal' },
  { pos: 16, team: 'TSG Hoffenheim', teamId: 'hoffenheim', crestUrl: getTeamCrest('hoffenheim'), p: 10, w: 2, d: 2, l: 6, gd: '-6', pts: 8, zone: 'relegation' },
  { pos: 17, team: 'Holstein Kiel', teamId: 'kiel', crestUrl: getTeamCrest('kiel'), p: 10, w: 1, d: 2, l: 7, gd: '-13', pts: 5, zone: 'relegation' },
  { pos: 18, team: 'VfL Bochum', teamId: 'bochum', crestUrl: getTeamCrest('bochum'), p: 10, w: 0, d: 2, l: 8, gd: '-20', pts: 2, zone: 'relegation' },
];

export function getCompetitionStandings(competitionId?: string | null): StandingsRow[] {
  if (!competitionId) return [];
  const id = competitionId.toLowerCase().replace(/^(comp-|league-)/, '');

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
  if (id.includes('pl') || id.includes('premier') || id.includes('epl')) {
    return PREMIER_LEAGUE_STANDINGS;
  }

  return [];
}
