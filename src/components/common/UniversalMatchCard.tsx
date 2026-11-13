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
import { CompetitionLogo } from './CompetitionLogo';
import { getTeamCrest, DEFAULT_CREST } from '../../utils/teamCrestResolver';
import { resolveSportBackground } from '../../utils/sportBackgroundResolver';
import { normalizeMatchStatus, formatKickoffEAT } from '../../utils/matchStatus';

export type UniversalMatchItem = LiveMatch | DiscoverMatchup;

export interface UniversalMatchCardProps {
  match: UniversalMatchItem;
  layout?: 'carousel' | 'grid' | 'featured' | 'full';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  rightAction?: React.ReactNode;
}

/**
 * Normalizes any match item into a consistent, authoritative view model.
 */
function normalizeMatchItem(item: UniversalMatchItem) {
  const isDiscover = typeof item.homeTeam === 'object';

  const homeTeamName = isDiscover
    ? (item.homeTeam as any).name || ''
    : (item.homeTeam as string) || '';

  const awayTeamName = isDiscover
    ? (item.awayTeam as any).name || ''
    : (item.awayTeam as string) || '';

  const homeCrest = isDiscover
    ? (item.homeTeam as any).crestUrl || (item as any).homeBadge || getTeamCrest(homeTeamName)
    : (item as any).homeBadge || getTeamCrest(homeTeamName);

  const awayCrest = isDiscover
    ? (item.awayTeam as any).crestUrl || (item as any).awayBadge || getTeamCrest(awayTeamName)
    : (item as any).awayBadge || getTeamCrest(awayTeamName);

  const rawHomeScore = isDiscover
    ? (item.homeTeam as any).score
    : (item as LiveMatch).score?.home;

  const rawAwayScore = isDiscover
    ? (item.awayTeam as any).score
    : (item as LiveMatch).score?.away;

  // Authoritative Match Status Normalization
  const statusInfo = normalizeMatchStatus({
    rawStatus: item.status,
    minute: item.minute,
    playTime: item.playTime,
    shortDetail: (item as any).kickoffTime || (item as any).time,
    completed: item.status === 'FT' || item.minute === 90,
  });

  const { status, isLive, isUpcoming, isFinished, minute, playTime, displayStatus } = statusInfo;

  // Real scores: zero if upcoming, authoritative score if live or completed
  const homeScore = isUpcoming ? 0 : (rawHomeScore ?? 0);
  const awayScore = isUpcoming ? 0 : (rawAwayScore ?? 0);

  const competition = item.competition || 'Sports Match';
  const competitionLogo = (item as any).competitionLogo || undefined;

  const rawImage =
    (item as any).imageUrl ||
    (item as any).matchBannerUrl ||
    (item as any).poster ||
    null;

  const sport = item.sport;
  // Resolve authentic sport backdrop with multi-sport and team detection
  const backdropUrl = resolveSportBackground(
    sport,
    competition,
    rawImage,
    homeTeamName,
    awayTeamName
  );

  const rawKickoff =
    item.kickoffTime ||
    (item as any).time ||
    (item as any).kickoffDate ||
    'Upcoming';

  const kickoffTime = isUpcoming
    ? (rawKickoff.includes('EAT') ? rawKickoff : formatKickoffEAT(rawKickoff))
    : rawKickoff;

  return {
    id: item.id,
    competition,
    competitionLogo,
    status,
    isLive,
    isUpcoming,
    isFinished,
    minute,
    playTime: playTime || (isLive ? (minute > 0 ? `${minute}'` : 'LIVE') : undefined),
    displayStatus,
    homeTeamName,
    awayTeamName,
    homeCrest: homeCrest || DEFAULT_CREST,
    awayCrest: awayCrest || DEFAULT_CREST,
    homeScore,
    awayScore,
    kickoffTime,
    backdropUrl,
    sport,
  };
}

