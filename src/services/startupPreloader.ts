/**
 * BALLIVE Startup Image Preloader
 *
 * Initializes persistent disk cache and pre-warms priority crests/emblems
 * cleanly in the background without blocking app launch or Home rendering.
 */

import { EXPLORE_COMPETITIONS, POPULAR_LEAGUES, POPULAR_TEAMS } from '../constants/discoverData';
import { FEATURED_COMPETITIONS, LiveMatch } from '../constants/mockData';
import { buildCompetitionLogoCandidates } from '../components/common/CompetitionLogo';
import { imageCacheService, ImageCacheSpec } from './imageCacheService';
import { teamEmblemService } from './teamEmblemService';
import { ProfileStorage, normalizeLeagueId, normalizeTeamId } from './profileStorage';
import { popularTeamsService } from './popularTeamsService';
import { streamingApiService } from './streamingApiService';

class StartupPreloader {
  private hasRunLaunchWarmup = false;

  /**
   * Immediately hydrates persistent disk index on mount and warms
   * followed entities + core Discover competitions & schedule cache cleanly in the background.
   */
  public warmCoreAssetsOnStartup(): void {
    if (this.hasRunLaunchWarmup) return;
    this.hasRunLaunchWarmup = true;

    (async () => {
      await Promise.allSettled([
        imageCacheService.init(),
        popularTeamsService.init(),
        streamingApiService.initDiskCache(),
      ]);

      const specs: ImageCacheSpec[] = [];

      // 1. User followed teams & competitions (Priority 4 -> quickly ready for Saved tab)
      try {
        await ProfileStorage.init();
        const profile = ProfileStorage.getProfile();

        (profile.followedTeamIds || []).forEach(id => {
          const nid = normalizeTeamId(id);
          const meta = profile.followedTeamsMeta?.[nid] || profile.followedTeamsMeta?.[id];
          const candidates = teamEmblemService.buildCandidates(id, meta?.name, meta?.crestUrl);
          if (candidates.length > 0) {
            specs.push({
              entityKey: teamEmblemService.getEntityKey(id, meta?.name),
              category: 'team',
              candidates,
              priority: 4,
            });
          }
        });

        (profile.followedLeagueIds || []).forEach(id => {
          const nid = normalizeLeagueId(id);
          const meta = profile.followedLeaguesMeta?.[nid] || profile.followedLeaguesMeta?.[id];
          specs.push({
            entityKey: `comp:${nid}`,
            category: 'competition',
            candidates: buildCompetitionLogoCandidates(meta?.logoUrl, nid),
            priority: 4,
          });
        });
      } catch {
        // Ignore profile init failures cleanly
      }

      // 2. Explore & Featured competitions (Priority 3)
      EXPLORE_COMPETITIONS.slice(0, 16).forEach(comp => {
        specs.push({
          entityKey: `comp:${normalizeLeagueId(comp.id)}`,
          category: 'competition',
          candidates: buildCompetitionLogoCandidates(comp.logoUrl, comp.id),
          priority: 3,
        });
      });

      [...FEATURED_COMPETITIONS, ...POPULAR_LEAGUES].slice(0, 12).forEach(comp => {
        const cleanId = normalizeLeagueId(comp.id);
        const url = 'crestUrl' in comp ? comp.crestUrl : comp.logoUrl;
        specs.push({
          entityKey: `comp:${cleanId}`,
          category: 'competition',
          candidates: buildCompetitionLogoCandidates(url, cleanId),
          priority: 3,
        });
      });

      // 3. Top seeded/cached Popular Teams (Priority 5)
      const teams = popularTeamsService.getCachedPopularTeams() || POPULAR_TEAMS;
      teams.slice(0, 18).forEach(t => {
        const candidates = teamEmblemService.buildCandidates(t.id, t.name, t.crestUrl);
        if (candidates.length > 0) {
          specs.push({
            entityKey: teamEmblemService.getEntityKey(t.id, t.name),
            category: 'team',
            candidates,
            priority: 5,
          });
        }
      });

      imageCacheService.preload(specs);
    })();
  }

  /**
   * Called after Home/Discover fetches live & upcoming matches to preload
   * visible match crests (Priority 1 for LIVE, Priority 2 for UPCOMING).
   */
  public preloadMatches(matches: LiveMatch[]): void {
    if (!Array.isArray(matches) || matches.length === 0) return;

    const specs: ImageCacheSpec[] = [];
    const target = matches.slice(0, 28);

    target.forEach(m => {
      const isLive = m.status === 'LIVE' || m.isLive || (m.minute > 0 && m.minute < 130);
      const priority = isLive ? 1 : 2;

      const homeCands = teamEmblemService.buildCandidates((m as any).homeTeamId, m.homeTeam, m.homeBadge);
      if (homeCands.length > 0) {
        specs.push({
          entityKey: teamEmblemService.getEntityKey((m as any).homeTeamId, m.homeTeam),
          category: 'team',
          candidates: homeCands,
          priority,
        });
      }

      const awayCands = teamEmblemService.buildCandidates((m as any).awayTeamId, m.awayTeam, m.awayBadge);
      if (awayCands.length > 0) {
        specs.push({
          entityKey: teamEmblemService.getEntityKey((m as any).awayTeamId, m.awayTeam),
          category: 'team',
          candidates: awayCands,
          priority,
        });
      }

      if (m.competition) {
        specs.push({
          entityKey: `comp:${normalizeLeagueId(m.competition)}`,
          category: 'competition',
          candidates: buildCompetitionLogoCandidates(m.competitionLogo, m.competition),
          priority: Math.min(3, priority + 1) as 2 | 3,
        });
      }
    });

    imageCacheService.preload(specs);
  }
}

export const startupPreloader = new StartupPreloader();
export default startupPreloader;
