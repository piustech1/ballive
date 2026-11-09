import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import Colors from '../../theme/colors';
import { FeaturedCompetition } from '../../constants/mockData';
import { CompetitionLogo } from '../../components/common/CompetitionLogo';

interface FeaturedCompetitionCardProps {
  competition: FeaturedCompetition;
  onPress?: () => void;
}

export const FeaturedCompetitionCard: React.FC<FeaturedCompetitionCardProps> = ({
  competition,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={`${competition.name}, ${competition.season}`}
      accessibilityRole="button"
    >
      {/* Left Circular White Emblem Container */}
      <CompetitionLogo
        uri={competition.crestUrl}
        competitionId={competition.id}
        size={44}
        containerStyle={styles.logoMargin}
      />

      {/* Middle/Right Details */}
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.competitionName} numberOfLines={1}>
            {competition.name}
          </Text>
          {competition.verified && (
            <CheckCircle2
              size={14}
              color={Colors.verifiedBlue}
              fill={Colors.verifiedBlue}
              strokeWidth={2}
              style={styles.verifiedIcon}
            />
          )}
        </View>

        <Text style={styles.seasonText} numberOfLines={1}>
          {competition.season} • {competition.matchesCount} Matches
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 220,
    height: 70,
    borderRadius: 16,
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  logoMargin: {
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  competitionName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
    letterSpacing: -0.2,
  },
  verifiedIcon: {
    marginLeft: 4,
    flexShrink: 0,
  },
  seasonText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default FeaturedCompetitionCard;