export const UniversalMatchCard: React.FC<UniversalMatchCardProps> = ({
  match,
  layout = 'carousel',
  onPress,
  style,
  rightAction,
}) => {
  const m = normalizeMatchItem(match);

  // Layout sizing
  const layoutContainerStyle =
    layout === 'grid'
      ? styles.gridContainer
      : layout === 'featured'
      ? styles.featuredContainer
      : layout === 'full'
      ? styles.fullContainer
      : styles.carouselContainer;

  return (
    <TouchableOpacity
      style={[styles.baseCard, layoutContainerStyle, style]}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${m.homeTeamName} vs ${m.awayTeamName}, ${
        m.isLive ? 'Live match' : m.isUpcoming ? 'Upcoming match' : 'Completed match'
      }`}
    >
      <ImageBackground
        source={{ uri: m.backdropUrl }}
        style={styles.imageBackground}
        imageStyle={styles.imageBackgroundInner}
        resizeMode="cover"
      >
        {/*
          100% ORIGINAL IMAGE CLARITY
          Notice: No full-card darkOverlay or blur layer.
          The background image retains its natural brightness, clarity, and vibrancy.
          Text readability is achieved via the solid surfaces below.
        */}

        {/* ── CARD TOP ROW: Competition Identity & Status Badge ── */}
        <View style={styles.topRow}>
          <View style={styles.compBadge}>
            <CompetitionLogo
              competitionId={m.competition}
              uri={m.competitionLogo}
              size={17}
              containerStyle={{ marginRight: 5 }}
            />
            <Text style={styles.competitionText} numberOfLines={1}>
              {m.competition}
            </Text>
          </View>

          <View style={styles.topRightGroup}>
            {m.isLive ? (
              <View style={styles.liveBadge}>
                <View style={styles.livePulseDot} />
                <Text style={styles.liveBadgeText}>
                  {m.playTime
                    ? `${m.playTime} LIVE`
                    : m.minute > 0
                    ? `${m.minute}' LIVE`
                    : 'LIVE'}
                </Text>
              </View>
            ) : m.isFinished ? (
              <View style={styles.ftBadge}>
                <Text style={styles.ftBadgeText}>FT</Text>
              </View>
            ) : (
              <View style={styles.upcomingBadge}>
                <Text style={styles.upcomingBadgeText}>UPCOMING</Text>
              </View>
            )}

            {rightAction ? (
              <View style={{ marginLeft: 6 }}>{rightAction}</View>
            ) : null}
          </View>
        </View>

        {/* ── CARD BOTTOM MATCHUP CONTAINER: Solid Surface with Authentic Crests & Scores ── */}
        <View style={[styles.matchupSurface, layout === 'featured' && styles.featuredMatchupSurface]}>
          {/* Home Team */}
          <View style={styles.teamCol}>
            <View style={styles.crestCircle}>
              <Image source={{ uri: m.homeCrest }} style={styles.crestImage} />
            </View>
            <Text style={styles.teamNameText} numberOfLines={1}>
              {m.homeTeamName}
            </Text>
          </View>

          {/* Center Score / VS / Status */}
          <View style={styles.centerScoreBox}>
            {m.isUpcoming ? (
              <>
                <Text style={styles.vsText}>VS</Text>
                <Text style={styles.kickoffText} numberOfLines={1}>
                  {m.kickoffTime}
                </Text>
              </>
            ) : (
              <>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreNumber}>{m.homeScore}</Text>
                  <Text style={styles.scoreDivider}>-</Text>
                  <Text style={styles.scoreNumber}>{m.awayScore}</Text>
                </View>
                <Text
                  style={[
                    styles.statusSubText,
                    m.isLive ? styles.statusLiveText : styles.statusFtText,
                  ]}
                  numberOfLines={1}
                >
                  {m.isLive ? (m.playTime || 'LIVE') : 'FINAL'}
                </Text>
              </>
            )}
          </View>

          {/* Away Team */}
          <View style={styles.teamCol}>
            <View style={styles.crestCircle}>
              <Image source={{ uri: m.awayCrest }} style={styles.crestImage} />
            </View>
            <Text style={styles.teamNameText} numberOfLines={1}>
              {m.awayTeamName}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseCard: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#161224',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  carouselContainer: {
    width: 250,
    height: 160,
    marginRight: 14,
  },
  gridContainer: {
    flex: 1,
    height: 165,
    margin: 5,
  },
  featuredContainer: {
    width: '100%',
    height: 175,
  },
  fullContainer: {
    width: '100%',
    height: 160,
    marginBottom: 12,
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
    paddingHorizontal: 11,
    paddingTop: 10,
  },
  compBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 17, 34, 0.88)',
    paddingHorizontal: 7.5,
    paddingVertical: 3.5,
    borderRadius: 11,
    maxWidth: 135,
    flexShrink: 1,
    marginRight: 6,
  },
  competitionText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#ECE9FA',
    flexShrink: 1,
    letterSpacing: -0.2,
  },
  topRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 7.5,
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
    backgroundColor: '#3B82F6',
    paddingHorizontal: 7.5,
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
    paddingHorizontal: 7.5,
    paddingVertical: 3.5,
    borderRadius: 7,
  },
  ftBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#E5E7EB',
    letterSpacing: 0.4,
  },
  matchupSurface: {
    backgroundColor: 'rgba(18, 14, 28, 0.88)',
    borderRadius: 13,
    marginHorizontal: 9,
    marginBottom: 9,
    paddingVertical: 7,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
  },
  featuredMatchupSurface: {
    paddingVertical: 9,
    paddingHorizontal: 12,
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
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  centerScoreBox: {
    alignItems: 'center',
    paddingHorizontal: 4,
    minWidth: 54,
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
    fontSize: 13,
    fontWeight: '700',
    color: '#7952FC',
    marginHorizontal: 3.5,
  },
  statusSubText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginTop: 1,
  },
  statusLiveText: {
    color: '#EF4444',
  },
  statusFtText: {
    color: '#A098B5',
  },
  vsText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#7952FC',
    letterSpacing: 0.5,
  },
  kickoffText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#A5B4FC',
    marginTop: 2,
    maxWidth: 75,
    textAlign: 'center',
  },
});

export default UniversalMatchCard;
