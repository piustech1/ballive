import React, { createContext, useContext, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';

const SkeletonPulseContext = createContext<Animated.Value | null>(null);

/**
 * Shared single-driver pulse container: drives an entire skeleton layout with ONE
 * Animated.loop instead of allocating 25+ concurrent Animated timers per screen.
 */
export const SkeletonPulseGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pulseAnim = useRef(new Animated.Value(0.32)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.72,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.32,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <SkeletonPulseContext.Provider value={pulseAnim}>
      {children}
    </SkeletonPulseContext.Provider>
  );
};

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
  const sharedPulse = useContext(SkeletonPulseContext);
  const localPulse = useRef(new Animated.Value(0.32)).current;

  useEffect(() => {
    if (sharedPulse) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(localPulse, {
          toValue: 0.72,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(localPulse, {
          toValue: 0.32,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [sharedPulse, localPulse]);

  const opacity = sharedPulse || localPulse;

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width: width as any,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const SkeletonCircle: React.FC<{ size?: number; style?: ViewStyle }> = ({
  size = 40,
  style,
}) => (
  <SkeletonBox
    width={size}
    height={size}
    borderRadius={size / 2}
    style={style}
  />
);

export const MatchCardSkeleton: React.FC = () => (
  <View style={styles.cardContainer}>
    <View style={styles.cardHeader}>
      <SkeletonBox width={105} height={13} borderRadius={4} />
      <SkeletonBox width={56} height={18} borderRadius={9} />
    </View>

    <View style={styles.teamsRow}>
      <View style={styles.teamCol}>
        <SkeletonCircle size={42} />
        <SkeletonBox width={72} height={13} style={{ marginTop: 8 }} />
      </View>

      <View style={styles.scoreCol}>
        <SkeletonBox width={54} height={26} borderRadius={8} />
        <SkeletonBox width={38} height={11} style={{ marginTop: 6 }} />
      </View>

      <View style={styles.teamCol}>
        <SkeletonCircle size={42} />
        <SkeletonBox width={72} height={13} style={{ marginTop: 8 }} />
      </View>
    </View>

    <View style={styles.cardFooter}>
      <SkeletonBox width={120} height={11} />
      <SkeletonBox width={76} height={24} borderRadius={12} />
    </View>
  </View>
);

export const MatchDetailsSkeleton: React.FC = () => (
  <SkeletonPulseGroup>
    <View style={styles.detailsContainer}>
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

      <View style={styles.tabsRow}>
        <SkeletonBox width={70} height={32} borderRadius={16} />
        <SkeletonBox width={70} height={32} borderRadius={16} />
        <SkeletonBox width={70} height={32} borderRadius={16} />
        <SkeletonBox width={70} height={32} borderRadius={16} />
      </View>

      <View style={styles.pitchSkeleton}>
        <SkeletonBox width="100%" height={260} borderRadius={16} />
      </View>
    </View>
  </SkeletonPulseGroup>
);

/**
 * Matches the actual Discover layout structurally:
 * 1. Explore competitions horizontal 156x120 cards
 * 2. Sports schedule wide hero card + 2 compact side-by-side cards
 * 3. Popular teams 120x136 horizontal cards
 * 4. Upcoming highlights vertical match cards
 */
export const DiscoverSkeleton: React.FC = () => (
  <SkeletonPulseGroup>
    <View style={styles.discoverSkeletonContainer}>
      {/* 1. Explore Competitions */}
      <View style={styles.sectionHeaderSkeleton}>
        <SkeletonBox width={160} height={18} borderRadius={5} />
        <SkeletonBox width={46} height={14} borderRadius={4} />
      </View>
      <View style={styles.horizontalRowSkeleton}>
        {[1, 2, 3].map(idx => (
          <View key={idx} style={styles.exploreCardSkeleton}>
            <View style={styles.exploreTopRow}>
              <SkeletonCircle size={36} />
              <SkeletonBox width={54} height={18} borderRadius={8} />
            </View>
            <View>
              <SkeletonBox width={110} height={13} borderRadius={4} />
              <SkeletonBox width={70} height={11} borderRadius={4} style={{ marginTop: 5 }} />
            </View>
          </View>
        ))}
      </View>

      {/* 2. Sports Schedule Timeline */}
      <View style={[styles.sectionHeaderSkeleton, { marginTop: 26 }]}>
        <SkeletonBox width={140} height={18} borderRadius={5} />
        <SkeletonBox width={82} height={22} borderRadius={10} />
      </View>
      <SkeletonBox width="100%" height={118} borderRadius={18} />
      <View style={styles.sideBySideSkeletonRow}>
        <View style={styles.halfCardSkeleton}>
          <SkeletonBox width={54} height={11} borderRadius={4} />
          <SkeletonBox width="85%" height={14} borderRadius={4} style={{ marginTop: 12 }} />
          <SkeletonBox width="75%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
          <SkeletonBox width={65} height={10} borderRadius={4} style={{ marginTop: 14 }} />
        </View>
        <View style={styles.halfCardSkeleton}>
          <SkeletonBox width={54} height={11} borderRadius={4} />
          <SkeletonBox width="85%" height={14} borderRadius={4} style={{ marginTop: 12 }} />
          <SkeletonBox width="75%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
          <SkeletonBox width={65} height={10} borderRadius={4} style={{ marginTop: 14 }} />
        </View>
      </View>

      {/* 3. Popular Teams */}
      <View style={[styles.sectionHeaderSkeleton, { marginTop: 26 }]}>
        <SkeletonBox width={125} height={18} borderRadius={5} />
        <SkeletonBox width={52} height={14} borderRadius={4} />
      </View>
      <View style={styles.horizontalRowSkeleton}>
        {[1, 2, 3, 4].map(idx => (
          <View key={idx} style={styles.popularTeamCardSkeleton}>
            <SkeletonCircle size={52} />
            <View style={{ width: '100%', alignItems: 'center' }}>
              <SkeletonBox width={84} height={12} borderRadius={4} />
              <SkeletonBox width={56} height={10} borderRadius={4} style={{ marginTop: 5 }} />
            </View>
          </View>
        ))}
      </View>

      {/* 4. Upcoming Highlights */}
      <View style={[styles.sectionHeaderSkeleton, { marginTop: 26 }]}>
        <SkeletonBox width={165} height={18} borderRadius={5} />
        <SkeletonBox width={52} height={14} borderRadius={4} />
      </View>
      <MatchCardSkeleton />
      <MatchCardSkeleton />
    </View>
  </SkeletonPulseGroup>
);

/**
 * Lightweight targeted skeleton for the live schedule/highlights tail when competitions & teams
 * are already visible immediately.
 */
export const ScheduleSectionSkeleton: React.FC = () => (
  <SkeletonPulseGroup>
    <View style={styles.sectionTailContainer}>
      <View style={[styles.sectionHeaderSkeleton, { marginTop: 24 }]}>
        <SkeletonBox width={140} height={18} borderRadius={5} />
        <SkeletonBox width={82} height={22} borderRadius={10} />
      </View>
      <SkeletonBox width="100%" height={112} borderRadius={18} />
    </View>
  </SkeletonPulseGroup>
);

/**
 * Tab-aware Saved screen skeleton matching match cards or saved entity rows cleanly.
 */
export const SavedSkeleton: React.FC<{ tab: 'matches' | 'teams' | 'competitions' }> = ({
  tab,
}) => (
  <SkeletonPulseGroup>
    <View style={styles.savedSkeletonContainer}>
      {tab === 'matches' ? (
        <>
          <MatchCardSkeleton />
          <MatchCardSkeleton />
          <MatchCardSkeleton />
        </>
      ) : (
        [1, 2, 3, 4].map(idx => (
          <View key={idx} style={styles.savedRowSkeleton}>
            <SkeletonCircle size={44} />
            <View style={styles.savedRowInfo}>
              <SkeletonBox width="62%" height={14} borderRadius={4} />
              <SkeletonBox width="45%" height={11} borderRadius={4} style={{ marginTop: 6 }} />
              <SkeletonBox width="35%" height={10} borderRadius={4} style={{ marginTop: 5 }} />
            </View>
            <SkeletonBox width={76} height={28} borderRadius={10} />
          </View>
        ))
      )}
    </View>
  </SkeletonPulseGroup>
);

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: 'rgba(255, 255, 255, 0.11)',
  },
  cardContainer: {
    backgroundColor: '#161522',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
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
  discoverSkeletonContainer: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
  },
  sectionTailContainer: {
    paddingHorizontal: 20,
  },
  sectionHeaderSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  horizontalRowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  exploreCardSkeleton: {
    width: 156,
    height: 120,
    backgroundColor: '#161522',
    borderRadius: 18,
    padding: 12,
    justifyContent: 'space-between',
  },
  exploreTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideBySideSkeletonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  halfCardSkeleton: {
    flex: 1,
    height: 112,
    backgroundColor: '#161522',
    borderRadius: 16,
    padding: 14,
  },
  popularTeamCardSkeleton: {
    width: 120,
    height: 136,
    backgroundColor: '#161522',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  savedSkeletonContainer: {
    gap: 4,
  },
  savedRowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161522',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  savedRowInfo: {
    flex: 1,
    marginHorizontal: 14,
  },
});
