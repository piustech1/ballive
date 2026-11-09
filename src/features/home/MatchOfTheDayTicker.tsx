import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, BellRing, Sparkles } from 'lucide-react-native';
import Colors from '../../theme/colors';
import { useProfile } from '../../hooks/useProfile';
import { getMarqueeMatchOfTheDay } from '../../navigation/navHelpers';
import { useAppNavigation } from '../../navigation/NavigationContext';

export const MatchOfTheDayTicker: React.FC = () => {
  const { profile, toggleMatchReminder } = useProfile();
  const { navigate } = useAppNavigation();
  const marqueeMatch = getMarqueeMatchOfTheDay();

  // Dynamic countdown calculation
  const [countdownText, setCountdownText] = useState('In 2h 15m');

  useEffect(() => {
    // Target 17:30 today
    const updateCountdown = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(17, 30, 0, 0);

      // If already past 17:30 today, set to tomorrow or show Live / In 2h 15m default
      let diffMs = target.getTime() - now.getTime();
      if (diffMs < 0) {
        // Target is tomorrow 17:30
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
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.container}
      onPress={handleRowPress}
    >
      {/* Left MOTD Badge */}
      <View style={styles.badgePill}>
        <Sparkles size={11} color="#FFFFFF" strokeWidth={2.4} style={styles.badgeIcon} />
        <Text style={styles.badgeText}>MOTD</Text>
      </View>

      {/* Center Fixture Title */}
      <View style={styles.centerContent}>
        <Text style={styles.fixtureText} numberOfLines={1}>
          {marqueeMatch.homeTeam.name} vs {marqueeMatch.awayTeam.name}
          <Text style={styles.timeBullet}> • {marqueeMatch.kickoffTime.replace(' GMT', '')}</Text>
        </Text>
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
        >
          {isReminderSet ? (
            <BellRing size={14} color="#7952FC" strokeWidth={2.5} />
          ) : (
            <Bell size={14} color="#A098B5" strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    marginBottom: 8,
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
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7952FC',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  badgeIcon: {
    marginRight: 3,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  centerContent: {
    flex: 1,
    marginHorizontal: 10,
    justifyContent: 'center',
  },
  fixtureText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeBullet: {
    color: '#A098B5',
    fontWeight: '500',
    fontSize: 11.5,
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
