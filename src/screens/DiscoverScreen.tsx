import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SearchX, RotateCcw } from 'lucide-react-native';
import Colors from '../theme/colors';
import { DiscoverHeader } from '../features/discover/DiscoverHeader';
import { ExploreCompetitions } from '../features/discover/ExploreCompetitions';
import { CommunityPromoBanner } from '../features/discover/CommunityPromoBanner';
import { PopularTeams } from '../features/discover/PopularTeams';
import { UpcomingHighlights } from '../features/discover/UpcomingHighlights';
import {
  EXPLORE_COMPETITIONS,
  POPULAR_LEAGUES,
  POPULAR_TEAMS,
  UPCOMING_HIGHLIGHTS,
  DiscoverCompetition,
  PopularLeague,
  PopularTeam,
  DiscoverMatchup,
} from '../constants/discoverData';

import { useAppNavigation } from '../navigation/NavigationContext';
import { useProfile } from '../hooks/useProfile';
import { streamingApiService } from '../services/streamingApiService';
import { sportsApiService, GlobalSearchResult } from '../services/sportsApiService';

export const DiscoverScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { toggleMatchReminder } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [liveHighlights, setLiveHighlights] = useState<DiscoverMatchup[]>([]);
  const [globalSearchResults, setGlobalSearchResults] = useState<GlobalSearchResult[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    streamingApiService.getLiveMatches().then(matches => {
      if (isMounted && matches && matches.length > 0) {
        setLiveHighlights(matches.map(m => streamingApiService.convertLiveMatchToMatchup(m)));
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // ── FILTER DATA IN REAL TIME & GLOBAL ESPN SEARCH ──
  const query = searchQuery.trim().toLowerCase();

  React.useEffect(() => {
    if (!query || query.length < 2) {
      setGlobalSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      sportsApiService.searchGlobalTeamsAndLeagues(query).then(results => {
        setGlobalSearchResults(results);
      }).catch(() => {
        setGlobalSearchResults([]);
      });
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

    // Merge dynamically discovered global leagues (e.g. MLS, Saudi Pro League)
    const dynamicComps: DiscoverCompetition[] = globalSearchResults
      .filter(r => r.type === 'competition')
      .map(r => ({
        id: r.id,
        name: r.name,
        shortName: r.name.split(' ').map(w => w[0]).join('').substring(0, 4).toUpperCase(),
        country: r.category || 'Global',
        region: 'International',
        logoUrl: r.logo,
        accentColor: '#7952FC',
        season: '2025/2026',
        teamsCount: 20,
        sport: (r.sport as any) || 'soccer',
      }));

    const combined = [...base];
    dynamicComps.forEach(dc => {
      if (!combined.some(existing => existing.name.toLowerCase() === dc.name.toLowerCase())) {
        combined.push(dc);
      }
    });

    return combined;
  }, [query, globalSearchResults]);

  const filteredLeagues = useMemo(() => {
    const base = !query
      ? POPULAR_LEAGUES
      : POPULAR_LEAGUES.filter(
          l =>
            l.name.toLowerCase().includes(query) ||
            l.country.toLowerCase().includes(query) ||
            l.description.toLowerCase().includes(query)
        );

    const dynamicLeagues: PopularLeague[] = globalSearchResults
      .filter(r => r.type === 'competition')
      .map(r => ({
        id: r.id,
        name: r.name,
        country: r.category || 'Global',
        description: `${r.name} Championship`,
        logoUrl: r.logo,
        currentMatchweek: 'Season 2025/26',
        sport: (r.sport as any) || 'soccer',
      }));

    const combined = [...base];
    dynamicLeagues.forEach(dl => {
      if (!combined.some(existing => existing.name.toLowerCase() === dl.name.toLowerCase())) {
        combined.push(dl);
      }
    });

    return combined;
  }, [query, globalSearchResults]);

  const filteredTeams = useMemo(() => {
    const base = !query
      ? POPULAR_TEAMS
      : POPULAR_TEAMS.filter(
          t =>
            t.name.toLowerCase().includes(query) ||
            t.country.toLowerCase().includes(query) ||
            t.shortName.toLowerCase().includes(query) ||
            t.domesticTitle.toLowerCase().includes(query)
        );

    // Merge dynamically discovered global teams (e.g. Al Nassr, Inter Miami, Boca Juniors)
    const dynamicTeams: PopularTeam[] = globalSearchResults
      .filter(r => r.type === 'team')
      .map(r => ({
        id: r.id,
        name: r.name,
        shortName: r.name.substring(0, 3).toUpperCase(),
        country: r.category || 'Global',
        crestUrl: r.logo,
        stadium: `${r.name} Stadium`,
        domesticTitle: r.category || 'Professional Club',
        sport: (r.sport as any) || 'soccer',
      }));

    const combined = [...base];
    dynamicTeams.forEach(dt => {
      if (!combined.some(existing => existing.name.toLowerCase() === dt.name.toLowerCase())) {
        combined.push(dt);
      }
    });

    return combined;
  }, [query, globalSearchResults]);

  const filteredMatchups = useMemo(() => {
    const list = liveHighlights.length > 0 ? liveHighlights : UPCOMING_HIGHLIGHTS;
    if (!query) return list;
    return list.filter(
      m =>
        m.competition.toLowerCase().includes(query) ||
        m.homeTeam.name.toLowerCase().includes(query) ||
        m.awayTeam.name.toLowerCase().includes(query) ||
        m.venue.toLowerCase().includes(query)
    );
  }, [liveHighlights, query]);

  const totalResults =
    filteredCompetitions.length +
    filteredLeagues.length +
    filteredTeams.length +
    filteredMatchups.length;

  const isSearchActive = query.length > 0;
  const hasNoResults = isSearchActive && totalResults === 0;

  // ── USER INTERACTIONS & HANDLERS ──
  const handleCompetitionPress = (comp: DiscoverCompetition) => {
    navigate({
      name: 'CompetitionDetails',
      params: { competition: comp },
    });
  };

  const handleLeaguePress = (league: PopularLeague) => {
    navigate({
      name: 'CompetitionDetails',
      params: { competition: league },
    });
  };

  const handleTeamPress = (team: PopularTeam) => {
    navigate({
      name: 'TeamDetails',
      params: { team },
    });
  };

  const handleMatchDetailsPress = (matchup: DiscoverMatchup) => {
    navigate({
      name: 'MatchDetails',
      params: { matchup },
    });
  };

  const handleWatchPress = (matchup: DiscoverMatchup) => {
    navigate({
      name: 'MatchDetails',
      params: { matchup },
    });
  };

  const handleReminderToggle = (matchup: DiscoverMatchup, isSet: boolean) => {
    toggleMatchReminder(matchup.id);
  };

  const handleNotificationsPress = () => {
    navigate({ name: 'Notifications' });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.headerPurple} translucent={false} />

      {/* ── A. DISCOVER HEADER ── */}
      <DiscoverHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNotificationsPress={handleNotificationsPress}
      />

      {/* ── MAIN VERTICAL CONTENT SCROLLER ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {hasNoResults ? (
          /* Empty Search State */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <SearchX size={38} color={Colors.textMuted} strokeWidth={1.8} />
            </View>
            <Text style={styles.emptyTitle}>No football results found</Text>
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
        ) : (
          <>
            {/* ── B. EXPLORE COMPETITIONS (Horizontally Scrollable) ── */}
            {filteredCompetitions.length > 0 && (
              <ExploreCompetitions
                competitions={filteredCompetitions}
                onSeeAllPress={() => navigate({ name: 'AllCompetitions' })}
                onCompetitionPress={handleCompetitionPress}
              />
            )}

            {/* ── C. COMMUNITY PROMOTIONAL BANNER ── */}
            {!isSearchActive && <CommunityPromoBanner />}

            {/* ── D. POPULAR TEAMS (Horizontally Scrollable) ── */}
            {filteredTeams.length > 0 && (
              <PopularTeams
                teams={filteredTeams}
                onViewAllPress={() => navigate({ name: 'AllTeams' })}
                onTeamPress={handleTeamPress}
              />
            )}

            {/* ── E. UPCOMING HIGHLIGHTS (Football Matchup Cards) ── */}
            {filteredMatchups.length > 0 && (
              <UpcomingHighlights
                matchups={filteredMatchups}
                onViewAllPress={() =>
                  navigate({
                    name: 'MatchDetails',
                    params: { matchup: UPCOMING_HIGHLIGHTS[0] },
                  })
                }
                onMatchDetailsPress={handleMatchDetailsPress}
                onWatchPress={handleWatchPress}
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
    backgroundColor: '#7952FC',
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
