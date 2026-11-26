import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SearchX, RotateCcw } from 'lucide-react-native';
import Colors from '../theme/colors';
import { DiscoverHeader } from '../features/discover/DiscoverHeader';
import { ExploreCompetitions } from '../features/discover/ExploreCompetitions';
import { SportsScheduleTimeline } from '../features/discover/SportsScheduleTimeline';
import { PopularTeams } from '../features/discover/PopularTeams';
import { UpcomingHighlights } from '../features/discover/UpcomingHighlights';
import {
  EXPLORE_COMPETITIONS,
  POPULAR_TEAMS,
  UPCOMING_HIGHLIGHTS,
  DiscoverCompetition,
  PopularTeam,
  DiscoverMatchup,
} from '../constants/discoverData';
import { LiveMatch } from '../constants/mockData';

import { useAppNavigation } from '../navigation/NavigationContext';
import { navigateToMatch, findCompetitionById } from '../navigation/navHelpers';
import { useProfile } from '../hooks/useProfile';
import { streamingApiService } from '../services/streamingApiService';
import { startupPreloader } from '../services/startupPreloader';
import { sportsApiService, GlobalSearchResult } from '../services/sportsApiService';
import { popularTeamsService } from '../services/popularTeamsService';
import { normalizeLeagueId, normalizeTeamId } from '../services/profileStorage';
import { sortMatchesWithLiveFirst, sortUpcomingChronologically } from '../utils/matchStatus';
import { DiscoverSkeleton, ScheduleSectionSkeleton } from '../components/common/SkeletonLoader';

function toLiveAndUpcomingMatchups(matches: LiveMatch[]) {
  const all = matches.map(m => streamingApiService.convertLiveMatchToMatchup(m));
  const upcomingOnly = matches
    .filter(m => m.status === 'UPCOMING')
    .map(m => streamingApiService.convertLiveMatchToMatchup(m));
  return {
    allSorted: sortMatchesWithLiveFirst(all),
    upcomingSorted: sortUpcomingChronologically(upcomingOnly),
  };
}

