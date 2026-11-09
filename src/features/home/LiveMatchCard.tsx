import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Colors from '../../theme/colors';
import { LiveMatch } from '../../constants/mockData';
import { LiveBadge } from '../../components/common/LiveBadge';

interface LiveMatchCardProps {
  match: LiveMatch;
  onPress?: () => void;
}

export const LiveMatchCard: React.FC<LiveMatchCardProps> = ({ match, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityLabel={`${match.title}, Live football stream`}
      accessibilityRole="button"
    >
      <ImageBackground
        source={{ uri: match.imageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.image}
        resizeMode="cover"
      >
        {/* Dark bottom gradient overlay for cinematic contrast */}
        <View style={styles.darkOverlay} />

        {/* ── CARD BOTTOM ROW: Match Title (Left) + Live Badge (Right) ── */}
        <View style={styles.bottomRow}>
          {/* Match Title on the Left */}
          <View style={styles.titleContainer}>
            <Text style={styles.matchTitle} numberOfLines={1}>
              {match.title}
            </Text>
            <Text style={styles.competitionSubtitle} numberOfLines={1}>
              {match.competition}
            </Text>
          </View>

          {/* Unified Solid Red Live Badge on the Right */}
          <LiveBadge variant="solid" />
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 250,
    height: 155,
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceCard,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  image: {
    borderRadius: 20,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 8, 18, 0.45)',
    borderRadius: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  matchTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  competitionSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.liveRed,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: Colors.liveRed,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    marginRight: 4,
    letterSpacing: 0.2,
  },
  liveIcon: {
    marginLeft: 1,
  },
});

export default LiveMatchCard;
