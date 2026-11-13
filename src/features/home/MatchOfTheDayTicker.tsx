import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, BellRing, Sparkles, Tv, MapPin } from 'lucide-react-native';
import Colors from '../../theme/colors';
import { useProfile } from '../../hooks/useProfile';
import { getMarqueeMatchOfTheDay } from '../../navigation/navHelpers';
import { getTeamCrest, DEFAULT_CREST } from '../../utils/teamCrestResolver';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { DiscoverMatchup } from '../../constants/discoverData';
import { normalizeSport } from '../../screens/MatchDetailsScreen';
import { SPORT_BACKDROPS } from '../../services/streamingApiService';

interface MatchOfTheDayTickerProps {
  match?: DiscoverMatchup | null;
}

/**
 * Resilient crest component for Match of the Day participants.
 */
const ParticipantLogo: React.FC<{ uri?: string | null; name?: string; size?: number }> = ({
  uri,
  name,
  size = 24,
}) => {
  const [hasError, setHasError] = useState(false);
  const resolved = useMemo(() => {
    if (uri && typeof uri === 'string' && uri.trim().length > 10 && !uri.includes('null')) {
      return uri.trim();
    }
    return getTeamCrest(name);
  }, [uri, name]);

  const [currentUri, setCurrentUri] = useState<string>(resolved);

  useEffect(() => {
    setCurrentUri(resolved);
    setHasError(false);
  }, [resolved]);

  return (
    <Image
      source={{ uri: hasError ? DEFAULT_CREST : currentUri }}
      style={{ width: size, height: size, resizeMode: 'contain' }}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setCurrentUri(DEFAULT_CREST);
        }
      }}
    />
  );
};

