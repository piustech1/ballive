import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Colors from '../theme/colors';
import { useProfile } from '../hooks/useProfile';
import { useSavedMatches } from '../hooks/useSavedMatches';
import { SavedHeader, SavedTab } from '../features/saved/SavedHeader';
import { UniversalMatchCard } from '../components/common/UniversalMatchCard';
import { SavedTeamRow } from '../features/saved/SavedTeamRow';
import { SavedCompetitionRow } from '../features/saved/SavedCompetitionRow';
import { SavedEmptyState } from '../features/saved/SavedEmptyState';
import { SavedSkeleton } from '../components/common/SkeletonLoader';
import {
  DiscoverCompetition,
  DiscoverMatchup,
  PopularTeam,
  PopularLeague,
} from '../constants/discoverData';

import { useAppNavigation } from '../navigation/NavigationContext';
import { navigateToMatch, findTeamById, findCompetitionById } from '../navigation/navHelpers';
import { normalizeTeamId, normalizeLeagueId } from '../services/profileStorage';

interface SavedScreenProps {
  onNavigateToDiscover?: () => void;
}

export const SavedScreen: React.FC<SavedScreenProps> = ({ onNavigateToDiscover }) => {
  const { navigate, switchTab } = useAppNavigation();
  const {
    profile,
    isReady: isProfileReady,
    toggleFollowTeam,
    toggleFollowLeague,
  } = useProfile();
  const {
    savedMatches,
    isReady: isSavedReady,
    removeSave,
    refreshSaved,
  } = useSavedMatches();

  const [activeTab, setActiveTab] = useState<SavedTab>('matches');

  // Coalesced passive sync (debounced inside SavedMatchesService to 30s)
  useEffect(() => {
    refreshSaved().catch(() => {});
  }, [refreshSaved]);

  const followedTeams = useMemo(() => {
    const ids = profile.followedTeamIds || [];
    const seen = new Set<string>();
    const list: PopularTeam[] = [];
    ids.forEach(rawId => {
      const nid = normalizeTeamId(rawId);
      if (seen.has(nid)) return;
      seen.add(nid);
      const team =
        profile.followedTeamsMeta?.[nid] ||
        profile.followedTeamsMeta?.[rawId] ||
        findTeamById(rawId);
      if (team) list.push(team);
    });
    return list;
  }, [profile.followedTeamIds, profile.followedTeamsMeta]);

  const followedCompetitions = useMemo(() => {
    const ids = profile.followedLeagueIds || [];
    const seen = new Set<string>();
    const list: DiscoverCompetition[] = [];
    ids.forEach(rawId => {
      const nid = normalizeLeagueId(rawId);
      if (seen.has(nid)) return;
      seen.add(nid);
      const comp =
        profile.followedLeaguesMeta?.[nid] ||
        profile.followedLeaguesMeta?.[rawId] ||
        findCompetitionById(rawId);
      if (comp) list.push(comp);
    });
    return list;
  }, [profile.followedLeagueIds, profile.followedLeaguesMeta]);

  const handleMatchDetails = useCallback(
    (matchup: DiscoverMatchup) => {
      navigateToMatch(navigate, matchup);
    },
    [navigate]
  );

  const handleTeamPress = useCallback(
    (team: PopularTeam) => {
      navigate({ name: 'TeamDetails', params: { team } });
    },
    [navigate]
  );

  const handleLeaguePress = useCallback(
    (league: DiscoverCompetition | PopularLeague) => {
      navigate({ name: 'CompetitionDetails', params: { competition: league } });
    },
    [navigate]
  );

  const handleDiscoverNav = useCallback(() => {
    if (onNavigateToDiscover) {
      onNavigateToDiscover();
    } else {
      switchTab('Discover');
    }
  }, [onNavigateToDiscover, switchTab]);

  const isMatchesLoading = activeTab === 'matches' && !isSavedReady && savedMatches.length === 0;
  const isFollowsLoading = activeTab !== 'matches' && !isProfileReady;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <SavedHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        matchesCount={savedMatches.length}
        teamsCount={followedTeams.length}
        competitionsCount={followedCompetitions.length}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isMatchesLoading || isFollowsLoading ? (
          <SavedSkeleton tab={activeTab} />
        ) : activeTab === 'matches' ? (
          savedMatches.length > 0 ? (
            savedMatches.map(matchup => (
              <View key={matchup.id} style={{ marginBottom: 12 }}>
                <UniversalMatchCard
                  match={matchup}
                  layout="full"
                  isSaved={true}
                  onToggleSave={() => removeSave(matchup.id)}
                  onPress={() => handleMatchDetails(matchup)}
                />
              </View>
            ))
          ) : (
            <SavedEmptyState
              tab="matches"
              onNavigateToDiscover={handleDiscoverNav}
            />
          )
        ) : activeTab === 'teams' ? (
          followedTeams.length > 0 ? (
            followedTeams.map(team => (
              <SavedTeamRow
                key={team.id}
                team={team}
                onPress={handleTeamPress}
                onUnfollowPress={toggleFollowTeam}
              />
            ))
          ) : (
            <SavedEmptyState
              tab="teams"
              onNavigateToDiscover={handleDiscoverNav}
            />
          )
        ) : followedCompetitions.length > 0 ? (
          followedCompetitions.map(league => (
            <SavedCompetitionRow
              key={league.id}
              league={league}
              onPress={handleLeaguePress}
              onUnfollowPress={toggleFollowLeague}
            />
          ))
        ) : (
          <SavedEmptyState
            tab="competitions"
            onNavigateToDiscover={handleDiscoverNav}
          />
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
});
