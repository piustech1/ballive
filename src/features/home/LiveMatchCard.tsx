import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Colors from '../../theme/colors';
import { LiveMatch } from '../../constants/mockData';
import { LiveBadge } from '../../components/common/LiveBadge';
import { CompetitionLogo } from '../../components/common/CompetitionLogo';
import { getTeamCrest } from '../../utils/teamCrestResolver';

interface LiveMatchCardProps {
  match: LiveMatch;
  onPress?: () => void;
}

export const LiveMatchCard: React.FC<LiveMatchCardProps> = ({ match, onPress }) => {
  const homeCrest = getTeamCrest(match.homeTeam);
  const awayCrest = getTeamCrest(match.awayTeam);

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityLabel={`${match.homeTeam} vs ${match.awayTeam}, Live football stream`}
      accessibilityRole="button"
    >
      <ImageBackground
        source={{ uri: match.imageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.image}
        resizeMode="cover"
      >
        {/* Dark overlay for contrast */}
        <View style={styles.darkOverlay} />

        {/* ── CARD TOP ROW: Competition + Solid Red LIVE Badge ── */}
        <View style={styles.topRow}>
          <View style={styles.compBadge}>
            <CompetitionLogo competitionId={match.competition} size={18} containerStyle={{ marginRight: 6 }} />
            <Text style={styles.competitionText} numberOfLines={1} ellipsizeMode="tail">
              {match.competition}
            </Text>
          </View>

          <LiveBadge variant="solid" minute={match.minute} />
        </View>

        {/* ── CARD BOTTOM MATCHUP CONTAINER: Contrast Surface with Club Crests ── */}
        <View style={styles.matchupSurface}>
          {/* Home Club */}
          <View style={styles.teamCol}>
            <View style={styles.crestCircle}>
              <Image source={{ uri: homeCrest }} style={styles.crestImage} />
            </View>
            <Text style={styles.teamNameText} numberOfLines={1}>
              {match.homeTeam}
            </Text>
          </View>

          {/* Center Score / VS */}
          <View style={styles.centerScoreBox}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreNumber}>{match.score?.home ?? 0}</Text>
              <Text style={styles.scoreDivider}>-</Text>
              <Text style={styles.scoreNumber}>{match.score?.away ?? 0}</Text>
            </View>
            <Text style={styles.inPlayText}>LIVE</Text>
          </View>

          {/* Away Club */}
          <View style={styles.teamCol}>
            <View style={styles.crestCircle}>
              <Image source={{ uri: awayCrest }} style={styles.crestImage} />
            </View>
            <Text style={styles.teamNameText} numberOfLines={1}>
              {match.awayTeam}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 250,
    height: 160,
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
    justifyContent: 'space-between',
  },
  image: {
    borderRadius: 20,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 8, 18, 0.45)',
    borderRadius: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  compBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 19, 36, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
    maxWidth: 130,
    flexShrink: 1,
    marginRight: 8,
  },
  competitionText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#ECE9FA',
    flexShrink: 1,
  },
  matchupSurface: {
    backgroundColor: 'rgba(18, 14, 28, 0.88)',
    borderRadius: 14,
    marginHorizontal: 10,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  teamCol: {
    flex: 1,
    alignItems: 'center',
  },
  crestCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  crestImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  teamNameText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  centerScoreBox: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scoreDivider: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7952FC',
    marginHorizontal: 4,
  },
  inPlayText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.5,
    marginTop: 1,
  },
});

export default LiveMatchCard;
