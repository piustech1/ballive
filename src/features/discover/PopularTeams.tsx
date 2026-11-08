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
import { PopularTeam } from '../../constants/discoverData';

interface PopularTeamsProps {
  teams: PopularTeam[];
  onViewAllPress?: () => void;
  onTeamPress: (team: PopularTeam) => void;
}

export const PopularTeams: React.FC<PopularTeamsProps> = ({
  teams,
  onViewAllPress,
  onTeamPress,
}) => {
  return (
    <View style={styles.sectionContainer}>
      {/* ── SECTION HEADER ── */}
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

      {/* ── HORIZONTAL TEAMS SCROLLER ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
      >
        {teams.map(team => (
          <TouchableOpacity
            key={team.id}
            style={styles.teamCard}
            activeOpacity={0.8}
            onPress={() => onTeamPress(team)}
            accessibilityRole="button"
            accessibilityLabel={`${team.name}, ${team.country}`}
          >
            {/* Centered Crest */}
            <View style={styles.crestContainer}>
              <Image
                source={{ uri: team.crestUrl }}
                style={styles.crestImage}
                resizeMode="contain"
              />
            </View>

            {/* Club Name & Subtitle */}
            <View style={styles.nameContainer}>
              <Text style={styles.teamName} numberOfLines={1}>
                {team.name}
              </Text>
              <Text style={styles.teamCountry} numberOfLines={1}>
                {team.country}
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
    gap: 12,
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
  crestContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginTop: 4,
  },
  crestImage: {
    width: '100%',
    height: '100%',
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