export const DiscoverScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { toggleMatchReminder } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');

  const [dynamicPopularTeams, setDynamicPopularTeams] = useState<PopularTeam[]>(() =>
    popularTeamsService.getCachedPopularTeams()
  );
  const [liveHighlights, setLiveHighlights] = useState<DiscoverMatchup[]>(() => {
    const cached = streamingApiService.getCachedLiveMatches();
    return cached && cached.length > 0
      ? sortMatchesWithLiveFirst(cached.map(m => streamingApiService.convertLiveMatchToMatchup(m)))
      : [];
  });
  const [upcomingScheduleMatches, setUpcomingScheduleMatches] = useState<DiscoverMatchup[]>(() => {
    const cached = streamingApiService.getCachedUpcomingMatches();
    return cached && cached.length > 0
      ? sortUpcomingChronologically(
          cached
            .filter(m => m.status === 'UPCOMING')
            .map(m => streamingApiService.convertLiveMatchToMatchup(m))
        )
      : [];
  });

  const [isLoadingStreams, setIsLoadingStreams] = useState(
    () => streamingApiService.getCachedLiveMatches().length === 0 && streamingApiService.getCachedUpcomingMatches().length === 0
  );
  const [globalSearchResults, setGlobalSearchResults] = useState<GlobalSearchResult[]>([]);

  // Subscribe cleanly to shared in-memory caches so Home/disk updates arrive automatically without refetching
  useEffect(() => {
    let isMounted = true;

    const unsubTeams = popularTeamsService.subscribe(teams => {
      if (isMounted && teams.length > 0) {
        setDynamicPopularTeams(teams);
      }
    });

    const unsubStreams = streamingApiService.subscribe((live, upcoming) => {
      if (!isMounted) return;
      if (live && live.length > 0) {
        const { allSorted, upcomingSorted } = toLiveAndUpcomingMatchups(live);
        setLiveHighlights(allSorted);
        if (upcomingSorted.length > 0) {
          setUpcomingScheduleMatches(upcomingSorted);
        }
        setIsLoadingStreams(false);
      } else if (upcoming && upcoming.length > 0) {
        const upSorted = sortUpcomingChronologically(
          upcoming.filter(m => m.status === 'UPCOMING').map(m => streamingApiService.convertLiveMatchToMatchup(m))
        );
        if (upSorted.length > 0) {
          setUpcomingScheduleMatches(upSorted);
          setIsLoadingStreams(false);
        }
      }
    });

    // Hydrate disk caches & trigger stale-while-revalidate refresh only when TTL expired
    streamingApiService.initDiskCache().catch(() => {});
    popularTeamsService.init().catch(() => {});

    streamingApiService
      .getLiveMatches()
      .then(matches => {
        if (!isMounted) return;
        if (matches && matches.length > 0) {
          startupPreloader.preloadMatches(matches);
          const { allSorted, upcomingSorted } = toLiveAndUpcomingMatchups(matches);
          setLiveHighlights(allSorted);
          if (upcomingSorted.length > 0) {
            setUpcomingScheduleMatches(upcomingSorted);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingStreams(false);
      });

    if (!popularTeamsService.isCacheFresh()) {
      popularTeamsService
        .getPopularTeams()
        .then(teams => {
          if (isMounted && teams && teams.length > 0) {
            setDynamicPopularTeams(teams);
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
      unsubTeams();
      unsubStreams();
    };
  }, []);

  const query = searchQuery.trim().toLowerCase();

  useEffect(() => {
    if (!query || query.length < 2) {
      setGlobalSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      sportsApiService
        .searchGlobalTeamsAndLeagues(query)
        .then(results => setGlobalSearchResults(results))
        .catch(() => setGlobalSearchResults([]));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const filteredCompetitions = useMemo(() => {
    const base = !query
      ? EXPLORE_COMPETITIONS
      : EXPLORE_COMPETITIONS.filter(
          c =>
            c.name.toLowerCase().includes(query) ||
            c.country.toLowerCase().includes(query) ||
            c.shortName.toLowerCase().includes(query)
        );

    const dynamicComps: DiscoverCompetition[] = globalSearchResults
      .filter(r => r.type === 'competition')
      .map(r => {
        const canonical = findCompetitionById(r.leagueKey || r.name, {
          logoUrl: r.logo,
          sport: (r.sport as any) || 'soccer',
          country: r.country || r.category,
        });
        return {
          ...canonical,
          id: r.leagueKey ? normalizeLeagueId(r.leagueKey) : canonical.id,
          name: r.name,
          logoUrl: r.logo || canonical.logoUrl,
        };
      });

    const combined = [...base];
    dynamicComps.forEach(dc => {
      if (!combined.some(existing => existing.name.toLowerCase() === dc.name.toLowerCase() || existing.id === dc.id)) {
        combined.push(dc);
      }
    });

    return combined;
  }, [query, globalSearchResults]);

  const filteredTeams = useMemo(() => {
    const pool = dynamicPopularTeams.length > 0 ? dynamicPopularTeams : POPULAR_TEAMS;
    const base = !query
      ? pool
      : pool.filter(
          t =>
            t.name.toLowerCase().includes(query) ||
            t.country.toLowerCase().includes(query) ||
            t.shortName.toLowerCase().includes(query) ||
            (t.competitionName || '').toLowerCase().includes(query)
        );

    const dynamicTeams: PopularTeam[] = globalSearchResults
      .filter(r => r.type === 'team')
      .map(r => ({
        id: normalizeTeamId(`team-${r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`),
        name: r.name,
        shortName: r.name.substring(0, 3).toUpperCase(),
        country: r.category || (r.sport ? r.sport.toUpperCase() : 'International'),
        crestUrl: r.logo,
        competitionId: r.leagueKey,
        competitionName: r.category,
        espnId: r.espnId,
        espnSport: r.espnSport,
        espnLeague: r.espnLeague,
        sport: (r.sport as any) || 'soccer',
      }));

    const combined = [...base];
    dynamicTeams.forEach(dt => {
      if (!combined.some(existing => existing.name.toLowerCase() === dt.name.toLowerCase() || existing.id === dt.id)) {
        combined.push(dt);
      }
    });

    return combined;
  }, [dynamicPopularTeams, query, globalSearchResults]);

  const filteredMatchups = useMemo(() => {
    const list = liveHighlights.length > 0 ? liveHighlights : UPCOMING_HIGHLIGHTS;
    if (!query) return sortMatchesWithLiveFirst(list);
    const filtered = list.filter(
      m =>
        m.competition.toLowerCase().includes(query) ||
        m.homeTeam.name.toLowerCase().includes(query) ||
        m.awayTeam.name.toLowerCase().includes(query) ||
        m.venue.toLowerCase().includes(query)
    );
    return sortMatchesWithLiveFirst(filtered);
  }, [liveHighlights, query]);

  const isSearchActive = query.length > 0;
  const hasNoResults =
    isSearchActive &&
    filteredCompetitions.length === 0 &&
    filteredTeams.length === 0 &&
    filteredMatchups.length === 0;

  const handleCompetitionPress = useCallback(
    (comp: DiscoverCompetition) => {
      navigate({ name: 'CompetitionDetails', params: { competition: comp } });
    },
    [navigate]
  );

  const handleSeeAllCompetitions = useCallback(() => {
    navigate({ name: 'AllCompetitions' });
  }, [navigate]);

  const handleTeamPress = useCallback(
    (team: PopularTeam) => {
      navigate({ name: 'TeamDetails', params: { team } });
    },
    [navigate]
  );

  const handleViewAllTeams = useCallback(() => {
    navigate({ name: 'AllTeams' });
  }, [navigate]);

  const handleMatchDetailsPress = useCallback(
    (matchup: DiscoverMatchup) => {
      navigateToMatch(navigate, matchup);
    },
    [navigate]
  );

  const handleReminderToggle = useCallback(
    (matchup: DiscoverMatchup) => {
      toggleMatchReminder(matchup.id);
    },
    [toggleMatchReminder]
  );

  const handleNotificationsPress = useCallback(() => {
    navigate({ name: 'Notifications' });
  }, [navigate]);

  const handleViewAllStreams = useCallback(() => {
    navigate({ name: 'AllLiveStreams' });
  }, [navigate]);

  const showInitialFullSkeleton =
    !isSearchActive &&
    isLoadingStreams &&
    liveHighlights.length === 0 &&
    upcomingScheduleMatches.length === 0 &&
    !popularTeamsService.isCacheFresh();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <DiscoverHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNotificationsPress={handleNotificationsPress}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {hasNoResults ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <SearchX size={38} color={Colors.textMuted} strokeWidth={1.8} />
            </View>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>
              We couldn't find any teams, competitions, or matches matching "{searchQuery}".
            </Text>
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={() => setSearchQuery('')}
              activeOpacity={0.8}
            >
              <RotateCcw size={16} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.clearSearchButtonText}>Clear search</Text>
            </TouchableOpacity>
          </View>
        ) : showInitialFullSkeleton ? (
          <DiscoverSkeleton />
        ) : (
          <>
            {filteredCompetitions.length > 0 && (
              <ExploreCompetitions
                competitions={filteredCompetitions}
                onSeeAllPress={handleSeeAllCompetitions}
                onCompetitionPress={handleCompetitionPress}
              />
            )}

            {!isSearchActive && (
              upcomingScheduleMatches.length > 0 ? (
                <SportsScheduleTimeline
                  matches={upcomingScheduleMatches}
                  onMatchPress={handleMatchDetailsPress}
                />
              ) : isLoadingStreams ? (
                <ScheduleSectionSkeleton />
              ) : null
            )}

            {filteredTeams.length > 0 && (
              <PopularTeams
                teams={filteredTeams}
                onViewAllPress={handleViewAllTeams}
                onTeamPress={handleTeamPress}
              />
            )}

            {filteredMatchups.length > 0 && (
              <UpcomingHighlights
                matchups={filteredMatchups}
                onViewAllPress={handleViewAllStreams}
                onMatchDetailsPress={handleMatchDetailsPress}
                onWatchPress={handleMatchDetailsPress}
                onReminderToggle={handleReminderToggle}
              />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingTop: 60,
    paddingBottom: 40,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  clearSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7650F6',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  clearSearchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
