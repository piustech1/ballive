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
import { LIVE_MATCHES, LiveMatch, FEATURED_COMPETITIONS, SportType } from '../constants/mockData';
import { LEAGUE_EMBLEMS } from '../constants/crests';
import { resolveCompetitionLogo } from '../components/common/CompetitionLogo';
import { getTeamCrest } from '../utils/teamCrestResolver';
import { isValidFixture } from '../utils/fixtureValidator';
import { API_CONFIG, getBroadcastChannelId, isUnsupportedStreamingCompetition } from '../config/api';
import { resolveSportBackground } from '../utils/sportBackgroundResolver';
import { normalizeMatchStatus, formatKickoffEAT } from '../utils/matchStatus';
import { calculateMatchAnticipationScore } from '../services/matchOfTheDayService';
import { competitionResolverService } from '../services/competitionResolverService';
import { popularTeamsService } from '../services/popularTeamsService';
import { normalizeLeagueId, normalizeTeamId } from '../services/profileStorage';
import { ScreenRoute } from './NavigationContext';

/**
 * Resolves any LiveMatch from the Home screen into a full DiscoverMatchup.
 */
export function resolveLiveMatchToMatchup(live: LiveMatch): DiscoverMatchup {
  const existing = UPCOMING_HIGHLIGHTS.find(
    m => m.id === live.id || (m.homeTeam.name.toLowerCase() === live.homeTeam.toLowerCase() && m.awayTeam.name.toLowerCase() === live.awayTeam.toLowerCase())
  );
  if (existing) {
    const statusInfo = normalizeMatchStatus({
      rawStatus: live.status || existing.status,
      minute: live.minute ?? existing.minute,
      playTime: live.playTime ?? existing.playTime,
      completed: (live.status || existing.status) === 'FT',
    });
    return {
      ...existing,
      minute: statusInfo.isLive ? statusInfo.minute : 0,
      playTime: statusInfo.playTime,
      homeTeam: {
        ...existing.homeTeam,
        crestUrl: live.homeBadge || existing.homeTeam.crestUrl || getTeamCrest(live.homeTeam),
        score: statusInfo.isUpcoming ? 0 : live.score.home,
      },
      awayTeam: {
        ...existing.awayTeam,
        crestUrl: live.awayBadge || existing.awayTeam.crestUrl || getTeamCrest(live.awayTeam),
        score: statusInfo.isUpcoming ? 0 : live.score.away,
      },
      status: statusInfo.status,
      hasLiveBroadcast: statusInfo.isLive && Boolean(live.streamUrl || existing.streamUrl),
      streamUrl: statusInfo.isLive ? (live.streamUrl || existing.streamUrl) : undefined,
      streams: statusInfo.isLive ? (live.streams || existing.streams) : undefined,
    };
  }

  const homeCrest = live.homeBadge || getTeamCrest(live.homeTeam);
  const awayCrest = live.awayBadge || getTeamCrest(live.awayTeam);

  const resolvedComp = competitionResolverService.resolveCompetition({
    rawId: live.id,
    competition: live.competition,
    rawName: live.title,
    homeTeam: live.homeTeam,
    awayTeam: live.awayTeam,
    sport: live.sport,
  });

  const effectiveCompetition =
    resolvedComp.isIdentified && (!live.competition || live.competition === 'Global Football' || live.competition === 'Football')
      ? resolvedComp.name
      : live.competition;

  const compLower = (effectiveCompetition || '').toLowerCase();
  const sport: any = resolvedComp.isIdentified
    ? resolvedComp.sport
    : live.sport || (
        compLower.includes('nba') || compLower.includes('euroleague') || compLower.includes('fiba') || compLower.includes('basketball') ? 'basketball' :
        compLower.includes('nhl') || compLower.includes('hockey') || compLower.includes('allsvenskan') || compLower.includes('icehl') || compLower.includes('mhl') || compLower.includes('aihl') ? 'hockey' :
        compLower.includes('nfl') || compLower.includes('american football') ? 'american_football' : 'soccer'
      );

  const compLogo =
    live.competitionLogo ||
    (resolvedComp.isIdentified ? resolvedComp.logoUrl : resolveCompetitionLogo(effectiveCompetition, sport));

  const venue = live.venue || '';

  const statusInfo = normalizeMatchStatus({
    rawStatus: live.status,
    minute: live.minute,
    playTime: live.playTime,
    completed: live.status === 'FT' || (live as any).state === 'post',
  });

  const { status, isLive, isUpcoming, isFinished } = statusInfo;
  const homeScore = isUpcoming ? 0 : (live.score?.home ?? 0);
  const awayScore = isUpcoming ? 0 : (live.score?.away ?? 0);

  const rawKickoff = live.kickoffTime || live.time || 'Today';
  const kickoffTime = isLive
    ? (live.playTime ? `${live.playTime} Live` : (live.minute ? `${live.minute}' Live` : 'Live In-Play'))
    : isFinished
    ? 'Full Time'
    : (rawKickoff.includes('EAT') ? rawKickoff : formatKickoffEAT(rawKickoff));

  const validFixture = isValidFixture(live);
  const isUnsupported = !validFixture || isUnsupportedStreamingCompetition(effectiveCompetition, live.title);
  const compChannel = isUnsupported ? '' : getBroadcastChannelId(effectiveCompetition, sport);
  const resolvedStreamUrl = isUnsupported ? undefined : (live.streamUrl || (isLive ? `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${compChannel}.json` : undefined));
  const resolvedStreams = isUnsupported
    ? undefined
    : ((live.streams && live.streams.length > 0)
      ? live.streams
      : (isLive && resolvedStreamUrl ? [{ id: `srv-${compChannel}`, name: 'Server 1 (Live HD Broadcast)', url: resolvedStreamUrl }] : undefined));

  const hasLiveStream = !isUnsupported && isLive && Boolean(resolvedStreamUrl || (resolvedStreams && resolvedStreams.length > 0));

  const poster = resolveSportBackground(
    sport,
    effectiveCompetition,
    live.imageUrl,
    live.homeTeam,
    live.awayTeam,
    live.id,
    homeCrest,
    awayCrest
  );

  return {
    id: live.id,
    competition: effectiveCompetition,
    competitionLogo: compLogo,
    status,
    isLive,
    kickoffDate: 'Today',
    kickoffTime,
    playTime: isLive ? live.playTime : undefined,
    minute: isLive ? live.minute : 0,
    sport,
    homeTeam: {
      id: `team-${live.homeTeam.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: live.homeTeam,
      crestUrl: homeCrest,
      score: homeScore,
    },
    awayTeam: {
      id: `team-${live.awayTeam.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: live.awayTeam,
      crestUrl: awayCrest,
      score: awayScore,
    },
    venue,
    hasLiveBroadcast: !isUnsupported && isLive && hasLiveStream,
    streamUrl: isLive && !isUnsupported ? resolvedStreamUrl : undefined,
    streams: isLive && !isUnsupported ? resolvedStreams : undefined,
    poster,
  };
}

/**
 * Returns the marquee Match of the Day dynamically derived from active live matches or marquee fixtures.
 */
export function getMarqueeMatchOfTheDay(liveMatches?: LiveMatch[]): DiscoverMatchup | null {
  const validPool = (liveMatches || []).filter(m => isValidFixture(m));
  if (validPool.length > 0) {
    const sorted = [...validPool].sort((a, b) => {
      const sA = calculateMatchAnticipationScore(a.homeTeam, a.awayTeam, a.competition, a.status, a.rawDate, a.kickoffTime || a.time);
      const sB = calculateMatchAnticipationScore(b.homeTeam, b.awayTeam, b.competition, b.status, b.rawDate, b.kickoffTime || b.time);
      return sB - sA;
    });
    return resolveLiveMatchToMatchup(sorted[0]);
  }

  const validStatic = (UPCOMING_HIGHLIGHTS || []).filter(m => isValidFixture(m));
  if (validStatic.length > 0) {
    return validStatic[0];
  }

  return null;
}

/**
 * Finds or constructs an authentic competition object by id, slug, or name.
 * Never silently defaults an unknown tournament to Premier League.
 */
export function findCompetitionById(
  idOrName: string,
  optionalMeta?: { sport?: SportType; logoUrl?: string; country?: string }
): DiscoverCompetition {
  const raw = (idOrName || '').trim();
  if (!raw) return EXPLORE_COMPETITIONS[0];

  const clean = raw.toLowerCase();
  const normalizedId = normalizeLeagueId(clean);

  // Sport & Category Aliases
  if (clean === 'all') {
    return {
      id: 'all',
      name: 'All Sports & Tournaments',
      shortName: 'All',
      country: 'Global',
      region: 'International',
      logoUrl: LEAGUE_EMBLEMS['all'],
      accentColor: '#7952FC',
      sport: 'other',
    };
  }
  if (clean === 'football' || clean === 'soccer' || clean === 'world football' || clean === 'global football') {
    return {
      id: 'football',
      name: 'World Football',
      shortName: 'Football',
      country: 'Global',
      region: 'International',
      logoUrl: '',
      accentColor: '#10B981',
      sport: 'soccer',
    };
  }

  const foundExplore = EXPLORE_COMPETITIONS.find(
    c =>
      c.id === normalizedId ||
      c.id === clean ||
      c.id === `comp-${clean}` ||
      c.shortName.toLowerCase() === clean ||
      c.name.toLowerCase() === clean
  );
  if (foundExplore) return foundExplore;

  const foundLeague = POPULAR_LEAGUES.find(
    l =>
      l.id === normalizedId ||
      l.id === clean ||
      l.id === `league-${clean}` ||
      l.name.toLowerCase() === clean
  );
  if (foundLeague) {
    return {
      id: foundLeague.id,
      name: foundLeague.name,
      shortName: foundLeague.name.split(' ')[0],
      country: foundLeague.country,
      region: foundLeague.country,
      logoUrl: foundLeague.logoUrl,
      accentColor: '#7952FC',
      sport: foundLeague.sport || 'soccer',
    };
  }

  const foundFeatured = FEATURED_COMPETITIONS.find(
    f =>
      f.id === normalizedId ||
      normalizeLeagueId(f.id) === normalizedId ||
      f.id === clean ||
      f.id === `comp-${clean}` ||
      f.name.toLowerCase() === clean
  );
  if (foundFeatured) {
    return {
      id: normalizeLeagueId(foundFeatured.id),
      name: foundFeatured.name,
      shortName: foundFeatured.name.split(' ')[0],
      country: foundFeatured.country,
      region: foundFeatured.country,
      logoUrl: foundFeatured.crestUrl,
      accentColor: '#08B3E5',
      sport: foundFeatured.sport || 'soccer',
    };
  }

  const resolved = competitionResolverService.resolveCompetition({
    rawId: normalizedId || clean,
    competition: raw,
    sport: optionalMeta?.sport,
  });

  if (resolved.isIdentified) {
    const canonId = normalizeLeagueId(resolved.id);
    const exploreHit = EXPLORE_COMPETITIONS.find(c => c.id === canonId || c.id === resolved.id);
    if (exploreHit) return exploreHit;

    return {
      id: canonId || resolved.id,
      name: resolved.name,
      shortName: resolved.shortName,
      country: optionalMeta?.country || resolved.country,
      region: resolved.region,
      logoUrl: optionalMeta?.logoUrl || resolved.logoUrl,
      accentColor: resolved.accentColor,
      sport: resolved.sport as SportType,
    };
  }

  const slug = normalizedId || clean.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return {
    id: slug || 'competition',
    name: raw,
    shortName: raw.split(' ').slice(0, 2).join(' '),
    country: optionalMeta?.country || 'International',
    region: optionalMeta?.country || 'International',
    logoUrl: optionalMeta?.logoUrl || resolveCompetitionLogo(raw, optionalMeta?.sport),
    accentColor: '#7952FC',
    sport: optionalMeta?.sport || 'soccer',
  };
}

/**
 * Finds or constructs an authentic PopularTeam object by id or name.
 * Never silently falls back an unknown team to Real Madrid.
 */
export function findTeamById(
  idOrName: string,
  optionalMeta?: {
    name?: string;
    crestUrl?: string;
    sport?: SportType;
    country?: string;
    stadium?: string;
    competitionId?: string;
    competitionName?: string;
  }
): PopularTeam {
  const query = (optionalMeta?.name || idOrName || '').trim();
  const normId = normalizeTeamId(idOrName);
  const nameLower = query.toLowerCase();

  const pool = [...POPULAR_TEAMS, ...popularTeamsService.getCachedPopularTeams()];
  const found = pool.find(
    t =>
      t.id === idOrName ||
      normalizeTeamId(t.id) === normId ||
      t.name.toLowerCase() === nameLower ||
      t.shortName.toLowerCase() === nameLower
  );
  if (found) {
    return {
      ...found,
      crestUrl:
        found.crestUrl || optionalMeta?.crestUrl || getTeamCrest(found.name),
      competitionName: found.competitionName || optionalMeta?.competitionName,
      competitionId: found.competitionId || optionalMeta?.competitionId,
    };
  }

  const displayName =
    optionalMeta?.name ||
    (idOrName.startsWith('team-')
      ? idOrName
          .replace(/^team-/, '')
          .split('-')
          .map(w => (w ? w[0].toUpperCase() + w.slice(1) : ''))
          .join(' ')
      : idOrName);

  const words = displayName.trim().split(/\s+/);
  const shortName =
    words.length >= 2
      ? words.slice(0, 3).map(w => w[0]).join('').toUpperCase()
      : displayName.slice(0, 3).toUpperCase();

  return {
    id: normId || `team-${displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: displayName,
    shortName: shortName || 'CLUB',
    country: optionalMeta?.country || 'International',
    crestUrl: optionalMeta?.crestUrl || getTeamCrest(displayName),
    stadium: optionalMeta?.stadium,
    competitionId: optionalMeta?.competitionId,
    competitionName: optionalMeta?.competitionName,
    sport: optionalMeta?.sport || 'soccer',
  };
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

/**
 * Authoritatively determines the navigation route for any match item across BALLIVE.
 * 
 * Strict routing rules:
 * - Live match (authoritative in-play state: active clock, in-play period, or verified provider live state) -> 'LiveStreamDetails'
 * - Upcoming match (scheduled, pre-game) -> 'MatchDetails' (Unified Upcoming Match Details screen)
 * - Finished match (completed, full time) -> 'MatchDetails'
 * 
 * Never routes to LiveStreamDetails solely based on scheduled kickoff time having passed or
 * having a stream link configured on an upcoming fixture.
 */
export function determineMatchRoute(match: any): ScreenRoute {
  if (!match) {
    return { name: 'Main', tab: 'Home' };
  }

  // Determine authoritative live state using normalizeMatchStatus
  const statusInfo = normalizeMatchStatus({
    rawStatus: match.status,
    state: match.state,
    shortDetail: match.shortDetail || match.kickoffTime || match.time,
    detail: match.detail,
    completed: match.completed || match.status === 'FT',
    minute: match.minute,
    playTime: match.playTime,
    sport: match.sport,
  });

  const matchup: DiscoverMatchup =
    typeof match.homeTeam === 'object' && match.homeTeam?.name
      ? (match as DiscoverMatchup)
      : resolveLiveMatchToMatchup(match as LiveMatch);

  const isFinished =
    statusInfo.isFinished ||
    match.status === 'FT' ||
    match.status === 'FINAL' ||
    match.status === 'AET' ||
    match.status === 'PEN' ||
    match.state === 'post' ||
    (matchup as any).status === 'FT' ||
    (matchup as any).status === 'FINAL' ||
    (matchup as any).state === 'post';

  // Match is authoritatively live only when not finished AND actively in-play
  const isAuthoritativelyLive =
    !isFinished &&
    (statusInfo.isLive ||
      match.status === 'LIVE' ||
      matchup.status === 'LIVE' ||
      Boolean(match.isLive) ||
      Boolean(matchup.isLive) ||
      (match.minute !== undefined && match.minute > 0 && match.minute <= 130) ||
      (matchup.minute !== undefined && matchup.minute > 0 && matchup.minute <= 130) ||
      match.playTime === 'HT' ||
      matchup.playTime === 'HT' ||
      Boolean(typeof match.playTime === 'string' && match.playTime.includes('LIVE')) ||
      Boolean(typeof matchup.playTime === 'string' && matchup.playTime.includes('LIVE')));

  // If match is authoritatively LIVE and valid, route to LiveStreamDetails
  const canStream =
    isAuthoritativelyLive &&
    isValidFixture(matchup) &&
    !isUnsupportedStreamingCompetition(matchup.competition, `${matchup.homeTeam?.name || ''} ${matchup.awayTeam?.name || ''}`);

  if (canStream) {
    return {
      name: 'LiveStreamDetails',
      params: { match: matchup },
    };
  }

  // Otherwise (Upcoming, Completed, or Non-Streamable), route to MatchDetails
  return {
    name: 'MatchDetails',
    params: { matchup },
  };
}

export function navigateToMatch(navigate: (route: ScreenRoute) => void, match: any) {
  const route = determineMatchRoute(match);
  navigate(route);
}

