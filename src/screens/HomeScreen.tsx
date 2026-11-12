import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
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

import { useAppNavigation } from '../navigation/NavigationContext';
import { resolveLiveMatchToMatchup, findCompetitionById, getMarqueeMatchOfTheDay } from '../navigation/navHelpers';
import { MatchOfTheDayTicker } from '../features/home/MatchOfTheDayTicker';
import { FilterBottomSheet } from '../features/home/FilterBottomSheet';
import { QuickAccessLauncher } from '../features/home/QuickAccessLauncher';
import { streamingApiService } from '../services/streamingApiService';

export const HomeScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Live match state with real API wiring (zero mock data)
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadRealMatches = useCallback(async () => {
    try {
      const real = await streamingApiService.getLiveMatches();
      if (real && real.length > 0) {
        setLiveMatches(real);
      }
    } catch (e) {
      // Keep existing matches on network error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRealMatches();
    const timer = setInterval(loadRealMatches, 45000);
    return () => clearInterval(timer);
  }, [loadRealMatches]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRealMatches();
    setIsRefreshing(false);
  };

  // Modal bottom sheet states
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false);
  const [isQuickAccessVisible, setIsQuickAccessVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [competitionFilter, setCompetitionFilter] = useState('all');

  // Filter live matches based on search query, category, and bottom sheet filter
  const filteredMatches = useMemo(() => {
    return liveMatches.filter(match => {
      // Search query filtering
      const matchesSearch =
        !searchQuery.trim() ||
        match.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.competition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.awayTeam.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filtering (from circular pills)
      let matchesCategory = true;
      const cat = selectedCategoryId || (competitionFilter !== 'all' ? competitionFilter : null);
      if (cat === 'football') {
        matchesCategory = match.sport === 'soccer' || !match.sport || match.competition.toLowerCase().includes('league') || match.competition.toLowerCase().includes('fc');
      } else if (cat === 'nba' || cat === 'basketball') {
        matchesCategory = match.sport === 'basketball' || match.competition.toLowerCase().includes('nba') || match.competition.toLowerCase().includes('basketball');
      } else if (cat === 'nhl' || cat === 'hockey') {
        matchesCategory = match.sport === 'hockey' || match.competition.toLowerCase().includes('nhl') || match.competition.toLowerCase().includes('hockey');
      } else if (cat === 'mma' || cat === 'ufc') {
        matchesCategory = match.sport === 'mma' || match.competition.toLowerCase().includes('ufc') || match.competition.toLowerCase().includes('mma') || match.competition.toLowerCase().includes('wwe') || match.competition.toLowerCase().includes('fighting');
      } else if (cat === 'nfl' || cat === 'american_football') {
        matchesCategory = match.sport === 'american_football' || match.competition.toLowerCase().includes('nfl');
      } else if (cat === 'motorsport' || cat === 'f1') {
        matchesCategory = match.sport === 'motorsport' || match.competition.toLowerCase().includes('f1') || match.competition.toLowerCase().includes('formula') || match.competition.toLowerCase().includes('grand prix');
      } else if (cat === 'tennis') {
        matchesCategory = match.sport === 'tennis' || match.competition.toLowerCase().includes('tennis') || match.competition.toLowerCase().includes('atp') || match.competition.toLowerCase().includes('wta');
      } else if (cat === 'pl') {
        matchesCategory = match.competition.toLowerCase().includes('premier');
      } else if (cat === 'ucl') {
        matchesCategory = match.competition.toLowerCase().includes('champions');
      } else if (cat === 'laliga') {
        matchesCategory = match.competition.toLowerCase().includes('laliga');
      } else if (cat === 'seriea') {
        matchesCategory = match.competition.toLowerCase().includes('serie a');
      } else if (cat === 'bundesliga') {
        matchesCategory = match.competition.toLowerCase().includes('bundesliga');
      }

      // Status filtering (from bottom sheet)
      let matchesStatus = true;
      if (statusFilter === 'live') {
        matchesStatus = match.status === 'LIVE' || (match.minute > 0 && match.minute < 90);
      } else if (statusFilter === 'upcoming') {
        matchesStatus = match.status === 'UPCOMING' || match.minute === 0;
      } else if (statusFilter === 'completed') {
        matchesStatus = match.status === 'FT' || match.minute >= 90;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [liveMatches, searchQuery, selectedCategoryId, competitionFilter, statusFilter]);

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
    navigate({
      name: 'LiveStreamDetails',
      params: { match: resolveLiveMatchToMatchup(match) },
    });
  };

  const handleCompetitionPress = (comp: FeaturedCompetition) => {
    navigate({
      name: 'CompetitionDetails',
      params: { competition: findCompetitionById(comp.id) },
    });
  };

  const handleFilterPress = () => {
    setIsFilterSheetVisible(true);
  };

  const handleMenuPress = () => {
    setIsQuickAccessVisible(true);
  };

  const handleNotificationsPress = () => {
    navigate({ name: 'Notifications' });
  };

  const motdMatch = useMemo(() => getMarqueeMatchOfTheDay(liveMatches), [liveMatches]);

  const isFilterApplied = Boolean(
    searchQuery.trim() ||
    selectedCategoryId ||
    statusFilter !== 'all' ||
    competitionFilter !== 'all'
  );
  const displayedMatches = isFilterApplied ? filteredMatches : liveMatches;

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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#7952FC"
            colors={['#7952FC']}
          />
        }
      >
        {/* 1. Football Competition Categories (Circular Colored Badges) */}
        <CompetitionCategories
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />

        {/* 2. Live Streams Section (Wide Horizontal Cards) */}
        <LiveStreamsSection
          matches={displayedMatches}
          isLoading={isLoading}
          onViewAllPress={() => {
            navigate({ name: 'AllLiveStreams' });
          }}
          onMatchPress={handleMatchPress}
        />

        {/* 3. Featured Competitions Section */}
        <FeaturedCompetitions
          competitions={
            filteredCompetitions.length > 0 ? filteredCompetitions : FEATURED_COMPETITIONS
          }
          onViewAllPress={() => {
            navigate({ name: 'AllCompetitions' });
          }}
          onCompetitionPress={handleCompetitionPress}
        />

        {/* 4. Match of the Day Countdown Ticker (Compact 52dp height, directly beneath Featured Competitions) */}
        <MatchOfTheDayTicker match={motdMatch} />
      </ScrollView>

      {/* ── NATIVE MODAL BOTTOM SHEETS ── */}
      <FilterBottomSheet
        visible={isFilterSheetVisible}
        onClose={() => setIsFilterSheetVisible(false)}
        selectedStatus={statusFilter}
        selectedCompetition={competitionFilter}
        onApply={(status, comp) => {
          setStatusFilter(status);
          setCompetitionFilter(comp);
        }}
      />

      <QuickAccessLauncher
        visible={isQuickAccessVisible}
        onClose={() => setIsQuickAccessVisible(false)}
      />
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
    paddingBottom: 96,
  },
});

export default HomeScreen;
