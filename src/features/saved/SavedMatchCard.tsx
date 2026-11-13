import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BookmarkCheck, Info, Play, Trash2 } from 'lucide-react-native';
import { DiscoverMatchup } from '../../constants/discoverData';
import { UniversalMatchCard } from '../../components/common/UniversalMatchCard';
import { normalizeMatchStatus } from '../../utils/matchStatus';

export interface SavedMatchCardProps {
  matchup: DiscoverMatchup;
  onMatchDetailsPress: (matchup: DiscoverMatchup) => void;
  onRemovePress: (matchupId: string) => void;
  onWatchPress?: (matchup: DiscoverMatchup) => void;
}

export const SavedMatchCard: React.FC<SavedMatchCardProps> = ({
  matchup,
  onMatchDetailsPress,
  onRemovePress,
  onWatchPress,
}) => {
  const isLive = normalizeMatchStatus({ rawStatus: matchup.status, playTime: matchup.playTime, minute: matchup.minute }).isLive;
  const hasLiveBroadcast = isLive && Boolean(matchup.hasLiveBroadcast || matchup.streamUrl || (matchup.streams && matchup.streams.length > 0));

  const handleCardPress = () => {
    if (hasLiveBroadcast && onWatchPress) {
      onWatchPress(matchup);
    } else {
      onMatchDetailsPress(matchup);
    }
  };

  return (
    <View style={styles.cardWrapper}>
      <UniversalMatchCard
        match={matchup}
        layout="full"
        onPress={handleCardPress}
      />

      {/* Solid Surface Action Bar Beneath Card */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.75}
          onPress={() => onMatchDetailsPress(matchup)}
          accessibilityRole="button"
          accessibilityLabel="Match details"
        >
          <Info size={13} color="#A098B5" strokeWidth={2.2} />
          <Text style={styles.actionBtnText}>Details</Text>
        </TouchableOpacity>

        {hasLiveBroadcast && onWatchPress && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnWatch]}
            activeOpacity={0.8}
            onPress={() => onWatchPress(matchup)}
            accessibilityRole="button"
            accessibilityLabel="Watch live stream"
          >
            <Play size={13} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.actionBtnWatchText}>Watch Live</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnRemove]}
          activeOpacity={0.75}
          onPress={() => onRemovePress(matchup.id)}
          accessibilityRole="button"
          accessibilityLabel="Remove from saved matches"
        >
          <Trash2 size={13} color="#EF4444" strokeWidth={2.2} />
          <Text style={styles.actionBtnRemoveText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 14,
    backgroundColor: '#161224',
    borderRadius: 18,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1E1730',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#261C3D',
    gap: 5,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A098B5',
  },
  actionBtnWatch: {
    backgroundColor: '#7952FC',
  },
  actionBtnWatchText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnRemove: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  actionBtnRemoveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
});
