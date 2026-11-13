import React from 'react';
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

export const UpcomingHighlights: React.FC<UpcomingHighlightsProps> = ({
  matchups,
  onViewAllPress,
  onMatchDetailsPress,
  onWatchPress,
  onReminderToggle,
}) => {
  return (
    <View style={styles.sectionContainer}>
      {/* ── SECTION HEADER ── */}
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

      {/* ── MATCHUP CARDS LIST ── */}
      <View style={styles.cardsList}>
        {matchups.map(matchup => (
          <MatchupCard
            key={matchup.id}
            matchup={matchup}
            onMatchDetailsPress={onMatchDetailsPress}
            onWatchPress={onWatchPress}
            onReminderToggle={onReminderToggle}
          />
        ))}
      </View>
    </View>
  );
};

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
});
