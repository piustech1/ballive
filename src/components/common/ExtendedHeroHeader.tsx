import React, { useState, useId, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ImageSourcePropType,
  LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Defs,
  ClipPath,
  Path,
  Image as SvgImage,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect,
} from 'react-native-svg';
import { ArrowLeft, LucideIcon } from 'lucide-react-native';
import Colors from '../../theme/colors';
import { useAppNavigation } from '../../navigation/NavigationContext';

export interface HeroHeaderTopAction {
  icon: LucideIcon;
  onPress: () => void;
  active?: boolean;
  activeColor?: string;
  accessibilityLabel?: string;
}

interface ExtendedHeroHeaderProps {
  /** Verified real photograph (bundled require(...) or cached { uri }) or null for dark BALLIVE surface */
  heroSource: ImageSourcePropType | null;
  /** Center emblem slot (TeamCrest or CompetitionLogo rendered flat) */
  emblemComponent: React.ReactNode;
  /** Primary identity title (e.g. FC Barcelona, Premier League) */
  identityTitle: string;
  /** Contextual subtitle directly beneath identity title (e.g. England · 20 Clubs · Football) */
  identitySubtitle?: string;
  /** Optional metadata items below subtitle */
  metaComponent?: React.ReactNode;
  /** Follow pill action CTA */
  followButtonComponent?: React.ReactNode;
}

interface PinnedTopBarProps {
  overlineTitle: string;
  subtitle?: string;
  onBack?: () => void;
  onTitlePress?: () => void;
  rightAction?: HeroHeaderTopAction;
  /** Scroll Y animated value driving compact sticky bar opacity when scrolled past hero */
  scrollY: Animated.Value;
}

const INITIAL_SCREEN_WIDTH = Dimensions.get('window').width || 390;

/**
 * Sticky transparent top bar overlay at scrollY=0 that transitions smoothly
 * to `#1E1730` as the user scrolls down through long Fixtures/Matches lists.
 */
export const HeroStickyTopBar: React.FC<PinnedTopBarProps> = ({
  overlineTitle,
  subtitle,
  onBack,
  onTitlePress,
  rightAction,
  scrollY,
}) => {
  const insets = useSafeAreaInsets();
  const { goBack } = useAppNavigation();

  const handleBack = () => {
    if (onBack) onBack();
    else goBack();
  };

  const backdropOpacity = scrollY.interpolate({
    inputRange: [24, 110],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const ActionIcon = rightAction?.icon;

  return (
    <View
      style={[styles.stickyContainer, { paddingTop: Math.max(insets.top, 10) + 4 }]}
      pointerEvents="box-none"
    >
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          styles.stickyScrolledBg,
          { opacity: backdropOpacity },
        ]}
      />

      <View style={styles.topRow}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.topIconButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={19} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={onTitlePress ? 0.75 : 1}
          disabled={!onTitlePress}
          onPress={onTitlePress}
          style={styles.titleContainer}
        >
          <Text style={styles.overlineText} numberOfLines={1}>
            {overlineTitle}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitleText} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </TouchableOpacity>

        {rightAction && ActionIcon ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.topIconButton,
              rightAction.active && styles.topIconButtonActive,
            ]}
            onPress={rightAction.onPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={rightAction.accessibilityLabel}
          >
            <ActionIcon
              size={18}
              color={
                rightAction.active
                  ? rightAction.activeColor || '#A58BFC'
                  : '#FFFFFF'
              }
              strokeWidth={2.3}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.topRightSpacer} />
        )}
      </View>
    </View>
  );
};

/**
 * Unified Full-Bleed Extended Curved Hero Header
 *
 * Uses react-native-svg ClipPath to genuinely clip both the background photograph
 * and restrained readability scrim into a single continuous silhouette extending
 * from behind the translucent status bar down to a smooth inward-curving lower arch
 * cleanly below the emblem, title, metadata, and Follow CTA.
 */
