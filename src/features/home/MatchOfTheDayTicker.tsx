import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Bell, BellRing, Sparkles, Tv, MapPin } from 'lucide-react-native';
import Colors from '../../theme/colors';
import { useProfile } from '../../hooks/useProfile';
import { getMarqueeMatchOfTheDay } from '../../navigation/navHelpers';
import { getTeamCrest, DEFAULT_CREST } from '../../utils/teamCrestResolver';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { DiscoverMatchup } from '../../constants/discoverData';
import { normalizeSport } from '../../screens/MatchDetailsScreen';

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
    switch (sport) {
      case 'basketball':
        return 'Q4 • 03:24';
      case 'hockey':
        return 'P3 • 11:40';
      case 'mma':
      case 'boxing':
        return 'Round 3 • In Action';
      case 'motorsport':
        return 'Lap 48/78';
      default:
        return `${marqueeMatch.minute || 45}' In-Play`;
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* ── UNIFIED MATCH OF THE DAY PANEL (SOLID SURFACE, COMPACT & BOLD) ── */}
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.cardContainer}
        onPress={handleCardPress}
      >
        {/* 1. TOP HEADER: MOTD Tag + Competition + Live/Countdown Status + Bell */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeftCluster}>
            <View style={styles.motdBadge}>
              <Sparkles size={10} color="#A78BFA" strokeWidth={2.4} style={styles.sparkleIcon} />
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
                <BellRing size={13} color="#7952FC" strokeWidth={2.4} />
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
                size={22}
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
                size={22}
              />
            </View>
          </View>
        </View>

        {/* 3. CARD FOOTER: Venue + Watch Action */}
        <View style={styles.cardFooter}>
          <View style={styles.venueRow}>
            <MapPin size={11} color="#A098B5" strokeWidth={2.2} />
            <Text style={styles.venueText} numberOfLines={1}>
              {marqueeMatch.venue || 'Championship Arena'}
            </Text>
          </View>

          <View style={styles.watchLiveBtn}>
            <Tv size={11} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.watchLiveBtnText}>
              {isLive ? 'Watch Live' : 'Match Preview'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
  },
  cardContainer: {
    backgroundColor: '#1E1730', // Solid dark-purple surface, no gradients, no borders
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    backgroundColor: '#2A2045',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  sparkleIcon: {
    marginRight: 3,
  },
  motdBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ECE9FA',
    letterSpacing: 0.6,
  },
  competitionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E75FF',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    flexShrink: 1,
  },
  headerRightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  livePillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  countdownPill: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  countdownText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#F8BE38',
  },
  bellButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2A2045',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellButtonActive: {
    backgroundColor: '#352957',
  },
  matchCentre: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  teamHome: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamAway: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  crestCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#181524',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  teamNameLeft: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  teamNameRight: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'right',
    flex: 1,
  },
  centerScoreBox: {
    width: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    minWidth: 16,
    textAlign: 'center',
  },
  scoreColon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7952FC',
    marginHorizontal: 3,
  },
  clockSubtext: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#22C55E',
    marginTop: 2,
    textAlign: 'center',
  },
  vsBadge: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vsText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7952FC',
  },
  scheduledTimeText: {
    fontSize: 9.5,
    fontWeight: '500',
    color: '#A098B5',
    marginTop: 2,
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#261C3D',
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 8,
  },
  venueText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#A098B5',
  },
  watchLiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    paddingHorizontal: 11,
    borderRadius: 8,
    backgroundColor: '#7952FC',
    gap: 4,
  },
  watchLiveBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default MatchOfTheDayTicker;
