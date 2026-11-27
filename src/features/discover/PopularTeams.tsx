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
import { PopularTeam } from '../../constants/discoverData';
import { TeamCrest } from '../../components/common/TeamCrest';

interface PopularTeamsProps {
  teams: PopularTeam[];
  onViewAllPress?: () => void;
  onTeamPress: (team: PopularTeam) => void;
}

const PopularTeamCard = React.memo(({
  team,
  onPress,
}: {
  team: PopularTeam;
  onPress: (t: PopularTeam) => void;
}) => (
  <TouchableOpacity
    style={styles.teamCard}
    activeOpacity={0.8}
    onPress={() => onPress(team)}
    accessibilityRole="button"
    accessibilityLabel={`${team.name}, ${team.country}`}
  >
    <TeamCrest
      uri={team.crestUrl}
      teamId={team.id}
      teamName={team.name}
      sport={team.sport}
      size={52}
      priority={3}
      containerStyle={styles.crestFlatContainer}
    />

    <View style={styles.nameContainer}>
      <Text style={styles.teamName} numberOfLines={1}>
        {team.name}
      </Text>
      <Text style={styles.teamCountry} numberOfLines={1}>
        {team.country}
      </Text>
    </View>
  </TouchableOpacity>
));

export const PopularTeams: React.FC<PopularTeamsProps> = React.memo(({
  teams,
  onViewAllPress,
  onTeamPress,
}) => {
  const renderItem: ListRenderItem<PopularTeam> = useCallback(
    ({ item }) => <PopularTeamCard team={item} onPress={onTeamPress} />,
    [onTeamPress]
  );

  const keyExtractor = useCallback((item: PopularTeam) => item.id, []);

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular teams</Text>
        <TouchableOpacity
          onPress={onViewAllPress}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={teams}
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
    marginTop: 26,
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
  viewAllText: {
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
  teamCard: {
    width: 120,
    height: 136,
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  crestFlatContainer: {
    width: 58,
    height: 58,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  nameContainer: {
    alignItems: 'center',
    width: '100%',
  },
  teamName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  teamCountry: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
});
