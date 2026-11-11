import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
}

export const SkeletonBox: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 6,
  style,
}) => {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width: width as any,
          height,
          borderRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
};

export const SkeletonCircle: React.FC<{ size?: number; style?: ViewStyle }> = ({
  size = 40,
  style,
}) => {
  return (
    <SkeletonBox
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  );
};

export const MatchCardSkeleton: React.FC = () => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <SkeletonBox width={100} height={14} borderRadius={4} />
        <SkeletonBox width={60} height={18} borderRadius={10} />
      </View>

      <View style={styles.teamsRow}>
        <View style={styles.teamCol}>
          <SkeletonCircle size={44} />
          <SkeletonBox width={70} height={14} style={{ marginTop: 8 }} />
        </View>

        <View style={styles.scoreCol}>
          <SkeletonBox width={50} height={28} borderRadius={6} />
          <SkeletonBox width={40} height={12} style={{ marginTop: 6 }} />
        </View>

        <View style={styles.teamCol}>
          <SkeletonCircle size={44} />
          <SkeletonBox width={70} height={14} style={{ marginTop: 8 }} />
        </View>
      </View>

      <View style={styles.cardFooter}>
        <SkeletonBox width={120} height={12} />
        <SkeletonBox width={80} height={26} borderRadius={13} />
      </View>
    </View>
  );
};

export const MatchDetailsSkeleton: React.FC = () => {
  return (
    <View style={styles.detailsContainer}>
      {/* Header Matchup Skeleton */}
      <View style={styles.headerBlock}>
        <SkeletonBox width={140} height={16} style={{ marginBottom: 12 }} />
        <View style={styles.teamsRow}>
          <View style={styles.teamCol}>
            <SkeletonCircle size={60} />
            <SkeletonBox width={90} height={16} style={{ marginTop: 8 }} />
          </View>
          <SkeletonBox width={64} height={36} borderRadius={8} />
          <View style={styles.teamCol}>
            <SkeletonCircle size={60} />
            <SkeletonBox width={90} height={16} style={{ marginTop: 8 }} />
          </View>
        </View>
      </View>

      {/* Tabs Skeleton */}
      <View style={styles.tabsRow}>
        <SkeletonBox width={70} height={32} borderRadius={16} />
        <SkeletonBox width={70} height={32} borderRadius={16} />
        <SkeletonBox width={70} height={32} borderRadius={16} />
        <SkeletonBox width={70} height={32} borderRadius={16} />
      </View>

      {/* Content Pitch / Stats Skeleton */}
      <View style={styles.pitchSkeleton}>
        <SkeletonBox width="100%" height={260} borderRadius={16} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardContainer: {
    backgroundColor: '#161522',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  teamCol: {
    alignItems: 'center',
    flex: 1,
  },
  scoreCol: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailsContainer: {
    padding: 16,
  },
  headerBlock: {
    backgroundColor: '#161522',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pitchSkeleton: {
    marginTop: 8,
  },
});
