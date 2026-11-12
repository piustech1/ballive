import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Bell, BellRing, Sparkles } from 'lucide-react-native';
import Colors from '../../theme/colors';
import { useProfile } from '../../hooks/useProfile';
import { getMarqueeMatchOfTheDay } from '../../navigation/navHelpers';
import { getTeamCrest } from '../../utils/teamCrestResolver';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { DiscoverMatchup } from '../../constants/discoverData';

interface MatchOfTheDayTickerProps {
  match?: DiscoverMatchup | null;
}

export const MatchOfTheDayTicker: React.FC<MatchOfTheDayTickerProps> = ({ match }) => {
  const { profile, toggleMatchReminder } = useProfile();
  const { navigate } = useAppNavigation();
  const marqueeMatch = match || getMarqueeMatchOfTheDay();

  const isLive = marqueeMatch.status === 'LIVE';

  // Dynamic countdown calculation for scheduled upcoming games
  const [countdownText, setCountdownText] = useState('Today');

  useEffect(() => {
    if (isLive) return;

    const updateCountdown = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(17, 30, 0, 0);

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
  const homeCrest = marqueeMatch.homeTeam.crestUrl || getTeamCrest(marqueeMatch.homeTeam.name || marqueeMatch.homeTeam.id);
  const awayCrest = marqueeMatch.awayTeam.crestUrl || getTeamCrest(marqueeMatch.awayTeam.name || marqueeMatch.awayTeam.id);

  const handleRowPress = () => {
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

  return (
    <View style={styles.wrapper}>
      {/* ── CARD HEADER: Badge + Competition + Live Status ── */}
      <View style={styles.cardHeader}>
        <View style={styles.badgeCluster}>
          <View style={styles.motdBadge}>
            <Sparkles size={11} color="#A78BFA" strokeWidth={2.5} style={styles.ribbonIcon} />
            <Text style={styles.motdBadgeText}>MATCH OF THE DAY</Text>
          </View>
          <Text style={styles.competitionText} numberOfLines={1}>
            {marqueeMatch.competition}
          </Text>
        </View>

        <View style={styles.statusCluster}>
          {isLive ? (
            <View style={styles.livePill}>
              <View style={styles.livePulseDot} />
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
              <BellRing size={14} color="#7952FC" strokeWidth={2.5} />
            ) : (
              <Bell size={14} color="#A098B5" strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── MAIN MATCHUP CARD ── */}
      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.cardContainer}
        onPress={handleRowPress}
      >
        <View style={styles.matchupRow}>
          {/* Home Team */}
          <View style={styles.teamCol}>
            <View style={styles.crestCircle}>
              <Image source={{ uri: homeCrest }} style={styles.clubCrest} />
            </View>
            <Text style={styles.teamName} numberOfLines={1} ellipsizeMode="tail">
              {marqueeMatch.homeTeam.name}
            </Text>
          </View>

          {/* Center Score & Clock */}
          <View style={styles.centerScoreCol}>
            {isLive || marqueeMatch.status === 'FT' ? (
              <>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreText}>{marqueeMatch.homeTeam.score ?? 0}</Text>
                  <Text style={styles.scoreColon}>:</Text>
                  <Text style={styles.scoreText}>{marqueeMatch.awayTeam.score ?? 0}</Text>
                </View>
                <View style={styles.clockPill}>
                  <Text style={styles.clockText}>
                    {isLive ? `${marqueeMatch.minute || 45}' In Play` : 'Full Time'}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.vsBadge}>
                  <Text style={styles.vsText}>VS</Text>
                </View>
                <Text style={styles.scheduledTimeText}>
                  {marqueeMatch.kickoffTime?.replace(' GMT', '') || '19:45'}
                </Text>
              </>
            )}
          </View>

          {/* Away Team */}
          <View style={styles.teamCol}>
            <View style={styles.crestCircle}>
              <Image source={{ uri: awayCrest }} style={styles.clubCrest} />
            </View>
            <Text style={styles.teamName} numberOfLines={1} ellipsizeMode="tail">
              {marqueeMatch.awayTeam.name}
            </Text>
          </View>
        </View>

        {/* ── CARD FOOTER: Venue + Watch Action ── */}
        <View style={styles.cardFooter}>
          <Text style={styles.venueText} numberOfLines={1}>
            📍 {marqueeMatch.venue || 'Championship Arena'}
          </Text>

          <View style={styles.watchLiveBtn}>
            <Text style={styles.watchLiveBtnText}>
              {isLive ? 'Watch Live Stream' : 'Match Preview'}
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
    marginTop: 18,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  badgeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  motdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(121, 82, 252, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(121, 82, 252, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    marginRight: 8,
  },
  ribbonIcon: {
    marginRight: 4,
  },
  motdBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#ECE9FA',
    letterSpacing: 0.6,
  },
  competitionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A098B5',
    flexShrink: 1,
  },
  statusCluster: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContainer: {
    backgroundColor: '#1B1429',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(121, 82, 252, 0.25)',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  matchupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  teamCol: {
    flex: 1,
    alignItems: 'center',
  },
  crestCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#261C3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  clubCrest: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  teamName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    maxWidth: 95,
  },
  centerScoreCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  scoreColon: {
    fontSize: 22,
    fontWeight: '800',
    color: '#7952FC',
    marginHorizontal: 4,
  },
  clockPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  clockText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
  },
  vsBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2045',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7952FC',
  },
  scheduledTimeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F8BE38',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  venueText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8E87A5',
    flex: 1,
    marginRight: 10,
  },
  watchLiveBtn: {
    backgroundColor: '#7952FC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9,
  },
  watchLiveBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    marginRight: 7,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 5,
  },
  livePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  countdownPill: {
    backgroundColor: '#2A2045',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 7,
  },
  countdownText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#F8BE38',
    letterSpacing: 0.2,
  },
  bellButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2A2045',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellButtonActive: {
    backgroundColor: '#382565',
  },
});

export default MatchOfTheDayTicker;
