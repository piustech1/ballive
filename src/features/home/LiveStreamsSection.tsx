import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Colors from '../../theme/colors';
import { LiveMatch } from '../../constants/mockData';
import { LiveMatchCard } from './LiveMatchCard';

import { MatchCardSkeleton } from '../../components/common/SkeletonLoader';

interface LiveStreamsSectionProps {
  matches: LiveMatch[];
  isLoading?: boolean;
  title?: string;
  onViewAllPress?: () => void;
  onMatchPress?: (match: LiveMatch) => void;
}

export const LiveStreamsSection: React.FC<LiveStreamsSectionProps> = ({
  matches,
  isLoading = false,
  title = 'Live & Upcoming streams',
  onViewAllPress,
  onMatchPress,
}) => {
  return (
    <View style={styles.container}>
      {/* ── SECTION HEADER: Live & Upcoming streams (Left) + View all (Right) ── */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity
          onPress={onViewAllPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      {/* ── HORIZONTAL SCROLLABLE LIVE CARDS ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isLoading && matches.length === 0 ? (
          <>
            <View style={{ width: 280, marginRight: 12 }}>
              <MatchCardSkeleton />
            </View>
            <View style={{ width: 280, marginRight: 12 }}>
              <MatchCardSkeleton />
            </View>
          </>
        ) : (
          matches.map(match => (
            <LiveMatchCard
              key={match.id}
              match={match}
              onPress={() => onMatchPress?.(match)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingLeft: 20,
    paddingRight: 4,
  },
});

export default LiveStreamsSection;
