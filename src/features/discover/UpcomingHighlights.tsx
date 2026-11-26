import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../../theme/colors';
import { DiscoverMatchup } from '../../constants/discoverData';
import { MatchupCard } from './MatchupCard';

interface UpcomingHighlightsProps {
  matchups: DiscoverMatchup[];
  onViewAllPress?: () => void;
  onMatchDetailsPress: (matchup: DiscoverMatchup) => void;
  onWatchPress?: (matchup: DiscoverMatchup) => void;
  onReminderToggle?: (matchup: DiscoverMatchup, isSet: boolean) => void;
}

const INITIAL_RENDER_CAP = 8;

export const UpcomingHighlights: React.FC<UpcomingHighlightsProps> = React.memo(({
  matchups,
  onViewAllPress,
  onMatchDetailsPress,
  onWatchPress,
  onReminderToggle,
}) => {
  const [showAll, setShowAll] = useState(false);

  const visibleMatchups = useMemo(
    () => (showAll ? matchups : matchups.slice(0, INITIAL_RENDER_CAP)),
    [matchups, showAll]
  );

  const hasMore = !showAll && matchups.length > INITIAL_RENDER_CAP;

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming highlights</Text>
        <TouchableOpacity
          onPress={onViewAllPress}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsList}>
        {visibleMatchups.map(matchup => (
          <MatchupCard
            key={matchup.id}
            matchup={matchup}
            onMatchDetailsPress={onMatchDetailsPress}
            onWatchPress={onWatchPress}
            onReminderToggle={onReminderToggle}
          />
        ))}
      </View>

      {hasMore && (
        <TouchableOpacity
          style={styles.showMoreBtn}
          activeOpacity={0.8}
          onPress={() => setShowAll(true)}
        >
          <Text style={styles.showMoreText}>
            Show all {matchups.length} highlights
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 26,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.categoryPremierLeague,
    fontWeight: '600',
  },
  cardsList: {
    gap: 12,
  },
  showMoreBtn: {
    marginTop: 14,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: '#1B162D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  showMoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A58BFC',
  },
});
