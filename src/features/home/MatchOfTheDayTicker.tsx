import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Bell, BellRing, Sparkles } from 'lucide-react-native';
import Colors from '../../theme/colors';
import { useProfile } from '../../hooks/useProfile';
import { getMarqueeMatchOfTheDay } from '../../navigation/navHelpers';
import { getTeamCrest } from '../../utils/teamCrestResolver';
import { useAppNavigation } from '../../navigation/NavigationContext';

export const MatchOfTheDayTicker: React.FC = () => {
  const { profile, toggleMatchReminder } = useProfile();
  const { navigate } = useAppNavigation();
  const marqueeMatch = getMarqueeMatchOfTheDay();

  // Dynamic countdown calculation
  const [countdownText, setCountdownText] = useState('In 2h 15m');

  useEffect(() => {
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
  }, []);

  const isReminderSet = profile.matchReminderIds.includes(marqueeMatch.id);
  const homeCrest = getTeamCrest(marqueeMatch.homeTeam.name || marqueeMatch.homeTeam.id);
  const awayCrest = getTeamCrest(marqueeMatch.awayTeam.name || marqueeMatch.awayTeam.id);

  const handleRowPress = () => {
    navigate({
      name: 'MatchDetails',
      params: { matchup: marqueeMatch },
    });
  };

  const handleBellPress = (e: any) => {
    e?.stopPropagation?.();
    toggleMatchReminder(marqueeMatch.id);
  };

  return (
    <View style={styles.wrapper}>
      {/* ── TOP-EDGE CENTERED RIBBON ── */}
      <View style={styles.topEdgeRibbon} pointerEvents="none">
        <Sparkles size={10} color="#FFFFFF" strokeWidth={2.5} style={styles.ribbonIcon} />
        <Text style={styles.ribbonText}>MATCH OF THE DAY</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.container}
        onPress={handleRowPress}
      >
        {/* Matchup with Home & Away Club Badges */}
        <View style={styles.centerContent}>
          <View style={styles.matchupRow}>
            <Image source={{ uri: homeCrest }} style={styles.clubCrest} />
            <Text style={styles.teamName} numberOfLines={1}>
              {marqueeMatch.homeTeam.name}
            </Text>

            <Text style={styles.vsText}>vs</Text>

            <Text style={styles.teamName} numberOfLines={1}>
              {marqueeMatch.awayTeam.name}
            </Text>
            <Image source={{ uri: awayCrest }} style={styles.clubCrest} />

            <Text style={styles.timeBullet} numberOfLines={1}>
              • {marqueeMatch.kickoffTime.replace(' GMT', '')}
            </Text>
          </View>
        </View>

        {/* Right Countdown & Bell */}
        <View style={styles.rightCluster}>
          <View style={styles.countdownPill}>
            <Text style={styles.countdownText}>{countdownText}</Text>
          </View>

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
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginTop: 10,
    marginBottom: 8,
  },
  topEdgeRibbon: {
    position: 'absolute',
    top: -9,
    alignSelf: 'center',
    backgroundColor: '#7952FC',
    paddingHorizontal: 11,
    paddingVertical: 2.5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  ribbonIcon: {
    marginRight: 4,
  },
  ribbonText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  container: {
    height: 52,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#1E1730',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  centerContent: {
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  matchupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clubCrest: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  teamName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  vsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7952FC',
    marginHorizontal: 1,
  },
  timeBullet: {
    color: '#A098B5',
    fontWeight: '500',
    fontSize: 11,
    marginLeft: 2,
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
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
