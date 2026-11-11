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
        crestUrl: live.homeBadge || existing.homeTeam.crestUrl,
        score: live.score.home,
      },
      awayTeam: {
        ...existing.awayTeam,
        crestUrl: live.awayBadge || existing.awayTeam.crestUrl,
        score: live.score.away,
      },
      status: 'LIVE',
      streamUrl: live.streamUrl || existing.streamUrl,
      streams: live.streams || existing.streams,
    };
  }

  // Derive club crests
  const homeKey = Object.keys(CLUB_CRESTS).find(k => live.homeTeam.toLowerCase().includes(k.replace('-', ' '))) || 'real-madrid';
  const awayKey = Object.keys(CLUB_CRESTS).find(k => live.awayTeam.toLowerCase().includes(k.replace('-', ' '))) || 'man-city';

  // Derive competition emblem
  const compKey = Object.keys(LEAGUE_EMBLEMS).find(k => live.competition.toLowerCase().includes(k.replace('-', ' '))) || 'ucl';

  return {
    id: live.id,
    competition: live.competition,
    competitionLogo: LEAGUE_EMBLEMS[compKey] || LEAGUE_EMBLEMS['ucl'],
    status: 'LIVE',
    kickoffDate: 'Today',
    kickoffTime: `${live.minute}' Live`,
    minute: live.minute,
    homeTeam: {
      id: `team-${homeKey}`,
      name: live.homeTeam,
      crestUrl: live.homeBadge || CLUB_CRESTS[homeKey] || CLUB_CRESTS['real-madrid'],
      score: live.score.home,
    },
    awayTeam: {
      id: `team-${awayKey}`,
      name: live.awayTeam,
      crestUrl: live.awayBadge || CLUB_CRESTS[awayKey] || CLUB_CRESTS['man-city'],
      score: live.score.away,
    },
    venue: 'Premier Stadium',
    hasLiveBroadcast: live.hasLiveStream,
    streamUrl: live.streamUrl,
    streams: live.streams,
  };
}

/**
 * Returns the marquee Match of the Day with safe fallback.
 */
export function getMarqueeMatchOfTheDay(): DiscoverMatchup {
  if (UPCOMING_HIGHLIGHTS && UPCOMING_HIGHLIGHTS.length > 0) {
    const motd = UPCOMING_HIGHLIGHTS.find(m => m.id === 'matchup-2');
    if (motd) return motd;
    return UPCOMING_HIGHLIGHTS[0];
  }

  // Authentic marquee default fixture
  return {
    id: 'marquee-motd-1',
    competition: 'Premier League',
    competitionLogo: LEAGUE_EMBLEMS['premier-league'],
    status: 'LIVE',
    kickoffDate: 'Today',
    kickoffTime: "75' Live",
    minute: 75,
    homeTeam: {
      id: 'team-arsenal',
      name: 'Arsenal',
      crestUrl: CLUB_CRESTS['arsenal'],
      score: 2,
    },
    awayTeam: {
      id: 'team-liverpool',
      name: 'Liverpool',
      crestUrl: CLUB_CRESTS['liverpool'],
      score: 1,
    },
    venue: 'Emirates Stadium, London',
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
  const foundExplore = EXPLORE_COMPETITIONS.find(c => c.id === id || c.shortName.toLowerCase() === id.toLowerCase() || c.name.toLowerCase() === id.toLowerCase());
  if (foundExplore) return foundExplore;

  const foundLeague = POPULAR_LEAGUES.find(l => l.id === id || l.name.toLowerCase() === id.toLowerCase());
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
    };
  }

  const foundFeatured = FEATURED_COMPETITIONS.find(f => f.id === id || f.name.toLowerCase() === id.toLowerCase());
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
export function getAllLiveStreamMatches(): DiscoverMatchup[] {
  const resolvedLive = LIVE_MATCHES.map(resolveLiveMatchToMatchup);
  const streamableUpcoming = UPCOMING_HIGHLIGHTS.filter(
    u => u.hasLiveBroadcast && !resolvedLive.some(l => l.homeTeam.name.toLowerCase() === u.homeTeam.name.toLowerCase() && l.awayTeam.name.toLowerCase() === u.awayTeam.name.toLowerCase())
  );
  return [...resolvedLive, ...streamableUpcoming];
}
