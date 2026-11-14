import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  RefreshControl,
} from 'react-native';
import {
  Tv,
  ChevronDown,
  Check,
  Flame,
  Trophy,
  Activity,
  Shield,
  LucideIcon,
} from 'lucide-react-native';
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
import { UniversalMatchCard } from '../components/common/UniversalMatchCard';
import { DiscoverMatchup } from '../constants/discoverData';
import { useAppNavigation } from '../navigation/NavigationContext';
import { streamingApiService } from '../services/streamingApiService';
import { MatchCardSkeleton } from '../components/common/SkeletonLoader';

type StreamFilter = 'all' | 'live' | 'upcoming' | 'available';
type SportFilter = 'all' | 'football' | 'basketball' | 'hockey';

interface FilterOption {
  id: StreamFilter;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'All Matches' },
  { id: 'live', label: 'Live Now' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'available', label: 'Available Feeds' },
];

const FILTER_SHORT_LABELS: Record<StreamFilter, string> = {
  all: 'All',
  live: 'Live Now',
  upcoming: 'Upcoming',
  available: 'Feeds',
};

interface SportTab {
  id: SportFilter;
  label: string;
  icon: LucideIcon;
}

const SPORT_TABS: SportTab[] = [
  { id: 'all', label: 'All Sports', icon: Flame },
  { id: 'football', label: 'Football', icon: Trophy },
  { id: 'basketball', label: 'Basketball', icon: Activity },
  { id: 'hockey', label: 'Hockey', icon: Shield },
];

