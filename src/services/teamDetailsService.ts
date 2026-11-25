import { API_CONFIG, getBroadcastChannelId } from '../config/api';
import { DiscoverMatchup, POPULAR_TEAMS, PopularTeam } from '../constants/discoverData';
import { LEAGUE_EMBLEMS } from '../constants/crests';
import { resolveCompetitionLogo } from '../components/common/CompetitionLogo';
import { getTeamCrest, DEFAULT_CREST } from '../utils/teamCrestResolver';
import { formatMatchSchedule, parseKickoffTimestamp } from '../utils/matchStatus';
import { resolveSportBackground } from '../utils/sportBackgroundResolver';
import { competitionResolverService } from './competitionResolverService';
import { streamingApiService } from './streamingApiService';
import { popularTeamsService } from './popularTeamsService';

export interface TeamFixtureItem {
  id: string;
  isHome: boolean;
  opponentName: string;
  opponentCrest: string;
  competition: string;
  dateLabel: string;
  timeLabel: string;
  status: 'LIVE' | 'UPCOMING' | 'FT';
  playTime?: string;
  minute?: number;
  teamScore: number;
  opponentScore: number;
  resultCode?: 'W' | 'D' | 'L';
  matchup: DiscoverMatchup;
}

export interface TeamDetailsPayload {
  resolvedTeam: PopularTeam;
  competitionId?: string;
  competitionName?: string;
  competitionLogo?: string;
  venue?: string;
  country?: string;
  standingSummary?: string;
  recordSummary?: string;
  sportLabel: string;
  recentForm: Array<'W' | 'D' | 'L'>;
  liveAndUpcoming: TeamFixtureItem[];
  recentResults: TeamFixtureItem[];
}

function extractScoreNum(rawScore: any): number {
  if (rawScore === undefined || rawScore === null) return 0;
  if (typeof rawScore === 'object') {
    if (typeof rawScore.value === 'number' && !isNaN(rawScore.value)) return rawScore.value;
    if (rawScore.displayValue !== undefined) return parseInt(String(rawScore.displayValue), 10) || 0;
    return 0;
  }
  return parseInt(String(rawScore), 10) || 0;
}

function cleanTeamStr(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/\b(fc|cf|sc|afc|ac|cd|ud|club|the)\b/g, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isSameTeam(aName: string, bName: string): boolean {
  const a = cleanTeamStr(aName);
  const b = cleanTeamStr(bName);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length >= 5 && b.length >= 5 && (a.includes(b) || b.includes(a))) return true;
  return false;
}

function getSportDisplay(sport?: string): string {
  const s = (sport || '').toLowerCase();
  if (s === 'basketball') return 'Basketball';
  if (s === 'hockey') return 'Ice Hockey';
  if (s === 'american_football' || s === 'football') return 'American Football';
  if (s === 'tennis') return 'Tennis';
  if (s === 'cricket') return 'Cricket';
  if (s === 'motorsport' || s === 'racing') return 'Motorsport';
  return 'Football';
}

function normalizeEspnSportToAppSport(espnSport?: string): any {
  const s = (espnSport || '').toLowerCase();
  if (s === 'football') return 'american_football';
  if (s === 'racing') return 'motorsport';
  if (s === 'basketball' || s === 'hockey' || s === 'tennis' || s === 'cricket') return s;
  return 'soccer';
}

function stripReliableVenue(v?: string): string | undefined {
  if (!v) return undefined;
  const trimmed = v.trim();
  const lower = trimmed.toLowerCase();
  if (
    !trimmed ||
    lower === 'stadium' ||
    lower === 'arena' ||
    lower === 'premier sports stadium' ||
    lower === 'nba arena' ||
    lower === 'nhl ice arena' ||
    lower === 'stadium arena' ||
    lower.endsWith(' stadium') && lower.startsWith(trimmed.slice(0, 6).toLowerCase()) && trimmed.split(' ').length <= 3
  ) {
    // Allow genuine named stadiums like "Emirates Stadium", "Etihad Stadium"
    if (
      lower === 'stadium' ||
      lower === 'arena' ||
      lower === 'premier sports stadium' ||
      lower === 'nba arena' ||
      lower === 'nhl ice arena' ||
      lower === 'stadium arena'
    ) {
      return undefined;
    }
  }
  return trimmed;
}

