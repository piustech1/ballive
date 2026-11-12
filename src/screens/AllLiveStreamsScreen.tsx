import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Image,
  RefreshControl,
} from 'react-native';
import {
  Tv,
  Info,
  ChevronDown,
  Check,
  Signal,
  Flame,
  Trophy,
  Activity,
  Shield,
  LucideIcon,
} from 'lucide-react-native';
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
import { CompetitionLogo } from '../components/common/CompetitionLogo';
import { getTeamCrest, DEFAULT_CREST } from '../utils/teamCrestResolver';
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

/**
 * Resilient team crest component with automatic neutral shield fallback.
 * Prevents any accidental assignment of Arsenal or club crests to unrelated teams.
 */
const TeamCrestImage: React.FC<{
  uri?: string | null;
  teamName?: string;
  size?: number;
}> = ({ uri, teamName, size = 24 }) => {
  const [hasError, setHasError] = useState(false);
  const resolvedUri = useMemo(() => {
    if (uri && typeof uri === 'string' && uri.trim().length > 10 && !uri.includes('null')) {
      return uri.trim();
    }
    return getTeamCrest(teamName);
  }, [uri, teamName]);

  const [currentUri, setCurrentUri] = useState<string>(resolvedUri);

  useEffect(() => {
    setCurrentUri(resolvedUri);
    setHasError(false);
  }, [resolvedUri]);

  return (
    <Image
      source={{ uri: hasError ? DEFAULT_CREST : currentUri }}
      style={{ width: size, height: size, resizeMode: 'contain' }}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setCurrentUri(DEFAULT_CREST);
        }
      }}
    />
  );
};

