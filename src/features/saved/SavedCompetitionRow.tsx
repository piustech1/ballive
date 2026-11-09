import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Check, ChevronRight } from 'lucide-react-native';
import Colors from '../../theme/colors';
import { PopularLeague } from '../../constants/discoverData';

interface SavedCompetitionRowProps {
  league: PopularLeague;
  onPress: (league: PopularLeague) => void;
  onUnfollowPress: (leagueId: string) => void;
}

export const SavedCompetitionRow: React.FC<SavedCompetitionRowProps> = ({
  league,
  onPress,
  onUnfollowPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => onPress(league)}
      accessibilityRole="button"
      accessibilityLabel={`${league.name}, ${league.country}`}
    >
      {/* Competition Logo */}
      <View style={styles.logoWrapper}>
        <Image
          source={{ uri: league.logoUrl }}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Meta Info */}
      <View style={styles.infoCol}>
        <Text style={styles.leagueName} numberOfLines={1}>{league.name}</Text>
        <Text style={styles.leagueMeta} numberOfLines={1}>
          {league.country} • {league.currentMatchweek}
        </Text>
        <Text style={styles.leagueDesc} numberOfLines={1}>{league.description}</Text>
      </View>

      {/* Following Action Button */}
      <TouchableOpacity
        style={styles.followingBtn}
        activeOpacity={0.75}
        onPress={() => onUnfollowPress(league.id)}
        accessibilityRole="button"
        accessibilityLabel={`Unfollow ${league.name}`}
      >
        <Check size={14} color="#A58BFC" strokeWidth={2.6} />
        <Text style={styles.followingBtnText}>Following</Text>
      </TouchableOpacity>

      <ChevronRight size={18} color={Colors.textMuted} strokeWidth={2.2} style={styles.chevron} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  logoWrapper: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    marginRight: 14,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
    marginRight: 8,
  },
  leagueName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  leagueMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  leagueDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  followingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(121, 82, 252, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  followingBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A58BFC',
  },
  chevron: {
    marginLeft: 6,
  },
});
