import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DiscoverMatchup } from '../../constants/discoverData';
import { UniversalMatchCard } from '../../components/common/UniversalMatchCard';

export interface MatchupCardProps {
  matchup: DiscoverMatchup;
  onMatchDetailsPress: (matchup: DiscoverMatchup) => void;
  onWatchPress?: (matchup: DiscoverMatchup) => void;
  onReminderToggle?: (matchup: DiscoverMatchup, isSet: boolean) => void;
}

export const MatchupCard: React.FC<MatchupCardProps> = ({
  matchup,
  onMatchDetailsPress,
  onWatchPress,
  onReminderToggle,
}) => {
  const handlePress = () => {
    if (onWatchPress && (matchup.status === 'LIVE' || matchup.hasLiveBroadcast)) {
      onWatchPress(matchup);
    } else {
      onMatchDetailsPress(matchup);
    }
  };

  return (
    <View style={styles.container}>
      <UniversalMatchCard
        match={matchup}
        layout="full"
        onPress={handlePress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
});