export const AllLiveStreamsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const [selectedFilter, setSelectedFilter] = useState<StreamFilter>('all');
  const [selectedSport, setSelectedSport] = useState<SportFilter>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [allStreamMatches, setAllStreamMatches] = useState<DiscoverMatchup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

      {/* ── MAIN VERTICAL MATCH LIST ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#7952FC"
            colors={['#7952FC']}
          />
        }
      >
        {isLoading && allStreamMatches.length === 0 ? (
          <>
            <MatchCardSkeleton />
            <MatchCardSkeleton />
            <MatchCardSkeleton />
          </>
        ) : filteredMatches.length > 0 ? (
          filteredMatches.map(matchup => {
            const isLive = matchup.status === 'LIVE';

            return (
              <TouchableOpacity
                key={matchup.id}
                activeOpacity={0.9}
                style={styles.matchCard}
                onPress={() => {
                  navigate({
                    name: 'LiveStreamDetails',
                    params: { match: matchup },
                  });
                }}
              >
                {/* 1. TOP HEADER ROW: Competition Logo & Name + Compact Solid LIVE Minute Pill */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.compInfoLeft}>
                    {Boolean(matchup.competitionLogo) && (
                      <CompetitionLogo
                        uri={matchup.competitionLogo}
                        size={17}
                        containerStyle={{ marginRight: 6 }}
                      />
                    )}
                    <Text style={styles.compName} numberOfLines={1}>
                      {matchup.competition}
                    </Text>
                  </View>

                  {isLive ? (
                    <View style={styles.liveMinuteBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveMinuteText}>{matchup.minute}' LIVE</Text>
                    </View>
                  ) : matchup.status === 'FT' ? (
                    <View style={styles.ftBadge}>
                      <Text style={styles.ftBadgeText}>FT</Text>
                    </View>
                  ) : (
                    <View style={styles.upcomingBadge}>
                      <Text style={styles.upcomingBadgeText}>
                        {matchup.kickoffDate} • {matchup.kickoffTime.replace(' GMT', '')}
                      </Text>
                    </View>
                  )}
                </View>

                {/* 2. MATCH CENTRE: Symmetrical 3-Part Layout (HOME TEAM | SCORE | AWAY TEAM) */}
                <View style={styles.matchCentre}>
                  {/* Home Team */}
                  <View style={styles.teamHome}>
                    <View style={styles.crestCircle}>
                      <TeamCrestImage
                        uri={matchup.homeTeam.crestUrl}
                        teamName={matchup.homeTeam.name || matchup.homeTeam.id}
                        size={22}
                      />
                    </View>
                    <Text style={styles.teamNameLeft} numberOfLines={1}>
                      {matchup.homeTeam.name}
                    </Text>
                  </View>

                  {/* Center Score / VS */}
                  <View style={styles.scoreCenter}>
                    {isLive || matchup.status === 'FT' ? (
                      <View style={styles.scoreRow}>
                        <Text style={styles.scoreDigit}>{matchup.homeTeam.score ?? 0}</Text>
                        <Text style={styles.scoreColon}>:</Text>
                        <Text style={styles.scoreDigit}>{matchup.awayTeam.score ?? 0}</Text>
                      </View>
                    ) : (
                      <View style={styles.vsPill}>
                        <Text style={styles.vsText}>VS</Text>
                      </View>
                    )}
                    <Text style={styles.venueSubtext} numberOfLines={1}>
                      {isLive ? `${matchup.minute}' In-Play` : matchup.venue || 'Live Stadium'}
                    </Text>
                  </View>

                  {/* Away Team */}
                  <View style={styles.teamAway}>
                    <Text style={styles.teamNameRight} numberOfLines={1}>
                      {matchup.awayTeam.name}
                    </Text>
                    <View style={styles.crestCircle}>
                      <TeamCrestImage
                        uri={matchup.awayTeam.crestUrl}
                        teamName={matchup.awayTeam.name || matchup.awayTeam.id}
                        size={22}
                      />
                    </View>
                  </View>
                </View>

                {/* 3. CARD FOOTER: Stream Metadata + Secondary Details + Primary Watch Live */}
                <View style={styles.cardFooter}>
                  <View style={styles.streamMetaRow}>
                    <Signal size={12} color="#22C55E" strokeWidth={2.4} />
                    <Text style={styles.streamMetaText} numberOfLines={1}>
                      {isLive ? 'HD 1080p • Satellite Feed' : 'Broadcast Feed Scheduled'}
                    </Text>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.detailsBtn}
                      onPress={e => {
                        e.stopPropagation();
                        navigate({
                          name: 'MatchDetails',
                          params: { matchup },
                        });
                      }}
                      accessibilityLabel={`Details for ${matchup.homeTeam.name} vs ${matchup.awayTeam.name}`}
                    >
                      <Info size={12} color="#A098B5" strokeWidth={2.2} />
                      <Text style={styles.detailsBtnText}>Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.watchBtn}
                      onPress={e => {
                        e.stopPropagation();
                        navigate({
                          name: 'LiveStreamDetails',
                          params: { match: matchup },
                        });
                      }}
                      accessibilityLabel={`Watch live stream of ${matchup.homeTeam.name} vs ${matchup.awayTeam.name}`}
                    >
                      <Tv size={12} color="#FFFFFF" strokeWidth={2.4} />
                      <Text style={styles.watchBtnText}>
                        {isLive ? 'Watch Live' : 'Stream Feed'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyCircle}>
              <Tv size={32} color="#7952FC" strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>No Streams Found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'live'
                ? 'There are currently no live matches in this category. Check back shortly for kickoff!'
                : 'No match feeds matching this filter. Switch categories or pull down to refresh.'}
            </Text>
          </View>
        )}
      </ScrollView>
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
    backgroundColor: '#2A2045',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 16,
  },
  headerLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  headerDropdownText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 4, 10, 0.65)',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 100, // Clearance for anchored bottom navigation
    gap: 10,
  },
  matchCard: {
    backgroundColor: '#1E1730',
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  compInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  compName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E75FF',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  liveMinuteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  liveMinuteText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  ftBadge: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  ftBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A098B5',
  },
  upcomingBadge: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  upcomingBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F8BE38',
  },
  matchCentre: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  teamHome: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamAway: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  crestCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#181524',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  teamNameLeft: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  teamNameRight: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'right',
    flex: 1,
  },
  scoreCenter: {
    width: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreDigit: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    minWidth: 16,
    textAlign: 'center',
  },
  scoreColon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7952FC',
    marginHorizontal: 3,
  },
  vsPill: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vsText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7952FC',
  },
  venueSubtext: {
    fontSize: 9.5,
    fontWeight: '500',
    color: '#A098B5',
    marginTop: 2,
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#261C3D',
  },
  streamMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    marginRight: 8,
  },
  streamMetaText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#A098B5',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: '#2A2045',
    gap: 4,
  },
  detailsBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A098B5',
  },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    paddingHorizontal: 11,
    borderRadius: 8,
    backgroundColor: '#7952FC',
    gap: 4,
  },
  watchBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E1730',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#A098B5',
    textAlign: 'center',
    lineHeight: 17,
  },
});

export default AllLiveStreamsScreen;