class TeamDetailsService {
  private detailsCache = new Map<string, { data: TeamDetailsPayload; timestamp: number }>();
  private readonly CACHE_TTL = 2 * 60 * 1000;

  private async resolveEspnIdentity(
    team: PopularTeam
  ): Promise<{ espnSport: string; espnLeague: string; espnId: string; competitionName?: string; logo?: string } | null> {
    if (team.espnId && team.espnSport && team.espnLeague) {
      return {
        espnSport: team.espnSport,
        espnLeague: team.espnLeague,
        espnId: String(team.espnId),
        competitionName: team.competitionName,
        logo: team.crestUrl,
      };
    }

    // Check baseline + cached dynamic teams
    const knownList = [...POPULAR_TEAMS, ...popularTeamsService.getCachedPopularTeams()];
    const matched = knownList.find(
      t =>
        (t.id === team.id || isSameTeam(t.name, team.name)) &&
        t.espnId &&
        t.espnSport &&
        t.espnLeague
    );
    if (matched?.espnId && matched.espnSport && matched.espnLeague) {
      return {
        espnSport: matched.espnSport,
        espnLeague: matched.espnLeague,
        espnId: String(matched.espnId),
        competitionName: matched.competitionName,
        logo: matched.crestUrl,
      };
    }

    // Also check if id already contains espn uid pattern e.g. s:600~t:360
    const uidMatch = team.id?.match(/~t:(\d+)/);
    if (uidMatch && team.espnLeague) {
      return {
        espnSport: team.espnSport || (team.sport === 'soccer' || !team.sport ? 'soccer' : team.sport),
        espnLeague: team.espnLeague,
        espnId: uidMatch[1],
        competitionName: team.competitionName,
        logo: team.crestUrl,
      };
    }

    // Query ESPN Search API v2
    try {
      const url = `https://site.api.espn.com/apis/search/v2?query=${encodeURIComponent(team.name)}&limit=8`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const json = await res.json();
      const teamGroup = (json?.results || []).find((g: any) => g.type === 'team');
      const items: any[] = teamGroup?.contents || [];
      if (items.length === 0) return null;

      const wantedSport = (team.espnSport || team.sport || '').toLowerCase();
      let best = items.find(it => {
        const itName = it.displayName || it.name || '';
        const sportOk =
          !wantedSport ||
          wantedSport === 'soccer' && it.sport === 'soccer' ||
          wantedSport === it.sport ||
          (wantedSport === 'american_football' && it.sport === 'football');
        return sportOk && isSameTeam(itName, team.name) && it.defaultLeagueSlug && typeof it.uid === 'string' && it.uid.includes('~t:');
      });

      if (!best) {
        best = items.find(
          it => it.defaultLeagueSlug && typeof it.uid === 'string' && it.uid.includes('~t:')
        );
      }
      if (!best) return null;

      const idM = best.uid.match(/~t:(\d+)/);
      if (!idM || !best.defaultLeagueSlug) return null;

      return {
        espnSport: best.sport || 'soccer',
        espnLeague: best.defaultLeagueSlug,
        espnId: idM[1],
        competitionName: best.subtitle || team.competitionName,
        logo: best.image?.default || best.images?.[0]?.url,
      };
    } catch {
      return null;
    }
  }

