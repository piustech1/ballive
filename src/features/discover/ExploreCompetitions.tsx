import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import Colors from '../../theme/colors';
import { CompetitionLogo } from '../../components/common/CompetitionLogo';
import { DiscoverCompetition } from '../../constants/discoverData';

interface ExploreCompetitionsProps {
  competitions: DiscoverCompetition[];
  onSeeAllPress?: () => void;
  onCompetitionPress: (competition: DiscoverCompetition) => void;
}

const getCompetitionSubLabel = (comp: DiscoverCompetition): string => {
  if (comp.season && !/202[0-5]/.test(comp.season)) {
    return comp.season;
  }
  const s = (comp.sport || '').toLowerCase();
  if (s === 'basketball') return 'Basketball';
  if (s === 'hockey') return 'Ice Hockey';
  if (s === 'american_football') return 'American Football';
  if (s === 'tennis') return 'Tennis';
  if (s === 'cricket') return 'Cricket';
  return 'Football';
};

const CompetitionCard = React.memo(({
  comp,
  onPress,
}: {
  comp: DiscoverCompetition;
  onPress: (c: DiscoverCompetition) => void;
}) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.8}
    onPress={() => onPress(comp)}
    accessibilityRole="button"
    accessibilityLabel={`${comp.name}, ${comp.country}`}
  >
    <View style={styles.cardHeader}>
      <CompetitionLogo
        uri={comp.logoUrl}
        competitionId={comp.id}
        sport={comp.sport}
        size={38}
        priority={3}
      />
      <View style={styles.regionBadge}>
        <Text style={styles.regionText} numberOfLines={1}>{comp.country}</Text>
      </View>
    </View>

    <View style={styles.cardBody}>
      <Text style={styles.compName} numberOfLines={1}>
        {comp.name}
      </Text>
      <Text style={styles.seasonText} numberOfLines={1}>
        {getCompetitionSubLabel(comp)}
      </Text>
    </View>
  </TouchableOpacity>
));

export const ExploreCompetitions: React.FC<ExploreCompetitionsProps> = React.memo(({
  competitions,
  onSeeAllPress,
  onCompetitionPress,
}) => {
  const renderItem: ListRenderItem<DiscoverCompetition> = useCallback(
    ({ item }) => <CompetitionCard comp={item} onPress={onCompetitionPress} />,
    [onCompetitionPress]
  );

  const keyExtractor = useCallback((item: DiscoverCompetition) => item.id, []);

  return (
    <View style={styles.sectionContainer}>
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

      <FlatList
        horizontal
        data={competitions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        decelerationRate="fast"
        initialNumToRender={5}
        maxToRenderPerBatch={6}
        windowSize={3}
        removeClippedSubviews={true}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 22,
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
  },
  itemSeparator: {
    width: 12,
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
  regionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    maxWidth: 82,
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
