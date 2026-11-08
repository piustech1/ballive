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
import { PopularLeagues } from '../features/discover/PopularLeagues';
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

export const DiscoverScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // ── FILTER DATA IN REAL TIME ──
  const query = searchQuery.trim().toLowerCase();

  const filteredCompetitions = useMemo(() => {
    if (!query) return EXPLORE_COMPETITIONS;
    return EXPLORE_COMPETITIONS.filter(
      c =>
        c.name.toLowerCase().includes(query) ||
        c.country.toLowerCase().includes(query) ||
        c.shortName.toLowerCase().includes(query)
    );
  }, [query]);

  const filteredLeagues = useMemo(() => {
    if (!query) return POPULAR_LEAGUES;
    return POPULAR_LEAGUES.filter(
      l =>
        l.name.toLowerCase().includes(query) ||
        l.country.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query)
    );
  }, [query]);

  const filteredTeams = useMemo(() => {
    if (!query) return POPULAR_TEAMS;
    return POPULAR_TEAMS.filter(
      t =>
        t.name.toLowerCase().includes(query) ||
        t.country.toLowerCase().includes(query) ||
        t.shortName.toLowerCase().includes(query) ||
        t.domesticTitle.toLowerCase().includes(query)
    );
  }, [query]);

  const filteredMatchups = useMemo(() => {
    if (!query) return UPCOMING_HIGHLIGHTS;
    return UPCOMING_HIGHLIGHTS.filter(
      m =>
        m.competition.toLowerCase().includes(query) ||
        m.homeTeam.name.toLowerCase().includes(query) ||
        m.awayTeam.name.toLowerCase().includes(query) ||
        m.venue.toLowerCase().includes(query)
    );
  }, [query]);

  const totalResults =
    filteredCompetitions.length +
    filteredLeagues.length +
    filteredTeams.length +
    filteredMatchups.length;

  const isSearchActive = query.length > 0;
  const hasNoResults = isSearchActive && totalResults === 0;

  // ── USER INTERACTIONS & HANDLERS ──
  const handleCompetitionPress = (comp: DiscoverCompetition) => {
    Alert.alert(
      comp.name,
      `Country: ${comp.country}\nSeason: ${comp.season}\nParticipating Teams: ${comp.teamsCount}\n\nStandings and official fixtures will be synchronized from the live API.`,
      [{ text: 'Close' }]
    );
  };

  const handleLeaguePress = (league: PopularLeague) => {
    Alert.alert(
      league.name,
      `Region: ${league.country}\nRound: ${league.currentMatchweek}\nOverview: ${league.description}`,
      [{ text: 'View League Table' }, { text: 'Close', style: 'cancel' }]
    );
  };

  const handleTeamPress = (team: PopularTeam) => {
    Alert.alert(
      team.name,
      `Country: ${team.country}\nHome Ground: ${team.stadium}\nHonors: ${team.domesticTitle}`,
      [{ text: 'Team Squad' }, { text: 'Close', style: 'cancel' }]
    );
  };

  const handleMatchDetailsPress = (matchup: DiscoverMatchup) => {
    const scoreInfo =
      matchup.status === 'LIVE' || matchup.status === 'FT'
        ? `\nCurrent Score: ${matchup.homeTeam.name} ${matchup.homeTeam.score} - ${matchup.awayTeam.score} ${matchup.awayTeam.name}`
        : '';

    Alert.alert(
      `${matchup.homeTeam.name} vs ${matchup.awayTeam.name}`,
      `Tournament: ${matchup.competition}\nStatus: ${matchup.status}\nKickoff: ${matchup.kickoffDate} at ${matchup.kickoffTime}\nStadium: ${matchup.venue}${scoreInfo}\nBroadcast: Full HD Satellite Feed`,
      [{ text: 'Close' }]
    );
  };

  const handleWatchPress = (matchup: DiscoverMatchup) => {
    Alert.alert(
      'Live Football Stream',
      `Connecting to authorized high-bitrate live satellite feed for ${matchup.homeTeam.name} vs ${matchup.awayTeam.name}...`,
      [{ text: 'Connect Stream' }]
    );
  };

  const handleReminderToggle = (matchup: DiscoverMatchup, isSet: boolean) => {
    Alert.alert(
      isSet ? 'Kickoff Alert Enabled' : 'Reminder Cancelled',
      isSet
        ? `We will notify you 15 minutes before ${matchup.homeTeam.name} vs ${matchup.awayTeam.name} kicks off on ${matchup.kickoffDate}!`
        : `Kickoff reminder removed for ${matchup.homeTeam.name} vs ${matchup.awayTeam.name}.`,
      [{ text: 'OK' }]
    );
  };

  const handleNotificationsPress = () => {
    Alert.alert(
      'Discover Notifications',
      'You are receiving alerts for major cup draws, breaking team lineups, and fixture schedule releases.',
      [{ text: 'Preferences' }, { text: 'Done' }]
    );
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
                onSeeAllPress={() =>
                  Alert.alert('All Competitions', 'Browsing full directory of 40+ global competitions.')
                }
                onCompetitionPress={handleCompetitionPress}
              />
            )}

            {/* ── C. POPULAR LEAGUES (Vertical Rows) ── */}
            {filteredLeagues.length > 0 && (
              <PopularLeagues
                leagues={filteredLeagues}
                onViewAllPress={() =>
                  Alert.alert('All Leagues', 'Viewing all European and international leagues.')
                }
                onLeaguePress={handleLeaguePress}
              />
            )}

            {/* ── D. POPULAR TEAMS (Horizontally Scrollable) ── */}
            {filteredTeams.length > 0 && (
              <PopularTeams
                teams={filteredTeams}
                onViewAllPress={() =>
                  Alert.alert('All Clubs', 'Browsing all clubs across top flight divisions.')
                }
                onTeamPress={handleTeamPress}
              />
            )}

            {/* ── E. UPCOMING HIGHLIGHTS (Football Matchup Cards) ── */}
            {filteredMatchups.length > 0 && (
              <UpcomingHighlights
                matchups={filteredMatchups}
                onViewAllPress={() =>
                  Alert.alert('Upcoming Highlights', 'Viewing all scheduled marquee matchups.')
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
