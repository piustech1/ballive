import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Colors from '../../theme/colors';
import { FeaturedCompetition } from '../../constants/mockData';
import { FeaturedCompetitionCard } from './FeaturedCompetitionCard';

interface FeaturedCompetitionsProps {
  competitions: FeaturedCompetition[];
  onViewAllPress?: () => void;
  onCompetitionPress?: (competition: FeaturedCompetition) => void;
}

export const FeaturedCompetitions: React.FC<FeaturedCompetitionsProps> = ({
  competitions,
  onViewAllPress,
  onCompetitionPress,
}) => {
  return (
    <View style={styles.container}>
      {/* ── SECTION HEADER: Featured Competitions (Left) + View all (Right) ── */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Featured Competitions</Text>
        <TouchableOpacity
          onPress={onViewAllPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      {/* ── HORIZONTAL SCROLLABLE COMPETITION CARDS ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {competitions.map(comp => (
          <FeaturedCompetitionCard
            key={comp.id}
            competition={comp}
            onPress={() => onCompetitionPress?.(comp)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 28,
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
    paddingRight: 6,
  },
});

export default FeaturedCompetitions;