  public async getTeamDetails(team: PopularTeam, forceRefresh = false): Promise<TeamDetailsPayload> {
    const cacheKey = `${team.id}_${team.name.toLowerCase().trim()}`;
    const cached = this.detailsCache.get(cacheKey);
    if (!forceRefresh && cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const identity = await this.resolveEspnIdentity(team);
    const allItems: TeamFixtureItem[] = [];
    const seenMatchIds = new Set<string>();

    let resolvedVenue =
      team.stadium && team.stadium !== `${team.name} Stadium`
        ? stripReliableVenue(team.stadium)
        : undefined;
    let resolvedCountry =
      team.country && team.country !== 'Global' && team.country !== 'CLUB' && team.country !== 'SOCCER'
        ? team.country
        : undefined;
    let standingSummary: string | undefined;
    let recordSummary: string | undefined;
    let resolvedCrest = team.crestUrl && team.crestUrl !== DEFAULT_CREST ? team.crestUrl : getTeamCrest(team.name);
    let compName = team.competitionName || identity?.competitionName;
    let compId = team.competitionId;

    const appSport = normalizeEspnSportToAppSport(identity?.espnSport || team.espnSport || team.sport);
    const sportLabel = getSportDisplay(appSport);

    const pushFixture = (item: TeamFixtureItem) => {
      const dateSlice = (item.matchup.rawDate || item.dateLabel || '').slice(0, 10);
      const dedupKey = `${cleanTeamStr(item.matchup.homeTeam.name)}_${cleanTeamStr(item.matchup.awayTeam.name)}_${dateSlice}`;
      if (seenMatchIds.has(item.id) || seenMatchIds.has(dedupKey)) return;
      seenMatchIds.add(item.id);
      seenMatchIds.add(dedupKey);
      allItems.push(item);
    };

    // 1. Fetch ESPN Team Profile + Schedule (past & upcoming)
    if (identity) {
      const { espnSport, espnLeague, espnId } = identity;
      const teamUrl = `${API_CONFIG.ESPN_BASE}/${espnSport}/${espnLeague}/teams/${espnId}`;
      const pastUrl = `${API_CONFIG.ESPN_BASE}/${espnSport}/${espnLeague}/teams/${espnId}/schedule`;
      const requests: Array<Promise<any>> = [
        fetch(teamUrl).then(r => (r.ok ? r.json() : null)).catch(() => null),
        fetch(pastUrl).then(r => (r.ok ? r.json() : null)).catch(() => null),
      ];
      if (espnSport === 'soccer') {
        requests.push(
          fetch(`${pastUrl}?fixture=true`).then(r => (r.ok ? r.json() : null)).catch(() => null)
        );
      }

      const [teamJson, pastJson, fixtureJson] = await Promise.all(requests);

      if (teamJson?.team) {
        const tInfo = teamJson.team;
        if (tInfo.venue?.fullName) {
          resolvedVenue = tInfo.venue.fullName;
        }
        if (tInfo.venue?.address?.country && !resolvedCountry) {
          resolvedCountry = tInfo.venue.address.country;
        }
        if (tInfo.standingSummary) {
          standingSummary = tInfo.standingSummary;
        }
        if (tInfo.record?.items?.[0]?.summary) {
          recordSummary = tInfo.record.items[0].summary;
        }
        if (tInfo.logos?.[0]?.href && (resolvedCrest === DEFAULT_CREST || !team.crestUrl)) {
          resolvedCrest = tInfo.logos[0].href;
        }
      }

      const combinedEvents = [
        ...(Array.isArray(pastJson?.events) ? pastJson.events : []),
        ...(Array.isArray(fixtureJson?.events) ? fixtureJson.events : []),
      ];

      combinedEvents.forEach((ev: any) => {
        const comp = ev.competitions?.[0];
        const competitors: any[] = comp?.competitors || [];
        if (competitors.length < 2) return;

        const home = competitors.find((c: any) => c.homeAway === 'home') || competitors[0];
        const away = competitors.find((c: any) => c.homeAway === 'away') || competitors[1];

        const homeName = home?.team?.displayName || home?.team?.shortDisplayName || '';
        const awayName = away?.team?.displayName || away?.team?.shortDisplayName || '';
        if (!homeName || !awayName) return;

        const isHomeSide =
          String(home?.id || home?.team?.id || '') === espnId ||
          isSameTeam(homeName, team.name);

        const opponentComp = isHomeSide ? away : home;
        const myComp = isHomeSide ? home : away;
        const opponentName = opponentComp?.team?.displayName || opponentComp?.team?.shortDisplayName || 'Opponent';

        const homeLogo =
          home?.team?.logos?.[0]?.href || home?.team?.logo || getTeamCrest(homeName);
        const awayLogo =
          away?.team?.logos?.[0]?.href || away?.team?.logo || getTeamCrest(awayName);
        const opponentCrest = isHomeSide ? awayLogo : homeLogo;

        const st = comp?.status?.type || ev.status?.type || {};
        const state = st.state;
        const isLive = state === 'in';
        const isCompleted = Boolean(st.completed || state === 'post');
        const status: 'LIVE' | 'UPCOMING' | 'FT' = isLive ? 'LIVE' : isCompleted ? 'FT' : 'UPCOMING';

        const homeScore = isLive || isCompleted ? extractScoreNum(home?.score) : 0;
        const awayScore = isLive || isCompleted ? extractScoreNum(away?.score) : 0;
        const myScore = isHomeSide ? homeScore : awayScore;
        const oppScore = isHomeSide ? awayScore : homeScore;

        let resultCode: 'W' | 'D' | 'L' | undefined;
        if (isCompleted) {
          if (myComp?.winner === true) resultCode = 'W';
          else if (opponentComp?.winner === true) resultCode = 'L';
          else if (myScore > oppScore) resultCode = 'W';
          else if (myScore < oppScore) resultCode = 'L';
          else resultCode = 'D';
        }

        const eventCompRaw =
          ev.league?.name ||
          ev.league?.shortName ||
          comp?.league?.name ||
          pastJson?.team?.standingSummary?.replace(/^\d+(?:st|nd|rd|th)\s+in\s+/i, '') ||
          compName ||
          espnLeague.toUpperCase();

        const resolvedComp = competitionResolverService.resolveCompetition({
          rawId: ev.league?.slug || espnLeague,
          competition: eventCompRaw,
          sport: appSport,
        });
        const finalCompName = resolvedComp.isIdentified ? resolvedComp.name : eventCompRaw;
        const finalCompLogo = resolvedComp.isIdentified
          ? resolvedComp.logoUrl
          : resolveCompetitionLogo(ev.league?.slug || eventCompRaw);

        if (!compName) {
          compName = finalCompName;
        }
        if (!compId && resolvedComp.isIdentified) {
          compId = resolvedComp.id;
        }

        const scheduleInfo = formatMatchSchedule(ev.date);
        const kickoffTimestamp = parseKickoffTimestamp(ev.date);
        const playTime = isLive ? st.shortDetail || st.detail || 'LIVE' : undefined;
        const venueName = comp?.venue?.fullName || '';
        if (isHomeSide && venueName && !resolvedVenue) {
          resolvedVenue = venueName;
        }

        const channel = getBroadcastChannelId(finalCompName, appSport);
        const streamUrl = isLive ? `${API_CONFIG.DAG_SPORTS_BASE}/stream/tv/${channel}.json` : undefined;

        const matchup: DiscoverMatchup = {
          id: `team-espn-${ev.id}`,
          competition: finalCompName,
          competitionLogo: finalCompLogo,
          status,
          isLive,
          kickoffDate: scheduleInfo.dateLabel,
          kickoffTime: isLive ? `${playTime || 'LIVE'}` : isCompleted ? 'Full Time' : scheduleInfo.timeEAT,
          kickoffTimestamp,
          rawDate: ev.date,
          playTime,
          sport: appSport,
          homeTeam: {
            id: `team-${homeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            name: homeName,
            crestUrl: homeLogo,
            score: homeScore,
          },
          awayTeam: {
            id: `team-${awayName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            name: awayName,
            crestUrl: awayLogo,
            score: awayScore,
          },
          venue: venueName || resolvedVenue || '',
          hasLiveBroadcast: isLive,
          streamUrl,
          streams:
            isLive && streamUrl
              ? [{ id: `srv-${channel}`, name: 'Server 1 (Live HD Broadcast)', url: streamUrl }]
              : undefined,
          poster: resolveSportBackground(
            appSport,
            finalCompName,
            comp?.venue?.images?.[0]?.href,
            homeName,
            awayName,
            String(ev.id),
            homeLogo,
            awayLogo
          ),
        };

        pushFixture({
          id: matchup.id,
          isHome: isHomeSide,
          opponentName,
          opponentCrest,
          competition: finalCompName,
          dateLabel: scheduleInfo.dateLabel,
          timeLabel: isLive ? `${playTime || 'LIVE'}` : scheduleInfo.timeEAT.replace(/\s*\(EAT\)/i, '').trim(),
          status,
          playTime,
          teamScore: myScore,
          opponentScore: oppScore,
          resultCode,
          matchup,
        });
      });
    }

    // 2. Merge matching Live / Upcoming fixtures from active catalog (covers non-ESPN leagues too!)
    try {
      const livePool = streamingApiService.getCachedLiveMatches();
      const catalog = livePool.length > 0 ? livePool : await streamingApiService.getLiveMatches().catch(() => []);

      catalog.forEach(m => {
        const homeMatch = isSameTeam(m.homeTeam, team.name);
        const awayMatch = isSameTeam(m.awayTeam, team.name);
        if (!homeMatch && !awayMatch) return;

        const isHome = homeMatch;
        const matchup = streamingApiService.convertLiveMatchToMatchup(m);
        const status: 'LIVE' | 'UPCOMING' | 'FT' =
          matchup.status === 'LIVE' ? 'LIVE' : matchup.status === 'FT' ? 'FT' : 'UPCOMING';

        const opponentName = isHome ? matchup.awayTeam.name : matchup.homeTeam.name;
        const opponentCrest = isHome ? matchup.awayTeam.crestUrl : matchup.homeTeam.crestUrl;
        const myScore = isHome ? matchup.homeTeam.score ?? 0 : matchup.awayTeam.score ?? 0;
        const oppScore = isHome ? matchup.awayTeam.score ?? 0 : matchup.homeTeam.score ?? 0;

        if (!compName && matchup.competition && matchup.competition !== 'Global Football') {
          compName = matchup.competition;
        }

        pushFixture({
          id: matchup.id,
          isHome,
          opponentName,
          opponentCrest,
          competition: matchup.competition,
          dateLabel: matchup.kickoffDate || 'Today',
          timeLabel:
            status === 'LIVE'
              ? matchup.playTime || (matchup.minute ? `${matchup.minute}'` : 'LIVE')
              : (matchup.kickoffTime || 'TBD').replace(/\s*\(EAT\)/i, '').trim(),
          status,
          playTime: matchup.playTime || (matchup.minute ? `${matchup.minute}'` : undefined),
          minute: matchup.minute,
          teamScore: myScore,
          opponentScore: oppScore,
          resultCode:
            status === 'FT'
              ? myScore > oppScore
                ? 'W'
                : myScore < oppScore
                ? 'L'
                : 'D'
              : undefined,
          matchup,
        });
      });
    } catch {
      // ignore catalog fallback error
    }

    // Partition Live + Upcoming (ascending) vs Recent Results (descending)
    const liveAndUpcoming = allItems
      .filter(f => f.status === 'LIVE' || f.status === 'UPCOMING')
      .sort((a, b) => {
        if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
        if (b.status === 'LIVE' && a.status !== 'LIVE') return 1;
        return (a.matchup.kickoffTimestamp || 0) - (b.matchup.kickoffTimestamp || 0);
      });

    const recentResults = allItems
      .filter(f => f.status === 'FT')
      .sort((a, b) => (b.matchup.kickoffTimestamp || 0) - (a.matchup.kickoffTimestamp || 0));

    // Recent Form from last 5 completed matches (chronological oldest -> newest left-to-right, or newest last)
    const lastFive = recentResults
      .slice(0, 5)
      .reverse()
      .map(r => r.resultCode)
      .filter((c): c is 'W' | 'D' | 'L' => Boolean(c));

    // Resolve competition ID & logo if competitionName is known
    const compResolution = competitionResolverService.resolveCompetition({
      rawId: compId || identity?.espnLeague,
      competition: compName,
      sport: appSport,
    });
    const finalCompId = compResolution.isIdentified ? compResolution.id : compId;
    const finalCompName = compResolution.isIdentified ? compResolution.name : compName;
    const finalCompLogo = compResolution.isIdentified
      ? compResolution.logoUrl
      : finalCompName
      ? resolveCompetitionLogo(finalCompName)
      : undefined;

    if (!resolvedCountry && compResolution.isIdentified && compResolution.country !== 'Global' && compResolution.country !== 'International') {
      resolvedCountry = compResolution.country;
    }

    const payload: TeamDetailsPayload = {
      resolvedTeam: {
        ...team,
        crestUrl: resolvedCrest,
        stadium: resolvedVenue || team.stadium,
        country: resolvedCountry || team.country,
        competitionId: finalCompId,
        competitionName: finalCompName,
        espnId: identity?.espnId || team.espnId,
        espnSport: identity?.espnSport || team.espnSport,
        espnLeague: identity?.espnLeague || team.espnLeague,
        sport: appSport,
      },
      competitionId: finalCompId,
      competitionName: finalCompName,
      competitionLogo: finalCompLogo,
      venue: resolvedVenue,
      country: resolvedCountry,
      standingSummary,
      recordSummary,
      sportLabel,
      recentForm: lastFive,
      liveAndUpcoming,
      recentResults,
    };

    this.detailsCache.set(cacheKey, { data: payload, timestamp: Date.now() });
    return payload;
  }
}

export const teamDetailsService = new TeamDetailsService();
export default teamDetailsService;
