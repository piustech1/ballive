import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import Colors from '../theme/colors';
import { Header } from '../components/common/Header';
import { CompetitionCategories } from '../features/home/CompetitionCategories';
import { LiveStreamsSection } from '../features/home/LiveStreamsSection';
import { FeaturedCompetitions } from '../features/home/FeaturedCompetitions';
import {
  LIVE_MATCHES,
  FEATURED_COMPETITIONS,
  LiveMatch,
  FeaturedCompetition,
} from '../constants/mockData';

export const HomeScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Filter live matches based on search query and category
  const filteredMatches = useMemo(() => {
    return LIVE_MATCHES.filter(match => {
      // Search query filtering
      const matchesSearch =
        !searchQuery.trim() ||
        match.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.competition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.awayTeam.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filtering
      let matchesCategory = true;
      if (selectedCategoryId === 'pl') {
        matchesCategory = match.competition.toLowerCase().includes('premier');
      } else if (selectedCategoryId === 'ucl') {
        matchesCategory = match.competition.toLowerCase().includes('champions');
      } else if (selectedCategoryId === 'laliga') {
        matchesCategory = match.competition.toLowerCase().includes('laliga');
      } else if (selectedCategoryId === 'seriea') {
        matchesCategory = match.competition.toLowerCase().includes('serie a');
      } else if (selectedCategoryId === 'bundesliga') {
        matchesCategory = match.competition.toLowerCase().includes('bundesliga');
      }

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategoryId]);

  // Filter featured competitions based on search query
  const filteredCompetitions = useMemo(() => {
    return FEATURED_COMPETITIONS.filter(comp => {
      const matchesSearch =
        !searchQuery.trim() ||
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.country.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [searchQuery]);

  const handleMatchPress = (match: LiveMatch) => {
    Alert.alert(
      'Live Stream',
      `Connecting to high-definition live satellite feed for ${match.title}...`,
      [{ text: 'OK' }]
    );
  };

  const handleCompetitionPress = (comp: FeaturedCompetition) => {
    Alert.alert(
      comp.name,
      `Viewing ${comp.name} standings, fixtures and broadcast schedules.`,
      [{ text: 'Close' }]
    );
  };

  const handleFilterPress = () => {
    Alert.alert('Filters', 'Filter matches by live status, broadcast network, or league.', [
      { text: 'Done' },
    ]);
  };

  const handleMenuPress = () => {
    Alert.alert('BALLIVE Menu', 'Version 1.0.0 (Phase 1 Build)\nNative Android Football Streaming App', [
      { text: 'Close' },
    ]);
  };

  const handleNotificationsPress = () => {
    Alert.alert('Match Notifications', 'You will receive kickoff reminders for upcoming live matches.', [
      { text: 'OK' },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.headerPurple} translucent={false} />

      {/* ── SCREEN HEADER (Status Bar + 2x2 Grid + Bell + Branding + Search + Filter) ── */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={handleFilterPress}
        onMenuPress={handleMenuPress}
        onNotificationsPress={handleNotificationsPress}
      />

      {/* ── MAIN VERTICAL SCROLLABLE CONTENT ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. Football Competition Categories (Circular Colored Badges) */}
        <CompetitionCategories
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />

        {/* 2. Live Streams Section (Wide Horizontal Cards) */}
        <LiveStreamsSection
          matches={filteredMatches.length > 0 ? filteredMatches : LIVE_MATCHES}
          onViewAllPress={() => Alert.alert('Live Streams', 'Viewing all live match feeds.')}
          onMatchPress={handleMatchPress}
        />

        {/* 3. Featured Competitions Section (Replacing Popular Creators) */}
        <FeaturedCompetitions
          competitions={
            filteredCompetitions.length > 0 ? filteredCompetitions : FEATURED_COMPETITIONS
          }
          onViewAllPress={() => Alert.alert('Competitions', 'Viewing all major leagues.')}
          onCompetitionPress={handleCompetitionPress}
        />
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
    paddingBottom: 24,
  },
});

export default HomeScreen;