export const MatchOfTheDayTicker: React.FC<MatchOfTheDayTickerProps> = ({ match }) => {
  const { profile, toggleMatchReminder } = useProfile();
  const { navigate } = useAppNavigation();
  const marqueeMatch = match || getMarqueeMatchOfTheDay();

  const isLive = marqueeMatch.status === 'LIVE' || Boolean(marqueeMatch.minute && marqueeMatch.minute > 0);

  // Normalized sport detection
  const sport = useMemo(() => {
    return normalizeSport(marqueeMatch.sport, marqueeMatch.competition);
  }, [marqueeMatch.sport, marqueeMatch.competition]);

  // Dynamic countdown calculation for scheduled upcoming games
  const [countdownText, setCountdownText] = useState('Today');

  useEffect(() => {
    if (isLive) return;

    const updateCountdown = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(19, 45, 0, 0);

      let diffMs = target.getTime() - now.getTime();
      if (diffMs < 0) {
        diffMs += 24 * 60 * 60 * 1000;
      }

      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours === 0 && minutes <= 5) {
        setCountdownText('Starting soon');
      } else if (hours === 0) {
        setCountdownText(`In ${minutes}m`);
      } else {
        setCountdownText(`In ${hours}h ${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [isLive]);

  const isReminderSet = profile.matchReminderIds.includes(marqueeMatch.id);

  const handleCardPress = () => {
    if (isLive && marqueeMatch.hasLiveBroadcast && marqueeMatch.streamUrl) {
      navigate({
        name: 'LiveStreamDetails',
        params: { match: marqueeMatch },
      });
    } else {
      navigate({
        name: 'MatchDetails',
        params: { matchup: marqueeMatch },
      });
    }
  };

  const handleBellPress = (e: any) => {
    e?.stopPropagation?.();
    toggleMatchReminder(marqueeMatch.id);
  };

  // Sport-specific status text
  const getClockText = () => {
    if (!isLive) return 'Full Time';
    if (marqueeMatch.playTime) return `${marqueeMatch.playTime} In-Play`;
    switch (sport) {
      case 'basketball':
        return marqueeMatch.minute ? `Q${Math.min(4, Math.ceil(marqueeMatch.minute / 12))} In-Play` : 'LIVE In-Play';
      case 'hockey':
        return marqueeMatch.minute ? `P${Math.min(3, Math.ceil(marqueeMatch.minute / 20))} In-Play` : 'LIVE In-Play';
      case 'mma':
      case 'boxing':
        return 'Round In Action';
      case 'motorsport':
        return 'In Progress';
      default:
        return `${marqueeMatch.minute || 45}' In-Play`;
    }
  };

  const backdropUri = useMemo(() => {
    if (marqueeMatch.matchBannerUrl && marqueeMatch.matchBannerUrl.startsWith('http')) {
      return marqueeMatch.matchBannerUrl;
    }
    return SPORT_BACKDROPS[sport] || SPORT_BACKDROPS.soccer;
  }, [marqueeMatch.matchBannerUrl, sport]);

  return (
    <View style={styles.wrapper}>
      {/* ── UNIFIED MATCH OF THE DAY HERO PANEL (BACKDROP + GRADIENT + GLASS OVERLAY) ── */}
      <TouchableOpacity
        activeOpacity={0.92}
        style={styles.cardContainer}
        onPress={handleCardPress}
      >
        <ImageBackground
          source={{ uri: backdropUri }}
          style={styles.imageBackground}
          imageStyle={styles.imageBackgroundInner}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(16, 12, 30, 0.72)', 'rgba(9, 7, 18, 0.94)']}
            style={styles.gradientOverlay}
          >
            {/* 1. TOP HEADER: MOTD Tag + Competition + Live/Countdown Status + Bell */}
            <View style={styles.cardHeader}>
              <View style={styles.headerLeftCluster}>
                <View style={styles.motdBadge}>
                  <Sparkles size={11} color="#C4B5FD" strokeWidth={2.4} style={styles.sparkleIcon} />
                  <Text style={styles.motdBadgeText}>MATCH OF THE DAY</Text>
                </View>
                <Text style={styles.competitionText} numberOfLines={1}>
                  {marqueeMatch.competition}
                </Text>
              </View>

              <View style={styles.headerRightCluster}>
                {isLive ? (
                  <View style={styles.livePill}>
                    <View style={styles.liveDot} />
                    <Text style={styles.livePillText}>LIVE</Text>
                  </View>
                ) : (
                  <View style={styles.countdownPill}>
                    <Text style={styles.countdownText}>{countdownText}</Text>
                  </View>
                )}

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.bellButton, isReminderSet && styles.bellButtonActive]}
                  onPress={handleBellPress}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Toggle MOTD alert"
                >
                  {isReminderSet ? (
                    <BellRing size={13} color="#A78BFA" strokeWidth={2.4} />
                  ) : (
                    <Bell size={13} color="#A098B5" strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. MATCH CENTRE: Home Team | Central Score / VS | Away Team */}
            <View style={styles.matchCentre}>
              {/* Home Participant */}
              <View style={styles.teamHome}>
                <View style={styles.crestCircle}>
                  <ParticipantLogo
                    uri={marqueeMatch.homeTeam.crestUrl}
                    name={marqueeMatch.homeTeam.name || marqueeMatch.homeTeam.id}
                    size={26}
                  />
                </View>
                <Text style={styles.teamNameLeft} numberOfLines={1}>
                  {marqueeMatch.homeTeam.name}
                </Text>
              </View>

              {/* Center Score & Clock */}
              <View style={styles.centerScoreBox}>
                {isLive || marqueeMatch.status === 'FT' ? (
                  <>
                    <View style={styles.scoreRow}>
                      <Text style={styles.scoreNumber}>{marqueeMatch.homeTeam.score ?? 0}</Text>
                      <Text style={styles.scoreColon}>:</Text>
                      <Text style={styles.scoreNumber}>{marqueeMatch.awayTeam.score ?? 0}</Text>
                    </View>
                    <Text style={styles.clockSubtext} numberOfLines={1}>
                      {getClockText()}
                    </Text>
                  </>
                ) : (
                  <>
                    <View style={styles.vsBadge}>
                      <Text style={styles.vsText}>VS</Text>
                    </View>
                    <Text style={styles.scheduledTimeText} numberOfLines={1}>
                      {marqueeMatch.kickoffTime?.replace(' GMT', '') || '19:45'}
                    </Text>
                  </>
                )}
              </View>

              {/* Away Participant */}
              <View style={styles.teamAway}>
                <Text style={styles.teamNameRight} numberOfLines={1}>
                  {marqueeMatch.awayTeam.name}
                </Text>
                <View style={styles.crestCircle}>
                  <ParticipantLogo
                    uri={marqueeMatch.awayTeam.crestUrl}
                    name={marqueeMatch.awayTeam.name || marqueeMatch.awayTeam.id}
                    size={26}
                  />
                </View>
              </View>
            </View>

            {/* 3. CARD FOOTER: Venue + Watch Action */}
            <View style={styles.cardFooter}>
              <View style={styles.venueRow}>
                <MapPin size={12} color="#A098B5" strokeWidth={2.2} />
                <Text style={styles.venueText} numberOfLines={1}>
                  {marqueeMatch.venue || 'Championship Arena'}
                </Text>
              </View>

              <View style={styles.watchLiveBtn}>
                <Tv size={12} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.watchLiveBtnText}>
                  {isLive ? 'Watch Live' : 'Match Preview'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 16,
  },
  cardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1E1730',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  imageBackground: {
    width: '100%',
  },
  imageBackgroundInner: {
    borderRadius: 20,
  },
  gradientOverlay: {
    padding: 14,
    borderRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  motdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    marginRight: 8,
  },
  sparkleIcon: {
    marginRight: 4,
  },
  motdBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#E9D5FF',
    letterSpacing: 0.7,
  },
  competitionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#C4B5FD',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  headerRightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4.5,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  livePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  countdownPill: {
    backgroundColor: 'rgba(30, 24, 54, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countdownText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FBBF24',
  },
  bellButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(30, 24, 54, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellButtonActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.4)',
    borderColor: '#8B5CF6',
  },
  matchCentre: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  teamHome: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teamAway: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  crestCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  teamNameLeft: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
  },
  teamNameRight: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'right',
    flex: 1,
  },
  centerScoreBox: {
    width: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    minWidth: 18,
    textAlign: 'center',
  },
  scoreColon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#A78BFA',
    marginHorizontal: 3,
  },
  clockSubtext: {
    fontSize: 10,
    fontWeight: '700',
    color: '#22C55E',
    marginTop: 2,
    textAlign: 'center',
  },
  vsBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.4)',
    paddingHorizontal: 9,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  vsText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#C4B5FD',
    letterSpacing: 0.5,
  },
  scheduledTimeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#CBD5E1',
    marginTop: 3,
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    marginRight: 8,
  },
  venueText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#CBD5E1',
  },
  watchLiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: '#7952FC',
    gap: 5,
    shadowColor: '#7952FC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  watchLiveBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default MatchOfTheDayTicker;
