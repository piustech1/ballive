import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import Colors from '../theme/colors';
import { useProfile } from '../hooks/useProfile';
import { useSavedMatches } from '../hooks/useSavedMatches';
import { SavedHeader, SavedTab } from '../features/saved/SavedHeader';
import { UniversalMatchCard } from '../components/common/UniversalMatchCard';
import { SavedTeamRow } from '../features/saved/SavedTeamRow';
import { SavedCompetitionRow } from '../features/saved/SavedCompetitionRow';
import { SavedEmptyState } from '../features/saved/SavedEmptyState';
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
    toggleFollowTeam,
    toggleFollowLeague,
  } = useProfile();
  const { savedMatches, removeSave, refreshSaved } = useSavedMatches();

  const [activeTab, setActiveTab] = useState<SavedTab>('matches');

  // Purge finished matches on mount/display
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
      const team = profile.followedTeamsMeta?.[nid] || profile.followedTeamsMeta?.[rawId] || findTeamById(rawId);
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
      const comp = profile.followedLeaguesMeta?.[nid] || profile.followedLeaguesMeta?.[rawId] || findCompetitionById(rawId);
      if (comp) list.push(comp);
    });
    return list;
  }, [profile.followedLeagueIds, profile.followedLeaguesMeta]);

  // ── INTERACTION HANDLERS ──
  const handleMatchDetails = (matchup: DiscoverMatchup) => {
    navigateToMatch(navigate, matchup);
  };

  const handleTeamPress = (team: PopularTeam) => {
    navigate({
      name: 'TeamDetails',
      params: { team },
    });
  };

  const handleLeaguePress = (league: DiscoverCompetition | PopularLeague) => {
    navigate({
      name: 'CompetitionDetails',
      params: { competition: league },
    });
  };

  const handleDiscoverNav = () => {
    if (onNavigateToDiscover) {
      onNavigateToDiscover();
    } else {
      switchTab('Discover');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* ── HEADER WITH SEGMENTED TABS ── */}
      <SavedHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        matchesCount={savedMatches.length}
        teamsCount={followedTeams.length}
        competitionsCount={followedCompetitions.length}
      />

      {/* ── MAIN SCROLLER ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TAB 1: MATCHES */}
        {activeTab === 'matches' && (
          <>
            {savedMatches.length > 0 ? (
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
            )}
          </>
        )}

        {/* TAB 2: TEAMS */}
        {activeTab === 'teams' && (
          <>
            {followedTeams.length > 0 ? (
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
            )}
          </>
        )}

        {/* TAB 3: COMPETITIONS */}
        {activeTab === 'competitions' && (
          <>
            {followedCompetitions.length > 0 ? (
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
});