export const AllLiveStreamsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();

  const [allStreamMatches, setAllStreamMatches] = useState<DiscoverMatchup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<StreamFilter>('all');
  const [selectedSport, setSelectedSport] = useState<SportFilter>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const loadMatches = useCallback(async () => {
    try {
      const live = await streamingApiService.getLiveMatches();
      if (live && live.length > 0) {
        const converted = live.map(m => streamingApiService.convertLiveMatchToMatchup(m));
        setAllStreamMatches(converted);
      }
    } catch {
      // Keep existing matches on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
    const interval = setInterval(loadMatches, 45000);
    return () => clearInterval(interval);
  }, [loadMatches]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadMatches();
    setIsRefreshing(false);
  };

  const filteredMatches = useMemo(() => {
    return allStreamMatches.filter(m => {
      // Sport filter
      if (selectedSport === 'football') {
        const c = m.competition.toLowerCase();
        if (c.includes('basketball') || c.includes('nba') || c.includes('hockey') || c.includes('nhl')) return false;
      } else if (selectedSport === 'basketball') {
        const c = m.competition.toLowerCase();
        if (!c.includes('basketball') && !c.includes('nba')) return false;
      } else if (selectedSport === 'hockey') {
        const c = m.competition.toLowerCase();
        if (!c.includes('hockey') && !c.includes('nhl')) return false;
      }

      // Status filter
      if (selectedFilter === 'live') return m.status === 'LIVE';
      if (selectedFilter === 'upcoming') return m.status === 'UPCOMING';
      if (selectedFilter === 'available') return m.hasLiveBroadcast;
      return true;
    }).sort((a, b) => {
      if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
      if (a.status !== 'LIVE' && b.status === 'LIVE') return 1;
      return 0;
    });
  }, [allStreamMatches, selectedFilter, selectedSport]);

  const liveCount = allStreamMatches.filter(m => m.status === 'LIVE').length;

  return (
    <View style={styles.root}>
      {/* ── TOP APP BAR (CURVED SECONDARY HEADER WITH MATCH COUNT & FILTER DROPDOWN) ── */}
      <SecondaryScreenHeader
        title="LIVE STREAMS"
        subtitle={liveCount > 0 ? `${liveCount} Live Matches` : 'Live & Upcoming Feeds'}
        rightCustomComponent={
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.headerDropdownTrigger}
            onPress={() => setIsDropdownOpen(true)}
            accessibilityLabel="Filter live streams"
          >
            {selectedFilter === 'live' && <View style={styles.headerLiveDot} />}
            <Text style={styles.headerDropdownText} numberOfLines={1}>
              {FILTER_SHORT_LABELS[selectedFilter]}
            </Text>
            <ChevronDown size={13} color="#FFFFFF" strokeWidth={2.4} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        }
      />

      {/* ── DROPDOWN SELECTION MODAL ── */}
      <Modal
        visible={isDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setIsDropdownOpen(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View style={styles.dropdownCard}>
                <Text style={styles.dropdownCardHeader}>Filter Streams</Text>

                {FILTER_OPTIONS.map(opt => {
                  const isSelected = selectedFilter === opt.id;
                  const count =
                    opt.id === 'all'
                      ? allStreamMatches.length
                      : opt.id === 'live'
                      ? liveCount
                      : opt.id === 'upcoming'
                      ? allStreamMatches.filter(m => m.status === 'UPCOMING').length
                      : allStreamMatches.filter(m => m.hasLiveBroadcast).length;

                  return (
                    <TouchableOpacity
                      key={opt.id}
                      activeOpacity={0.75}
                      style={[
                        styles.dropdownCardItem,
                        isSelected && styles.dropdownCardItemActive,
                      ]}
                      onPress={() => {
                        setSelectedFilter(opt.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <View style={styles.itemLeftRow}>
                        {opt.id === 'live' && <View style={styles.menuLiveRedDot} />}
                        <Text
                          style={[
                            styles.dropdownItemLabel,
                            isSelected && styles.dropdownItemLabelActive,
                          ]}
                        >
                          {opt.label} ({count})
                        </Text>
                      </View>
                      {isSelected && (
                        <Check size={15} color="#7952FC" strokeWidth={2.8} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ── SPORT CATEGORY FILTER STRIP (LUCIDE ICONS, COMPACT CHIPS) ── */}
      <View style={styles.sportTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sportTabsScroll}
        >
          {SPORT_TABS.map(tab => {
            const isTabActive = selectedSport === tab.id;
            const Icon = tab.icon;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.75}
                style={[styles.sportTabChip, isTabActive && styles.sportTabChipActive]}
                onPress={() => setSelectedSport(tab.id)}
              >
                <Icon
                  size={13}
                  color={isTabActive ? '#FFFFFF' : '#A098B5'}
                  strokeWidth={isTabActive ? 2.5 : 2}
                />
                <Text style={[styles.sportTabText, isTabActive && styles.sportTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── MAIN RESPONSIVE TWO-COLUMN MATCH-CARD GRID ── */}
      <FlatList
        data={filteredMatches}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#7952FC"
            colors={['#7952FC']}
          />
        }
        renderItem={({ item }) => (
          <UniversalMatchCard
            match={item}
            layout="grid"
            onPress={() => {
              const isLive =
                item.status === 'LIVE' ||
                (item.minute !== undefined && item.minute > 0) ||
                Boolean(item.isLive) ||
                Boolean(item.streamUrl || item.hasLiveBroadcast);

              if (isLive) {
                navigate({
                  name: 'LiveStreamDetails',
                  params: { match: item },
                });
              } else {
                navigate({
                  name: 'MatchDetails',
                  params: { matchup: item },
                });
              }
            }}
          />
        )}
        ListEmptyComponent={
          isLoading && allStreamMatches.length === 0 ? (
            <View style={styles.skeletonGrid}>
              <View style={styles.skeletonCol}>
                <MatchCardSkeleton />
                <MatchCardSkeleton />
              </View>
              <View style={styles.skeletonCol}>
                <MatchCardSkeleton />
                <MatchCardSkeleton />
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Tv size={36} color="#453866" strokeWidth={1.8} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>No Streams Found</Text>
              <Text style={styles.emptySubtitle}>
                No matches currently match the selected sport and status filters. Pull down to refresh or try another category.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E0D14',
  },
  headerDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  headerLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 5,
  },
  headerDropdownText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 16,
  },
  dropdownCard: {
    width: 210,
    backgroundColor: '#1E1730',
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },
  dropdownCardHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A098B5',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#281E40',
  },
  dropdownCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  dropdownCardItemActive: {
    backgroundColor: '#2A2045',
  },
  itemLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLiveRedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  dropdownItemLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#A098B5',
  },
  dropdownItemLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sportTabsContainer: {
    backgroundColor: '#161224',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#241C38',
  },
  sportTabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sportTabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#251D3A',
    gap: 6,
  },
  sportTabChipActive: {
    backgroundColor: '#7952FC',
  },
  sportTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A098B5',
  },
  sportTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  gridRow: {
    paddingHorizontal: 12,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  flatListContent: {
    paddingTop: 10,
    paddingBottom: 110,
  },
  skeletonGrid: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 10,
    paddingTop: 10,
  },
  skeletonCol: {
    flex: 1,
    gap: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ECE9FA',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#8E82A8',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default AllLiveStreamsScreen;
