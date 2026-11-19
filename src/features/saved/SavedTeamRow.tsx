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
import { PopularTeam } from '../../constants/discoverData';
import { TeamCrest } from '../../components/common/TeamCrest';

interface SavedTeamRowProps {
  team: PopularTeam;
  onPress: (team: PopularTeam) => void;
  onUnfollowPress: (teamId: string) => void;
}

export const SavedTeamRow: React.FC<SavedTeamRowProps> = ({
  team,
  onPress,
  onUnfollowPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => onPress(team)}
      accessibilityRole="button"
      accessibilityLabel={`${team.name}, ${team.country}`}
    >
      {/* Club Crest */}
      <TeamCrest
        uri={team.crestUrl}
        teamName={team.name}
        size={44}
        containerStyle={styles.crestFlatContainer}
      />

      {/* Team Meta */}
      <View style={styles.infoCol}>
        <Text style={styles.teamName} numberOfLines={1}>{team.name}</Text>
        <Text style={styles.teamMeta} numberOfLines={1}>
          {team.country} • {team.stadium}
        </Text>
        <Text style={styles.teamHonors} numberOfLines={1}>{team.domesticTitle}</Text>
      </View>

      {/* Following Action Button */}
      <TouchableOpacity
        style={styles.followingBtn}
        activeOpacity={0.75}
        onPress={() => onUnfollowPress(team.id)}
        accessibilityRole="button"
        accessibilityLabel={`Unfollow ${team.name}`}
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
  crestFlatContainer: {
    width: 44,
    height: 44,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoCol: {
    flex: 1,
    marginRight: 8,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  teamMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  teamHonors: {
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
