import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import Colors from '../theme/colors';
import { useProfile } from '../hooks/useProfile';
import { SavedHeader, SavedTab } from '../features/saved/SavedHeader';
import { SavedMatchCard } from '../features/saved/SavedMatchCard';
import { SavedTeamRow } from '../features/saved/SavedTeamRow';
import { SavedCompetitionRow } from '../features/saved/SavedCompetitionRow';
import { SavedEmptyState } from '../features/saved/SavedEmptyState';
import {
  UPCOMING_HIGHLIGHTS,
  POPULAR_TEAMS,
  POPULAR_LEAGUES,
  DiscoverMatchup,
  PopularTeam,
  PopularLeague,
} from '../constants/discoverData';

import { useAppNavigation } from '../navigation/NavigationContext';

interface SavedScreenProps {
  onNavigateToDiscover?: () => void;
}

export const SavedScreen: React.FC<SavedScreenProps> = ({ onNavigateToDiscover }) => {
  const { navigate, switchTab } = useAppNavigation();
  const {
    profile,
    toggleSaveMatch,
    toggleFollowTeam,
    toggleFollowLeague,
  } = useProfile();

  const [activeTab, setActiveTab] = useState<SavedTab>('matches');

  // ── FILTER SAVED DATA ACCORDING TO USER STATE ──
  const savedMatches = useMemo(() => {
    const ids = profile.savedMatchIds || [];
    return UPCOMING_HIGHLIGHTS.filter(m => ids.includes(m.id));
  }, [profile.savedMatchIds]);

  const followedTeams = useMemo(() => {
    const ids = profile.followedTeamIds || [];
    return POPULAR_TEAMS.filter(t => ids.includes(t.id));
  }, [profile.followedTeamIds]);

  const followedCompetitions = useMemo(() => {
    const ids = profile.followedLeagueIds || [];
    return POPULAR_LEAGUES.filter(l => ids.includes(l.id));
  }, [profile.followedLeagueIds]);

  // ── INTERACTION HANDLERS ──
  const handleMatchDetails = (matchup: DiscoverMatchup) => {
    navigate({
      name: 'MatchDetails',
      params: { matchup },
    });
  };

  const handleWatchPress = (matchup: DiscoverMatchup) => {
    const isLive =
      matchup.status === 'LIVE' ||
      (matchup.minute !== undefined && matchup.minute > 0) ||
      Boolean(matchup.isLive) ||
      Boolean(matchup.streamUrl || matchup.hasLiveBroadcast);

    if (isLive) {
      navigate({
        name: 'LiveStreamDetails',
        params: { match: matchup },
      });
    } else {
      navigate({
        name: 'MatchDetails',
        params: { matchup },
      });
    }
  };

  const handleTeamPress = (team: PopularTeam) => {
    navigate({
      name: 'TeamDetails',
      params: { team },
    });
  };

  const handleLeaguePress = (league: PopularLeague) => {
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
      <StatusBar barStyle="light-content" backgroundColor={Colors.headerPurple} translucent={false} />

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
                <SavedMatchCard
                  key={matchup.id}
                  matchup={matchup}
                  onMatchDetailsPress={handleMatchDetails}
                  onWatchPress={handleWatchPress}
                  onRemovePress={toggleSaveMatch}
                />
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
