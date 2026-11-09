import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Image,
} from 'react-native';
import {
  Tv,
  Radio,
  Info,
  ChevronDown,
  Check,
  Signal,
} from 'lucide-react-native';
import Colors from '../theme/colors';
import { SecondaryScreenHeader } from '../components/common/SecondaryScreenHeader';
import { LiveBadge } from '../components/common/LiveBadge';
import { CompetitionLogo } from '../components/common/CompetitionLogo';
import { getTeamCrest } from '../utils/teamCrestResolver';
import { DiscoverMatchup } from '../constants/discoverData';
import { getAllLiveStreamMatches } from '../navigation/navHelpers';
import { useAppNavigation } from '../navigation/NavigationContext';

type StreamFilter = 'all' | 'live' | 'upcoming' | 'available';

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

export const AllLiveStreamsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const [selectedFilter, setSelectedFilter] = useState<StreamFilter>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const allStreamMatches = useMemo(() => getAllLiveStreamMatches(), []);

  const filteredMatches = useMemo(() => {
    switch (selectedFilter) {
      case 'live':
        return allStreamMatches.filter(m => m.status === 'LIVE');
      case 'upcoming':
        return allStreamMatches.filter(m => m.status === 'UPCOMING');
      case 'available':
        return allStreamMatches.filter(m => m.hasLiveBroadcast);
      case 'all':
      default:
        // Prioritize LIVE matches first, then upcoming
        return [...allStreamMatches].sort((a, b) => {
          if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
          if (a.status !== 'LIVE' && b.status === 'LIVE') return 1;
          return 0;
        });
    }
  }, [allStreamMatches, selectedFilter]);

  const liveCount = allStreamMatches.filter(m => m.status === 'LIVE').length;

  return (
    <View style={styles.root}>
      {/* ── TOP APP BAR WITH INTEGRATED DROPDOWN FILTER ── */}
      <SecondaryScreenHeader
        title="Live Streams"
        subtitle={`${liveCount} Matches Currently Live`}
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
            <ChevronDown size={14} color="#FFFFFF" strokeWidth={2.4} style={{ marginLeft: 4 }} />
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
                        <Check size={16} color="#7952FC" strokeWidth={2.8} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ── MAIN VERTICAL MATCH LIST (STARTS DIRECTLY UNDER CURVED HEADER) ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredMatches.length > 0 ? (
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
                {/* TOP HEADER ROW: Competition + Live / Kickoff Badge */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.compInfoLeft}>
                    <CompetitionLogo
                      uri={matchup.competitionLogo}
                      size={24}
                      containerStyle={{ marginRight: 8 }}
                    />
                    <Text style={styles.compName} numberOfLines={1}>
                      {matchup.competition}
                    </Text>
                  </View>

                  {isLive ? (
                    <LiveBadge variant="solid" minute={matchup.minute} />
                  ) : (
                    <View style={styles.upcomingBadgePill}>
                      <Text style={styles.upcomingBadgeText}>
                        {matchup.kickoffDate} • {matchup.kickoffTime.replace(' GMT', '')}
                      </Text>
                    </View>
                  )}
                </View>

                {/* CENTER ROW: Teams and Scores */}
                <View style={styles.scoreRow}>
                  {/* Home Team */}
                  <View style={styles.teamSide}>
                    <View style={styles.crestCircle}>
                      <Image
                        source={{ uri: getTeamCrest(matchup.homeTeam.name || matchup.homeTeam.id) }}
                        style={styles.teamCrest}
                      />
                    </View>
                    <Text style={styles.teamName} numberOfLines={1}>
                      {matchup.homeTeam.name}
                    </Text>
                  </View>

                  {/* Center Score / VS */}
                  <View style={styles.centerScoreBox}>
                    {isLive || matchup.status === 'FT' ? (
                      <View style={styles.scoreDigitsRow}>
                        <Text style={styles.scoreNumber}>{matchup.homeTeam.score ?? 0}</Text>
                        <Text style={styles.scoreDash}>-</Text>
                        <Text style={styles.scoreNumber}>{matchup.awayTeam.score ?? 0}</Text>
                      </View>
                    ) : (
                      <View style={styles.vsBadge}>
                        <Text style={styles.vsText}>VS</Text>
                      </View>
                    )}
                    <Text style={styles.venueLabel} numberOfLines={1}>
                      {matchup.venue}
                    </Text>
                  </View>

                  {/* Away Team */}
                  <View style={styles.teamSide}>
                    <View style={styles.crestCircle}>
                      <Image
                        source={{ uri: getTeamCrest(matchup.awayTeam.name || matchup.awayTeam.id) }}
                        style={styles.teamCrest}
                      />
                    </View>
                    <Text style={styles.teamName} numberOfLines={1}>
                      {matchup.awayTeam.name}
                    </Text>
                  </View>
                </View>

                {/* FOOTER ROW: Stream Quality Indicator + Actions */}
                <View style={styles.cardFooter}>
                  <View style={styles.broadcastMeta}>
                    <Radio size={13} color="#22C55E" strokeWidth={2.4} />
                    <Text style={styles.broadcastMetaText}>
                      {isLive ? 'Full HD 1080p • Satellite Feed' : 'Broadcast Feed Authorized'}
                    </Text>
                  </View>

                  <View style={styles.actionButtonsCluster}>
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
                    >
                      <Info size={14} color="#A098B5" strokeWidth={2.2} />
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
                    >
                      <Tv size={14} color="#FFFFFF" strokeWidth={2.4} />
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
              <Tv size={36} color="#7952FC" strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>No Streams Found</Text>
            <Text style={styles.emptySubtitle}>
              There are no matches matching this filter right now. Check back shortly for kickoff feeds!
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
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  headerLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  headerDropdownText: {
    fontSize: 12.5,
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
    width: 220,
    backgroundColor: '#1E1730',
    borderRadius: 18,
    padding: 12,
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
    paddingVertical: 6,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#281E40',
  },
  dropdownCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
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
    marginRight: 7,
  },
  dropdownItemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A098B5',
  },
  dropdownItemLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 28,
    gap: 12,
  },
  matchCard: {
    backgroundColor: '#1E1730',
    borderRadius: 18,
    padding: 16,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#261C3D',
  },
  compInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  compName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  upcomingBadgePill: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  upcomingBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#F8BE38',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  teamSide: {
    flex: 1,
    alignItems: 'center',
  },
  crestCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#181524',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  teamCrest: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  teamName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  centerScoreBox: {
    width: 100,
    alignItems: 'center',
  },
  scoreDigitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scoreDash: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7952FC',
    marginHorizontal: 6,
  },
  vsBadge: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  vsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7952FC',
  },
  venueLabel: {
    fontSize: 10.5,
    color: '#A098B5',
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#261C3D',
  },
  broadcastMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  broadcastMetaText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#A098B5',
  },
  actionButtonsCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#2A2045',
  },
  detailsBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#A098B5',
  },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#7952FC',
  },
  watchBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1E1730',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#A098B5',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default AllLiveStreamsScreen;
