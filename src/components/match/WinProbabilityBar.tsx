import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { BarChart3 } from 'lucide-react-native';
import Colors from '../../theme/colors';
import { TeamCrest } from '../common/TeamCrest';
import { getMatchupColors } from '../../utils/teamColorResolver';
import { getTeamAbbreviation } from '../../utils/teamAbbreviationResolver';
import { WinProbabilityResult } from '../../services/winProbabilityService';

export interface WinProbabilityBarProps {
  homeTeamId?: string;
  awayTeamId?: string;
  homeTeamName: string;
  awayTeamName: string;
  homeCrest?: string;
  awayCrest?: string;
  sport?: string;
  probabilityData?: WinProbabilityResult | null;
  isLoading?: boolean;
  onHomePress?: () => void;
  onAwayPress?: () => void;
}

export const WinProbabilityBar: React.FC<WinProbabilityBarProps> = ({
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
  homeCrest,
  awayCrest,
  sport = 'soccer',
  probabilityData,
  isLoading = false,
  onHomePress,
  onAwayPress,
}) => {
  const homeAbbr = getTeamAbbreviation(homeTeamName);
  const awayAbbr = getTeamAbbreviation(awayTeamName);

  // Authentic brand colors from BALLIVE color engine with collision avoidance
  const { homeColor: homeFillColor, awayColor: awayFillColor } = getMatchupColors(
    homeTeamName,
    awayTeamName
  );
  const drawFillColor = '#1C1E24';

  const isAvailable = Boolean(probabilityData && probabilityData.isAvailable);

  const homePercent = isAvailable && probabilityData?.homePercent !== undefined
    ? probabilityData.homePercent
    : 0;
  const awayPercent = isAvailable && probabilityData?.awayPercent !== undefined
    ? probabilityData.awayPercent
    : 0;
  const drawPercent = isAvailable && probabilityData?.drawPercent !== undefined
    ? probabilityData.drawPercent
    : undefined;

  const isTwoWay = Boolean(probabilityData?.isTwoWay);

  return (
    <View style={styles.cardContainer}>
      {/* ── 1. HEADER (Strictly matching reference "LIVE WIN PROBABILITY / EXPLAINER") ── */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>LIVE WIN PROBABILITY</Text>
          <Text style={styles.headerSubtitle}>E X P L A I N E R</Text>
        </View>
      </View>

      {/* ── 2. PROBABILITY BAR OR FALLBACK STATE ── */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#A58BFC" />
          <Text style={styles.loadingText}>Calculating match probability...</Text>
        </View>
      ) : isAvailable ? (
        <View style={styles.barOuterWrapper}>
          <View style={styles.barContainer}>
            {/* Home Segment */}
            <TouchableOpacity
              activeOpacity={onHomePress ? 0.8 : 1}
              disabled={!onHomePress}
              onPress={onHomePress}
              style={[
                styles.segment,
                styles.homeSegment,
                { flex: Math.max(homePercent, 12), backgroundColor: homeFillColor },
              ]}
            >
              <View style={styles.badgeWrapperLeft}>
                <TeamCrest
                  uri={homeCrest}
                  teamId={homeTeamId}
                  teamName={homeTeamName}
                  size={28}
                  containerStyle={styles.crestContainer}
                />
              </View>
              <Text style={styles.segmentText} numberOfLines={1}>
                {homeAbbr} {homePercent.toFixed(1)}%
              </Text>
            </TouchableOpacity>

            {/* Draw Segment (Omitted for 2-way sports like Basketball) */}
            {!isTwoWay && drawPercent !== undefined && (
              <View
                style={[
                  styles.segment,
                  styles.drawSegment,
                  { flex: Math.max(drawPercent, 10), backgroundColor: drawFillColor },
                ]}
              >
                <Text style={styles.segmentText} numberOfLines={1}>
                  DRAW {drawPercent.toFixed(1)}%
                </Text>
              </View>
            )}

            {/* Away Segment */}
            <TouchableOpacity
              activeOpacity={onAwayPress ? 0.8 : 1}
              disabled={!onAwayPress}
              onPress={onAwayPress}
              style={[
                styles.segment,
                styles.awaySegment,
                { flex: Math.max(awayPercent, 12), backgroundColor: awayFillColor },
              ]}
            >
              <Text style={styles.segmentText} numberOfLines={1}>
                {awayAbbr} {awayPercent.toFixed(1)}%
              </Text>
              <View style={styles.badgeWrapperRight}>
                <TeamCrest
                  uri={awayCrest}
                  teamId={awayTeamId}
                  teamName={awayTeamName}
                  size={28}
                  containerStyle={styles.crestContainer}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Clean, authentic unavailable state without fabricating numbers */
        <View style={styles.unavailableContainer}>
          <View style={styles.unavailableRow}>
            <BarChart3 size={15} color="#A098B5" strokeWidth={2} style={styles.unavailableIcon} />
            <Text style={styles.unavailableText}>
              Live win probability calculating or unavailable for this fixture
            </Text>
          </View>
        </View>
      )}

      {/* Provider Attribution Subtitle */}
      {isAvailable && probabilityData?.provider && (
        <View style={styles.providerRow}>
          <Text style={styles.providerText}>
            Source: {probabilityData.provider}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1E1730',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  headerTitleGroup: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-condensed' }),
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D8B4FE',
    letterSpacing: 4,
    marginTop: 2,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  },
  barOuterWrapper: {
    width: '100%',
    paddingVertical: 2,
  },
  barContainer: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#161224',
    alignItems: 'stretch',
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  homeSegment: {
    justifyContent: 'flex-start',
    paddingLeft: 6,
  },
  drawSegment: {
    justifyContent: 'center',
  },
  awaySegment: {
    justifyContent: 'flex-end',
    paddingRight: 6,
  },
  badgeWrapperLeft: {
    marginRight: 6,
  },
  badgeWrapperRight: {
    marginLeft: 6,
  },
  crestContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  segmentText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-condensed' }),
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    backgroundColor: '#181424',
    borderRadius: 8,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#A098B5',
    fontWeight: '500',
  },
  unavailableContainer: {
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  unavailableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unavailableIcon: {
    marginRight: 6,
  },
  unavailableText: {
    fontSize: 12,
    color: '#A098B5',
    fontWeight: '500',
  },
  providerRow: {
    alignItems: 'center',
    marginTop: 8,
  },
  providerText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default WinProbabilityBar;