export const ExtendedHeroHeader: React.FC<ExtendedHeroHeaderProps> = ({
  heroSource,
  emblemComponent,
  identityTitle,
  identitySubtitle,
  metaComponent,
  followButtonComponent,
}) => {
  const insets = useSafeAreaInsets();
  const topBarClearance = Math.max(insets.top, 10) + 4 + 44 + 14;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: INITIAL_SCREEN_WIDTH,
    height: 318,
  });

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      if (Math.abs(width - dimensions.width) > 1 || Math.abs(height - dimensions.height) > 1) {
        setDimensions({ width, height });
      }
    }
  };

  // Geometric inward-curving lower edge contour (cubic Bezier arching gently upward at center)
  const { width, height, clipPathD } = useMemo(() => {
    const w = Math.max(dimensions.width, 280);
    const h = Math.max(dimensions.height, 260);
    // Control offset ~42dp pulls curve apex smoothly upward by ~31.5dp below Follow CTA
    const ctrlOffset = Math.min(44, Math.max(28, h * 0.13));
    const d = `M 0 0 L ${w} 0 L ${w} ${h} C ${w * 0.72} ${h - ctrlOffset} ${w * 0.28} ${h - ctrlOffset} 0 ${h} Z`;
    return { width: w, height: h, clipPathD: d };
  }, [dimensions.width, dimensions.height]);

  const clipId = `heroClip_${uid}`;
  const scrimGradId = `heroScrim_${uid}`;
  const fallbackGradId = `heroFallback_${uid}`;

  return (
    <View
      style={[styles.heroContainer, { paddingTop: topBarClearance }]}
      onLayout={handleLayout}
    >
      {/* True SVG-Clipped Full-Bleed Background Silhouette */}
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={styles.svgBackdrop}
        pointerEvents="none"
      >
        <Defs>
          <ClipPath id={clipId}>
            <Path d={clipPathD} />
          </ClipPath>

          {/* Restrained readability scrim: keeps authentic photograph vivid & recognizable */}
          <SvgLinearGradient id={scrimGradId} x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor="#120E20" stopOpacity="0.46" />
            <Stop offset="0.34" stopColor="#151026" stopOpacity="0.24" />
            <Stop offset="0.72" stopColor="#110D1D" stopOpacity="0.56" />
            <Stop offset="1" stopColor="#0E0D14" stopOpacity="0.86" />
          </SvgLinearGradient>

          {/* Subtle clean dark purple gradient when no photograph is verified */}
          <SvgLinearGradient id={fallbackGradId} x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor="#261D40" stopOpacity="1" />
            <Stop offset="0.45" stopColor="#1E1730" stopOpacity="1" />
            <Stop offset="1" stopColor="#161224" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>

        {heroSource ? (
          <>
            <SvgImage
              x={0}
              y={0}
              width={width}
              height={height}
              href={heroSource}
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${clipId})`}
            />
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={`url(#${scrimGradId})`}
              clipPath={`url(#${clipId})`}
            />
          </>
        ) : (
          <Path d={clipPathD} fill={`url(#${fallbackGradId})`} />
        )}
      </Svg>

      {/* Centered Identity Content inside same unified hero canvas */}
      <View style={styles.identityContent}>
        <View style={styles.emblemSlot}>{emblemComponent}</View>

        <Text style={styles.heroTitle} numberOfLines={2}>
          {identityTitle}
        </Text>

        {identitySubtitle ? (
          <Text style={styles.heroSubtitle} numberOfLines={1}>
            {identitySubtitle}
          </Text>
        ) : null}

        {metaComponent ? <View style={styles.metaSlot}>{metaComponent}</View> : null}

        {followButtonComponent ? <View style={styles.ctaSlot}>{followButtonComponent}</View> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stickyContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  stickyScrolledBg: {
    backgroundColor: Colors.headerPurple || '#1E1730',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  topRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(20, 16, 36, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topIconButtonActive: {
    backgroundColor: 'rgba(53, 37, 88, 0.88)',
  },
  topRightSpacer: {
    width: 36,
    height: 36,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  overlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D5CFE6',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginTop: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroContainer: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingBottom: 48,
    marginBottom: 8,
    position: 'relative',
  },
  svgBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  identityContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  emblemSlot: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.72)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  heroSubtitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#EAE5FA',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  metaSlot: {
    marginBottom: 14,
    alignItems: 'center',
  },
  ctaSlot: {
    alignItems: 'center',
  },
});

export default ExtendedHeroHeader;
