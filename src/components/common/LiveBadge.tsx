import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Colors from '../../theme/colors';

interface LiveBadgeProps {
  minute?: number | string;
  label?: string;
  style?: ViewStyle;
  variant?: 'pill' | 'solid';
}

/**
 * BALLIVE Unified Live Badge
 * Features a solid red dot with clear LIVE typography.
 * Strictly solid red circle, no gradient, no excessive glow.
 */
export const LiveBadge: React.FC<LiveBadgeProps> = ({
  minute,
  label,
  style,
  variant = 'pill',
}) => {
  const displayText = label
    ? label
    : minute !== undefined && minute !== null && minute !== 0 && minute !== '0'
    ? `${minute}' LIVE`
    : 'LIVE';

  if (variant === 'solid') {
    return (
      <View style={[styles.solidContainer, style]}>
        <View style={styles.solidDot} />
        <Text style={styles.solidText}>{displayText}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.pillContainer, style]}>
      <View style={styles.redDot} />
      <Text style={styles.pillText}>{displayText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 5,
  },
  pillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.3,
  },
  solidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  solidDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  solidText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default LiveBadge;
