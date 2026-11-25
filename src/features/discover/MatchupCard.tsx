import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DiscoverMatchup } from '../../constants/discoverData';
import { UniversalMatchCard } from '../../components/common/UniversalMatchCard';
import { determineMatchRoute } from '../../navigation/navHelpers';

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
    const route = determineMatchRoute(matchup);
    if (route.name === 'LiveStreamDetails' && onWatchPress) {
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
