import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Colors from '../theme/colors';
import { Header } from '../components/common/Header';
import { CompetitionCategories } from '../features/home/CompetitionCategories';
import { LiveStreamsSection } from '../features/home/LiveStreamsSection';
import { LiveMatch } from '../constants/mockData';

import { useAppNavigation } from '../navigation/NavigationContext';
import { navigateToMatch } from '../navigation/navHelpers';
import { useMatchOfTheDay } from '../hooks/useMatchOfTheDay';
import { MatchOfTheDayTicker } from '../features/home/MatchOfTheDayTicker';
import { FilterBottomSheet } from '../features/home/FilterBottomSheet';
import { QuickAccessLauncher } from '../features/home/QuickAccessLauncher';
import { streamingApiService } from '../services/streamingApiService';
import { startupPreloader } from '../services/startupPreloader';
import { sortMatchesWithLiveFirst } from '../utils/matchStatus';
import { getCanonicalSport } from '../utils/sportClassifier';

export const HomeScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Live match state with real API wiring (zero mock data)
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>(() => streamingApiService.getCachedLiveMatches());
  const [isLoading, setIsLoading] = useState(() => streamingApiService.getCachedLiveMatches().length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadRealMatches = useCallback(async () => {
    try {
      const real = await streamingApiService.getLiveMatches();
      if (real && real.length > 0) {
        setLiveMatches(real);
        startupPreloader.preloadMatches(real);
      }
    } catch {
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
    await Promise.all([loadRealMatches(), refreshMotd()]);
    setIsRefreshing(false);
  };

  // Modal bottom sheet states
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false);
  const [isQuickAccessVisible, setIsQuickAccessVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [competitionFilter, setCompetitionFilter] = useState('all');

  // Filter live matches based on search query, category, and bottom sheet filter
  const filteredMatches = useMemo(() => {
    const filtered = liveMatches.filter(match => {
      if (!match || !match.homeTeam || !match.awayTeam) return false;
      const hClean = match.homeTeam.trim().toLowerCase();
      const aClean = match.awayTeam.trim().toLowerCase();
      if (!hClean || !aClean || hClean === aClean) return false;

      const canonical = getCanonicalSport(match.sport, match.competition);
      const compLower = (match.competition || '').toLowerCase();
      if (/\b(f1|formula\s*1|motogp|nascar|indycar|motorsport)\b/i.test(`${match.sport || ''} ${compLower} ${match.title || ''}`)) {
        return false;
      }

      // Search query filtering
      const matchesSearch =
        !searchQuery.trim() ||
        match.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.competition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.awayTeam.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filtering (from rectangular tiles)
      let matchesCategory = true;
      const cat = selectedCategoryId || (competitionFilter !== 'all' ? competitionFilter : null);
      if (cat) {
        if (cat === 'football') {
          matchesCategory = canonical === 'soccer';
        } else if (cat === 'nba' || cat === 'basketball') {
          matchesCategory = canonical === 'basketball';
        } else if (cat === 'nhl' || cat === 'hockey') {
          matchesCategory = canonical === 'hockey';
        } else if (cat === 'nfl' || cat === 'american_football') {
          matchesCategory = canonical === 'american_football';
        } else if (cat === 'pl') {
          matchesCategory =
            (compLower === 'premier league' ||
              compLower === 'english premier league' ||
              compLower === 'epl' ||
              compLower === 'eng.1') &&
            !/ugand|egypt|keny|ukrain|turk|russ|scot|israel|azerbaij|saudi|south africa|ghana|nigeri|rwanda|tanzan|ethiop|malawi|zamb|zimbab|singap|malays|hong kong|thailand|taiwan|canada|armen|kazakh|belarus|bosni|bulgar|crimea|malta|northern ireland|wales/i.test(
              compLower
            );
        } else if (cat === 'ucl') {
          matchesCategory = compLower.includes('uefa champions') || compLower === 'champions league' || compLower === 'ucl';
        } else if (cat === 'laliga') {
          matchesCategory = compLower.includes('laliga') || compLower.includes('la liga');
        } else if (cat === 'seriea') {
          matchesCategory = compLower.includes('serie a') && !compLower.includes('brasileir');
        } else if (cat === 'bundesliga') {
          matchesCategory = compLower.includes('bundesliga');
        } else if (cat === 'j1' || cat === 'j1_league') {
          matchesCategory = compLower.includes('j1') || compLower.includes('j.league');
        } else if (cat === 'saudi_pro') {
          matchesCategory = (compLower.includes('saudi pro') || compLower.includes('roshn')) && !compLower.includes('first') && !compLower.includes('yelo');
        } else if (cat === 'saudi_first' || cat === 'saudi_first_division') {
          matchesCategory = compLower.includes('first division') || compLower.includes('yelo') || compLower.includes('saudi 1st');
        } else if (cat === 'fifa_u17') {
          matchesCategory = compLower.includes('u-17') || compLower.includes('u17') || compLower.includes('under-17');
        } else if (cat === 'csl') {
          matchesCategory = compLower.includes('chinese super') || compLower.includes('csl');
        } else if (cat === 'egyptian_premier') {
          matchesCategory = compLower.includes('egyptian') || compLower.includes('egypt premier');
        } else if (cat === 'ugandan_premier') {
          matchesCategory = compLower.includes('ugand') || compLower === 'uga.1';
        } else if (cat === 'isl') {
          matchesCategory = compLower.includes('indian super') || compLower.includes('isl');
        } else if (cat === 'kenyan_premier') {
          matchesCategory = compLower.includes('kenyan premier') || compLower.includes('fkf') || compLower.includes('kenya premier');
        }
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

    return sortMatchesWithLiveFirst(filtered);
  }, [liveMatches, searchQuery, selectedCategoryId, competitionFilter, statusFilter]);

  const handleMatchPress = useCallback((match: LiveMatch) => {
    navigateToMatch(navigate, match);
  }, [navigate]);

  const handleViewAllLiveStreams = useCallback(() => {
    navigate({
      name: 'AllLiveStreams',
      params: { initialSport: selectedCategoryId || 'all' },
    });
  }, [navigate, selectedCategoryId]);

  const handleCategorySelect = useCallback(
    (categoryId: string | null) => {
      navigate({
        name: 'AllLiveStreams',
        params: { initialSport: categoryId || 'all' },
      });
    },
    [navigate]
  );

  const handleFilterPress = useCallback(() => {
    setIsFilterSheetVisible(true);
  }, []);

  const handleMenuPress = useCallback(() => {
    setIsQuickAccessVisible(true);
  }, []);

  const handleNotificationsPress = useCallback(() => {
    navigate({ name: 'Notifications' });
  }, [navigate]);

  const isFilterApplied = Boolean(
    searchQuery.trim() ||
    selectedCategoryId ||
    statusFilter !== 'all' ||
    competitionFilter !== 'all'
  );
  const displayedMatches = isFilterApplied ? filteredMatches : liveMatches;

  const { motdMatch, refreshMotd } = useMatchOfTheDay(displayedMatches.length > 0 ? displayedMatches : liveMatches);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

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
        {/* 1. Categories Section (Rectangular Branded Tiles) */}
        <CompetitionCategories
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleCategorySelect}
        />

        {/* 2. Live & Upcoming Streams Section */}
        <LiveStreamsSection
          matches={displayedMatches}
          isLoading={isLoading}
          onViewAllPress={handleViewAllLiveStreams}
          onMatchPress={handleMatchPress}
        />

        {/* 3. Match of the Day (Positioned directly below Live & Upcoming Streams) */}
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
    paddingBottom: 20,
  },
});

export default HomeScreen;
