import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import Colors from '../../theme/colors';
import { CompetitionLogo } from '../../components/common/CompetitionLogo';
import { DiscoverCompetition } from '../../constants/discoverData';

interface ExploreCompetitionsProps {
  competitions: DiscoverCompetition[];
  onSeeAllPress?: () => void;
  onCompetitionPress: (competition: DiscoverCompetition) => void;
}

export const ExploreCompetitions: React.FC<ExploreCompetitionsProps> = ({
  competitions,
  onSeeAllPress,
  onCompetitionPress,
}) => {
  return (
    <View style={styles.sectionContainer}>
      {/* ── SECTION HEADER ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Explore competitions</Text>
        <TouchableOpacity
          onPress={onSeeAllPress}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      {/* ── HORIZONTAL CARDS SCROLLER ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
      >
        {competitions.map(comp => (
          <TouchableOpacity
            key={comp.id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => onCompetitionPress(comp)}
            accessibilityRole="button"
            accessibilityLabel={`${comp.name}, ${comp.country}`}
          >
            {/* Top Accent Strip & Logo */}
            <View style={styles.cardHeader}>
              <CompetitionLogo
                uri={comp.logoUrl}
                competitionId={comp.id}
                size={40}
              />
              <View style={styles.regionBadge}>
                <Text style={styles.regionText}>{comp.country}</Text>
              </View>
            </View>

            {/* Competition Details */}
            <View style={styles.cardBody}>
              <Text style={styles.compName} numberOfLines={1}>
                {comp.name}
              </Text>
              <Text style={styles.seasonText} numberOfLines={1}>
                {comp.season}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.categoryPremierLeague,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    width: 156,
    height: 120,
    backgroundColor: Colors.surfaceCard,
    borderRadius: 18,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  regionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  regionText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  cardBody: {
    marginTop: 8,
  },
  compName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  seasonText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
