import {
  DiscoverMatchup,
  DiscoverCompetition,
  PopularLeague,
  PopularTeam,
  EXPLORE_COMPETITIONS,
  POPULAR_LEAGUES,
  POPULAR_TEAMS,
  UPCOMING_HIGHLIGHTS,
} from '../constants/discoverData';
import { LIVE_MATCHES, LiveMatch, FEATURED_COMPETITIONS, FeaturedCompetition } from '../constants/mockData';
import { CLUB_CRESTS, LEAGUE_EMBLEMS } from '../constants/crests';
import { getTeamCrest } from '../utils/teamCrestResolver';
import { API_CONFIG } from '../config/api';

/**
 * Resolves any LiveMatch from the Home screen into a full DiscoverMatchup.
 */
export function resolveLiveMatchToMatchup(live: LiveMatch): DiscoverMatchup {
  // Check if an existing matchup matches this id or title
  const existing = UPCOMING_HIGHLIGHTS.find(
    m => m.id === live.id || (m.homeTeam.name.toLowerCase() === live.homeTeam.toLowerCase() && m.awayTeam.name.toLowerCase() === live.awayTeam.toLowerCase())
  );
  if (existing) {
    return {
      ...existing,
      minute: live.minute,
      homeTeam: {
        ...existing.homeTeam,
        crestUrl: live.homeBadge || existing.homeTeam.crestUrl || getTeamCrest(live.homeTeam),
        score: live.score.home,
      },
      awayTeam: {
        ...existing.awayTeam,
        crestUrl: live.awayBadge || existing.awayTeam.crestUrl || getTeamCrest(live.awayTeam),
        score: live.score.away,
      },
      status: 'LIVE',
      streamUrl: live.streamUrl || existing.streamUrl,
      streams: live.streams || existing.streams,
    };
  }

  // Derive club crests
  const homeCrest = live.homeBadge || getTeamCrest(live.homeTeam);
  const awayCrest = live.awayBadge || getTeamCrest(live.awayTeam);

  // Derive competition emblem
  const compLower = live.competition.toLowerCase();
  let compLogo = LEAGUE_EMBLEMS['ucl'];
  if (compLower.includes('premier')) compLogo = LEAGUE_EMBLEMS['premier-league'];
  else if (compLower.includes('laliga')) compLogo = LEAGUE_EMBLEMS['laliga'];
  else if (compLower.includes('serie')) compLogo = LEAGUE_EMBLEMS['serie-a'];
  else if (compLower.includes('bundesliga')) compLogo = LEAGUE_EMBLEMS['bundesliga'];
  else if (compLower.includes('nba') || compLower.includes('basketball')) compLogo = 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png';
  else if (compLower.includes('nhl') || compLower.includes('hockey')) compLogo = 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png';
  else if (compLower.includes('ufc') || compLower.includes('mma') || compLower.includes('wwe') || compLower.includes('wrestling') || compLower.includes('tna') || compLower.includes('aew')) compLogo = 'https://a.espncdn.com/i/teamlogos/leagues/500/mma.png';
  else if (compLower.includes('nfl') || compLower.includes('american football')) compLogo = 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png';
  else if (compLower.includes('f1') || compLower.includes('formula') || compLower.includes('motorsport')) compLogo = 'https://a.espncdn.com/i/teamlogos/leagues/500/f1.png';
  else if (compLower.includes('tennis')) compLogo = 'https://a.espncdn.com/i/teamlogos/leagues/500/tennis.png';

  const sport: any = live.sport || (
    compLower.includes('nba') || compLower.includes('basketball') ? 'basketball' :
    compLower.includes('nhl') || compLower.includes('hockey') ? 'hockey' :
    compLower.includes('ufc') || compLower.includes('mma') || compLower.includes('wwe') || compLower.includes('wrestling') || compLower.includes('tna') || compLower.includes('aew') ? 'mma' :
    compLower.includes('nfl') || compLower.includes('american football') ? 'american_football' :
    compLower.includes('f1') || compLower.includes('formula') || compLower.includes('motorsport') ? 'motorsport' :
    compLower.includes('tennis') ? 'tennis' : 'soccer'
  );

  const venue = compLower.includes('nba') ? 'NBA Arena' : compLower.includes('nhl') ? 'NHL Ice Arena' : compLower.includes('ufc') || compLower.includes('mma') ? 'Championship Octagon' : 'Premier Sports Stadium';

  const isLive = live.minute > 0 && live.minute < 90;
  const isFinished = live.minute >= 90;
  const matchStatus = isLive ? 'LIVE' : isFinished ? 'FT' : 'UPCOMING';
  const kickoffTime = isLive ? `${live.minute}' Live` : isFinished ? 'Full Time' : (live.kickoffTime || 'Today');

  return {
    id: live.id,
    competition: live.competition,
    competitionLogo: compLogo,
    status: matchStatus,
    kickoffDate: 'Today',
    kickoffTime,
    minute: live.minute,
    sport,
    homeTeam: {
      id: `team-${live.homeTeam.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: live.homeTeam,
      crestUrl: homeCrest,
      score: live.score.home,
    },
    awayTeam: {
      id: `team-${live.awayTeam.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: live.awayTeam,
      crestUrl: awayCrest,
      score: live.score.away,
    },
    venue,
    hasLiveBroadcast: live.hasLiveStream,
    streamUrl: live.streamUrl,
    streams: live.streams,
    poster: live.imageUrl,
  };
}

/**
 * Returns the marquee Match of the Day dynamically derived from active live matches or marquee fixtures.
 */
export function getMarqueeMatchOfTheDay(liveMatches?: LiveMatch[]): DiscoverMatchup {
  if (liveMatches && liveMatches.length > 0) {
    // 1. Pick the best active live match
    const active = liveMatches.find(m => m.minute > 0 && m.minute < 90);
    if (active) {
      return resolveLiveMatchToMatchup(active);
    }
    return resolveLiveMatchToMatchup(liveMatches[0]);
  }

  if (UPCOMING_HIGHLIGHTS && UPCOMING_HIGHLIGHTS.length > 0) {
    return UPCOMING_HIGHLIGHTS[0];
  }

  // Authentic marquee default fixture
  return {
    id: 'marquee-motd-live',
    competition: 'Premier League',
    competitionLogo: LEAGUE_EMBLEMS['premier-league'],
    status: 'LIVE',
    kickoffDate: 'Today',
    kickoffTime: "35' Live",
    minute: 35,
    homeTeam: {
      id: 'team-man-city',
      name: 'Manchester City',
      crestUrl: getTeamCrest('Manchester City'),
      score: 1,
    },
    awayTeam: {
      id: 'team-liverpool',
      name: 'Liverpool',
      crestUrl: getTeamCrest('Liverpool'),
      score: 1,
    },
    venue: 'Etihad Stadium, Manchester',
    hasLiveBroadcast: true,
    streamUrl: `https://dag.s-u.in/stream/tv/moviebay_sport_cdn_ch_xx_sky-sports-premier-league-fhd-uk.json`,
    streams: [
      { id: 'srv-pl', name: 'Server 1 (Sky Sports PL 1080p)', url: `https://dag.s-u.in/stream/tv/moviebay_sport_cdn_ch_xx_sky-sports-premier-league-fhd-uk.json` },
      { id: 'srv-tnt', name: 'Server 2 (TNT Sports HD)', url: `https://dag.s-u.in/stream/tv/moviebay_sport_cdn_ch_xx_tnt-sports-1-fhd-uk.json` },
    ],
  };
}

/**
 * Finds a competition by id, slug, or name from either explore competitions, popular leagues, or featured competitions.
 */
export function findCompetitionById(id: string): DiscoverCompetition {
  if (!id) return EXPLORE_COMPETITIONS[0];
  const clean = id.toLowerCase().trim();

  // Category & Sport Aliases
  if (clean === 'all') {
    return {
      id: 'all',
      name: 'All Sports & Tournaments',
      shortName: 'All',
      country: 'Global',
      region: 'International',
      logoUrl: LEAGUE_EMBLEMS['all'],
      accentColor: '#7952FC',
      season: '2025 Season',
      teamsCount: 100,
      sport: 'other',
    };
  }
  if (clean === 'football' || clean === 'soccer') {
    return EXPLORE_COMPETITIONS.find(c => c.id === 'pl') || EXPLORE_COMPETITIONS[0];
  }
  if (clean === 'motorsport' || clean === 'f1' || clean === 'formula-1' || clean === 'formula1') {
    const f1 = EXPLORE_COMPETITIONS.find(c => c.id === 'f1');
    if (f1) return f1;
  }
  if (clean === 'mma' || clean === 'ufc' || clean === 'combat') {
    const ufc = EXPLORE_COMPETITIONS.find(c => c.id === 'ufc');
    if (ufc) return ufc;
  }
  if (clean === 'nfl' || clean === 'american_football' || clean === 'american-football') {
    const nfl = EXPLORE_COMPETITIONS.find(c => c.id === 'nfl');
    if (nfl) return nfl;
  }
  if (clean === 'tennis') {
    const tennis = EXPLORE_COMPETITIONS.find(c => c.id === 'tennis');
    if (tennis) return tennis;
  }
  if (clean === 'cricket') {
    const cricket = EXPLORE_COMPETITIONS.find(c => c.id === 'cricket');
    if (cricket) return cricket;
  }
  if (clean === 'boxing') {
    const boxing = EXPLORE_COMPETITIONS.find(c => c.id === 'boxing');
    if (boxing) return boxing;
  }
  if (clean === 'wc' || clean === 'world-cup') {
    const wc = EXPLORE_COMPETITIONS.find(c => c.id === 'wc');
    if (wc) return wc;
  }

  const foundExplore = EXPLORE_COMPETITIONS.find(
    c => c.id === clean || c.id === `comp-${clean}` || c.shortName.toLowerCase() === clean || c.name.toLowerCase() === clean
  );
  if (foundExplore) return foundExplore;

  const foundLeague = POPULAR_LEAGUES.find(
    l => l.id === clean || l.id === `league-${clean}` || l.name.toLowerCase() === clean
  );
  if (foundLeague) {
    return {
      id: foundLeague.id,
      name: foundLeague.name,
      shortName: foundLeague.name.split(' ')[0],
      country: foundLeague.country,
      region: 'Europe',
      logoUrl: foundLeague.logoUrl,
      accentColor: '#7952FC',
      season: '2024/25 Season',
      teamsCount: 20,
      sport: foundLeague.sport || 'soccer',
    };
  }

  const foundFeatured = FEATURED_COMPETITIONS.find(
    f => f.id === clean || f.id === `comp-${clean}` || f.name.toLowerCase() === clean
  );
  if (foundFeatured) {
    return {
      id: foundFeatured.id,
      name: foundFeatured.name,
      shortName: foundFeatured.name.split(' ')[0],
      country: foundFeatured.country,
      region: 'Europe',
      logoUrl: foundFeatured.crestUrl,
      accentColor: '#08B3E5',
      season: foundFeatured.season,
      teamsCount: foundFeatured.matchesCount * 2,
      sport: foundFeatured.sport || 'soccer',
    };
  }

  // Fallback default
  return EXPLORE_COMPETITIONS[0];
}

/**
 * Finds a team by id or name from POPULAR_TEAMS.
 */
export function findTeamById(idOrName: string): PopularTeam {
  const normalized = idOrName.toLowerCase();
  const found = POPULAR_TEAMS.find(t => t.id === normalized || t.name.toLowerCase() === normalized || t.shortName.toLowerCase() === normalized);
  if (found) return found;

  // Fallback team
  return POPULAR_TEAMS[0];
}

/**
 * Returns all live-streamable matches across live fixtures and upcoming highlights.
 */
export function getAllLiveStreamMatches(dynamicLive?: LiveMatch[]): DiscoverMatchup[] {
  const baseLive = dynamicLive && dynamicLive.length > 0 ? dynamicLive : LIVE_MATCHES;
  const resolvedLive = baseLive.map(resolveLiveMatchToMatchup);
  const streamableUpcoming = UPCOMING_HIGHLIGHTS.filter(
    u => u.hasLiveBroadcast && !resolvedLive.some(l => l.homeTeam.name.toLowerCase() === u.homeTeam.name.toLowerCase() && l.awayTeam.name.toLowerCase() === u.awayTeam.name.toLowerCase())
  );
  return [...resolvedLive, ...streamableUpcoming];
}
