import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Colors from '../../theme/colors';
import { LiveMatch } from '../../constants/mockData';
import { DiscoverMatchup } from '../../constants/discoverData';
import { resolveSportBackground } from '../../utils/sportBackgroundResolver';
import { normalizeMatchStatus, formatKickoffEAT } from '../../utils/matchStatus';

export type UniversalMatchItem = LiveMatch | DiscoverMatchup;

export interface MMAFightCardProps {
  match: UniversalMatchItem;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_FIGHTER_AVATAR = 'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/default.png&w=120&h=120';

/**
 * MMAFightCard renders a dedicated combat sports presentation:
 * - Red Corner vs. Blue Corner
 * - Fighter headshot portraits and authentic combat records / rank badges
 * - Glowing Octagon VS badge with live round or scheduled start time
 * - Authentic Octagon background with 100% clarity
 * - Strictly NO football "Home/Away" labels or football crests.
 */
export const MMAFightCard: React.FC<MMAFightCardProps> = ({
  match,
  onPress,
  style,
}) => {
  const isDiscover = typeof match.homeTeam === 'object';

  const fighterAName = isDiscover
    ? (match.homeTeam as any).name || 'Fighter A'
    : (match.homeTeam as string) || 'Fighter A';

  const fighterBName = isDiscover
    ? (match.awayTeam as any).name || 'Fighter B'
    : (match.awayTeam as string) || 'Fighter B';

  const fighterAAvatar = isDiscover
    ? (match.homeTeam as any).crestUrl || (match as any).homeBadge || DEFAULT_FIGHTER_AVATAR
    : (match as any).homeBadge || DEFAULT_FIGHTER_AVATAR;

  const fighterBAvatar = isDiscover
    ? (match.awayTeam as any).crestUrl || (match as any).awayBadge || DEFAULT_FIGHTER_AVATAR
    : (match as any).awayBadge || DEFAULT_FIGHTER_AVATAR;

  // Extract clean rank or record from name if present, e.g. "Islam Makhachev (C)" -> "(C)"
  const cleanName = (name: string) => name.replace(/\s*\((C|#\d+)\)\s*/i, '').trim();
  const extractBadge = (name: string) => {
    const matchBadge = name.match(/\((C|#\d+)\)/i);
    return matchBadge ? matchBadge[1].toUpperCase() : null;
  };

  const badgeA = extractBadge(fighterAName);
  const badgeB = extractBadge(fighterBName);

  const displayA = cleanName(fighterAName);
  const displayB = cleanName(fighterBName);

  // Status normalization
  const statusInfo = normalizeMatchStatus({
    rawStatus: match.status,
    minute: match.minute,
    playTime: match.playTime,
    shortDetail: (match as any).kickoffTime || (match as any).time,
    completed: (match.status as string) === 'FT' || (match.status as string) === 'FINAL',
  });

  const { isLive, isUpcoming, isFinished, playTime } = statusInfo;

  const competition = match.competition || 'UFC Championship';
  const rawImage =
    (match as any).imageUrl ||
    (match as any).matchBannerUrl ||
    (match as any).poster ||
    null;

  const backdropUrl = resolveSportBackground(
    'mma',
    competition,
    rawImage,
    fighterAName,
    fighterBName,
    match.id
  );

  const rawKickoff =
    match.kickoffTime ||
    (match as any).time ||
    (match as any).kickoffDate ||
    'Main Card';

  const kickoffTime = isUpcoming
    ? (rawKickoff.includes('EAT') ? rawKickoff : formatKickoffEAT(rawKickoff))
    : rawKickoff;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <ImageBackground
        source={{ uri: backdropUrl }}
        style={styles.imageBackground}
        imageStyle={styles.imageBackgroundInner}
      >
        {/* Top Header Row */}
        <View style={styles.topRow}>
          <View style={styles.eventBadge}>
            <View style={styles.ufcTag}>
              <Text style={styles.ufcTagText}>UFC</Text>
            </View>
            <Text style={styles.eventText} numberOfLines={1}>
              {competition}
            </Text>
          </View>

          {isLive ? (
            <View style={styles.liveBadge}>
              <View style={styles.livePulseDot} />
              <Text style={styles.liveBadgeText}>
                {playTime ? `${playTime} LIVE` : 'LIVE BOUT'}
              </Text>
            </View>
          ) : isFinished ? (
            <View style={styles.ftBadge}>
              <Text style={styles.ftBadgeText}>FINAL</Text>
            </View>
          ) : (
            <View style={styles.upcomingBadge}>
              <Text style={styles.upcomingBadgeText}>UPCOMING BOUT</Text>
            </View>
          )}
        </View>

        {/* Bout Card Surface */}
        <View style={styles.boutSurface}>
          {/* Red Corner (Fighter A) */}
          <View style={styles.cornerCol}>
            <View style={styles.cornerIndicatorRed}>
              <Text style={styles.cornerIndicatorText}>RED CORNER</Text>
            </View>
            <View style={[styles.avatarCircle, styles.redBorder]}>
              <Image source={{ uri: fighterAAvatar }} style={styles.avatarImage} />
              {badgeA && (
                <View style={[styles.rankPill, badgeA === 'C' ? styles.champPill : styles.contenderPill]}>
                  <Text style={styles.rankPillText}>{badgeA}</Text>
                </View>
              )}
            </View>
            <Text style={styles.fighterNameText} numberOfLines={1}>
              {displayA}
            </Text>
          </View>

          {/* Center VS & Bout Timing */}
          <View style={styles.centerBox}>
            <View style={styles.octagonBadge}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            {isUpcoming ? (
              <Text style={styles.kickoffText} numberOfLines={1}>
                {kickoffTime}
              </Text>
            ) : isLive ? (
              <Text style={styles.liveRoundText}>
                {playTime || 'IN PROGRESS'}
              </Text>
            ) : (
              <Text style={styles.finalText}>DECISION / KO</Text>
            )}
            <View style={styles.hdPill}>
              <Text style={styles.hdPillText}>OCTAGON LIVE</Text>
            </View>
          </View>

          {/* Blue Corner (Fighter B) */}
          <View style={styles.cornerCol}>
            <View style={styles.cornerIndicatorBlue}>
              <Text style={styles.cornerIndicatorText}>BLUE CORNER</Text>
            </View>
            <View style={[styles.avatarCircle, styles.blueBorder]}>
              <Image source={{ uri: fighterBAvatar }} style={styles.avatarImage} />
              {badgeB && (
                <View style={[styles.rankPill, badgeB === 'C' ? styles.champPill : styles.contenderPill]}>
                  <Text style={styles.rankPillText}>{badgeB}</Text>
                </View>
              )}
            </View>
            <Text style={styles.fighterNameText} numberOfLines={1}>
              {displayB}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 168,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#161224',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  imageBackgroundInner: {
    borderRadius: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 17, 34, 0.90)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 11,
    maxWidth: 210,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  ufcTag: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginRight: 6,
  },
  ufcTagText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  eventText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ECE9FA',
    letterSpacing: -0.2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 7,
  },
  livePulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
    marginRight: 4.5,
  },
  liveBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  upcomingBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 7,
  },
  upcomingBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  ftBadge: {
    backgroundColor: 'rgba(75, 85, 99, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 7,
  },
  ftBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#E5E7EB',
    letterSpacing: 0.4,
  },
  boutSurface: {
    backgroundColor: 'rgba(18, 14, 28, 0.92)',
    borderRadius: 14,
    marginHorizontal: 9,
    marginBottom: 9,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cornerCol: {
    flex: 1,
    alignItems: 'center',
  },
  cornerIndicatorRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginBottom: 4,
  },
  cornerIndicatorBlue: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginBottom: 4,
  },
  cornerIndicatorText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#ECE9FA',
    letterSpacing: 0.5,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 4,
  },
  redBorder: {
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  blueBorder: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  rankPill: {
    position: 'absolute',
    bottom: -3,
    right: -5,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#161224',
  },
  champPill: {
    backgroundColor: '#F59E0B',
  },
  contenderPill: {
    backgroundColor: '#7952FC',
  },
  rankPillText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  fighterNameText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    maxWidth: 100,
    letterSpacing: -0.2,
  },
  centerBox: {
    alignItems: 'center',
    paddingHorizontal: 6,
    minWidth: 80,
  },
  octagonBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(121, 82, 252, 0.2)',
    borderWidth: 1.5,
    borderColor: '#7952FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  vsText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#A5B4FC',
    letterSpacing: 0.5,
  },
  kickoffText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C4B5FD',
    textAlign: 'center',
    maxWidth: 90,
  },
  liveRoundText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
  },
  finalText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  hdPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 3,
  },
  hdPillText: {
    fontSize: 7.5,
    fontWeight: '700',
    color: '#A098B5',
    letterSpacing: 0.3,
  },
});

export default MMAFightCard;
